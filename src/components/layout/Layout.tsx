import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { PasswordChangeModal } from '../common/PasswordChangeModal';
import { useAuth } from '../../context/AuthContext';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentTab,
  setCurrentTab
}) => {
  const { currentUser } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDedicatedMobileRole = currentUser?.role === 'student' || currentUser?.role === 'hostel_warden';

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Drawer Trigger Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-30 p-2.5 rounded-xl bg-slate-900/90 text-white shadow-lg backdrop-blur-md hover:bg-slate-800 transition focus:outline-none no-print"
        title="Open Navigation Menu"
      >
        <Menu size={20} />
      </button>

      {/* Full-Height Sidebar (Hosts Branding, Role Switcher, Nav Links & Profile) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all ${
          isDedicatedMobileRole ? 'pb-20 md:pb-8' : 'pb-8'
        } pt-14 md:pt-6`}
      >
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Mobile Bottom Navigation for Student and Hostel Warden */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      {/* Mandatory Password Change Enforcement Modal */}
      <PasswordChangeModal />
    </div>
  );
};
