import React, { useMemo, useState } from 'react';
import { Calendar, DollarSign, ArrowRight, Percent, ChevronLeft, ChevronRight } from 'lucide-react';

const DebtorCard = ({ debtor, handleDebtorClick }) => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Get selected and previous month records
  const selectedMonthRecord = useMemo(() => 
    debtor.monthlyRecords?.[selectedMonthIndex] || {}, [debtor.monthlyRecords, selectedMonthIndex]
  );

  // Handle month navigation
  const handlePreviousMonth = () => {
    if (selectedMonthIndex < debtor.monthlyRecords.length - 1) {
      setSelectedMonthIndex(selectedMonthIndex + 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex > 0) {
      setSelectedMonthIndex(selectedMonthIndex - 1);
    }
  };

  // Determine status color and label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return { label: 'Active', color: 'bg-green-100 text-green-700' };
      case 'overdue':
        return { label: 'Overdue', color: 'bg-red-100 text-red-700' };
      case 'completed':
        return { label: 'Completed', color: 'bg-blue-100 text-blue-700' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const status = getStatusLabel(debtor.status);

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>

      {/* Header with Customer Name and Status */}
      <div className="mb-4 pb-3 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{debtor.customerName}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Month Selection */}
      <div className="mt-2 flex items-center justify-between mb-4">
        <button 
          onClick={handlePreviousMonth}
          disabled={selectedMonthIndex >= debtor.monthlyRecords?.length - 1}
          className="rounded-full p-1 hover:bg-gray-100 disabled:opacity-50 transition"
        >
          <ChevronLeft className="h-4 w-4 text-gray-500" />
        </button>
        
        <p className="flex items-center text-xs text-gray-500">
          <Calendar className="mr-1 h-3 w-3" />
          {selectedMonthRecord.month || 'N/A'}
        </p>
        
        <button 
          onClick={handleNextMonth}
          disabled={selectedMonthIndex <= 0}
          className="rounded-full p-1 hover:bg-gray-100 disabled:opacity-50 transition"
        >
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Current Principal */}
        <div className="bg-blue-50/50 rounded-md p-3">
          <div className="flex items-center mb-1 text-xs text-blue-700">
            <DollarSign className="mr-1 h-3 w-3" />
            Principal
          </div>
          <div className="text-sm font-bold text-blue-900">
            UGX {formatCurrency(selectedMonthRecord.outstandingPrinciple)}
          </div>
        </div>

        {/* Outstanding Interest */}
        <div className="bg-amber-50/50 rounded-md p-3">
          <div className="flex items-center mb-1 text-xs text-amber-700">
            <Percent className="mr-1 h-3 w-3" />
            Interest
          </div>
          <div className="text-sm font-bold text-amber-900">
            UGX {formatCurrency(selectedMonthRecord.outstandingInterest)}
          </div>
        </div>
      </div>

      {/* Monthly Activity Summary */}
      <div className="bg-gray-50/50 rounded-md p-3 mb-4">
        <h4 className="text-xs font-medium text-gray-600 mb-2">Monthly Activity</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Principal Advanced</span>
            <span className="text-xs font-medium text-gray-800">
              UGX {formatCurrency(selectedMonthRecord.principleAdvance)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Principal Paid</span>
            <span className="text-xs font-medium text-gray-800">
              UGX {formatCurrency(Math.abs(selectedMonthRecord.principlePaid))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Interest Charged</span>
            <span className="text-xs font-medium text-gray-800">
              UGX {formatCurrency(selectedMonthRecord.interestCharge)}
            </span>
          </div>
        </div>
      </div>

      {/* View Details Button */}
      <button 
        onClick={() => handleDebtorClick(debtor)}
        className="w-full rounded-md bg-blue-500 px-3 py-2 text-white text-xs font-medium transition-colors hover:bg-blue-600 flex items-center justify-center"
      >
        View Full History
        <ArrowRight className="ml-2 h-3 w-3" />
      </button>
    </div>
  );
};

export default DebtorCard;