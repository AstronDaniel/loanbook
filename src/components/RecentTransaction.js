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
                  bgcolor: 'rgba(255,255,255,0.03)'
                },
                borderRadius: '4px',
                mb: 1
              }}
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
                  {transaction.type} - {transaction.content.description}
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