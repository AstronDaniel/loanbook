import React, { useState } from 'react';
import {
  Card, CardContent, Typography, TextField, Select, MenuItem, Grid,
  Button, Box, Chip, InputAdornment, Paper, useTheme, Dialog,
  DialogTitle, DialogContent, DialogActions, Tabs, Tab, IconButton,
  Drawer, useMediaQuery, Tooltip, LinearProgress, Divider
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
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';

const DebtorsDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [detailTab, setDetailTab] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(!isMobile);

  // Sample data
  const debtorsData = [
    {
      id: 1,
      name: "Customer 1",
      openingPrincipal: 11500000,
      principalAdvanced: 2000000,
      principalPaid: 3030000,
      principalOutstanding: 10470000,
      interestOpening: 920000,
      interestCharged: 180000,
      interestPaid: 1100000,
      interestOutstanding: 0,
      status: "active",
      history: [
        { month: 'Jan', principal: 11500000, interest: 920000 },
        { month: 'Feb', principal: 10800000, interest: 850000 },
        { month: 'Mar', principal: 10470000, interest: 780000 }
      ],
      paymentHistory: [
        { date: '2024-01-15', amount: 1000000, type: 'Principal' },
        { date: '2024-02-01', amount: 500000, type: 'Interest' }
      ]
    },
    {
      id: 2,
      name: "Customer 2",
      openingPrincipal: 3000000,
      principalAdvanced: 0,
      principalPaid: 0,
      principalOutstanding: 3000000,
      interestOpening: 120000,
      interestCharged: 120000,
      interestPaid: 0,
      interestOutstanding: 240000,
      status: "overdue",
      history: [
        { month: 'Jan', principal: 3000000, interest: 120000 },
        { month: 'Feb', principal: 3000000, interest: 180000 },
        { month: 'Mar', principal: 3000000, interest: 240000 }
      ],
      paymentHistory: []
    }
  ];

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

  // Detailed View Component
  const DetailedView = ({ debtor }) => {
    if (!debtor) return null;

    return (
      <Box>
        <Tabs
          value={detailTab}
          onChange={(e, newValue) => setDetailTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<AssessmentIcon />} label="Overview" />
          <Tab icon={<TrendingUpIcon />} label="Trends" />
          <Tab icon={<HistoryIcon />} label="History" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {detailTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Loan Summary</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Principal Progress
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={calculateCompletion(debtor.principalPaid, debtor.openingPrincipal)}
                        sx={{ height: 10, borderRadius: 5, my: 1 }}
                      />
                      <Typography variant="body2">
                        {`${debtor.principalPaid.toLocaleString()} / ${debtor.openingPrincipal.toLocaleString()} UGX`}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Interest Progress
                      </Typography>
                      <LinearProgress 
                        variant="determinate"
                        value={calculateCompletion(debtor.interestPaid, debtor.interestOpening + debtor.interestCharged)}
                        sx={{ height: 10, borderRadius: 5, my: 1 }}
                      />
                      <Typography variant="body2">
                        {`${debtor.interestPaid.toLocaleString()} / ${(debtor.interestOpening + debtor.interestCharged).toLocaleString()} UGX`}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 2, height: 300 }}>
                  <Typography variant="h6" gutterBottom>Payment Distribution</Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Principal', value: debtor.principalPaid },
                          { name: 'Interest', value: debtor.interestPaid }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill={theme.palette.primary.main} />
                        <Cell fill={theme.palette.secondary.main} />
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}

          {detailTab === 1 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Monthly Trends</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={debtor.history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip />
                    <Line type="monotone" dataKey="principal" stroke={theme.palette.primary.main} />
                    <Line type="monotone" dataKey="interest" stroke={theme.palette.secondary.main} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          )}

          {detailTab === 2 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Payment History</Typography>
              {debtor.paymentHistory.length > 0 ? (
                debtor.paymentHistory.map((payment, index) => (
                  <Box key={index} sx={{ py: 2 }}>
                    <Grid container justifyContent="space-between" alignItems="center">
                      <Grid item>
                        <Typography variant="subtitle1">{payment.date}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {payment.type}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="subtitle1" color="primary">
                          UGX {payment.amount.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                    {index < debtor.paymentHistory.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))
              ) : (
                <Typography color="textSecondary">No payment history available</Typography>
              )}
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
              <Select
                fullWidth
                size={isMobile ? "small" : "medium"}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                variant="outlined"
              >
                <MenuItem value="2024-01">January 2024</MenuItem>
                <MenuItem value="2024-02">February 2024</MenuItem>
                <MenuItem value="2024-03">March 2024</MenuItem>
              </Select>
            </Grid>
          </Grid>

          {/* Debtors Grid */}
          <Grid container spacing={isMobile ? 2 : 3}>
            {filteredDebtors.map((debtor) => (
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
                        Principal Outstanding
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
            ))}
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