import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Flame,
  AlertTriangle,
  Clock,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Info,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { getPredictions, runPredictionEvaluation } from '../services/predictionService';

export const FailureRiskPredictionPage = () => {
  const { hasAnyRole } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [riskFilter, setRiskFilter] = useState('');

  const loadPredictions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPredictions({ riskLevel: riskFilter, limit: 50 });
      setPredictions(data.predictions || []);
    } catch (err) {
      console.error('Failed to load predictions:', err);
    } finally {
      setLoading(false);
    }
  }, [riskFilter]);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  const handleRunBatchEvaluation = async () => {
    try {
      setEvaluating(true);
      await runPredictionEvaluation();
      await loadPredictions();
    } catch (err) {
      alert('Failed to execute AI predictive evaluation batch.');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Computing dynamic failure risks & remaining useful life..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
              Breakdown Predictions & Remaining Equipment Life
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
              AI Early Warning
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Forecasts impending machine failures before they occur, calculating safe operating hours remaining
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-700"
          >
            <option value="">All Risk Levels</option>
            <option value="Critical">Critical Risk (&gt;75%)</option>
            <option value="High">High Risk (50-75%)</option>
            <option value="Medium">Medium Risk (25-50%)</option>
            <option value="Low">Low Risk (&lt;25%)</option>
          </select>

          {hasAnyRole(['Maintenance Admin', 'Operations Manager']) && (
            <button
              onClick={handleRunBatchEvaluation}
              disabled={evaluating}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              {evaluating ? 'Analyzing Fleet...' : 'Re-Run AI Fleet Analysis'}
            </button>
          )}
        </div>
      </div>

      {/* Model Transparency Banner */}
      <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl flex items-start space-x-3 text-xs text-orange-950">
        <Info className="w-4 h-4 text-orange-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">How Predictions Work:</span> The system combines live sensor measurements (vibration, operating temperature, motor current) with maintenance runtime benchmarks and Google Gemini AI. All predictions serve as early-warning alerts for human technicians and supervisors to inspect equipment before a breakdown occurs.
        </div>
      </div>

      {/* Predictions Cards Grid */}
      {predictions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No active failure risk alerts</h3>
          <p className="text-xs text-slate-500 mt-1">
            Operating parameters across monitored equipment are currently within acceptable thresholds.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {predictions.map((p) => {
            const isCritical = p.riskLevel === 'Critical';
            const isHigh = p.riskLevel === 'High';

            return (
              <div
                key={p._id}
                onClick={() => setSelectedPrediction(p)}
                className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isCritical
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : isHigh
                    ? 'border-amber-300'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-mono text-xs font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded">
                      {p.assetId?.assetCode || 'Asset'}
                    </span>
                    <StatusBadge status={p.riskLevel} />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-3">{p.failureType}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{p.assetId?.name}</p>

                  {/* Risk Score & RUL Meters */}
                  <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-stone-50 rounded-xl border border-stone-100">
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase">Breakdown Risk</span>
                      <div className="text-2xl font-black text-stone-800 flex items-baseline space-x-1">
                        <span className={isCritical ? 'text-rose-600' : isHigh ? 'text-amber-600' : 'text-stone-800'}>
                          {p.riskScore}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase">Safe Runtime Left</span>
                      <div className="text-2xl font-black text-stone-800 font-mono">
                        {p.remainingUsefulLifeHours} <span className="text-xs font-normal text-stone-500">hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Explanation */}
                  <p className="text-xs text-stone-600 line-clamp-2">{p.explanation}</p>
                </div>

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span className="font-mono text-[10px] bg-stone-100 px-2 py-0.5 rounded font-semibold text-stone-600">
                    {p.engineType === 'GEMINI_AI' ? 'Google Gemini AI' : 'Sensor Baseline Engine'}
                  </span>
                  <span className="text-orange-700 font-bold hover:text-orange-900">
                    View Breakdown Details &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Prediction Detail Modal */}
      {selectedPrediction && (
        <Modal
          isOpen={!!selectedPrediction}
          onClose={() => setSelectedPrediction(null)}
          title={`Predicted Issue: ${selectedPrediction.failureType}`}
          subtitle={`Equipment: ${selectedPrediction.assetId?.name} (${selectedPrediction.assetId?.assetCode})`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Top Score Band */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-stone-50 rounded-xl text-center border border-stone-200">
              <div>
                <span className="text-stone-500 font-semibold uppercase text-[10px]">Breakdown Risk</span>
                <p className="text-2xl font-black text-rose-600 mt-1">{selectedPrediction.riskScore}%</p>
              </div>
              <div>
                <span className="text-stone-500 font-semibold uppercase text-[10px]">Safe Hours Left</span>
                <p className="text-2xl font-black text-stone-800 font-mono mt-1">
                  {selectedPrediction.remainingUsefulLifeHours} hrs
                </p>
              </div>
              <div>
                <span className="text-stone-500 font-semibold uppercase text-[10px]">AI Confidence</span>
                <p className="text-2xl font-black text-orange-700 mt-1">
                  {(selectedPrediction.confidenceScore * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-stone-800 mb-1">Why This Might Fail (Root Cause Analysis)</h4>
              <p className="text-stone-700 bg-white p-3.5 rounded-xl border border-stone-200 leading-relaxed">
                {selectedPrediction.explanation}
              </p>
            </div>

            {/* Contributing Telemetry Factors */}
            <div>
              <h4 className="font-bold text-stone-800 mb-2">Sensor Factors Causing This Alert</h4>
              <div className="space-y-2">
                {selectedPrediction.contributingFactors?.map((f, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{f.factor}</span>
                      <p className="text-slate-500 mt-0.5">{f.description}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        f.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : f.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {f.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedPrediction(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FailureRiskPredictionPage;
