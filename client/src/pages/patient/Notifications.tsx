import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { notificationService } from "../../services/notificationService";
import { NotificationItem } from "../../types";
import { useToast } from "../../context/ToastContext";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Check,
  ChevronRight,
} from "lucide-react";

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const loadNotifications = () => {
    setLoading(true);
    notificationService
      .getNotifications()
      .then((res) => {
        if (res.success) {
          setNotifications(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAsRead("all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast("All notifications marked as read.", "success");
    } catch (err) {
      showToast("Failed to mark notifications.", "error");
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {}
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-clinical-border rounded-xl p-6 shadow-clinical flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-clinical-blue uppercase tracking-wider">
            Patient Communication
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Clinical Notifications Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Updates regarding triage analyses, physician notes, and recommended follow-ups.
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-white border border-clinical-border rounded-xl shadow-clinical divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No notifications</p>
            <p className="text-xs text-slate-400 mt-1">
              You are caught up with all clinical alerts.
            </p>
          </div>
        ) : (
          notifications.map((item) => {
            const icons = {
              urgent: <AlertOctagon className="w-5 h-5 text-rose-600 flex-shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
              success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
              info: <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />,
            };

            return (
              <div
                key={item._id}
                onClick={() => !item.read && handleMarkSingleRead(item._id)}
                className={`p-4 transition-colors flex items-start justify-between gap-4 ${
                  item.read ? "bg-white" : "bg-sky-50/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{icons[item.type] || icons.info}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {item.title}
                      </span>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-clinical-blue" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {item.link && (
                  <Link
                    to={item.link}
                    className="inline-flex items-center gap-1 text-xs font-bold text-clinical-blue hover:text-clinical-dark flex-shrink-0 self-center"
                  >
                    <span>View Result</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
