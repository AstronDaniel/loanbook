// Header.js
import React, { useEffect, useState } from 'react';
import { Menu, Bell, UserCircle, ChevronDown, Moon, Sun } from 'lucide-react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Header = ({ toggleSidebar, darkMode, toggleDarkMode }) => {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <header className="bg-white shadow-sm dark:bg-gray-800">
      <div className="flex items-center justify-between p-4">
        <button className="md:hidden p-2" onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
            <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            {darkMode ? <Sun className="h-6 w-6 text-gray-600 dark:text-gray-300" /> : <Moon className="h-6 w-6 text-gray-600 dark:text-gray-300" />}
          </button>
          <div className="flex items-center space-x-2">
            <UserCircle className="h-8 w-8 text-gray-600 dark:text-gray-300" />
            <div className="hidden md:block">
              {user ? (
                <>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.displayName || user.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                </>
              ) : (
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Loading...</p>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;