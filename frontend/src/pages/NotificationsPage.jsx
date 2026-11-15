import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Wrench,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { useNotifications } from '../context/NotificationContext';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications, loading } = useNotifications();
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.isRead;
    if (filterType === 'URGENT') return n.severity === 'urgent';
    if (filterType === 'ALERT') return n.type === 'ALERT';
    if (filterType === 'MAINTENANCE') return n.type === 'MAINTENANCE';
    if (filterType === 'AI_PREDICTION') return n.type === 'AI_PREDICTION';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Operational Notifications & Alerts
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry threshold triggers, work order assignments, and predictive alarms
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
        {['ALL', 'UNREAD', 'URGENT', 'ALERT', 'MAINTENANCE', 'AI_PREDICTION'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === type
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <LoadingSpinner text="Checking live notification stream..." />
      ) : filteredNotifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No notifications in this view</h3>
          <p className="text-xs text-slate-500 mt-1">All systems and telemetry parameters operating normally.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredNotifications.map((notif) => {
            const isUrgent = notif.severity === 'urgent';
            return (
              <div
                key={notif._id}
                onClick={() => markAsRead(notif._id)}
                className={`p-4 transition-colors flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 ${
                  !notif.isRead ? 'bg-orange-50/20' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      isUrgent
                        ? 'bg-rose-100 text-rose-600'
                        : notif.type === 'AI_PREDICTION'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isUrgent ? (
                      <Flame className="w-4 h-4" />
                    ) : notif.type === 'AI_PREDICTION' ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                      )}
                      <StatusBadge status={notif.type} />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {notif.relatedEntityType === 'Asset' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/assets/${notif.relatedEntityId}`);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-md border border-orange-200"
                    >
                      Inspect Asset
                    </button>
                  )}
                  {notif.relatedEntityType === 'WorkOrder' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/planning`);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-md border border-orange-200"
                    >
                      Open Work Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
