import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Sidebar from '../components/SideBar'; // Adjust the path as necessary
import Header from '../components/Header';   // Adjust the path as necessary
import { Wallet, Users, TrendingUp, Calendar, MoreVertical } from 'lucide-react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '../firebase'; // Adjust the path as necessary
import OverdueDebtorsCard from '../components/OverdueDebtorsCard'; // Import the new component
import BadDebtorsCard from '../components/BadDebtorsCard'; // Import the new component
import MonthlyDetailsCard from '../components/MonthlyDetailsCard'; // Import the new component
import Filters from '../components/Filters'; // Import the Filters component
import LoanDisbursementsOverTime from '../components/LoanDisbursementsOverTime'; // Import the new component
import InterestEarnedOverTime from '../components/InterestEarnedOverTime';


const db = getFirestore(app);

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalLoans: 0,
    activeBorrowers: 0,
    monthlyInterest: 0,
    duePayments: 0,
  });
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });
  const [filters, setFilters] = useState({
    searchQuery: '',
    loanType: '',
    fromDate: null,
    toDate: null,
  });
  const [filteredDebtors, setFilteredDebtors] = useState([]);

  // Theme-based color schemes
  const THEMES = {
    light: {
      background: 'bg-gray-50',
      card: 'bg-white',
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        accent: 'text-blue-600'
      },
      border: 'border-gray-200',
      shadow: 'shadow-md',
      iconBg: 'bg-blue-50'
    },
    dark: {
      background: 'bg-gray-900',
      card: 'bg-gray-800',
      text: {
        primary: 'text-gray-100',
        secondary: 'text-gray-400',
        accent: 'text-blue-400'
      },
      border: 'border-gray-700',
      shadow: 'shadow-xl',
      iconBg: 'bg-blue-900/50'
    }
  };

  // Helper function for UGX formatting
  const formatUGX = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  
  const pieData = [
    { name: 'Cash at Hand', value: 4000000 },
    { name: 'Cash at Bank', value: 3000000 },
    { name: 'Outstanding Loans', value: 3000000 },
  ];

  const fetchRecentTransactions = async () => {
    const querySnapshot = await getDocs(collection(db, 'transactions'));
    const transactionsData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        date: data.date.toDate().toLocaleDateString(), // Convert Firestore timestamp to date string
      };
    });
    setRecentTransactions(transactionsData);
  };

  const fetchStats = async () => {
    const loansSnapshot = await getDocs(collection(db, 'loans'));
    const loansData = loansSnapshot.docs.map(doc => doc.data());

    // to get duePayemnets
    const dueP = await getDocs(collection(db, 'debtors'));
    const duePData = dueP.docs.map(doc => doc.data());
    const dues = duePData.reduce((sum, data) => sum + parseInt(data.currentOpeningPrincipal), 0);

    const totalLoans = loansData.reduce((sum, loan) => sum + parseInt(loan.amount), 0);
    const activeBorrowers = loansData.length;
    const monthlyInterest = loansData.reduce((sum, loan) => sum + parseInt(loan.interestAmount), 0);
    const duePayments = dues; // Assuming all loans are due

    setStats({
      totalLoans,
      activeBorrowers,
      monthlyInterest,
      duePayments,
    });
  };

  const fetchFilteredDebtors = useCallback(async () => {
    try {
      const db = getFirestore(app);
      let debtorsQuery = collection(db, 'debtors');
      let loansQuery = collection(db, 'loans');
      let queryConstraints = [];
      let loanQueryConstraints = [];

      // Prepare loan filters first
      if (filters.loanType) {
        loanQueryConstraints.push(where('loanType', '==', filters.loanType));
      }

      if (filters.fromDate) {
        loanQueryConstraints.push(where('dueDate', '>=', filters.fromDate));
      }

      if (filters.toDate) {
        loanQueryConstraints.push(where('dueDate', '<=', filters.toDate));
      }

      // Fetch filtered loans if any loan-related constraints exist
      let filteredLoans = [];
      if (loanQueryConstraints.length > 0) {
        const loanSnapshot = await getDocs(query(loansQuery, ...loanQueryConstraints));
        filteredLoans = loanSnapshot.docs.map(doc => ({
          loanId: doc.id,
          ...doc.data()
        }));
        console.log('Filtered Loans:', filteredLoans);
      }

      // Fetch debtors
      const querySnapshot = await getDocs(debtorsQuery);
      const debtorsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Final filtering
      let filteredData = debtorsData;

      // Filter by loan type or date if loans were fetched
      if (filteredLoans.length > 0) {
        filteredData = filteredData.filter(debtor => 
          filteredLoans.some(loan => loan.loanId === debtor.loanId)
        );
      }

      // Additional client-side filtering for search query
      if (filters.searchQuery) {
        filteredData = filteredData.filter(debtor => 
          debtor.customerName.toLowerCase().includes(filters.searchQuery.toLowerCase())
        );
      }

      console.log('Fetched Debtors:', debtorsData);
      console.log('Filtered Debtors:', filteredData);

      setFilteredDebtors(filteredData);
    } catch (err) {
      console.error('Error fetching filtered debtors:', err);
    }
  }, [filters]);

  useEffect(() => {
    fetchRecentTransactions();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchFilteredDebtors();
  }, [filters, fetchFilteredDebtors]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const currentTheme = THEMES[darkMode ? 'dark' : 'light'];

  return (
    <div className={`flex h-screen ${currentTheme.background} transition-colors duration-300`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        darkMode={darkMode}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <Header 
          toggleSidebar={toggleSidebar} 
          darkMode={darkMode} 
        />

        {/* Dashboard Content */}
        <main className={`
          flex-1 overflow-y-auto p-4 
          scrollbar-thin 
          ${darkMode 
            ? 'scrollbar-thumb-gray-700 scrollbar-track-gray-800' 
            : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100'
          }
        `}>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { 
                icon: <Wallet />, 
                label: 'Principal Advanced', 
                value: stats.totalLoans, 
                change: '+12%',
                iconColor: 'text-blue-600' 
              },
              { 
                icon: <Users />, 
                label: 'Active Borrowers', 
                value: stats.activeBorrowers, 
                change: '+4%',
                iconColor: 'text-green-600' 
              },
              { 
                icon: <TrendingUp />, 
                label: 'Interest Charged', 
                value: stats.monthlyInterest, 
                change: '+2.5%',
                iconColor: 'text-purple-600' 
              },
              { 
                icon: <Calendar />, 
                label: 'Due Payments', 
                value: stats.duePayments, 
                change: '-3%',
                iconColor: 'text-red-600' 
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className={`
                  ${currentTheme.card} 
                  rounded-xl p-4 md:p-6 
                  ${currentTheme.shadow}
                  border ${currentTheme.border}
                  transform transition-all 
                  hover:-translate-y-1 hover:scale-[1.02]
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs md:text-sm ${currentTheme.text.secondary}`}>
                      {item.label}
                    </p>
                    <p className={`text-lg md:text-2xl font-semibold mt-1 ${currentTheme.text.primary}`}>
                      {typeof item.value === 'number' ? formatUGX(item.value) : item.value}
                    </p>
                  </div>
                  <div className={`p-2 md:p-3 ${currentTheme.iconBg} rounded-lg`}>
                    {React.cloneElement(item.icon, {
                      className: `h-5 w-5 md:h-6 md:w-6 ${item.iconColor}`
                    })}
                  </div>
                </div>
                <p className={`
                  text-xs md:text-sm mt-2 
                  ${item.change.startsWith('-') 
                    ? 'text-red-500' 
                    : 'text-green-500'}
                `}>
                  {item.change} from last month
                </p>
              </div>
            ))}
          </div>

          {/* Filters Section */}
          <Filters onFilterChange={handleFilterChange} darkMode={darkMode} />

          {/* Overdue and Bad Debtors Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="overflow-y-auto max-h-96">
              <OverdueDebtorsCard darkMode={darkMode} filteredDebtors={filteredDebtors} />
            </div>
            <div className="overflow-y-auto max-h-96">
              <BadDebtorsCard darkMode={darkMode} filteredDebtorss={filteredDebtors} />
            </div>
          </div>
            {/* Loan Disbursements Over Time */}
<LoanDisbursementsOverTime darkMode={darkMode} />
<br />
          {/* Asset Distribution */}
          <div className={`
            ${currentTheme.card} 
            p-4 md:p-6 
            rounded-xl 
            ${currentTheme.shadow} 
            border ${currentTheme.border} 
            mb-6
          `}>
            <h3 className={`text-lg font-semibold mb-4 ${currentTheme.text.primary}`}>
              Asset Distribution
            </h3>
            <div className="h-60 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1F2937' : 'white', 
                      color: darkMode ? 'white' : 'black' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {pieData.map((entry, index) => (
                  <div 
                    key={`legend-${index}`} 
                    className="flex items-center"
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index] }} 
                    />
                    <span className={`text-xs md:text-sm ${currentTheme.text.secondary}`}>
                      {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
{/* Interest Earned Over Time */}
<InterestEarnedOverTime darkMode={darkMode} />
<br />
          {/* Monthly Details Card */}
          <MonthlyDetailsCard darkMode={darkMode} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;