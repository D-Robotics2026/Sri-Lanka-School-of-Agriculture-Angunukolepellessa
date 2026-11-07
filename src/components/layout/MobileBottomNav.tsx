import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  hide?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenMenu,
  hide = false
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
    <AnimatePresence>
      {!hide && (
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="md:hidden fixed bottom-4 inset-x-0 mx-auto w-[92%] max-w-md z-40 pointer-events-none no-print"
        >
          {/* Floating Pill Dock Capsule */}
          <div className="relative w-full bg-white/95 backdrop-blur-md border border-gray-100 rounded-full shadow-lg px-2 py-1.5 flex items-center justify-between pointer-events-auto">
            
            {/* Left Action Items */}
            <div className="flex-1 flex items-center justify-around pr-2">
              {left.map(renderTabButton)}
            </div>

            {/* Center Spacer slot for floating button */}
            <div className="w-14 shrink-0 pointer-events-none" />

            {/* Center Floating Action Button ("Menu") */}
            <button
              onClick={onOpenMenu}
              className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex flex-col items-center justify-center shadow-lg border-4 border-white transition-transform active:scale-95 cursor-pointer z-10"
              title="Menu"
            >
              <Menu size={22} className="stroke-[2.5]" />
              <span className="text-[9px] font-black uppercase tracking-tight -mt-0.5 leading-none">Menu</span>
            </button>

            {/* Right Action Items */}
            <div className="flex-1 flex items-center justify-around pl-2">
              {right.map(renderTabButton)}
            </div>

          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};
