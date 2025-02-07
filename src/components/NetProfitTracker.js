"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, Typography, Button, TextField } from "@mui/material";
import { TrendingUp } from "lucide-react";
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '../firebase';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const db = getFirestore(app);

const NetProfitTracker = ({ darkMode }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [financialData, setFinancialData] = useState({});
  const [monthData, setMonthData] = useState({});
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);

  useEffect(() => {
    fetchFinancialData();
  }, [selectedDate]);

  const fetchFinancialData = async () => {
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = (selectedDate.getMonth() + 1).toString().padStart(2, '0'); // Format month as "MM"

    try {
      const yearData = await Promise.all(
        Array.from({ length: 12 }, async (_, i) => {
          const month = (i + 1).toString().padStart(2, '0'); // Format month as "MM"
          const startDate = `${selectedYear}-${month}-01`;
          const endDate = `${selectedYear}-${month}-31`;

          // Fetch revenue data
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
            const interestPaid = monthlyRecords.reduce((sum, record) => {
              const recordDate = new Date(record.date);
              if (recordDate.getFullYear() === selectedYear && (recordDate.getMonth() + 1).toString().padStart(2, '0') === month) {
                return sum + (record.intrestPaid || 0);
              }
              return sum;
            }, 0);
            return acc + interestPaid;
          }, 0);

          const totalRevenue = customerInterest + bankInterest;

          // Fetch expenses data
          const expensesQuery = query(collection(db, 'expenses'), where('date', '>=', startDate), where('date', '<=', endDate));
          const expensesSnapshot = await getDocs(expensesQuery);
          const expenses = expensesSnapshot.docs.map(doc => doc.data());

          const totalExpenses = expenses.reduce((acc, data) => {
            acc += data.serviceCharge || 0;
            acc += data.withdrawCharges || 0;
            acc += data.badDebtorsWrittenOff || 0;
            acc += data.transport || 0;
            acc += data.annualDebitCardFee || 0;
            acc += data.withholdingTax || 0;
            acc += data.airtimeAndData || 0;
            return acc;
          }, 0);

          const netProfit = totalRevenue - totalExpenses;

          return {
            month,
            data: {
              totalRevenue,
              totalExpenses,
              netProfit,
              distributionToShareholders: netProfit / 2,
              retainedEarnings: netProfit / 2
            }
          };
        })
      );

      const updatedData = yearData.reduce((acc, { month, data }) => {
        acc[month] = data;
        return acc;
      }, {});

      setFinancialData(prevData => {
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
      console.error('Error fetching financial data:', error);
    }
  };

  const handleYearlyReport = () => {
    const selectedYear = selectedDate.getFullYear();
    const yearData = financialData[selectedYear];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const sortedYearData = Object.entries(yearData).sort((a, b) => a[0] - b[0]);

    const totalRevenue = sortedYearData.reduce((acc, [, data]) => acc + data.totalRevenue, 0);
    const totalExpenses = sortedYearData.reduce((acc, [, data]) => acc + data.totalExpenses, 0);
    const totalNetProfit = sortedYearData.reduce((acc, [, data]) => acc + data.netProfit, 0);
    const totalDistributionToShareholders = sortedYearData.reduce((acc, [, data]) => acc + data.distributionToShareholders, 0);
    const totalRetainedEarnings = sortedYearData.reduce((acc, [, data]) => acc + data.retainedEarnings, 0);

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
          ${sortedYearData.map(([month, data]) => `
            <tr style="color: ${darkMode ? '#e2e8f0' : '#000000'}">
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: center; font-weight: bold;">${monthNames[parseInt(month) - 1]}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.totalRevenue.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.totalExpenses.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.netProfit.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right;">UGX ${data.distributionToShareholders.toLocaleString()}</td>
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${data.retainedEarnings.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background-color: ${darkMode ? '#333' : '#f0f0f0'}; color: ${darkMode ? '#e2e8f0' : '#000000'}">
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: center; font-weight: bold;">Total</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalRevenue.toLocaleString()}</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalExpenses.toLocaleString()}</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalNetProfit.toLocaleString()}</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalDistributionToShareholders.toLocaleString()}</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalRetainedEarnings.toLocaleString()}</td>
          </tr>
        </tfoot>
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
    const selectedYear = selectedDate.getFullYear();
    const yearData = financialData[selectedYear];
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
    const selectedYear = selectedDate.getFullYear();
    html2pdf().from(content).save(`${selectedYear}_Financial_Report.pdf`);
  };

  const printReport = (content) => {
    const selectedYear = selectedDate.getFullYear();
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Financial Report</title></head><body>');
    printWindow.document.write(`<h1>${selectedYear} Financial Report</h1>`);
    printWindow.document.write(content);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  console.log("monthData", monthData);

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
          UGX {(monthData.netProfit || 0).toLocaleString()}
        </Typography>
        <div className="flex justify-between items-center mb-4">
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Distribution to Shareholders
            </Typography>
            <Typography variant="h6" className="font-semibold">
              UGX {(monthData.distributionToShareholders || 0).toLocaleString()}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Retained Earnings
            </Typography>
            <Typography variant="h6" className="font-semibold">
              UGX {(monthData.retainedEarnings || 0).toLocaleString()}
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

export default NetProfitTracker;