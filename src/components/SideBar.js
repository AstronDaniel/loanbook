import React,{useState} from 'react';
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

const Sidebar = ({ isSidebarOpen, toggleSidebar, darkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [localdarkMode, setlocalDarkMode] = useState(() => {
     const savedDarkMode = localStorage.getItem('darkMode');
     return savedDarkMode ? JSON.parse(savedDarkMode) : false;
   });
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Add Loan', icon: CreditCard, path: '/loan-management' },
    { name: 'Debtors', icon: PersonStanding, path: '/debtors' },
    { name: 'Ledger', icon: BookOpen, path: '/ledger' },
    { name: 'Income Statement', icon: InfoIcon, path: '/incomeStatement' },
    { name: 'Capital Contributions', icon: Monitor, path: '/cContributions' },
    { name: 'Retained Earnings', icon: DollarSign, path: '/rEarnings' },
    { name: 'Balance Sheet', icon: SheetIcon, path: '/bSheet' },
    { name: 'Reports', icon: BarChart2, path: '/reports' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = () => {
    navigate('/');
  };
{console.log('localdarkMode: ',localdarkMode, 'darkMode: ',darkMode)}
  return (
    
    <aside 
      className={`
        fixed md:static inset-y-0 left-0 z-30 
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-all duration-300 ease-in-out w-64
        ${(darkMode || localdarkMode)
          ? 'bg-gradient-to-b from-gray-900 via-[#0b1019] to-gray-900 border-r border-slate-800'
          : 'bg-white border-r border-gray-200'}
        backdrop-blur-xl
      `}
    >
      {/* Decorative elements for dark mode */}
      {(darkMode || localdarkMode) && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        </>
      )}

      <div className="relative flex flex-col h-full">
        {/* Logo section */}
        <div className={`
          p-4 flex items-center justify-between
          border-b transition-colors duration-300
          ${(darkMode || localdarkMode) ? 'border-slate-800/80' : 'border-gray-200'}
        `}>
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className={`
              relative h-8 w-8 rounded-lg overflow-hidden
              ${(darkMode || localdarkMode) ? 'bg-blue-500/10' : 'bg-blue-50'}
              transition-colors duration-300
            `}>
              <img 
                src="/favicon.ico" 
                alt="Logo" 
                className="h-full w-full object-cover transform transition-transform group-hover:scale-110" 
              />
              {(darkMode || localdarkMode)&& (
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20" />
              )}
            </div>
            <span className={`
              text-xl font-bold bg-clip-text text-transparent 
              ${(darkMode || localdarkMode) 
                ? 'bg-gradient-to-r from-blue-400 to-blue-300'
                : 'bg-gradient-to-r from-blue-600 to-blue-500'}
            `}>
              LoanBook
            </span>
          </Link>
          <button 
            onClick={toggleSidebar}
            className={`
              md:hidden p-2 rounded-lg transition-colors duration-200
              ${(darkMode || localdarkMode)
                ? 'hover:bg-white/5 text-gray-400 hover:text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'}
            `}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-4 py-3 text-sm rounded-lg
                  transition-all duration-200 ease-in-out
                  group relative
                  ${isActive
                    ? (darkMode || localdarkMode)
                      ? 'bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-300'
                      : 'bg-blue-50 text-blue-600'
                    : (darkMode || localdarkMode)
                      ? 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                      : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
                onClick={() => {
                  if (window.innerWidth < 768) toggleSidebar();
                }}
              >
                {(darkMode || localdarkMode) && isActive && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent opacity-50" />
                )}
                <item.icon className={`
                  h-5 w-5 transition-transform duration-200
                  ${isActive && 'transform scale-110'}
                `} />
                <span className="ml-3">{item.name}</span>
                {(darkMode || localdarkMode) && isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-blue-500 rounded-full transform -translate-x-4" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout section */}
        <div className={`
          p-4 border-t transition-colors duration-300
          ${(darkMode || localdarkMode) ? 'border-slate-800/80' : 'border-gray-200'}
        `}>
          <button
            onClick={handleLogout}
            className={`
              flex items-center w-full px-4 py-3 text-sm rounded-lg
              transition-all duration-200 ease-in-out
              ${(darkMode || localdarkMode) 
                ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' 
                : 'text-red-600 hover:bg-red-50'}
            `}
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