import React, { useEffect, useState } from 'react';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  getDoc 
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
import { getAuth } from 'firebase/auth';
import { differenceInDays, parseISO, format } from 'date-fns';


const MySwal = withReactContent(Swal);

const OverdueDebtorsCard = ({ darkMode, filteredDebtors }) => {
  const [overdueDebtors, setOverdueDebtors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Theme Configuration
  const THEMES = {
    light: {
      background: 'bg-white',
      card: 'bg-gray-50',
      text: {
        primary: 'text-gray-800',
        secondary: 'text-gray-600',
        accent: 'text-red-500'
      },
      border: 'border-gray-200',
      hover: 'hover:bg-gray-100',
      scrollbar: {
        track: 'scrollbar-track-gray-200',
        thumb: 'scrollbar-thumb-gray-300'
      }
    },
    dark: {
      background: 'bg-gray-800',
      card: 'bg-gray-700',
      text: {
        primary: 'text-gray-100',
        secondary: 'text-gray-400',
        accent: 'text-red-400'
      },
      border: 'border-gray-600',
      hover: 'hover:bg-gray-600',
      scrollbar: {
        track: 'scrollbar-track-gray-700',
        thumb: 'scrollbar-thumb-gray-600'
      }
    }
  };

  const currentTheme = THEMES[darkMode ? 'dark' : 'light'];

  useEffect(() => {
    const fetchOverdueDebtors = async () => {
      try {
        console.log('Fetching overdue debtors...');
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

        console.log('Fetched and sorted overdue debtors:', sortedDebtors);
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

  const handleDebtorClick = async (debtor) => {
    console.log('Debtor clicked:', debtor);
    const db = getFirestore(app);
    const loanDoc = await getDoc(doc(db, 'loans', debtor.loanId));
    if (loanDoc.exists()) {
      debtor.loanDetails = loanDoc.data();
    }
    setSelectedDebtor(debtor);
    setIsModalOpen(true);
  };

  const handleExtend = async ({ dueDate, notes }) => {
    try {
      console.log('Extending due date for debtor:', selectedDebtor);
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

      // Log the transaction
      const auth = getAuth();
      const user = auth.currentUser;
      const transactionLog = {
        user: user ? user.email : 'anonymous',
        timestamp: new Date().toISOString(),
        date: format(new Date(), 'yyyy-MM-dd'),
        time: new Date().toLocaleTimeString(),
        type: 'extend',
        content: {
          reference: Math.random().toString(36).substring(2, 15),
          status: 'extended',
          description: `Extended due date for ${selectedDebtor.customerName} to ${dueDate}`,
          notes: notes
        }
      };
      await addDoc(collection(db, 'transactionLogs'), transactionLog);

      console.log('Due date extended and communication log created for debtor:', selectedDebtor);
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
      <div className={`${currentTheme.background} rounded-xl shadow-sm p-6 animate-pulse`}>
        <div className={`h-6 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-1/2 mb-4`}></div>
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full`}></div>
              <div className="flex-1 space-y-2">
                <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-3/4`}></div>
                <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded w-1/2`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    if (error) return (
      <div className={`${currentTheme.background} rounded-xl shadow-sm p-6 flex items-center space-x-4 ${currentTheme.text.accent}`}>
        <AlertTriangle className="w-8 h-8" />
        <p className="text-sm">{error}</p>
      </div>
    );

    const overdueFilteredDebtors = filteredDebtors.filter(debtor => debtor.status === 'overdue');
    console.log('Filtered Debtors:', filteredDebtors);
    console.log('Overdue Filtered Debtors:', overdueFilteredDebtors);

    return (
      <div className={`
        ${currentTheme.background} 
        rounded-xl 
        shadow-sm 
        p-6 
        h-[500px] 
        flex 
        flex-col 
        overflow-hidden
      `}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`
            text-lg 
            font-semibold 
            ${currentTheme.text.primary} 
            flex 
            items-center
          `}>
            <AlertTriangle className={`w-5 h-5 mr-2 ${currentTheme.text.accent}`} />
            Overdue Debtors
          </h2>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${currentTheme.text.secondary}`}>
              Total Overdue: {overdueFilteredDebtors.length}
            </span>
            <FileText 
              className={`w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-600`}
              onClick={() => MySwal.fire({
                title: 'Overdue Report',
                html: `
                  <div class="text-left">
                    <p>Total Overdue Debtors: <strong>${overdueFilteredDebtors.length}</strong></p>
                    <p>Total Outstanding Principal: <strong>UGX ${overdueFilteredDebtors.reduce((sum, debtor) => sum + debtor.currentOpeningPrincipal, 0).toLocaleString()}</strong></p>
                  </div>
                `,
                icon: 'info'
              })}
            />
          </div>
        </div>

        <div className={`
          flex-1 
          overflow-y-auto 
          pr-2 
          scrollbar-thin 
          ${currentTheme.scrollbar.track} 
          ${currentTheme.scrollbar.thumb}
        `}>
          {overdueFilteredDebtors.length > 0 ? (
            <div className="space-y-4">
              {overdueFilteredDebtors.map((debtor) => (
                <div 
                  key={debtor.id} 
                  className={`
                    flex 
                    items-center 
                    justify-between 
                    p-4 
                    ${currentTheme.card} 
                    rounded-lg 
                    ${currentTheme.hover} 
                    transition-colors 
                    cursor-pointer 
                    group
                  `}
                  onClick={() => handleDebtorClick(debtor)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`
                      bg-red-100 
                      p-2 
                      rounded-full 
                      group-hover:bg-red-200 
                      transition-colors
                    `}>
                      <User className={`
                        w-6 
                        h-6 
                        ${currentTheme.text.accent} 
                        group-hover:text-red-600
                      `} />
                    </div>
                    <div>
                      <p className={`
                        font-medium 
                        ${currentTheme.text.primary} 
                        group-hover:text-opacity-90
                      `}>
                        {debtor.customerName}
                      </p>
                      <p className={`
                        text-sm 
                        ${currentTheme.text.secondary}
                      `}>
                        Outstanding: UGX {debtor.currentOpeningPrincipal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`
                      text-sm 
                      font-semibold 
                      ${currentTheme.text.accent}
                    `}>
                      Overdue
                    </span>
                    <Send className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`
              text-center 
              ${currentTheme.text.secondary} 
              py-4
            `}>
              <p>No overdue debtors at the moment</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      {isModalOpen && selectedDebtor && (
        <DebtorManagementModal 
          debtor={selectedDebtor} 
          onExtend={handleExtend} 
          onClose={() => {
            setIsModalOpen(false);
            console.log("Close modal");
          }} 
        />
      )}
    </>
  );
};

export default OverdueDebtorsCard;