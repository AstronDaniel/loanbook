import React, { useState, useEffect } from 'react';
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
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { app } from '../firebase';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [newEntry, setNewEntry] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    type: 'debit',
    amount: '',
    reference: '',
    notes: '',
    status: 'pending'
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Fetch entries from Firestore
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const db = getFirestore(app);
      const entriesSnapshot = await getDocs(collection(db, 'ledgerEntries'));
      const entriesData = entriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEntries(entriesData);
    } catch (err) {
      console.error('Error fetching entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Computed Values
  const totalBalance = entries.reduce((acc, curr) => {
    return curr.type === 'credit' ? acc + curr.amount : acc - curr.amount;
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
    const entry = {
      ...newEntry,
      amount: Number(newEntry.amount),
      balance: totalBalance + (newEntry.type === 'credit' ? Number(newEntry.amount) : -Number(newEntry.amount))
    };
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, 'ledgerEntries'), entry);
      setEntries([entry, ...entries]);
      setShowNewEntryDialog(false);
      setNewEntry({
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        type: 'debit',
        amount: '',
        reference: '',
        notes: '',
        status: 'pending'
      });
    } catch (err) {
      console.error('Error adding new entry:', err);
    }
  };

  const handleDeleteEntry = async () => {
    try {
      const db = getFirestore(app);
      await deleteDoc(doc(db, 'ledgerEntries', entryToDelete.id));
      setEntries(entries.filter(entry => entry.id !== entryToDelete.id));
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Description', 'Reference', 'Type', 'Amount', 'Balance', 'Status'],
      ...entries.map(entry => [
        entry.date,
        entry.description,
        entry.reference,
        entry.type,
        entry.amount,
        entry.balance,
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
                              color={entry.type === 'credit' ? 'success.main' : 'error.main'}
                            >
                              {entry.type === 'credit' ? '+' : '-'} UGX {entry.amount.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Balance: UGX {entry.balance.toLocaleString()}
                            </Typography>
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
                      Amount
                    </Typography>
                    <Typography color={selectedEntry.type === 'credit' ? 'success.main' : 'error.main'}>
                      {selectedEntry.type === 'credit' ? '+' : '-'} UGX {selectedEntry.amount.toLocaleString()}
                    </Typography>
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
                      <MenuItem value="debit">Debit</MenuItem>
                      <MenuItem value="credit">Credit</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Amount"
                    type="number"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({...newEntry, amount: e.target.value})}
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">UGX</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                disabled={!newEntry.description || !newEntry.amount}
              >
                Add Entry
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>Delete Entry</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this entry? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button 
                color="error" 
                onClick={handleDeleteEntry}
              >
                Delete
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
            <MenuItem onClick={handleMenuClose}>
              <Edit size={16} style={{ marginRight: 8 }} />
              Edit Entry
            </MenuItem>
            <MenuItem 
              onClick={() => {
                setEntryToDelete(selectedEntry);
                setDeleteDialogOpen(true);
                handleMenuClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Trash2 size={16} style={{ marginRight: 8 }} />
              Delete Entry
            </MenuItem>
          </Menu>
        </main>
      </div>
    </div>
  );
};

export default LedgerPage;