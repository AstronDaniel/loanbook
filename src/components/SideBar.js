// Sidebar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  CreditCard,
  BookOpen,
  DollarSign,
  BarChart2,
  Settings,
  LogOut,
  PersonStanding,
  InfoIcon,
  Monitor,
  SheetIcon,
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Add Loan', icon: CreditCard, path: '/loan-management' },
    {name:'Debtors',icon:PersonStanding,path:'/debtors'},
    { name: 'Ledger', icon: BookOpen, path: '/ledger' },
    { name: 'Income Statement', icon: InfoIcon, path: '/incomeStatement' },
    { name: 'Capital Contributions', icon: Monitor, path: '/cContributions' },
    { name: 'Retained Earnings', icon: DollarSign, path: '/rEarnings' },
    { name: 'Balance Sheet', icon: SheetIcon, path: '/bSheet' },
    { name: 'Reports', icon: BarChart2, path: '/reports' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = () => {
    // Add your logout logic here
    navigate('/');
  };

  return (
    <aside 
      className={`fixed md:static inset-y-0 left-0 z-30 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white dark:bg-[#0b1019] shadow-lg`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between border-b dark:border-gray-700">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <img src="/favicon.ico" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">LoanBook</span>
          </Link>
          <button 
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-2 py-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-150 ease-in-out ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                onClick={() => {
                  if (window.innerWidth < 768) toggleSidebar();
                }}
              >
                <item.icon className="h-5 w-5" />
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900 transition-colors duration-150 ease-in-out"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;