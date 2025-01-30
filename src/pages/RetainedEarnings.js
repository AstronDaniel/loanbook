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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Edit, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import Sidebar from '../components/SideBar'; // Adjust the path as necessary
import Header from '../components/Header';   // Adjust the path as necessary
import { retainedEarningsService } from '../services/localStorage/retainedEarningService';

const RetainedEarnings = () => {
  const [date, setDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MMM'));
  const [retainedEarningsData, setRetainedEarningsData] = useState({});
  const [editingMonth, setEditingMonth] = useState(null);
  const [newEarnings, setNewEarnings] = useState("");
  const [newDistributions, setNewDistributions] = useState("");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    retainedEarningsService.initializeData();
    const data = retainedEarningsService.getData();
    setRetainedEarningsData(data);
  }, []);

  const yearData = retainedEarningsData[selectedYear] || { monthlyData: {} };

  const calculateYearlyTotals = () => {
    return Object.values(yearData.monthlyData).reduce((totals, month) => ({
      totalDistributions: totals.totalDistributions + Object.values(month.distributions || {}).reduce((a, b) => a + b, 0),
      totalEarnings: totals.totalEarnings + (month.earnings || 0),
      netRetained: totals.netRetained + (month.retainedEarnings || 0)
    }), { totalDistributions: 0, totalEarnings: 0, netRetained: 0 });
  };

  const calculateInvestorTotals = (investorId) => {
    return Object.values(yearData.monthlyData).reduce((totals, month) => ({
      totalDistributions: totals.totalDistributions + (month.distributions?.[investorId] || 0),
      totalEarnings: totals.totalEarnings + (month.earnings || 0),
      netRetained: totals.netRetained + (month.retainedEarnings || 0)
    }), { totalDistributions: 0, totalEarnings: 0, netRetained: 0 });
  };

  const yearlyTotals = calculateYearlyTotals();

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedYear(newDate.getFullYear());
    setSelectedMonth(format(newDate, 'MMM'));
  };

  const handleSaveChanges = () => {
    if (editingMonth && (newEarnings || newDistributions)) {
      const updatedData = {
        earnings: parseFloat(newEarnings) || yearData.monthlyData[editingMonth]?.earnings,
        distributions: {
          ...yearData.monthlyData[editingMonth]?.distributions,
          ...newDistributions.split(',').reduce((acc, dist, idx) => {
            acc[`investor${idx + 1}`] = parseFloat(dist) || 0;
            return acc;
          }, {})
        }
      };
      retainedEarningsService.updateMonthlyData(selectedYear, editingMonth, updatedData);
      const updatedRetainedEarningsData = retainedEarningsService.getData();
      setRetainedEarningsData(updatedRetainedEarningsData);
      setEditingMonth(null);
      setNewEarnings("");
      setNewDistributions("");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const chartData = Object.entries(yearData.monthlyData).map(([month, data]) => ({
    month,
    retainedEarnings: data.retainedEarnings || 0,
    distributions: Object.values(data.distributions || {}).reduce((a, b) => a + b, 0),
    earnings: data.earnings || 0
  }));

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
            <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Retained Earnings Dashboard
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Select year and month to view retained earnings
                      </Typography>
                      
                      <Box sx={{ mb: 4 }}>
                        <DatePicker
                          views={['year', 'month']}
                          value={date}
                          onChange={handleDateChange}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </Box>

                      <Box sx={{ height: 300 }}>
                        <ResponsiveContainer>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="retainedEarnings" 
                              stroke="#2196f3" 
                              name="Retained Earnings"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="earnings" 
                              stroke="#4caf50" 
                              name="Earnings"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="distributions" 
                              stroke="#f44336" 
                              name="Distributions"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Yearly Totals
                      </Typography>
                      <Stack spacing={2}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle1">Total Distributions</Typography>
                            </Box>
                            <Typography variant="h6" fontFamily="monospace">
                              UGX {Math.abs(yearlyTotals.totalDistributions).toLocaleString()}
                            </Typography>
                          </Box>
                        </Paper>
                        <Paper elevation={1} sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle1">Total Earnings</Typography>
                            </Box>
                            <Typography variant="h6" fontFamily="monospace">
                              UGX {yearlyTotals.totalEarnings.toLocaleString()}
                            </Typography>
                          </Box>
                        </Paper>
                        <Paper elevation={1} sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle1">Net Retained</Typography>
                            </Box>
                            <Typography variant="h6" fontFamily="monospace">
                            UGX {yearlyTotals.netRetained.toLocaleString()}
                            </Typography>
                          </Box>
                        </Paper>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monthly Breakdown
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Month</TableCell>
                          <TableCell align="right">Distributions</TableCell>
                          <TableCell align="right">Earnings</TableCell>
                          <TableCell align="right">Retained Earnings</TableCell>
                          <TableCell align="right">Running Balance</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(yearData.monthlyData)
                          .map(([month, data], index, array) => {
                            const runningBalance = array
                              .slice(0, index + 1)
                              .reduce((sum, [_, monthData]) => 
                                sum + (monthData.retainedEarnings || 0), 0);
                            
                            return (
                              <TableRow key={month}>
                                <TableCell>{month}</TableCell>
                                <TableCell align="right" sx={{ color: 'error.main' }}>
                                  UGX {Math.abs(Object.values(data.distributions || {})
                                    .reduce((a, b) => a + b, 0)).toLocaleString()}
                                </TableCell>
                                <TableCell align="right" sx={{ color: 'success.main' }}>
                                  UGX {data.earnings?.toLocaleString() || 0}
                                </TableCell>
                                <TableCell align="right">
                                  UGX {data.retainedEarnings?.toLocaleString() || 0}
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                  UGX {runningBalance.toLocaleString()}
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setEditingMonth(month);
                                      setNewEarnings(data.earnings || "");
                                      setNewDistributions(Object.values(data.distributions || {}).join(','));
                                    }}
                                  >
                                    <Edit />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedMonth(month);
                                      setShowDetailsDialog(true);
                                    }}
                                  >
                                    <Info />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>

              {/* Edit Monthly Data Dialog */}
              <Dialog 
                open={Boolean(editingMonth)} 
                onClose={() => setEditingMonth(null)}
              >
                <DialogTitle>Edit Monthly Data</DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Earnings"
                    type="number"
                    fullWidth
                    value={newEarnings}
                    onChange={(e) => setNewEarnings(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    margin="dense"
                    label="Distributions (comma-separated)"
                    type="text"
                    fullWidth
                    value={newDistributions}
                    onChange={(e) => setNewDistributions(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setEditingMonth(null)}>Cancel</Button>
                  <Button onClick={handleSaveChanges} variant="contained">
                    Save Changes
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Month Details Dialog */}
              <Dialog
                open={showDetailsDialog}
                onClose={() => setShowDetailsDialog(false)}
              >
                <DialogTitle>Month Details</DialogTitle>
                <DialogContent>
                  {selectedMonth && (
                    <Stack spacing={2} sx={{ pt: 2 }}>
                      <Typography><strong>Month:</strong> {selectedMonth}</Typography>
                      <Typography><strong>Earnings:</strong> ${yearData.monthlyData[selectedMonth]?.earnings?.toLocaleString() || 0}</Typography>
                      <Typography><strong>Distributions:</strong> ${Math.abs(Object.values(yearData.monthlyData[selectedMonth]?.distributions || {}).reduce((a, b) => a + b, 0)).toLocaleString()}</Typography>
                      <Typography><strong>Retained Earnings:</strong> ${yearData.monthlyData[selectedMonth]?.retainedEarnings?.toLocaleString() || 0}</Typography>
                      <Typography variant="h6" gutterBottom>
                        Investor Details
                      </Typography>
                      {Object.entries(yearData.monthlyData[selectedMonth]?.distributions || {}).map(([investorId, amount]) => (
                        <Box key={investorId} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography><strong>Investor {investorId}:</strong></Typography>
                          <Typography>${Math.abs(amount).toLocaleString()}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
                </DialogActions>
              </Dialog>
            </Box>
          </main>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default RetainedEarnings;