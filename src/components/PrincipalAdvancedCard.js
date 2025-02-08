import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  IconButton, 
  Typography, 
  Collapse,
  Grid,
  Button,
  Divider
} from '@mui/material';
import { 
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
  Print as PrintIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

const PrincipalAdvancedCard = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Sample data - replace with actual data
  const principalData = {
    overallPrincipalAdvanced: 'UGX 789.5M',
    dailyPrincipalAdvanced: 'UGX 2.5M',
    totalLoans: '45',
    averageLoanSize: 'UGX 55.5K',
    customersForDate: [
      { id: 1, name: 'John Doe', amount: 'UGX 250,000', time: '09:30 AM', loanType: 'Business' },
      { id: 2, name: 'Jane Smith', amount: 'UGX 180,000', time: '10:15 AM', loanType: 'Personal' },
      { id: 3, name: 'Mike Johnson', amount: 'UGX 420,000', time: '11:45 AM', loanType: 'Business' },
      { id: 4, name: 'Sarah Williams', amount: 'UGX 150,000', time: '02:30 PM', loanType: 'Personal' },
      { id: 5, name: 'Robert Brown', amount: 'UGX 340,000', time: '03:45 PM', loanType: 'Business' }
    ]
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const formattedDate = format(selectedDate, 'MMMM d, yyyy');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Principal Advanced Report - ${formattedDate}</title>
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
            <h2>Principal Advanced Report</h2>
            <div class="subtitle">Date: ${formattedDate}</div>
            <div class="subtitle">Total Advanced: ${principalData.dailyPrincipalAdvanced}</div>
            <div class="subtitle">Number of Loans: ${principalData.totalLoans}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Amount</th>
                <th>Time</th>
                <th>Loan Type</th>
              </tr>
            </thead>
            <tbody>
              ${principalData.customersForDate.map(customer => `
                <tr>
                  <td>${customer.name}</td>
                  <td>${customer.amount}</td>
                  <td>${customer.time}</td>
                  <td>${customer.loanType}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Total Principal Advanced: ${principalData.dailyPrincipalAdvanced}</p>
            <p>Average Loan Size: ${principalData.averageLoanSize}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const showDailyPrincipalDetails = () => {
    Swal.fire({
      title: `Principal Advanced - ${format(selectedDate, 'MMMM d, yyyy')}`,
      html: `
        <div class="text-left">
          <div class="flex justify-between items-center mb-6 bg-gray-700 p-4 rounded-lg">
            <div>
              <div class="text-2xl font-bold text-blue-400">
                ${principalData.dailyPrincipalAdvanced}
              </div>
              <div class="text-sm text-gray-400">Total Advanced</div>
            </div>
            <div>
              <div class="text-xl font-bold text-green-400">
                ${principalData.totalLoans}
              </div>
              <div class="text-sm text-gray-400">Loans</div>
            </div>
            <div>
              <div class="text-xl font-bold text-purple-400">
                ${principalData.averageLoanSize}
              </div>
              <div class="text-sm text-gray-400">Average</div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead class="bg-gray-700">
                <tr>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                  <th class="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                ${principalData.customersForDate.map(customer => `
                  <tr class="hover:bg-gray-700 transition-colors">
                    <td class="py-3 px-4 whitespace-nowrap">${customer.name}</td>
                    <td class="py-3 px-4 whitespace-nowrap text-blue-400">${customer.amount}</td>
                    <td class="py-3 px-4 whitespace-nowrap text-gray-400">${customer.time}</td>
                    <td class="py-3 px-4 whitespace-nowrap">
                      <span class="px-2 py-1 text-xs rounded-full ${
                        customer.loanType === 'Business' ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'
                      }">
                        ${customer.loanType}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="mt-6 flex justify-end">
            <button 
              class="print-button bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
        title: 'text-xl font-bold mb-4',
        htmlContainer: 'text-gray-300'
      },
      background: '#2A2F34',
      color: '#ffffff',
      showCloseButton: true,
      showConfirmButton: false,
      width: '42rem',
      didOpen: () => {
        window.printReport = handlePrint;
      }
    });
  };

  return (
    <Card sx={{ 
      bgcolor: '#2A2F34', 
      color: 'white',
      maxWidth: '250px', // Reduce the width
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      borderRadius: 2
    }}>
      <Box sx={{ 
        p: 1.5, // Reduce padding
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(180deg, rgba(33,150,243,0.1) 0%, rgba(33,150,243,0) 100%)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}> 
            {/* // Reduce gap */}
          <AccountBalanceIcon sx={{ color: '#2196f3', fontSize: 20 }} />
           {/* // Reduce icon size */}
          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600 }}> 
            {/* // Use smaller typography variant */}
            Principal Advanced
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
            {isExpanded ? <ArrowDownIcon fontSize="small" /> : <ArrowUpIcon fontSize="small" />} 
            {/* // Reduce icon size */}
          </IconButton>
          <IconButton 
            size="small" 
            sx={{ 
              color: '#6c757d',
              '&:hover': { color: '#fff' }
            }}
          >
            <CloseIcon fontSize="small" /> 
            {/* // Reduce icon size */}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ p: 1.5 }}> 
            {/* // Reduce padding */}
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
                  height: '35px', // Reduce height
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(33,150,243,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2196f3',
                  },
                },
                '& .MuiIconButton-root': {
                  color: '#2196f3',
                },
              }}
            />
          </LocalizationProvider>

          <Grid container spacing={1}> 
            {/* // Reduce spacing */}
            <Grid item xs={12}>
              <Box sx={{ 
                bgcolor: 'rgba(33,150,243,0.1)',
                borderRadius: 2,
                p: 1.5, // Reduce padding
                mb: 1.5 // Reduce margin
              }}>
                <Typography variant="body2" sx={{ color: '#A8B6BC', mb: 0.5 }}> 
                    {/* // Reduce margin */}
                  Overall Principal Advanced
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#2196f3', fontWeight: 600 }}> 
                    {/* // Use smaller typography variant */}
                  {principalData.overallPrincipalAdvanced}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box 
                onClick={showDailyPrincipalDetails}
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
                    bgcolor: 'rgba(33,150,243,0.1)',
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ color: '#A8B6BC', mb: 0.5 }}> 
                    {/* // Reduce margin*/}
                    Principal Advanced for 
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2196f3', fontWeight: 500 }}>
                    {format(selectedDate, 'MMM d, yyyy')}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" sx={{ color: '#2196f3', fontWeight: 600 }}> 
                    {/* // Use smaller typography variant */}
                    {principalData.dailyPrincipalAdvanced}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#A8B6BC' }}>
                    {principalData.totalLoans} loans
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Card>
  );
};

export default PrincipalAdvancedCard;