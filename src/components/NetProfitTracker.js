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

// Combined Revenue and Expenses Data
const FINANCIAL_DATA = {
  '2024': {
    'January': {
      totalRevenue: 15102.50,
      totalExpenses: 8601.40,
      netProfit: 6501.10,
      distributionToShareholders: 3250.55,
      retainedEarnings: 3250.55
    },
    'February': {
      totalRevenue: 16700.95,
      totalExpenses: 9100.65,
      netProfit: 7600.30,
      distributionToShareholders: 3800.15,
      retainedEarnings: 3800.15
    }
  },
  '2023': {
    'January': {
      totalRevenue: 13500.50,
      totalExpenses: 8101.90,
      netProfit: 5398.60,
      distributionToShareholders: 2699.30,
      retainedEarnings: 2699.30
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

const NetProfitTracker = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('January');

  const years = Object.keys(FINANCIAL_DATA);
  const months = Object.keys(FINANCIAL_DATA[selectedYear] || {});

  const monthData = FINANCIAL_DATA[selectedYear]?.[selectedMonth] || {};

  const handleYearlyReport = () => {
    const yearData = FINANCIAL_DATA[selectedYear];
    const tableContent = `
      <table style="width:100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background-color: #4a90e2; color: white;">
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Month</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Total Revenue</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Total Expenses</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Net Profit</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Distribution to Shareholders</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Retained Earnings</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(yearData).map(([month, data]) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">${month}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">UGX ${data.totalRevenue.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">UGX ${data.totalExpenses.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">UGX ${data.netProfit.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">UGX ${data.distributionToShareholders.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">UGX ${data.retainedEarnings.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    Swal.fire({
      title: `${selectedYear} Financial Report`,
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
      customClass: {
        popup: 'responsive-swal'
      },
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
    const yearData = FINANCIAL_DATA[selectedYear];
    const worksheet = XLSX.utils.json_to_sheet(
      Object.entries(yearData).map(([month, data]) => ({
        Month: month,
        'Total Revenue (UGX)': data.totalRevenue,
        'Total Expenses (UGX)': data.totalExpenses,
        'Net Profit (UGX)': data.netProfit,
        'Distribution to Shareholders (UGX)': data.distributionToShareholders,
        'Retained Earnings (UGX)': data.retainedEarnings
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${selectedYear} Financial Report`);
    XLSX.writeFile(workbook, `${selectedYear}_Financial_Report.xlsx`);
  };

  const exportPDF = (content) => {
    html2pdf().from(content).save(`${selectedYear}_Financial_Report.pdf`);
  };

  const printReport = (content) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Financial Report</title></head><body>');
    printWindow.document.write(content);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <StyledCard sx={{ maxWidth: 600, margin: 'auto' }}>
      <CardContent>
        <Typography variant="h4" sx={{ 
          mb: 3, 
          textAlign: 'center', 
          color: '#4a90e2', 
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Net Profit Tracker
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
                  setSelectedMonth(Object.keys(FINANCIAL_DATA[e.target.value])[0]);
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
              <Typography variant="h6" color="primary">Total Revenue</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                UGX {monthData.totalRevenue?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" color="primary">Total Expenses</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                UGX {monthData.totalExpenses?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" color="primary">Net Profit</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }} color="success.main">
                UGX {monthData.netProfit?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" color="primary">Distribution to Shareholders</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                UGX {monthData.distributionToShareholders?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" color="primary">Retained Earnings</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }} color="primary.main">
                UGX {monthData.retainedEarnings?.toLocaleString() || 0}
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
            View Full Yearly Financial Report
          </Button>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default NetProfitTracker;