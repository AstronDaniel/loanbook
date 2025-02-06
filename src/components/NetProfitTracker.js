"use client";

import { useState } from "react";
import { Card, CardContent, Typography, Select, MenuItem, Button } from "@mui/material";
import { TrendingUp } from "lucide-react";
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

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

const NetProfitTracker = ({ darkMode }) => {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedMonth, setSelectedMonth] = useState("January");

  const years = Object.keys(FINANCIAL_DATA);
  const months = Object.keys(FINANCIAL_DATA[selectedYear] || {});
  const monthData = FINANCIAL_DATA[selectedYear]?.[selectedMonth] || {};

  const handleYearlyReport = () => {
    const yearData = FINANCIAL_DATA[selectedYear];
    const tableContent = `
      <table style="width:100%; border-collapse: collapse; background-color: ${darkMode ? '#1a1a1a' : '#ffffff'}; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background-color: #4a90e2; color: white;">
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Month</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Total Revenue</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Total Expenses</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Net Profit</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Distribution to Shareholders</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Retained Earnings</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(yearData).map(([month, data]) => `
            <tr style="color: ${darkMode ? '#e2e8f0' : '#000000'}">
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: center; font-weight: bold;">${month}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.totalRevenue.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.totalExpenses.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.netProfit.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.distributionToShareholders.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${data.retainedEarnings.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    Swal.fire({
      title: `${selectedYear} Financial Report`,
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
    <Card
      className={`transform transition-all duration-300 hover:scale-105 ${darkMode ? "bg-gray-800 text-white" : "bg-white"}`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5" component="h2" className="font-bold">
            Net Profit
          </Typography>
          <TrendingUp className="w-6 h-6 text-green-500" />
        </div>
        <Typography variant="h3" component="p" className="mb-4 font-bold text-green-500">
          UGX {monthData.netProfit?.toLocaleString() || 0}
        </Typography>
        <div className="flex justify-between items-center mb-4">
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Distribution to Shareholders
            </Typography>
            <Typography variant="h6" className="font-semibold">
              UGX {monthData.distributionToShareholders?.toLocaleString() || 0}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Retained Earnings
            </Typography>
            <Typography variant="h6" className="font-semibold">
              UGX {monthData.retainedEarnings?.toLocaleString() || 0}
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

export default NetProfitTracker;