import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  X,
  TrendingUp,
  CreditCard,
  Clock,
  FileText,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { getFirestore, doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { app } from '../firebase';

// Utility functions (kept from previous implementation)
const formatCurrency = (value, currency = 'UGX') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const DebtorManagementModal = ({ 
  debtor, 
  onExtend, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const loan = debtor.loanDetails;

  // Enhanced memoized data preparations
  const chartData = useMemo(() => 
    (debtor?.monthlyRecords || []).map(record => ({
      month: new Date(record.date).toLocaleString('default', { month: 'short', year: '2-digit' }),
      principalPaid: record.principlePaid || 0,
      interestPaid: record.intrestPaid || 0
    })), [debtor]
  );

  const visibleHistoryRecords = useMemo(() => {
    return showFullHistory 
      ? debtor.monthlyRecords 
      : debtor.monthlyRecords.slice(0, 3);
  }, [debtor, showFullHistory]);

  // Optimized extension handler
  const handleExtend = useCallback(async () => {
    if (!dueDate) {
      setError('Please select a new due date');
      return;
    }

    try {
      const db = getFirestore(app);
      const debtorRef = doc(db, 'debtors', debtor.id);
      await updateDoc(debtorRef, { 
        dueDate, 
        status: 'extended',
        lastUpdated: new Date()
      });

      await addDoc(collection(db, 'communicationLogs'), {
        debtorId: debtor.id,
        customerName: debtor.customerName,
        actionType: 'due_date_extension',
        notes,
        extendedDate: dueDate,
        timestamp: new Date()
      });

      onExtend({ dueDate, notes });
      onClose();
    } catch (err) {
      console.error('Error extending due date:', err);
      setError('Failed to extend due date');
    }
  }, [dueDate, notes, debtor, onExtend, onClose]);

  if (!loan || !debtor) return null;

  // Enhanced tabs with improved design
  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: <Info className="w-4 h-4" />,
      description: 'Loan and financial summary'
    },
    { 
      id: 'extend', 
      label: 'Extend Date', 
      icon: <Calendar className="w-4 h-4" />,
      description: 'Modify loan due date'
    },
    { 
      id: 'history', 
      label: 'Payment History', 
      icon: <FileText className="w-4 h-4" />,
      description: 'Detailed payment records'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto "
    >
      <motion.div 
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col top-10 absolute"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{debtor.customerName}</h2>
              <p className="text-sm text-blue-100">Debtor Management Portal</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 p-3 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Redesigned Tabs */}
        <div className="flex bg-gray-100 border-b border-gray-200 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center p-3 transition duration-300 
                ${activeTab === tab.id 
                  ? 'bg-white shadow-md rounded-xl text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'}
                group relative
              `}
            >
              <div className="flex flex-col items-center space-y-1">
                <div className={`
                  p-2 rounded-full transition duration-300
                  ${activeTab === tab.id 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'group-hover:bg-gray-200'}
                `}>
                  {tab.icon}
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
                <span className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 
                  ${activeTab === tab.id ? 'w-full' : 'w-0'}"
                />
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                // className="grid md:grid-cols-3 gap-6 max-h-[calc(100vh-200px)] overflow-y-auto"
                className='flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-6 flex-wrap items-stretch'
              >
                {/* Loan Details */}
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 flex-1 min-w-[300px] w-full sm:w-auto">
                  <div className="flex items-center mb-4">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Loan Details</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {[
                      { label: 'Loan Type', value: loan.loanType },
                      { label: 'Loan Amount', value: formatCurrency(parseInt(loan.amount)) },
                      { label: 'Interest Amount', value: formatCurrency(parseInt(loan.interestAmount)) },
                      { label: 'Start Date', value: formatDate(loan.startDate) },
                      { label: 'Due Date', value: formatDate(loan.dueDate) },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-600">{label}</span>
                        <span className="font-medium text-blue-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Overview */}
                <div className="bg-green-50 rounded-xl p-5 border border-green-100 flex-1 min-w-[300px] w-full sm:w-auto">
                  <div className="flex items-center mb-4">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    <h3 className="font-semibold text-green-800">Financial Overview</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Principal</span>
                      <span className="font-medium text-green-700">
                        {formatCurrency(debtor.currentOpeningPrincipal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Interest</span>
                      <span className="font-medium text-green-700">
                        {formatCurrency(debtor.currentOpeningInterest)}
                      </span>
                    </div>
                    {visibleHistoryRecords.map((record, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600">
                          {new Date(record.date).toLocaleString('default', { month: 'long' })} Principal Paid
                        </span>
                        <span className="font-medium text-green-700">
                          {formatCurrency(record.principlePaid)}
                        </span>
                      </div>
                    ))}
                    {debtor.monthlyRecords.length > 3 && (
                      <button 
                        onClick={() => setShowFullHistory(!showFullHistory)}
                        className="w-full text-blue-600 hover:bg-blue-100 p-2 rounded-md transition text-center"
                      >
                        {showFullHistory ? 'Show Less' : `View All (${debtor.monthlyRecords.length})`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-gray-50 rounded-xl p-10 border border-gray-100 col-span-3 flex-1 min-w-[400px] w-full sm:w-auto flex-grow">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
                    <h3 className="font-semibold text-gray-800">Performance Chart</h3>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value), 'Amount']}
                        cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="principalPaid" fill="#10B981" name="Principal Paid" />
                      <Bar dataKey="interestPaid" fill="#3B82F6" name="Interest Paid" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {activeTab === 'extend' && (
              <motion.div 
                key="extend"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto"
              >
                <div className="bg-gray-100 px-6 py-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Extend Due Date */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                        <h3 className="font-semibold text-gray-800">Extend Due Date</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label 
                            htmlFor="dueDate" 
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            New Due Date
                          </label>
                          <input 
                            type="date" 
                            id="dueDate"
                            value={dueDate}
                            onChange={(e) => {
                              setDueDate(e.target.value);
                              setError(null);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                          />
                        </div>
                        
                        <div>
                          <label 
                            htmlFor="notes" 
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Additional Notes (Optional)
                          </label>
                          <textarea 
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            placeholder="Reason for extension, payment plan, etc."
                          />
                        </div>
                        
                        {error && (
                          <div className="flex items-center text-red-600 text-sm">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            {error}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Context */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center mb-4">
                        <Clock className="w-5 h-5 mr-2 text-gray-600" />
                        <h3 className="font-semibold text-gray-800">Extension Context</h3>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Original Due Date</span>
                          <span className="font-medium text-gray-700">{loan.dueDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Loan Duration</span>
                          <span className="font-medium text-gray-700">{loan.duration} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated</span>
                          <span className="font-medium text-gray-700">
                            {new Date(debtor.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Status</span>
                          <span className="font-medium text-blue-700 capitalize">
                            {debtor.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-200 px-6 py-4 flex justify-end space-x-3">
                  <button 
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-300 rounded-md transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleExtend}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Extend & Notify
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto"
              >
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Detailed Payment History</h3>
                  {debtor.monthlyRecords.length === 0 ? (
                    <div className="text-center text-gray-500">No payment history available</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100 border-b">
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-right">Principal Paid</th>
                            <th className="p-3 text-right">Interest Paid</th>
                            <th className="p-3 text-right">Total Payment</th>
                            <th className="p-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {debtor.monthlyRecords.map((record, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50 transition">
                              <td className="p-3">
                                {formatDate(record.date)}
                              </td>
                              <td className="p-3 text-right text-green-700">
                                {formatCurrency(record.principlePaid)}
                              </td>
                              <td className="p-3 text-right text-blue-700">
                                {formatCurrency(record.intrestPaid)}
                              </td>
                              <td className="p-3 text-right font-semibold">
                                {formatCurrency(record.principlePaid + record.intrestPaid)}
                              </td>
                              <td className="p-3 text-center">
                                <button className="text-gray-500 hover:text-blue-600 transition">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DebtorManagementModal;