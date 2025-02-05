import React, { useState } from 'react';
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`flex h-screen ${darkMode}`}>
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
      />
      <div className="flex-1 flex flex-col">
        <Header toggleSidebar={toggleSidebar} darkModes={darkMode} />
        <main className="flex-1 overflow-y-auto p-4">
          <Box display="flex" flexWrap="wrap" justifyContent="space-around" gap={3}>
            {/* <Box flexBasis={{ xs: '100%', sm: '48%', md: '30%' }}> */}
              <RevenueTracker />
            {/* </Box> */}
            {/* <Box flexBasis={{ xs: '100%', sm: '48%', md: '30%' }}> */}
              <ExpensesTracker />
            {/* </Box> */}
            {/* <Box flexBasis={{ xs: '100%', sm: '48%', md: '30%' }}> */}
              <NetProfitTracker />
            {/* </Box> */}
          </Box>
        </main>
      </div>
    </div>
  );
};

export default IncomeStatement;