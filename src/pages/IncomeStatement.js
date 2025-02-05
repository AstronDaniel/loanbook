import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Header from '../components/Header';
import Sidebar from '../components/SideBar';
import RevenueTracker from '../components/RevenueTracker';
import ExpensesTracker from '../components/ExpenseTracker';
import NetProfitTracker from '../components/NetProfitTracker';

const IncomeStatement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`flex h-screen bg-white dark:bg-gray-900 transition-colors duration-200`}>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <div className="flex-1 flex flex-col">
        <Header 
          toggleSidebar={toggleSidebar} 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode}
        />
        <main className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900">
          <Box display="flex" flexWrap="wrap" justifyContent="space-around" gap={3}>
            <RevenueTracker darkMode={darkMode} />
            <ExpensesTracker darkMode={darkMode} />
            <NetProfitTracker darkMode={darkMode} />
          </Box>
        </main>
      </div>
    </div>
  );
};

export default IncomeStatement;