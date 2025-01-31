import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'tailwindcss/tailwind.css';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import LoanManagement from './pages/LoanManagement';
import Debtors from './pages/Debtors';
import Ledger from './pages/Ledger';
import IncomeStatementDashboard from './pages/IncomeStatement';
import CapitalContribution from './pages/CapitalContribution';
import RetainedEarnings from './pages/RetainedEarnings';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import BalanceSheet from './pages/BalanceSheet';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <header className="app-header">
            <button onClick={toggleDarkMode}>
              {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </header>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/loan-management" element={<LoanManagement />} />
            <Route path="/debtors" element={<Debtors />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/incomeStatement" element={<IncomeStatementDashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/cContributions" element={<CapitalContribution />} />
            <Route path="/rEarnings" element={<RetainedEarnings />} />
            <Route path="/bSheet" element={<BalanceSheet />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
