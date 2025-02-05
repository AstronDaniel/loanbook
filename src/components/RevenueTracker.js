import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Button,
  Box,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

// Comprehensive dummy revenue data with UGX currency
const REVENUE_DATA = {
  '2024': {
    'January': {
      customerInterest: 20500500.50,
      bankInterest: 12200750.75,
      badDebtorsInterestRecovered: 8100250.25,
      badDebtorsRecovered: 16300000.00,
      totalRevenue: 57102500.50
    },
    'February': {
      customerInterest: 22200750.75,
      bankInterest: 13500600.60,
      badDebtorsInterestRecovered: 9300400.40,
      badDebtorsRecovered: 18700200.20,
      totalRevenue: 63700950.95
    },
  },
  '2023': {
    'January': {
      customerInterest: 18800250.25,
      bankInterest: 11900500.50,
      badDebtorsInterestRecovered: 7900750.75,
      badDebtorsRecovered: 15900000.00,
      totalRevenue: 54500500.50
    }
  }
};

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(145deg, #e0e5eb 0%, #f9fafb 100%)',
  borderRadius: '20px',
  boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
  }
}));

const RevenueTracker = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('January');

  const years = Object.keys(REVENUE_DATA);
  const months = Object.keys(REVENUE_DATA[selectedYear] || {});

  const monthData = REVENUE_DATA[selectedYear]?.[selectedMonth] || {};

  const handleYearlyReport = () => {
    const yearData = REVENUE_DATA[selectedYear];
    const tableContent = `
      <table style="width:100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background-color: #4a90e2; color: white;">
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Month</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Customer Interest</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Bank Interest</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Bad Debtors Interest</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Bad Debtors Recovered</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Total Revenue</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(yearData).map(([month, data]) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">${month}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">UGX ${data.customerInterest.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">UGX ${data.bankInterest.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">UGX ${data.badDebtorsInterestRecovered.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">UGX ${data.badDebtorsRecovered.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">UGX ${data.totalRevenue.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    Swal.fire({
      title: `${selectedYear} Revenue Report`,
      html: tableContent,
      width: '95%',
      background: 'linear-gradient(to right, #f5f7fa, #e9ecef)',
      showCloseButton: true,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Close',
      cancelButtonColor: '#4a90e2',
      footer: `
        <div style="display: flex; justify-content: space-between; width: 100%; gap: 10px;">
          <button id="exportPDF" class="swal2-cancel swal2-styled" style="background-color: #2ecc71; color: white;">Export PDF</button>
          <button id="printReport" class="swal2-cancel swal2-styled" style="background-color: #3498db; color: white;">Print Report</button>
          <button id="exportExcel" class="swal2-cancel swal2-styled" style="background-color: #f39c12; color: white;">Export Excel</button>
        </div>
      `,
      didRender: () => {
        document.getElementById('exportPDF').addEventListener('click', () => exportPDF(tableContent));
        document.getElementById('printReport').addEventListener('click', () => printReport(tableContent));
        const exportExcelButton = document.getElementById('exportExcel');
        if (exportExcelButton) {
          exportExcelButton.addEventListener('click', exportExcel);
        }
      }
    });
  };

  const exportExcel = () => {
    const yearData = REVENUE_DATA[selectedYear];
    const worksheet = XLSX.utils.json_to_sheet(
      Object.entries(yearData).map(([month, data]) => ({
        Month: month,
        'Customer Interest (UGX)': data.customerInterest,
        'Bank Interest (UGX)': data.bankInterest,
        'Bad Debtors Interest (UGX)': data.badDebtorsInterestRecovered,
        'Bad Debtors Recovered (UGX)': data.badDebtorsRecovered,
        'Total Revenue (UGX)': data.totalRevenue
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${selectedYear} Revenue`);
    XLSX.writeFile(workbook, `${selectedYear}_Revenue_Report.xlsx`);
  };

  const exportPDF = (content) => {
    html2pdf().from(content).save(`${selectedYear}_Revenue_Report.pdf`);
  };

  const printReport = (content) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Revenue Report</title></head><body>');
    printWindow.document.write(content);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <StyledCard sx={{ maxWidth: 400, margin: 'auto' }}>
      <CardContent>
        <Typography variant="h4" sx={{ 
          mb: 3, 
          textAlign: 'center', 
          color: '#4a90e2', 
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Revenue Tracker
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setSelectedMonth(Object.keys(REVENUE_DATA[e.target.value])[0]);
                }}
                variant="outlined"
              >
                {years.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                label="Month"
                onChange={(e) => setSelectedMonth(e.target.value)}
                variant="outlined"
              >
                {months.map(month => (
                  <MenuItem key={month} value={month}>{month}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" color="primary">Customer Interest</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                UGX {monthData.customerInterest?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" color="primary">Bank Interest</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                UGX {monthData.bankInterest?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" color="primary">Bad Debtors Interest</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                UGX {monthData.badDebtorsInterestRecovered?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" color="primary">Bad Debtors Recovered</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                UGX {monthData.badDebtorsRecovered?.toLocaleString() || 0}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleYearlyReport}
            sx={{ 
              borderRadius: '8px', 
              padding: '12px', 
              fontWeight: 'bold',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
          >
            View Full Yearly Report
          </Button>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default RevenueTracker;