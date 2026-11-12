import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'neutral',
  accentColor = 'teal',
  onClick,
}) => {
  const accentBorderColors = {
    teal: 'border-l-teal-500 bg-teal-50 text-teal-600',
    emerald: 'border-l-emerald-500 bg-emerald-50 text-emerald-600',
    amber: 'border-l-amber-500 bg-amber-50 text-amber-600',
    rose: 'border-l-rose-500 bg-rose-50 text-rose-600',
    sky: 'border-l-sky-500 bg-sky-50 text-sky-600',
    slate: 'border-l-slate-400 bg-slate-50 text-slate-600',
  };

  const badgeColor = accentBorderColors[accentColor] || accentBorderColors.teal;

  return (
    <div
      onClick={onClick}
      className={`relative p-5 bg-white rounded-xl border border-slate-200 shadow-xs border-l-4 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              {value}
            </span>
          </div>
          {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl ${badgeColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center mt-3 pt-3 border-t border-slate-100 text-xs">
          {trendDirection === 'up' && (
            <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          )}
          {trendDirection === 'down' && (
            <TrendingDown className="w-3.5 h-3.5 mr-1 text-rose-600" />
          )}
          {trendDirection === 'neutral' && (
            <Minus className="w-3.5 h-3.5 mr-1 text-slate-400" />
          )}
          <span
            className={`font-semibold ${
              trendDirection === 'up'
                ? 'text-emerald-700'
                : trendDirection === 'down'
                ? 'text-rose-700'
                : 'text-slate-500'
            }`}
          >
            {trend}
          </span>
          <span className="text-slate-400 ml-1">vs previous cycle</span>
        </div>
      )}
    </div>
  );
};

export const ChartCard = ({ title, subtitle, actions, children, className = '' }) => {
  return (
    <div className={`p-5 bg-white rounded-xl border border-slate-200 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default DashboardCard;
