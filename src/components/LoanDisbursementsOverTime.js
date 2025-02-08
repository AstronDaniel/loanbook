import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getFirestore, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { app } from '../firebase'; // Adjust path as necessary
import { TrendingUp, Calendar, DollarSign,Users } from 'lucide-react';

const LoanDisbursementsOverTime = ({ darkMode }) => {
  const [disbursementData, setDisbursementData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalLoans: 0,
    totalInterest: 0,
    averageLoanAmount: 0,
    totalActiveBorrowers: 0
  });

  // Theme-based color schemes
  const THEMES = {
    light: {
      background: 'bg-white',
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600'
      },
      border: 'border-gray-200',
      shadow: 'shadow-md'
    },
    dark: {
      background: 'bg-gray-800',
      text: {
        primary: 'text-gray-100',
        secondary: 'text-gray-400'
      },
      border: 'border-gray-700',
      shadow: 'shadow-xl'
    }
  };

  const currentTheme = THEMES[darkMode ? 'dark' : 'light'];

  // Helper function for UGX formatting
  const formatUGX = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  // Fetch loan disbursement data
  const fetchLoanDisbursements = async () => {
    const db = getFirestore(app);
    try {
      // Fetch loans
      const loansRef = collection(db, 'loans');
      const loansSnapshot = await getDocs(loansRef);
      
      // Fetch debtors to match with loans
      const debtorsRef = collection(db, 'debtors');
      const debtorsSnapshot = await getDocs(debtorsRef);

      // Process loan data
      const processedLoans = loansSnapshot.docs.map(doc => {
        const loanData = doc.data();
        return {
          ...loanData,
          amount: Number(loanData.amount),
          interestAmount: Number(loanData.interestAmount),
          startDate: new Date(loanData.startDate)
        };
      });

      // Group loans by month
      const monthlyDisbursements = processedLoans.reduce((acc, loan) => {
        const monthKey = loan.startDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        const existingMonth = acc.find(item => item.month === monthKey);

        if (existingMonth) {
          existingMonth.totalLoans += loan.amount;
          existingMonth.loanCount += 1;
          existingMonth.totalInterest += loan.interestAmount;
        } else {
          acc.push({
            month: monthKey,
            totalLoans: loan.amount,
            loanCount: 1,
            totalInterest: loan.interestAmount
          });
        }

        return acc;
      }, []);

      // Sort monthly disbursements chronologically
      monthlyDisbursements.sort((a, b) => {
        const dateA = new Date(`01 ${a.month}`);
        const dateB = new Date(`01 ${b.month}`);
        return dateA - dateB;
      });

      // Calculate summary statistics
      const totalLoans = processedLoans.reduce((sum, loan) => sum + loan.amount, 0);
      const totalInterest = processedLoans.reduce((sum, loan) => sum + loan.interestAmount, 0);
      const averageLoanAmount = totalLoans / processedLoans.length;
      const totalActiveBorrowers = new Set(processedLoans.map(loan => loan.customerName)).size;

      setDisbursementData(monthlyDisbursements);
      setSummaryStats({
        totalLoans,
        totalInterest,
        averageLoanAmount,
        totalActiveBorrowers
      });
    } catch (error) {
      console.error("Error fetching loan disbursements:", error);
    }
  };

  useEffect(() => {
    fetchLoanDisbursements();
  }, []);

  return (
    <div className={`
      ${currentTheme.background} 
      ${currentTheme.shadow} 
      border ${currentTheme.border} 
      rounded-xl 
      p-4 md:p-6
    `}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold ${currentTheme.text.primary}`}>
          Loan Disbursements Overview
        </h3>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { 
            icon: <DollarSign />, 
            label: 'Total Loan Amount', 
            value: formatUGX(summaryStats.totalLoans),
            color: 'text-green-500'
          },
          { 
            icon: <Calendar />, 
            label: 'Total Interest', 
            value: formatUGX(summaryStats.totalInterest),
            color: 'text-blue-500'
          },
          { 
            icon: <TrendingUp />, 
            label: 'Avg Loan Amount', 
            value: formatUGX(summaryStats.averageLoanAmount),
            color: 'text-purple-500'
          },
          { 
            icon: <Users />, 
            label: 'Active Borrowers', 
            value: summaryStats.totalActiveBorrowers,
            color: 'text-red-500'
          }
        ].map((stat, index) => (
          <div 
            key={index} 
            className={`
              ${currentTheme.background} 
              border ${currentTheme.border} 
              rounded-lg 
              p-4 
              flex items-center
            `}
          >
            <div className={`mr-4 p-2 rounded-full ${stat.color} bg-opacity-10`}>
              {React.cloneElement(stat.icon, { className: 'w-6 h-6' })}
            </div>
            <div>
              <p className={`text-xs ${currentTheme.text.secondary}`}>{stat.label}</p>
              <p className={`text-md font-semibold ${currentTheme.text.primary}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Line Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={disbursementData}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={darkMode ? '#374151' : '#e5e7eb'} 
            />
            <XAxis 
              dataKey="month" 
              stroke={darkMode ? '#9CA3AF' : '#6B7280'} 
            />
            <YAxis 
              stroke={darkMode ? '#9CA3AF' : '#6B7280'}
              tickFormatter={(value) => formatUGX(value)}
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'totalLoans') return [formatUGX(value), 'Total Loan Amount'];
                if (name === 'totalInterest') return [formatUGX(value), 'Total Interest'];
                return [value, name];
              }}
              contentStyle={{ 
                backgroundColor: darkMode ? '#1F2937' : 'white', 
                color: darkMode ? 'white' : 'black' 
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="totalLoans" 
              name="Loan Amount"
              stroke="#8884d8" 
              strokeWidth={2} 
              activeDot={{ r: 8 }} 
            />
            <Line 
              type="monotone" 
              dataKey="loanCount" 
              name="Number of Loans"
              stroke="#82ca9d" 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LoanDisbursementsOverTime;