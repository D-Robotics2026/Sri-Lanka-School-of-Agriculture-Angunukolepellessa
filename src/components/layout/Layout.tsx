import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { NotificationBell } from '../common/NotificationBell';
import { PasswordChangeModal } from '../common/PasswordChangeModal';
import { useAuth } from '../../context/AuthContext';
import { Menu, Sprout } from 'lucide-react';

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
      {/* Sleek Mobile Header (Only visible on small viewports) */}
      <header className="md:hidden fixed top-0 inset-x-0 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 flex items-center justify-between z-30 shadow-xs no-print">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-xl text-slate-700 hover:bg-slate-100 transition active:scale-95"
            title="Open Menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Sprout size={16} />
            </div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">
              SOA Angunakolapelessa
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          {currentUser && (
            <img
              src={
                currentUser.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
              }
              alt={currentUser.fullName}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
            />
          )}
        </div>
      </header>

      {/* Full-Height Sidebar (Hosts Branding, Nav Links & Profile) */}
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
        } pt-16 md:pt-6 animate-fade-in`}
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
