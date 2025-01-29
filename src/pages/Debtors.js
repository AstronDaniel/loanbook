import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, TextField, Grid,
  Button, Box, Chip, InputAdornment, Paper, useTheme, Dialog,
  DialogTitle, DialogContent, DialogActions, Tabs, Tab, IconButton,
  Drawer, useMediaQuery, LinearProgress, Divider,
  Alert, styled
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  NavigateNext as NavigateNextIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  AccountBalanceWallet as WalletIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
  ResponsiveContainer
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { app } from '../firebase';

const db = getFirestore(app);

// Styled date picker wrapper
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
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedDate, setSelectedDate] = useState(new Date('2024-01-01'));
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [detailTab, setDetailTab] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(!isMobile);
  const [debtorsData, setDebtorsData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [error, setError] = useState(null);

  const fetchDebtors = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'debtors'));
      const debtorsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setDebtorsData(debtorsData);
    } catch (err) {
      setError('Failed to fetch debtors data');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDebtors();
  }, []);

  // Filter and sort debtors
  const filteredDebtors = debtorsData
    .filter(debtor => 
      debtor.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'amount') return b.principalOutstanding - a.principalOutstanding;
      return 0;
    });

  const summaryStats = {
    totalOutstanding: filteredDebtors.reduce((sum, d) => sum + d.principalOutstanding, 0),
    totalInterest: filteredDebtors.reduce((sum, d) => sum + d.interestOutstanding, 0),
    activeDebtors: filteredDebtors.filter(d => d.status === 'active').length,
    overdueDebtors: filteredDebtors.filter(d => d.status === 'overdue').length,
    totalLoans: filteredDebtors.length,
    averageLoan: filteredDebtors.reduce((sum, d) => sum + d.principalOutstanding, 0) / filteredDebtors.length
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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

  // Calculate completion percentage for progress bars
  const calculateCompletion = (paid, total) => (paid / total) * 100;

  // Calculate monthly data based on previous month
  const calculateMonthlyData = (prevMonth, newData) => {
    const openingPrincipal = prevMonth ? prevMonth.principalOutstanding : 0;
    const openingInterest = prevMonth ? prevMonth.interestOutstanding : 0;
    
    const principalOutstanding = 
      openingPrincipal + 
      Number(newData.principalAdvance || 0) - 
      Number(newData.principalPaid || 0);
    
    const interestOutstanding = 
      openingInterest + 
      Number(newData.interestCharge || 0) - 
      Number(newData.interestPaid || 0);

    return {
      ...newData,
      openingPrincipal,
      openingInterest,
      principalOutstanding,
      interestOutstanding,
      date: selectedDate.toISOString().slice(0, 7)
    };
  };

  // Handle monthly record update
  const handleUpdateMonthlyRecord = async () => {
    if (!selectedDebtor || !editData) return;

    try {
      const debtorRef = doc(db, 'debtors', selectedDebtor.id);
      
      const currentMonth = selectedDate.toISOString().slice(0, 7);
      const monthlyRecords = [...(selectedDebtor.monthlyRecords || [])];
      const monthIndex = monthlyRecords.findIndex(r => r.date === currentMonth);
      const prevMonth = monthIndex > 0 ? monthlyRecords[monthIndex - 1] : null;

      // Calculate new values
      const calculatedData = calculateMonthlyData(prevMonth, editData);

      // Update or add new monthly record
      if (monthIndex >= 0) {
        monthlyRecords[monthIndex] = calculatedData;
      } else {
        monthlyRecords.push(calculatedData);
      }

      // Sort records by date
      monthlyRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Update Firebase
      await updateDoc(debtorRef, {
        monthlyRecords,
        lastUpdated: new Date().toISOString()
      });

      // Update local state
      const updatedDebtors = debtorsData.map(d => 
        d.id === selectedDebtor.id 
          ? { ...d, monthlyRecords } 
          : d
      );
      
      setDebtorsData(updatedDebtors);
      setSelectedDebtor({ ...selectedDebtor, monthlyRecords });
      setIsEditMode(false);
      setEditData(null);

      // Refresh the data
      await fetchDebtors();

    } catch (err) {
      setError('Failed to update record');
      console.error(err);
    }
  };

  // Start editing monthly record
  const handleStartEdit = (monthData) => {
    setEditData(monthData || {
      principalAdvance: 0,
      principalPaid: 0,
      interestCharge: 0,
      interestPaid: 0
    });
    setIsEditMode(true);
  };

  // Edit form component
  const MonthlyEditForm = () => (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Principal Advance"
            type="number"
            fullWidth
            value={editData?.principalAdvance || ''}
            onChange={(e) => setEditData({
              ...editData,
              principalAdvance: Number(e.target.value)
            })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Principal Paid"
            type="number"
            fullWidth
            value={editData?.principalPaid || ''}
            onChange={(e) => setEditData({
              ...editData,
              principalPaid: Number(e.target.value)
            })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Interest Charge"
            type="number"
            fullWidth
            value={editData?.interestCharge || ''}
            onChange={(e) => setEditData({
              ...editData,
              interestCharge: Number(e.target.value)
            })}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Interest Paid"
            type="number"
            fullWidth
            value={editData?.interestPaid || ''}
            onChange={(e) => setEditData({
              ...editData,
              interestPaid: Number(e.target.value)
            })}
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={() => setIsEditMode(false)}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleUpdateMonthlyRecord}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );

  // Monthly record display component
  const MonthlyRecordDisplay = ({ monthData }) => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Typography variant="body2" color="textSecondary">
          Opening Principal
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
          UGX {monthData?.openingPrincipal?.toLocaleString() || '0'}
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="body2" color="textSecondary">
          Principal Advanced
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
          UGX {monthData?.principalAdvance?.toLocaleString() || '0'}
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="body2" color="textSecondary">
          Principal Paid
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
          UGX {monthData?.principalPaid?.toLocaleString() || '0'}
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="body2" color="textSecondary">
          Principal Outstanding
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
          UGX {monthData?.principalOutstanding?.toLocaleString() || '0'}
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="body2" color="textSecondary">
          Interest Charged
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
          UGX {monthData?.interestCharge?.toLocaleString() || '0'}
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="body2" color="textSecondary">
          Interest Paid
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
          UGX {monthData?.interestPaid?.toLocaleString() || '0'}
        </Typography>
      </Grid>
    </Grid>
  );

  // Get current month's data for a debtor
  const getCurrentMonthData = (debtor) => {
    if (!debtor?.monthlyRecords?.length) return null;
    const currentMonth = selectedDate.toISOString().slice(0, 7);
    const monthData = debtor.monthlyRecords.find(r => r.date === currentMonth);
    return monthData || null;
  };

  // Modified DetailedView component
  const DetailedView = ({ debtor }) => {
    if (!debtor) return null;

    const currentMonthData = getCurrentMonthData(debtor);

    return (
      <Box>
        <Tabs
          value={detailTab}
          onChange={(e, newValue) => setDetailTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<AssessmentIcon />} label="Current Month" />
          <Tab icon={<TrendingUpIcon />} label="Trends" />
          <Tab icon={<HistoryIcon />} label="History" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {detailTab === 0 && (
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Monthly Details</Typography>
                {!isEditMode && (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => handleStartEdit(currentMonthData)}
                  >
                    Edit
                  </Button>
                )}
              </Box>
              
              {isEditMode ? (
                <MonthlyEditForm />
              ) : (
                <MonthlyRecordDisplay monthData={currentMonthData} />
              )}
            </Paper>
          )}

          {detailTab === 1 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Trends</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={debtor.monthlyRecords}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip />
                    <Line 
                      type="monotone" 
                      dataKey="principalOutstanding" 
                      stroke={theme.palette.primary.main} 
                      name="Principal"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="interestOutstanding" 
                      stroke={theme.palette.secondary.main} 
                      name="Interest"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          )}

          {detailTab === 2 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Monthly History</Typography>
              {debtor.monthlyRecords?.map((record, index) => (
                <Box key={index} sx={{ py: 2 }}>
                  <Typography variant="subtitle1">{record.date}</Typography>
                  <MonthlyRecordDisplay monthData={record} />
                  {index < debtor.monthlyRecords.length - 1 && (
                    <Divider sx={{ mt: 2 }} />
                  )}
                </Box>
              ))}
            </Paper>
          )}
        </Box>
      </Box>
    );
  };

  const handleDebtorClick = (debtor) => {
    setSelectedDebtor(debtor);
    setIsDetailOpen(true);
  };

  const getPrincipalOutstandingForMonth = (debtor, month) => {
    const monthData = debtor.monthlyRecords?.find(r => r.date === month);
    return monthData ? monthData.principalOutstanding : 0;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      {/* Sidebar */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />
        <Box sx={{ p: isMobile ? 2 : 3 }}>
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
            <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }}>
              {/* Total Outstanding Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3,
                    height: '100%',
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
                        UGX {summaryStats.totalOutstanding.toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        Total Outstanding Principal
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <TrendingUpIcon sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          {((summaryStats.totalOutstanding / filteredDebtors.length) / 1000000).toFixed(1)}M average
                        </Typography>
                      </Box>
                    </Box>
                    <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </Paper>
              </Grid>

              {/* Active Debtors Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3,
                    height: '100%',
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
                        <AssessmentIcon sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          {summaryStats.overdueDebtors} overdue
                        </Typography>
                      </Box>
                    </Box>
                    <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </Paper>
              </Grid>

              {/* Total Interest Card */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3,
                    height: '100%',
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
                        Total Interest Outstanding
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                        <WalletIcon sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          {((summaryStats.totalInterest / summaryStats.totalOutstanding) * 100).toFixed(1)}% of principal
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
                          {debtor.name}
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
                          UGX {getPrincipalOutstandingForMonth(debtor, selectedDate.toISOString().slice(0, 7)).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Current Principal Outstanding
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          UGX {debtor.principalOutstanding.toLocaleString()}
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
        </Box>
      </Box>

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {selectedDebtor?.name}
              </Typography>
              <IconButton onClick={() => setIsDetailOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <DetailedView debtor={selectedDebtor} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button onClick={() => setIsDetailOpen(false)}>Close</Button>
              <Button 
                variant="contained" 
                startIcon={<EditIcon />}
                onClick={() => console.log('Edit debtor:', selectedDebtor?.name)}
              >
                Edit Details
              </Button>
            </Box>
          </Box>
        </Drawer>
      ) : (
        <Dialog
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {selectedDebtor?.name}
              </Typography>
              <IconButton onClick={() => setIsDetailOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <DetailedView debtor={selectedDebtor} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDetailOpen(false)}>Close</Button>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={() => console.log('Edit debtor:', selectedDebtor?.name)}
            >
              Edit Details
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Quick Stats Bottom Sheet for Mobile */}
      {/* {isMobile && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            bgcolor: 'background.paper',
            zIndex: theme.zIndex.drawer - 1
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Total Outstanding</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                UGX {summaryStats.totalOutstanding.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Active Debtors</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {filteredDebtors.length}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )} */}
    </Box>
  );
};

export default DebtorsDashboard;