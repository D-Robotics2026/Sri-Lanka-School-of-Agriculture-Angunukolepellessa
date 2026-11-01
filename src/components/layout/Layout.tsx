import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { PasswordChangeModal } from '../common/PasswordChangeModal';
import { useAuth } from '../../context/AuthContext';

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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setMobileOpen(!mobileOpen)}
        collapsed={collapsed}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
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
          }`}
        >
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

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
