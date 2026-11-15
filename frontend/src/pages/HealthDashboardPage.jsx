import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  ExternalLink,
  ArrowRight,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
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
import { StatusBadge } from '../components/StatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { getAssetStats, getAssets } from '../services/assetService';
import { runPredictionEvaluation } from '../services/predictionService';
import toast from 'react-hot-toast';

export const HealthDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [atRiskAssets, setAtRiskAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setError(null);
      const [statsData, assetsData] = await Promise.all([
        getAssetStats(),
        getAssets({ limit: 100 }), // retrieve assets to identify at-risk items
      ]);

      setStats(statsData);

      // Filter assets needing attention (Warning, Critical, or healthScore < 75)
      const allAssets = assetsData?.assets || [];
      const criticalOrWarning = allAssets
        .filter((a) => a.currentCondition === 'Critical' || a.currentCondition === 'Warning' || (a.healthScore && a.healthScore < 75))
        .sort((a, b) => (a.healthScore || 100) - (b.healthScore || 100));

      setAtRiskAssets(criticalOrWarning);
    } catch (err) {
      console.error('Failed to load health dashboard data:', err);
      setError('Could not connect to fleet health metrics service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRunEvaluation = async () => {
    try {
      setEvaluating(true);
      await runPredictionEvaluation();
      toast.success('Fleet condition evaluation complete: AI health indices recalculated');
      await loadDashboardData();
    } catch (err) {
      toast.error('Evaluation failed. Check backend telemetry service.');
    } finally {
      setEvaluating(false);
    }
  };

  const HEALTH_COLORS = {
    Healthy: '#10B981',
    Warning: '#F59E0B',
    Critical: '#EF4444',
  };

  const healthPieData = stats
    ? [
        { name: 'Healthy', value: stats.healthyAssets || 0, color: HEALTH_COLORS.Healthy },
        { name: 'Warning', value: stats.warningAssets || 0, color: HEALTH_COLORS.Warning },
        { name: 'Critical', value: stats.criticalAssets || 0, color: HEALTH_COLORS.Critical },
      ]
    : [];

  const totalAssets = stats?.totalAssets || 0;
  const healthyCount = stats?.healthyAssets || 0;
  const fleetHealthIndex = totalAssets > 0 ? Math.round((healthyCount / totalAssets) * 100) : 0;

  if (loading) {
    return <LoadingSpinner text="Gathering fleet telemetry and health indices..." size="lg" />;
  }

  if (error) {
    return <ErrorState description={error} onRetry={loadDashboardData} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800">
              Fleet Health Live
            </span>
            <span className="text-xs text-stone-400">All 8 Aquaculture Domains</span>
          </div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight mt-1">
            Asset Health & Reliability Dashboard
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time condition monitoring, telemetry health bands, and proactive degradation alerts
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadDashboardData}
            className="p-2 text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-lg shadow-xs hover:bg-stone-50 transition-colors cursor-pointer"
            title="Refresh Fleet Health"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-sm shadow-orange-500/20 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {evaluating ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            )}
            Run Health Diagnostics
          </button>
        </div>
      </div>

      {/* Clean Baseline Welcome Banner when 0 Assets */}
      {totalAssets === 0 && (
        <div className="p-6 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-orange-950">Clean Slate Ready for Your Custom Problem</h3>
            <p className="text-xs text-orange-800 mt-1 max-w-xl">
              All dummy assets and demo records have been cleared. You can now simulate a problem from scratch: start by registering an asset (as Admin/Manager), log a sensor reading, generate an AI prediction, and trace the workflow through all 4 roles.
            </p>
          </div>
          <button
            onClick={() => navigate('/assets')}
            className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-xs whitespace-nowrap cursor-pointer transition-colors"
          >
            Register Your Asset &rarr;
          </button>
        </div>
      )}

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <DashboardCard
          title="Fleet Health Index"
          value={`${fleetHealthIndex}%`}
          subtitle="Nominal operational fleet"
          icon={HeartPulse}
          accentColor="emerald"
        />
        <DashboardCard
          title="Critical Assets"
          value={stats?.criticalAssets || 0}
          subtitle="Immediate overhaul needed"
          icon={Flame}
          accentColor="rose"
        />
        <DashboardCard
          title="Warning Degradation"
          value={stats?.warningAssets || 0}
          subtitle="Elevated temp/vibration"
          icon={AlertTriangle}
          accentColor="amber"
        />
        <DashboardCard
          title="Open Work Orders"
          value={stats?.openWorkOrders || 0}
          subtitle="In maintenance pipeline"
          icon={ClipboardList}
          accentColor="orange"
        />
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <DashboardCard
          title="Total Monitored"
          value={stats?.totalAssets || 0}
          subtitle="Assets in registry"
          icon={Boxes}
          accentColor="slate"
        />
        <DashboardCard
          title="Healthy Equipment"
          value={stats?.healthyAssets || 0}
          subtitle="Within nominal bands"
          icon={ShieldCheck}
          accentColor="emerald"
        />
        <DashboardCard
          title="Under Maintenance"
          value={stats?.underMaintenance || 0}
          subtitle="Active technician orders"
          icon={Wrench}
          accentColor="orange"
        />
        <DashboardCard
          title="Predicted Failures"
          value={stats?.predictedFailures || 0}
          subtitle="High/Critical AI flags"
          icon={Sparkles}
          accentColor="rose"
        />
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Fleet Condition Distribution"
          subtitle="Real-time condition breakdown based on telemetry thresholds"
          className="lg:col-span-1"
        >
          <div className="h-64 flex items-center justify-center">
            {totalAssets === 0 ? (
              <div className="text-center p-6">
                <HeartPulse className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-stone-500">No condition data yet</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Register an asset to monitor health bands</p>
              </div>
            ) : (
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
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e7e5e4',
                      borderRadius: '8px',
                      color: '#1c1917',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Asset Density by Aquaculture Category"
          subtitle="Coverage across all 8 industrial aquaculture equipment domains"
          className="lg:col-span-2"
        >
          <div className="h-64 flex items-center justify-center">
            {totalAssets === 0 ? (
              <div className="text-center p-6">
                <Boxes className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-stone-500">No categories to display</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Assets will automatically plot here by category</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.categoryDistribution || []}
                  margin={{ top: 10, right: 20, left: -10, bottom: 25 }}
                >
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11, fill: '#78716c' }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#78716c' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e7e5e4',
                      borderRadius: '8px',
                      color: '#1c1917',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="count" fill="#ea580c" radius={[4, 4, 0, 0]} name="Asset Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Degraded & High-Risk Assets Watchlist */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Degraded & High-Risk Assets Watchlist
              </h3>
              <p className="text-xs text-stone-500">
                Equipment requiring immediate technician attention or scheduled inspection
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full self-start sm:self-auto">
            {atRiskAssets.length} Assets Flagged
          </span>
        </div>

        {atRiskAssets.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-stone-800">All Systems Nominal</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              No assets currently have warning or critical health score flags. All monitored telemetry values are within operating thresholds.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200 text-xs">
              <thead className="bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3 text-left">Asset Code</th>
                  <th className="px-4 py-3 text-left">Name & Location</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Condition</th>
                  <th className="px-4 py-3 text-left">Health Index</th>
                  <th className="px-4 py-3 text-left">Operating Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {atRiskAssets.slice(0, 6).map((asset) => (
                  <tr key={asset._id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-orange-700">
                      {asset.assetCode}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-900">{asset.name}</div>
                      <div className="text-[11px] text-stone-400">{asset.location}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700">
                        {asset.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={asset.currentCondition} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-stone-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              asset.healthScore > 75
                                ? 'bg-emerald-500'
                                : asset.healthScore > 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${asset.healthScore}%` }}
                          />
                        </div>
                        <span className="font-bold text-stone-800">{asset.healthScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={asset.operationalStatus} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/assets/${asset._id}`)}
                        className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded transition-colors"
                      >
                        Inspect Telemetry
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Launchpad to Other Workflows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/assets')}
          className="p-5 bg-white rounded-xl border border-stone-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Boxes className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-orange-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-stone-900 group-hover:text-orange-600 transition-colors">
            Asset Inventory Registry
          </h4>
          <p className="text-xs text-stone-500 mt-1">
            Browse complete catalog, register new assets, manage specifications and maintenance intervals.
          </p>
        </div>

        <div
          onClick={() => navigate('/planning')}
          className="p-5 bg-white rounded-xl border border-stone-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <ClipboardList className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-orange-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-stone-900 group-hover:text-orange-600 transition-colors">
            Maintenance Planning Board
          </h4>
          <p className="text-xs text-stone-500 mt-1">
            8-column Kanban lifecycle with technician assignment and authorized closure signoffs.
          </p>
        </div>

        <div
          onClick={() => navigate('/predictions')}
          className="p-5 bg-white rounded-xl border border-stone-200 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-orange-600 transition-colors" />
          </div>
          <h4 className="text-sm font-bold text-stone-900 group-hover:text-orange-600 transition-colors">
            AI Failure Risk & RUL
          </h4>
          <p className="text-xs text-stone-500 mt-1">
            Predictive condition modeling, Remaining Useful Life calculations, and sensor health flags.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboardPage;
