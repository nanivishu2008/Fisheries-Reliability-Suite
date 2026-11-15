import React from 'react';
import { Inbox, AlertTriangle, RefreshCw } from 'lucide-react';

export const EmptyState = ({
  title = 'No records found',
  description = 'There is currently no data to display for this view or filter.',
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs my-4">
      <div className="p-3 bg-slate-50 text-slate-400 rounded-full mb-3 ring-8 ring-slate-50/50">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'Failed to load data from server. Please verify your connection or try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-rose-50/50 rounded-xl border border-rose-200 my-4">
      <div className="p-3 bg-rose-100 text-rose-600 rounded-full mb-3">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-rose-900">{title}</h3>
      <p className="text-sm text-rose-700 max-w-md mt-1 mb-4">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-xs"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Request
        </button>
      )}
    </div>
  );
};

export default EmptyState;
