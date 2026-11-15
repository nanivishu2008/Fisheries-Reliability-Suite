import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Plus,
  RefreshCw,
  ExternalLink,
  Filter,
  Search,
  Download,
  Trash2,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  MapPin,
  Clock,
  Shield,
} from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { SearchBar, Pagination } from '../components/FilterPanel';
import { Modal } from '../components/Modal';
import { FormInput } from '../components/FormInput';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { getAssets, createAsset, deleteAsset, getAssetStats } from '../services/assetService';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'All',
  'Aerators',
  'Vessels',
  'Ponds',
  'Cages',
  'Nets',
  'Ice Plants',
  'Cold Rooms',
  'Processing Equipment',
];

const LOCATIONS = [
  'All Locations',
  'South Bay Coastal Farm',
  'North Harbor Hatchery',
  'Processing Plant A',
  'Cold Storage Facility',
  'Offshore Pen Beta',
];

export const AssetRegistryPage = () => {
  const { hasRole, user } = useAuth();
  const navigate = useNavigate();

  // State
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [condition, setCondition] = useState('');
  const [status, setStatus] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    assetCode: '',
    name: '',
    category: 'Aerators',
    subCategory: '',
    location: 'South Bay Coastal Farm',
    criticality: 'Medium',
    currentCondition: 'Healthy',
    operationalStatus: 'Active',
    manufacturer: 'MarineTech Corp',
    model: '',
    maintenanceIntervalHours: 500,
  });
  const [registerLoading, setRegisterLoading] = useState(false);

  // Load Filtered Assets
  const loadAssets = useCallback(async () => {
    try {
      setTableLoading(true);
      const categoryParam = selectedCategory === 'All' ? '' : selectedCategory;
      const locationParam = locationFilter === 'All Locations' ? '' : locationFilter;

      const data = await getAssets({
        page: currentPage,
        limit: 10,
        search,
        category: categoryParam,
        condition,
        status,
        location: locationParam,
      });

      setAssets(data.assets || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to load assets table:', err);
      setError('Could not connect to backend asset service.');
    } finally {
      setTableLoading(false);
    }
  }, [currentPage, search, selectedCategory, condition, status, locationFilter]);

  const loadStats = async () => {
    try {
      const statsData = await getAssetStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load asset stats:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadAssets()]);
      setLoading(false);
    };
    init();
  }, [loadAssets]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      setRegisterLoading(true);
      await createAsset(registerForm);
      toast.success(`Asset ${registerForm.assetCode} registered successfully`);
      setIsRegisterModalOpen(false);
      setRegisterForm({
        assetCode: '',
        name: '',
        category: 'Aerators',
        subCategory: '',
        location: 'South Bay Coastal Farm',
        criticality: 'Medium',
        currentCondition: 'Healthy',
        operationalStatus: 'Active',
        manufacturer: 'MarineTech Corp',
        model: '',
        maintenanceIntervalHours: 500,
      });
      await Promise.all([loadStats(), loadAssets()]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create asset');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleDeactivate = async (e, id, code) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to decommission asset ${code}?`)) return;
    try {
      await deleteAsset(id);
      toast.success(`Asset ${code} decommissioned`);
      await Promise.all([loadStats(), loadAssets()]);
    } catch (err) {
      toast.error('Failed to decommission asset');
    }
  };

  const handleExportCSV = () => {
    if (!assets || assets.length === 0) {
      toast.error('No assets to export');
      return;
    }
    const headers = ['Asset Code', 'Name', 'Category', 'Location', 'Status', 'Condition', 'Health Score', 'Runtime Hours'];
    const rows = assets.map((a) => [
      `"${a.assetCode}"`,
      `"${a.name}"`,
      `"${a.category}"`,
      `"${a.location}"`,
      `"${a.operationalStatus}"`,
      `"${a.currentCondition}"`,
      a.healthScore || 0,
      a.runtimeHours || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fisheries_asset_registry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Asset registry CSV exported');
  };

  const columns = [
    {
      header: 'Asset Code',
      accessor: 'assetCode',
      render: (row) => (
        <span className="font-mono font-bold text-orange-800 bg-orange-50 px-2.5 py-1 rounded text-xs border border-orange-200">
          {row.assetCode}
        </span>
      ),
    },
    {
      header: 'Equipment Name & Site',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-bold text-stone-900">{row.name}</div>
          <div className="text-[11px] text-stone-500 flex items-center mt-0.5">
            <MapPin className="w-3 h-3 mr-1 text-stone-400" />
            {row.location}
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
          {row.category}
        </span>
      ),
    },
    {
      header: 'Operational Status',
      accessor: 'operationalStatus',
      render: (row) => <StatusBadge status={row.operationalStatus} />,
    },
    {
      header: 'Condition Score',
      accessor: 'healthScore',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <div className="w-20 bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
            <div
              className={`h-full rounded-full ${
                row.healthScore > 75
                  ? 'bg-emerald-500'
                  : row.healthScore > 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${row.healthScore}%` }}
            />
          </div>
          <span className="text-xs font-bold text-stone-800">{row.healthScore}%</span>
        </div>
      ),
    },
    {
      header: 'Runtime',
      accessor: 'runtimeHours',
      render: (row) => (
        <span className="text-xs text-stone-600 font-mono font-medium flex items-center">
          <Clock className="w-3 h-3 mr-1 text-stone-400" />
          {row.runtimeHours?.toLocaleString() || 0} hrs
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/assets/${row._id}`)}
            className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-orange-700 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded transition-colors"
            title="Inspect Asset Details"
          >
            Details
            <ExternalLink className="w-3 h-3 ml-1" />
          </button>
          {hasRole('Maintenance Admin') && (
            <button
              onClick={(e) => handleDeactivate(e, row._id, row.assetCode)}
              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
              title="Decommission Asset"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner text="Connecting to asset registry master records..." size="lg" />;
  }

  if (error) {
    return <ErrorState description={error} onRetry={loadAssets} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800">
              Master Equipment Catalog
            </span>
            <span className="text-xs text-stone-400">Total: {pagination.total || stats?.totalAssets || 0} Assets</span>
          </div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight mt-1">
            Aquaculture Asset Registry
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Centralized inventory register for all 8 aquaculture categories with lifecycle telemetry tracking
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              loadStats();
              loadAssets();
            }}
            className="p-2 text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-lg shadow-xs hover:bg-stone-50 transition-colors cursor-pointer"
            title="Refresh Assets"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Export Assets as CSV"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-stone-500" />
            Export CSV
          </button>

          {(hasRole('Maintenance Admin') || hasRole('Operations Manager')) && (
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm shadow-orange-500/20 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Register New Asset
            </button>
          )}
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
        <div className="border-r border-stone-100 pr-3">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Registered Assets</span>
          <div className="text-2xl font-black text-stone-900 mt-0.5">{stats?.totalAssets || 0}</div>
          <span className="text-[11px] text-stone-400">Across 8 categories</span>
        </div>
        <div className="border-r border-stone-100 pr-3 pl-2 sm:pl-3">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Active In Operation</span>
          <div className="text-2xl font-black text-emerald-600 mt-0.5">{stats?.healthyAssets || 0}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Nominal condition</span>
        </div>
        <div className="border-r border-stone-100 pr-3 pl-2 sm:pl-3">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Under Maintenance</span>
          <div className="text-2xl font-black text-orange-600 mt-0.5">{stats?.underMaintenance || 0}</div>
          <span className="text-[11px] text-stone-400">Scheduled/in progress</span>
        </div>
        <div className="pl-2 sm:pl-3">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Monitored Sites</span>
          <div className="text-2xl font-black text-stone-900 mt-0.5">5 Sites</div>
          <span className="text-[11px] text-stone-400">Coastal, hatchery & plant</span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-orange-600 text-white shadow-xs shadow-orange-500/20'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Multi-parameter Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            onClear={() => setSearch('')}
            placeholder="Search by asset code, name, model, serial..."
            className="max-w-md w-full"
          />

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 focus:bg-white focus:outline-hidden focus:border-orange-500 cursor-pointer"
            >
              <option value="">All Operational Statuses</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Idle">Idle</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>

            <select
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 focus:bg-white focus:outline-hidden focus:border-orange-500 cursor-pointer"
            >
              <option value="">All Conditions</option>
              <option value="Healthy">Healthy</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>

            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 focus:bg-white focus:outline-hidden focus:border-orange-500 cursor-pointer"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {(search || selectedCategory !== 'All' || status || condition || (locationFilter && locationFilter !== 'All Locations')) && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                  setStatus('');
                  setCondition('');
                  setLocationFilter('');
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 px-2 py-1.5 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Asset Data Table */}
      <DataTable
        columns={columns}
        data={assets}
        isLoading={tableLoading}
        onRowClick={(row) => navigate(`/assets/${row._id}`)}
        emptyMessage="No equipment records match your current filters. Try resetting search criteria."
      />

      {/* Pagination Controls */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Register Asset Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Aquaculture Asset"
        subtitle="Catalog equipment with condition baseline and maintenance schedules"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Asset Code"
              name="assetCode"
              required
              value={registerForm.assetCode}
              onChange={(e) => setRegisterForm({ ...registerForm, assetCode: e.target.value })}
              placeholder="e.g. AER-005, VES-003, PND-002"
            />
            <FormInput
              label="Asset Name"
              name="name"
              required
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              placeholder="e.g. South Pond Paddlewheel Aerator 5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
              <select
                value={registerForm.category}
                onChange={(e) => setRegisterForm({ ...registerForm, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Facility / Site Location</label>
              <select
                value={registerForm.location}
                onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
              >
                {LOCATIONS.filter((l) => l !== 'All Locations').map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Manufacturer"
              name="manufacturer"
              value={registerForm.manufacturer}
              onChange={(e) => setRegisterForm({ ...registerForm, manufacturer: e.target.value })}
              placeholder="e.g. MarineTech, AquaSafe"
            />
            <FormInput
              label="Model"
              name="model"
              value={registerForm.model}
              onChange={(e) => setRegisterForm({ ...registerForm, model: e.target.value })}
              placeholder="e.g. PW-2024-X"
            />
            <FormInput
              label="Maintenance Interval (Hrs)"
              name="maintenanceIntervalHours"
              type="number"
              value={registerForm.maintenanceIntervalHours}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, maintenanceIntervalHours: Number(e.target.value) })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Criticality</label>
              <select
                value={registerForm.criticality}
                onChange={(e) => setRegisterForm({ ...registerForm, criticality: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Initial Condition</label>
              <select
                value={registerForm.currentCondition}
                onChange={(e) => setRegisterForm({ ...registerForm, currentCondition: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
              >
                <option value="Healthy">Healthy</option>
                <option value="Warning">Warning</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Operational Status</label>
              <select
                value={registerForm.operationalStatus}
                onChange={(e) => setRegisterForm({ ...registerForm, operationalStatus: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900"
              >
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Idle">Idle</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={registerLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm shadow-orange-500/20 transition-colors flex items-center cursor-pointer disabled:opacity-50"
            >
              {registerLoading && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              )}
              Save Asset Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssetRegistryPage;
