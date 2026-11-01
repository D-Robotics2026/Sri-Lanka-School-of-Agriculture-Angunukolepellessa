import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { QuickSwitcher } from '../common/QuickSwitcher';
import { NotificationBell } from '../common/NotificationBell';
import { Menu, LogOut, Sprout, KeyRound } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  collapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, logout, setMustChangePasswordOpen } = useAuth();

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between no-print shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-500 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20">
            <Sprout size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                SOA Angunakolapelessa
              </span>
              <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                DOA Sri Lanka
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              School of Agriculture • Academic & Administrative Management System
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher for instant demo evaluation */}
        <QuickSwitcher />

        {/* Notifications */}
        <NotificationBell />

        {/* User Profile Pill & Actions */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="relative group">
            <div className="flex items-center gap-2.5 cursor-pointer p-1 rounded-xl hover:bg-slate-50">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                alt={currentUser.fullName}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                  {currentUser.fullName}
                </p>
                <p className="text-[10px] text-slate-400 font-medium capitalize">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* User Dropdown */}
            <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 hidden group-hover:block hover:block z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800 truncate">{currentUser.fullName}</p>
                <p className="text-[11px] text-slate-400">{currentUser.email}</p>
              </div>
              <button
                onClick={() => setMustChangePasswordOpen(true)}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
              >
                <KeyRound size={14} className="text-slate-400" />
                <span>Change Password</span>
              </button>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition font-medium"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
