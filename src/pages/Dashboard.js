import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, BarChart, Bar } from 'recharts';
import Sidebar from '../components/SideBar'; // Adjust the path as necessary
import Header from '../components/Header';   // Adjust the path as necessary
import { Wallet, Users, TrendingUp, Calendar, MoreVertical, AlertTriangle } from 'lucide-react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../firebase'; // Adjust the path as necessary
import { TextField, Select, MenuItem, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
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
  const [loanDisbursementsData, setLoanDisbursementsData] = useState([]);
  const [interestEarnedData, setInterestEarnedData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLoanType, setFilterLoanType] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [overdueLoans, setOverdueLoans] = useState(0);
  const [badDebtors, setBadDebtors] = useState(0);

  // Helper function to safely parse dates from Firestore
  const parseDueDate = (date) => {
    if (!date) return null;
    
    try {
      // Handle Firestore Timestamp
      if (typeof date.toDate === 'function') {
        return date.toDate();
      }
      
      // Handle JavaScript Date object
      if (date instanceof Date) {
        return date;
      }
      
      // Handle string or timestamp number
      return new Date(date);
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  };

  // Helper function to calculate days overdue
  const getDaysOverdue = (dueDate) => {
    const parsedDate = parseDueDate(dueDate);
    if (!parsedDate) return 0;
    
    const currentDate = new Date();
    const diffTime = currentDate - parsedDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

  const fetchStats = async () => {
    try {
      const loansSnapshot = await getDocs(collection(db, 'loans'));
      const loansData = loansSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));

      // Calculate stats
      const totalLoans = loansData.reduce((sum, loan) => sum + (parseInt(loan.amount) || 0), 0);
      const activeBorrowers = loansData.length;
      const monthlyInterest = loansData.reduce((sum, loan) => sum + (parseInt(loan.interestAmount) || 0), 0);
      const duePayments = loansData.reduce((sum, loan) => sum + (parseInt(loan.amount) || 0), 0);

      // Calculate overdue loans
      const overdueLoansCount = loansData.filter(loan => {
        const daysOverdue = getDaysOverdue(loan.dueDate);
        return daysOverdue > 0;
      }).length;

      // Calculate bad debtors (over 90 days)
      const badDebtorsCount = loansData.filter(loan => {
        const daysOverdue = getDaysOverdue(loan.dueDate);
        return daysOverdue > 90;
      }).length;

      setStats({
        totalLoans,
        activeBorrowers,
        monthlyInterest,
        duePayments,
      });
      setOverdueLoans(overdueLoansCount);
      setBadDebtors(badDebtorsCount);

    } catch (error) {
      console.error('Error fetching stats:', error);
      // You might want to add error state handling here
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'transactions'));
      const transactionsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const date = parseDueDate(data.date);
        
        return {
          ...data,
          id: doc.id,
          date: date ? date.toLocaleDateString() : 'Invalid Date',
        };
      });
      setRecentTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // You might want to add error state handling here
    }
  };

  useEffect(() => {
    fetchRecentTransactions();
    fetchStats();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
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
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Total Loans</p>
                  <p className="text-lg md:text-2xl font-semibold mt-1">{formatUGX(stats.totalLoans)}</p>
                </div>
                <div className="p-2 md:p-3 bg-blue-50 rounded-lg">
                  <Wallet className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs md:text-sm mt-2 text-green-600">+12% from last month</p>
            </div>
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Active Borrowers</p>
                  <p className="text-lg md:text-2xl font-semibold mt-1">{stats.activeBorrowers}</p>
                </div>
                <div className="p-2 md:p-3 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs md:text-sm mt-2 text-green-600">+4% from last month</p>
            </div>
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Monthly Interest</p>
                  <p className="text-lg md:text-2xl font-semibold mt-1">{formatUGX(stats.monthlyInterest)}</p>
                </div>
                <div className="p-2 md:p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs md:text-sm mt-2 text-green-600">+2.5% from last month</p>
            </div>
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Due Payments</p>
                  <p className="text-lg md:text-2xl font-semibold mt-1">{formatUGX(stats.duePayments)}</p>
                </div>
                <div className="p-2 md:p-3 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs md:text-sm mt-2 text-red-600">-3% from last month</p>
            </div>
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Overdue Loans</p>
                  <p className="text-lg md:text-2xl font-semibold mt-1">{overdueLoans}</p>
                </div>
                <div className="p-2 md:p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                </div>
              </div>
              <p className="text-xs md:text-sm mt-2 text-red-600">-5% from last month</p>
            </div>
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Bad Debtors</p>
                  <p className="text-lg md:text-2xl font-semibold mt-1">{badDebtors}</p>
                </div>
                <div className="p-2 md:p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                </div>
              </div>
              <p className="text-xs md:text-sm mt-2 text-red-600">-5% from last month</p>
            </div>
          </div>

          {/* Asset Distribution and Bad Debtors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Asset Distribution */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Asset Distribution</h3>
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
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {pieData.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }} />
                      <span className="text-xs md:text-sm text-gray-600">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bad Debtors */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Bad Debtors</h3>
              <div className="h-60 md:h-80 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-600">{badDebtors}</p>
                  <p className="text-sm text-gray-600 mt-2">Debtors exceeding 90 days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Charts and Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Loan Disbursements Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={loanDisbursementsData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Interest Earned Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={interestEarnedData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="interest" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Activities</h3>
                <button className="text-blue-600 text-sm hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{activity.description}</h4>
                        <p className="text-sm text-gray-600">{activity.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <TextField
                fullWidth
                label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
              />
              <Select
                fullWidth
                value={filterLoanType}
                onChange={(e) => setFilterLoanType(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">All Loan Types</MenuItem>
                <MenuItem value="Personal">Personal Loan</MenuItem>
                <MenuItem value="Business">Business Loan</MenuItem>
                <MenuItem value="Education">Education Loan</MenuItem>
                <MenuItem value="Home">Home Loan</MenuItem>
              </Select>
              <TextField
                fullWidth
                label="From Date"
                type="date"
                value={filterFromDate}
                onChange={(e) => setFilterFromDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                fullWidth
                label="To Date"
                type="date"
                value={filterToDate}
                onChange={(e) => setFilterToDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;