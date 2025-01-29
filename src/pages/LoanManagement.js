import React, { useState, useEffect } from 'react';
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
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { app } from '../firebase'; // Adjust the path as necessary

const db = getFirestore(app);

const LoanManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Utility functions
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX'
    }).format(amount);
  };

  const getCurrentMonth = () => {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  };

  // Loan management functions
  const createLoan = async (loanData) => {
    const newLoan = {
      ...loanData,
      loanId: generateId(),
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + (loanData.durationMonths * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      status: 'active'
    };

    try {
      const docRef = await addDoc(collection(db, 'loans'), newLoan);
      setLoans(prevLoans => [...prevLoans, { ...newLoan, id: docRef.id }]);
      createDebtor(newLoan, docRef.id); // Create debtor after adding loan
      setSnackbarMessage('Loan added successfully');
    } catch (error) {
      console.error('Error adding loan:', error);
      setSnackbarMessage('Error adding loan');
    }
  };

  const createDebtor = (loanData, loanId) => {
    const currentDate = new Date().toISOString().split('T')[0];
    const newDebtor = {
      loanId: loanId,
      customerName: loanData.customerName,
      monthlyRecords: [{
        id: 0,
        date: currentDate,
        month: getCurrentMonth(),
        openingPrinciple: 0,
        principleAdvance: Number(loanData.amount),
        principlePaid: 0,
        outstandingPrinciple: Number(loanData.amount),
        openingInterest: 0,
        interestCharge: Number(loanData.interestAmount),
        intrestPaid: 0,
        outstandingInterest: Number(loanData.interestAmount)
      }],
      currentOpeningPrincipal: Number(loanData.amount),
      totalPrincipalPaid: 0,
      currentOpeningInterest: Number(loanData.interestAmount),
      totalInterestPaid: 0,
      status: 'active'
    };

    addDoc(collection(db, 'debtors'), newDebtor)
      .then(() => console.log('Debtor created successfully'))
      .catch((error) => console.error('Error creating debtor:', error));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        const loanDoc = doc(db, 'loans', currentLoanId);
        await updateDoc(loanDoc, formData);
        setLoans(loans.map(loan => loan.id === currentLoanId ? { ...loan, ...formData } : loan));
        setSnackbarMessage('Loan updated successfully');
      } else {
        await createLoan(formData); // Create new loan
      }
      resetForm();
    } catch (error) {
      console.error('Error processing request:', error);
      setSnackbarMessage('Error processing request');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const fetchLoans = async () => {
    const querySnapshot = await getDocs(collection(db, 'loans'));
    const loansData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setLoans(loansData);
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const resetForm = () => {
    setFormData({
      customerName: '',
      phoneNumber: '',
      loanType: 'Personal',
      amount: '',
      interestAmount: '',
      durationMonths: '',
      status: 'Active',
    });
    setIsEditing(false);
    setCurrentLoanId(null);
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

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4">
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
              <Box marginTop={2} display="flex" alignItems="center">
                <Button variant="contained" color="primary" type="submit" disabled={loading}>
                  {isEditing ? 'Update Loan' : 'Register Loan'}
                </Button>
                {loading && <CircularProgress size={24} sx={{ ml: 2 }} />}
              </Box>
            </form>
          </Paper>

          {/* Recent Loans Table */}
          <Paper elevation={3} className="p-4">
            <Typography variant="h6" className="mb-4">Recent Loans</Typography>
            <Box className="overflow-x-auto">
              <Table className="min-w-full bg-white" size="small">
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
                  {loans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>{loan.customerName}</TableCell>
                      <TableCell>{loan.loanType}</TableCell>
                      <TableCell>{formatCurrency(loan.amount)}</TableCell>
                      <TableCell>{formatCurrency(loan.interestAmount)}</TableCell>
                      <TableCell>{new Date(loan.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(loan.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{loan.status}</TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" onClick={() => handleEdit(loan)}>Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            {loans.length === 0 && (
              <Box className="text-center py-8 text-gray-500">No loans registered yet</Box>
            )}
          </Paper>
        </main>
      </div>

      {/* Snackbar for feedback messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </div>
  );
};

export default LoanManagement;