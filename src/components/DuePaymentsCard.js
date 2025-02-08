import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  IconButton, 
  Typography, 
  Collapse
} from '@mui/material';
import { 
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  AccessTime as ClockIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';

const DuePaymentsCard = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Sample data - replace with actual data
  const duePaymentsData = {
    totalDueToday: 'UGX 2.45M',
    dueAccounts: '28',
    overdueTotalAmount: 'UGX 890K',
    overdueAccounts: '12',
    customers: [
      { 
        id: 1, 
        name: 'John Doe', 
        amount: 'UGX 150,000', 
        dueDate: '2025-02-08',
        status: 'due',
        phone: '+256 777 123456',
        loanId: 'L2025001'
      },
      { 
        id: 2, 
        name: 'Jane Smith', 
        amount: 'UGX 200,000', 
        dueDate: '2025-02-07',
        status: 'overdue',
        phone: '+256 777 234567',
        loanId: 'L2025002',
        daysOverdue: 1
      }
    ]
  };

  const showDuePaymentsDetails = () => {
    Swal.fire({
      title: 'Due Payments Overview',
      html: `
        <div class="text-left">
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-700 p-4 rounded-lg">
              <div class="text-sm text-gray-400 mb-1">Due Today</div>
              <div class="text-xl font-bold text-yellow-400">
                ${duePaymentsData.totalDueToday}
              </div>
              <div class="text-sm text-gray-400">
                ${duePaymentsData.dueAccounts} accounts
              </div>
            </div>
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
            <table class="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead class="bg-gray-700">
                <tr>
                  <th class="py-2 px-3 text-left text-xs font-medium text-gray-300 uppercase">Customer</th>
                  <th class="py-2 px-3 text-left text-xs font-medium text-gray-300 uppercase">Amount</th>
                  <th class="py-2 px-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                  <th class="py-2 px-3 text-left text-xs font-medium text-gray-300 uppercase">Contact</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                ${duePaymentsData.customers.map(customer => `
                  <tr class="hover:bg-gray-700 transition-colors">
                    <td class="py-2 px-3">
                      <div class="text-sm">${customer.name}</div>
                      <div class="text-xs text-gray-400">${customer.loanId}</div>
                    </td>
                    <td class="py-2 px-3">
                      <div class="text-sm ${customer.status === 'overdue' ? 'text-red-400' : 'text-yellow-400'}">
                        ${customer.amount}
                      </div>
                      <div class="text-xs text-gray-400">Due: ${new Date(customer.dueDate).toLocaleDateString()}</div>
                    </td>
                    <td class="py-2 px-3">
                      <span class="px-2 py-1 text-xs rounded-full ${
                        customer.status === 'overdue' 
                          ? 'bg-red-900 text-red-300' 
                          : 'bg-yellow-900 text-yellow-300'
                      }">
                        ${customer.status === 'overdue' ? `${customer.daysOverdue} days overdue` : 'Due today'}
                      </span>
                    </td>
                    <td class="py-2 px-3">
                      <div class="text-sm">${customer.phone}</div>
                    </td>
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
      width: '42rem'
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
        <Box 
          sx={{ 
            p: 1.5,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(255,152,0,0.05)'
            }
          }}
          onClick={showDuePaymentsDetails}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            mb: 2,
            p: 1.5,
            bgcolor: 'rgba(255,152,0,0.1)',
            borderRadius: 1
          }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#A8B6BC' }}>
                Due Today
              </Typography>
              <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 600 }}>
                {duePaymentsData.totalDueToday}
              </Typography>
              <Typography variant="caption" sx={{ color: '#A8B6BC' }}>
                {duePaymentsData.dueAccounts} accounts
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: '#A8B6BC' }}>
                Overdue
              </Typography>
              <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 600 }}>
                {duePaymentsData.overdueTotalAmount}
              </Typography>
              <Typography variant="caption" sx={{ color: '#A8B6BC' }}>
                {duePaymentsData.overdueAccounts} accounts
              </Typography>
            </Box>
          </Box>

          {duePaymentsData.overdueAccounts > 0 && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: '#f44336',
              bgcolor: 'rgba(244,67,54,0.1)',
              borderRadius: 1,
              p: 1
            }}>
              <WarningIcon fontSize="small" />
              <Typography variant="caption">
                {duePaymentsData.overdueAccounts} accounts require immediate attention
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

export default DuePaymentsCard;