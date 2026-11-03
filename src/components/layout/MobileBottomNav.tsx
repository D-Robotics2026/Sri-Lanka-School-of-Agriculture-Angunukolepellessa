import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  CheckSquare,
  FileSpreadsheet,
  Library,
  GraduationCap,
  CalendarDays,
  Briefcase,
  BarChart3,
  BookOpenCheck,
  Clock,
  Bell,
  Menu
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
  }

  const getRoleTabs = (): { left: [TabItem, TabItem]; right: [TabItem, TabItem] } => {
    switch (currentUser.role) {
      case 'student':
        return {
          left: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'attendance', label: 'Attendance', icon: CheckSquare }
          ],
          right: [
            { id: 'hostel', label: '7×3 Meals', icon: UtensilsCrossed },
            { id: 'assessments', label: 'Tasks', icon: FileSpreadsheet }
          ]
        };
      case 'hostel_warden':
        return {
          left: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'hostel', label: 'Meals', icon: UtensilsCrossed }
          ],
          right: [
            { id: 'students', label: 'Boarders', icon: GraduationCap },
            { id: 'reports', label: 'Kitchen', icon: BarChart3 }
          ]
        };
      case 'librarian':
        return {
          left: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'library', label: 'Books', icon: Library }
          ],
          right: [
            { id: 'reports', label: 'Circulation', icon: Clock },
            { id: 'notifications', label: 'Notices', icon: Bell }
          ]
        };
      case 'lecturer':
        return {
          left: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'modules', label: 'Modules', icon: BookOpenCheck }
          ],
          right: [
            { id: 'attendance', label: 'Attendance', icon: CheckSquare },
            { id: 'assessments', label: 'Grading', icon: FileSpreadsheet }
          ]
        };
      case 'registrar':
        return {
          left: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'academics', label: 'Batches', icon: CalendarDays }
          ],
          right: [
            { id: 'students', label: 'Students', icon: GraduationCap },
            { id: 'ojt', label: 'OJT Trainees', icon: Briefcase }
          ]
        };
      case 'admin':
      case 'super_admin':
      default:
        return {
          left: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'academics', label: 'Batches', icon: CalendarDays }
          ],
          right: [
            { id: 'students', label: 'Students', icon: GraduationCap },
            { id: 'attendance', label: 'Attendance', icon: CheckSquare }
          ]
        };
    }
  };

  const { left, right } = getRoleTabs();

  const renderTabButton = (tab: TabItem) => {
    const Icon = tab.icon;
    const isActive = currentTab === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => setCurrentTab(tab.id)}
        className={`flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-95 ${
          isActive
            ? 'text-emerald-700 font-bold scale-105'
            : 'text-slate-400 hover:text-slate-700 font-medium'
        }`}
      >
        <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700' : ''}`}>
          <Icon size={19} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight leading-none">{tab.label}</span>
        {isActive && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-0.5" />}
      </button>
    );
  };

  return (
    <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 no-print animate-fade-up">
      {/* Floating Pill Dock Capsule */}
      <div className="relative bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] px-3 py-2 flex items-center justify-between">
        
        {/* Left Action Items */}
        <div className="flex-1 flex items-center justify-around pr-8">
          {left.map(renderTabButton)}
        </div>

        {/* Center Floating Elevated Main Menu Button */}
        <motion.button
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.92 }}
          onClick={onOpenMenu}
          className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex flex-col items-center justify-center shadow-lg shadow-emerald-600/35 border-4 border-white transition-all cursor-pointer z-10"
          title="Open Menu"
        >
          <Menu size={22} className="stroke-[2.5]" />
          <span className="text-[9px] font-black uppercase tracking-tight -mt-0.5 leading-none">Menu</span>
        </motion.button>

        {/* Right Action Items */}
        <div className="flex-1 flex items-center justify-around pl-8">
          {right.map(renderTabButton)}
        </div>

      </div>
    </nav>
  );
};
