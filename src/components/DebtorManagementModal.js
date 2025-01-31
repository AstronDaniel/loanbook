import React, { useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  X 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/formating';

const DebtorManagementModal = ({ debtor, onExtend, onClose }) => {
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);

  const handleExtend = () => {
    if (!dueDate) {
      setError('Please select a new due date');
      return;
    }
    
    onExtend({
      dueDate,
      notes
    });
    onClose(); // Ensure the modal closes after extending
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <motion.div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center">
            <Info className="w-6 h-6 mr-3" />
            <h2 className="text-xl font-bold">
              Debtor Management: {debtor.customerName}
            </h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Financial Details */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-center mb-4">
              <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Financial Overview</h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Outstanding Principal</span>
                <span className="font-medium text-blue-700">
                  {formatCurrency(debtor.currentOpeningPrincipal, 'UGX')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Outstanding Interest</span>
                <span className="font-medium text-blue-700">
                  {formatCurrency(debtor.currentOpeningInterest, 'UGX')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Principal Paid</span>
                <span className="font-medium text-green-700">
                  {formatCurrency(debtor.totalPrincipalPaid, 'UGX')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Interest Paid</span>
                <span className="font-medium text-green-700">
                  {formatCurrency(debtor.totalInterestPaid, 'UGX')}
                </span>
              </div>
            </div>
          </div>

          {/* Extend Due Date */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
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
        </div>

        {/* Actions */}
        <div className="bg-gray-100 px-6 py-4 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-md transition"
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
    </motion.div>
  );
};

export default DebtorManagementModal;