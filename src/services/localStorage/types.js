// types.js
export const MOCK_INVESTORS = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      company: "Tech Ventures LLC",
      joinDate: "2024-01-15",
      status: "active",
      profile: {
        type: "accredited",
        investmentPreference: "growth",
        riskTolerance: "moderate",
        minInvestment: 25000,
        maxInvestment: 500000,
        preferredSectors: ["technology", "healthcare", "fintech"]
      },
      documents: {
        accreditationProof: "verified",
        identificationStatus: "verified",
        lastVerificationDate: "2024-01-15"
      },
      bankingDetails: {
        accountName: "John Doe Investments",
        accountType: "business",
        verificationStatus: "verified"
      },
      communicationPreferences: {
        emailNotifications: true,
        monthlyReports: true,
        quarterlyMeetings: true
      }
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      company: "Smith Capital Partners",
      joinDate: "2024-02-01",
      status: "active",
      profile: {
        type: "institutional",
        investmentPreference: "balanced",
        riskTolerance: "high",
        minInvestment: 100000,
        maxInvestment: 2000000,
        preferredSectors: ["real-estate", "renewable-energy", "biotech"]
      },
      documents: {
        accreditationProof: "verified",
        identificationStatus: "verified",
        lastVerificationDate: "2024-02-01"
      },
      bankingDetails: {
        accountName: "Smith Capital Investments",
        accountType: "institutional",
        verificationStatus: "verified"
      },
      communicationPreferences: {
        emailNotifications: true,
        monthlyReports: true,
        quarterlyMeetings: false
      }
    }
  ];
  
  export const MOCK_CONTRIBUTIONS = {
    "2024-01": {
      1: {
        amount: 50000,
        date: "2024-01-15",
        type: "initial",
        status: "completed",
        transactionId: "TX-2024-01-15-001",
        notes: "Initial investment"
      },
      2: {
        amount: 75000,
        date: "2024-01-20",
        type: "initial",
        status: "completed",
        transactionId: "TX-2024-01-20-001",
        notes: "First round investment"
      }
    },
    "2024-02": {
      1: {
        amount: 25000,
        date: "2024-02-10",
        type: "follow-on",
        status: "completed",
        transactionId: "TX-2024-02-10-001",
        notes: "Follow-on investment"
      },
      2: {
        amount: 100000,
        date: "2024-02-15",
        type: "follow-on",
        status: "completed",
        transactionId: "TX-2024-02-15-001",
        notes: "Second round investment"
      }
    },
    "2024-03": {
      1: {
        amount: 60000,
        date: "2024-03-05",
        type: "follow-on",
        status: "completed",
        transactionId: "TX-2024-03-05-001",
        notes: "Q1 additional investment"
      },
      2: {
        amount: 80000,
        date: "2024-03-10",
        type: "follow-on",
        status: "completed",
        transactionId: "TX-2024-03-10-001",
        notes: "Q1 capital call"
      }
    }
  };
  
  // localStorageService.js
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
  
  // Usage in CapitalContributions component
  export const initializeCapitalContributions = () => {
    // Initialize data in localStorage when the app starts
    localStorageService.initializeData();
  
    // Example usage of the service
    const investors = localStorageService.getInvestors();
    const contributions = localStorageService.getContributions();
    
    // Format data for the component
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