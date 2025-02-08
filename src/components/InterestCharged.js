import React, { useState } from 'react';
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

const InterestChargeCard = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Sample data - replace with actual data
  const interestData = {
    totalInterestCharged: 'UGX 125.8M',
    dailyInterestCharged: 'UGX 450K',
    totalLoans: '38',
    averageRate: '15%',
    customersForDate: [
      { id: 1, name: 'John Doe', amount: 'UGX 45,000', rate: '15%', loanAmount: 'UGX 300,000' },
      { id: 2, name: 'Jane Smith', amount: 'UGX 37,500', rate: '15%', loanAmount: 'UGX 250,000' },
      { id: 3, name: 'Mike Johnson', amount: 'UGX 60,000', rate: '15%', loanAmount: 'UGX 400,000' }
    ]
  };

  const showDailyInterestDetails = () => {
    Swal.fire({
      title: `Interest Charges - ${format(selectedDate, 'MMMM d, yyyy')}`,
      html: `
        <div class="text-left">
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-gray-700 p-3 rounded-lg">
              <div class="text-xl font-bold text-green-400">
                ${interestData.dailyInterestCharged}
              </div>
              <div class="text-xs text-gray-400">Total Interest</div>
            </div>
            <div class="bg-gray-700 p-3 rounded-lg">
              <div class="text-xl font-bold text-blue-400">
                ${interestData.totalLoans}
              </div>
              <div class="text-xs text-gray-400">Loans</div>
            </div>
            <div class="bg-gray-700 p-3 rounded-lg">
              <div class="text-xl font-bold text-purple-400">
                ${interestData.averageRate}
              </div>
              <div class="text-xs text-gray-400">Avg Rate</div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead class="bg-gray-700">
                <tr>
                  <th class="py-2 px-3 text-left text-xs font-medium text-gray-300 uppercase">Customer</th>
                  <th class="py-2 px-3 text-left text-xs font-medium text-gray-300 uppercase">Interest</th>
                  <th class="py-2 px-3 text-left text-xs font-medium text-gray-300 uppercase">Rate</th>
                  <th class="py-2 px-3 text-left text-xs font-medium text-gray-300 uppercase">Loan Amount</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                ${interestData.customersForDate.map(customer => `
                  <tr class="hover:bg-gray-700 transition-colors">
                    <td class="py-2 px-3 text-sm">${customer.name}</td>
                    <td class="py-2 px-3 text-sm text-green-400">${customer.amount}</td>
                    <td class="py-2 px-3 text-sm text-blue-400">${customer.rate}</td>
                    <td class="py-2 px-3 text-sm text-gray-400">${customer.loanAmount}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
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
      width: '38rem'
    });
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
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1.5,
              mb: 2,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.05)',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: '#A8B6BC' }}>
                Overall Interest Charged
              </Typography>
              <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600, mt: 0.5 }}>
                {interestData.totalInterestCharged}
              </Typography>
            </Box>
            <AccountBalanceIcon sx={{ color: '#4caf50', fontSize: 40 }} />
          </Box>
         

          <Box 
            onClick={showDailyInterestDetails}
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1.5,
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
              <Typography variant="caption" sx={{ color: '#A8B6BC' }}>
                Total Interest ({format(selectedDate, 'MMM d')})
              </Typography>
              <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600, mt: 0.5 }}>
                {interestData.dailyInterestCharged}
              </Typography>
              <Typography variant="caption" sx={{ color: '#A8B6BC', display: 'block' }}>
                {interestData.totalLoans} loans @ {interestData.averageRate}
              </Typography>
            </Box>
            <Box sx={{ 
              bgcolor: 'rgba(76,175,80,0.1)', 
              p: 1, 
              borderRadius: 1,
              textAlign: 'center'
            }}>
              <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 600 }}>
                {interestData.averageRate}
              </Typography>
              <Typography variant="caption" sx={{ color: '#A8B6BC' }}>
                Rate
              </Typography>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Card>
  );
};

export default InterestChargeCard;