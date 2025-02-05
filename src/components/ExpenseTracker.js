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

const EXPENSES_DATA = {
  '2024': {
    'January': {
      serviceCharge: 1200.50,
      withdrawCharges: 750.25,
      badDebtorsWrittenOff: 3500.00,
      transportTransferFees: 450.75,
      annualDebitCardFee: 250.00,
      withholdingTax: 2100.30,
      airtimeAndData: 350.60,
      totalExpenses: 8601.40
    },
    'February': {
      serviceCharge: 1300.75,
      withdrawCharges: 800.50,
      badDebtorsWrittenOff: 3700.25,
      transportTransferFees: 475.90,
      annualDebitCardFee: 250.00,
      withholdingTax: 2200.45,
      airtimeAndData: 375.80,
      totalExpenses: 9100.65
    }
  },
  '2023': {
    'January': {
      serviceCharge: 1100.25,
      withdrawCharges: 700.50,
      badDebtorsWrittenOff: 3300.00,
      transportTransferFees: 425.60,
      annualDebitCardFee: 250.00,
      withholdingTax: 2000.15,
      airtimeAndData: 325.40,
      totalExpenses: 8101.90
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

const ExpensesTracker = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('January');

  const years = Object.keys(EXPENSES_DATA);
  const months = Object.keys(EXPENSES_DATA[selectedYear] || {});

  const monthData = EXPENSES_DATA[selectedYear]?.[selectedMonth] || {};

  const handleYearlyReport = () => {
    const yearData = EXPENSES_DATA[selectedYear];
    const tableContent = `
      <table style="width:100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background-color: #4a90e2; color: white;">
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Month</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Service Charge</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Withdraw Charges</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Bad Debtors Written Off</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Transport Transfer Fees</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Annual Debit Card Fee</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Withholding Tax</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Airtime and Data</th>
            <th style="border: 1px solid #ddd; padding: 15px; text-align: center;">Total Expenses</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(yearData).map(([month, data]) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">${month}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">UGX ${data.serviceCharge.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">UGX ${data.withdrawCharges.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">UGX ${data.badDebtorsWrittenOff.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">UGX ${data.transportTransferFees.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">UGX ${data.annualDebitCardFee.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">UGX ${data.withholdingTax.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">UGX ${data.airtimeAndData.toLocaleString()}</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">UGX ${data.totalExpenses.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    Swal.fire({
      title: `${selectedYear} Expenses Report`,
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
    const yearData = EXPENSES_DATA[selectedYear];
    const worksheet = XLSX.utils.json_to_sheet(
      Object.entries(yearData).map(([month, data]) => ({
        Month: month,
        'Service Charge (UGX)': data.serviceCharge,
        'Withdraw Charges (UGX)': data.withdrawCharges,
        'Bad Debtors Written Off (UGX)': data.badDebtorsWrittenOff,
        'Transport Transfer Fees (UGX)': data.transportTransferFees,
        'Annual Debit Card Fee (UGX)': data.annualDebitCardFee,
        'Withholding Tax (UGX)': data.withholdingTax,
        'Airtime and Data (UGX)': data.airtimeAndData,
        'Total Expenses (UGX)': data.totalExpenses
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${selectedYear} Expenses`);
    XLSX.writeFile(workbook, `${selectedYear}_Expenses_Report.xlsx`);
  };

  const exportPDF = (content) => {
    html2pdf().from(content).save(`${selectedYear}_Expenses_Report.pdf`);
  };

  const printReport = (content) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Expenses Report</title></head><body>');
    printWindow.document.write(content);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <StyledCard sx={{ maxWidth: 500, margin: 'auto' }}>
      <CardContent>
        <Typography variant="h4" sx={{ 
          mb: 3, 
          textAlign: 'center', 
          color: '#4a90e2', 
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Expenses Tracker
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
                  setSelectedMonth(Object.keys(EXPENSES_DATA[e.target.value])[0]);
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
              <Typography variant="h6" color="primary">Service Charge</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                UGX {monthData.serviceCharge?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" color="primary">Withdraw Charges</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                UGX {monthData.withdrawCharges?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" color="primary">Bad Debtors Written Off</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                UGX {monthData.badDebtorsWrittenOff?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" color="primary">Transport Transfer Fees</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                UGX {monthData.transportTransferFees?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" color="primary">Annual Debit Card Fee</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                UGX {monthData.annualDebitCardFee?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" color="primary">Withholding Tax</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                UGX {monthData.withholdingTax?.toLocaleString() || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" color="primary">Airtime and Data</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                UGX {monthData.airtimeAndData?.toLocaleString() || 0}
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

export default ExpensesTracker;