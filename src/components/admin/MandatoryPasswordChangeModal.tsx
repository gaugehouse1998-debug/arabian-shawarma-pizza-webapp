import React, { useState } from 'react';
import { ShieldAlert, Lock, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminAuthService } from '../../services/adminAuthService';

interface MandatoryPasswordChangeModalProps {
  onSuccess: () => void;
}

export const MandatoryPasswordChangeModal: React.FC<MandatoryPasswordChangeModalProps> = ({ onSuccess }) => {
  const { changeAdminPassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const strength = adminAuthService.validatePasswordStrength(newPassword);
  const criteriaPassedCount = Object.values(strength.criteria).filter(Boolean).length;
  const strengthPercentage = (criteriaPassedCount / 5) * 100;

  const getStrengthColor = () => {
    if (criteriaPassedCount <= 2) return 'bg-red-500';
    if (criteriaPassedCount <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('The new password and confirmation password do not match.');
      return;
    }

    if (!strength.isValid) {
      setErrorMsg(strength.errors[0] || 'Password does not meet complexity requirements.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await changeAdminPassword(currentPassword, newPassword, confirmPassword);
      if (res.success) {
        onSuccess();
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('An unexpected error occurred during password update.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-neutral-900 border border-amber-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden animate-fadeIn">
        {/* Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" />

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white font-display">
              Mandatory Security Upgrade
            </h2>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              You are signed in with a temporary onboarding password. For system integrity, you must set a permanent 12+ character password before accessing the admin dashboard.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Current Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-neutral-300 font-medium">Temporary Password</label>
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-amber-400" />}
                <span>{showCurrent ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current temporary password"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white font-mono"
            />
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-neutral-300 font-medium">Permanent Password * (Min 12 Chars)</label>
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-amber-400" />}
                <span>{showNew ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <input
              type={showNew ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new strong password"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white font-mono"
            />
          </div>

          {/* Live Strength Checklist */}
          {newPassword.length > 0 && (
            <div className="space-y-2 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-neutral-400">Complexity Score:</span>
                <span className="font-bold text-white">{criteriaPassedCount}/5 Criteria Met</span>
              </div>
              <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStrengthColor()} transition-all duration-300`}
                  style={{ width: `${strengthPercentage}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                <div className="flex items-center gap-1">
                  {strength.criteria.minLength ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-neutral-600" />}
                  <span className={strength.criteria.minLength ? 'text-white' : 'text-neutral-500'}>12+ Characters</span>
                </div>
                <div className="flex items-center gap-1">
                  {strength.criteria.hasUpper ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-neutral-600" />}
                  <span className={strength.criteria.hasUpper ? 'text-white' : 'text-neutral-500'}>Uppercase (A-Z)</span>
                </div>
                <div className="flex items-center gap-1">
                  {strength.criteria.hasLower ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-neutral-600" />}
                  <span className={strength.criteria.hasLower ? 'text-white' : 'text-neutral-500'}>Lowercase (a-z)</span>
                </div>
                <div className="flex items-center gap-1">
                  {strength.criteria.hasNumber ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-neutral-600" />}
                  <span className={strength.criteria.hasNumber ? 'text-white' : 'text-neutral-500'}>Digit (0-9)</span>
                </div>
                <div className="flex items-center gap-1 col-span-2">
                  {strength.criteria.hasSpecial ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-neutral-600" />}
                  <span className={strength.criteria.hasSpecial ? 'text-white' : 'text-neutral-500'}>Special Character (!@#$...)</span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-neutral-300 font-medium">Confirm Permanent Password *</label>
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-amber-400" />}
                <span>{showConfirm ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <input
              type={showConfirm ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter permanent password"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !strength.isValid || newPassword !== confirmPassword}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <span>{isLoading ? 'Saving Secure Credentials...' : 'Save Password & Enter Admin Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
