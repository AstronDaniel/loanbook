import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  IconButton, 
  Typography, 
  Collapse,
  Grid,
  CircularProgress
} from '@mui/material';
import { 
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Close as CloseIcon,
  InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { app } from '../firebase';
import Swal from 'sweetalert2';
import { differenceInDays, parseISO, format } from 'date-fns';

const BorrowersCard = ({ darkMode }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [badDebtors, setBadDebtors] = useState([]);
  const [aboutToOverdue, setAboutToOverdue] = useState([]);
  const [error, setError] = useState(null);
  const [allTimeBorrowersData, setAllTimeBorrowersData] = useState([]);
  const [debtors, setDebtors] = useState([]); // New state for all debtors

  useEffect(() => {
    const fetchBadDebtors = async () => {
      try {
        const db = getFirestore(app);
        const badDebtQuery = query(
          collection(db, 'debtors'), 
          where('status', '==', 'overdue')
        );
        
        const querySnapshot = await getDocs(badDebtQuery);
        const debtorsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const badDebtors = await Promise.all(debtorsData.map(async debtor => {
          const loanDoc = await getDoc(doc(db, 'loans', debtor.loanId));
          if (loanDoc.exists()) {
            const dueDate = parseISO(loanDoc.data().dueDate);
            const daysOverdue = differenceInDays(new Date(), dueDate);
            if (daysOverdue >= 90) {
              return debtor;
            }
          }
          return null;
        }));

        setBadDebtors(badDebtors.filter(debtor => debtor !== null).sort((a, b) => a.customerName.localeCompare(b.customerName, undefined, { numeric: true })));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bad debtors:', err);
        setError('Failed to load bad debtors');
        setLoading(false);
      }
    };

    fetchBadDebtors();
  }, []);

  useEffect(() => {
    const fetchBorrowerStats = async () => {
      setLoading(true);
      const db = getFirestore(app);
      const debtorsSnapshot = await getDocs(collection(db, 'debtors'));
      const loansSnapshot = await getDocs(collection(db, 'loans'));
      const debtorsData = debtorsSnapshot.docs.map(doc => doc.data());
      const loansData = loansSnapshot.docs.map(doc => doc.data());

      const currentDate = new Date();

      const allTimeBorrowersData = debtorsData.map(debtor => {
        const loan = loansData.find(l => l.loanId === debtor.loanId);
        if (loan) {
          const monthYear = `${new Date(loan.dueDate).toLocaleString('default', { month: 'short' })}-${new Date(loan.dueDate).getFullYear()}`;
          return {
            name: debtor.name,
            monthYear,
            openingPrinciple: loan.openingPrinciple,
            principleAdvanced: loan.principleAdvanced,
            partOfPrinciplePaid: loan.partOfPrinciplePaid,
            principleOutstanding: loan.principleOutstanding,
            openingInterest: loan.openingInterest,
            interestCharged: loan.interestCharged,
            interestPaid: loan.interestPaid,
            interestOutstanding: loan.interestOutstanding
          };
        }
        return null;
      }).filter(borrower => borrower !== null);

      setAllTimeBorrowersData(allTimeBorrowersData);

      const stats = [
        { label: 'All Time Borrowers', value: debtorsData.length, color: '#2196f3', data: allTimeBorrowersData },
        { label: 'Active Borrowers', value: debtorsData.filter(b => b.status === 'active').length, color: '#4CAF50' },
        { label: 'Overdue', value: debtorsData.filter(b => b.status === 'overdue').length, color: '#f44336' },
        { label: 'Bad Debtors', value: badDebtors.length, color: '#d32f2f' },
        { label: 'About to Overdue', value: aboutToOverdue.length, color: '#ff9800' },
        { label: '0 Balance Debtors', value: debtorsData.filter(b => b.status === 'completed').sort((a, b) => a.customerName.localeCompare(b.customerName, undefined, { numeric: true })).length, color: '#2196f3' }
      ];

      setStats(stats);
      setLoading(false);
    };

    fetchBorrowerStats();
  }, [badDebtors, aboutToOverdue]);

  useEffect(() => {
    const fetchActiveBorrowers = async () => {
      try {
        const db = getFirestore(app);
        const activeBorrowersQuery = query(
          collection(db, 'debtors'), 
          where('status', '==', 'active')
        );
        
        const querySnapshot = await getDocs(activeBorrowersQuery);
        const debtorsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const activeBorrowers = await Promise.all(debtorsData.map(async debtor => {
          const loanDoc = await getDoc(doc(db, 'loans', debtor.loanId));
          if (loanDoc.exists()) {
            const dueDate = parseISO(loanDoc.data().dueDate);
            const currentDate = new Date();
            const daysToDueDate = differenceInDays(dueDate, currentDate);
            const monthsToDueDate = Math.floor(daysToDueDate / 30);
            const remainingDays = daysToDueDate % 30;

            return {
              ...debtor,
              monthsToDueDate,
              remainingDays
            };
          }
          return null;
        }));

        const aboutToOverdue = activeBorrowers.filter(borrower => {
          return borrower && borrower.monthsToDueDate <= 2;
        }).sort((a, b) => a.customerName.localeCompare(b.customerName, undefined, { numeric: true }));

        setAboutToOverdue(aboutToOverdue);
      } catch (err) {
        console.error('Error fetching active borrowers:', err);
      }
    };

    fetchActiveBorrowers();
  }, []);

  useEffect(() => {
    const fetchAllCustomers = async () => {
      try {
        const db = getFirestore(app);
        const debtorsSnapshot = await getDocs(collection(db, 'debtors'));
        const loansSnapshot = await getDocs(collection(db, 'loans'));
        const debtorsData = debtorsSnapshot.docs.map(doc => doc.data());
        const loansData = loansSnapshot.docs.map(doc => doc.data());

        const allCustomers = debtorsData.map(debtor => {
          const loan = loansData.find(l => l.loanId === debtor.loanId);
          if (loan) {
            const monthYear = `${new Date(loan.dueDate).toLocaleString('default', { month: 'short' })}-${new Date(loan.dueDate).getFullYear()}`;
            return {
              name: debtor.name,
              monthYear,
              openingPrinciple: loan.openingPrinciple,
              principleAdvanced: loan.principleAdvanced,
              partOfPrinciplePaid: loan.partOfPrinciplePaid,
              principleOutstanding: loan.principleOutstanding,
              openingInterest: loan.openingInterest,
              interestCharged: loan.interestCharged,
              interestPaid: loan.interestPaid,
              interestOutstanding: loan.interestOutstanding
            };
          }
          return null;
        }).filter(customer => customer !== null);

        console.log('All Customers:', allCustomers);
      } catch (err) {
        console.error('Error fetching all customers:', err);
      }
    };

    fetchAllCustomers();
  }, []);

  useEffect(() => {
    const fetchAllDebtors = async () => {
      try {
        const db = getFirestore(app);
        const debtorsSnapshot = await getDocs(collection(db, 'debtors'));
        const debtorsData = debtorsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDebtors(debtorsData.sort((a, b) => a.customerName.localeCompare(b.customerName, undefined, { numeric: true })));
      } catch (err) {
        console.error('Error fetching all debtors:', err);
        setError('Failed to load debtors');
      }
    };

    fetchAllDebtors();
  }, []);

  const formatMonthlyData = (data) => {
    const customerData = {};
    
    data.forEach(item => {
      if (!customerData[item.customerName]) {
        customerData[item.customerName] = {};
      }
      
      item.monthlyRecords.forEach(record => {
        const monthYear = record.month;
        customerData[item.customerName][monthYear] = {
          openingPrinciple: record.openingPrinciple || 0,
          principleAdvanced: record.principleAdvance || 0,
          partOfPrinciplePaid: record.principlePaid || 0,
          principleOutstanding: record.outstandingPrinciple || 0,
          openingInterest: record.openingInterest || 0,
          interestCharged: record.interestCharge || 0,
          interestPaid: record.intrestPaid || 0,
          interestOutstanding: record.outstandingInterest || 0
        };
      });
    });

    return customerData;
  };

  const generateTableHeaders = (months) => {
    const headers = ['Customer Name'];
    months.forEach(month => {
      const [year, monthNumber] = month.split('-');
      const monthName = new Date(year, monthNumber - 1).toLocaleString('default', { month: 'short' });
      headers.push(
        `${year} ${monthName} Opening Principal`,
        `${year} ${monthName} Principal Advanced`,
        `${year} ${monthName} Principal Paid`,
        `${year} ${monthName} Principal Outstanding`,
        `${year} ${monthName} Opening Interest`,
        `${year} ${monthName} Interest Charged`,
        `${year} ${monthName} Interest Paid`,
        `${year} ${monthName} Interest Outstanding`,
        '' // Empty column for easier identification
      );
    });
    return headers;
  };

  const showSummary = (stat) => {
    if (stat.label === 'All Time Borrowers') {
      if (!debtors || !Array.isArray(debtors)) {
        Swal.fire({
          title: 'No Data Available',
          text: 'There is no data available for this statistic.',
          icon: 'info',
          background: '#2A2F34',
          color: '#ffffff'
        });
        return;
      }

      const tableStyles = `
        <style>
          @media print {
            body * {
              visibility: hidden;
            }
            .table-container, .table-container * {
              visibility: visible;
            }
            .table-container {
              position: absolute;
              left: 0;
              top: 0;
            }
            .search-container, .swal2-close {
              display: none !important;
            }
          }
          .borrowers-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.875rem;
          }
          .borrowers-table th, .borrowers-table td {
            padding: 8px;
            border: 1px solid rgba(255,255,255,0.1);
            white-space: nowrap;
            text-align: right;
          }
          .borrowers-table td:first-child {
            text-align: left;
            position: sticky;
            left: 0;
            background: #2A2F34;
            z-index: 1;
          }
          .borrowers-table th {
            background: #374151;
            text-align: center;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          .borrowers-table th.month-header {
            text-align: center;
            border-bottom: none;
          }
          .borrowers-table th.sub-header {
            top: 37px;
            background: #2d3748;
          }
          .borrowers-table tbody tr:nth-child(even) {
            background: rgba(255,255,255,0.05);
          }
          .borrowers-table tbody tr:hover {
            background: rgba(255,255,255,0.1);
          }
          .table-container {
            max-height: 70vh;
            overflow-x: auto;
            overflow-y: auto;
          }
          .search-container {
            margin-bottom: 1rem;
            position: sticky;
            top: 0;
            z-index: 20;
            background: #2A2F34;
            padding: 1rem 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          #searchInput {
            width: 300px;
            padding: 0.5rem;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 4px;
            background: rgba(255,255,255,0.1);
            color: white;
          }
          #searchInput::placeholder {
            color: rgba(255,255,255,0.5);
          }
          .print-button {
            padding: 8px 16px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .print-button:hover {
            background: #45a049;
          }
          .total-row {
            font-weight: bold;
            background: #1a202c !important;
          }
          .total-row td {
            border-top: 2px solid rgba(255,255,255,0.2);
          }
        </style>
      `;

      const uniqueMonths = [...new Set(debtors.flatMap(item => 
        item.monthlyRecords?.map(record => record.month) || []
      ))].sort((a, b) => new Date(a.split('-')[0], a.split('-')[1] - 1) - new Date(b.split('-')[0], b.split('-')[1] - 1));

      const createMonthlyHeaders = () => {
        let headerRow1 = '<th rowspan="2">Customer Name</th>';
        let headerRow2 = '';

        uniqueMonths.forEach(month => {
          const [year, monthNumber] = month.split('-');
          const monthName = new Date(year, monthNumber - 1).toLocaleString('default', { month: 'short' });
          headerRow1 += `<th colspan="9" class="month-header">${year} ${monthName}</th>`; // Adjust colspan to 9
          headerRow2 += `
            <th class="sub-header">Opening Principal</th>
            <th class="sub-header">Principal Advanced</th>
            <th class="sub-header">Principal Paid</th>
            <th class="sub-header">Principal Outstanding</th>
            <th class="sub-header">Opening Interest</th>
            <th class="sub-header">Interest Charged</th>
            <th class="sub-header">Interest Paid</th>
            <th class="sub-header">Interest Outstanding</th>
            <th class="sub-header" style="padding:0 70px"></th> <!-- Empty column -->
          `;
        });

        return `
          <tr>${headerRow1}</tr>
          <tr>${headerRow2}</tr>
        `;
      };

      const calculateTotals = () => {
        const monthlyTotals = {};
        const customerTotals = {};

        debtors.forEach(debtor => {
          customerTotals[debtor.customerName] = {
            openingPrinciple: 0,
            principleAdvanced: 0,
            principlePaid: 0,
            outstandingPrinciple: 0,
            openingInterest: 0,
            interestCharge: 0,
            intrestPaid: 0,
            outstandingInterest: 0
          };

          debtor.monthlyRecords?.forEach(record => {
            if (!monthlyTotals[record.month]) {
              monthlyTotals[record.month] = {
                openingPrinciple: 0,
                principleAdvanced: 0,
                principlePaid: 0,
                outstandingPrinciple: 0,
                openingInterest: 0,
                interestCharge: 0,
                intrestPaid: 0,
                outstandingInterest: 0
              };
            }

            // Update monthly totals
            monthlyTotals[record.month].openingPrinciple += record.openingPrinciple || 0;
            monthlyTotals[record.month].principleAdvanced += record.principleAdvance || 0;
            monthlyTotals[record.month].principlePaid += record.principlePaid || 0;
            monthlyTotals[record.month].outstandingPrinciple += record.outstandingPrinciple || 0;
            monthlyTotals[record.month].openingInterest += record.openingInterest || 0;
            monthlyTotals[record.month].interestCharge += record.interestCharge || 0;
            monthlyTotals[record.month].intrestPaid += record.intrestPaid || 0;
            monthlyTotals[record.month].outstandingInterest += record.outstandingInterest || 0;

            // Update customer totals
            customerTotals[debtor.customerName].openingPrinciple += record.openingPrinciple || 0;
            customerTotals[debtor.customerName].principleAdvanced += record.principleAdvance || 0;
            customerTotals[debtor.customerName].principlePaid += record.principlePaid || 0;
            customerTotals[debtor.customerName].outstandingPrinciple += record.outstandingPrinciple || 0;
            customerTotals[debtor.customerName].openingInterest += record.openingInterest || 0;
            customerTotals[debtor.customerName].interestCharge += record.interestCharge || 0;
            customerTotals[debtor.customerName].intrestPaid += record.intrestPaid || 0;
            customerTotals[debtor.customerName].outstandingInterest += record.outstandingInterest || 0;
          });
        });

        return { monthlyTotals, customerTotals };
      };

      const { monthlyTotals, customerTotals } = calculateTotals();

      let tableContent = `
        <div class="search-container">
          <input type="text" id="searchInput" placeholder="Search by Customer Name">
          <button class="print-button" onclick="window.print()">Print Report</button>
        </div>
        <div class="table-container">
          <table class="borrowers-table">
            <thead>
              ${createMonthlyHeaders()}
            </thead>
            <tbody id="borrowersTableBody">
      `;

      // Add customer rows
      debtors.forEach(debtor => {
        tableContent += `<tr><td>${debtor.customerName}</td>`;
        
        uniqueMonths.forEach(month => {
          const record = debtor.monthlyRecords?.find(r => r.month === month) || {};
          
          tableContent += `
            <td>${(record.openingPrinciple || 0).toLocaleString()}</td>
            <td>${(record.principleAdvance || 0).toLocaleString()}</td>
            <td>${(record.principlePaid || 0).toLocaleString()}</td>
            <td>${(record.outstandingPrinciple || 0).toLocaleString()}</td>
            <td>${(record.openingInterest || 0).toLocaleString()}</td>
            <td>${(record.interestCharge || 0).toLocaleString()}</td>
            <td>${(record.intrestPaid || 0).toLocaleString()}</td>
            <td>${(record.outstandingInterest || 0).toLocaleString()}</td>
            <td></td> <!-- Empty column -->
          `;
        });
        
        tableContent += '</tr>';
      });

      // Add monthly totals row
      tableContent += `<tr class="total-row"><td>Monthly Totals</td>`;
      uniqueMonths.forEach(month => {
        const monthTotal = monthlyTotals[month] || {};
        tableContent += `
          <td>${(monthTotal.openingPrinciple || 0).toLocaleString()}</td>
          <td>${(monthTotal.principleAdvanced || 0).toLocaleString()}</td>
          <td>${(monthTotal.principlePaid || 0).toLocaleString()}</td>
          <td>${(monthTotal.outstandingPrinciple || 0).toLocaleString()}</td>
          <td>${(monthTotal.openingInterest || 0).toLocaleString()}</td>
          <td>${(monthTotal.interestCharge || 0).toLocaleString()}</td>
          <td>${(monthTotal.intrestPaid || 0).toLocaleString()}</td>
          <td>${(monthTotal.outstandingInterest || 0).toLocaleString()}</td>
          <td></td> <!-- Empty column -->
        `;
      });
      tableContent += '</tr>';

      tableContent += `
            </tbody>
          </table>
        </div>
      `;

      Swal.fire({
        title: 'All Time Borrowers',
        html: tableStyles + tableContent,
        background: '#2A2F34',
        color: '#ffffff',
        showCloseButton: true,
        showConfirmButton: false,
        width: '95%',
        didOpen: () => {
          const searchInput = document.getElementById('searchInput');
          const tableBody = document.getElementById('borrowersTableBody');

          searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const rows = tableBody.getElementsByTagName('tr');

            for (let row of rows) {
              if (!row.classList.contains('total-row')) {
                const customerName = row.cells[0].textContent.toLowerCase();
                row.style.display = customerName.includes(searchTerm) ? '' : 'none';
              }
            }
          });
        }
      });
      return;
    }

    if (stat.label === 'Active Borrowers') {
      if (!debtors || !Array.isArray(debtors)) {
        Swal.fire({
          title: 'No Data Available',
          text: 'There is no data available for this statistic.',
          icon: 'info',
          background: '#2A2F34',
          color: '#ffffff'
        });
        return;
      }

      const activeBorrowers = debtors.filter(debtor => debtor.status === 'active');

      const tableStyles = `
        <style>
          .borrowers-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.875rem;
          }
          .borrowers-table th, .borrowers-table td {
            padding: 8px;
            border: 1px solid rgba(255,255,255,0.1);
            white-space: nowrap;
            text-align: right;
          }
          .borrowers-table td:first-child {
            text-align: left;
            position: sticky;
            left: 0;
            background: #2A2F34;
            z-index: 1;
          }
          .borrowers-table th {
            background: #374151;
            text-align: center;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          .borrowers-table tbody tr:nth-child(even) {
            background: rgba(255,255,255,0.05);
          }
          .borrowers-table tbody tr:hover {
            background: rgba(255,255,255,0.1);
          }
          .table-container {
            max-height: 70vh;
            overflow-x: auto;
            overflow-y: auto;
          }
          .search-container {
            margin-bottom: 1rem;
            position: sticky;
            top: 0;
            z-index: 20;
            background: #2A2F34;
            padding: 1rem 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          #searchInput {
            width: 300px;
            padding: 0.5rem;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 4px;
            background: rgba(255,255,255,0.1);
            color: white;
          }
          #searchInput::placeholder {
            color: rgba(255,255,255,0.5);
          }
        </style>
      `;

      let tableContent = `
        <div class="search-container">
          <input type="text" id="searchInput" placeholder="Search by Customer Name">
        </div>
        <div class="table-container">
          <table class="borrowers-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Remaining Principal</th>
                <th>Remaining Interest</th>
              </tr>
            </thead>
            <tbody id="borrowersTableBody">
      `;

      activeBorrowers.forEach(debtor => {
        tableContent += `<tr>
          <td>${debtor.customerName}</td>
          <td>${debtor.currentOpeningPrincipal.toLocaleString()}</td>
          <td>${debtor.currentOpeningInterest.toLocaleString()}</td>
        </tr>`;
      });

      tableContent += `
            </tbody>
          </table>
        </div>
      `;

      Swal.fire({
        title: 'Active Borrowers',
        html: tableStyles + tableContent,
        background: '#2A2F34',
        color: '#ffffff',
        showCloseButton: true,
        showConfirmButton: false,
        width: '95%',
        didOpen: () => {
          const searchInput = document.getElementById('searchInput');
          const tableBody = document.getElementById('borrowersTableBody');

          searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const rows = tableBody.getElementsByTagName('tr');

            for (let row of rows) {
              const customerName = row.cells[0].textContent.toLowerCase();
              row.style.display = customerName.includes(searchTerm) ? '' : 'none';
            }
          });
        }
      });
      return;
    }

    if (stat.label === 'Overdue') {
      if (!debtors || !Array.isArray(debtors)) {
        Swal.fire({
          title: 'No Data Available',
          text: 'There is no data available for this statistic.',
          icon: 'info',
          background: '#2A2F34',
          color: '#ffffff'
        });
        return;
      }

      const overdueBorrowers = debtors.filter(debtor => debtor.status === 'overdue');

      const tableStyles = `
        <style>
          .borrowers-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.875rem;
          }
          .borrowers-table th, .borrowers-table td {
            padding: 8px;
            border: 1px solid rgba(255,255,255,0.1);
            white-space: nowrap;
            text-align: right;
          }
          .borrowers-table td:first-child {
            text-align: left;
            position: sticky;
            left: 0;
            background: #2A2F34;
            z-index: 1;
          }
          .borrowers-table th {
            background: #374151;
            text-align: center;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          .borrowers-table tbody tr:nth-child(even) {
            background: rgba(255,255,255,0.05);
          }
          .borrowers-table tbody tr:hover {
            background: rgba(255,255,255,0.1);
          }
          .table-container {
            max-height: 70vh;
            overflow-x: auto;
            overflow-y: auto;
          }
          .search-container {
            margin-bottom: 1rem;
            position: sticky;
            top: 0;
            z-index: 20;
            background: #2A2F34;
            padding: 1rem 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          #searchInput {
            width: 300px;
            padding: 0.5rem;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 4px;
            background: rgba(255,255,255,0.1);
            color: white;
          }
          #searchInput::placeholder {
            color: rgba(255,255,255,0.5);
          }
        </style>
      `;

      let tableContent = `
        <div class="search-container">
          <input type="text" id="searchInput" placeholder="Search by Customer Name">
        </div>
        <div class="table-container">
          <table class="borrowers-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Remaining Principal</th>
                <th>Remaining Interest</th>
              </tr>
            </thead>
            <tbody id="borrowersTableBody">
      `;

      overdueBorrowers.forEach(debtor => {
        tableContent += `<tr>
          <td>${debtor.customerName}</td>
          <td>${debtor.currentOpeningPrincipal.toLocaleString()}</td>
          <td>${debtor.currentOpeningInterest.toLocaleString()}</td>
        </tr>`;
      });

      tableContent += `
            </tbody>
          </table>
        </div>
      `;

      Swal.fire({
        title: 'Overdue Borrowers',
        html: tableStyles + tableContent,
        background: '#2A2F34',
        color: '#ffffff',
        showCloseButton: true,
        showConfirmButton: false,
        width: '95%',
        didOpen: () => {
          const searchInput = document.getElementById('searchInput');
          const tableBody = document.getElementById('borrowersTableBody');

          searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const rows = tableBody.getElementsByTagName('tr');

            for (let row of rows) {
              const customerName = row.cells[0].textContent.toLowerCase();
              row.style.display = customerName.includes(searchTerm) ? '' : 'none';
            }
          });
        }
      });
      return;
    }

    if (stat.label === 'Bad Debtors') {
      if (!debtors || !Array.isArray(debtors)) {
        Swal.fire({
          title: 'No Data Available',
          text: 'There is no data available for this statistic.',
          icon: 'info',
          background: '#2A2F34',
          color: '#ffffff'
        });
        return;
      }

      // Debugging: Log all debtors
      // console.log('All Debtors:', debtors);

      // const badDebtors = debtors.filter(debtor => {
      //   const isOverdue = debtor.status === 'overdue';
      //   const daysOverdue = differenceInDays(new Date(), parseISO(debtor.lastUpdated));
      //   const isBadDebtor = daysOverdue >= 90;
        
      //   // Debugging: Log each debtor's status and days overdue
      //   console.log(`Debtor: ${debtor.customerName}, Status: ${debtor.status}, Days Overdue: ${daysOverdue}, Is Bad Debtor: ${isBadDebtor}`);
        
      //   return isOverdue && isBadDebtor;
      // });

      // Debugging: Log filtered bad debtors
      console.log('Bad Debtors:', badDebtors);

      const tableStyles = `
        <style>
          .borrowers-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.875rem;
          }
          .borrowers-table th, .borrowers-table td {
            padding: 8px;
            border: 1px solid rgba(255,255,255,0.1);
            white-space: nowrap;
            text-align: right;
          }
          .borrowers-table td:first-child {
            text-align: left;
            position: sticky;
            left: 0;
            background: #2A2F34;
            z-index: 1;
          }
          .borrowers-table th {
            background: #374151;
            text-align: center;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          .borrowers-table tbody tr:nth-child(even) {
            background: rgba(255,255,255,0.05);
          }
          .borrowers-table tbody tr:hover {
            background: rgba(255,255,255,0.1);
          }
          .table-container {
            max-height: 70vh;
            overflow-x: auto;
            overflow-y: auto;
          }
          .search-container {
            margin-bottom: 1rem;
            position: sticky;
            top: 0;
            z-index: 20;
            background: #2A2F34;
            padding: 1rem 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          #searchInput {
            width: 300px;
            padding: 0.5rem;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 4px;
            background: rgba(255,255,255,0.1);
            color: white;
          }
          #searchInput::placeholder {
            color: rgba(255,255,255,0.5);
          }
        </style>
      `;

      let tableContent = `
        <div class="search-container">
          <input type="text" id="searchInput" placeholder="Search by Customer Name">
        </div>
        <div class="table-container">
          <table class="borrowers-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Remaining Principal</th>
                <th>Remaining Interest</th>
              </tr>
            </thead>
            <tbody id="borrowersTableBody">
      `;

      badDebtors.forEach(debtor => {
        tableContent += `<tr>
          <td>${debtor.customerName}</td>
          <td>${debtor.currentOpeningPrincipal.toLocaleString()}</td>
          <td>${debtor.currentOpeningInterest.toLocaleString()}</td>
        </tr>`;
      });

      tableContent += `
            </tbody>
          </table>
        </div>
      `;

      Swal.fire({
        title: 'Bad Debtors',
        html: tableStyles + tableContent,
        background: '#2A2F34',
        color: '#ffffff',
        showCloseButton: true,
        showConfirmButton: false,
        width: '95%',
        didOpen: () => {
          const searchInput = document.getElementById('searchInput');
          const tableBody = document.getElementById('borrowersTableBody');

          searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const rows = tableBody.getElementsByTagName('tr');

            for (let row of rows) {
              const customerName = row.cells[0].textContent.toLowerCase();
              row.style.display = customerName.includes(searchTerm) ? '' : 'none';
            }
          });
        }
      });
      return;
    }

    if (stat.label === 'About to Overdue') {
      if (!aboutToOverdue || !Array.isArray(aboutToOverdue)) {
        Swal.fire({
          title: 'No Data Available',
          text: 'There is no data available for this statistic.',
          icon: 'info',
          background: '#2A2F34',
          color: '#ffffff'
        });
        return;
      }

      const tableStyles = `
        <style>
          .borrowers-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.875rem;
          }
          .borrowers-table th, .borrowers-table td {
            padding: 8px;
            border: 1px solid rgba(255,255,255,0.1);
            white-space: nowrap;
            text-align: right;
          }
          .borrowers-table td:first-child {
            text-align: left;
            position: sticky;
            left: 0;
            background: #2A2F34;
            z-index: 1;
          }
          .borrowers-table th {
            background: #374151;
            text-align: center;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          .borrowers-table tbody tr:nth-child(even) {
            background: rgba(255,255,255,0.05);
          }
          .borrowers-table tbody tr:hover {
            background: rgba(255,255,255,0.1);
          }
          .table-container {
            max-height: 70vh;
            overflow-x: auto;
            overflow-y: auto;
          }
          .search-container {
            margin-bottom: 1rem;
            position: sticky;
            top: 0;
            z-index: 20;
            background: #2A2F34;
            padding: 1rem 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          #searchInput {
            width: 300px;
            padding: 0.5rem;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 4px;
            background: rgba(255,255,255,0.1);
            color: white;
          }
          #searchInput::placeholder {
            color: rgba(255,255,255,0.5);
          }
        </style>
      `;

      let tableContent = `
        <div class="search-container">
          <input type="text" id="searchInput" placeholder="Search by Customer Name">
        </div>
        <div class="table-container">
          <table class="borrowers-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Remaining Principal</th>
                <th>Remaining Interest</th>
                <th>Time to Overdue</th>
              </tr>
            </thead>
            <tbody id="borrowersTableBody">
      `;

      aboutToOverdue.forEach(debtor => {
        tableContent += `<tr>
          <td>${debtor.customerName}</td>
          <td>${debtor.currentOpeningPrincipal.toLocaleString()}</td>
          <td>${debtor.currentOpeningInterest.toLocaleString()}</td>
          <td>${debtor.monthsToDueDate > 0 ? `${debtor.monthsToDueDate} months` : `${debtor.remainingDays} days`}</td>
        </tr>`;
      });

      tableContent += `
          </tbody>
        </table>
      </div>
    `;

    Swal.fire({
      title: 'About to Overdue Borrowers',
      html: tableStyles + tableContent,
      background: '#2A2F34',
      color: '#ffffff',
      showCloseButton: true,
      showConfirmButton: false,
      width: '95%',
      didOpen: () => {
        const searchInput = document.getElementById('searchInput');
        const tableBody = document.getElementById('borrowersTableBody');

        searchInput.addEventListener('input', () => {
          const searchTerm = searchInput.value.toLowerCase();
          const rows = tableBody.getElementsByTagName('tr');

          for (let row of rows) {
            const customerName = row.cells[0].textContent.toLowerCase();
            row.style.display = customerName.includes(searchTerm) ? '' : 'none';
          }
        });
      }
    });
    return;
  }

  if (stat.label === '0 Balance Debtors') {
    if (!debtors || !Array.isArray(debtors)) {
      Swal.fire({
        title: 'No Data Available',
        text: 'There is no data available for this statistic.',
        icon: 'info',
        background: '#2A2F34',
        color: '#ffffff'
      });
      return;
    }

    const zeroBalanceDebtors = debtors.filter(debtor => debtor.status === 'completed');

    const tableStyles = `
      <style>
        .borrowers-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .borrowers-table th, .borrowers-table td {
          padding: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          white-space: nowrap;
          text-align: right;
        }
        .borrowers-table td:first-child {
          text-align: left;
          position: sticky;
          left: 0;
          background: #2A2F34;
          z-index: 1;
        }
        .borrowers-table th {
          background: #374151;
          text-align: center;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .borrowers-table tbody tr:nth-child(even) {
          background: rgba(255,255,255,0.05);
        }
        .borrowers-table tbody tr:hover {
          background: rgba(255,255,255,0.1);
        }
        .table-container {
          max-height: 70vh;
          overflow-x: auto;
          overflow-y: auto;
        }
        .search-container {
          margin-bottom: 1rem;
          position: sticky;
          top: 0;
          z-index: 20;
          background: #2A2F34;
          padding: 1rem 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        #searchInput {
          width: 300px;
          padding: 0.5rem;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 4px;
          background: rgba(255,255,255,0.1);
          color: white;
        }
        #searchInput::placeholder {
          color: rgba(255,255,255,0.5);
        }
      </style>
    `;

    let tableContent = `
      <div class="search-container">
        <input type="text" id="searchInput" placeholder="Search by Customer Name">
      </div>
      <div class="table-container">
        <table class="borrowers-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Remaining Principal</th>
              <th>Remaining Interest</th>
            </tr>
          </thead>
          <tbody id="borrowersTableBody">
    `;

    zeroBalanceDebtors.forEach(debtor => {
      tableContent += `<tr>
        <td>${debtor.customerName}</td>
        <td>${debtor.currentOpeningPrincipal.toLocaleString()}</td>
        <td>${debtor.currentOpeningInterest.toLocaleString()}</td>
      </tr>`;
    });

    tableContent += `
          </tbody>
        </table>
      </div>
    `;

    Swal.fire({
      title: '0 Balance Debtors',
      html: tableStyles + tableContent,
      background: '#2A2F34',
      color: '#ffffff',
      showCloseButton: true,
      showConfirmButton: false,
      width: '95%',
      didOpen: () => {
        const searchInput = document.getElementById('searchInput');
        const tableBody = document.getElementById('borrowersTableBody');

        searchInput.addEventListener('input', () => {
          const searchTerm = searchInput.value.toLowerCase();
          const rows = tableBody.getElementsByTagName('tr');

          for (let row of rows) {
            const customerName = row.cells[0].textContent.toLowerCase();
            row.style.display = customerName.includes(searchTerm) ? '' : 'none';
          }
        });
      }
    });
    return;
  }

    if (!stat.summary) {
      Swal.fire({
        title: 'No Summary Available',
        text: 'There is no summary available for this statistic.',
        icon: 'info',
        background: '#2A2F34',
        color: '#ffffff',
        showCloseButton: true,
        showConfirmButton: false,
        width: '32rem'
      });
      return;
    }

    Swal.fire({
      title: stat.summary.title,
      html: `
        <div class="text-left">
          <div class="mb-4">
            <div class="grid grid-cols-2 gap-4">
              ${Object.entries(stat.summary)
                .filter(([key]) => key !== 'title' && key !== 'details')
                .map(([key, value]) => `
                  <div class="font-semibold">${key.replace(/([A-Z])/g, ' $1').trim()}:</div>
                  <div>${value}</div>
                `).join('')}
            </div>
          </div>
          <div class="mt-4">
            <div class="font-semibold mb-2">Key Points:</div>
            <ul class="list-disc pl-4">
              ${stat.summary.details.map(detail => `
                <li class="mb-1">${detail}</li>
              `).join('')}
            </ul>
          </div>
        </div>
      `,
      customClass: {
        container: 'swal-wide',
        popup: 'bg-gray-800 text-white',
        title: 'text-xl font-bold mb-4',
        htmlContainer: 'text-gray-300'
      },
      background: '#2A2F34',
      color: '#ffffff',
      showCloseButton: true,
      showConfirmButton: false,
      width: '32rem'
    });
  };

  const renderContent = () => {
    if (loading) return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 animate-pulse`}>
        <div className={`h-6 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-1/2 mb-4`}></div>
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full`}></div>
              <div className="flex-1 space-y-2">
                <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-3/4`}></div>
                <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-1/2`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <Grid container spacing={1}>
        {stats.map((stat, index) => (
          <Grid item xs={12} key={index}>
            <Box 
              onClick={() => showSummary(stat)}
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 0.5,
                px: 1,
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'translateX(4px)',
                  '& .info-icon': {
                    opacity: 1
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: stat.color || '#A8B6BC',
                    fontSize: '0.875rem'
                  }}
                >
                  {stat.label}
                </Typography>
                <InfoIcon 
                  className="info-icon"
                  sx={{ 
                    fontSize: '0.875rem', 
                    color: stat.color || '#A8B6BC',
                    opacity: 0,
                    transition: 'opacity 0.2s ease'
                  }} 
                />
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: stat.color || '#fff',
                  fontWeight: 500
                }}
              >
                {stat.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Card sx={{ 
      bgcolor: '#2A2F34', 
      color: 'white',
      maxWidth: '300px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}>
      <Box sx={{ 
        p: 1.5, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 500 }}>
            Borrowers
          </Typography>
        </Box>
        <Box>
          <IconButton 
            size="small" 
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ color: '#6c757d', padding: 0 }}
          >
            {isExpanded ? <ArrowDownIcon /> : <ArrowUpIcon />}
          </IconButton>
          <IconButton size="small" sx={{ color: '#6c757d', padding: 0 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ p: 1.5 }}>
          {renderContent()}
        </Box>
      </Collapse>
    </Card>
  );
};

export default BorrowersCard;