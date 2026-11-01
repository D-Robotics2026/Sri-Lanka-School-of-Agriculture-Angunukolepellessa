import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { SystemNotification, NotificationPriority, NotificationType, UserRole } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Bell,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Book,
  Calendar,
  Utensils,
  Award,
  Send,
  CheckCircle,
  Clock
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    notifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    students
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'announcement' as NotificationType,
    priority: 'medium' as NotificationPriority,
    targetType: 'all' as 'all' | 'role' | 'specific_student',
    targetRole: 'student' as UserRole,
    targetStudentIndex: ''
  });

  const handleOpenAdd = () => {
    setForm({
      title: '',
      message: '',
      type: 'announcement',
      priority: 'medium',
      targetType: 'all',
      targetRole: 'student',
      targetStudentIndex: students[0]?.indexNumber || ''
    });
    setIsModalOpen(true);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification({
      title: form.title,
      message: form.message,
      type: form.type,
      priority: form.priority,
      targetType: form.targetType,
      targetRole: form.targetType === 'role' ? form.targetRole : undefined,
      targetStudentIndex: form.targetType === 'specific_student' ? form.targetStudentIndex : undefined,
      senderName: currentUser?.fullName || 'Administration Office'
    });
    setIsModalOpen(false);
  };

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || notif.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="red">URGENT</Badge>;
      case 'high':
        return <Badge variant="amber">High Priority</Badge>;
      case 'medium':
        return <Badge variant="blue">Standard</Badge>;
      case 'low':
        return <Badge variant="slate">Notice</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Institutional Communications & Broadcasts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Targeted announcements, overdue library alerts, attendance warnings, and hostel notices
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser && (
            <button
              onClick={() => markAllNotificationsAsRead(currentUser.id)}
              className="px-3.5 py-2 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition border border-slate-200"
            >
              Mark All as Read
            </button>
          )}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={16} />
            <span>Create Targeted Notice</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Standard</option>
          <option value="low">Notice</option>
        </select>
      </div>

      {/* Notifications Cards Feed */}
      <div className="space-y-3.5">
        {filteredNotifications.map((notif) => {
          const isRead = currentUser ? notif.readByUserIds.includes(currentUser.id) : true;

          return (
            <div
              key={notif.id}
              onClick={() => currentUser && markNotificationAsRead(notif.id, currentUser.id)}
              className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer ${
                !isRead
                  ? 'border-emerald-300 bg-emerald-50/20 shadow-xs ring-1 ring-emerald-500/20'
                  : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 shrink-0 mt-0.5">
                    <Bell size={18} className="text-emerald-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getPriorityBadge(notif.priority)}
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        {notif.targetType === 'all'
                          ? 'Broadcast to All'
                          : notif.targetType === 'role'
                          ? `Role: ${notif.targetRole}`
                          : `Student: ${notif.targetStudentIndex}`}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{notif.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                    <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400">
                      <span>Sender: <strong className="text-slate-700">{notif.senderName}</strong></span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(notif.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {!isRead && (
                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold uppercase shrink-0">
                    New
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Notification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Send Targeted Institutional Notice"
        subtitle="Department of Agriculture Sri Lanka - Internal Communications"
      >
        <form onSubmit={handleSendNotification} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Field Practical Schedule Update"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Content</label>
            <textarea
              rows={3}
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Full announcement message..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                <option value="announcement">Announcement</option>
                <option value="library_overdue">Library Overdue Notice</option>
                <option value="attendance_warning">Attendance Warning</option>
                <option value="meal_deadline">Hostel Meal Deadline</option>
                <option value="ojt_update">OJT Training Notification</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h5 className="font-bold text-slate-800 text-xs">Target Audience Scope</h5>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  checked={form.targetType === 'all'}
                  onChange={() => setForm({ ...form, targetType: 'all' })}
                />
                <span>Broadcast to All</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  checked={form.targetType === 'role'}
                  onChange={() => setForm({ ...form, targetType: 'role' })}
                />
                <span>Specific Role</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  checked={form.targetType === 'specific_student'}
                  onChange={() => setForm({ ...form, targetType: 'specific_student' })}
                />
                <span>Single Student</span>
              </label>
            </div>

            {form.targetType === 'role' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Role</label>
                <select
                  value={form.targetRole}
                  onChange={(e) => setForm({ ...form, targetRole: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  <option value="student">All Students</option>
                  <option value="lecturer">All Lecturers & Faculty</option>
                  <option value="hostel_warden">Hostel Wardens</option>
                  <option value="librarian">Librarians</option>
                </select>
              </div>
            )}

            {form.targetType === 'specific_student' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Student Index</label>
                <select
                  value={form.targetStudentIndex}
                  onChange={(e) => setForm({ ...form, targetStudentIndex: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.indexNumber}>
                      {s.indexNumber} — {s.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Send size={14} />
              <span>Broadcast Notice</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
