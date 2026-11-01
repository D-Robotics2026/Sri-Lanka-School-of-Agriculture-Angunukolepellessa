import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/layout/Layout';
import { isTabAllowedForRole } from './types';
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
import { AuthPage } from './pages/AuthPage';
import { ShieldAlert } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Automatic Access Guard: If current role cannot access currentTab, reset to role's dashboard
  useEffect(() => {
    if (currentUser && !isTabAllowedForRole(currentUser.role, currentTab)) {
      setCurrentTab('dashboard');
    }
  }, [currentUser?.role, currentTab]);

  // If not logged in, render dedicated Login & Register page
  if (!currentUser) {
    return <AuthPage />;
  }

  // Render main page content based on currentTab with Role-Based Access Guard
  const renderContent = () => {
    // Access Guard: Ensure user role is authorized to view currentTab
    if (!isTabAllowedForRole(currentUser.role, currentTab)) {
      return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
            <ShieldAlert size={28} />
          </div>
          <h3 className="text-lg font-black text-slate-900">Access Restricted</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your current account role <strong className="text-slate-800 capitalize font-bold">({currentUser.role.replace('_', ' ')})</strong> does not have clearance to view this department section.
          </p>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            Return to My Role Dashboard
          </button>
        </div>
      );
    }

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
