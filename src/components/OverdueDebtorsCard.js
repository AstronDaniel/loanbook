import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { app } from '../firebase';
import { AlertTriangle, User } from 'lucide-react';

const OverdueDebtorsCard = () => {
  const [overdueDebtors, setOverdueDebtors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverdueDebtors = async () => {
      try {
        const db = getFirestore(app);
        const overdueQuery = query(
          collection(db, 'debtors'), 
          where('status', '==', 'overdue')
        );
        
        const querySnapshot = await getDocs(overdueQuery);
        const debtorsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort debtors by outstanding amount in descending order
        const sortedDebtors = debtorsData.sort(
          (a, b) => b.currentOpeningPrincipal - a.currentOpeningPrincipal
        );

        setOverdueDebtors(sortedDebtors);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching overdue debtors:', err);
        setError('Failed to load overdue debtors');
        setLoading(false);
      }
    };

    fetchOverdueDebtors();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4 text-red-500">
        <AlertTriangle className="w-8 h-8" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
          Overdue Debtors
        </h2>
        <span className="text-sm text-gray-500">
          Total Overdue: {overdueDebtors.length}
        </span>
      </div>

      {overdueDebtors.length > 0 ? (
        <div className="space-y-4">
          {overdueDebtors.map((debtor) => (
            <div 
              key={debtor.id} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <User className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{debtor.customerName}</p>
                  <p className="text-sm text-gray-500">
                    Outstanding: UGX {debtor.currentOpeningPrincipal.toLocaleString()}
                  </p>
                </div>
              </div>
              <span className="text-sm text-red-500 font-semibold">
                Overdue
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          <p>No overdue debtors at the moment</p>
        </div>
      )}
    </div>
  );
};

export default OverdueDebtorsCard;