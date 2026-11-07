import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('soa_sidebar_collapsed');
      if (saved !== null) return JSON.parse(saved);
      // Auto-collapse on tablet screens (768px - 1023px) to maximize content room
      return window.innerWidth < 1024 && window.innerWidth >= 768;
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSetCollapsed = (val: boolean) => {
    setCollapsed(val);
    try {
      localStorage.setItem('soa_sidebar_collapsed', JSON.stringify(val));
    } catch {}
  };

  return (
    <div className="h-screen w-screen bg-slate-50 flex font-sans overflow-hidden">
      {/* Sleek Mobile Header matching SynapGro theme */}
      <header className="md:hidden fixed top-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 flex items-center justify-between z-30 shadow-2xs no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 rounded-full border border-slate-200/90 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 shadow-2xs transition active:scale-95"
            title="Open Menu"
          >
            <Menu size={18} />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                SOA Angunakolapelessa
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/70 text-emerald-800 capitalize">
                {currentUser?.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Department of Agriculture</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <NotificationBell />
          {currentUser && (
            <img
              src={
                currentUser.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
              }
              alt={currentUser.fullName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20 shadow-2xs"
            />
          )}
        </div>
      </header>

      {/* Full-Height Sidebar (Hosts Branding, Nav Links & Profile) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={collapsed}
        setCollapsed={handleSetCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area with Smooth Framer Motion Page Switch Animation & Mandatory pb-32 Padding */}
      <main
        className="flex-1 h-full min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 transition-all pb-32 md:pb-8 pt-20 md:pt-6"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="max-w-7xl mx-auto w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation for all users */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenMenu={() => setMobileOpen(true)}
        hide={mobileOpen}
      />

      {/* Mandatory Password Change Enforcement Modal */}
      <PasswordChangeModal />
    </div>
  );
};
