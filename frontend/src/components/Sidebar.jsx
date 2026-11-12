import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Activity,
  Calendar,
  ClipboardList,
  Sparkles,
  Wrench,
  TrendingUp,
  FileBarChart,
  Bell,
  Users,
  ShieldCheck,
  Settings,
  Fish,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, hasRole, hasAnyRole } = useAuth();
  const { unreadCount } = useNotifications();

  // Navigation menu grouped logically
  const navigationItems = [
    {
      group: 'Asset Operations',
      items: [
        {
          name: 'Health Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          roles: ['Maintenance Admin', 'Operations Manager', 'Technician', 'Vendor'],
        },
        {
          name: 'Asset Registry',
          path: '/assets',
          icon: Boxes,
          roles: ['Maintenance Admin', 'Operations Manager', 'Technician', 'Vendor'],
        },
      ],
    },
    {
      group: 'Maintenance & Workflows',
      items: [
        {
          name: 'Maintenance Calendar',
          path: '/calendar',
          icon: Calendar,
          roles: ['Maintenance Admin', 'Operations Manager', 'Technician'],
        },
        {
          name: 'Work Orders & Planning',
          path: '/planning',
          icon: ClipboardList,
          roles: ['Maintenance Admin', 'Operations Manager', 'Technician', 'Vendor'],
        },
      ],
    },
    {
      group: 'Predictive Reliability & AI',
      items: [
        {
          name: 'AI Failure Predictions',
          path: '/predictions',
          icon: Sparkles,
          roles: ['Maintenance Admin', 'Operations Manager', 'Technician'],
        },
        {
          name: 'AI Recommendations',
          path: '/recommendations',
          icon: Wrench,
          roles: ['Maintenance Admin', 'Operations Manager'],
        },
        {
          name: 'Reliability Analytics',
          path: '/reliability',
          icon: TrendingUp,
          roles: ['Maintenance Admin', 'Operations Manager'],
        },
        {
          name: 'Reports & Audits',
          path: '/reports',
          icon: FileBarChart,
          roles: ['Maintenance Admin', 'Operations Manager'],
        },
      ],
    },
    {
      group: 'System & Governance',
      items: [
        {
          name: 'Notifications',
          path: '/notifications',
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : null,
          roles: ['Maintenance Admin', 'Operations Manager', 'Technician', 'Vendor'],
        },
        {
          name: 'User Management',
          path: '/users',
          icon: Users,
          roles: ['Maintenance Admin'],
        },
        {
          name: 'Audit Logs & Settings',
          path: '/settings',
          icon: ShieldCheck,
          roles: ['Maintenance Admin'],
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0a1128] text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800 bg-[#070b1a]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20">
              <Fish className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight leading-none block">
                AquaReliability
              </span>
              <span className="text-[10px] text-teal-400 font-medium tracking-wider uppercase block mt-0.5">
                Fisheries Suite
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Scope Banner */}
        <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-900/40 text-xs">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Active Profile</p>
          <div className="flex items-center justify-between mt-1">
            <span className="font-semibold text-slate-200 truncate">{user?.name || 'Guest User'}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 font-bold">
              {user?.role || 'User'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {navigationItems.map((group, groupIdx) => {
            const filteredItems = group.items.filter((item) =>
              item.roles ? hasAnyRole(item.roles) : true
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {group.group}
                </p>
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-teal-500/15 text-teal-300 font-semibold border-l-2 border-teal-400'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                        }`
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge ? (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-teal-500 text-slate-950">
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* System Version Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#070b1a] text-[11px] text-slate-400 flex items-center justify-between">
          <span>Reliability Core v2.4</span>
          <span className="inline-flex items-center text-teal-400">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse mr-1.5"></span>
            Telemetry Live
          </span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
