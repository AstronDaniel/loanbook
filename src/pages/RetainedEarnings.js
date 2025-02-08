import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Paper,
  Box,
  Grid,
  Stack,
  DialogActions,
  MenuItem,
  Select,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Edit, Info, Plus as Add, TrendingUp, DollarSign, Group } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { app } from '../firebase';

const db = getFirestore(app);

const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const StatCard = ({ title, value, icon: Icon, trend, color }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: alpha(color, 0.2), color: color }}>
            <Icon size={20} />
          </Avatar>
          <Typography 
            variant="h6" 
            sx={{ ml: 1.5, color: theme.palette.text.secondary }}
          >
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ mb: 1, color: theme.palette.text.primary }}>
          {value}
        </Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUp size={16} color={theme.palette.success.main} />
            <Typography 
              variant="body2" 
              sx={{ ml: 0.5, color: theme.palette.success.main }}
            >
              {trend}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const RetainedEarnings = () => {
  const theme = useTheme();
  const [investors, setInvestors] = useState([]);
  const [distributions, setDistributions] = useState({});
  const [date, setDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [editingDistribution, setEditingDistribution] = useState(null);
  const [newAmount, setNewAmount] = useState("");
  const [showInvestorDialog, setShowInvestorDialog] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [distributionAmount, setDistributionAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showNewDistributionDialog, setShowNewDistributionDialog] = useState(false);
  const [profit, setProfit] = useState(0);
  const [retainedEarnings, setRetainedEarnings] = useState(0);

  useEffect(() => {
    fetchInvestors();
    fetchDistributions();
    calculateProfit(selectedMonth).then(setProfit);
    calculateRetainedEarnings(selectedMonth).then(setRetainedEarnings);
  }, [selectedMonth]);

  const fetchInvestors = async () => {
    setLoading(true);
    try {
      const investorsSnapshot = await getDocs(collection(db, 'investors'));
      const investorsList = investorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvestors(investorsList);
    } catch (error) {
      console.error('Error fetching investors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistributions = async () => {
    setLoading(true);
    try {
      const distributionsSnapshot = await getDocs(collection(db, 'distributions'));
      const distributionsData = distributionsSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        const month = format(new Date(data.date), 'yyyy-MM');
        if (!acc[month]) acc[month] = {};
        acc[month][data.investorId] = data.amount;
        return acc;
      }, {});
      setDistributions(distributionsData);
    } catch (error) {
      console.error('Error fetching distributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDistribution = async () => {
    setLoading(true);
    try {
      const distributionData = {
        investorId: selectedInvestor,
        date: selectedMonth + '-01',
        amount: parseFloat(distributionAmount.replace(/,/g, ''))
      };
      await addDoc(collection(db, 'distributions'), distributionData);
      fetchDistributions();
      setSelectedInvestor('');
      setDistributionAmount('');
      setSnackbar({ open: true, message: 'Distribution added successfully', severity: 'success' });
    } catch (error) {
      console.error('Error adding distribution:', error);
      setSnackbar({ open: true, message: 'Error adding distribution', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalDistributions = (month) => {
    return Object.values(distributions[month] || {}).reduce((a, b) => a + b, 0);
  };

  const calculateProfit = async (month) => {
    const selectedYear = new Date(month + '-01').getFullYear();
    const selectedMonth = new Date(month + '-01').getMonth() + 1;

    try {
      const revenueQuery = query(collection(db, 'revenue'), where('date', '>=', `${selectedYear}-${selectedMonth}-01`), where('date', '<=', `${selectedYear}-${selectedMonth}-31`));
      const revenueSnapshot = await getDocs(revenueQuery);
      const revenue = revenueSnapshot.docs.map(doc => doc.data());
      const bankInterest = revenue.reduce((acc, data) => acc + (data.bankInterest || 0), 0);

      const debtorQuery = query(collection(db, 'debtors'));
      const debtorSnapshot = await getDocs(debtorQuery);
      const debtors = debtorSnapshot.docs.map(doc => doc.data());

      const customerInterest = debtors.reduce((acc, debtor) => {
        const monthlyRecords = debtor.monthlyRecords || [];
        const interestPaid = monthlyRecords.reduce((sum, record) => {
          const recordDate = new Date(record.date);
          if (recordDate.getFullYear() === selectedYear && (recordDate.getMonth() + 1) === selectedMonth) {
            return sum + (record.intrestPaid || 0);
          }
          return sum;
        }, 0);
        return acc + interestPaid;
      }, 0);

      return customerInterest + bankInterest;
    } catch (error) {
      console.error('Error calculating profit:', error);
      return 0;
    }
  };

  const calculateRetainedEarnings = async (month) => {
    const profit = await calculateProfit(month);
    const totalDistributions = calculateTotalDistributions(month);
    return profit - totalDistributions;
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedMonth(format(newDate, 'yyyy-MM'));
  };

  const handleSaveDistribution = async () => {
    if (editingDistribution && newAmount) {
      setLoading(true);
      try {
        const distributionDoc = doc(db, 'distributions', editingDistribution.id);
        await updateDoc(distributionDoc, { amount: parseFloat(newAmount.replace(/,/g, '')) });

        // Refresh the distributions data
        setDistributions(prev => ({
          ...prev,
          [selectedMonth]: {
            ...prev[selectedMonth],
            [editingDistribution.id]: parseFloat(newAmount.replace(/,/g, ''))
          }
        }));
        
        setEditingDistribution(null);
        setNewAmount("");
        setSnackbar({ open: true, message: 'Distribution updated successfully', severity: 'success' });
      } catch (error) {
        console.error('Error updating distribution:', error);
        setSnackbar({ open: true, message: 'Error updating distribution', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAmountChange = (setter) => (event) => {
    const value = event.target.value.replace(/,/g, '');
    if (!isNaN(value)) {
      setter(formatNumberWithCommas(value));
    }
  };

  const getTotalInvestors = () => investors.length;

  const chartData = Object.entries(distributions).map(([month, data]) => ({
    month: format(new Date(month + '-01'), 'MMM yyyy'),
    total: Object.values(data).reduce((a, b) => a + b, 0)
  }));

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div style={{ display: 'flex', height: '100vh' }}>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default' }}>
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <Box component="main" sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
              {/* Header Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Retained Earnings
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Track and manage retained earnings across periods
                </Typography>
              </Box>

              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Profit"
                    value={`UGX ${formatNumberWithCommas(profit)}`}
                    icon={DollarSign}
                    trend="trend"
                    color={theme.palette.primary.main}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Distributions"
                    value={`UGX ${formatNumberWithCommas(calculateTotalDistributions(selectedMonth))}`}
                    icon={TrendingUp}
                    color={theme.palette.info.main}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Retained Earnings"
                    value={`UGX ${formatNumberWithCommas(retainedEarnings)}`}
                    icon={DollarSign}
                    color={theme.palette.warning.main}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Select Period
                      </Typography>
                      <DatePicker
                        views={['year', 'month']}
                        value={date}
                        onChange={(newDate) => {
                          setDate(newDate);
                          setSelectedMonth(format(newDate, 'yyyy-MM'));
                        }}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Chart and Lifetime Contributions */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Retained Earnings Trends
                      </Typography>
                      <Box sx={{ height: 400 }}>
                        <ResponsiveContainer>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar 
                              dataKey="total" 
                              fill={theme.palette.primary.main}
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Distributions
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<Add />}
                          onClick={() => setShowNewDistributionDialog(true)}
                          size="small"
                        >
                          Add Distribution
                        </Button>
                      </Box>
                      <Stack spacing={2}>
                        {investors.map(investor => (
                          <Paper 
                            key={investor.id} 
                            elevation={0}
                            sx={{ 
                              p: 2,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 1,
                              '&:hover': {
                                bgcolor: 'action.hover'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="subtitle1">
                                  {investor.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {investor.company}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                                  UGX {calculateTotalDistributions(investor.id).toLocaleString()}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedInvestor(investor);
                                    setShowInvestorDialog(true);
                                  }}
                                >
                                  <Info />
                                </IconButton>
                              </Box>
                            </Box>
                          </Paper>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Monthly Contributions Section */}
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <div>
                      <Typography variant="h6" gutterBottom>
                        Monthly Distributions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(date, 'MMMM yyyy')}
                      </Typography>
                    </div>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setShowNewDistributionDialog(true)}
                    >
                      Add Distribution
                    </Button>
                  </Box>

                  <Grid container spacing={2}>
                    {investors.map(investor => (
                      <Grid item xs={12} md={6} key={investor.id}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                            '&:hover': {
                              bgcolor: 'action.hover'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                {investor.name[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1">
                                  {investor.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {investor.company}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                                UGX {(distributions[selectedMonth]?.[investor.id] || 0).toLocaleString()}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingDistribution(investor);
                                  setNewAmount(distributions[selectedMonth]?.[investor.id] || "");
                                }}
                              >
                                <Edit />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Total for {format(date, 'MMMM yyyy')}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                      UGX {calculateTotalDistributions(selectedMonth).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Add Distribution Dialog */}
              <Dialog
                open={showNewDistributionDialog}
                onClose={() => setShowNewDistributionDialog(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>
                  <Typography variant="h6">Add Distribution</Typography>
                </DialogTitle>
                <DialogContent>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Select
                      value={selectedInvestor}
                      onChange={(e) => setSelectedInvestor(e.target.value)}
                      displayEmpty
                      fullWidth
                    >
                      <MenuItem value="" disabled>Select Investor</MenuItem>
                      {investors.map(investor => (
                        <MenuItem key={investor.id} value={investor.id}>
                          {investor.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <TextField
                      label="Amount"
                      type="text"
                      value={distributionAmount}
                      onChange={handleAmountChange(setDistributionAmount)}
                      fullWidth
                    />
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowNewDistributionDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAddDistribution}
                    disabled={!selectedInvestor || !distributionAmount}
                  >
                    Add Distribution
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Edit Distribution Dialog */}
              <Dialog 
                open={Boolean(editingDistribution)} 
                onClose={() => setEditingDistribution(null)}
                maxWidth="sm"
              >
                <DialogTitle>Edit Distribution</DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Amount"
                    type="text"
                    fullWidth
                    value={newAmount}
                    onChange={handleAmountChange(setNewAmount)}
                    sx={{ mt: 2 }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setEditingDistribution(null)}>Cancel</Button>
                  <Button onClick={handleSaveDistribution} variant="contained">
                    Save Changes
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Investor Details Dialog */}
              <Dialog
                open={showInvestorDialog}
                onClose={() => setShowInvestorDialog(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>Investor Details</DialogTitle>
                <DialogContent>
                  {selectedInvestor && (
                    <Stack spacing={2} sx={{ pt: 2 }}>
                      <Typography><strong>Name:</strong> {selectedInvestor.name}</Typography>
                      <Typography><strong>Company:</strong> {selectedInvestor.company}</Typography>
                      <Typography><strong>Email:</strong> {selectedInvestor.email}</Typography>
                      <Typography><strong>Phone:</strong> {selectedInvestor.phone}</Typography>
                      <Typography variant="h6" gutterBottom>
                        Distributions
                      </Typography>
                      {Object.entries(distributions[selectedMonth] || {}).map(([investorId, amount]) => (
                        <Box key={investorId} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography><strong>Investor {investorId}:</strong></Typography>
                          <Typography>UGX {Math.abs(amount).toLocaleString()}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowInvestorDialog(false)}>Close</Button>
                </DialogActions>
              </Dialog>
            </Box>
          </Box>
        </Box>
      </div>
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 9999
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default RetainedEarnings;