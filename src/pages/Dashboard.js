import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import Sidebar from '../components/SideBar'; // Adjust the path as necessary
import Header from '../components/Header';   // Adjust the path as necessary
import { Wallet, Users, TrendingUp, Calendar, MoreVertical } from 'lucide-react';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Helper function for UGX formatting
  const formatUGX = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    { title: "Total Loans", value: formatUGX(12500000), icon: Wallet, trend: "+12%" },
    { title: "Active Borrowers", value: "48", icon: Users, trend: "+4%" },
    { title: "Monthly Interest", value: formatUGX(890000), icon: TrendingUp, trend: "+2.5%" },
    { title: "Due Payments", value: formatUGX(12000000), icon: Calendar, trend: "-3%" },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  
  const performanceData = [
    { name: 'Jan', income: 4000000, expenses: 2400000 },
    { name: 'Feb', income: 3000000, expenses: 1398000 },
    { name: 'Mar', income: 2000000, expenses: 9800000 },
    { name: 'Apr', income: 2780000, expenses: 3908000 },
    { name: 'May', income: 1890000, expenses: 4800000 },
    { name: 'Jun', income: 2390000, expenses: 3800000 },
  ];

  const pieData = [
    { name: 'Cash at Hand', value: 4000000 },
    { name: 'Cash at Bank', value: 3000000 },
    { name: 'Outstanding Loans', value: 3000000 },
  ];

  const recentTransactions = [
    { id: 1, name: "John Doe", type: "Loan Payment", amount: 500000, date: "2024-01-25", status: "Completed" },
    { id: 2, name: "Jane Smith", type: "New Loan", amount: 1000000, date: "2024-01-24", status: "Pending" },
    { id: 3, name: "Mike Johnson", type: "Interest Payment", amount: 150000, date: "2024-01-23", status: "Completed" },
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
                      <span className="text-lg font-semibold">{formatUGX(transaction.amount)}</span>
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
                        <td className="py-4">{formatUGX(transaction.amount)}</td>
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