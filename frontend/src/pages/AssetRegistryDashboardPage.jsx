import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  HeartPulse,
  AlertTriangle,
  Flame,
  Wrench,
  ClockAlert,
  ClipboardList,
  Sparkles,
  Plus,
  RefreshCw,
  ExternalLink,
  Filter,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { DashboardCard, ChartCard } from '../components/DashboardCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { SearchBar, FilterPanel, Pagination } from '../components/FilterPanel';
import { Modal } from '../components/Modal';
import { FormInput } from '../components/FormInput';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { getAssetStats, getAssets, createAsset, deleteAsset } from '../services/assetService';

export const AssetRegistryDashboardPage = () => {
  const { hasRole, user } = useAuth();
  const navigate = useNavigate();

  // State
  const [stats, setStats] = useState(null);
  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
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

  // Load KPI Stats
  const loadStats = async () => {
    try {
      const data = await getAssetStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load asset stats:', err);
      setError('Could not connect to backend asset metrics service.');
    }
  };

  // Load Filtered Assets
  const loadAssets = useCallback(async () => {
    try {
      setTableLoading(true);
      const data = await getAssets({
        page: currentPage,
        limit: 10,
        search,
        category,
        condition,
        status,
        location: locationFilter,
      });
      setAssets(data.assets || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to load assets table:', err);
    } finally {
      setTableLoading(false);
    }
  }, [currentPage, search, category, condition, status, locationFilter]);

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
      alert(err.response?.data?.message || 'Failed to create asset');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleDeactivate = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to deactivate / decommission this asset?')) return;
    try {
      await deleteAsset(id);
      await Promise.all([loadStats(), loadAssets()]);
    } catch (err) {
      alert('Failed to decommission asset');
    }
  };

  // Recharts color palettes
  const HEALTH_COLORS = {
    Healthy: '#10B981',
    Warning: '#F59E0B',
    Critical: '#EF4444',
  };

  const healthPieData = stats
    ? [
        { name: 'Healthy', value: stats.healthyAssets, color: HEALTH_COLORS.Healthy },
        { name: 'Warning', value: stats.warningAssets, color: HEALTH_COLORS.Warning },
        { name: 'Critical', value: stats.criticalAssets, color: HEALTH_COLORS.Critical },
      ]
    : [];

  const columns = [
    {
      header: 'Asset Code',
      accessor: 'assetCode',
      render: (row) => (
        <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-xs">
          {row.assetCode}
        </span>
      ),
    },
    {
      header: 'Asset Name & Details',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.name}</div>
          <div className="text-[11px] text-slate-500">{row.location}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => (
        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
          {row.category}
        </span>
      ),
    },
    {
      header: 'Condition',
      accessor: 'currentCondition',
      render: (row) => <StatusBadge status={row.currentCondition} />,
    },
    {
      header: 'Health Score',
      accessor: 'healthScore',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
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
          <span className="text-xs font-bold text-slate-700">{row.healthScore}%</span>
        </div>
      ),
    },
    {
      header: 'Operating Status',
      accessor: 'operationalStatus',
      render: (row) => <StatusBadge status={row.operationalStatus} />,
    },
    {
      header: 'Runtime (Hrs)',
      accessor: 'runtimeHours',
      render: (row) => (
        <span className="text-xs text-slate-600 font-mono font-medium">
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
            className="p-1.5 text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded transition-colors"
            title="Inspect Asset"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          {hasRole('Maintenance Admin') && (
            <button
              onClick={(e) => handleDeactivate(e, row._id)}
              className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded transition-colors"
            >
              Decommission
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner text="Connecting to asset telemetry streams..." size="lg" />;
  }

  if (error) {
    return <ErrorState description={error} onRetry={loadStats} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Asset Health & Operational Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fleet, offshore cage, and facility reliability telemetry overview
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              loadStats();
              loadAssets();
            }}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-xs hover:bg-slate-50 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {hasRole('Maintenance Admin') && (
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Register New Asset
            </button>
          )}
        </div>
      </div>

      {/* 8 Required KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <DashboardCard
          title="Total Assets"
          value={stats?.totalAssets || 0}
          subtitle="Monitored in system"
          icon={Boxes}
          accentColor="slate"
        />
        <DashboardCard
          title="Healthy Assets"
          value={stats?.healthyAssets || 0}
          subtitle="Nominal telemetry"
          icon={HeartPulse}
          accentColor="emerald"
        />
        <DashboardCard
          title="Warning Assets"
          value={stats?.warningAssets || 0}
          subtitle="Telemetry alerts"
          icon={AlertTriangle}
          accentColor="amber"
        />
        <DashboardCard
          title="Critical Assets"
          value={stats?.criticalAssets || 0}
          subtitle="Immediate action req."
          icon={Flame}
          accentColor="rose"
        />
        <DashboardCard
          title="Under Maintenance"
          value={stats?.underMaintenance || 0}
          subtitle="Active technician orders"
          icon={Wrench}
          accentColor="sky"
        />
        <DashboardCard
          title="Overdue Maintenance"
          value={stats?.overdueMaintenance || 0}
          subtitle="Past scheduled cycle"
          icon={ClockAlert}
          accentColor="amber"
        />
        <DashboardCard
          title="Open Work Orders"
          value={stats?.openWorkOrders || 0}
          subtitle="In maintenance pipeline"
          icon={ClipboardList}
          accentColor="teal"
        />
        <DashboardCard
          title="Predicted Failures"
          value={stats?.predictedFailures || 0}
          subtitle="AI & Heuristic flags"
          icon={Sparkles}
          accentColor="rose"
        />
      </div>

      {/* Charts Section: Health Distribution & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Asset Health Distribution"
          subtitle="Real-time condition breakdown based on telemetry thresholds"
          className="lg:col-span-1"
        >
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {healthPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} Assets`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Assets by Category"
          subtitle="Coverage across all 8 industrial aquaculture asset domains"
          className="lg:col-span-2"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.categoryDistribution || []}
                margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
              >
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} name="Asset Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Asset Registry Table with Searching, Filtering, Pagination */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            onClear={() => setSearch('')}
            placeholder="Search by code, equipment name, site..."
            className="max-w-md w-full"
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /> Filter:
            </span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="">All 8 Categories</option>
              <option value="Ponds">Ponds</option>
              <option value="Cages">Cages</option>
              <option value="Vessels">Vessels</option>
              <option value="Aerators">Aerators</option>
              <option value="Nets">Nets</option>
              <option value="Ice Plants">Ice Plants</option>
              <option value="Cold Rooms">Cold Rooms</option>
              <option value="Processing Equipment">Processing Equipment</option>
            </select>

            <select
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="">All Conditions</option>
              <option value="Healthy">Healthy</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={assets}
          loading={tableLoading}
          onRowClick={(row) => navigate(`/assets/${row._id}`)}
          emptyTitle="No assets matching filter"
          emptyDescription="Try clearing search filters or registering a new asset to your fleet."
        />

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Register Asset Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register Industrial Asset"
        subtitle="Catalog aquaculture machinery, floating structures, or processing lines"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Asset Code"
              name="assetCode"
              required
              placeholder="e.g. AER-005, VES-003"
              value={registerForm.assetCode}
              onChange={(e) => setRegisterForm({ ...registerForm, assetCode: e.target.value })}
            />
            <FormInput
              label="Equipment Name"
              name="name"
              required
              placeholder="e.g. Surface Paddlewheel 15kW"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Asset Category (8 Target Classes)"
              name="category"
              type="select"
              required
              value={registerForm.category}
              onChange={(e) => setRegisterForm({ ...registerForm, category: e.target.value })}
              options={[
                { value: 'Ponds', label: 'Ponds' },
                { value: 'Cages', label: 'Cages' },
                { value: 'Vessels', label: 'Vessels' },
                { value: 'Aerators', label: 'Aerators' },
                { value: 'Nets', label: 'Nets' },
                { value: 'Ice Plants', label: 'Ice Plants' },
                { value: 'Cold Rooms', label: 'Cold Rooms' },
                { value: 'Processing Equipment', label: 'Processing Equipment' },
              ]}
            />
            <FormInput
              label="Operational Subcategory"
              name="subCategory"
              placeholder="e.g. Dual Impeller, Ammonia Chiller"
              value={registerForm.subCategory}
              onChange={(e) => setRegisterForm({ ...registerForm, subCategory: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Location / Facility"
              name="location"
              required
              placeholder="e.g. South Bay Coastal Farm - Sector 4"
              value={registerForm.location}
              onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
            />
            <FormInput
              label="Criticality Rating"
              name="criticality"
              type="select"
              value={registerForm.criticality}
              onChange={(e) => setRegisterForm({ ...registerForm, criticality: e.target.value })}
              options={[
                { value: 'Low', label: 'Low (Redundant)' },
                { value: 'Medium', label: 'Medium (Standard)' },
                { value: 'High', label: 'High (Production Impact)' },
                { value: 'Mission-Critical', label: 'Mission-Critical (Catastrophic Loss)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Manufacturer"
              name="manufacturer"
              value={registerForm.manufacturer}
              onChange={(e) => setRegisterForm({ ...registerForm, manufacturer: e.target.value })}
            />
            <FormInput
              label="Service Interval (Hours)"
              name="maintenanceIntervalHours"
              type="number"
              value={registerForm.maintenanceIntervalHours}
              onChange={(e) => setRegisterForm({ ...registerForm, maintenanceIntervalHours: Number(e.target.value) })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={registerLoading}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
            >
              {registerLoading ? 'Saving...' : 'Register Asset'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssetRegistryDashboardPage;
