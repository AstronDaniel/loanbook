"use client";

import { useState } from "react";
import { Card, CardContent, Typography, Select, MenuItem, Button } from "@mui/material";
import { TrendingDown } from "lucide-react";
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

const ExpensesTracker = ({ darkMode }) => {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedMonth, setSelectedMonth] = useState("January");

  const years = Object.keys(EXPENSES_DATA);
  const months = Object.keys(EXPENSES_DATA[selectedYear] || {});
  const monthData = EXPENSES_DATA[selectedYear]?.[selectedMonth] || {};

  const handleYearlyReport = () => {
    const yearData = EXPENSES_DATA[selectedYear];
    const tableContent = `
      <table style="width:100%; border-collapse: collapse; background-color: ${darkMode ? '#1a1a1a' : '#ffffff'}; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background-color: #4a90e2; color: white;">
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Month</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Service Charge</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Withdraw Charges</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Bad Debtors Written Off</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Transport Transfer Fees</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Annual Debit Card Fee</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Withholding Tax</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Airtime and Data</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Total Expenses</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(yearData).map(([month, data]) => `
            <tr style="color: ${darkMode ? '#e2e8f0' : '#000000'}">
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: center; font-weight: bold;">${month}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.serviceCharge.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.withdrawCharges.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.badDebtorsWrittenOff.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.transportTransferFees.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.annualDebitCardFee.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.withholdingTax.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.airtimeAndData.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${data.totalExpenses.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    Swal.fire({
      title: `${selectedYear} Expenses Report`,
      html: tableContent,
      width: '95%',
      background: darkMode ? '#1a1a1a' : 'linear-gradient(to right, #f5f7fa, #e9ecef)',
      color: darkMode ? '#e2e8f0' : '#000000',
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
    <Card
      className={`transform transition-all duration-300 hover:scale-105 ${darkMode ? "bg-gray-800 text-white" : "bg-white"}`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5" component="h2" className="font-bold">
            Expenses
          </Typography>
          <TrendingDown className="w-6 h-6 text-red-500" />
        </div>
        <Typography variant="h3" component="p" className="mb-4 font-bold text-red-500">
          UGX {monthData.totalExpenses?.toLocaleString() || 0}
        </Typography>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Service Charge
            </Typography>
            <Typography variant="h6" className="font-semibold">
              UGX {monthData.serviceCharge?.toLocaleString() || 0}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Withdraw Charges
            </Typography>
            <Typography variant="h6" className="font-semibold">
              UGX {monthData.withdrawCharges?.toLocaleString() || 0}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Bad Debtors Written Off
            </Typography>
            <Typography variant="h6" className="font-semibold">
              UGX {monthData.badDebtorsWrittenOff?.toLocaleString() || 0}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Withholding Tax
            </Typography>
            <Typography variant="h6" className="font-semibold">
              UGX {monthData.withholdingTax?.toLocaleString() || 0}
            </Typography>
          </div>
        </div>
        <div className="flex gap-4 mb-4">
          <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-1/2">
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
          <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-1/2">
            {months.map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </div>
        <Button
          onClick={handleYearlyReport}
          variant="contained"
          fullWidth
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors duration-200"
        >
          View Full Yearly Report
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExpensesTracker;