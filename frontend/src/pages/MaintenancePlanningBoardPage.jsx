import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Wrench,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Modal } from '../components/Modal';
import { FormInput } from '../components/FormInput';
import { useAuth } from '../context/AuthContext';
import {
  getWorkOrders,
  createWorkOrder,
  moveWorkOrderStatus,
  approveWorkOrder,
  rejectWorkOrder,
  verifyClosure,
} from '../services/maintenanceService';
import { getAssets } from '../services/assetService';

const KANBAN_COLUMNS = [
  { id: 'Reported', label: 'Reported', color: 'border-slate-300 bg-slate-50' },
  { id: 'Pending Review', label: 'Pending Review', color: 'border-amber-300 bg-amber-50/30' },
  { id: 'Approved', label: 'Approved', color: 'border-sky-300 bg-sky-50/30' },
  { id: 'Scheduled', label: 'Scheduled', color: 'border-indigo-300 bg-indigo-50/30' },
  { id: 'In Progress', label: 'In Progress', color: 'border-orange-300 bg-orange-50/30' },
  { id: 'Awaiting Verification', label: 'Awaiting Verification', color: 'border-purple-300 bg-purple-50/30' },
  { id: 'Completed', label: 'Completed', color: 'border-emerald-300 bg-emerald-50/30' },
  { id: 'Rejected', label: 'Rejected', color: 'border-rose-300 bg-rose-50/30' },
];

export const MaintenancePlanningBoardPage = () => {
  const { user, hasAnyRole } = useAuth();

  const [workOrders, setWorkOrders] = useState([]);
  const [assetsList, setAssetsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    assetId: '',
    title: '',
    description: '',
    priority: 'Medium',
    requiredSkill: 'Mechanical Reliability',
    expectedDowntimeHours: 2,
    scheduledDate: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Selected Card for details / action
  const [selectedTask, setSelectedTask] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [woData, assetData] = await Promise.all([
        getWorkOrders({ limit: 100, priority: priorityFilter }),
        getAssets({ limit: 100 }),
      ]);
      setWorkOrders(woData.workOrders || []);
      setAssetsList(assetData.assets || []);
    } catch (err) {
      console.error('Failed to load Kanban board:', err);
    } finally {
      setLoading(false);
    }
  }, [priorityFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.assetId) {
      alert('Please select a target asset.');
      return;
    }
    try {
      setCreateLoading(true);
      await createWorkOrder(createForm);
      setCreateModalOpen(false);
      setCreateForm({
        assetId: '',
        title: '',
        description: '',
        priority: 'Medium',
        requiredSkill: 'Mechanical Reliability',
        expectedDowntimeHours: 2,
        scheduledDate: '',
      });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create work order');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleMoveStatus = async (task, targetStatus) => {
    try {
      await moveWorkOrderStatus(task._id, {
        newStatus: targetStatus,
        reason: `Moved from ${task.status} to ${targetStatus}`,
      });
      await loadData();
      if (selectedTask?._id === task._id) {
        setSelectedTask(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update work order status');
    }
  };

  const handleApprove = async () => {
    if (!selectedTask) return;
    try {
      setActionLoading(true);
      await approveWorkOrder(selectedTask._id, actionReason || 'Approved for scheduling');
      setSelectedTask(null);
      setActionReason('');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTask) return;
    if (!actionReason) {
      alert('Rejection justification is mandatory.');
      return;
    }
    try {
      setActionLoading(true);
      await rejectWorkOrder(selectedTask._id, actionReason);
      setSelectedTask(null);
      setActionReason('');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyClosure = async () => {
    if (!selectedTask) return;
    try {
      setActionLoading(true);
      await verifyClosure(
        selectedTask._id,
        actionReason || 'Physical equipment verification complete. Returned to service.'
      );
      setSelectedTask(null);
      setActionReason('');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Closure verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Rendering 8-stage maintenance board..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Maintenance Planning & Closure Verification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            8-stage end-to-end reliability workflow board with authorized closure signoffs
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="">All Priorities</option>
            <option value="Emergency">Emergency</option>
            <option value="Urgent">Urgent</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={loadData}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-xs hover:bg-slate-50 transition-colors"
            title="Refresh Board"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {hasAnyRole(['Maintenance Admin', 'Operations Manager']) && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Work Order
            </button>
          )}
        </div>
      </div>

      {/* 8-Column Horizontal Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1700px] items-start">
          {KANBAN_COLUMNS.map((col) => {
            const columnTasks = workOrders.filter((wo) => wo.status === col.id);

            return (
              <div
                key={col.id}
                className={`w-[210px] shrink-0 rounded-2xl border ${col.color} p-3 flex flex-col max-h-[750px] shadow-2xs`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                  <h3 className="text-xs font-extrabold text-slate-800 tracking-tight">
                    {col.label}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-2xs">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Cards Container */}
                <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                  {columnTasks.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-slate-400 italic">
                      No tasks in this stage
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        className="p-3 bg-white rounded-xl border border-slate-200 hover:border-orange-500 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-orange-800 bg-orange-50 px-1.5 py-0.5 rounded">
                            {task.workOrderNumber}
                          </span>
                          <StatusBadge status={task.priority} />
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-orange-700 transition-colors line-clamp-2">
                          {task.title}
                        </h4>

                        <p className="text-[11px] text-slate-500 line-clamp-2">{task.description}</p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate max-w-[110px]">
                            {task.assetId?.name || 'Asset'}
                          </span>
                          <span>{task.expectedDowntimeHours}h DT</span>
                        </div>

                        {task.assignedTechnician && (
                          <div className="flex items-center space-x-1 text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{task.assignedTechnician.name}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Work Order Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Maintenance Work Order"
        subtitle="Dispatch preventative or corrective service request"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormInput
            label="Target Asset"
            name="assetId"
            type="select"
            required
            placeholder="Select aquaculture asset..."
            value={createForm.assetId}
            onChange={(e) => setCreateForm({ ...createForm, assetId: e.target.value })}
            options={assetsList.map((a) => ({
              value: a._id,
              label: `${a.assetCode} - ${a.name} (${a.category})`,
            }))}
          />

          <FormInput
            label="Work Order Title"
            name="title"
            required
            placeholder="e.g. Aerator Bearing Replacement"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
          />

          <FormInput
            label="Task Description & Scope"
            name="description"
            type="textarea"
            required
            rows={3}
            placeholder="Step-by-step repair instruction..."
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Priority"
              name="priority"
              type="select"
              value={createForm.priority}
              onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
              options={[
                { value: 'Low', label: 'Low (Scheduled Maintenance)' },
                { value: 'Medium', label: 'Medium (Standard)' },
                { value: 'Urgent', label: 'Urgent (Upcoming Risk)' },
                { value: 'Emergency', label: 'Emergency (Downtime/Loss)' },
              ]}
            />
            <FormInput
              label="Expected Downtime (Hours)"
              name="expectedDowntimeHours"
              type="number"
              value={createForm.expectedDowntimeHours}
              onChange={(e) => setCreateForm({ ...createForm, expectedDowntimeHours: Number(e.target.value) })}
            />
          </div>

          <FormInput
            label="Scheduled Date"
            name="scheduledDate"
            type="date"
            value={createForm.scheduledDate}
            onChange={(e) => setCreateForm({ ...createForm, scheduledDate: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs"
            >
              {createLoading ? 'Dispatching...' : 'Dispatch Work Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Selected Task Details & Action Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => {
            setSelectedTask(null);
            setActionReason('');
          }}
          title={`${selectedTask.workOrderNumber}: ${selectedTask.title}`}
          subtitle={`Current Stage: ${selectedTask.status}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400 font-semibold">Priority</span>
                <div className="pt-0.5">
                  <StatusBadge status={selectedTask.priority} />
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Asset</span>
                <p className="font-bold text-slate-800 mt-0.5 truncate">
                  {selectedTask.assetId?.name || 'Asset'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Downtime</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedTask.expectedDowntimeHours} Hours
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Technician</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {selectedTask.assignedTechnician?.name || 'Unassigned'}
                </p>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700">Detailed Scope of Work</span>
              <p className="mt-1 text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                {selectedTask.description}
              </p>
            </div>

            {/* Role-Specific Stage Transitions */}
            {user?.role === 'Vendor' ? (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-600 text-xs">
                <span className="font-bold text-stone-800">Parts Vendor Access:</span> You have view-only access to work order specifications to prepare and supply requested replacement components.
              </div>
            ) : (
              <div className="space-y-3">
                <span className="font-bold text-stone-800">Workflow Action:</span>
                <div className="flex flex-wrap gap-2">
                  {(selectedTask.status === 'Approved' || selectedTask.status === 'Scheduled' || selectedTask.status === 'Reported') && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleMoveStatus(selectedTask, 'In Progress')}
                        className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm shadow-orange-500/20 cursor-pointer flex items-center"
                      >
                        Start Work &rarr; Mark In Progress
                      </button>

                      {selectedTask.status === 'Approved' && (
                        <button
                          type="button"
                          onClick={() => handleMoveStatus(selectedTask, 'Scheduled')}
                          className="px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200 cursor-pointer"
                        >
                          Mark as Scheduled
                        </button>
                      )}
                    </>
                  )}

                  {selectedTask.status === 'In Progress' && (
                    <button
                      type="button"
                      onClick={() => handleMoveStatus(selectedTask, 'Awaiting Verification')}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-500/20 cursor-pointer flex items-center"
                    >
                      Finish Work &rarr; Submit for Verification
                    </button>
                  )}

                  {selectedTask.status === 'Awaiting Verification' && (
                    <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200 w-full">
                      <span className="font-bold">Work Submitted:</span> Field repair is completed and waiting for Operations Manager (Arjun) or Admin (Vishal) closure verification below.
                    </div>
                  )}

                  {selectedTask.status === 'Completed' && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200 w-full">
                      <span className="font-bold">Task Completed:</span> This maintenance work order has been verified and officially closed.
                    </div>
                  )}
                </div>

                {/* Additional manual column switcher for Managers & Admins */}
                {hasAnyRole(['Maintenance Admin', 'Operations Manager']) && (
                  <div className="pt-2 border-t border-stone-100 mt-2">
                    <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
                      Or Switch to Any Kanban Stage (Manager Override):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {KANBAN_COLUMNS.map((c) => (
                        <button
                          key={c.id}
                          disabled={selectedTask.status === c.id}
                          onClick={() => handleMoveStatus(selectedTask, c.id)}
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded border transition-all cursor-pointer ${
                            selectedTask.status === c.id
                              ? 'bg-orange-600 text-white border-orange-600'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Feedback Reason input */}
            {(selectedTask.status === 'Pending Review' ||
              selectedTask.status === 'Awaiting Verification') && (
              <div className="pt-2">
                <FormInput
                  label="Decision Notes / Closure Verification Feedback"
                  name="actionReason"
                  placeholder="Enter approval criteria, rejection reason, or verification walk-through notes..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                />
              </div>
            )}

            {/* Special Approval / Closure Verification Buttons for Managers & Admins */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedTask.status === 'Pending Review' &&
                  hasAnyRole(['Maintenance Admin', 'Operations Manager']) && (
                    <>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleReject}
                        className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100"
                      >
                        Reject Work Order
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleApprove}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs"
                      >
                        Approve for Scheduling
                      </button>
                    </>
                  )}

                {selectedTask.status === 'Awaiting Verification' &&
                  hasAnyRole(['Maintenance Admin', 'Operations Manager']) && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleVerifyClosure}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center"
                    >
                      <ShieldCheck className="w-4 h-4 mr-1.5" />
                      Confirm Authorized Closure Verification
                    </button>
                  )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MaintenancePlanningBoardPage;
