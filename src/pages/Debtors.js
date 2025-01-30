import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Button, TextField, LinearProgress, Chip, Snackbar, CircularProgress, IconButton, useMediaQuery, styled, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Drawer, useTheme, Card, CardContent
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import { app } from '../firebase';
import { Search as SearchIcon, TrendingUp as TrendingUpIcon, Person as PersonIcon, AttachMoney as MoneyIcon, Close as CloseIcon, Edit as EditIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DebtorDetailModal from './DebtorsDetailModal';

const db = getFirestore(app);

const StyledDatePicker = styled('div')(({ theme }) => ({
  '& .react-datepicker-wrapper': {
    width: '100%'
  },
  '& .react-datepicker__input-container input': {
    width: '100%',
    padding: '8px 14px',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
    fontSize: '1rem',
    '&:focus': {
      outline: 'none',
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
    }
  },
  '& .react-datepicker': {
    fontFamily: theme.typography.fontFamily,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[2],
  },
  '& .react-datepicker__header': {
    backgroundColor: theme.palette.primary.light,
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  '& .react-datepicker__current-month': {
    color: theme.palette.primary.contrastText,
  },
  '& .react-datepicker__month': {
    margin: '0.4em',
  },
  '& .react-datepicker__day--selected': {
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    }
  }
}));

const DebtorsDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [debtors, setDebtors] = useState([]);
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [newPayment, setNewPayment] = useState({ principal: '', interest: '' });
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(!isMobile);
  const [selectedDate, setSelectedDate] = useState(new Date('2024-01-01'));
  const [isDetailOpen, setIsDetailOpen] = useState(false);
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Summary statistics calculation
  const summaryStats = {
    totalPrincipal: debtors.reduce((sum, d) => sum + d.currentOpeningPrincipal, 0),
    totalInterest: debtors.reduce((sum, d) => sum + d.currentOpeningInterest, 0),
    activeDebtors: debtors.filter(d => d.status === 'active').length,
    totalPaid: debtors.reduce((sum, d) => sum + d.totalPrincipalPaid + d.totalInterestPaid, 0)
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchDebtors = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'debtors'));
      const debtorsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDebtors(debtorsData);
    } catch (error) {
      console.error('Error fetching debtors:', error);
      setSnackbarMessage('Error fetching debtors data');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    fetchDebtors();
  }, []);

  const handlePaymentSubmit = async () => {
    if (!selectedDebtor || (!newPayment.principal && !newPayment.interest)) return;

    try {
      setLoading(true);
      const debtorRef = doc(db, 'debtors', selectedDebtor.id);
      const lastRecord = selectedDebtor.monthlyRecords.slice(-1)[0];
      
      const newRecord = {
        id: selectedDebtor.monthlyRecords.length,
        date: new Date().toISOString().split('T')[0],
        month: `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
        openingPrinciple: lastRecord.outstandingPrinciple,
        principleAdvance: 0,
        principlePaid: Number(newPayment.principal),
        outstandingPrinciple: lastRecord.outstandingPrinciple - Number(newPayment.principal),
        openingInterest: lastRecord.outstandingInterest,
        interestCharge: 0,
        intrestPaid: Number(newPayment.interest),
        outstandingInterest: lastRecord.outstandingInterest - Number(newPayment.interest)
      };

      const updatedDebtor = {
        ...selectedDebtor,
        monthlyRecords: [...selectedDebtor.monthlyRecords, newRecord],
        currentOpeningPrincipal: newRecord.outstandingPrinciple,
        currentOpeningInterest: newRecord.outstandingInterest,
        totalPrincipalPaid: selectedDebtor.totalPrincipalPaid + Number(newPayment.principal),
        totalInterestPaid: selectedDebtor.totalInterestPaid + Number(newPayment.interest)
      };

      await updateDoc(debtorRef, updatedDebtor);
      setDebtors(debtors.map(d => d.id === selectedDebtor.id ? updatedDebtor : d));
      setNewPayment({ principal: '', interest: '' });
      setSnackbarMessage('Payment recorded successfully');
    } catch (error) {
      console.error('Error recording payment:', error);
      setSnackbarMessage('Error recording payment');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const filteredDebtors = debtors.filter(debtor => 
    debtor.customerName && debtor.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return theme.palette.success;
      case 'overdue':
        return theme.palette.error;
      case 'completed':
        return theme.palette.info;
      default:
        return theme.palette.grey;
    }
  };

  const getPrincipalOutstandingForMonth = (debtor, month) => {
    const monthData = debtor.monthlyRecords?.find(r => r.month === month);
    return monthData ? monthData.outstandingPrinciple : 0;
  };

  const handleDebtorClick = (debtor) => {
    setSelectedDebtor(debtor);
    setIsDetailOpen(true);
  };

  const DetailedView = ({ debtor }) => {
    if (!debtor) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {debtor.customerName}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Principal Outstanding: UGX {debtor.currentOpeningPrincipal?.toLocaleString() || '0'}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Interest Outstanding: UGX {debtor.currentOpeningInterest?.toLocaleString() || '0'}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Total Principal Paid: UGX {debtor.totalPrincipalPaid?.toLocaleString() || '0'}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Total Interest Paid: UGX {debtor.totalInterestPaid?.toLocaleString() || '0'}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={debtor.monthlyRecords}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="outstandingPrinciple" stroke="#8884d8" name="Principal" />
            <Line type="monotone" dataKey="outstandingInterest" stroke="#82ca9d" name="Interest" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          {/* View Analytics Button for Mobile */}
          {isMobile && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                {showAnalytics ? 'Hide Analytics' : 'View Analytics'}
              </Button>
            </Box>
          )}

          {/* Enhanced Summary Statistics */}
          {(showAnalytics || !isMobile) && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  sx={{ 
                    p: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: 'white',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        UGX {summaryStats.totalPrincipal.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        Total Principal
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <TrendingUpIcon sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          {((summaryStats.totalPrincipal / filteredDebtors.length) / 1000000).toFixed(1)}M average
                        </Typography>
                      </Box>
                    </Box>
                    <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  sx={{ 
                    p: 2,
                    background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                    color: 'white',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        UGX {summaryStats.totalInterest.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        Total Interest
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <TrendingUpIcon sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          {((summaryStats.totalInterest / summaryStats.totalPrincipal) * 100).toFixed(1)}% of principal
                        </Typography>
                      </Box>
                    </Box>
                    <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  sx={{ 
                    p: 2,
                    background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                    color: 'white',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        {summaryStats.activeDebtors}
                      </Typography>
                      <Typography variant="body2">
                        Active Debtors
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          {summaryStats.activeDebtors} active
                        </Typography>
                      </Box>
                    </Box>
                    <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper 
                  sx={{ 
                    p: 2,
                    background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                    color: 'white',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        UGX {summaryStats.totalPaid.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        Total Paid
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <TrendingUpIcon sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          {((summaryStats.totalPaid / filteredDebtors.length) / 1000000).toFixed(1)}M average
                        </Typography>
                      </Box>
                    </Box>
                    <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size={isMobile ? "small" : "medium"}
                placeholder="Search debtors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StyledDatePicker>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="MMMM yyyy"
                  showMonthYearPicker
                  placeholderText="Select month"
                />
              </StyledDatePicker>
            </Grid>
          </Grid>

          {/* Debtors Grid */}
          <Grid container spacing={isMobile ? 2 : 3}>
            {filteredDebtors.length > 0 ? (
              filteredDebtors.map((debtor) => (
                <Grid item xs={12} sm={6} lg={4} key={debtor.id}>
                  <Card 
                    sx={{ 
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4],
                      }
                    }}
                  >
                    <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant={isMobile ? "subtitle1" : "h6"}>
                          {debtor.customerName}
                        </Typography>
                        <Chip
                          label={debtor.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(debtor.status).light,
                            color: getStatusColor(debtor.status).main,
                            textTransform: 'capitalize'
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          Principal Outstanding for {selectedDate.toISOString().slice(0, 7)}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          UGX {getPrincipalOutstandingForMonth(debtor, selectedDate.toISOString().slice(0, 7))?.toLocaleString() || '0'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Current Principal Outstanding
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          UGX {debtor.currentOpeningPrincipal?.toLocaleString() || '0'}
                        </Typography>
                      </Box>
                      
                      <Button
                        variant="contained"
                        fullWidth
                        size={isMobile ? "small" : "medium"}
                        endIcon={<NavigateNextIcon />}
                        onClick={() => handleDebtorClick(debtor)}
                        sx={{ mt: 2 }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Box className="text-center py-8 text-gray-500" sx={{ width: '100%' }}>
                No debtors found
              </Box>
            )}
          </Grid>
        </main>
      </div>

      {/* Detailed View Dialog/Drawer */}
      {isMobile ? (
        <Drawer
          anchor="right"
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          sx={{
            '& .MuiDrawer-paper': { 
              width: '100%',
              maxWidth: '600px'
            }
          }}
        >
          <Box sx={{ p: 2 }}>
          <DebtorDetailModal 
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        debtor={selectedDebtor}
        onUpdateDebtor={(updatedDebtor) => {
          // Update the debtor in your debtors array
          setDebtors(debtors.map(d => 
            d.id === updatedDebtor.id ? updatedDebtor : d
          ));
          
          // Update in Firebase
          const debtorRef = doc(db, 'debtors', updatedDebtor.id);
          updateDoc(debtorRef, updatedDebtor);
        }}
      />
          </Box>
        </Drawer>
      ) : (
        <DebtorDetailModal 
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        debtor={selectedDebtor}
        onUpdateDebtor={(updatedDebtor) => {
          // Update the debtor in your debtors array
          setDebtors(debtors.map(d => 
            d.id === updatedDebtor.id ? updatedDebtor : d
          ));
          
          // Update in Firebase
          const debtorRef = doc(db, 'debtors', updatedDebtor.id);
          updateDoc(debtorRef, updatedDebtor);
        }}
      />
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </div>
  );
};

export default DebtorsDashboard;