import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Grid, 
  Button, 
  Box, 
  Chip, 
  InputAdornment, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Drawer,
  useMediaQuery,
  LinearProgress,
  Divider,
  Alert,
  Snackbar,
  styled,
  useTheme
} from '@mui/material';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown, 
  Plus, 
  FileSpreadsheet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar, 
  ChevronsUpDown, 
  MoreVertical, 
  Clock,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { app } from '../firebase';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import { getAuth } from 'firebase/auth';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '& .MuiCardContent-root': {
    flexGrow: 1,
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const expenseTypes = [
  'Service Charge',
  'Withdraw Charges',
  'Transport',
  'Transfer Fee',
  'Annual Debit Card Fee',
  'Withholding Tax',
  'Airtime and Data'
];

const MySwal = withReactContent(Swal);

const LedgerPage = () => {
  // State Management
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [newEntry, setNewEntry] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    type: 'revenue',
    reference: '',
    notes: '',
    status: 'pending',
    bankInterest: '',
    serviceCharge: '',
    withdrawCharges: '',
    transport: '',
    transferFee: '',
    annualDebitCardFee: '',
    withholdingTax: '',
    airtimeAndData: ''
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [creatingEntry, setCreatingEntry] = useState(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState(expenseTypes[0]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const formatNumberWithCommas = (number) => {
    if (!number) return '';
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleBankInterestChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    setNewEntry({ ...newEntry, bankInterest: value });
   
  };

  const handleServiceChargeChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    setNewEntry({ ...newEntry, serviceCharge: value });
  };

  const handleWithdrawChargesChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    setNewEntry({ ...newEntry, withdrawCharges: value });
  };

  const handleTransportChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    setNewEntry({ ...newEntry, transport: value });
  };

  const handleTransferFeeChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    setNewEntry({ ...newEntry, transferFee: value });
  };

  const handleAnnualDebitCardFeeChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    setNewEntry({ ...newEntry, annualDebitCardFee: value });
  };

  const handleWithholdingTaxChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    setNewEntry({ ...newEntry, withholdingTax: value });
  };

  const handleAirtimeAndDataChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    setNewEntry({ ...newEntry, airtimeAndData: value });
  };

  const handleExpenseTypeChange = (e) => {
    setSelectedExpenseType(e.target.value);
   
  };

  const handleExpenseAmountChange = (e) => {
    const value = e.target.value.replace(/,/g, '');
    const key = selectedExpenseType.replace(/ /g, '').toLowerCase();
    setNewEntry((prevEntry) => ({
      ...prevEntry,
      [key]: value
    }));
   
  };

  // Fetch entries from Firestore
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const db = getFirestore(app);
      const revenueSnapshot = await getDocs(collection(db, 'revenue'));
      const expensesSnapshot = await getDocs(collection(db, 'expenses'));
      const revenueData = revenueSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'revenue'
      }));
      const expensesData = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: 'expenses'
      }));
      setEntries([...revenueData, ...expensesData]);
    } catch (err) {
      console.error('Error fetching entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const logTransaction = async (type, content) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const transactionLog = {
      user: user ? user.email : 'anonymous',
      timestamp: new Date().toISOString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      time: new Date().toLocaleTimeString(),
      type,
      content
    };
    const db = getFirestore(app);
    await addDoc(collection(db, 'transactionLogs'), transactionLog);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Computed Values
  const totalBalance = entries.reduce((acc, curr) => {
    return curr.type === 'revenue' ? acc + (curr.bankInterest || 0) : acc - (curr.bankInterest || 0);
  }, 0);

  const monthlyTransactions = entries.length;
  const pendingEntries = entries.filter(e => e.status === 'pending').length;

  // Filter entries based on search and status
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Chart data preparation
  const chartData = entries
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(entry => ({
      date: format(new Date(entry.date), 'MMM dd'),
      balance: entry.balance
    }));

  // Handlers
  const handleMenuOpen = (event, entry) => {
    setAnchorEl(event.currentTarget);
    setSelectedEntry(entry);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNewEntry = async () => {
    setCreatingEntry(true);
    const entry = {
      ...newEntry,
      bankInterest: Number(newEntry.bankInterest) || 0,
      serviceCharge: Number(newEntry.servicecharge) || 0,
      withdrawCharges: Number(newEntry.withdrawcharges) || 0,
      transport: Number(newEntry.transport) || 0,
      transferFee: Number(newEntry.transferfee) || 0,
      annualDebitCardFee: Number(newEntry.annualdebitcardfee) || 0,
      withholdingTax: Number(newEntry.withholdingtax) || 0,
      airtimeAndData: Number(newEntry.airtimeanddata) || 0
    };
  
    try {
      const db = getFirestore(app);
      const collectionName = newEntry.type === 'revenue' ? 'revenue' : 'expenses';
      await addDoc(collection(db, collectionName), entry);
      setEntries([entry, ...entries]);

      // Log the transaction
      await logTransaction('add', entry);

      setShowNewEntryDialog(false);
      setNewEntry({
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        type: 'revenue',
        reference: '',
        notes: '',
        status: 'pending',
        bankInterest: '',
        serviceCharge: '',
        withdrawCharges: '',
        transport: '',
        transferFee: '',
        annualDebitCardFee: '',
        withholdingTax: '',
        airtimeAndData: ''
      });
      setSnackbarMessage('Entry added successfully');
    } catch (err) {
      console.error('Error adding new entry:', err);
      setSnackbarMessage('Error adding new entry');
    } finally {
      setCreatingEntry(false);
      setSnackbarOpen(true);
    }
  };

  const handleDeleteEntry = async (entry) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
  
    if (result.isConfirmed) {
      try {
        const db = getFirestore(app);
        const collectionName = entry.type === 'revenue' ? 'revenue' : 'expenses';
        await deleteDoc(doc(db, collectionName, entry.id));
        setEntries(entries.filter(e => e.id !== entry.id));
  
        // Log the transaction
        await logTransaction('delete', entry);
  
        setSnackbarMessage('Entry deleted successfully');
        MySwal.fire(
          'Deleted!',
          'Your entry has been deleted.',
          'success'
        );
      } catch (err) {
        console.error('Error deleting entry:', err);
        setSnackbarMessage('Error deleting entry');
        MySwal.fire(
          'Error!',
          'There was an error deleting your entry.',
          'error'
        );
      } finally {
        setSnackbarOpen(true);
      }
    }
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Description', 'Reference', 'Type', 'Bank Interest', 'Service Charge', 'Withdraw Charges', 'Transport', 'Transfer Fee', 'Annual Debit Card Fee', 'Withholding Tax', 'Airtime and Data', 'Status'],
      ...entries.map(entry => [
        entry.date,
        entry.description,
        entry.reference,
        entry.type,
        entry.bankInterest,
        entry.serviceCharge,
        entry.withdrawCharges,
        entry.transport,
        entry.transferFee,
        entry.annualDebitCardFee,
        entry.withholdingTax,
        entry.airtimeAndData,
        entry.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Components
  const StatusChip = ({ status }) => {
    const colors = {
      completed: 'success',
      pending: 'warning',
      failed: 'error'
    };
    
    return (
      <Chip 
        label={status} 
        color={colors[status]} 
        size="small"
        variant="outlined"
      />
    );
  };

  const SummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={4}>
        <StyledCard>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Balance
                </Typography>
                <Typography variant="h4" component="div">
                  UGX {totalBalance.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <ArrowUpCircle size={16} color="green" />
                  <Typography variant="body2" color="success.main" sx={{ ml: 1 }}>
                    +12.5% from last month
                  </Typography>
                </Box>
              </Box>
              <IconWrapper sx={{ bgcolor: 'primary.light' }}>
                <FileSpreadsheet size={24} color={theme.palette.primary.main} />
              </IconWrapper>
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <StyledCard>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Monthly Transactions
                </Typography>
                <Typography variant="h4" component="div">
                  {monthlyTransactions}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Calendar size={16} color={theme.palette.info.main} />
                  <Typography variant="body2" color="info.main" sx={{ ml: 1 }}>
                    Average {Math.round(monthlyTransactions / 30)} per day
                  </Typography>
                </Box>
              </Box>
              <IconWrapper sx={{ bgcolor: 'info.light' }}>
                <Calendar size={24} color={theme.palette.info.main} />
              </IconWrapper>
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <StyledCard>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Pending Entries
                </Typography>
                <Typography variant="h4" component="div">
                  {pendingEntries}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Clock size={16} color={theme.palette.warning.main} />
                  <Typography variant="body2" color="warning.main" sx={{ ml: 1 }}>
                    Requires attention
                  </Typography>
                </Box>
              </Box>
              <IconWrapper sx={{ bgcolor: 'warning.light' }}>
                <Clock size={24} color={theme.palette.warning.main} />
              </IconWrapper>
            </Box>
          </CardContent>
        </StyledCard>
      </Grid>
    </Grid>
  );

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
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Ledger
            </Typography>
            <Typography color="textSecondary">
              Track and manage all financial records
            </Typography>
          </Box>

          {/* Summary Cards */}
          <SummaryCards />

          {/* Controls */}
          <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status Filter"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => setShowNewEntryDialog(true)}
            >
              New Entry
            </Button>

            <Button
              variant="outlined"
              startIcon={<Download size={20} />}
              onClick={handleExport}
            >
              Export
            </Button>
          </Box>

          {/* Tabs */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Table View" />
              <Tab label="Chart View" />
            </Tabs>

            {/* Table View */}
            <Box hidden={activeTab !== 0}>
              {activeTab === 0 && (
                <Paper sx={{ mt: 3 }}>
                  {loading && <LinearProgress />}
                  <Box sx={{ overflowX: 'auto' }}>
                    <Box sx={{ minWidth: 800, p: 2 }}>
                      {filteredEntries.map((entry) => (
                        <Box
                          key={entry.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            borderBottom: 1,
                            borderColor: 'divider',
                            '&:last-child': {
                              borderBottom: 0
                            },
                            '&:hover': {
                              bgcolor: 'action.hover'
                            }
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2">
                              {format(new Date(entry.date), 'MMM dd, yyyy')}
                            </Typography>
                            <Typography color="textSecondary" variant="body2">
                              {entry.reference}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ flex: 2 }}>
                            <Typography>{entry.description}</Typography>
                          </Box>
                          
                          <Box sx={{ flex: 1, textAlign: 'right' }}>
                            <Typography
                              color={entry.type === 'revenue' ? 'success.main' : 'error.main'}
                            >
                              {entry.type === 'revenue' ? '+' : '-'} UGX {(entry.bankInterest || 0).toLocaleString()}
                            </Typography>
                            {entry.type === 'expenses' && (
                              <>
                                <Typography color="textSecondary" variant="body2">
                                  Service Charge: UGX {(entry.serviceCharge || 0).toLocaleString()}
                                </Typography>
                                <Typography color="textSecondary" variant="body2">
                                  Withdraw Charges: UGX {(entry.withdrawCharges || 0).toLocaleString()}
                                </Typography>
                                <Typography color="textSecondary" variant="body2">
                                  Transport: UGX {(entry.transport || 0).toLocaleString()}
                                </Typography>
                                <Typography color="textSecondary" variant="body2">
                                  Transfer Fee: UGX {(entry.transferFee || 0).toLocaleString()}
                                </Typography>
                                <Typography color="textSecondary" variant="body2">
                                  Annual Debit Card Fee: UGX {(entry.annualDebitCardFee || 0).toLocaleString()}
                                </Typography>
                                <Typography color="textSecondary" variant="body2">
                                  Withholding Tax: UGX {(entry.withholdingTax || 0).toLocaleString()}
                                </Typography>
                                <Typography color="textSecondary" variant="body2">
                                  Airtime and Data: UGX {(entry.airtimeAndData || 0).toLocaleString()}
                                </Typography>
                              </>
                            )}
                          </Box>
                          
                          <Box sx={{ width: 100, textAlign: 'center', mx: 2 }}>
                            <StatusChip status={entry.status} />
                          </Box>
                          
                          <Box>
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, entry)}
                            >
                              <MoreVertical size={20} />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              )}
            </Box>

            {/* Chart View */}
            <Box hidden={activeTab !== 1}>
              {activeTab === 1 && (
                <Paper sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Balance Trend
                  </Typography>
                  <Box sx={{ height: 400, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`UGX ${value.toLocaleString()}`, 'Balance']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="balance" 
                          stroke={theme.palette.primary.main}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              )}
            </Box>
          </Box>

          {/* Entry Details Dialog */}
          <Dialog 
            open={showEntryDialog} 
            onClose={() => setShowEntryDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Entry Details</DialogTitle>
            <DialogContent dividers>
              {selectedEntry && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" gutterBottom>
                      Date
                    </Typography>
                    <Typography>
                      {format(new Date(selectedEntry.date), 'PPP')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" gutterBottom>
                      Reference
                    </Typography>
                    <Typography>{selectedEntry.reference}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography color="textSecondary" gutterBottom>
                      Description
                    </Typography>
                    <Typography>{selectedEntry.description}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" gutterBottom>
                      {selectedEntry.type === 'expenses' ? 'Bank Interest' : 'Amount'}
                    </Typography>
                    <Typography color={selectedEntry.type === 'revenue' ? 'success.main' : 'error.main'}>
                      {selectedEntry.type === 'revenue' ? '+' : '-'} UGX {(selectedEntry.bankInterest || 0).toLocaleString()}
                    </Typography>
                    {selectedEntry.type === 'expenses' && (
                      <>
                        <Typography color="textSecondary" variant="body2">
                          Service Charge: UGX {(selectedEntry.serviceCharge || 0).toLocaleString()}
                        </Typography>
                        <Typography color="textSecondary" variant="body2">
                          Withdraw Charges: UGX {(selectedEntry.withdrawCharges || 0).toLocaleString()}
                        </Typography>
                        <Typography color="textSecondary" variant="body2">
                          Transport: UGX {(selectedEntry.transport || 0).toLocaleString()}
                        </Typography>
                        <Typography color="textSecondary" variant="body2">
                          Transfer Fee: UGX {(selectedEntry.transferFee || 0).toLocaleString()}
                        </Typography>
                        <Typography color="textSecondary" variant="body2">
                          Annual Debit Card Fee: UGX {(selectedEntry.annualDebitCardFee || 0).toLocaleString()}
                        </Typography>
                        <Typography color="textSecondary" variant="body2">
                          Withholding Tax: UGX {(selectedEntry.withholdingTax || 0).toLocaleString()}
                        </Typography>
                        <Typography color="textSecondary" variant="body2">
                          Airtime and Data: UGX {(selectedEntry.airtimeAndData || 0).toLocaleString()}
                        </Typography>
                      </>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="textSecondary" gutterBottom>
                      Status
                    </Typography>
                    <StatusChip status={selectedEntry.status} />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography color="textSecondary" gutterBottom>
                      Notes
                    </Typography>
                    <Typography>{selectedEntry.notes || 'No notes provided'}</Typography>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowEntryDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* New Entry Dialog */}
          <Dialog
            open={showNewEntryDialog}
            onClose={() => setShowNewEntryDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>New Entry</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={newEntry.type}
                      label="Type"
                      onChange={(e) => setNewEntry({...newEntry, type: e.target.value})}
                    >
                      <MenuItem value="revenue">Revenue</MenuItem>
                      <MenuItem value="expenses">Expenses</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {newEntry.type === 'revenue' && (
                  <Grid item xs={12}>
                    <TextField
                      label="Bank Interest"
                      value={formatNumberWithCommas(newEntry.bankInterest)}
                      onChange={handleBankInterestChange}
                      fullWidth
                      type="text"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">UGX</InputAdornment>,
                        inputProps: { min: 0, step: 0.01 }
                      }}
                    />
                  </Grid>
                )}
                {newEntry.type === 'expenses' && (
                  <>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Expense Type</InputLabel>
                        <Select
                          value={selectedExpenseType}
                          label="Expense Type"
                          onChange={handleExpenseTypeChange}
                        >
                          {expenseTypes.map((type) => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label={selectedExpenseType}
                        value={formatNumberWithCommas(newEntry[selectedExpenseType.replace(/ /g, '').toLowerCase()])}
                        onChange={handleExpenseAmountChange}
                        fullWidth
                        type="text"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">UGX</InputAdornment>,
                          inputProps: { min: 0, step: 0.01 }
                        }}
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Reference"
                    value={newEntry.reference}
                    onChange={(e) => setNewEntry({...newEntry, reference: e.target.value})}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Notes"
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    fullWidth
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowNewEntryDialog(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handleNewEntry}
                disabled={creatingEntry || !newEntry.description || (newEntry.type === 'revenue' && !newEntry.bankInterest) || (newEntry.type === 'expenses' && !newEntry[selectedExpenseType.replace(/ /g, '').toLowerCase()])}
              >
                {creatingEntry ? 'Creating...' : 'Add Entry'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Action Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => {
              setShowEntryDialog(true);
              handleMenuClose();
            }}>
              <Eye size={16} style={{ marginRight: 8 }} />
              View Details
            </MenuItem>
            <MenuItem 
              onClick={() => {
                handleDeleteEntry(selectedEntry);
                handleMenuClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Trash2 size={16} style={{ marginRight: 8 }} />
              Delete Entry
            </MenuItem>
          </Menu>

          {/* Snackbar */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            message={snackbarMessage}
          />
        </main>
      </div>
    </div>
  );
};

export default LedgerPage;