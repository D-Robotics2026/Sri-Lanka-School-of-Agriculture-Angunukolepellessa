import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { QuickSwitcher } from '../common/QuickSwitcher';
import { NotificationBell } from '../common/NotificationBell';
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
  KeyRound
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

  if (!currentUser) return null;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'academics',
      label: 'Academic Batches',
      icon: CalendarDays,
      roles: ['super_admin', 'admin', 'registrar']
    },
    {
      id: 'students',
      label: 'Students Directory',
      icon: GraduationCap,
      roles: ['super_admin', 'admin', 'registrar', 'lecturer', 'hostel_warden']
    },
    {
      id: 'lecturers',
      label: 'Lecturer Faculty',
      icon: Users,
      roles: ['super_admin', 'admin']
    },
    {
      id: 'modules',
      label: 'Curriculum & Modules',
      icon: BookOpenCheck,
      roles: ['super_admin', 'admin', 'registrar', 'lecturer', 'student']
    },
    {
      id: 'attendance',
      label: 'Attendance Sessions',
      icon: CheckSquare,
      roles: ['super_admin', 'admin', 'registrar', 'lecturer', 'student']
    },
    {
      id: 'assessments',
      label: 'Assignments & Tests',
      icon: FileSpreadsheet,
      roles: ['super_admin', 'admin', 'lecturer', 'student']
    },
    {
      id: 'ojt',
      label: '6-Month OJT Tracker',
      icon: Briefcase,
      roles: ['super_admin', 'admin', 'registrar', 'student']
    },
    {
      id: 'library',
      label: 'Library & Fines',
      icon: Library,
      roles: ['super_admin', 'admin', 'librarian', 'student']
    },
    {
      id: 'hostel',
      label: 'Hostel & 7×3 Meals',
      icon: UtensilsCrossed,
      roles: ['super_admin', 'admin', 'hostel_warden', 'student']
    },
    {
      id: 'reports',
      label: 'Progress Reports',
      icon: BarChart3,
      roles: ['super_admin', 'admin', 'registrar']
    },
    {
      id: 'notifications',
      label: 'Communications',
      icon: Bell,
      roles: ['super_admin', 'admin', 'registrar', 'lecturer', 'librarian', 'hostel_warden', 'student']
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      roles: ['super_admin', 'admin']
    }
  ];

  // Filter items by user role
  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(currentUser.role);
  });

  const handleSelect = (id: string) => {
    setCurrentTab(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Branding Header */}
      <div className={`p-4 border-b border-slate-800 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md ring-2 ring-emerald-500/20 shrink-0">
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
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md ring-2 ring-emerald-500/20">
            <Sprout size={20} className="stroke-[2.5]" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-1"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Quick Role Switcher & Notifications Toolbar */}
      {!collapsed && (
        <div className="px-3 py-2.5 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <QuickSwitcher />
          </div>
          <div className="text-slate-300 hover:text-white shrink-0">
            <NotificationBell />
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-transform ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400 group-hover:scale-110'
                }`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* User Profile & Actions Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
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

            <div className="flex items-center gap-1 pt-1">
              <button
                onClick={() => setMustChangePasswordOpen(true)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition flex items-center justify-center gap-1.5"
                title="Change Password"
              >
                <KeyRound size={13} className="text-slate-400" />
                <span>Password</span>
              </button>
              <button
                onClick={logout}
                className="py-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-[11px] font-semibold transition flex items-center justify-center gap-1"
                title="Log Out"
              >
                <LogOut size={13} />
                <span>Exit</span>
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
              title="Log Out"
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
        <div className="sticky top-0 h-screen border-r border-slate-800">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden no-print">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
