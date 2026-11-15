import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  Calendar,
  ClipboardList,
  Sparkles,
  Wrench,
  TrendingUp,
  FileBarChart,
  Bell,
  Users,
  ShieldCheck,
  Fish,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, hasAnyRole } = useAuth();
  const { unreadCount } = useNotifications();

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
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container: Clean Crisp White with Orange Accents */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white text-stone-700 flex flex-col border-r border-stone-200 shadow-sm transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-stone-100 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/25">
              <Fish className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-black text-stone-900 tracking-tight leading-none block">
                AquaReliability
              </span>
              <span className="text-[10px] text-orange-600 font-bold tracking-wider uppercase block mt-0.5">
                Fisheries Suite
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Scope Banner */}
        <div className="px-5 py-3 border-b border-stone-100 bg-orange-50/40 text-xs">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Active Profile</p>
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold text-stone-900 truncate">{user?.name || 'Guest User'}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200 font-bold">
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
                <p className="px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
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
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                            : 'text-stone-600 hover:text-orange-600 hover:bg-orange-50/60'
                        }`
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge ? (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-stone-900">
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* System Version Footer */}
        <div className="p-3 border-t border-stone-100 bg-stone-50/50 text-[11px] text-stone-400 flex items-center justify-between">
          <span className="font-medium">Reliability Core v2.4</span>
          <span className="inline-flex items-center font-bold text-orange-600">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse mr-1.5"></span>
            Telemetry Live
          </span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
