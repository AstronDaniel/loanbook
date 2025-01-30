import { MOCK_INVESTORS, MOCK_CONTRIBUTIONS } from './mockData';

export const StorageKeys = {
  INVESTORS: 'investors',
  CONTRIBUTIONS: 'contributions'
};

export const localStorageService = {
  initializeData: () => {
    if (!localStorage.getItem(StorageKeys.INVESTORS)) {
      localStorage.setItem(StorageKeys.INVESTORS, JSON.stringify(MOCK_INVESTORS));
    }
    if (!localStorage.getItem(StorageKeys.CONTRIBUTIONS)) {
      localStorage.setItem(StorageKeys.CONTRIBUTIONS, JSON.stringify(MOCK_CONTRIBUTIONS));
    }
  },

  getInvestors: () => {
    const data = localStorage.getItem(StorageKeys.INVESTORS);
    return data ? JSON.parse(data) : [];
  },

  getContributions: () => {
    const data = localStorage.getItem(StorageKeys.CONTRIBUTIONS);
    return data ? JSON.parse(data) : {};
  },

  updateInvestor: (investorId, updatedData) => {
    const investors = localStorageService.getInvestors();
    const index = investors.findIndex(inv => inv.id === investorId);
    if (index !== -1) {
      investors[index] = { ...investors[index], ...updatedData };
      localStorage.setItem(StorageKeys.INVESTORS, JSON.stringify(investors));
      return true;
    }
    return false;
  },

  addContribution: (month, investorId, contributionData) => {
    const contributions = localStorageService.getContributions();
    if (!contributions[month]) {
      contributions[month] = {};
    }
    contributions[month][investorId] = {
      ...contributionData,
      date: new Date().toISOString().split('T')[0],
      transactionId: `TX-${month}-${investorId}-${Date.now()}`,
      status: 'completed'
    };
    localStorage.setItem(StorageKeys.CONTRIBUTIONS, JSON.stringify(contributions));
  },

  updateContribution: (month, investorId, amount) => {
    const contributions = localStorageService.getContributions();
    if (contributions[month] && contributions[month][investorId]) {
      contributions[month][investorId] = {
        ...contributions[month][investorId],
        amount: parseFloat(amount),
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(StorageKeys.CONTRIBUTIONS, JSON.stringify(contributions));
      return true;
    }
    return false;
  },

  getInvestorContributions: (investorId) => {
    const contributions = localStorageService.getContributions();
    const investorContributions = {};
    Object.entries(contributions).forEach(([month, monthData]) => {
      if (monthData[investorId]) {
        investorContributions[month] = monthData[investorId];
      }
    });
    return investorContributions;
  },

  getMonthlyContributions: (month) => {
    const contributions = localStorageService.getContributions();
    return contributions[month] || {};
  },

  calculateLifetimeTotal: (investorId) => {
    const contributions = localStorageService.getContributions();
    return Object.values(contributions).reduce((total, monthData) => {
      return total + (monthData[investorId]?.amount || 0);
    }, 0);
  }
};

export const initializeCapitalContributions = () => {
  localStorageService.initializeData();

  const investors = localStorageService.getInvestors();
  const contributions = localStorageService.getContributions();
  
  const contributionData = {};
  Object.entries(contributions).forEach(([month, monthData]) => {
    contributionData[month] = {};
    Object.entries(monthData).forEach(([investorId, data]) => {
      contributionData[month][investorId] = data.amount;
    });
  });

  return {
    investors,
    contributions: contributionData
  };
};