import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  Lock,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Database
} from 'lucide-react';

interface AuthPageProps {
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = () => {
  const { login } = useAuth();

  // Login form state
  const [loginMode, setLoginMode] = useState<'username' | 'phone'>('username');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const res = await login(identifier, password, loginMode);
      if (!res.success) {
        setLoginError(res.error || 'Invalid credentials provided.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Authentication error. Please check your network and credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 animate-scale-in">
        
        {/* Left Side: Premium Institutional Brand Showcase */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-emerald-950 via-slate-950 to-black p-8 flex-col justify-between relative border-r border-slate-800">
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
            <p className="text-sm font-bold text-emerald-400 mt-1">
              Angunakolapelessa
            </p>

            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Official institutional portal for NVQ Level 5 & 6 agriculture diploma programs, student batches, attendance, and hostel management.
            </p>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-3.5">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <GraduationCap size={15} />
                </div>
                <span>NVQ Level 5 & 6 Curricula</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={15} />
                </div>
                <span>Automated Attendance & Exams</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={15} />
                </div>
                <span>Library Desk & Hostel Catering</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Database size={13} className="text-emerald-400" />
              <span>Firebase Auth & Cloud Sync</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Right Side: Clean Sign In Form */}
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

            <div className="mb-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sign In</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your credentials to access your administrative or student dashboard
              </p>
            </div>

            {/* Login Mode Switcher Tabs: Username/ID vs Phone */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setLoginMode('username');
                  setLoginError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  loginMode === 'username'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User size={14} />
                <span>Username or ID</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode('phone');
                  setLoginError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  loginMode === 'phone'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Phone size={14} />
                <span>Phone Number</span>
              </button>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2 animate-fade-in">
                <AlertCircle size={15} className="shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {loginMode === 'username' ? 'Username, ID or Email' : 'Registered Phone Number'}
                </label>
                <div className="relative">
                  <input
                    type={loginMode === 'phone' ? 'tel' : 'text'}
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      loginMode === 'username'
                        ? 'e.g. username, student index or email'
                        : 'e.g. 077 123 4567 or +94 77 123 4567'
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition"
                  />
                  {loginMode === 'username' ? (
                    <User size={15} className="absolute left-3 top-3 text-slate-400" />
                  ) : (
                    <Phone size={15} className="absolute left-3 top-3 text-slate-400" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition"
                  />
                  <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to System'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>

          {/* Security & Firebase Auth Indicator (Default Super Admin Credentials Box Removed) */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span className="font-medium text-slate-500">
              Secured by Firebase Authentication & Cloud Firestore
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
