import React, { useState, useEffect } from 'react';
import {  Card, CardContent, Typography, TextField, Grid,
  Button, Box, Chip, InputAdornment, Paper, useTheme, Dialog,
  DialogTitle, DialogContent, DialogActions, Tabs, Tab, IconButton,
  Drawer, useMediaQuery, LinearProgress, Divider,
  Alert, styled,CardHeader,} from '@mui/material';
import {
  Search,
  Filter as FilterList,
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
  
} from 'lucide-react';
import { format } from 'date-fns';

const LedgerPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    type: 'all',
    status: 'all',
    amount: 'all'
  });

  // Sample data - Replace with your actual data fetching logic
  const sampleData = [
    {
      id: 1,
      date: '2024-01-15',
      type: 'debit',
      description: 'Loan Disbursement - John Doe',
      amount: 5000000,
      balance: 5000000,
      reference: 'LD-2024-001',
      status: 'completed',
      category: 'loan',
      notes: 'First time borrower'
    },
    // Add more sample entries...
  ];

  useEffect(() => {
    // Simulating data fetch
    setLoading(true);
    setTimeout(() => {
      setEntries(sampleData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Implement search logic
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // Implement date filtering
  };

  const handleFilterChange = (newFilters) => {
    setFilterOptions(newFilters);
    // Implement filtering
  };

  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
    setShowEntryDialog(true);
  };

  const handleExport = () => {
    // Implement export logic
  };

  const LedgerSummaryCards = () => (
    <Grid container spacing={4} className="mb-6">
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <Typography className="text-sm font-medium text-gray-500">
                Total Balance
              </Typography>
              <Typography className="text-2xl font-bold mt-1">
                UGX 45,678,900
              </Typography>
              <div className="flex items-center mt-2">
                <ArrowUpCircle className="w-4 h-4 text-green-500 mr-1" />
                <Typography className="text-sm text-green-500">
                  +12.5% from last month
                </Typography>
              </div>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <Typography className="text-sm font-medium text-gray-500">
                Monthly Transactions
              </Typography>
              <Typography className="text-2xl font-bold mt-1">
                1,234
              </Typography>
              <div className="flex items-center mt-2">
                <ChevronsUpDown className="w-4 h-4 text-blue-500 mr-1" />
                <Typography className="text-sm text-blue-500">
                  Average 41 per day
                </Typography>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <Typography className="text-sm font-medium text-gray-500">
                Pending Entries
              </Typography>
              <Typography className="text-2xl font-bold mt-1">
                23
              </Typography>
              <div className="flex items-center mt-2">
                <ArrowDownCircle className="w-4 h-4 text-orange-500 mr-1" />
                <Typography className="text-sm text-orange-500">
                  5 require attention
                </Typography>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const LedgerTable = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-6">
        <Typography variant="h5">Ledger Entries</Typography>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Description</th>
                <th className="text-left p-4">Reference</th>
                <th className="text-right p-4">Debit</th>
                <th className="text-right p-4">Credit</th>
                <th className="text-right p-4">Balance</th>
                <th className="text-center p-4">Status</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr 
                  key={entry.id} 
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEntryClick(entry)}
                >
                  <td className="p-4">{format(new Date(entry.date), 'dd MMM yyyy')}</td>
                  <td className="p-4">{entry.description}</td>
                  <td className="p-4">{entry.reference}</td>
                  <td className="text-right p-4">
                    {entry.type === 'debit' ? `UGX ${entry.amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="text-right p-4">
                    {entry.type === 'credit' ? `UGX ${entry.amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="text-right p-4">UGX {entry.balance.toLocaleString()}</td>
                  <td className="p-4">
                    <Chip
                      variant="small"
                      className={
                        entry.status === 'completed' ? 'bg-green-100 text-green-800' :
                        entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {entry.status}
                    </Chip>
                  </td>
                  <td className="p-4">
                    <IconButton>
                      <MoreVertical className="w-4 h-4" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Typography variant="h4" className="mb-2">Ledger</Typography>
        <Typography className="text-gray-500">
          Track and manage all financial records
        </Typography>
      </div>

      <LedgerSummaryCards />

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <TextField
          placeholder="Search entries..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full md:w-96"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search className="w-4 h-4" />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="outline" className="whitespace-nowrap">
          <FilterList className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <LedgerTable />

      {/* Entry Detail Dialog */}
      <Dialog 
        open={showEntryDialog} 
        onClose={() => setShowEntryDialog(false)}
      >
        <DialogTitle>Entry Details</DialogTitle>
        <DialogContent>
          {selectedEntry && (
            <div className="space-y-4">
              <div>
                <Typography className="text-sm text-gray-500">Date</Typography>
                <Typography>{format(new Date(selectedEntry.date), 'PPP')}</Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500">Description</Typography>
                <Typography>{selectedEntry.description}</Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500">Amount</Typography>
                <Typography>UGX {selectedEntry.amount.toLocaleString()}</Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500">Reference</Typography>
                <Typography>{selectedEntry.reference}</Typography>
              </div>
              <div>
                <Typography className="text-sm text-gray-500">Notes</Typography>
                <Typography>{selectedEntry.notes}</Typography>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={() => setShowEntryDialog(false)}>
            Close
          </Button>
          <Button>Edit Entry</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LedgerPage;