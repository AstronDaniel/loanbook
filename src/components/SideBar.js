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
  LogOut
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Loans', icon: CreditCard, path: '/loan-management' },
    { name: 'Ledger', icon: BookOpen, path: '/ledger' },
    { name: 'Transactions', icon: DollarSign, path: '/transactions' },
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
      } md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white shadow-lg`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between border-b">
          <Link to="/dashboard" className="text-xl font-bold text-blue-600">
            LoanBook
          </Link>
          <button 
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
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

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-150 ease-in-out"
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