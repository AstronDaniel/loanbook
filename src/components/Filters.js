import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  X, 
  ChevronDown 
} from 'lucide-react';

const LOAN_TYPES = [
  { value: '', label: 'All Loans' },
  { value: 'Personal', label: 'Personal Loan' },
  { value: 'Business', label: 'Business Loan' },
  { value: 'Education', label: 'Education Loan' },
  { value: 'Home', label: 'Home Loan' }
];

const Filters = ({ onFilterChange, darkMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: '',
    loanType: '',
    fromDate: null,
    toDate: null
  });

  // Theme Configuration
  const THEMES = {
    light: {
      background: 'bg-white',
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600'
      },
      input: {
        bg: 'bg-gray-50',
        border: 'border-gray-300',
        focus: 'focus:ring-blue-500 focus:border-blue-500'
      },
      icon: 'text-gray-500'
    },
    dark: {
      background: 'bg-gray-800',
      text: {
        primary: 'text-gray-100',
        secondary: 'text-gray-400'
      },
      input: {
        bg: 'bg-gray-700',
        border: 'border-gray-600',
        focus: 'focus:ring-blue-400 focus:border-blue-400'
      },
      icon: 'text-gray-400'
    }
  };

  const currentTheme = THEMES[darkMode ? 'dark' : 'light'];

  // Debounced filter change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFilterChange(filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, onFilterChange]);

  // Update individual filter
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      loanType: '',
      fromDate: null,
      toDate: null
    });
  };

  return (
    <div className={`
      ${currentTheme.background} 
      rounded-xl 
      shadow-md 
      p-4 
      mb-6 
      transition-all 
      duration-300
    `}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`
          text-lg 
          font-semibold 
          ${currentTheme.text.primary} 
          flex 
          items-center
        `}>
          <Filter className={`w-5 h-5 mr-2 ${currentTheme.icon}`} />
          Loan Filters
        </h2>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            flex 
            items-center 
            ${currentTheme.text.secondary} 
            hover:opacity-75 
            transition-opacity
          `}
        >
          {isExpanded ? <X className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search loans..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className={`
                w-full 
                pl-10 
                pr-4 
                py-2 
                rounded-lg 
                ${currentTheme.input.bg}
                ${currentTheme.input.border}
                ${currentTheme.input.focus}
                ${currentTheme.text.primary}
                border 
                outline-none 
                transition-colors
              `}
            />
            <Search 
              className={`
                absolute 
                left-3 
                top-1/2 
                transform 
                -translate-y-1/2 
                ${currentTheme.icon}
              `} 
              size={20} 
            />
          </div>

          {/* Loan Type Dropdown */}
          <div className="relative">
            <select
              value={filters.loanType}
              onChange={(e) => updateFilter('loanType', e.target.value)}
              className={`
                w-full 
                pl-4 
                pr-10 
                py-2 
                rounded-lg 
                ${currentTheme.input.bg}
                ${currentTheme.input.border}
                ${currentTheme.input.focus}
                ${currentTheme.text.primary}
                border 
                outline-none 
                appearance-none 
                transition-colors
              `}
            >
              {LOAN_TYPES.map((type) => (
                <option 
                  key={type.value} 
                  value={type.value}
                  className={currentTheme.background}
                >
                  {type.label}
                </option>
              ))}
            </select>
            <ChevronDown 
              className={`
                absolute 
                right-3 
                top-1/2 
                transform 
                -translate-y-1/2 
                ${currentTheme.icon}
                pointer-events-none
              `} 
              size={20} 
            />
          </div>

          {/* Date Range Inputs */}
          <div>
            <input 
              type="date" 
              value={filters.fromDate || ''}
              onChange={(e) => updateFilter('fromDate', e.target.value)}
              className={`
                w-full 
                px-4 
                py-2 
                rounded-lg 
                ${currentTheme.input.bg}
                ${currentTheme.input.border}
                ${currentTheme.input.focus}
                ${currentTheme.text.primary}
                border 
                outline-none 
                transition-colors
              `}
            />
          </div>
          <div>
            <input 
              type="date" 
              value={filters.toDate || ''}
              onChange={(e) => updateFilter('toDate', e.target.value)}
              className={`
                w-full 
                px-4 
                py-2 
                rounded-lg 
                ${currentTheme.input.bg}
                ${currentTheme.input.border}
                ${currentTheme.input.focus}
                ${currentTheme.text.primary}
                border 
                outline-none 
                transition-colors
              `}
            />
          </div>
        </div>
      )}

      {/* Clear Filters Button */}
      {isExpanded && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearFilters}
            className={`
              px-4 
              py-2 
              rounded-lg 
              ${currentTheme.text.secondary}
              hover:bg-opacity-10
              transition-colors
              flex 
              items-center 
              space-x-2
            `}
          >
            <X className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Filters;