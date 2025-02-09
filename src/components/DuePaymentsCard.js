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
  Warning as WarningIcon,
  AccessTime as ClockIcon,
  Print as PrintIcon // Import PrintIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../firebase';

const DuePaymentsCard = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [duePaymentsData, setDuePaymentsData] = useState({
    totalDueToday: 'UGX 0',
    dueAccounts: '0',
    overdueTotalAmount: 'UGX 0',
    overdueAccounts: '0',
    customers: []
  });
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchDuePaymentsData = async () => {
      setLoading(true); // Set loading to true
      try {
        const db = getFirestore(app);
        const debtorsSnapshot = await getDocs(collection(db, 'debtors'));
        const debtorsData = debtorsSnapshot.docs.map(doc => doc.data());

        console.log('Debtors Data:', debtorsData); // Debugging log

        const today = new Date().toISOString().split('T')[0];

        const overdue = debtorsData.filter(debtor => debtor.status === 'overdue');

        console.log('Overdue Debtors:', overdue); // Debugging log

        const overdueTotalAmount = overdue.reduce((total, debtor) => total + debtor.currentOpeningPrincipal, 0);

        setDuePaymentsData({
          totalDueToday: `UGX 0`,
          dueAccounts: '0',
          overdueTotalAmount: `UGX ${overdueTotalAmount.toLocaleString()}`,
          overdueAccounts: overdue.length.toString(),
          customers: overdue.map(debtor => {
            const lastUpdated = typeof debtor.lastUpdated === 'string' ? debtor.lastUpdated.split('T')[0] : '';
            return {
              id: debtor.loanId,
              name: debtor.customerName,
              amount: `UGX ${debtor.currentOpeningPrincipal.toLocaleString()}`,
              outstandingPrincipal: `UGX ${debtor.currentOpeningPrincipal.toLocaleString()}`,
              outstandingInterest: `UGX ${debtor.currentOpeningInterest.toLocaleString()}`,
              dueDate: lastUpdated,
              status: 'overdue',
              phone: debtor.phone,
              loanId: debtor.loanId,
              daysOverdue: Math.floor((new Date(today) - new Date(lastUpdated)) / (1000 * 60 * 60 * 24))
            };
          })
        });

        console.log('Due Payments Data:', duePaymentsData); // Debugging log
      } catch (err) {
        console.error('Error fetching due payments data:', err);
      } finally {
        setLoading(false); // Set loading to false
      }
    };

    fetchDuePaymentsData();
  }, []);

  const showDuePaymentsDetails = () => {
    Swal.fire({
      title: 'Overdue Payments Overview',
      html: `
        <div id="due-payments-details" class="text-left">
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-700 p-4 rounded-lg">
              <div class="text-sm text-gray-400 mb-1">Overdue</div>
              <div class="text-xl font-bold text-red-400">
                ${duePaymentsData.overdueTotalAmount}
              </div>
              <div class="text-sm text-gray-400">
                ${duePaymentsData.overdueAccounts} accounts
              </div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full bg-gray-800 rounded-lg overflow-hidden text-xs"> <!-- Reduce font size -->
              <thead class="bg-gray-700">
                <tr>
                  <th class="py-2 px-3 text-left text-xs font-medium text-gray-300 uppercase">Customer</th>
                  <!-- Removed Amount column -->
                  <th class="py-2 px-3 text-left text-xs font-medium text-gray-300 uppercase">Outstanding Principal</th>
                  <th class="py-2 px-3 text-left text-xs font-medium text-gray-300 uppercase">Outstanding Interest</th>
                  <th class="py-2 px-3 text-left text-xs font-medium text-gray-300 uppercase">Due Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                ${duePaymentsData.customers.sort((a, b) => {
                  const nameA = a.name.match(/(\D+)(\d+)/);
                  const nameB = b.name.match(/(\D+)(\d+)/);
                  if (nameA && nameB) {
                    const [_, textA, numA] = nameA;
                    const [__, textB, numB] = nameB;
                    return textA.localeCompare(textB) || parseInt(numA) - parseInt(numB);
                  }
                  return a.name.localeCompare(b.name);
                }).map(customer => `
                  <tr class="hover:bg-gray-700 transition-colors">
                    <td class="py-2 px-3">
                      <div class="text-sm">${customer.name}</div>
                    </td>
                    <!-- Removed Amount column -->
                    <td class="py-2 px-3 text-red-400">
                      ${customer.outstandingPrincipal}
                    </td>
                    <td class="py-2 px-3 text-red-400">
                      ${customer.outstandingInterest}
                    </td>
                    <td class="py-2 px-3">
                      <div class="text-sm">${new Date(customer.dueDate).toLocaleDateString()}</div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="mt-6 flex justify-end">
            <button 
              class="print-button bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
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
      width: '50rem', // Increase width
      didOpen: () => {
        window.printReport = handlePrint;
      }
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const formattedDate = new Date().toLocaleDateString();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Overdue Payments Report - ${formattedDate}</title>
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
            <h2>Overdue Payments Report</h2>
            <div class="subtitle">Date: ${formattedDate}</div>
            <div class="subtitle">Total Overdue Amount: ${duePaymentsData.overdueTotalAmount}</div>
            <div class="subtitle">Number of Overdue Accounts: ${duePaymentsData.overdueAccounts}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Outstanding Principal</th>
                <th>Outstanding Interest</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${duePaymentsData.customers.sort((a, b) => {
                const nameA = a.name.match(/(\D+)(\d+)/);
                const nameB = b.name.match(/(\D+)(\d+)/);
                if (nameA && nameB) {
                  const [_, textA, numA] = nameA;
                  const [__, textB, numB] = nameB;
                  return textA.localeCompare(textB) || parseInt(numA) - parseInt(numB);
                }
                return a.name.localeCompare(b.name);
              }).map(customer => `
                <tr>
                  <td>${customer.name}</td>
                  <td>${customer.outstandingPrincipal}</td>
                  <td>${customer.outstandingInterest}</td>
                  <td>${new Date(customer.dueDate).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Total Overdue Amount: ${duePaymentsData.overdueTotalAmount}</p>
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
            bgcolor: 'rgba(255,152,0,0.1)',
            borderRadius: 2,
            p: 1.5, // Reduce padding
            mb: 1.5 // Reduce margin
          }}>
            <Typography variant="body2" sx={{ color: '#A8B6BC', mb: 0.5 }}> 
                {/* // Reduce margin */}
              Total Due Today
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#ff9800', fontWeight: 600 }}> 
                {/* // Use smaller typography variant */}
              {duePaymentsData.totalDueToday}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box 
            onClick={showDuePaymentsDetails}
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
                bgcolor: 'rgba(255,152,0,0.1)',
                transform: 'translateX(4px)',
              }
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ color: '#A8B6BC', mb: 0.5 }}> 
                {/* // Reduce margin*/}
                Overdue Amount
              </Typography>
              <Typography variant="body2" sx={{ color: '#f44336', fontWeight: 500 }}>
                {duePaymentsData.overdueTotalAmount}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2" sx={{ color: '#f44336', fontWeight: 600 }}> 
                {/* // Use smaller typography variant */}
                {duePaymentsData.overdueAccounts} accounts
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
        background: 'linear-gradient(180deg, rgba(255,152,0,0.1) 0%, rgba(255,152,0,0) 100%)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ClockIcon sx={{ color: '#ff9800' }} />
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
            Due Payments
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
          {renderContent()}
        </Box>
      </Collapse>
    </Card>
  );
};

export default DuePaymentsCard;