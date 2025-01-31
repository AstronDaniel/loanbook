import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/SideBar'; // Adjust the path as necessary
import Header from '../components/Header';   // Adjust the path as necessary
import { localStorageService } from '../services/localStorage';

const BalanceSheet = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [equity, setEquity] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    // Fetch data from local storage or API
    const fetchData = () => {
      const investors = localStorageService.getInvestors();
      const contributions = localStorageService.getContributions();

      // Calculate assets, liabilities, and equity
      const assetsData = [
        { name: 'Cash', amount: 50000 },
        { name: 'Accounts Receivable', amount: 30000 },
        { name: 'Inventory', amount: 20000 },
        // Add more assets as needed
      ];

      const liabilitiesData = [
        { name: 'Accounts Payable', amount: 15000 },
        { name: 'Loans Payable', amount: 25000 },
        // Add more liabilities as needed
      ];

      const equityData = [
        { name: 'Owner\'s Equity', amount: 40000 },
        // Add more equity items as needed
      ];

      setAssets(assetsData);
      setLiabilities(liabilitiesData);
      setEquity(equityData);
    };

    fetchData();
  }, []);

  const totalAssets = assets.reduce((total, asset) => total + asset.amount, 0);
  const totalLiabilities = liabilities.reduce((total, liability) => total + liability.amount, 0);
  const totalEquity = equity.reduce((total, eq) => total + eq.amount, 0);

  const filteredAssets = assets.filter(asset => asset.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredLiabilities = liabilities.filter(liability => liability.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredEquity = equity.filter(eq => eq.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const chartData = [
    { name: 'Assets', value: totalAssets },
    { name: 'Liabilities', value: totalLiabilities },
    { name: 'Equity', value: totalEquity }
  ];

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
          <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Assets
                    </Typography>
                    <Typography variant="h4" color="primary">
                      UGX {totalAssets.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Liabilities
                    </Typography>
                    <Typography variant="h4" color="error">
                      UGX {totalLiabilities.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Equity
                    </Typography>
                    <Typography variant="h4" color="success">
                      UGX {totalEquity.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Balance Sheet
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Assets
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Asset</TableCell>
                            <TableCell align="right">Amount (UGX)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredAssets.map((asset) => (
                            <TableRow key={asset.name}>
                              <TableCell>{asset.name}</TableCell>
                              <TableCell align="right">{asset.amount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell><strong>Total Assets</strong></TableCell>
                            <TableCell align="right"><strong>{totalAssets.toLocaleString()}</strong></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Liabilities and Equity
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Liability/Equity</TableCell>
                            <TableCell align="right">Amount (UGX)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredLiabilities.map((liability) => (
                            <TableRow key={liability.name}>
                              <TableCell>{liability.name}</TableCell>
                              <TableCell align="right">{liability.amount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                          {filteredEquity.map((eq) => (
                            <TableRow key={eq.name}>
                              <TableCell>{eq.name}</TableCell>
                              <TableCell align="right">{eq.amount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell><strong>Total Liabilities and Equity</strong></TableCell>
                            <TableCell align="right"><strong>{(totalLiabilities + totalEquity).toLocaleString()}</strong></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Financial Overview
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1976d2" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="contained" color="primary">
                Export to PDF
              </Button>
              <Button variant="contained" color="secondary">
                Export to Excel
              </Button>
              <Button variant="contained" color="default">
                Export to CSV
              </Button>
            </Box>
          </Box>
        </main>
      </div>
    </div>
  );
};

export default BalanceSheet;
