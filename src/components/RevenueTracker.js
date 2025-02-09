"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, Typography, Button, TextField } from "@mui/material";
import { DollarSign } from "lucide-react";
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '../firebase';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { set } from "date-fns";

const db = getFirestore(app);

const RevenueTracker = ({ darkMode }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [revenueData, setRevenueData] = useState({});
  const [monthData, setMonthData] = useState({});
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);

  useEffect(() => {
    fetchRevenueData();
  }, [selectedDate]);

  const fetchRevenueData = async () => {
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = (selectedDate.getMonth() + 1).toString().padStart(2, '0'); // Format month as "MM"

    try {
      const yearData = await Promise.all(
        Array.from({ length: 12 }, async (_, i) => {
          const month = (i + 1).toString().padStart(2, '0'); // Format month as "MM"
          const startDate = `${selectedYear}-${month}-01`;
          const endDate = new Date(selectedYear, i + 1, 0).toISOString().split('T')[0]; // Get the last day of the month

          const revenueQuery = query(collection(db, 'revenue'), where('date', '>=', startDate), where('date', '<=', endDate));
          const revenueSnapshot = await getDocs(revenueQuery);
          const revenue = revenueSnapshot.docs.map(doc => doc.data());
          const bankInterest = revenue.reduce((acc, data) => acc + (data.bankInterest || 0), 0);

          // Fetch debtor data
          const debtorQuery = query(collection(db, 'debtors'));
          const debtorSnapshot = await getDocs(debtorQuery);
          const debtors = debtorSnapshot.docs.map(doc => doc.data());

          // Calculate customer interest from debtor monthly records
          const customerInterest = debtors.reduce((acc, debtor) => {
            const monthlyRecords = debtor.monthlyRecords || [];
            const interestCharged = monthlyRecords.reduce((sum, record) => {
              const recordDate = new Date(record.date);
              if (recordDate.getFullYear() === selectedYear && (recordDate.getMonth() + 1).toString().padStart(2, '0') === month) {
                return sum + (record.interestCharge || 0);
              }
              return sum;
            }, 0);
            return acc + interestCharged;
          }, 0);

          return {
            month,
            data: {
              customerInterest,
              bankInterest,
              totalRevenue: customerInterest + bankInterest
            }
          };
        })
      );

      const updatedData = yearData.reduce((acc, { month, data }) => {
        acc[month] = data;
        return acc;
      }, {});

      setRevenueData(prevData => {
        const newData = {
          ...prevData,
          [selectedYear]: updatedData
        };
        setYears(Object.keys(newData));
        setMonths(Object.keys(newData[selectedYear] || {}).sort((a, b) => a - b));
        setMonthData(updatedData[selectedMonth] || {});
        return newData;
      });
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  const handleYearlyReport = () => {
    const selectedYear = selectedDate.getFullYear();
    const yearData = revenueData[selectedYear];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const sortedYearData = Object.entries(yearData).sort((a, b) => a[0] - b[0]);

    const totalCustomerInterest = sortedYearData.reduce((acc, [, data]) => acc + data.customerInterest, 0);
    const totalBankInterest = sortedYearData.reduce((acc, [, data]) => acc + data.bankInterest, 0);
    const totalBadDebtorsInterest = sortedYearData.reduce((acc, [, data]) => acc + (data.badDebtorsInterestRecovered || 0), 0);
    const totalBadDebtorsRecovered = sortedYearData.reduce((acc, [, data]) => acc + (data.badDebtorsRecovered || 0), 0);
    const totalRevenue = sortedYearData.reduce((acc, [, data]) => acc + data.totalRevenue, 0);

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
          ${sortedYearData.map(([month, data]) => `
            <tr style="color: ${darkMode ? '#e2e8f0' : '#000000'}">
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: center; font-weight: bold;">${monthNames[parseInt(month) - 1]}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.customerInterest.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.bankInterest.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.badDebtorsInterestRecovered?.toLocaleString() || 0}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.badDebtorsRecovered?.toLocaleString() || 0}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${data.totalRevenue.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background-color: ${darkMode ? '#333' : '#f0f0f0'}; color: ${darkMode ? '#e2e8f0' : '#000000'}">
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: center; font-weight: bold;">Total</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalCustomerInterest.toLocaleString()}</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalBankInterest.toLocaleString()}</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalBadDebtorsInterest.toLocaleString()}</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalBadDebtorsRecovered.toLocaleString()}</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalRevenue.toLocaleString()}</td>
          </tr>
        </tfoot>
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
    const selectedYear = selectedDate.getFullYear();
    const yearData = revenueData[selectedYear];
    const worksheet = XLSX.utils.json_to_sheet(
      Object.entries(yearData).map(([month, data]) => ({
        Month: month,
        'Customer Interest (UGX)': data.customerInterest,
        'Bank Interest (UGX)': data.bankInterest,
        'Bad Debtors Interest (UGX)': data.badDebtorsInterestRecovered || 0,
        'Bad Debtors Recovered (UGX)': data.badDebtorsRecovered || 0,
        'Total Revenue (UGX)': data.totalRevenue
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${selectedYear} Revenue`);
    XLSX.writeFile(workbook, `${selectedYear}_Revenue_Report.xlsx`);
  };

  const exportPDF = (content) => {
    const selectedYear = selectedDate.getFullYear();
    html2pdf().from(content).save(`${selectedYear}_Revenue_Report.pdf`);
  };

  const printReport = (content) => {
    const selectedYear = selectedDate.getFullYear();
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Revenue Report</title></head><body>');
    printWindow.document.write(`<h1>${selectedYear} Revenue Report</h1>`);
    printWindow.document.write(content);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.toLocaleString('default', { month: 'long' });
  // const monthData = revenueData[selectedYear]?.[selectedMonth] || {};
  console.log("monthData", monthData);

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
          UGX {(monthData.totalRevenue || 0).toLocaleString()}
        </Typography>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Customer Interest
            </Typography>
            <Typography variant="h6" className="font-semibold">
              UGX {(monthData.customerInterest || 0).toLocaleString()}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Bank Interest
            </Typography>
            <Typography variant="h6" className="font-semibold">
              UGX {(monthData.bankInterest || 0).toLocaleString()}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Bad Debtors Interest
            </Typography>
            <Typography variant="h6" className="font-semibold">
              UGX {(monthData.badDebtorsInterestRecovered || 0).toLocaleString()}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Bad Debtors Recovered
            </Typography>
            <Typography variant="h6" className="font-semibold">
              UGX {(monthData.badDebtorsRecovered || 0).toLocaleString()}
            </Typography>
          </div>
        </div>
        <div className="flex gap-4 mb-4">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              views={['year', 'month']}
              label="Year and Month"
              minDate={new Date('2020-01-01')}
              maxDate={new Date('2030-12-31')}
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              renderInput={(params) => <TextField {...params} helperText={null} />}
            />
          </LocalizationProvider>
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