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