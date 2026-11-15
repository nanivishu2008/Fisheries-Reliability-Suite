import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Wrench,
  Radio,
  FileText,
  Sparkles,
  Plus,
  RefreshCw,
  Send,
  Calendar,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { StatusBadge } from '../components/StatusBadge';
import { ChartCard } from '../components/DashboardCard';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { FormInput } from '../components/FormInput';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import {
  getAssetById,
  recordTelemetry,
  recordBreakdown,
  createInspection,
} from '../services/assetService';
import { runPredictionEvaluation } from '../services/predictionService';

export const AssetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [telemetryModalOpen, setTelemetryModalOpen] = useState(false);
  const [telemetryForm, setTelemetryForm] = useState({
    parameter: 'Motor Temperature',
    readingValue: '',
    unit: '°C',
    operatingContext: 'Normal Operating Cycle',
  });
  const [telemetrySubmitting, setTelemetrySubmitting] = useState(false);

  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
  const [breakdownForm, setBreakdownForm] = useState({
    problemDescription: '',
    severity: 'Major',
    symptoms: '',
  });
  const [breakdownSubmitting, setBreakdownSubmitting] = useState(false);

  const [predictionRunning, setPredictionRunning] = useState(false);

  const loadAssetData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAssetById(id);
      setData(res);
    } catch (err) {
      console.error('Failed to load asset details:', err);
      setError('Could not retrieve asset profile or historical telemetry.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAssetData();
  }, [loadAssetData]);

  const handleTelemetrySubmit = async (e) => {
    e.preventDefault();
    try {
      setTelemetrySubmitting(true);
      await recordTelemetry({
        assetId: id,
        parameter: telemetryForm.parameter,
        readingValue: Number(telemetryForm.readingValue),
        unit: telemetryForm.unit,
        operatingContext: telemetryForm.operatingContext,
      });
      setTelemetryModalOpen(false);
      setTelemetryForm({
        parameter: 'Motor Temperature',
        readingValue: '',
        unit: '°C',
        operatingContext: 'Normal Operating Cycle',
      });
      await loadAssetData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record telemetry');
    } finally {
      setTelemetrySubmitting(false);
    }
  };

  const handleBreakdownSubmit = async (e) => {
    e.preventDefault();
    try {
      setBreakdownSubmitting(true);
      await recordBreakdown({
        assetId: id,
        problemDescription: breakdownForm.problemDescription,
        severity: breakdownForm.severity,
        observedSymptoms: breakdownForm.symptoms
          ? breakdownForm.symptoms.split(',').map((s) => s.trim())
          : [],
      });
      setBreakdownModalOpen(false);
      setBreakdownForm({ problemDescription: '', severity: 'Major', symptoms: '' });
      await loadAssetData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit breakdown');
    } finally {
      setBreakdownSubmitting(false);
    }
  };

  const handleRunEvaluation = async () => {
    try {
      setPredictionRunning(true);
      await runPredictionEvaluation(id);
      await loadAssetData();
    } catch (err) {
      alert('AI predictive evaluation failed.');
    } finally {
      setPredictionRunning(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading comprehensive asset lifecycle data..." size="lg" />;
  }

  if (error || !data?.asset) {
    return <ErrorState description={error || 'Asset not found'} onRetry={loadAssetData} />;
  }

  const { asset, recentTelemetry = [], inspections = [], workOrders = [], predictions = [], breakdowns = [] } = data;

  // Format telemetry readings for the trend line chart
  const formattedTelemetryTrends = recentTelemetry
    .slice()
    .reverse()
    .map((t) => ({
      time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: t.readingValue,
      parameter: t.parameter,
      anomaly: t.isAnomaly ? t.readingValue : null,
    }));

  return (
    <div className="space-y-6">
      {/* Back button & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/assets')}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded">
                {asset.assetCode}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{asset.name}</h2>
              <StatusBadge status={asset.currentCondition} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {asset.category} &bull; {asset.location} &bull; Mfr: {asset.manufacturer}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleRunEvaluation}
            disabled={predictionRunning}
            className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-orange-600" />
            {predictionRunning ? 'Evaluating...' : 'Run AI Evaluation'}
          </button>

          <button
            onClick={() => setTelemetryModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Log Telemetry Reading
          </button>

          <button
            onClick={() => setBreakdownModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Report Breakdown
          </button>
        </div>
      </div>

      {/* Asset Specifications & Real-Time Condition Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Health Rating</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{asset.healthScore}%</span>
            <span className="text-xs font-semibold text-slate-500">Condition Score</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                asset.healthScore > 75 ? 'bg-emerald-500' : asset.healthScore > 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${asset.healthScore}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Runtime & Cadence</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 font-mono">
              {asset.runtimeHours?.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Hours</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Service Interval: <span className="font-semibold text-slate-700">{asset.maintenanceIntervalHours} hrs</span>
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Operational Status</span>
          <div className="pt-1">
            <StatusBadge status={asset.operationalStatus} className="text-sm px-3 py-1" />
          </div>
          <p className="text-[11px] text-slate-500">
            Criticality: <span className="font-semibold text-slate-700">{asset.criticality}</span>
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Last Inspection</span>
          <div className="text-sm font-bold text-slate-800 pt-1">
            {asset.lastInspectionDate ? new Date(asset.lastInspectionDate).toLocaleDateString() : 'No record'}
          </div>
          <p className="text-[11px] text-slate-500">
            Registered: {new Date(asset.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Monitored Parameters Cards */}
      {asset.monitoredParameters?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {asset.monitoredParameters.map((param, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-[11px] font-semibold text-slate-500 truncate">{param.parameter}</div>
              <div className="text-xl font-bold text-slate-800 font-mono mt-1">
                {param.currentValue} <span className="text-xs font-normal text-slate-500">{param.unit}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Safe: {param.minSafeValue} - {param.maxSafeValue} {param.unit}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Telemetry Trend Chart */}
      <ChartCard
        title="Live Sensor Telemetry Trend"
        subtitle="Recent chronological readings and dynamic anomaly flags"
      >
        {formattedTelemetryTrends.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No telemetry recorded yet.</div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedTelemetryTrends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ea580c"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#ea580c' }}
                  name="Reading"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      {/* Dual Column: Active Predictions & Open Work Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictions */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-orange-600" />
              Failure Predictions & RUL
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{predictions.length} History</span>
          </div>

          {predictions.length === 0 ? (
            <p className="text-xs text-slate-400 p-4 text-center">No failure predictions logged for this asset.</p>
          ) : (
            <div className="space-y-3">
              {predictions.map((p) => (
                <div key={p._id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{p.failureType}</span>
                    <StatusBadge status={p.riskLevel} />
                  </div>
                  <p className="text-slate-600">{p.explanation}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <span>
                      Est. RUL: <strong className="text-slate-800">{p.remainingUsefulLifeHours} hrs</strong>
                    </span>
                    <span>
                      Risk Score: <strong className="text-rose-600">{p.riskScore}%</strong>
                    </span>
                    <span className="font-mono text-[10px] text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">
                      {p.modelVersion}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Work Orders */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <Wrench className="w-4 h-4 mr-2 text-orange-600" />
              Maintenance Work Orders
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{workOrders.length} Records</span>
          </div>

          {workOrders.length === 0 ? (
            <p className="text-xs text-slate-400 p-4 text-center">No work orders recorded for this asset.</p>
          ) : (
            <div className="space-y-3">
              {workOrders.map((wo) => (
                <div key={wo._id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-orange-800">{wo.workOrderNumber}</span>
                    <StatusBadge status={wo.status} />
                  </div>
                  <div className="font-semibold text-slate-800">{wo.title}</div>
                  <p className="text-slate-500 line-clamp-1">{wo.description}</p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>Technician: {wo.assignedTechnician?.name || 'Unassigned'}</span>
                    <span>Priority: {wo.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Telemetry Manual Entry Modal */}
      <Modal
        isOpen={telemetryModalOpen}
        onClose={() => setTelemetryModalOpen(false)}
        title="Record Sensor Reading"
        subtitle={`Submit telemetry observation for ${asset.assetCode}`}
      >
        <form onSubmit={handleTelemetrySubmit} className="space-y-4">
          <FormInput
            label="Monitored Parameter"
            name="parameter"
            required
            type="select"
            value={telemetryForm.parameter}
            onChange={(e) => {
              const val = e.target.value;
              let unit = '°C';
              if (val.includes('Vibration')) unit = 'mm/s';
              if (val.includes('Oxygen')) unit = 'mg/L';
              if (val.includes('Pressure')) unit = 'bar';
              if (val.includes('Power')) unit = 'kW';
              if (val.includes('pH')) unit = 'pH';
              setTelemetryForm({ ...telemetryForm, parameter: val, unit });
            }}
            options={[
              { value: 'Motor Temperature', label: 'Motor Temperature (°C)' },
              { value: 'Vibration', label: 'Vibration Amplitude (mm/s)' },
              { value: 'Dissolved Oxygen', label: 'Dissolved Oxygen (mg/L)' },
              { value: 'Water Temperature', label: 'Water Temperature (°C)' },
              { value: 'Refrigerant Pressure', label: 'Refrigerant Pressure (bar)' },
              { value: 'Power Consumption', label: 'Power Consumption (kW)' },
              { value: 'pH Level', label: 'pH Level (pH)' },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Reading Value"
              name="readingValue"
              required
              type="number"
              step="any"
              placeholder="e.g. 78.4"
              value={telemetryForm.readingValue}
              onChange={(e) => setTelemetryForm({ ...telemetryForm, readingValue: e.target.value })}
            />
            <FormInput
              label="Engineering Unit"
              name="unit"
              required
              value={telemetryForm.unit}
              onChange={(e) => setTelemetryForm({ ...telemetryForm, unit: e.target.value })}
            />
          </div>

          <FormInput
            label="Operational Context"
            name="operatingContext"
            placeholder="e.g. Full Throttle Transit, High Swell Storm, Feeding Cycle"
            value={telemetryForm.operatingContext}
            onChange={(e) => setTelemetryForm({ ...telemetryForm, operatingContext: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setTelemetryModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={telemetrySubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs"
            >
              {telemetrySubmitting ? 'Logging...' : 'Save Reading'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Report Breakdown Modal */}
      <Modal
        isOpen={breakdownModalOpen}
        onClose={() => setBreakdownModalOpen(false)}
        title="Report Equipment Breakdown"
        subtitle={`Immediate escalation & maintenance request for ${asset.assetCode}`}
      >
        <form onSubmit={handleBreakdownSubmit} className="space-y-4">
          <FormInput
            label="Problem Description"
            name="problemDescription"
            required
            type="textarea"
            rows={3}
            placeholder="Describe what occurred, abnormal sounds, leaks, or stopped motors..."
            value={breakdownForm.problemDescription}
            onChange={(e) => setBreakdownForm({ ...breakdownForm, problemDescription: e.target.value })}
          />

          <FormInput
            label="Severity Rating"
            name="severity"
            type="select"
            value={breakdownForm.severity}
            onChange={(e) => setBreakdownForm({ ...breakdownForm, severity: e.target.value })}
            options={[
              { value: 'Minor', label: 'Minor - Equipment operates with degraded performance' },
              { value: 'Major', label: 'Major - Equipment disabled; partial line stoppage' },
              { value: 'Catastrophic', label: 'Catastrophic - Severe safety/biomass threat' },
            ]}
          />

          <FormInput
            label="Observed Symptoms (Comma separated)"
            name="symptoms"
            placeholder="e.g. High temp alarm, Burning odor, Bearing rattling"
            value={breakdownForm.symptoms}
            onChange={(e) => setBreakdownForm({ ...breakdownForm, symptoms: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setBreakdownModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={breakdownSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
            >
              {breakdownSubmitting ? 'Submitting...' : 'Submit Breakdown Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssetDetailsPage;
