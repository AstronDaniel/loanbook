import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { app } from '../firebase'; // Adjust path as necessary
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

const InterestEarnedOverTime = ({ darkMode }) => {
  const [interestData, setInterestData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalInterestEarned: 0,
    averageMonthlyInterest: 0,
    highestInterestMonth: '',
    projectedAnnualInterest: 0
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

  // Fetch interest data
  const fetchInterestData = async () => {
    const db = getFirestore(app);
    try {
      // Fetch loans
      const loansRef = collection(db, 'loans');
      const loansSnapshot = await getDocs(loansRef);
      
      // Process loan data
      const processedLoans = loansSnapshot.docs.map(doc => {
        const loanData = doc.data();
        return {
          ...loanData,
          interestAmount: Number(loanData.interestAmount),
          startDate: new Date(loanData.startDate)
        };
      });

      // Group interest by month
      const monthlyInterest = processedLoans.reduce((acc, loan) => {
        const monthKey = loan.startDate.toLocaleString('default', { 
          month: 'short', 
          year: 'numeric' 
        });
        
        const existingMonth = acc.find(item => item.month === monthKey);

        if (existingMonth) {
          existingMonth.interest += loan.interestAmount;
          existingMonth.loanCount += 1;
        } else {
          acc.push({
            month: monthKey,
            interest: loan.interestAmount,
            loanCount: 1
          });
        }

        return acc;
      }, []);

      // Sort monthly interest chronologically
      monthlyInterest.sort((a, b) => {
        const dateA = new Date(`01 ${a.month}`);
        const dateB = new Date(`01 ${b.month}`);
        return dateA - dateB;
      });

      // Calculate summary statistics
      const totalInterestEarned = monthlyInterest.reduce(
        (sum, item) => sum + item.interest, 
        0
      );
      const averageMonthlyInterest = totalInterestEarned / monthlyInterest.length;
      const highestInterestMonth = monthlyInterest.reduce(
        (prev, current) => (prev.interest > current.interest) ? prev : current
      ).month;
      const projectedAnnualInterest = totalInterestEarned * (12 / monthlyInterest.length);

      setInterestData(monthlyInterest);
      setSummaryStats({
        totalInterestEarned,
        averageMonthlyInterest,
        highestInterestMonth,
        projectedAnnualInterest
      });
    } catch (error) {
      console.error("Error fetching interest data:", error);
    }
  };

  useEffect(() => {
    fetchInterestData();
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
          Interest Earned Analysis
        </h3>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { 
            icon: <DollarSign />, 
            label: 'Total Interest Earned', 
            value: formatUGX(summaryStats.totalInterestEarned),
            color: 'text-green-500'
          },
          { 
            icon: <Calendar />, 
            label: 'Peak Interest Month', 
            value: summaryStats.highestInterestMonth,
            color: 'text-blue-500'
          },
          { 
            icon: <TrendingUp />, 
            label: 'Avg Monthly Interest', 
            value: formatUGX(summaryStats.averageMonthlyInterest),
            color: 'text-purple-500'
          },
          { 
            icon: <TrendingUp />, 
            label: 'Projected Annual Interest', 
            value: formatUGX(summaryStats.projectedAnnualInterest),
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

      {/* Bar Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={interestData}>
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
                if (name === 'interest') return [formatUGX(value), 'Interest Earned'];
                return [value, name];
              }}
              contentStyle={{ 
                backgroundColor: darkMode ? '#1F2937' : 'white', 
                color: darkMode ? 'white' : 'black' 
              }}
            />
            <Legend />
            <Bar 
              dataKey="interest" 
              name="Interest Earned"
              fill="#8884d8" 
            />
            <Bar 
              dataKey="loanCount" 
              name="Number of Loans"
              fill="#82ca9d" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InterestEarnedOverTime;