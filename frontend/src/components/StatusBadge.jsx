import React from 'react';

export const StatusBadge = ({ status, type = 'status', className = '' }) => {
  if (!status) return null;

  const normalized = String(status).toLowerCase().trim();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (
    ['healthy', 'active', 'completed', 'approved', 'low', 'normal'].includes(normalized)
  ) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (
    ['warning', 'medium', 'pending', 'pending review', 'scheduled', 'awaiting verification', 'standby'].includes(normalized)
  ) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (
    ['critical', 'high', 'emergency', 'urgent', 'rejected', 'decommissioned', 'failed'].includes(normalized)
  ) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (
    ['in progress', 'maintenance', 'reported', 'investigating'].includes(normalized)
  ) {
    colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize tracking-wide ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
