import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { NotificationPanel } from './FileUpload';

export const Navbar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileMenuRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotificationPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/assets?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Human-readable breadcrumb computation
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentTitle =
    pathSegments.length === 0
      ? 'Overview'
      : pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1).replace('-', ' ');

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-xs border-b border-stone-200 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Context */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-stone-600 hover:text-stone-900 rounded-lg lg:hidden hover:bg-stone-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center space-x-2 text-xs text-stone-400">
            <span>Fisheries Suite</span>
            <span>/</span>
            <span className="font-semibold text-stone-700 capitalize">{currentTitle}</span>
          </div>
          <h1 className="text-base font-bold text-stone-900 tracking-tight capitalize leading-tight">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Center: Global Search */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center max-w-sm w-full mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets, telemetry, work orders..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
          />
        </div>
      </form>

      {/* Right: Notification Tray & User Profile */}
      <div className="flex items-center space-x-3">
        {/* Notifications Icon */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            className="relative p-2 text-stone-500 hover:text-stone-800 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationPanel
            isOpen={showNotificationPanel}
            onClose={() => setShowNotificationPanel(false)}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onViewAll={() => {
              setShowNotificationPanel(false);
              navigate('/notifications');
            }}
          />
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-300 text-orange-800 flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {user?.name ? user.name.slice(0, 2) : 'US'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-stone-800 truncate max-w-[120px]">
                {user?.name || 'Authorized User'}
              </span>
              <span className="block text-[10px] text-orange-600 font-semibold capitalize">{user?.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in duration-100 text-xs">
              <div className="px-4 py-2 border-b border-stone-100">
                <p className="font-semibold text-stone-800 truncate">{user?.name}</p>
                <p className="text-stone-500 truncate">{user?.email}</p>
                <div className="mt-1 flex items-center text-[10px] text-orange-700 font-semibold">
                  <Shield className="w-3 h-3 mr-1" />
                  <span>{user?.role}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/assets');
                  }}
                  className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assigned Facilities</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account & System Settings</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
