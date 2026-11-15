import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching your current filter criteria.',
  sortField,
  sortOrder,
  onSort,
  onRowClick,
}) => {
  if (loading) {
    return <LoadingSpinner text="Fetching data records..." />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="w-full overflow-hidden bg-white border border-slate-200 rounded-xl shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {columns.map((col, idx) => {
                const isSortable = !!col.sortKey && onSort;
                const isCurrentSort = sortField === col.sortKey;

                return (
                  <th
                    key={idx}
                    scope="col"
                    className={`px-4 py-3.5 ${col.className || ''} ${
                      isSortable ? 'cursor-pointer hover:bg-slate-100/70 select-none' : ''
                    }`}
                    onClick={() => isSortable && onSort(col.sortKey)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="text-slate-400">
                          {isCurrentSort ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-orange-600" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-orange-600" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-normal">
            {data.map((row, rowIdx) => (
              <tr
                key={row._id || row.id || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-orange-50/30' : 'hover:bg-slate-50/60'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-4 py-3 text-xs md:text-sm ${col.className || ''}`}>
                    {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
