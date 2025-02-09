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
  Chip,
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
import Sidebar from '../components/SideBar'; // Adjust the path as necessary
import Header from '../components/Header';   // Adjust the path as necessary
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
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

const CapitalContributions = () => {
  const theme = useTheme();
  const [investors, setInvestors] = useState([]);
  const [contributions, setContributions] = useState({});
  const [date, setDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [editingContribution, setEditingContribution] = useState(null);
  const [newAmount, setNewAmount] = useState("");
  const [showInvestorDialog, setShowInvestorDialog] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newInvestor, setNewInvestor] = useState({ name: '', email: '', company: '' });
  const [showNewInvestorDialog, setShowNewInvestorDialog] = useState(false);
  const [selectedInvestorForContribution, setSelectedInvestorForContribution] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showNewContributionDialog, setShowNewContributionDialog] = useState(false);

  useEffect(() => {
    fetchInvestors();
    fetchContributions();
  }, []);

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

  const fetchContributions = async () => {
    setLoading(true);
    try {
      const contributionsSnapshot = await getDocs(collection(db, 'contributions'));
      const contributionsData = contributionsSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        const month = format(new Date(data.date), 'yyyy-MM');
        if (!acc[month]) acc[month] = {};
        acc[month][data.investorId] = { ...data, contributionId: doc.id };
        return acc;
      }, {});
      setContributions(contributionsData);
    } catch (error) {
      console.error('Error fetching contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const logTransaction = async (type, content, investor) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const transactionLog = {
      user: user ? user.email : 'anonymous',
      timestamp: new Date().toISOString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      time: new Date().toLocaleTimeString(),
      type,
      content: {
        reference: Math.random().toString(36).substring(2, 15),
        status: type === 'add' ? 'added' : type === 'delete' ? 'deleted' : 'updated',
        transferFee: content.amount,
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} contribution of UGX ${content.amount.toLocaleString()} for ${investor.name}`,
        notes: `${user ? user.email : 'anonymous'} ${type} contribution for investor ${investor.name} with amount UGX ${content.amount.toLocaleString()}`
      }
    };
    await addDoc(collection(db, 'transactionLogs'), transactionLog);
  };

  const handleAddInvestor = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'investors'), newInvestor);
      fetchInvestors();
      setShowNewInvestorDialog(false);
      setNewInvestor({ name: '', email: '', company: '' });
      setSnackbar({ open: true, message: 'Investor added successfully', severity: 'success' });
    } catch (error) {
      console.error('Error adding investor:', error);
      setSnackbar({ open: true, message: 'Error adding investor', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInvestor = async () => {
    setLoading(true);
    try {
      const investorDoc = doc(db, 'investors', selectedInvestor.id);
      await updateDoc(investorDoc, selectedInvestor);
      fetchInvestors();
      setShowInvestorDialog(false);
      setSnackbar({ open: true, message: 'Investor updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating investor:', error);
      setSnackbar({ open: true, message: 'Error updating investor', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddContribution = async () => {
    setLoading(true);
    try {
      const contributionData = {
        investorId: selectedInvestorForContribution,
        date: selectedMonth + '-01',
        amount: parseFloat(contributionAmount.replace(/,/g, ''))
      };
      await addDoc(collection(db, 'contributions'), contributionData);
      fetchContributions();
      setSelectedInvestorForContribution('');
      setContributionAmount('');
      setSnackbar({ open: true, message: 'Contribution added successfully', severity: 'success' });

      // Log the transaction
      const investor = investors.find(inv => inv.id === selectedInvestorForContribution);
      await logTransaction('add', contributionData, investor);
    } catch (error) {
      console.error('Error adding contribution:', error);
      setSnackbar({ open: true, message: 'Error adding contribution', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const calculateLifetimeTotal = (investorId) => {
    return Object.values(contributions).reduce((total, monthData) => {
      return total + (monthData[investorId]?.amount || 0);
    }, 0);
  };

  const getMonthTotal = (month) => {
    return Object.values(contributions[month] || {}).reduce((a, b) => a + b.amount, 0);
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedMonth(format(newDate, 'yyyy-MM'));
  };

  const handleSaveContribution = async () => {
    if (editingContribution && newAmount) {
      
      setLoading(true);
      try {
        console.log("edit: ",editingContribution)
        const contributionDocRef = doc(db, 'contributions', editingContribution.contributionId);
        await updateDoc(contributionDocRef, { 
          amount: parseFloat(newAmount.replace(/,/g, ''))
        });

        // Update local state
        setContributions(prev => ({
          ...prev,
          [selectedMonth]: {
            ...prev[selectedMonth],
            [editingContribution.investorId]: {
              ...prev[selectedMonth][editingContribution.investorId],
              amount: parseFloat(newAmount.replace(/,/g, ''))
            }
          }
        }));
        
        // Get investor data for logging
        const investor = investors.find(inv => inv.id === editingContribution.investorId);
        
        // Log the transaction
        await logTransaction('update', {
          amount: parseFloat(newAmount.replace(/,/g, '')),
          date: editingContribution.date
        }, investor);

        setEditingContribution(null);
        setNewAmount("");
        setSnackbar({ open: true, message: 'Contribution updated successfully', severity: 'success' });
      } catch (error) {
        console.error('Error updating contribution:', error);
        setSnackbar({ open: true, message: 'Error updating contribution', severity: 'error' });
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

  const getAverageContribution = () => {
    const total = getMonthTotal(selectedMonth);
    return total / (investors.length || 1);
  };

  const chartData = Object.entries(contributions).map(([month, data]) => ({
    month: format(new Date(month + '-01'), 'MMM yyyy'),
    total: Object.values(data).reduce((a, b) => a + b.amount, 0)
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
                  Capital Contributions
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Track and manage investor contributions across periods
                </Typography>
              </Box>

              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Contributions"
                    value={`UGX ${formatNumberWithCommas(getMonthTotal(selectedMonth))}`}
                    icon={DollarSign}
                    trend="trend"
                    color={theme.palette.primary.main}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Investors"
                    value={getTotalInvestors()}
                    icon={Group}
                    color={theme.palette.success.main}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Average Contribution"
                    value={`UGX ${formatNumberWithCommas(Math.round(getAverageContribution()))}`}
                    icon={TrendingUp}
                    color={theme.palette.info.main}
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
                        Contribution Trends
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
                          Lifetime Contributions
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<Add />}
                          onClick={() => setShowNewInvestorDialog(true)}
                          size="small"
                        >
                          Add Investor
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
                                  UGX {calculateLifetimeTotal(investor.id).toLocaleString()}
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
                        Monthly Contributions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(date, 'MMMM yyyy')}
                      </Typography>
                    </div>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setShowNewContributionDialog(true)}
                    >
                      Add Contribution
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
                                UGX {(contributions[selectedMonth]?.[investor.id]?.amount || 0).toLocaleString()}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const contribution = contributions[selectedMonth]?.[investor.id];
                                  setEditingContribution({
                                    ...contribution,
                                    investorId: investor.id,
                                    name: investor.name // include name for display purposes
                                  });
                                  setNewAmount(contribution?.amount?.toString() || "");
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
                      UGX {getMonthTotal(selectedMonth).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Add New Investor Section */}
              {/* <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Add New Investor
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setShowNewInvestorDialog(true)}
                  >
                    Add Investor
                  </Button>
                </CardContent>
              </Card> */}

              {/* Add Contribution Section */}
              <Dialog
                open={showNewContributionDialog}
                onClose={() => setShowNewContributionDialog(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>
                  <Typography variant="h6">Add Contribution</Typography>
                </DialogTitle>
                <DialogContent>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Select
                      value={selectedInvestorForContribution}
                      onChange={(e) => setSelectedInvestorForContribution(e.target.value)}
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
                      value={contributionAmount}
                      onChange={handleAmountChange(setContributionAmount)}
                      fullWidth
                    />
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowNewContributionDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAddContribution}
                    disabled={!selectedInvestorForContribution || !contributionAmount}
                  >
                    Add Contribution
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Edit Contribution Dialog */}
              <Dialog 
                open={Boolean(editingContribution)} 
                onClose={() => setEditingContribution(null)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle sx={{ pb: 1 }}>
                  <Typography variant="h6">
                    Edit Contribution
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {editingContribution?.name} - {format(date, 'MMMM yyyy')}
                  </Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                  <TextField
                    autoFocus
                    label="Amount (UGX)"
                    type="text"
                    fullWidth
                    value={newAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      if (!isNaN(value)) {
                        setNewAmount(formatNumberWithCommas(value));
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ color: 'text.secondary', mr: 1 }}>UGX</Box>
                      ),
                    }}
                  />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                  <Button onClick={() => setEditingContribution(null)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleSaveContribution}
                    disabled={!newAmount}
                  >
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
                <DialogTitle>
                  <Typography variant="h6">Investor Details</Typography>
                </DialogTitle>
                <DialogContent>
                  <Stack spacing={3} sx={{ mt: 2 }}>
                    <TextField
                      label="Name"
                      value={selectedInvestor?.name || ''}
                      onChange={(e) => setSelectedInvestor({ ...selectedInvestor, name: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Email"
                      value={selectedInvestor?.email || ''}
                      onChange={(e) => setSelectedInvestor({ ...selectedInvestor, email: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Company"
                      value={selectedInvestor?.company || ''}
                      onChange={(e) => setSelectedInvestor({ ...selectedInvestor, company: e.target.value })}
                      fullWidth
                    />
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Contribution Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Lifetime Contribution
                          </Typography>
                          <Typography variant="h6">
                            UGX {selectedInvestor ? calculateLifetimeTotal(selectedInvestor.id).toLocaleString() : '0'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Current Month
                          </Typography>
                          <Typography variant="h6">
                            UGX {(contributions[selectedMonth]?.[selectedInvestor?.id]?.amount || 0).toLocaleString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                  <Button onClick={() => setShowInvestorDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleUpdateInvestor}
                    disabled={!selectedInvestor?.name}
                  >
                    Save Changes
                  </Button>
                </DialogActions>
              </Dialog>

              {/* New Investor Dialog */}
              <Dialog
                open={showNewInvestorDialog}
                onClose={() => setShowNewInvestorDialog(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>
                  <Typography variant="h6">Add New Investor</Typography>
                </DialogTitle>
                <DialogContent>
                  <Stack spacing={3} sx={{ mt: 2 }}>
                    <TextField
                      label="Name"
                      value={newInvestor.name}
                      onChange={(e) => setNewInvestor({ ...newInvestor, name: e.target.value })}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Email"
                      type="email"
                      value={newInvestor.email}
                      onChange={(e) => setNewInvestor({ ...newInvestor, email: e.target.value })}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Company"
                      value={newInvestor.company}
                      onChange={(e) => setNewInvestor({ ...newInvestor, company: e.target.value })}
                      fullWidth
                      required
                    />
                  </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                  <Button onClick={() => setShowNewInvestorDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleAddInvestor}
                    disabled={!newInvestor.name || !newInvestor.email || !newInvestor.company}
                  >
                    Add Investor
                  </Button>
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

export default CapitalContributions;