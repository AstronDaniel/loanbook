import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  IconButton, 
  Typography, 
  Collapse,
  Grid
} from '@mui/material';
import { 
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Close as CloseIcon,
  AccountBalance as AccountBalanceIcon,
  Percent as PercentIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../firebase';

const InterestChargeCard = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [interestData, setInterestData] = useState({
    totalInterestCharged: 'UGX 0',
    dailyInterestCharged: 'UGX 0',
    totalLoans: '0',
    averageRate: '0%',
    customersForDate: []
  });
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchInterestData = async () => {
      setLoading(true); // Set loading to true
      try {
        const db = getFirestore(app);
        const debtorsSnapshot = await getDocs(collection(db, 'debtors'));
        const loansSnapshot = await getDocs(collection(db, 'loans'));
        const debtorsData = debtorsSnapshot.docs.map(doc => doc.data());
        const loansData = loansSnapshot.docs.map(doc => doc.data());

        const overallInterestCharged = debtorsData.reduce((total, debtor) => {
          return total + (debtor.monthlyRecords || []).reduce((sum, record) => sum + (record.interestCharge || 0), 0);
        }, 0);

        const selectedMonth = format(selectedDate, 'yyyy-MM');

        // Get debtors with interest charged > 0
        const filteredDebtors = debtorsData.filter(debtor => {
          const monthRecord = debtor.monthlyRecords?.find(record => {
            const paddedMonth = record.month.length === 6 ? record.month.replace(/-(\d)$/, '-0$1') : record.month;
            return paddedMonth === selectedMonth && record.interestCharge > 0;
          });
          return monthRecord !== undefined;
        });

        // Calculate daily interest charged from the interestCharge values
        const dailyInterestCharged = filteredDebtors.reduce((total, debtor) => {
          const monthRecord = debtor.monthlyRecords.find(record => {
            const paddedMonth = record.month.length === 6 ? record.month.replace(/-(\d)$/, '-0$1') : record.month;
            return paddedMonth === selectedMonth;
          });
          return total + (monthRecord?.interestCharge || 0);
        }, 0);

        const totalLoans = filteredDebtors.length;
        const averageRate = totalLoans > 0 ? (dailyInterestCharged / totalLoans).toFixed(2) + '%' : '0%';

        // Map customer details with the interestCharge from monthly records
        const customersForDate = filteredDebtors.map(debtor => {
          const monthRecord = debtor.monthlyRecords.find(record => {
            const paddedMonth = record.month.length === 6 ? record.month.replace(/-(\d)$/, '-0$1') : record.month;
            return paddedMonth === selectedMonth;
          });
          if (!monthRecord) return null; // Add check to ensure monthRecord is defined

          const loan = loansData.find(loan => loan.customerName === debtor.customerName);
          const loanAmount = loan ? `UGX ${loan.amount.toLocaleString()}` : 'Unknown';

          return {
            id: debtor.loanId,
            name: debtor.customerName,
            amount: `UGX ${monthRecord.interestCharge.toLocaleString()}`,
            rate: loan ? loan.interestRate + '%' : 'Unknown',
            loanAmount: loanAmount
          };
        }).filter(customer => customer !== null) // Filter out null values
          .sort((a, b) => {
            const nameA = a.name.match(/(\D+)(\d+)/);
            const nameB = b.name.match(/(\D+)(\d+)/);
            if (nameA && nameB) {
              const [_, textA, numA] = nameA;
              const [__, textB, numB] = nameB;
              return textA.localeCompare(textB) || parseInt(numA) - parseInt(numB);
            }
            return a.name.localeCompare(b.name);
          }); // Sort by customer name with numbers

        setInterestData({
          totalInterestCharged: `UGX ${overallInterestCharged.toLocaleString()}`,
          dailyInterestCharged: `UGX ${dailyInterestCharged.toLocaleString()}`,
          totalLoans: totalLoans.toString(),
          averageRate: averageRate,
          customersForDate
        });
      } catch (err) {
        console.error('Error fetching interest data:', err);
      } finally {
        setLoading(false); // Set loading to false
      }
    };

    fetchInterestData();
  }, [selectedDate]);

  const showDailyInterestDetails = () => {
    Swal.fire({
      title: `Interest Charges - ${format(selectedDate, 'MMMM d, yyyy')}`,
      html: `
        <div class="text-left">
          <div class="flex justify-between items-center mb-6 bg-gray-700 p-4 rounded-lg">
            <div>
              <div class="text-2xl font-bold text-green-400">
                ${interestData.dailyInterestCharged}
              </div>
              <div class="text-sm text-gray-400">Total Interest</div>
            </div>
            <div>
              <div class="text-xl font-bold text-blue-400">
                ${interestData.totalLoans}
              </div>
              <div class="text-sm text-gray-400">Loans</div>
            </div>
            <div>
              <div class="text-xl font-bold text-purple-400">
                ${interestData.averageRate}
              </div>
              <div class="text-sm text-gray-400">Avg Rate</div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full bg-gray-800 rounded-lg overflow-hidden text-sm"> <!-- Reduce font size -->
              <thead class="bg-gray-700">
                <tr>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Interest</th>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rate</th>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Loan Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                ${interestData.customersForDate.map(customer => `
                  <tr class="hover:bg-gray-700 transition-colors">
                    <td class="py-3 px-4 whitespace-nowrap">${customer.name}</td>
                    <td class="py-3 px-4 whitespace-nowrap text-green-400">${customer.amount}</td>
                    <td class="py-3 px-4 whitespace-nowrap text-blue-400">${customer.rate}</td>
                    <td class="py-3 px-4 whitespace-nowrap text-gray-400">${customer.loanAmount}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="mt-6 flex justify-end">
            <button 
              class="print-button bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              onclick="document.querySelector('.swal2-close').click(); setTimeout(() => window.printReport(), 100);"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Print Report
            </button>
          </div>
        </div>
      `,
      customClass: {
        container: 'swal-wide',
        popup: 'bg-gray-800 text-white',
        title: 'text-lg font-bold mb-4',
        htmlContainer: 'text-gray-300'
      },
      background: '#2A2F34',
      color: '#ffffff',
      showCloseButton: true,
      showConfirmButton: false,
      width: '38rem',
      didOpen: () => {
        window.printReport = handlePrint;
      }
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const formattedDate = format(selectedDate, 'MMMM d, yyyy');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Interest Charges Report - ${formattedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #2A2F34; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header { margin-bottom: 20px; border-bottom: 2px solid #2A2F34; padding-bottom: 10px; }
            .total { margin-top: 20px; font-weight: bold; background: #f5f5f5; padding: 15px; }
            .subtitle { color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Interest Charges Report</h2>
            <div class="subtitle">Date: ${formattedDate}</div>
            <div class="subtitle">Total Interest: ${interestData.dailyInterestCharged}</div>
            <div class="subtitle">Number of Loans: ${interestData.totalLoans}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Interest</th>
                <th>Rate</th>
                <th>Loan Amount</th>
              </tr>
            </thead>
            <tbody>
              ${interestData.customersForDate.map(customer => `
                <tr>
                  <td>${customer.name}</td>
                  <td>${customer.amount}</td>
                  <td>${customer.rate}</td>
                  <td>${customer.loanAmount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Total Interest Charged: ${interestData.dailyInterestCharged}</p>
            <p>Average Rate: ${interestData.averageRate}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const renderContent = () => {
    if (loading) return (
      <div className="bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-600 rounded w-1/2 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Box sx={{ 
            bgcolor: 'rgba(76,175,80,0.1)',
            borderRadius: 2,
            p: 1.5, // Reduce padding
            mb: 1.5 // Reduce margin
          }}>
            <Typography variant="body2" sx={{ color: '#A8B6BC', mb: 0.5 }}> 
                {/* // Reduce margin */}
              Overall Interest Charged
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#4caf50', fontWeight: 600 }}> 
                {/* // Use smaller typography variant */}
              {interestData.totalInterestCharged}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box 
            onClick={showDailyInterestDetails}
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1.5, // Reduce padding
              cursor: 'pointer',
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(76,175,80,0.1)',
                transform: 'translateX(4px)',
              }
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ color: '#A8B6BC', mb: 0.5 }}> 
                {/* // Reduce margin*/}
                Total Interest for 
              </Typography>
              <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 500 }}>
                {format(selectedDate, 'MMM d, yyyy')}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2" sx={{ color: '#4caf50', fontWeight: 600 }}> 
                {/* // Use smaller typography variant */}
                {interestData.dailyInterestCharged}
              </Typography>
              <Typography variant="caption" sx={{ color: '#A8B6BC' }}>
                {interestData.totalLoans} loans @ {interestData.averageRate}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  };

  return (
    <Card sx={{ 
      bgcolor: '#2A2F34', 
      color: 'white',
      maxWidth: '300px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      borderRadius: 2
    }}>
      <Box sx={{ 
        p: 1.5, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(180deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0) 100%)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PercentIcon sx={{ color: '#4caf50' }} />
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
            Interest Charges
          </Typography>
        </Box>
        <Box>
          <IconButton 
            size="small" 
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ 
              color: '#6c757d',
              '&:hover': { color: '#fff' }
            }}
          >
            {isExpanded ? <ArrowDownIcon /> : <ArrowUpIcon />}
          </IconButton>
          <IconButton 
            size="small" 
            sx={{ 
              color: '#6c757d',
              '&:hover': { color: '#fff' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ p: 1.5 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              sx={{
                width: '100%',
                mb: 2,
                '& .MuiInputBase-root': {
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  height: '40px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(76,175,80,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4caf50',
                  },
                },
                '& .MuiIconButton-root': {
                  color: '#4caf50',
                },
              }}
            />
          </LocalizationProvider>
          {renderContent()}
        </Box>
      </Collapse>
    </Card>
  );
};

export default InterestChargeCard;