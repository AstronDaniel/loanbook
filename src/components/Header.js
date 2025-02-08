import React, { useEffect, useState } from 'react';
import { 
  Menu, 
  Bell, 
  UserCircle, 
  ChevronDown,
  Settings,
  Search
} from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Header = ({ toggleSidebar, darkModes }) => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
   const [darkMode, setDarkMode] = useState(() => {
      const savedDarkMode = localStorage.getItem('darkMode');
      return savedDarkMode ? JSON.parse(savedDarkMode) : false;
    });
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <header className={`
      relative
      ${darkMode 
        ? 'bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 border-b border-slate-800'
        : 'bg-white border-b border-gray-200'}
      backdrop-blur-xl
      supports-backdrop-blur:bg-white/95
      transition-all duration-300 ease-in-out
    `}>
      {/* Decorative elements for dark mode */}
      {darkMode && (
        <>
          {/* Glowing top border */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          
          {/* Ambient glow effects */}
          <div className="absolute -top-10 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -top-10 right-1/4 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl" />
          
          {/* Tech pattern overlay */}
          <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] bg-center" />
        </>
      )}

      <div className="relative flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button 
            className={`md:hidden p-2 rounded-lg transition-colors duration-200 ${
              darkMode 
                ? 'hover:bg-white/10 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Search bar */}
          {/* <div className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
            darkMode 
              ? 'bg-slate-800/50 border border-slate-700'
              : 'bg-gray-100 border border-gray-200'
          }`}>
            <Search className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Quick search..."
              className={`bg-transparent border-none focus:outline-none text-sm w-48 ${
                darkMode ? 'text-gray-300 placeholder-gray-500' : 'text-gray-600 placeholder-gray-400'
              }`}
            />
          </div> */}
        </div>

        <div className="flex items-center space-x-4">
          {/* Notification button with animation */}
          <button className={`
            p-2 rounded-lg relative group transition-colors duration-200
            ${darkMode 
              ? 'hover:bg-white/10 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-600'}
          `}>
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full 
              animate-ping duration-1000" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User profile section */}
          <div 
            className={`
              flex items-center space-x-3 px-3 py-1.5 rounded-lg cursor-pointer
              transition-all duration-200
              ${darkMode 
                ? 'hover:bg-white/10 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'}
            `}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="relative">
              <UserCircle className="h-8 w-8" />
              <span className={`
                absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 
                ${darkMode ? 'border-slate-900' : 'border-white'}
                bg-green-500
              `} />
            </div>
            
            <div className="hidden md:block">
              {user ? (
                <div>
                  <p className={`text-sm font-medium ${
                    darkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    {user.displayName || user.email}
                  </p>
                  <p className={`text-xs ${
                    darkMode ? 'text-indigo-400' : 'text-gray-500'
                  }`}>
                    Admin
                  </p>
                </div>
              ) : (
                <p className={`text-sm font-medium ${
                  darkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Loading...
                </p>
              )}
            </div>
            
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
              showDropdown ? 'rotate-180' : ''
            }`} />
          </div>

          {/* Settings button with hover effect */}
          <button className={`
            hidden md:flex p-2 rounded-lg transition-colors duration-200
            ${darkMode 
              ? 'hover:bg-white/10 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-600'}
          `}>
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;