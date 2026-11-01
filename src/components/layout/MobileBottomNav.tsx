import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  CheckSquare,
  FileSpreadsheet,
  Library,
  Users,
  CalendarDays,
  Briefcase,
  BarChart3,
  Menu,
  Bell
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenMenu
}) => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  interface TabItem {
    id: string;
    label: string;
    icon: React.ElementType;
    isAction?: boolean;
  }

  const getRoleTabs = (): TabItem[] => {
    switch (currentUser.role) {
      case 'student':
        return [
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'attendance', label: 'Attendance', icon: CheckSquare },
          { id: 'hostel', label: '7×3 Meals', icon: UtensilsCrossed },
          { id: 'assessments', label: 'Tasks', icon: FileSpreadsheet }
        ];
      case 'hostel_warden':
        return [
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'hostel', label: 'Meals', icon: UtensilsCrossed },
          { id: 'students', label: 'Boarders', icon: Users },
          { id: 'reports', label: 'Kitchen Sheet', icon: BarChart3 }
        ];
      case 'librarian':
        return [
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'library', label: 'Library', icon: Library },
          { id: 'notifications', label: 'Notices', icon: Bell }
        ];
      case 'lecturer':
        return [
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'modules', label: 'Modules', icon: FileSpreadsheet },
          { id: 'attendance', label: 'Attendance', icon: CheckSquare },
          { id: 'assessments', label: 'Grading', icon: FileSpreadsheet }
        ];
      case 'registrar':
        return [
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'academics', label: 'Batches', icon: CalendarDays },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'ojt', label: 'OJT', icon: Briefcase }
        ];
      case 'admin':
      case 'super_admin':
      default:
        return [
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'academics', label: 'Batches', icon: CalendarDays },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'attendance', label: 'Attendance', icon: CheckSquare }
        ];
    }
  };

  const tabs = getRoleTabs();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 z-40 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] no-print">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-emerald-700 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-50 text-emerald-700' : ''}`}>
                <Icon size={19} className={isActive ? 'stroke-[2.5]' : ''} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">{tab.label}</span>
            </button>
          );
        })}

        {/* More / Menu Drawer Toggle Tab */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-900 transition-all duration-150 active:scale-95"
          title="Open Full Menu"
        >
          <div className="p-1 rounded-lg bg-slate-100 text-slate-700">
            <Menu size={19} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
};
