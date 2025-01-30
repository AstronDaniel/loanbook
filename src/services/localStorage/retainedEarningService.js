export const MOCK_RETAINED_EARNINGS = {
    "2024": {
      openingBalance: 78031824,
      monthlyData: {
        "Jan": {
          distributions: {
            investor1: -2229284,
            investor2: -1164090,
            investor3: -1044981
          },
          earnings: 7543541,
          retainedEarnings: 24635676
        },
        "Feb": {
          distributions: {
            investor1: -2415736,
            investor2: -3355175,
            investor3: -1195281
          },
          earnings: 7462058,
          retainedEarnings: 7462058
        },
        "Mar": {
          distributions: {
            investor1: -2645335,
            investor2: -4592600,
            investor3: -1354817
          },
          earnings: 6576019,
          retainedEarnings: 6576019
        },
        // Add more months as needed...
      }
    }
  };
  
  export const RetainedEarningsStorageKey = 'retainedEarnings';
  
  export const retainedEarningsService = {
    initializeData: () => {
      if (!localStorage.getItem(RetainedEarningsStorageKey)) {
        localStorage.setItem(RetainedEarningsStorageKey, JSON.stringify(MOCK_RETAINED_EARNINGS));
      }
    },
  
    getData: () => {
      const data = localStorage.getItem(RetainedEarningsStorageKey);
      return data ? JSON.parse(data) : {};
    },
  
    updateMonthlyData: (year, month, newData) => {
      const allData = retainedEarningsService.getData();
      if (!allData[year]) {
        allData[year] = {
          openingBalance: 0,
          monthlyData: {}
        };
      }
      
      allData[year].monthlyData[month] = {
        ...allData[year].monthlyData[month],
        ...newData
      };
      
      localStorage.setItem(RetainedEarningsStorageKey, JSON.stringify(allData));
      return allData;
    },
  
    getYearData: (year) => {
      const allData = retainedEarningsService.getData();
      return allData[year] || null;
    },
  
    calculateMonthlyRetainedEarnings: (year, month) => {
      const yearData = retainedEarningsService.getYearData(year);
      if (!yearData || !yearData.monthlyData[month]) return 0;
  
      const monthData = yearData.monthlyData[month];
      const totalDistributions = Object.values(monthData.distributions)
        .reduce((a, b) => a + b, 0);
      
      return monthData.earnings + totalDistributions;
    },
  
    calculateYearToDate: (year, throughMonth) => {
      const yearData = retainedEarningsService.getYearData(year);
      if (!yearData) return 0;
  
      const months = Object.keys(yearData.monthlyData)
        .filter(month => month <= throughMonth);
  
      return months.reduce((total, month) => {
        const monthData = yearData.monthlyData[month];
        return total + monthData.retainedEarnings;
      }, yearData.openingBalance);
    }
  };