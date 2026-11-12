import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Fish, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(localStorage.getItem('remembered_email') || 'admin@fisheries.org');
  const [password, setPassword] = useState('AdminPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both registered email and password.');
      return;
    }

    try {
      setLoading(true);
      const loggedInUser = await login(email, password, rememberMe);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 'Authentication failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      setForgotLoading(true);
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotSuccess('If your email is registered, recovery instructions have been dispatched.');
    } catch (err) {
      setForgotSuccess('If your email is registered, recovery instructions have been dispatched.');
    } finally {
      setForgotLoading(false);
    }
  };

  const quickFill = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#070b1a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-400 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <Fish className="w-7 h-7 text-slate-950" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black text-white tracking-tight">AquaReliability</h1>
            <p className="text-xs font-semibold text-teal-400 uppercase tracking-widest">
              Fisheries Maintenance Suite
            </p>
          </div>
        </div>
        <h2 className="mt-6 text-center text-xl font-bold text-slate-200">
          Industrial Reliability & Asset Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Predictive maintenance and lifecycle control for aquaculture enterprises
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-[#0f172a] py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start space-x-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                Corporate Email Address
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@fisheries.org"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs text-white bg-slate-900 border border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter authorized password"
                  className="w-full pl-9 pr-10 py-2.5 text-xs text-white bg-slate-900 border border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 text-teal-600 focus:ring-teal-500 bg-slate-900"
                />
                <span>Remember credentials</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="font-medium text-teal-400 hover:text-teal-300"
              >
                Forgot password?
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-sky-400 hover:from-teal-300 hover:to-sky-300 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <ShieldCheck className="w-4 h-4 mr-2" />
                )}
                Authorize Access
              </button>
            </div>
          </form>

          {/* Quick Demo Role Selector */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              One-Click Role Switcher (Seeded Demo)
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => quickFill('admin@fisheries.org', 'AdminPass123!')}
                className="p-2 bg-slate-800/80 hover:bg-slate-700/80 text-teal-300 rounded-lg text-left border border-slate-700 transition-colors"
              >
                <div className="font-bold">Maintenance Admin</div>
                <div className="text-[10px] text-slate-400">admin@fisheries.org</div>
              </button>
              <button
                type="button"
                onClick={() => quickFill('manager@fisheries.org', 'ManagerPass123!')}
                className="p-2 bg-slate-800/80 hover:bg-slate-700/80 text-sky-300 rounded-lg text-left border border-slate-700 transition-colors"
              >
                <div className="font-bold">Operations Manager</div>
                <div className="text-[10px] text-slate-400">manager@fisheries.org</div>
              </button>
              <button
                type="button"
                onClick={() => quickFill('tech@fisheries.org', 'TechPass123!')}
                className="p-2 bg-slate-800/80 hover:bg-slate-700/80 text-emerald-300 rounded-lg text-left border border-slate-700 transition-colors"
              >
                <div className="font-bold">Technician</div>
                <div className="text-[10px] text-slate-400">tech@fisheries.org</div>
              </button>
              <button
                type="button"
                onClick={() => quickFill('vendor@marineparts.com', 'VendorPass123!')}
                className="p-2 bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 rounded-lg text-left border border-slate-700 transition-colors"
              >
                <div className="font-bold">Vendor</div>
                <div className="text-[10px] text-slate-400">vendor@marineparts.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0f172a] rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Reset Account Password</h3>
            <p className="text-xs text-slate-400">
              Provide your corporate email. If it is recognized by the credential directory, you will receive password recovery instructions.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-xs text-teal-300 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>{forgotSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="name@fisheries.org"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs text-white bg-slate-900 border border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/40"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModalOpen(false);
                      setForgotSuccess('');
                    }}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg"
                  >
                    {forgotLoading ? 'Dispatching...' : 'Dispatch Instructions'}
                  </button>
                </div>
              </form>
            )}
            {forgotSuccess && (
              <div className="text-right">
                <button
                  onClick={() => {
                    setForgotModalOpen(false);
                    setForgotSuccess('');
                  }}
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-teal-400 rounded-lg"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
