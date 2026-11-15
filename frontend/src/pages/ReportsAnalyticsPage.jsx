import React, { useState, useEffect, useCallback } from 'react';
import {
  FileBarChart,
  Download,
  Filter,
  Calendar,
  FileText,
  Printer,
  Boxes,
  Sparkles,
  Wrench,
  Clock,
  Layers,
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { getReportSummary, downloadReportCsv } from '../services/reportService';

const REPORT_DEFINITIONS = [
  { id: 'asset_health', title: 'Asset Health & Reliability Index', category: 'Assets', description: 'Comprehensive fleet condition and runtime logs' },
  { id: 'failure_risk', title: 'Failure-Risk & RUL Predictions', category: 'AI & PdM', description: 'Early-warning flags with confidence scores' },
  { id: 'downtime_analysis', title: 'Downtime & Outage Duration Analysis', category: 'Operations', description: 'Cumulative downtime hours and line stoppages' },
  { id: 'spare_parts', title: 'Spare-Parts Availability & Replenishment', category: 'Inventory', description: 'Warehouse stock levels and re-order thresholds' },
  { id: 'technician_orders', title: 'Technician Work Orders & Verification', category: 'Maintenance', description: 'Assigned orders, completion rates, and closure signoffs' },
  { id: 'preventive_maint', title: 'Preventive Maintenance (PM) Schedule', category: 'Maintenance', description: 'Calendarized periodic service compliance' },
  { id: 'predictive_maint', title: 'Predictive Maintenance (PdM) Actions', category: 'AI & PdM', description: 'Work orders generated directly from AI predictions' },
  { id: 'anomaly_detection', title: 'Sensor Telemetry Anomaly Audit', category: 'Telemetry', description: 'Exceeded thermal, vibration, and oxygen bounds' },
  { id: 'closure_verification', title: 'Authorized Closure Verification Log', category: 'Compliance', description: 'Manager signoffs, signatures, and walk-through records' },
  { id: 'maintenance_costs', title: 'Maintenance Cost & Spare Parts Spend', category: 'Financial', description: 'Direct labor and parts expenditure per asset class' },
  { id: 'false_alarms', title: 'False Alarm & Model Drift Evaluation', category: 'AI & PdM', description: 'Rejected predictions vs actual operational performance' },
  { id: 'maintenance_effectiveness', title: 'Reliability Maintenance Effectiveness', category: 'Operations', description: 'Post-repair MTBF extension tracking' },
  { id: 'maintenance_evidence', title: 'Maintenance Evidence & Photo Attachments', category: 'Compliance', description: 'Catalog of uploaded repair photos and certificates' },
  { id: 'remaining_useful_life', title: 'Remaining Useful Life (RUL) Trajectory', category: 'AI & PdM', description: 'Wear curves and component degradation projections' },
];

export const ReportsAnalyticsPage = () => {
  const [selectedReportId, setSelectedReportId] = useState('asset_health');
  const [dateRange, setDateRange] = useState('30d');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getReportSummary({ reportType: selectedReportId, dateRange });
      setReportData(data);
    } catch (err) {
      console.error('Failed to load report summary:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedReportId, dateRange]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleExportCsv = () => {
    downloadReportCsv(selectedReportId);
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedReportDef = REPORT_DEFINITIONS.find((r) => r.id === selectedReportId) || REPORT_DEFINITIONS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Reports & Analytics Centre
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            14 structured audit, reliability, downtime, and operational export reports
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-1"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            <span>Print View</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Live CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Report Selector Menu (All 14 Required Reports) */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Available Reports ({REPORT_DEFINITIONS.length})
          </h3>
          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
            {REPORT_DEFINITIONS.map((def) => {
              const isSelected = selectedReportId === def.id;
              return (
                <button
                  key={def.id}
                  onClick={() => setSelectedReportId(def.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex flex-col ${
                    isSelected
                      ? 'bg-orange-50 text-orange-900 font-bold border border-orange-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{def.title}</span>
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5">{def.category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Report Viewer & Data Table */}
        <div className="lg:col-span-3 space-y-5">
          {/* Active Report Header Card */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                  {selectedReportDef.category}
                </span>
                <h3 className="text-base font-bold text-slate-900">{selectedReportDef.title}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">{selectedReportDef.description}</p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-xs text-slate-400 font-semibold">Period:</span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last Quarter</option>
                <option value="1y">Full Year</option>
              </select>
            </div>
          </div>

          {/* Quick Metrics Summary Bar */}
          {reportData?.summaryStats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(reportData.summaryStats).map(([key, value]) => (
                <div key={key} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{String(value)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Records Table Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Report Data Records Preview ({reportData?.records?.length || 0} Entries)
            </h4>

            {loading ? (
              <LoadingSpinner text="Compiling report query..." />
            ) : !reportData?.records || reportData.records.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No records found for specified parameters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      {Object.keys(reportData.records[0])
                        .filter((k) => !['_id', '__v', 'isDeleted', 'updatedAt'].includes(k))
                        .slice(0, 7)
                        .map((key) => (
                          <th key={key} className="px-3 py-2.5">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {reportData.records.slice(0, 15).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        {Object.entries(row)
                          .filter(([k]) => !['_id', '__v', 'isDeleted', 'updatedAt'].includes(k))
                          .slice(0, 7)
                          .map(([key, val], cellIdx) => (
                            <td key={cellIdx} className="px-3 py-2.5">
                              {typeof val === 'object' && val !== null
                                ? val.name || val.assetCode || JSON.stringify(val).slice(0, 20)
                                : String(val)}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalyticsPage;
