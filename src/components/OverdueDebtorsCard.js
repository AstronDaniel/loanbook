import React, { useEffect, useState } from 'react';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc 
} from 'firebase/firestore';
import { app } from '../firebase';
import { 
  AlertTriangle, 
  User, 
  FileText, 
  Send 
} from 'lucide-react';
import DebtorManagementModal from './DebtorManagementModal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const OverdueDebtorsCard = () => {
  const [overdueDebtors, setOverdueDebtors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDebtorClick = (debtor) => {
    setSelectedDebtor(debtor);
    setIsModalOpen(true);
  };

  const handleExtend = async ({ dueDate, notes }) => {
    try {
      const db = getFirestore(app);
      const debtorRef = doc(db, 'debtors', selectedDebtor.id);
      
      // Update debtor's due date
      await updateDoc(debtorRef, { 
        dueDate: dueDate,
        status: 'extended'
      });

      // Log communication history
      await addDoc(collection(db, 'communicationLogs'), {
        debtorId: selectedDebtor.id,
        customerName: selectedDebtor.customerName,
        actionType: 'due_date_extension',
        notes: notes,
        extendedDate: dueDate,
        timestamp: new Date()
      });

      await MySwal.fire({
        title: 'Extension Processed',
        html: `
          <div class="text-left">
            <p>Due date for <strong>${selectedDebtor.customerName}</strong> extended to ${dueDate}</p>
            <p class="text-sm text-gray-600 mt-2">Communication log created successfully</p>
          </div>
        `,
        icon: 'success'
      });

      setIsModalOpen(false);
    } catch (err) {
      console.error('Error updating debtor:', err);
      MySwal.fire('Error', 'Failed to process extension', 'error');
    }
  };

  const renderContent = () => {
    if (loading) return (
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

    if (error) return (
      <div className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4 text-red-500">
        <AlertTriangle className="w-8 h-8" />
        <p className="text-sm">{error}</p>
      </div>
    );

    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            Overdue Debtors
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Total Overdue: {overdueDebtors.length}
            </span>
            <FileText 
              className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-600"
              onClick={() => MySwal.fire({
                title: 'Overdue Report',
                html: `
                  <div class="text-left">
                    <p>Total Overdue Debtors: <strong>${overdueDebtors.length}</strong></p>
                    <p>Total Outstanding Principal: <strong>UGX ${overdueDebtors.reduce((sum, debtor) => sum + debtor.currentOpeningPrincipal, 0).toLocaleString()}</strong></p>
                  </div>
                `,
                icon: 'info'
              })}
            />
          </div>
        </div>

        {overdueDebtors.length > 0 ? (
          <div className="space-y-4">
            {overdueDebtors.map((debtor) => (
              <div 
                key={debtor.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                onClick={() => handleDebtorClick(debtor)}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-red-100 p-2 rounded-full group-hover:bg-red-200 transition-colors">
                    <User className="w-6 h-6 text-red-500 group-hover:text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 group-hover:text-gray-900">
                      {debtor.customerName}
                    </p>
                    <p className="text-sm text-gray-500 group-hover:text-gray-600">
                      Outstanding: UGX {debtor.currentOpeningPrincipal.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-red-500 font-semibold">
                    Overdue
                  </span>
                  <Send className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
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

  return (
    <>
      {renderContent()}
      {selectedDebtor && (
        <DebtorManagementModal 
          debtor={selectedDebtor} 
          onExtend={handleExtend} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

export default OverdueDebtorsCard;