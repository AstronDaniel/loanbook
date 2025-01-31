import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
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

        setMonthlyDetails(details);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching monthly details:', err);
        setError('Failed to load monthly details');
        setLoading(false);
      }
    };

    fetchMonthlyDetails();
  }, [selectedDate]);

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  if (loading) {
    return (
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
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-red-500 flex items-center space-x-4">
        <DollarSign className="w-8 h-8" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-500" />
          Monthly Financial Details
        </h2>
        <div className="flex items-center space-x-2">
          <input
            type="month"
            value={`${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}`}
            onChange={handleDateChange}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      {monthlyDetails.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {monthlyDetails.map((detail, index) => (
            <div 
              key={index} 
              className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-700">Financial Snapshot</h3>
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Opening Principal</span>
                  <span className="font-semibold text-gray-800">
                    {detail.openingPrinciple.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Principal Advanced</span>
                  <span className="font-semibold text-green-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {detail.principleAdvance.toLocaleString()}
                    
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Principal Paid</span>
                  <span className="font-semibold text-red-600 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    {detail.principlePaid.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Outstanding Principal</span>
                  <span className="font-semibold text-blue-600">
                    {detail.outstandingPrinciple.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Interest Outstanding</span>
                  <span className="font-semibold text-orange-600">
                    {detail.outstandingInterest.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
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