import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart2 
} from 'lucide-react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../firebase';

const MonthlyDetailsCard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyDetails, setMonthlyDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonthlyDetails = async () => {
      try {
        setLoading(true);
        const db = getFirestore(app);
        const month = selectedDate.getMonth() + 1;
        const year = selectedDate.getFullYear();
        const monthString = `${year}-${month < 10 ? '0' : ''}${month}`;

        const querySnapshot = await getDocs(collection(db, 'debtors'));
        const details = querySnapshot.docs.flatMap(doc => 
          doc.data().monthlyRecords.filter(record => record.month === monthString)
        );

        const aggregatedDetails = details.reduce((acc, detail) => {
          acc.openingPrinciple += detail.openingPrinciple || 0;
          acc.principleAdvance += detail.principleAdvance || 0;
          acc.principlePaid += detail.principlePaid || 0;
          acc.outstandingPrinciple += detail.outstandingPrinciple || 0;
          acc.openingInterest += detail.openingInterest || 0;
          acc.interestCharge += detail.interestCharge || 0;
          acc.intrestPaid += detail.intrestPaid || 0;
          acc.outstandingInterest += detail.outstandingInterest || 0;
          return acc;
        }, {
          openingPrinciple: 0,
          principleAdvance: 0,
          principlePaid: 0,
          outstandingPrinciple: 0,
          openingInterest: 0,
          interestCharge: 0,
          intrestPaid: 0,
          outstandingInterest: 0
        });

        setMonthlyDetails([aggregatedDetails]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching monthly details:', err);
        setError('Failed to load monthly details');
        setLoading(false);
      }
    };

    fetchMonthlyDetails();
  }, [selectedDate]);

  const financialMetrics = useMemo(() => {
    if (monthlyDetails.length === 0) return null;
    const detail = monthlyDetails[0];

    return {
      totalPrincipalMovement: (detail.principleAdvance || 0) - (detail.principlePaid || 0),
      totalInterestMovement: (detail.interestCharge || 0) - (detail.intrestPaid || 0),
      principalUtilizationRate: ((detail.principlePaid || 0) / (detail.principleAdvance || 1)) * 100,
      interestCoverageRatio: ((detail.intrestPaid || 0) / (detail.interestCharge || 1)) * 100
    };
  }, [monthlyDetails]);

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  if (loading) return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
      <div className="flex items-center mb-4 space-x-2">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="h-12 bg-gray-100 rounded"></div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-white rounded-xl shadow-sm p-6 text-red-500 flex items-center space-x-4">
      <DollarSign className="w-8 h-8" />
      <p>{error}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-500" />
          Monthly Financial Details
        </h2>
        <input
          type="month"
          value={`${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}`}
          onChange={handleDateChange}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>

      {monthlyDetails.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700 flex items-center">
                <PieChart className="w-4 h-4 mr-2 text-blue-500" />
                Financial Overview
              </h3>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-2">
              {[
                { label: 'Opening Principal', value: monthlyDetails[0].openingPrinciple, color: 'text-gray-800' },
                { label: 'Principal Advanced', value: monthlyDetails[0].principleAdvance, color: 'text-green-600', icon: TrendingUp },
                { label: 'Principal Paid', value: monthlyDetails[0].principlePaid, color: 'text-red-600', icon: TrendingDown },
                { label: 'Outstanding Principal', value: monthlyDetails[0].outstandingPrinciple, color: 'text-blue-600' }
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    {Icon && <Icon className="w-4 h-4 mr-2" />}
                    {label}
                  </span>
                  <span className={`font-semibold ${color}`}>
                    {(value || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700 flex items-center">
                <BarChart2 className="w-4 h-4 mr-2 text-purple-500" />
                Performance Metrics
              </h3>
              <DollarSign className="w-5 h-5 text-orange-500" />
            </div>
            {financialMetrics && (
              <div className="space-y-2">
                {[
                  { label: 'Principal Movement', value: financialMetrics.totalPrincipalMovement, color: 'text-green-600' },
                  { label: 'Interest Movement', value: financialMetrics.totalInterestMovement, color: 'text-blue-600' },
                  { 
                    label: 'Principal Utilization', 
                    value: `${financialMetrics.principalUtilizationRate.toFixed(2)}%`, 
                    color: 'text-purple-600' 
                  },
                  { 
                    label: 'Interest Coverage', 
                    value: `${financialMetrics.interestCoverageRatio.toFixed(2)}%`, 
                    color: 'text-orange-600' 
                  }
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className={`font-semibold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          <p>No financial details available for the selected month</p>
        </div>
      )}
    </div>
  );
};

export default MonthlyDetailsCard;