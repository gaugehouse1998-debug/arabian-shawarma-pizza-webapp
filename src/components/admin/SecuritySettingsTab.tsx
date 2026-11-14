import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  LogOut,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminAuthService, AdminSecurityState } from '../../services/adminAuthService';
import { storageService } from '../../services/storageService';
import { AuditLogItem } from '../../types';

export const SecuritySettingsTab: React.FC = () => {
  const { changeAdminPassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [securityState, setSecurityState] = useState<AdminSecurityState | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  const loadData = async () => {
    const state = await adminAuthService.getSecurityState();
    setSecurityState(state);
    const logs = storageService.getAuditLogs().filter((l) => l.entityType === 'auth');
    setAuditLogs(logs);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('asp_data_updated', handleUpdate);
    return () => window.removeEventListener('asp_data_updated', handleUpdate);
  }, []);

  // Compute live password strength criteria
  const strength = adminAuthService.validatePasswordStrength(newPassword);
  const criteriaPassedCount = Object.values(strength.criteria).filter(Boolean).length;
  const strengthPercentage = (criteriaPassedCount / 5) * 100;

  const getStrengthColor = () => {
    if (criteriaPassedCount <= 2) return 'bg-red-500';
    if (criteriaPassedCount <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = () => {
    if (newPassword.length === 0) return 'Enter password';
    if (criteriaPassedCount <= 2) return 'Weak';
    if (criteriaPassedCount <= 4) return 'Good';
    return 'Strong & Secure';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await changeAdminPassword(currentPassword, newPassword, confirmPassword);
      if (res.success) {
        setSuccessMsg('Your administrator password has been successfully updated and secured.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        loadData();
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('An unexpected error occurred while changing password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAll = () => {
    if (confirm('Are you sure you want to terminate all other administrative sessions?')) {
      adminAuthService.logoutAllSessions();
      setSuccessMsg('All other active admin sessions have been revoked.');
      loadData();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Account Security Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Admin Login ID</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono font-bold text-white text-xs truncate">
            {adminAuthService.getAdminIdentifier()}
          </div>
          <div className="text-[10px] text-emerald-400">Exclusive Pre-Authorized Account</div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Password Status</span>
            <KeyRound className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-bold text-white text-xs">
            {securityState?.mustChangePassword ? (
              <span className="text-red-400 font-bold">Temporary (Change Required)</span>
            ) : (
              <span className="text-emerald-400 font-bold">Permanent & Secured</span>
            )}
          </div>
          <div className="text-[10px] text-neutral-500">
            {securityState?.lastPasswordChange
              ? `Changed: ${new Date(securityState.lastPasswordChange).toLocaleDateString()}`
              : 'Initial temporary setup'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Rate-Limit Protection</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-bold text-white text-xs">5 Attempts / 15m Lock</div>
          <div className="text-[10px] text-neutral-500">Zero-Trust Brute Force Defense</div>
        </div>
      </div>

      {/* Main Change Password Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">
              Change Administrator Password
            </h2>
            <p className="text-xs text-neutral-400">
              Ensure your account uses a secure password with at least 12 characters.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Current Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-neutral-300 font-medium">Current Password *</label>
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
              placeholder="Enter your current password"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
            />
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-neutral-300 font-medium">New Password * (Min 12 Characters)</label>
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
              placeholder="Create a strong 12+ character password"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
            />
          </div>

          {/* Dynamic Strength Indicator */}
          {newPassword.length > 0 && (
            <div className="space-y-2 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-neutral-400">Password Strength:</span>
                <span className="font-bold text-white capitalize">{getStrengthLabel()}</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStrengthColor()} transition-all duration-300`}
                  style={{ width: `${strengthPercentage}%` }}
                />
              </div>

              {/* 5-Criteria Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[11px]">
                <div className="flex items-center gap-1.5">
                  {strength.criteria.minLength ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  )}
                  <span className={strength.criteria.minLength ? 'text-white' : 'text-neutral-500'}>
                    At least 12 characters
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {strength.criteria.hasUpper ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  )}
                  <span className={strength.criteria.hasUpper ? 'text-white' : 'text-neutral-500'}>
                    Uppercase letter (A-Z)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {strength.criteria.hasLower ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  )}
                  <span className={strength.criteria.hasLower ? 'text-white' : 'text-neutral-500'}>
                    Lowercase letter (a-z)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {strength.criteria.hasNumber ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  )}
                  <span className={strength.criteria.hasNumber ? 'text-white' : 'text-neutral-500'}>
                    At least one number (0-9)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:col-span-2">
                  {strength.criteria.hasSpecial ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  )}
                  <span className={strength.criteria.hasSpecial ? 'text-white' : 'text-neutral-500'}>
                    Special symbol (!@#$%^&*...)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-neutral-300 font-medium">Confirm New Password *</label>
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
              placeholder="Re-enter your new password"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
            />
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-[11px] text-red-400">Passwords do not match.</p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogoutAll}
              className="text-neutral-400 hover:text-white text-xs underline cursor-pointer"
            >
              Revoke & Logout All Other Sessions
            </button>

            <button
              type="submit"
              disabled={isLoading || !strength.isValid || newPassword !== confirmPassword}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              {isLoading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Audit Trail */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm font-display">
              Authentication Audit Logs
            </h3>
          </div>
          <button
            onClick={loadData}
            className="text-neutral-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-neutral-500 py-4 text-center">
            No authentication events recorded yet.
          </p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <div className="font-mono font-bold text-amber-400 text-[10px]">
                    {log.action}
                  </div>
                  <div className="text-neutral-300">{log.details}</div>
                </div>
                <div className="text-neutral-500 text-[10px] whitespace-nowrap ml-4">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
