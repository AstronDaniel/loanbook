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
  DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Edit, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import Sidebar from '../components/SideBar'; // Adjust the path as necessary
import Header from '../components/Header';   // Adjust the path as necessary
import { localStorageService, initializeCapitalContributions } from '../services/localStorage'; // Adjust the path as necessary

const CapitalContributions = () => {
  const [investors, setInvestors] = useState([]);
  const [contributions, setContributions] = useState({});
  const [date, setDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [editingContribution, setEditingContribution] = useState(null);
  const [newAmount, setNewAmount] = useState("");
  const [showInvestorDialog, setShowInvestorDialog] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const { investors, contributions } = initializeCapitalContributions();
    setInvestors(investors);
    setContributions(contributions);
  }, []);

  const calculateLifetimeTotal = (investorId) => {
    return Object.values(contributions).reduce((total, monthData) => {
      return total + (monthData[investorId] || 0);
    }, 0);
  };

  const getMonthTotal = (month) => {
    return Object.values(contributions[month] || {}).reduce((a, b) => a + b, 0);
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedMonth(format(newDate, 'yyyy-MM'));
  };

  const handleSaveContribution = () => {
    if (editingContribution && newAmount) {
      localStorageService.updateContribution(
        selectedMonth,
        editingContribution.id,
        parseFloat(newAmount)
      );
      
      // Refresh the contributions data
      setContributions(prev => ({
        ...prev,
        [selectedMonth]: {
          ...prev[selectedMonth],
          [editingContribution.id]: parseFloat(newAmount)
        }
      }));
      
      setEditingContribution(null);
      setNewAmount("");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const chartData = Object.entries(contributions).map(([month, data]) => ({
    month: format(new Date(month + '-01'), 'MMM yyyy'),
    total: Object.values(data).reduce((a, b) => a + b, 0)
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
                        Capital Contributions Dashboard
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Select month to view contributions
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
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="#1976d2" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Lifetime Contributions
                      </Typography>
                      <Stack spacing={2}>
                        {investors.map(investor => (
                          <Paper key={`lifetime-${investor.id}`} elevation={1} sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="subtitle1">{investor.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {investor.company}
                                </Typography>
                              </Box>
                              <Typography variant="h6" fontFamily="monospace">
                                UGX {calculateLifetimeTotal(investor.id).toLocaleString()}
                              </Typography>
                            </Box>
                          </Paper>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monthly Contributions
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Showing contributions for {format(date, 'MMMM yyyy')}
                  </Typography>

                  <Stack spacing={2}>
                    {investors.map(investor => (
                      <Paper key={investor.id} elevation={1} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1">{investor.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {investor.company}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" fontFamily="monospace">
                              UGX {contributions[selectedMonth]?.[investor.id]?.toLocaleString() || 0}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingContribution(investor);
                                setNewAmount(contributions[selectedMonth]?.[investor.id] || "");
                              }}
                            >
                              <Edit />
                            </IconButton>
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

                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Total Contributions for {format(date, 'MMMM yyyy')}:
                    </Typography>
                    <Typography variant="h5" fontFamily="monospace" fontWeight="bold">
                      UGX {getMonthTotal(selectedMonth).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Edit Contribution Dialog */}
              <Dialog 
                open={Boolean(editingContribution)} 
                onClose={() => setEditingContribution(null)}
              >
                <DialogTitle>Edit Contribution</DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Amount"
                    type="number"
                    fullWidth
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setEditingContribution(null)}>Cancel</Button>
                  <Button onClick={handleSaveContribution} variant="contained">
                    Save Changes
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Investor Details Dialog */}
              <Dialog
                open={showInvestorDialog}
                onClose={() => setShowInvestorDialog(false)}
              >
                <DialogTitle>Investor Details</DialogTitle>
                <DialogContent>
                  {selectedInvestor && (
                    <Stack spacing={2} sx={{ pt: 2 }}>
                      <Typography><strong>Name:</strong> {selectedInvestor.name}</Typography>
                      <Typography><strong>Email:</strong> {selectedInvestor.email}</Typography>
                      <Typography><strong>Company:</strong> {selectedInvestor.company}</Typography>
                      <Typography>
                        <strong>Lifetime Contribution:</strong> UGX {calculateLifetimeTotal(selectedInvestor.id).toLocaleString()}
                      </Typography>
                    </Stack>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowInvestorDialog(false)}>Close</Button>
                </DialogActions>
              </Dialog>
            </Box>
          </main>
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default CapitalContributions;