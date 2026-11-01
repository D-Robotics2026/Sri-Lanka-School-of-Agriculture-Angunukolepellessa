import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Bell, CheckCheck, Clock, AlertTriangle, Book, Calendar, Utensils, Award } from 'lucide-react';
import { NotificationType } from '../../types';
import { formatDate } from '../../utils/dateUtils';

export const NotificationBell: React.FC = () => {
  const { currentUser } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, students } = useData();
  const [isOpen, setIsOpen] = useState(false);

  // Determine current student's index number if applicable
  const currentStudentIndex = useMemo(() => {
    if (!currentUser || currentUser.role !== 'student') return null;
    const student = students.find((s) => s.id === currentUser.linkedStudentId);
    return student?.indexNumber || null;
  }, [currentUser, students]);

  // Filter notifications relevant to current user
  const relevantNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter((notif) => {
      if (notif.targetType === 'all') return true;
      if (notif.targetType === 'role' && notif.targetRole === currentUser.role) return true;
      if (notif.targetType === 'specific_student') {
        if (currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'registrar') {
          return true; // Admins can see all notices
        }
        return notif.targetStudentIndex === currentStudentIndex;
      }
      return false;
    });
  }, [notifications, currentUser, currentStudentIndex]);

  const unreadCount = useMemo(() => {
    if (!currentUser) return 0;
    return relevantNotifications.filter((n) => !n.readByUserIds.includes(currentUser.id)).length;
  }, [relevantNotifications, currentUser]);

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case 'library_overdue':
        return <Book className="w-4 h-4 text-rose-600" />;
      case 'attendance_warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'meal_deadline':
        return <Utensils className="w-4 h-4 text-orange-600" />;
      case 'ojt_update':
        return <Award className="w-4 h-4 text-emerald-600" />;
      default:
        return <Calendar className="w-4 h-4 text-blue-600" />;
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        title="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllNotificationsAsRead(currentUser.id)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 hover:underline"
                >
                  <CheckCheck size={14} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
              {relevantNotifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-medium">No notifications for your account</p>
                </div>
              ) : (
                relevantNotifications.map((notif) => {
                  const isRead = notif.readByUserIds.includes(currentUser.id);
                  return (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id, currentUser.id)}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                        !isRead ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-2xs shrink-0 mt-0.5">
                          {getIconForType(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className={`text-xs font-bold truncate ${!isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                              {notif.title}
                            </h5>
                            {!isRead && (
                              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                            <span>From: {notif.senderName}</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock size={10} />
                              {formatDate(notif.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
