import React, { useState } from 'react';
import { Box, Card, Button, Select, MenuItem, InputLabel, FormControl, TextField, Typography,Grid2 as Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import jsPDF from 'jspdf';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import { app } from '../firebase';
import { getFirestore } from 'firebase/firestore';

const db = getFirestore(app);

const Reports = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reportType, setReportType] = useState('weekly');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reportData, setReportData] = useState([]);
  const [category, setCategory] = useState('');
  const [chartType, setChartType] = useState('line');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  const generateReport = () => {
    // Fetch report data based on reportType, startDate, endDate, and category
    // For demonstration, using static data
    const data = [
      { name: 'Week 1', income: 4000000, expenses: 2400000 },
      { name: 'Week 2', income: 3000000, expenses: 1398000 },
      // Add more data as needed
    ];
    setReportData(data);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Report', 20, 10);
    doc.autoTable({ html: '#report-table' });
    doc.save('report.pdf');
  };

  const emailReport = () => {
    // Logic to email the report
    alert('Report emailed');
  };

  const saveReport = () => {
    // Logic to save the report
    alert('Report saved');
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
          <Box>
            <Card className="p-4 mb-4 bg-white">
              <Typography variant="h5" className="mb-4">Generate Report</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Report Type</InputLabel>
                    <Select value={reportType} onChange={handleReportTypeChange}>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {reportType === 'custom' && (
                  <>
                    <Grid item xs={12} sm={6} md={4}>
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select value={category} onChange={handleCategoryChange}>
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="income">Income</MenuItem>
                      <MenuItem value="expenses">Expenses</MenuItem>
                      {/* Add more categories as needed */}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Chart Type</InputLabel>
                    <Select value={chartType} onChange={handleChartTypeChange}>
                      <MenuItem value="line">Line Chart</MenuItem>
                      <MenuItem value="bar">Bar Chart</MenuItem>
                      <MenuItem value="pie">Pie Chart</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Box marginTop={2} display="flex" alignItems="center">
                <Button variant="contained" color="primary" onClick={generateReport}>
                  Generate Report
                </Button>
                <Button variant="contained" color="secondary" onClick={exportToPDF} sx={{ ml: 2 }}>
                  Export to PDF
                </Button>
                <Button variant="contained" color="secondary" onClick={emailReport} sx={{ ml: 2 }}>
                  Email Report
                </Button>
                <Button variant="contained" color="secondary" onClick={saveReport} sx={{ ml: 2 }}>
                  Save Report
                </Button>
              </Box>
            </Card>
            <Card className="p-4 bg-white">
              {chartType === 'line' && (
                <LineChart
                  width={500}
                  height={300}
                  data={reportData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#8884d8" />
                  <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
                </LineChart>
              )}
              {chartType === 'bar' && (
                <BarChart
                  width={500}
                  height={300}
                  data={reportData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#8884d8" />
                  <Bar dataKey="expenses" fill="#82ca9d" />
                </BarChart>
              )}
              {chartType === 'pie' && (
                <PieChart width={500} height={300}>
                  <Pie
                    data={reportData}
                    dataKey="income"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                  />
                  <Pie
                    data={reportData}
                    dataKey="expenses"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    fill="#82ca9d"
                    label
                  />
                  <Tooltip />
                </PieChart>
              )}
            </Card>
          </Box>
        </main>
      </div>
    </div>
  );
};

export default Reports;