import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { SystemUser, UserRole } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Settings,
  Shield,
  Coins,
  GraduationCap,
  Users,
  Database,
  Download,
  Upload,
  RefreshCw,
  Plus,
  KeyRound,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    fineSettings,
    updateFineSettings,
    academicYears,
    resetToDefaultSeed,
    exportBackupJson,
    importBackupJson
  } = useData();

  const { allUsers, addUser, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'system' | 'users' | 'backup'>('system');

  // Fine settings local state
  const [dailyRate, setDailyRate] = useState(fineSettings.dailyRateLkr);
  const [maxBorrowDays, setMaxBorrowDays] = useState(fineSettings.maxBorrowDays);
  const [maxBooks, setMaxBooks] = useState(fineSettings.maxBooksPerStudent);

  // Academic settings local state
  const [attendanceThreshold, setAttendanceThreshold] = useState(
    settings.academicDefaults.minimumAttendanceThresholdPercent
  );

  // User Management Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    fullName: '',
    role: 'lecturer' as UserRole,
    email: '',
    passwordHash: 'password123',
    mustChangePassword: true
  });

  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const handleSaveFineSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateFineSettings({
      dailyRateLkr: Number(dailyRate),
      maxBorrowDays: Number(maxBorrowDays),
      maxBooksPerStudent: Number(maxBooks)
    });
    setMsg({ text: 'Library fine and circulation rules updated successfully!' });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSaveAcademicDefaults = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      academicDefaults: {
        ...settings.academicDefaults,
        minimumAttendanceThresholdPercent: Number(attendanceThreshold)
      }
    });
    setMsg({ text: 'Academic defaults updated successfully!' });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      username: userForm.username,
      fullName: userForm.fullName,
      role: userForm.role,
      email: userForm.email,
      passwordHash: userForm.passwordHash,
      mustChangePassword: userForm.mustChangePassword
    });
    setIsUserModalOpen(false);
    setMsg({ text: `System user ${userForm.username} created successfully!` });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleToggleMustChangePassword = (user: SystemUser) => {
    updateUser({
      ...user,
      mustChangePassword: !user.mustChangePassword
    });
  };

  const handleDownloadBackup = () => {
    const dataStr = exportBackupJson();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SOA_Angunakolapelessa_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackupJson(content);
      if (res.success) {
        setMsg({ text: 'Database successfully imported and restored from backup JSON!' });
      } else {
        setMsg({ text: res.error || 'Failed to import backup', error: true });
      }
      setTimeout(() => setMsg(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleResetSeed = () => {
    if (confirm('Reset entire system database to default pre-seeded state? Any unsaved local edits will be replaced.')) {
      resetToDefaultSeed();
      setMsg({ text: 'System database successfully reset to factory seed data!' });
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
          System Administration & Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Library fine rates, academic attendance thresholds, authentication accounts, and database backup
        </p>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            msg.error
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          {msg.error ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'system' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings size={14} />
          <span>Rules & Academic Defaults</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={14} />
          <span>System Users ({allUsers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'backup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database size={14} />
          <span>Data Backup & Seed Reset</span>
        </button>
      </div>

      {/* Tab 1: System Rules & Defaults */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Library Fine Rules */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                <Coins size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Library Circulation & Daily Fine Rate</h3>
                <p className="text-xs text-slate-500">Fine computation engine parameters</p>
              </div>
            </div>

            <form onSubmit={handleSaveFineSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Daily Overdue Fine Rate (Sri Lankan Rupees)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">LKR</span>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full pl-12 pr-3 py-2 border border-slate-200 rounded-xl font-bold font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Charged per calendar day for each overdue book after due date
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Borrow Duration</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={maxBorrowDays}
                      onChange={(e) => setMaxBorrowDays(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                    />
                    <span className="text-slate-500">Days</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Books / Student</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={maxBooks}
                    onChange={(e) => setMaxBooks(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  Save Circulation Rules
                </button>
              </div>
            </form>
          </div>

          {/* Academic Defaults */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                <GraduationCap size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Academic & Attendance Statutory Thresholds</h3>
                <p className="text-xs text-slate-500">Department of Agriculture National Standards</p>
              </div>
            </div>

            <form onSubmit={handleSaveAcademicDefaults} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Statutory Examination Attendance Threshold (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={attendanceThreshold}
                    onChange={(e) => setAttendanceThreshold(Number(e.target.value))}
                    className="w-32 px-3 py-2 border border-slate-200 rounded-xl font-bold font-mono"
                  />
                  <span className="font-bold text-slate-600">% Attendance Minimum</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Students below this percentage are automatically flagged as under-attendance and not eligible to sit final examinations.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Curriculum Framework</span>
                <p className="text-slate-700 font-medium">
                  • <strong>NVQ Level 5</strong>: 2 Semesters Institutional + 6 Months OJT
                </p>
                <p className="text-slate-700 font-medium">
                  • <strong>NVQ Level 6</strong>: 4 Semesters Institutional + 6 Months OJT
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  Save Academic Defaults
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: System Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-800">System Users & Authentication Registry</h3>
              <p className="text-xs text-slate-500">Manage credentials and mandatory first-login password flags</p>
            </div>
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={15} />
              <span>Create User</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Must Change Password</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{user.fullName}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{user.username}</td>

                    <td className="py-3 px-4">
                      <Badge variant="green" size="sm">
                        {user.role}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      {user.mustChangePassword ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Enforced
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Normal</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleMustChangePassword(user)}
                        className="px-2.5 py-1 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-semibold transition"
                        title="Toggle must-change-password flag"
                      >
                        Toggle Password Reset
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Data Backup & Reset */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Export Backup */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl w-fit mb-3">
                <Download size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Export Full JSON Database</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Download a complete snapshot of all academic years, students, attendance, modules, library records, and hostel choices.
              </p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
            >
              <Download size={14} />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Import Backup */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl w-fit mb-3">
                <Upload size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Restore From Backup File</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Load an existing JSON backup to restore system state and historic records onto this client instance.
              </p>
            </div>
            <label className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer">
              <Upload size={14} />
              <span>Select JSON Backup File</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Factory Reset Seed */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl w-fit mb-3">
                <RefreshCw size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Reset Demo Seed Database</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Restore the pre-seeded School of Agriculture Angunakolapelessa demo state with all 7 roles, modules, and sessions.
              </p>
            </div>
            <button
              onClick={handleResetSeed}
              className="mt-6 w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              <span>Reset Factory Seed State</span>
            </button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Add New System User Account"
        subtitle="School of Agriculture Angunakolapelessa Access Control"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Username</label>
            <input
              type="text"
              required
              value={userForm.username}
              onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
              placeholder="e.g. j.senanayake"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={userForm.fullName}
              onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
              placeholder="e.g. Janith Senanayake"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role</label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
              >
                <option value="super_admin">Super Admin</option>
                <option value="admin">Administrator</option>
                <option value="registrar">Registrar</option>
                <option value="lecturer">Lecturer</option>
                <option value="librarian">Librarian</option>
                <option value="hostel_warden">Hostel Warden</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="email@soa.doa.gov.lk"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
            <input
              type="password"
              required
              value={userForm.passwordHash}
              onChange={(e) => setUserForm({ ...userForm, passwordHash: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="mustChange"
              checked={userForm.mustChangePassword}
              onChange={(e) => setUserForm({ ...userForm, mustChangePassword: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600"
            />
            <label htmlFor="mustChange" className="font-semibold text-slate-700 cursor-pointer">
              Enforce mandatory password change on first login
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
