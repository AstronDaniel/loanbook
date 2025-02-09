import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  IconButton, 
  Typography, 
  Collapse,
} from '@mui/material';
import { 
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../firebase';
import { formatDistanceToNow, parseISO } from 'date-fns';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const RecentTransaction = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const db = getFirestore(app);
        const logsSnapshot = await getDocs(collection(db, 'transactionLogs'));
        const logsData = logsSnapshot.docs.map(doc => doc.data());
        logsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setTransactions(logsData);
      } catch (err) {
        console.error('Error fetching transaction logs:', err);
      }
    };

    fetchTransactions();
  }, []);

  const getTransactionDescription = (transaction) => {
    switch (transaction.type) {
      case 'add':
        return `Added a new entry: ${transaction.content.description}`;
      case 'delete':
        return `Deleted an entry: ${transaction.content.description}`;
      case 'update':
        return `Updated an entry: ${transaction.content.description}`;
      default:
        return `Performed a transaction: ${transaction.content.description}`;
    }
  };

  const handleTransactionClick = (transaction) => {
    const highlightStyle = 'color: #70B6F6; font-weight: bold;';
    const normalStyle = 'color: #A8B6BC;';

    MySwal.fire({
      title: `<div class="text-xl font-bold text-white">Transaction Details</div>`,
      html: `
        <div class="bg-gray-800 rounded-lg p-4 text-sm">
          <!-- Main Info -->
          <div class="mb-3 pb-3 border-b border-gray-700">
            <div class="flex justify-between mb-2">
              <span class="text-gray-400">Reference:</span>
              <span class="text-white font-medium">${transaction.content.reference || 'N/A'}</span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="text-gray-400">User:</span>
              <span class="text-white">${transaction.user}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Status:</span>
              <span class="text-green-400">${transaction.content.status || 'N/A'}</span>
            </div>
          </div>

          <!-- Transaction Details -->
          <div class="space-y-2">
            ${[
              { label: 'Bank Interest', value: transaction.content.bankInterest },
              { label: 'Service Charge', value: transaction.content.serviceCharge },
              { label: 'Withdraw Charges', value: transaction.content.withdrawCharges },
              { label: 'Transport', value: transaction.content.transport },
              { label: 'Transfer Fee', value: transaction.content.transferFee },
              { label: 'Annual Card Fee', value: transaction.content.annualDebitCardFee },
              { label: 'Withholding Tax', value: transaction.content.withholdingTax },
              { label: 'Airtime & Data', value: transaction.content.airtimeAndData }
            ].map(({ label, value }) => value !== undefined ? `
              <div class="flex justify-between">
                <span class="text-gray-400">${label}:</span>
                <span class="text-blue-400">UGX ${value.toLocaleString()}</span>
              </div>
            ` : '').join('')}
          </div>

          <!-- Description -->
          <div class="mt-3 pt-3 border-t border-gray-700">
            <span class="text-gray-400">Description:</span>
            <p class="text-white mt-1">${transaction.content.description || 'N/A'}</p>
          </div>

          <!-- Notes if any -->
          ${transaction.content.notes ? `
            <div class="mt-3 pt-3 border-t border-gray-700">
              <span class="text-gray-400">Notes:</span>
              <p class="text-white mt-1">${transaction.content.notes}</p>
            </div>
          ` : ''}

          <!-- Transaction Type and Timestamp -->
          <div class="mt-3 pt-3 border-t border-gray-700">
            <span class="text-gray-400">Transaction Type:</span>
            <p class="text-white mt-1">${transaction.type}</p>
            <span class="text-gray-400">Timestamp:</span>
            <p class="text-white mt-1">${transaction.timestamp}</p>
          </div>
        </div>
      `,
      background: '#1f2937',
      showCloseButton: true,
      showConfirmButton: false,
      width: '400px',
      customClass: {
        popup: 'rounded-lg',
        closeButton: 'text-gray-400 hover:text-white',
        htmlContainer: 'p-0'
      }
    });
  };

  return (
    <Card sx={{ 
      bgcolor: '#2A2F34', 
      color: 'white',
      maxWidth: '100%',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      borderRadius: '8px'
    }} className="font-inter">
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 500 }}>
            Recent Transactions
          </Typography>
          <Typography variant="body2" sx={{ color: '#6c757d', ml: 1 }}>
            ({transactions.length} transactions)
          </Typography>
        </Box>
        <Box> 
          <IconButton 
            size="small" 
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ color: '#6c757d' }}
          >
            {isExpanded ? <ArrowDownIcon /> : <ArrowUpIcon />}
          </IconButton>
          <IconButton size="small" sx={{ color: '#6c757d' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ 
          maxHeight: '500px', 
          overflow: 'auto', 
          p: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#2A2F34',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#6c757d',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
          fontFamily: 'Poppins !important',
        }}>
          {transactions.map((transaction, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.03)',
                  cursor: 'pointer'
                },
                borderRadius: '4px',
                mb: 1
              }}
              onClick={() => handleTransactionClick(transaction)}
            >
              <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Typography 
                  component="strong" 
                  sx={{ 
                    color: '#70B6F6',
                    fontWeight: 500
                  }}
                >
                  {transaction.user}
                </Typography>
                <Typography 
                  component="small" 
                  sx={{ 
                    color: '#6c757d',
                    fontSize: '0.7rem',
                  }}
                >
                  {formatDistanceToNow(parseISO(transaction.timestamp), { addSuffix: true })}
                </Typography>
              </Box>
              <Box sx={{ mb: 1, textAlign: 'left' }}>
                <Typography 
                  sx={{ 
                    color: '#A8B6BC',
                    mb: 1
                  }}
                >
                  {getTransactionDescription(transaction)}
                </Typography>
              </Box>
              <Typography 
                component='small'
                sx={{ 
                  color: '#6c757d',
                  fontSize: '0.7rem',
                  textAlign: 'left',
                  float: 'left',
                }}
              >
                {transaction.date} at {transaction.time}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Card>
  );
};

export default RecentTransaction;