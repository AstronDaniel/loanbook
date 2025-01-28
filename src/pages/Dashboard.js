import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { 
  Wallet, 
  Users, 
  TrendingUp, 
  Calendar,
  Menu,
  X,
  Bell,
  UserCircle,
  CreditCard,
  BookOpen,
  PieChart as PieChartIcon,
  DollarSign,
  LogOut,
  ChevronDown,
  MoreVertical
} from 'lucide-react';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Sample data - replace with actual data from your backend
  const performanceData = [
    { name: 'Jan', income: 4000, expenses: 2400 },
    { name: 'Feb', income: 3000, expenses: 1398 },
    { name: 'Mar', income: 2000, expenses: 9800 },
    { name: 'Apr', income: 2780, expenses: 3908 },
    { name: 'May', income: 1890, expenses: 4800 },
    { name: 'Jun', income: 2390, expenses: 3800 },
  ];

  const pieData = [
    { name: 'Cash at Hand', value: 400 },
    { name: 'Cash at Bank', value: 300 },
    { name: 'Outstanding Loans', value: 300 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const recentTransactions = [
    { id: 1, name: "John Doe", type: "Loan Payment", amount: 500, date: "2024-01-25", status: "Completed" },
    { id: 2, name: "Jane Smith", type: "New Loan", amount: 1000, date: "2024-01-24", status: "Pending" },
    { id: 3, name: "Mike Johnson", type: "Interest Payment", amount: 150, date: "2024-01-23", status: "Completed" },
  ];

  const stats = [
    { title: "Total Loans", value: "$12,500", icon: Wallet, trend: "+12%" },
    { title: "Active Borrowers", value: "48", icon: Users, trend: "+4%" },
    { title: "Monthly Interest", value: "$890", icon: TrendingUp, trend: "+2.5%" },
    { title: "Due Payments", value: "12", icon: Calendar, trend: "-3%" },
  ];

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
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-30 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white shadow-lg`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-600">LoanBook</h1>
            <button 
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          <nav className="flex-1 px-2 py-4">
            <div className="space-y-2">
              {[
                { name: 'Overview', icon: PieChartIcon, section: 'overview' },
                { name: 'Loans', icon: CreditCard, section: 'loans' },
                { name: 'Ledger', icon: BookOpen, section: 'ledger' },
                { name: 'Transactions', icon: DollarSign, section: 'transactions' },
              ].map((item) => (
                <button
                  key={item.section}
                  onClick={() => {
                    setActiveSection(item.section);
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                  className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 ${
                    activeSection === item.section
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="ml-3">{item.name}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t">
            <button className="flex items-center w-full p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200">
              <LogOut className="h-5 w-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button className="md:hidden p-2" onClick={toggleSidebar}>
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="h-6 w-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <UserCircle className="h-8 w-8 text-gray-600" />
                <div className="hidden md:block">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">{stat.title}</p>
                    <p className="text-lg md:text-2xl font-semibold mt-1">{stat.value}</p>
                  </div>
                  <div className="p-2 md:p-3 bg-blue-50 rounded-lg">
                    <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  </div>
                </div>
                <p className={`text-xs md:text-sm mt-2 ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend} from last month
                </p>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Performance Chart */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Financial Performance</h3>
              <div className="h-60 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="income" fill="#0088FE" />
                    <Bar dataKey="expenses" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

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
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <button className="text-blue-600 text-sm hover:underline">View All</button>
              </div>
              
              {/* Mobile Transaction Cards */}
              <div className="md:hidden space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{transaction.name}</h4>
                        <p className="text-sm text-gray-600">{transaction.type}</p>
                      </div>
                      <button className="p-1">
                        <MoreVertical className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-semibold">${transaction.amount}</span>
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-gray-600">{transaction.date}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Transaction Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-4 font-medium">Name</th>
                      <th className="pb-4 font-medium">Type</th>
                      <th className="pb-4 font-medium">Amount</th>
                      <th className="pb-4 font-medium">Date</th>
                      <th className="pb-4 font-medium">Status</th>
                      <th className="pb-4 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b">
                        <td className="py-4 font-medium">{transaction.name}</td>
                        <td className="py-4 text-gray-600">{transaction.type}</td>
                        <td className="py-4">${transaction.amount}</td>
                        <td className="py-4 text-gray-600">{transaction.date}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <button className="p-1 hover:bg-gray-100 rounded-full">
                            <MoreVertical className="h-5 w-5 text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;