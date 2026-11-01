import React from 'react';
import { useAuth } from '../../context/AuthContext';
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
  ShieldAlert
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
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { currentUser } = useAuth();

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
      {/* Scope Pill */}
      <div className={`px-4 py-3.5 border-b border-slate-800 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Department of Agriculture
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
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

      {/* Role Indicator Footer */}
      {!collapsed && (
        <div className="p-3 m-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="text-amber-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Access Scope</p>
              <p className="text-xs font-semibold text-slate-200 capitalize truncate">
                {currentUser.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}
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
        <div className="sticky top-[53px] h-[calc(100vh-53px)] border-r border-slate-200">
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
