import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  CheckSquare,
  FileSpreadsheet,
  Library,
  Users,
  Printer,
  Bell
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab
}) => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  // Dedicated bottom bar for 'student' and 'hostel_warden' roles on mobile
  const isDedicatedRole = currentUser.role === 'student' || currentUser.role === 'hostel_warden';
  if (!isDedicatedRole) return null;

  interface TabItem {
    id: string;
    label: string;
    icon: React.ElementType;
  }

  const studentTabs: TabItem[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'hostel', label: '7×3 Meals', icon: UtensilsCrossed },
    { id: 'attendance', label: 'Attendance', icon: CheckSquare },
    { id: 'assessments', label: 'Assessments', icon: FileSpreadsheet },
    { id: 'library', label: 'Library', icon: Library }
  ];

  const wardenTabs: TabItem[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'hostel', label: 'Meal Schedule', icon: UtensilsCrossed },
    { id: 'students', label: 'Residents', icon: Users },
    { id: 'reports', label: 'Kitchen Print', icon: Printer },
    { id: 'notifications', label: 'Alerts', icon: Bell }
  ];

  const tabs = currentUser.role === 'student' ? studentTabs : wardenTabs;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 py-1.5 shadow-lg no-print">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-50' : ''}`}>
                <Icon size={19} className={isActive ? 'stroke-[2.5]' : ''} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
