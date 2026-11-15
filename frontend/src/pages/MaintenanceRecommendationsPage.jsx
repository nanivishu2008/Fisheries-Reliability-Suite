import React, { useState, useEffect, useCallback } from 'react';
import {
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  AlertCircle,
  Calendar,
  Layers,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { FormInput } from '../components/FormInput';
import { useAuth } from '../context/AuthContext';
import {
  getRecommendations,
  acceptRecommendation,
  rejectRecommendation,
  overrideRecommendation,
} from '../services/predictionService';

export const MaintenanceRecommendationsPage = () => {
  const { hasAnyRole } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pending');

  // Action Modals
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [activeRec, setActiveRec] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [overrideForm, setOverrideForm] = useState({
    overrideReason: '',
    customDate: '',
    customPriority: 'Medium',
    customNotes: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRecommendations({ status: statusFilter });
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Failed to load AI recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleAccept = async (rec) => {
    if (!window.confirm(`Accept this recommendation and automatically schedule a work order for ${rec.assetId?.name}?`)) return;
    try {
      setActionLoading(true);
      await acceptRecommendation(rec._id, 'Accepted recommendation by authorized manager');
      await loadRecommendations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept recommendation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason) {
      alert('A justification reason is mandatory when rejecting recommendations.');
      return;
    }
    try {
      setActionLoading(true);
      await rejectRecommendation(activeRec._id, rejectReason);
      setRejectModalOpen(false);
      setRejectReason('');
      setActiveRec(null);
      await loadRecommendations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject recommendation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!overrideForm.overrideReason) {
      alert('An override reason is required.');
      return;
    }
    try {
      setActionLoading(true);
      await overrideRecommendation(activeRec._id, overrideForm);
      setOverrideModalOpen(false);
      setOverrideForm({ overrideReason: '', customDate: '', customPriority: 'Medium', customNotes: '' });
      setActiveRec(null);
      await loadRecommendations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to override recommendation');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading AI maintenance recommendations..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
              Action Recommendations & Work Suggestions
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
              Manager Review
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Smart repair recommendations created from machine sensor alerts and parts stock. Review to approve, customize, or dismiss.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="Pending">Pending Review ({recommendations.filter((r) => r.status === 'Pending').length})</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Overridden">Overridden</option>
            <option value="">All Review Statuses</option>
          </select>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No recommendations matching current filter</h3>
          <p className="text-xs text-slate-500 mt-1">
            Check other review filters or run AI failure evaluation to generate new actions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec._id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded">
                    {rec.assetId?.assetCode || 'Asset'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{rec.recommendationTitle}</h3>
                  <StatusBadge status={rec.priority} />
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400">Status:</span>
                  <StatusBadge status={rec.status} />
                </div>
              </div>

              {/* Rationale & Target Asset */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="md:col-span-2 space-y-1">
                  <span className="font-bold text-slate-700">Synthesized Engineering Justification</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                    {rec.rationale}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-700">Recommended Execution</span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Target Date:</span>
                      <p className="font-bold text-slate-800">{new Date(rec.recommendedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Est. Downtime:</span>
                      <p className="font-bold text-slate-800">{rec.expectedDowntimeHours} Hours</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Maintenance Type:</span>
                      <p className="font-bold text-slate-800">{rec.maintenanceType}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-700">Skills & Spare Parts</span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Required Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rec.requiredSkills?.map((s, idx) => (
                          <span key={idx} className="bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Likely Spare Parts:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rec.probableSpareParts?.map((p, idx) => (
                          <span key={idx} className="bg-orange-50 text-orange-800 border border-orange-200 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Trail if Already Reviewed */}
              {rec.status !== 'Pending' && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                  <span>
                    Reviewed by: <strong>{rec.reviewedBy?.name || 'Authorized Reviewer'}</strong> on{' '}
                    {new Date(rec.reviewedAt).toLocaleDateString()}
                  </span>
                  {rec.reviewNotes && (
                    <span className="italic text-slate-500">"{rec.reviewNotes}"</span>
                  )}
                  {rec.createdWorkOrderId && (
                    <span className="font-mono text-orange-700 font-bold">
                      Work Order: {rec.createdWorkOrderId.workOrderNumber}
                    </span>
                  )}
                </div>
              )}

              {/* Actions Toolbar for Authorized Managers & Admins */}
              {rec.status === 'Pending' && hasAnyRole(['Maintenance Admin', 'Operations Manager']) && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => {
                      setActiveRec(rec);
                      setRejectModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    Reject Recommendation
                  </button>
                  <button
                    onClick={() => {
                      setActiveRec(rec);
                      setOverrideForm({
                        overrideReason: '',
                        customDate: '',
                        customPriority: rec.priority,
                        customNotes: '',
                      });
                      setOverrideModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    Override Parameters
                  </button>
                  <button
                    onClick={() => handleAccept(rec)}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs transition-colors"
                  >
                    Accept & Schedule Work Order
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject AI Maintenance Recommendation"
          subtitle="Mandatory feedback justification for model training audit trail"
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <FormInput
              label="Rejection Justification"
              name="rejectReason"
              required
              type="textarea"
              rows={3}
              placeholder="State operational reason (e.g. equipment already overhauled, false alarm reading, scheduled for decommission)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                {actionLoading ? 'Logging...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Override Modal */}
      {overrideModalOpen && (
        <Modal
          isOpen={overrideModalOpen}
          onClose={() => setOverrideModalOpen(false)}
          title="Manager Override of AI Recommendation"
          subtitle="Adjust execution date, priority, or technical scope with audit reason"
        >
          <form onSubmit={handleOverrideSubmit} className="space-y-4">
            <FormInput
              label="Mandatory Reason for Override"
              name="overrideReason"
              required
              placeholder="e.g. Parts on backorder; delaying service to coincide with harvest window"
              value={overrideForm.overrideReason}
              onChange={(e) => setOverrideForm({ ...overrideForm, overrideReason: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Custom Scheduled Date"
                name="customDate"
                type="date"
                value={overrideForm.customDate}
                onChange={(e) => setOverrideForm({ ...overrideForm, customDate: e.target.value })}
              />
              <FormInput
                label="Custom Priority"
                name="customPriority"
                type="select"
                value={overrideForm.customPriority}
                onChange={(e) => setOverrideForm({ ...overrideForm, customPriority: e.target.value })}
                options={[
                  { value: 'Low', label: 'Low' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Urgent', label: 'Urgent' },
                  { value: 'Emergency', label: 'Emergency' },
                ]}
              />
            </div>
            <FormInput
              label="Custom Technician Notes"
              name="customNotes"
              type="textarea"
              rows={2}
              placeholder="Specific directives for the maintenance team..."
              value={overrideForm.customNotes}
              onChange={(e) => setOverrideForm({ ...overrideForm, customNotes: e.target.value })}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOverrideModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs"
              >
                {actionLoading ? 'Saving...' : 'Apply Override & Schedule'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MaintenanceRecommendationsPage;
