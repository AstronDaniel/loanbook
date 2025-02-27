import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import { localStorageService } from '../services/localStorage';

const BalanceSheet = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [equity, setEquity] = useState([]);

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
        { name: 'Debtors', amount: 593441756 },
        { name: 'Interest Receivable', amount: 0 },
        { name: 'Cash at Bank', amount: 41483714 },
        { name: 'Cash at Hand', amount: 0 },
      ];

      const liabilitiesData = [
        { name: 'Liabilities', amount: 0 },
        { name: 'Payables', amount: 0 },
        { name: 'Interest Payable', amount: 0 },
      ];

      const equityData = [
        { name: 'Capital', amount: 490500000 },
        { name: 'Retained Earnings', amount: 119110767 },
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
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Balance Sheet
                </Typography>
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
                          {assets.map((asset) => (
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
                          {equity.map((eq) => (
                            <TableRow key={eq.name}>
                              <TableCell>{eq.name}</TableCell>
                              <TableCell align="right">{eq.amount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                          {liabilities.map((liability) => (
                            <TableRow key={liability.name}>
                              <TableCell>{liability.name}</TableCell>
                              <TableCell align="right">{liability.amount.toLocaleString()}</TableCell>
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
          </Box>
        </main>
      </div>
    </div>
  );
};

export default BalanceSheet;
