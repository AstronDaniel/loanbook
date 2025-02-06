"use client";

import { useState } from "react";
import { Card, CardContent, Typography, Select, MenuItem, Button } from "@mui/material";
import { DollarSign } from "lucide-react";
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

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

const RevenueTracker = ({ darkMode }) => {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedMonth, setSelectedMonth] = useState("January");

  const years = Object.keys(REVENUE_DATA);
  const months = Object.keys(REVENUE_DATA[selectedYear] || {});
  const monthData = REVENUE_DATA[selectedYear]?.[selectedMonth] || {};

  const handleYearlyReport = () => {
    const yearData = REVENUE_DATA[selectedYear];
    const tableContent = `
      <table style="width:100%; border-collapse: collapse; background-color: ${darkMode ? '#1a1a1a' : '#ffffff'}; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <thead>
          <tr style="background-color: #4a90e2; color: white;">
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Month</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Customer Interest</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Bank Interest</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Bad Debtors Interest</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Bad Debtors Recovered</th>
            <th style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 15px; text-align: center;">Total Revenue</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(yearData).map(([month, data]) => `
            <tr style="color: ${darkMode ? '#e2e8f0' : '#000000'}">
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: center; font-weight: bold;">${month}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.customerInterest.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.bankInterest.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.badDebtorsInterestRecovered.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.badDebtorsRecovered.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${data.totalRevenue.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    Swal.fire({
      title: `${selectedYear} Revenue Report`,
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
    <Card
      className={`transform transition-all duration-300 hover:scale-105 ${darkMode ? "bg-gray-800 text-white" : "bg-white"}`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h5" component="h2" className="font-bold">
            Revenue
          </Typography>
          <DollarSign className="w-6 h-6 text-green-500" />
        </div>
        <Typography variant="h3" component="p" className="mb-4 font-bold text-green-500">
          ${(monthData.totalRevenue / 1000000).toFixed(2)}M
        </Typography>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Customer Interest
            </Typography>
            <Typography variant="h6" className="font-semibold">
              ${(monthData.customerInterest / 1000000).toFixed(2)}M
            </Typography>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Bank Interest
            </Typography>
            <Typography variant="h6" className="font-semibold">
              ${(monthData.bankInterest / 1000000).toFixed(2)}M
            </Typography>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Bad Debtors Interest
            </Typography>
            <Typography variant="h6" className="font-semibold">
              ${(monthData.badDebtorsInterestRecovered / 1000000).toFixed(2)}M
            </Typography>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Bad Debtors Recovered
            </Typography>
            <Typography variant="h6" className="font-semibold">
              ${(monthData.badDebtorsRecovered / 1000000).toFixed(2)}M
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

export default RevenueTracker;