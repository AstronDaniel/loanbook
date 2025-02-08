"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, Typography, Button, TextField } from "@mui/material";
import { TrendingDown } from "lucide-react";
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '../firebase';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const db = getFirestore(app);

const ExpensesTracker = ({ darkMode }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(selectedDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(selectedDate.toLocaleString('default', { month: 'long' }));
  const [expensesData, setExpensesData] = useState({});
  const [monthData, setMonthData] = useState({});
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);

  useEffect(() => {
    fetchExpensesData();
  }, [selectedDate]);

  const fetchExpensesData = async () => {
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = (selectedDate.getMonth() + 1).toString().padStart(2, '0'); // Format month as "MM"

    try {
      const yearData = await Promise.all(
        Array.from({ length: 12 }, async (_, i) => {
          const month = (i + 1).toString().padStart(2, '0'); // Format month as "MM"
          const startDate = `${selectedYear}-${month}-01`;
          const endDate = `${selectedYear}-${month}-31`;

          const expensesQuery = query(collection(db, 'expenses'), where('date', '>=', startDate), where('date', '<=', endDate));
          const expensesSnapshot = await getDocs(expensesQuery);
          const expenses = expensesSnapshot.docs.map(doc => doc.data());

          const monthData = expenses.reduce((acc, data) => {
            acc.serviceCharge += data.serviceCharge || 0;
            acc.withdrawCharges += data.withdrawCharges || 0;
            acc.badDebtorsWrittenOff += data.badDebtorsWrittenOff || 0;
            acc.transportTransferFees += data.transport || 0;
            acc.annualDebitCardFee += data.annualDebitCardFee || 0;
            acc.withholdingTax += data.withholdingTax || 0;
            acc.airtimeAndData += data.airtimeAndData || 0;
            acc.totalExpenses += data.serviceCharge || 0;
            acc.totalExpenses += data.withdrawCharges || 0;
            acc.totalExpenses += data.badDebtorsWrittenOff || 0;
            acc.totalExpenses += data.transport || 0;
            acc.totalExpenses += data.annualDebitCardFee || 0;
            acc.totalExpenses += data.withholdingTax || 0;
            acc.totalExpenses += data.airtimeAndData || 0;
            return acc;
          }, {
            serviceCharge: 0,
            withdrawCharges: 0,
            badDebtorsWrittenOff: 0,
            transportTransferFees: 0,
            annualDebitCardFee: 0,
            withholdingTax: 0,
            airtimeAndData: 0,
            totalExpenses: 0
          });

          return {
            month,
            data: monthData
          };
        })
      );

      const updatedData = yearData.reduce((acc, { month, data }) => {
        acc[month] = data;
        return acc;
      }, {});

      setExpensesData(prevData => {
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
      console.error('Error fetching expenses data:', error);
    }
  };

  const handleYearlyReport = () => {
    const selectedYear = selectedDate.getFullYear();
    const yearData = expensesData[selectedYear];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const sortedYearData = Object.entries(yearData).sort((a, b) => a[0] - b[0]);

    const totalServiceCharge = sortedYearData.reduce((acc, [, data]) => acc + data.serviceCharge, 0);
    const totalWithdrawCharges = sortedYearData.reduce((acc, [, data]) => acc + data.withdrawCharges, 0);
    const totalBadDebtorsWrittenOff = sortedYearData.reduce((acc, [, data]) => acc + data.badDebtorsWrittenOff, 0);
    const totalTransportTransferFees = sortedYearData.reduce((acc, [, data]) => acc + data.transportTransferFees, 0);
    const totalAnnualDebitCardFee = sortedYearData.reduce((acc, [, data]) => acc + data.annualDebitCardFee, 0);
    const totalWithholdingTax = sortedYearData.reduce((acc, [, data]) => acc + data.withholdingTax, 0);
    const totalAirtimeAndData = sortedYearData.reduce((acc, [, data]) => acc + data.airtimeAndData, 0);
    const totalExpenses = sortedYearData.reduce((acc, [, data]) => acc + data.totalExpenses, 0);

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
          ${sortedYearData.map(([month, data]) => `
            <tr style="color: ${darkMode ? '#e2e8f0' : '#000000'}">
              <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: center; font-weight: bold;">${monthNames[parseInt(month) - 1]}</td>
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
        <tfoot>
          <tr style="background-color: ${darkMode ? '#333' : '#f0f0f0'}; color: ${darkMode ? '#e2e8f0' : '#000000'}">
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: center; font-weight: bold;">Total</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalServiceCharge.toLocaleString()}</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalWithdrawCharges.toLocaleString()}</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalBadDebtorsWrittenOff.toLocaleString()}</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalTransportTransferFees.toLocaleString()}</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalAnnualDebitCardFee.toLocaleString()}</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalWithholdingTax.toLocaleString()}</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalAirtimeAndData.toLocaleString()}</td>
            <td style="border: 1px solid ${darkMode ? '#404040' : '#ddd'}; padding: 12px; text-align: right; font-weight: bold;">UGX ${totalExpenses.toLocaleString()}</td>
          </tr>
        </tfoot>
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
    const selectedYear = selectedDate.getFullYear();
    const yearData = expensesData[selectedYear];
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
    const selectedYear = selectedDate.getFullYear();
    html2pdf().from(content).save(`${selectedYear}_Expenses_Report.pdf`);
  };

  const printReport = (content) => {
    const selectedYear = selectedDate.getFullYear();
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Expenses Report</title></head><body>');
    printWindow.document.write(`<h1>${selectedYear} Expenses Report</h1>`);
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
            Expenses
          </Typography>
          <TrendingDown className="w-6 h-6 text-red-500" />
        </div>
        <Typography variant="h3" component="p" className="mb-4 font-bold text-red-500">
          UGX {(monthData.totalExpenses || 0).toLocaleString()}
        </Typography>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Service Charge
            </Typography>
            <Typography variant="h6" className="font-semibold">
              UGX {(monthData.serviceCharge || 0).toLocaleString()}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Withdraw Charges
            </Typography>
            <Typography variant="h6" className="font-semibold">
              UGX {(monthData.withdrawCharges || 0).toLocaleString()}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Bad Debtors Written Off
            </Typography>
            <Typography variant="h6" className="font-semibold">
              UGX {(monthData.badDebtorsWrittenOff || 0).toLocaleString()}
            </Typography>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
              Withholding Tax
            </Typography>
            <Typography variant="h6" className="font-semibold">
              UGX {(monthData.withholdingTax || 0).toLocaleString()}
            </Typography>
          </div>
        </div>
        <div className="flex gap-4 mb-4">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              views={['year', 'month']}
              label="Select Year and Month"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
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

export default ExpensesTracker;