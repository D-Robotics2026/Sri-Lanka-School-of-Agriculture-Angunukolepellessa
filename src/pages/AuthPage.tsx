import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Sprout,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface AuthPageProps {
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = () => {
  const { login, register, switchUser, allUsers } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    const res = login(loginUsername, loginPassword);
    if (!res.success) {
      setLoginError(res.error || 'Invalid credentials');
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    const res = register({
      fullName: regFullName,
      username: regUsername,
      email: regEmail,
      phone: regPhone,
      role: regRole,
      password: regPassword
    });

    if (!res.success) {
      setRegError(res.error || 'Registration failed');
      setIsSubmitting(false);
    }
  };

  // Demo accounts for quick testing
  const demoAccounts: { label: string; username: string; role: string; pass: string }[] = [
    { label: 'Super Admin', username: 'superadmin', role: 'Director', pass: 'admin123' },
    { label: 'Admin', username: 'admin', role: 'Staff Admin', pass: 'admin123' },
    { label: 'Registrar', username: 'registrar', role: 'Academic Office', pass: 'registrar123' },
    { label: 'Lecturer', username: 'lecturer.perera', role: 'Faculty', pass: 'lecturer123' },
    { label: 'Librarian', username: 'librarian', role: 'Library Desk', pass: 'librarian123' },
    { label: 'Warden', username: 'warden', role: 'Hostel & Meals', pass: 'warden123' },
    { label: 'Student', username: 'stu.2023.001', role: 'NVQ Level 5', pass: 'student123' }
  ];

  const handleQuickLogin = (acc: typeof demoAccounts[0]) => {
    setLoginUsername(acc.username);
    setLoginPassword(acc.pass);
    login(acc.username, acc.pass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 animate-scale-in">
        
        {/* Left Side: Premium Brand Showcase (Hidden on small screens) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-emerald-900 via-slate-950 to-slate-950 p-8 flex-col justify-between relative border-r border-slate-800/80">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles size={13} />
              <span>DOA Sri Lanka</span>
            </div>

            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-white shadow-lg ring-4 ring-emerald-500/20 mb-4">
              <Sprout size={32} />
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
              School of Agriculture
            </h1>
            <p className="text-sm font-semibold text-emerald-400 mt-1">
              Angunakolapelessa
            </p>

            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Official institutional portal for NVQ Level 5 & 6 agriculture diploma programs, student batches, attendance, and hostel management.
            </p>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <GraduationCap size={14} />
                </div>
                <span>NVQ Level 5 & 6 Curricula</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={14} />
                </div>
                <span>Automated Attendance & Exams</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={14} />
                </div>
                <span>Library Desk & Hostel Meals</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-800/80 text-[11px] text-slate-500">
            Department of Agriculture • Southern Province
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Mobile Branding Header */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-flex p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md mb-2">
                <Sprout size={26} />
              </div>
              <h2 className="text-lg font-black text-slate-900">SOA Angunakolapelessa</h2>
              <p className="text-xs text-slate-500">Academic & Administrative Portal</p>
            </div>

            {/* Segmented Mode Switcher */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setLoginError(null);
                  setRegError(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setLoginError(null);
                  setRegError(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Register
              </button>
            </div>

            {/* ================= LOGIN FORM ================= */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Welcome Back</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sign in to access your portal dashboard
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0 text-rose-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username / ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="e.g. superadmin or stu.2023.001"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition"
                    />
                    <User size={15} className="absolute left-3 top-3 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition"
                    />
                    <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              /* ================= REGISTER FORM ================= */
              <form onSubmit={handleRegisterSubmit} className="space-y-3 animate-fade-in">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Create Account</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Register a new profile for campus access
                  </p>
                </div>

                {regError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0 text-rose-600" />
                    <span>{regError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Kasun Bandara"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. kasun.b"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Role
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-800 transition"
                    >
                      <option value="student">Student</option>
                      <option value="lecturer">Lecturer</option>
                      <option value="hostel_warden">Hostel Warden</option>
                      <option value="librarian">Librarian</option>
                      <option value="registrar">Registrar</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="user@soa.doa.gov.lk"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 mt-2"
                >
                  <span>Create Account & Log In</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>

          {/* Quick Demo Accounts Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Demo Sign-in
              </span>
              <span className="text-[10px] text-slate-400">Click to fill</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/70 hover:border-emerald-300 text-slate-700 rounded-lg text-[11px] font-semibold transition active:scale-95 flex items-center gap-1"
                  title={`Login as ${acc.label} (${acc.username})`}
                >
                  <span>{acc.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
