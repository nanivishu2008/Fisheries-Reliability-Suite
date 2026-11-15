import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search records...',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm text-stone-800 bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors placeholder:text-stone-400"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export const FilterPanel = ({ children, onReset, isFiltered, title = 'Filter Records' }) => {
  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</h4>
        {isFiltered && onReset && (
          <button
            onClick={onReset}
            className="text-xs font-semibold text-orange-600 hover:text-orange-800 transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">{children}</div>
    </div>
  );
};

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  pageSize = 10,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || currentPage * pageSize);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white border-t border-slate-200 gap-3">
      <div className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-700">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-700">{endItem}</span>
        {totalItems ? (
          <>
            {' '}
            of <span className="font-semibold text-slate-700">{totalItems}</span> results
          </>
        ) : null}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          Previous
        </button>
        <span className="px-3 py-1 text-xs font-medium text-slate-600">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};
