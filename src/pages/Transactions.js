import React, { useState, useEffect } from 'react';
import {  Card, CardContent, Typography, TextField, Grid,
  Button, Box, Chip, InputAdornment, Paper, useTheme, Dialog,
  DialogTitle, DialogContent, DialogActions, Tabs, Tab, IconButton,
  Drawer, useMediaQuery, LinearProgress, Divider,
  Alert, styled,CardHeader } from '@mui/material';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  Users,
  Calendar,
  Check,
  X,
  MoreVertical,
  FileText,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewTransactionDialog, setShowNewTransactionDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    date: 'all'
  });

  // Sample data - Replace with your actual data fetching logic
  const sampleTransactions = [
    {
      id: 1,
      date: '2024-01-29',
      type: 'disbursement',
      amount: 2500000,
      client: 'John Doe',
      status: 'completed',
      reference: 'TRX-2024-001',
      description: 'Loan disbursement',
      paymentMethod: 'Bank Transfer',
      accountNumber: '1234567890',
      bank: 'Stanbic Bank',
      notes: 'First disbursement for business expansion'
    },
    // Add more sample transactions...
  ];

  useEffect(() => {
    // Simulating data fetch
    setLoading(true);
    setTimeout(() => {
      setTransactions(sampleTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  const TransactionSummaryCards = () => (
    <Grid container spacing={4} className="mb-6">
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <Typography className="text-sm font-medium text-gray-500">
                Today's Transactions
              </Typography>
              <Typography className="text-2xl font-bold mt-1">
                UGX 12,345,678
              </Typography>
              <div className="flex items-center mt-2">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <Typography className="text-sm text-green-500">
                  +8.2% from yesterday
                </Typography>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <Typography className="text-sm font-medium text-gray-500">
                Active Clients
              </Typography>
              <Typography className="text-2xl font-bold mt-1">
                847
              </Typography>
              <div className="flex items-center mt-2">
                <Users className="w-4 h-4 text-blue-500 mr-1" />
                <Typography className="text-sm text-blue-500">
                  +12 new this week
                </Typography>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <Typography className="text-sm font-medium text-gray-500">
                Pending Approvals
              </Typography>
              <Typography className="text-2xl font-bold mt-1">
                15
              </Typography>
              <div className="flex items-center mt-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
                <Typography className="text-sm text-yellow-500">
                  3 high priority
                </Typography>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <Typography className="text-sm font-medium text-gray-500">
                Failed Transactions
              </Typography>
              <Typography className="text-2xl font-bold mt-1">
                2
              </Typography>
              <div className="flex items-center mt-2">
                <X className="w-4 h-4 text-red-500 mr-1" />
                <Typography className="text-sm text-red-500">
                  Needs attention
                </Typography>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const NewTransactionDialog = () => {
    const [formData, setFormData] = useState({
      type: '',
      amount: '',
      client: '',
      description: '',
      paymentMethod: '',
      accountNumber: '',
      bank: '',
      notes: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      // Implement transaction creation logic
      setShowNewTransactionDialog(false);
    };

    return (
      <Dialog 
        open={showNewTransactionDialog} 
        onClose={() => setShowNewTransactionDialog(false)}
        className="w-full max-w-md"
      >
        <DialogTitle>New Transaction</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Typography className="text-sm font-medium mb-1">Type</Typography>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="">Select type</option>
                <option value="disbursement">Disbursement</option>
                <option value="repayment">Repayment</option>
                <option value="fee">Fee</option>
              </select>
            </div>

            <div>
              <Typography className="text-sm font-medium mb-1">Amount</Typography>
              <TextField
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full"
                InputProps={{
                  startAdornment: <InputAdornment position="start">UGX</InputAdornment>,
                }}
              />
            </div>

            <div>
              <Typography className="text-sm font-medium mb-1">Client</Typography>
              <TextField
                placeholder="Select client"
                value={formData.client}
                onChange={(e) => setFormData({...formData, client: e.target.value})}
                className="w-full"
              />
            </div>

            <div>
              <Typography className="text-sm font-medium mb-1">Payment Method</Typography>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              >
                <option value="">Select method</option>
                <option value="bank">Bank Transfer</option>
                <option value="mobile">Mobile Money</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div>
              <Typography className="text-sm font-medium mb-1">Description</Typography>
              <TextField
                multiline
                rows={2}
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full"
              />
            </div>
          </form>
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={() => setShowNewTransactionDialog(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Create Transaction
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const TransactionDetailDialog = () => {
    if (!selectedTransaction) return null;

    return (
      <Dialog 
        open={showDetailDialog} 
        onClose={() => setShowDetailDialog(false)}
      >
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Typography variant="h6">
                UGX {selectedTransaction.amount.toLocaleString()}
              </Typography>
              <Chip
                variant="small"
                className={
                  selectedTransaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                  selectedTransaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }
              >
                {selectedTransaction.status}
              </Chip>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography className="text-sm text-gray-500">Date</Typography>
                <Typography>{format(new Date(selectedTransaction.date), 'PPP')}</Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500">Reference</Typography>
                <Typography>{selectedTransaction.reference}</Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500">Client</Typography>
                <Typography>{selectedTransaction.client}</Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500">Type</Typography>
                <Typography className="capitalize">{selectedTransaction.type}</Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500">Payment Method</Typography>
                <Typography>{selectedTransaction.paymentMethod}</Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500">Bank</Typography>
                <Typography>{selectedTransaction.bank}</Typography>
              </div>
            </div>

            <div>
              <Typography className="text-sm text-gray-500">Description</Typography>
              <Typography>{selectedTransaction.description}</Typography>
            </div>

            <div>
              <Typography className="text-sm text-gray-500">Notes</Typography>
              <Typography>{selectedTransaction.notes}</Typography>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
            Close
          </Button>
          {selectedTransaction.status === 'pending' && (
            <Button variant="contained" color="success" startIcon={<Check />}>
              Approve
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Typography variant="h4" className="mb-2">Transactions</Typography>
        <Typography className="text-gray-500">
          Manage and track all financial transactions
        </Typography>
      </div>

      <TransactionSummaryCards />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <TextField
              placeholder="Search transactions..."
              className="w-80"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="w-4 h-4" />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="outline" startIcon={<Filter />}>
              Filter
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" startIcon={<Download />}>
              Export
            </Button>
            <Button onClick={() => setShowNewTransactionDialog(true)} startIcon={<Plus />}>
              New Transaction
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Add transaction table implementation here */}
          {/* Similar to the ledger table but with transaction-specific columns */}
        </CardContent>
      </Card>

      <NewTransactionDialog />
      <TransactionDetailDialog />
    </div>
  );
};

export default TransactionsPage;