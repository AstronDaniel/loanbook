import React, { useState } from 'react';
import { Box, Card, Button, Select, MenuItem, InputLabel, FormControl, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
  const [reportType, setReportType] = useState('weekly');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reportData, setReportData] = useState([]);
  const [category, setCategory] = useState('');
  const [chartType, setChartType] = useState('line');

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
    <div>
      <main>
        <Box>
          <Card>
            <FormControl>
              <InputLabel>Report Type</InputLabel>
              <Select value={reportType} onChange={handleReportTypeChange}>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            {reportType === 'custom' && (
              <div>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={handleStartDateChange}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={handleEndDateChange}
                />
              </div>
            )}
            <FormControl>
              <InputLabel>Category</InputLabel>
              <Select value={category} onChange={handleCategoryChange}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expenses">Expenses</MenuItem>
                {/* Add more categories as needed */}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Chart Type</InputLabel>
              <Select value={chartType} onChange={handleChartTypeChange}>
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
              </Select>
            </FormControl>
            <Button onClick={generateReport}>Generate Report</Button>
            <Button onClick={exportToPDF}>Export to PDF</Button>
            <Button onClick={emailReport}>Email Report</Button>
            <Button onClick={saveReport}>Save Report</Button>
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
  );
};

export default Reports;