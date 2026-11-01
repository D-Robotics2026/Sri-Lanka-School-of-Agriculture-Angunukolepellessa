import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from './Modal';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';

export const PasswordChangeModal: React.FC = () => {
  const { currentUser, changePassword, mustChangePasswordOpen, setMustChangePasswordOpen } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!currentUser) return null;

  const isMandatory = currentUser.mustChangePassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    const result = await changePassword(newPassword);
    if (!result.success) {
      setError(result.error || 'Failed to update password');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setNewPassword('');
      setConfirmPassword('');
      setMustChangePasswordOpen(false);
    }, 1200);
  };

  return (
    <Modal
      isOpen={mustChangePasswordOpen}
      onClose={() => {
        if (!isMandatory) {
          setMustChangePasswordOpen(false);
        }
      }}
      title={isMandatory ? 'Mandatory Security Requirement' : 'Change Password'}
      subtitle={
        isMandatory
          ? 'First-time login detected. You must set a personalized password to continue.'
          : 'Update your account login password'
      }
      preventBackdropClose={isMandatory}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isMandatory && (
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Account Setup Incomplete</p>
              <p>
                In accordance with Department of Agriculture security policies, temporary/seeded credentials must be replaced prior to accessing student records or institutional modules.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>Password successfully updated! Logging you in...</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Retype new password"
              required
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          {!isMandatory && (
            <button
              type="button"
              onClick={() => setMustChangePasswordOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm hover:shadow"
          >
            Update & Continue
          </button>
        </div>
      </form>
    </Modal>
  );
};
