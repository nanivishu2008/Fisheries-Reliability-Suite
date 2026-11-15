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
    <div className="min-h-screen bg-[#fafaf9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e7e5e4_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none" />

      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <Fish className="w-7 h-7 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">AquaReliability</h1>
            <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">
              Fisheries Maintenance Suite
            </p>
          </div>
        </div>
        <h2 className="mt-6 text-center text-xl font-bold text-stone-800">
          Industrial Reliability & Asset Portal
        </h2>
        <p className="mt-1 text-center text-xs text-stone-500">
          Predictive maintenance and lifecycle control for aquaculture enterprises
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-stone-200">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700">
                Corporate Email Address
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@fisheries.org"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs text-stone-900 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 placeholder-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">Password</label>
              <div className="mt-1.5 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter authorized password"
                  className="w-full pl-9 pr-10 py-2.5 text-xs text-stone-900 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 placeholder-stone-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-stone-300 text-orange-600 focus:ring-orange-500"
                />
                <span>Remember credentials</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="font-medium text-orange-600 hover:text-orange-700"
              >
                Forgot password?
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg shadow-md shadow-orange-500/20 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <ShieldCheck className="w-4 h-4 mr-2" />
                )}
                Authorize Access
              </button>
            </div>
          </form>

          {/* Quick Demo Role Selector */}
          <div className="mt-8 pt-6 border-t border-stone-100">
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider text-center mb-3">
              One-Click Role Switcher (Seeded Demo)
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => quickFill('admin@fisheries.org', 'AdminPass123!')}
                className="p-2.5 bg-stone-50 hover:bg-orange-50 text-stone-800 rounded-lg text-left border border-stone-200 hover:border-orange-300 transition-colors"
              >
                <div className="font-bold text-orange-700">Maintenance Admin (Vishal)</div>
                <div className="text-[10px] text-stone-500">admin@fisheries.org</div>
              </button>
              <button
                type="button"
                onClick={() => quickFill('manager@fisheries.org', 'ManagerPass123!')}
                className="p-2.5 bg-stone-50 hover:bg-orange-50 text-stone-800 rounded-lg text-left border border-stone-200 hover:border-orange-300 transition-colors"
              >
                <div className="font-bold text-stone-800">Operations Manager (Arjun)</div>
                <div className="text-[10px] text-stone-500">manager@fisheries.org</div>
              </button>
              <button
                type="button"
                onClick={() => quickFill('tech@fisheries.org', 'TechPass123!')}
                className="p-2.5 bg-stone-50 hover:bg-orange-50 text-stone-800 rounded-lg text-left border border-stone-200 hover:border-orange-300 transition-colors"
              >
                <div className="font-bold text-emerald-700">Technician (Raj)</div>
                <div className="text-[10px] text-stone-500">tech@fisheries.org</div>
              </button>
              <button
                type="button"
                onClick={() => quickFill('vendor@marineparts.com', 'VendorPass123!')}
                className="p-2.5 bg-stone-50 hover:bg-orange-50 text-stone-800 rounded-lg text-left border border-stone-200 hover:border-orange-300 transition-colors"
              >
                <div className="font-bold text-amber-700">Vendor (Ram)</div>
                <div className="text-[10px] text-stone-500">vendor@marineparts.com</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 border border-stone-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-stone-900">Reset Account Password</h3>
            <p className="text-xs text-stone-500">
              Provide your corporate email. If it is recognized by the credential directory, you will receive password recovery instructions.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-800 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
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
                  className="w-full px-3.5 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModalOpen(false);
                      setForgotSuccess('');
                    }}
                    className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
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
                  className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
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
