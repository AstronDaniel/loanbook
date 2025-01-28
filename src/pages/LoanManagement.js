import React, { useState } from 'react';
import Sidebar from '../components/SideBar'; // Adjust the path as necessary
import Header from '../components/Header';   // Adjust the path as necessary
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Alert,
  AlertTitle,
} from '@mui/material';
import { PieChart, Pie, Cell } from 'recharts';
import { CalendarToday, CreditCard } from 'lucide-react';

const LoanManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('loans');
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    loanType: 'Personal',
    amount: '',
    interestAmount: '',
    durationMonths: '',
    status: 'Active',
  });
  const [loans, setLoans] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLoanId, setCurrentLoanId] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newLoan = {
      ...formData,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: calculateEndDate(formData.durationMonths),
    };
    setLoans([...loans, newLoan]);
    setFormData({
      customerName: '',
      phoneNumber: '',
      loanType: 'Personal',
      amount: '',
      interestAmount: '',
      durationMonths: '',
      status: 'Active',
    });
  };

  const calculateEndDate = (durationMonths) => {
    const date = new Date();
    date.setMonth(date.getMonth() + parseInt(durationMonths));
    return date.toISOString().split('T')[0];
  };

  const handleEdit = (loan) => {
    setFormData({
      customerName: loan.customerName,
      phoneNumber: loan.phoneNumber,
      loanType: loan.loanType,
      amount: loan.amount,
      interestAmount: loan.interestAmount,
      durationMonths: loan.durationMonths,
      status: loan.status,
    });
    setIsEditing(true);
    setCurrentLoanId(loan.id);
  };

  return (
    <div className="flex h-screen bg-gray-50">
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
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Loan Management Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {/* Loan Registration Form */}
          <Paper elevation={3} className="p-4 mb-4 bg-white">
            <Typography variant="h5">New Loan Registration</Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Customer Name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Select
                    fullWidth
                    value={formData.loanType}
                    onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                  >
                    <MenuItem value="Personal">Personal Loan</MenuItem>
                    <MenuItem value="Business">Business Loan</MenuItem>
                    <MenuItem value="Education">Education Loan</MenuItem>
                    <MenuItem value="Home">Home Loan</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Loan Amount (UGX)"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Interest Amount (UGX)"
                    type="number"
                    value={formData.interestAmount}
                    onChange={(e) => setFormData({ ...formData, interestAmount: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duration (Months)"
                    type="number"
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                    required
                  />
                </Grid>
              </Grid>
              <Box marginTop={2}>
                <Button variant="contained" color="primary" type="submit">
                  {isEditing ? 'Update Loan' : 'Register Loan'}
                </Button>
              </Box>
            </form>
          </Paper>

          {/* Recent Loans Table */}
          <Paper elevation={3} className="p-4">
            <Typography variant="h6" className="mb-4">Recent Loans</Typography>
            <Box className="overflow-x-auto">
              <Table 
                className="min-w-full bg-white"
                size="small" // Makes the table more compact
                sx={{
                  // Maintain table format on mobile with horizontal scroll
                  minWidth: 650,
                  '& th': {
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    padding: '12px 8px',
                  },
                  '& td': {
                    whiteSpace: 'nowrap',
                    padding: '8px',
                  }
                }}
              >
                <TableHead>
                  <TableRow sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }}>
                    <TableCell>Customer</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Interest</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loans.map((loan, index) => (
                    <TableRow key={index}>
                      <TableCell>{loan.customerName}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium" 
                              style={{
                                backgroundColor: loan.loanType === 'Personal' ? '#E3F2FD' : '#E8F5E9',
                                color: loan.loanType === 'Personal' ? '#1976D2' : '#2E7D32',
                              }}>
                          {loan.loanType}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('en-UG', {
                          style: 'currency',
                          currency: 'UGX'
                        }).format(loan.amount)}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('en-UG', {
                          style: 'currency',
                          currency: 'UGX'
                        }).format(loan.interestAmount)}
                      </TableCell>
                      <TableCell>{new Date(loan.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(calculateEndDate(loan.durationMonths)).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          loan.status === 'Active' 
                            ? 'bg-green-100 text-green-800'
                            : loan.status === 'Late'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {loan.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="small" 
                            variant="outlined" 
                            onClick={() => handleEdit(loan)}
                            sx={{ minWidth: 'auto', padding: '4px 8px' }}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="small" 
                            variant="contained" 
                            color="error"
                            sx={{ minWidth: 'auto', padding: '4px 8px' }}
                          >
                            Del
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            {loans.length === 0 && (
              <Box className="text-center py-8 text-gray-500">
                No loans registered yet
              </Box>
            )}
          </Paper>
        </main>
      </div>
    </div>
  );
};

export default LoanManagement;