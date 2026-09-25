import React from 'react';
import { X, Bell, Calendar, Activity, Package, Check, Trash2, ExternalLink } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNotificationClick: (notif: NotificationItem) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-sky-600" />;
      case 'assessment':
        return <Activity className="w-4 h-4 text-teal-600" />;
      case 'order':
        return <Package className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Health Alerts & Notices</h3>
                <p className="text-xs text-slate-500">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action strip */}
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={onMarkAllAsRead}
              disabled={unreadCount === 0}
              className={`inline-flex items-center gap-1 font-medium transition-colors ${
                unreadCount > 0 ? 'text-teal-700 hover:text-teal-900 cursor-pointer' : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClearAll}
              disabled={notifications.length === 0}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-medium cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear list</span>
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Bell className="w-10 h-10 text-slate-200 mx-auto mb-2 stroke-[1.5]" />
                <p className="text-sm font-semibold text-slate-700">No active notifications</p>
                <p className="text-xs text-slate-400 mt-1">
                  Alerts regarding appointments, AI risk evaluations, and order dispatches will appear here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNotificationClick(item)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all ${
                    item.read
                      ? 'bg-white hover:bg-slate-50'
                      : 'bg-teal-50/40 hover:bg-teal-50/80 border-l-2 border-teal-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-2xs shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                        <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                      {item.linkTab && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900">
                          <span>View in {item.linkTab}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
