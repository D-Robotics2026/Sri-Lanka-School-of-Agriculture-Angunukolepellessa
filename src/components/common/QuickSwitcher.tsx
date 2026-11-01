import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ChevronDown, Shield, User, Users, BookOpen, Utensils, GraduationCap, Sparkles } from 'lucide-react';

export const QuickSwitcher: React.FC = () => {
  const { currentUser, switchUser, allUsers } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const roleIcons: Record<UserRole, React.ReactNode> = {
    super_admin: <Shield className="w-4 h-4 text-purple-600" />,
    admin: <Shield className="w-4 h-4 text-blue-600" />,
    registrar: <Users className="w-4 h-4 text-emerald-600" />,
    lecturer: <GraduationCap className="w-4 h-4 text-amber-600" />,
    librarian: <BookOpen className="w-4 h-4 text-teal-600" />,
    hostel_warden: <Utensils className="w-4 h-4 text-orange-600" />,
    student: <User className="w-4 h-4 text-sky-600" />
  };

  const roleLabels: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    admin: 'Administrator',
    registrar: 'Registrar',
    lecturer: 'Lecturer',
    librarian: 'Librarian',
    hostel_warden: 'Hostel Warden',
    student: 'Student'
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/70 hover:bg-emerald-100/60 text-emerald-900 text-xs font-medium transition-all shadow-xs"
        title="Quick Role Switcher for Testing"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="hidden sm:inline text-emerald-700 font-semibold">Switch Role:</span>
          <span className="font-bold text-slate-800">{roleLabels[currentUser.role]}</span>
        </span>
        <ChevronDown size={14} className={`text-emerald-700 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Interactive Role Simulator (All 7 Roles)
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-0.5 px-1.5">
              {allUsers.map((user) => {
                const isSelected = user.id === currentUser.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUser(user.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-3 transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-bold'
                        : 'hover:bg-slate-50 text-slate-700 font-normal'
                    }`}
                  >
                    <div className="p-1.5 bg-white rounded-lg shadow-2xs border border-slate-100">
                      {roleIcons[user.role]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs truncate block">{user.fullName}</span>
                        {user.mustChangePassword && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                            Reset Pass
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block font-medium">
                        {roleLabels[user.role]} ({user.username})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
