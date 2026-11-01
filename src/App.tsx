import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { AcademicYearsPage } from './pages/AcademicYearsPage';
import { StudentsPage } from './pages/StudentsPage';
import { LecturersPage } from './pages/LecturersPage';
import { ModulesPage } from './pages/ModulesPage';
import { AttendancePage } from './pages/AttendancePage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { OjtPage } from './pages/OjtPage';
import { LibraryPage } from './pages/LibraryPage';
import { HostelMealsPage } from './pages/HostelMealsPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Sprout, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, login, allUsers, switchUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = login(username, password);
    if (!res.success) {
      setLoginError(res.error || 'Authentication failed');
    }
  };

  // If not logged in, render authentication bootstrap page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-900 to-black opacity-80" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-600 text-white shadow-xl mb-3">
            <Sprout size={32} />
          </div>
          <p className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
            Department of Agriculture — Sri Lanka
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            School of Agriculture
          </h2>
          <p className="text-sm font-semibold text-slate-300">
            Angunakolapelessa • Academic & Administrative Portal
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
          <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100">
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username / ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. superadmin or stu.2023.001"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <Lock size={15} className="absolute left-3 top-2.5 text-slate-400" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>

            {/* Quick Demo Role Logins */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
                One-Click Evaluator Quick Sign-in (7 Roles)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {allUsers.slice(0, 6).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => switchUser(u.id)}
                    className="p-2 text-left bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 rounded-xl text-[11px] transition"
                  >
                    <div className="font-bold text-slate-800 capitalize truncate">
                      {u.role.replace('_', ' ')}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{u.username}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render main page content based on currentTab
  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentTab} />;
      case 'academics':
        return <AcademicYearsPage />;
      case 'students':
        return <StudentsPage />;
      case 'lecturers':
        return <LecturersPage />;
      case 'modules':
        return <ModulesPage />;
      case 'attendance':
        return <AttendancePage />;
      case 'assessments':
        return <AssessmentsPage />;
      case 'ojt':
        return <OjtPage />;
      case 'library':
        return <LibraryPage />;
      case 'hostel':
        return <HostelMealsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setCurrentTab} />;
    }
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
      {renderContent()}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}
