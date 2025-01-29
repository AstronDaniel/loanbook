import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Button, Table, TableBody, TableCell,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, LinearProgress, Chip, Snackbar,CircularProgress
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import { app } from '../firebase';

const db = getFirestore(app);

const DebtorsDashboard = () => {
  const [debtors, setDebtors] = useState([]);
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [newPayment, setNewPayment] = useState({ principal: '', interest: '' });
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Summary statistics calculation
  const summaryStats = {
    totalPrincipal: debtors.reduce((sum, d) => sum + d.currentOpeningPrincipal, 0),
    totalInterest: debtors.reduce((sum, d) => sum + d.currentOpeningInterest, 0),
    activeDebtors: debtors.filter(d => d.status === 'active').length,
    totalPaid: debtors.reduce((sum, d) => sum + d.totalPrincipalPaid + d.totalInterestPaid, 0)
  };

  const fetchDebtors = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'debtors'));
      const debtorsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDebtors(debtorsData);
    } catch (error) {
      console.error('Error fetching debtors:', error);
      setSnackbarMessage('Error fetching debtors data');
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    fetchDebtors();
  }, []);

  const handlePaymentSubmit = async () => {
    if (!selectedDebtor || (!newPayment.principal && !newPayment.interest)) return;

    try {
      setLoading(true);
      const debtorRef = doc(db, 'debtors', selectedDebtor.id);
      const lastRecord = selectedDebtor.monthlyRecords.slice(-1)[0];
      
      const newRecord = {
        id: selectedDebtor.monthlyRecords.length,
        date: new Date().toISOString().split('T')[0],
        month: `${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
        openingPrinciple: lastRecord.outstandingPrinciple,
        principleAdvance: 0,
        principlePaid: Number(newPayment.principal),
        outstandingPrinciple: lastRecord.outstandingPrinciple - Number(newPayment.principal),
        openingInterest: lastRecord.outstandingInterest,
        interestCharge: 0,
        intrestPaid: Number(newPayment.interest),
        outstandingInterest: lastRecord.outstandingInterest - Number(newPayment.interest)
      };

      const updatedDebtor = {
        ...selectedDebtor,
        monthlyRecords: [...selectedDebtor.monthlyRecords, newRecord],
        currentOpeningPrincipal: newRecord.outstandingPrinciple,
        currentOpeningInterest: newRecord.outstandingInterest,
        totalPrincipalPaid: selectedDebtor.totalPrincipalPaid + Number(newPayment.principal),
        totalInterestPaid: selectedDebtor.totalInterestPaid + Number(newPayment.interest)
      };

      await updateDoc(debtorRef, updatedDebtor);
      setDebtors(debtors.map(d => d.id === selectedDebtor.id ? updatedDebtor : d));
      setNewPayment({ principal: '', interest: '' });
      setSnackbarMessage('Payment recorded successfully');
    } catch (error) {
      console.error('Error recording payment:', error);
      setSnackbarMessage('Error recording payment');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">Total Principal</Typography>
                <Typography variant="h5">{summaryStats.totalPrincipal.toLocaleString()} UGX</Typography>
                <LinearProgress variant="determinate" value={100} sx={{ mt: 1 }} />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">Total Interest</Typography>
                <Typography variant="h5">{summaryStats.totalInterest.toLocaleString()} UGX</Typography>
                <LinearProgress variant="determinate" value={100} sx={{ mt: 1 }} />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">Active Debtors</Typography>
                <Typography variant="h5">{summaryStats.activeDebtors}</Typography>
                <LinearProgress variant="determinate" value={100} sx={{ mt: 1 }} />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">Total Paid</Typography>
                <Typography variant="h5">{summaryStats.totalPaid.toLocaleString()} UGX</Typography>
                <LinearProgress variant="determinate" value={100} sx={{ mt: 1 }} />
              </Paper>
            </Grid>
          </Grid>

          {/* Debtors List */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Debtors List</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Principal</TableCell>
                  <TableCell>Interest</TableCell>
                  <TableCell>Total Paid</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {debtors.map(debtor => (
                  <TableRow key={debtor.id}>
                    <TableCell>{debtor.customerName}</TableCell>
                    <TableCell>{debtor.currentOpeningPrincipal?.toLocaleString()} UGX</TableCell>
                    <TableCell>{debtor.currentOpeningInterest?.toLocaleString()} UGX</TableCell>
                    <TableCell>
                      {(debtor.totalPrincipalPaid + debtor.totalInterestPaid)?.toLocaleString()} UGX
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={debtor.status} 
                        color={debtor.status === 'active' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined"
                        onClick={() => setSelectedDebtor(debtor)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          {/* Debtor Details Dialog */}
          <Dialog 
            open={!!selectedDebtor} 
            onClose={() => setSelectedDebtor(null)}
            fullWidth
            maxWidth="md"
          >
            {selectedDebtor && (
              <>
                <DialogTitle>
                  {selectedDebtor.customerName}
                  <Chip 
                    label={selectedDebtor.status} 
                    color={selectedDebtor.status === 'active' ? 'success' : 'error'}
                    sx={{ ml: 2 }}
                  />
                </DialogTitle>
                <DialogContent dividers>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Record Payment</Typography>
                        <TextField
                          fullWidth
                          label="Principal Payment"
                          type="number"
                          value={newPayment.principal}
                          onChange={e => setNewPayment({ ...newPayment, principal: e.target.value })}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Interest Payment"
                          type="number"
                          value={newPayment.interest}
                          onChange={e => setNewPayment({ ...newPayment, interest: e.target.value })}
                          sx={{ mb: 2 }}
                        />
                        <Button 
                          variant="contained" 
                          fullWidth
                          onClick={handlePaymentSubmit}
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Submit Payment'}
                        </Button>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Payment History</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={selectedDebtor.monthlyRecords}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="outstandingPrinciple" 
                              stroke="#8884d8" 
                              name="Principal"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="outstandingInterest" 
                              stroke="#82ca9d" 
                              name="Interest"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Paper>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setSelectedDebtor(null)}>Close</Button>
                </DialogActions>
              </>
            )}
          </Dialog>

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

export default DebtorsDashboard;