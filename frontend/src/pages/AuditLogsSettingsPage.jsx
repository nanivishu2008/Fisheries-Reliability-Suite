import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Settings,
  Download,
  Filter,
  RefreshCw,
  Sliders,
  Boxes,
  Plus,
  Package,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { FormInput } from '../components/FormInput';
import { SearchBar, Pagination } from '../components/FilterPanel';
import {
  getAuditLogs,
  downloadAuditLogsCsv,
  getSettings,
  updateSetting,
  getSpareParts,
  createSparePart,
} from '../services/reportService';

export const AuditLogsSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'settings' | 'parts'

  // Audit Logs State
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [auditLoading, setAuditLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Settings State
  const [settings, setSettings] = useState([]);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Spare Parts State
  const [spareParts, setSpareParts] = useState([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [partModalOpen, setPartModalOpen] = useState(false);
  const [partForm, setPartForm] = useState({
    partNumber: '',
    name: '',
    category: 'Mechanical',
    quantityOnHand: 10,
    minimumStockLevel: 3,
    unitCost: 45,
    supplier: 'MarineTech Spares Ltd',
    storageBin: 'Bin A-01',
  });

  const loadAuditLogs = useCallback(async () => {
    try {
      setAuditLoading(true);
      const data = await getAuditLogs({
        page: currentPage,
        limit: 20,
        action: actionFilter,
        actorRole: roleFilter,
      });
      setLogs(data.logs || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  }, [currentPage, actionFilter, roleFilter]);

  const loadSettings = async () => {
    try {
      setSettingsLoading(true);
      const data = await getSettings();
      setSettings(data.settings || []);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadSpareParts = async () => {
    try {
      setPartsLoading(true);
      const data = await getSpareParts();
      setSpareParts(data.parts || []);
    } catch (err) {
      console.error('Failed to load spare parts:', err);
    } finally {
      setPartsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') loadAuditLogs();
    if (activeTab === 'settings') loadSettings();
    if (activeTab === 'parts') loadSpareParts();
  }, [activeTab, loadAuditLogs]);

  const handleCreatePartSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSparePart(partForm);
      setPartModalOpen(false);
      setPartForm({
        partNumber: '',
        name: '',
        category: 'Mechanical',
        quantityOnHand: 10,
        minimumStockLevel: 3,
        unitCost: 45,
        supplier: 'MarineTech Spares Ltd',
        storageBin: 'Bin A-01',
      });
      await loadSpareParts();
    } catch (err) {
      alert('Failed to register spare part');
    }
  };

  const auditColumns = [
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      render: (r) => (
        <span className="font-mono text-[11px] text-slate-500">
          {new Date(r.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Actor & Role',
      accessor: 'actorName',
      render: (r) => (
        <div>
          <div className="font-bold text-slate-800">{r.actorName}</div>
          <div className="text-[10px] text-slate-400">{r.actorRole}</div>
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (r) => (
        <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {r.action}
        </span>
      ),
    },
    {
      header: 'Target Entity',
      accessor: 'entityName',
      render: (r) => (
        <span className="text-xs text-slate-600 font-semibold">
          {r.entityName} {r.entityId ? `(#${r.entityId.slice(-6)})` : ''}
        </span>
      ),
    },
    {
      header: 'Outcome',
      accessor: 'outcome',
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            r.outcome === 'SUCCESS'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-rose-50 text-rose-700'
          }`}
        >
          {r.outcome}
        </span>
      ),
    },
    {
      header: 'Audit Details',
      accessor: 'details',
      render: (r) => <span className="text-xs text-slate-600 line-clamp-1">{r.details}</span>,
    },
    {
      header: 'IP Address',
      accessor: 'ipAddress',
      render: (r) => <span className="font-mono text-[10px] text-slate-400">{r.ipAddress}</span>,
    },
  ];

  const partColumns = [
    { header: 'Part Number', accessor: 'partNumber', render: (r) => <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-xs">{r.partNumber}</span> },
    { header: 'Component Name', accessor: 'name', render: (r) => <strong className="text-slate-900">{r.name}</strong> },
    { header: 'Category', accessor: 'category', render: (r) => <span className="text-xs text-slate-600">{r.category}</span> },
    {
      header: 'Stock On Hand',
      accessor: 'quantityOnHand',
      render: (r) => (
        <div className="flex items-center space-x-2">
          <span className={`font-bold font-mono text-sm ${r.quantityOnHand <= r.minimumStockLevel ? 'text-rose-600' : 'text-slate-800'}`}>
            {r.quantityOnHand} Units
          </span>
          {r.quantityOnHand <= r.minimumStockLevel && (
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 rounded">
              Low Stock Alert
            </span>
          )}
        </div>
      ),
    },
    { header: 'Unit Cost', accessor: 'unitCost', render: (r) => <span className="font-mono text-xs font-semibold">${r.unitCost}</span> },
    { header: 'Storage Location', accessor: 'storageBin', render: (r) => <span className="text-xs text-slate-500">{r.storageBin}</span> },
    { header: 'Supplier', accessor: 'supplier', render: (r) => <span className="text-xs text-slate-600">{r.supplier}</span> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Audit Logs & Governance Settings
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
              Immutable Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-proof security audit trail, system parameters, and spare-parts inventory catalog
          </p>
        </div>

        {activeTab === 'audit' && (
          <button
            onClick={downloadAuditLogsCsv}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Audit Trail CSV
          </button>
        )}

        {activeTab === 'parts' && (
          <button
            onClick={() => setPartModalOpen(true)}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Spare Part SKU
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'audit'
              ? 'border-teal-600 text-teal-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Security & Action Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'settings'
              ? 'border-teal-600 text-teal-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          System Master Configuration
        </button>
        <button
          onClick={() => setActiveTab('parts')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'parts'
              ? 'border-teal-600 text-teal-700 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Spare Parts Inventory Catalog
        </button>
      </div>

      {/* Tab 1: Audit Logs View */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <SearchBar
              value={actionFilter}
              onChange={(v) => {
                setActionFilter(v);
                setCurrentPage(1);
              }}
              onClear={() => setActionFilter('')}
              placeholder="Search by action (e.g. LOGIN, WORK_ORDER, AI)..."
              className="max-w-md w-full"
            />

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="">All Roles</option>
              <option value="Maintenance Admin">Maintenance Admin</option>
              <option value="Operations Manager">Operations Manager</option>
              <option value="Technician">Technician</option>
              <option value="Vendor">Vendor</option>
            </select>
          </div>

          <DataTable
            columns={auditColumns}
            data={logs}
            loading={auditLoading}
            emptyTitle="No audit log entries recorded"
            emptyDescription="User and system operations will be automatically appended here."
          />

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Tab 2: System Configuration */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {settingsLoading ? (
            <LoadingSpinner text="Retrieving operational thresholds..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {settings.map((s) => (
                <div key={s._id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      {s.key}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{s.category}</span>
                  </div>

                  <p className="text-xs text-slate-600">{s.description}</p>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono overflow-x-auto text-slate-800">
                    <pre>{JSON.stringify(s.value, null, 2)}</pre>
                  </div>

                  <div className="text-[10px] text-slate-400">
                    Updated By: {s.lastUpdatedBy} on {new Date(s.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Spare Parts Inventory */}
      {activeTab === 'parts' && (
        <div className="space-y-4">
          <DataTable
            columns={partColumns}
            data={spareParts}
            loading={partsLoading}
            emptyTitle="No spare parts cataloged"
            emptyDescription="Add SKUs to track parts availability for preventive maintenance."
          />
        </div>
      )}

      {/* Add Spare Part Modal */}
      {partModalOpen && (
        <Modal
          isOpen={partModalOpen}
          onClose={() => setPartModalOpen(false)}
          title="Add Spare Part SKU"
          subtitle="Catalog replacement components for aquaculture equipment"
        >
          <form onSubmit={handleCreatePartSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Part Number / SKU"
                name="partNumber"
                required
                placeholder="e.g. SP-BRG-7200"
                value={partForm.partNumber}
                onChange={(e) => setPartForm({ ...partForm, partNumber: e.target.value })}
              />
              <FormInput
                label="Component Name"
                name="name"
                required
                placeholder="e.g. SKF Spherical Roller Bearing"
                value={partForm.name}
                onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Category"
                name="category"
                type="select"
                value={partForm.category}
                onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                options={[
                  { value: 'Mechanical', label: 'Mechanical' },
                  { value: 'Electrical', label: 'Electrical' },
                  { value: 'Refrigeration', label: 'Refrigeration' },
                  { value: 'Sensory', label: 'Sensory' },
                  { value: 'Structural', label: 'Structural' },
                  { value: 'Consumables', label: 'Consumables' },
                ]}
              />
              <FormInput
                label="Storage Bin / Location"
                name="storageBin"
                placeholder="e.g. Warehouse Bay 3 - Rack B"
                value={partForm.storageBin}
                onChange={(e) => setPartForm({ ...partForm, storageBin: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormInput
                label="Quantity On Hand"
                name="quantityOnHand"
                type="number"
                value={partForm.quantityOnHand}
                onChange={(e) => setPartForm({ ...partForm, quantityOnHand: Number(e.target.value) })}
              />
              <FormInput
                label="Minimum Safe Stock"
                name="minimumStockLevel"
                type="number"
                value={partForm.minimumStockLevel}
                onChange={(e) => setPartForm({ ...partForm, minimumStockLevel: Number(e.target.value) })}
              />
              <FormInput
                label="Unit Cost ($)"
                name="unitCost"
                type="number"
                value={partForm.unitCost}
                onChange={(e) => setPartForm({ ...partForm, unitCost: Number(e.target.value) })}
              />
            </div>

            <FormInput
              label="Supplier"
              name="supplier"
              value={partForm.supplier}
              onChange={(e) => setPartForm({ ...partForm, supplier: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPartModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
              >
                Catalog Part
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AuditLogsSettingsPage;
