import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { isTabAllowedForRole } from '../../types';
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  Users,
  BookOpenCheck,
  CheckSquare,
  FileSpreadsheet,
  Briefcase,
  Library,
  UtensilsCrossed,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sprout,
  LogOut,
  KeyRound,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { currentUser, logout, setMustChangePasswordOpen } = useAuth();
  const { notifications, students } = useData();

  if (!currentUser) return null;

  // Compute unread notifications count for current user
  const currentStudentIndex =
    currentUser.role === 'student'
      ? students.find((s) => s.id === currentUser.linkedStudentId)?.indexNumber
      : null;

  const unreadCount = notifications.filter((n) => {
    const isTargeted =
      n.targetType === 'all' ||
      (n.targetType === 'role' && n.targetRole === currentUser.role) ||
      (n.targetType === 'specific_student' && currentStudentIndex && n.targetStudentIndex === currentStudentIndex);
    return isTargeted && !n.readByUserIds.includes(currentUser.id);
  }).length;

  // Simple, clean, concise words for all navigation items
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'academics',
      label: 'Batches',
      icon: CalendarDays,
      roles: ['super_admin', 'admin', 'registrar']
    },
    {
      id: 'students',
      label: 'Students',
      icon: GraduationCap,
      roles: ['super_admin', 'admin', 'registrar', 'lecturer', 'hostel_warden']
    },
    {
      id: 'lecturers',
      label: 'Lecturers',
      icon: Users,
      roles: ['super_admin', 'admin']
    },
    {
      id: 'modules',
      label: 'Modules',
      icon: BookOpenCheck,
      roles: ['super_admin', 'admin', 'registrar', 'lecturer', 'student']
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: CheckSquare,
      roles: ['super_admin', 'admin', 'registrar', 'lecturer', 'student']
    },
    {
      id: 'assessments',
      label: 'Assessments',
      icon: FileSpreadsheet,
      roles: ['super_admin', 'admin', 'lecturer', 'student']
    },
    {
      id: 'ojt',
      label: 'OJT',
      icon: Briefcase,
      roles: ['super_admin', 'admin', 'registrar', 'student']
    },
    {
      id: 'library',
      label: 'Library',
      icon: Library,
      roles: ['super_admin', 'admin', 'librarian', 'student']
    },
    {
      id: 'hostel',
      label: 'Hostel',
      icon: UtensilsCrossed,
      roles: ['super_admin', 'admin', 'hostel_warden', 'student']
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      roles: ['super_admin', 'admin', 'registrar']
    },
    {
      id: 'notifications',
      label: 'Notices',
      icon: Bell,
      roles: ['super_admin', 'admin', 'registrar', 'lecturer', 'librarian', 'hostel_warden', 'student']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      roles: ['super_admin', 'admin']
    }
  ];

  // Filter items strictly by user role permissions
  const visibleItems = navItems.filter((item) => isTabAllowedForRole(currentUser.role, item.id));

  const handleSelect = (id: string) => {
    setCurrentTab(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300 select-none">
      {/* Branding Header */}
      <div
        className={`p-4 border-b border-slate-800/80 flex items-center ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!collapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-white shadow-md ring-2 ring-emerald-500/20 shrink-0">
              <Sprout size={20} className="stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white tracking-tight truncate">
                  SOA Angunakolapelessa
                </span>
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold truncate uppercase tracking-wider">
                DOA Sri Lanka
              </p>
            </div>
          </div>
        ) : (
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-white shadow-md ring-2 ring-emerald-500/20">
            <Sprout size={20} className="stroke-[2.5]" />
          </div>
        )}

        {/* Desktop Collapse / Expand Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Close Navigation"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isNotices = item.id === 'notifications';

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-transform ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 group-hover:text-emerald-400 group-hover:scale-110'
                }`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}

              {/* Notice unread count badge */}
              {isNotices && unreadCount > 0 && !collapsed && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile & Actions Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <img
                src={
                  currentUser.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
                }
                alt={currentUser.fullName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {currentUser.fullName}
                </p>
                <p className="text-[10px] text-emerald-400 font-semibold capitalize truncate">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => setMustChangePasswordOpen(true)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium transition flex items-center justify-center gap-1"
                title="Change Password"
              >
                <KeyRound size={13} className="text-slate-400" />
                <span>Password</span>
              </button>
              <button
                onClick={logout}
                className="py-1.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-[11px] font-semibold transition flex items-center justify-center gap-1 active:scale-95"
                title="Sign Out"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <img
              src={
                currentUser.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
              }
              alt={currentUser.fullName}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
              title={`${currentUser.fullName} (${currentUser.role})`}
            />
            <button
              onClick={logout}
              className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 no-print z-20 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen border-r border-slate-800/80">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer with Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden no-print">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-950 z-50 shadow-2xl animate-slide-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
