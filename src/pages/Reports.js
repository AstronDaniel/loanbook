import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Button, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl, 
  TextField, 
  Typography, 
  Grid, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  DatePicker, 
  LocalizationProvider 
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { 
  FileDownload as DownloadIcon, 
  Email as EmailIcon, 
  Save as SaveIcon, 
  Analytics as AnalyticsIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import { app } from '../firebase';

const db = getFirestore(app);

const Reports = () => {
  // State Management
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reportType, setReportType] = useState('weekly');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reportData, setReportData] = useState([]);
  const [category, setCategory] = useState('all');
  const [chartType, setChartType] = useState('line');
  const [loading, setLoading] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minAmount: '',
    maxAmount: '',
    transactionType: 'all'
  });

  // Sidebar Toggle
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Advanced Filtering and Report Generation
  const generateReport = async () => {
    setLoading(true);
    try {
      // Construct complex query based on filters
      const reportQuery = query(
        collection(db, 'transactions'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        ...(category !== 'all' ? [where('category', '==', category)] : [])
      );

      const querySnapshot = await getDocs(reportQuery);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Apply advanced filters
      const filteredTransactions = transactions.filter(transaction => {
        const meetsAmountCriteria = 
          (!advancedFilters.minAmount || transaction.amount >= parseFloat(advancedFilters.minAmount)) &&
          (!advancedFilters.maxAmount || transaction.amount <= parseFloat(advancedFilters.maxAmount));
        
        const meetsTransactionTypeCriteria = 
          advancedFilters.transactionType === 'all' || 
          transaction.type === advancedFilters.transactionType;

        return meetsAmountCriteria && meetsTransactionTypeCriteria;
      });

      // Group and transform data for chart
      const groupedData = transformDataForChart(filteredTransactions);
      setReportData(groupedData);
    } catch (error) {
      console.error('Error generating report:', error);
      // Show error notification
    } finally {
      setLoading(false);
    }
  };

  // Data Transformation Utility
  const transformDataForChart = (transactions) => {
    const groupedData = {};
    
    transactions.forEach(transaction => {
      const month = new Date(transaction.date).toLocaleString('default', { month: 'short' });
      
      if (!groupedData[month]) {
        groupedData[month] = { 
          name: month, 
          income: 0, 
          expenses: 0 
        };
      }

      if (transaction.type === 'income') {
        groupedData[month].income += transaction.amount;
      } else {
        groupedData[month].expenses += transaction.amount;
      }
    });

    return Object.values(groupedData);
  };

  // PDF Export
  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Month", "Income", "Expenses"];
    const tableRows = reportData.map(item => [
      item.name, 
      `UGX ${item.income.toLocaleString()}`, 
      `UGX ${item.expenses.toLocaleString()}`
    ]);

    doc.text('Financial Report', 14, 15);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: 'striped'
    });
    doc.save('financial_report.pdf');
  };

  // Render Chart Based on Type
  const renderChart = () => {
    const chartProps = {
      width: '100%',
      height: 400,
      data: reportData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch(chartType) {
      case 'line':
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`UGX ${value.toLocaleString()}`, '']} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#8884d8" name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#82ca9d" name="Expenses" />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`UGX ${value.toLocaleString()}`, '']} />
            <Legend />
            <Bar dataKey="income" fill="#8884d8" name="Income" />
            <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
          </BarChart>
        );
      case 'pie':
        return (
          <PieChart width={400} height={400}>
            <Pie 
              data={reportData} 
              dataKey="income" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              outerRadius={100} 
              fill="#8884d8" 
              label
            />
            <Pie 
              data={reportData} 
              dataKey="expenses" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              innerRadius={110} 
              outerRadius={130} 
              fill="#82ca9d" 
              label
            />
            <Tooltip formatter={(value) => [`UGX ${value.toLocaleString()}`, '']} />
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar Logic */}
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
          
          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Report Configuration Card */}
            <Card className="p-4 bg-white shadow-md">
              <Typography variant="h5" className="mb-4 flex items-center">
                <AnalyticsIcon className="mr-2" /> Generate Financial Report
              </Typography>

              <Grid container spacing={2}>
                {/* Report Type */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Report Type</InputLabel>
                    <Select 
                      value={reportType} 
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Date Pickers for Custom Range */}
                {reportType === 'custom' && (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                  </>
                )}

                {/* Category and Chart Type */}
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="income">Income</MenuItem>
                      <MenuItem value="expenses">Expenses</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Advanced Filters Button */}
                <Grid item xs={12} sm={6} md={3} className="flex items-center">
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<FilterIcon />}
                    onClick={() => setFilterDialogOpen(true)}
                  >
                    Advanced Filters
                  </Button>
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Box marginTop={2} display="flex" alignItems="center" gap={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={generateReport} 
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  startIcon={<DownloadIcon />}
                  onClick={exportToPDF}
                >
                  Export PDF
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  startIcon={<EmailIcon />}
                >
                  Email Report
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  startIcon={<SaveIcon />}
                >
                  Save Report
                </Button>
              </Box>
            </Card>

            {/* Chart Display Card */}
            {reportData.length > 0 && (
              <Card className="p-4 bg-white shadow-md">
                <Typography variant="h6" className="mb-4">
                  Report Visualization
                </Typography>
                <FormControl fullWidth className="mb-4">
                  <InputLabel>Chart Type</InputLabel>
                  <Select 
                    value={chartType} 
                    onChange={(e) => setChartType(e.target.value)}
                  >
                    <MenuItem value="line">Line Chart</MenuItem>
                    <MenuItem value="bar">Bar Chart</MenuItem>
                    <MenuItem value="pie">Pie Chart</MenuItem>
                  </Select>
                </FormControl>
                <ResponsiveContainer width="100%" height={400}>
                  {renderChart()}
                </ResponsiveContainer>
              </Card>
            )}
          </main>
        </div>

        {/* Advanced Filters Dialog */}
        <Dialog 
          open={filterDialogOpen} 
          onClose={() => setFilterDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Advanced Filters</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum Amount"
                  type="number"
                  value={advancedFilters.minAmount}
                  onChange={(e) => setAdvancedFilters({
                    ...advancedFilters, 
                    minAmount: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maximum Amount"
                  type="number"
                  value={advancedFilters.maxAmount}
                  onChange={(e) => setAdvancedFilters({
                    ...advancedFilters, 
                    maxAmount: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Transaction Type</InputLabel>
                  <Select
                    value={advancedFilters.transactionType}
                    onChange={(e) => setAdvancedFilters({
                      ...advancedFilters, 
                      transactionType: e.target.value
                    })}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="expense">Expense</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => {
                setFilterDialogOpen(false);
                generateReport();
              }} 
              color="primary"
            >
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
};

export default Reports;