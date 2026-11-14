import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginProps {
  onSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToStore }) => {
  const { loginAdmin } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await loginAdmin(loginId.trim(), password);
      if (result.success) {
        onSuccess();
      } else {
        // Generic error message without revealing which credential was wrong
        setError(result.message || 'Invalid credentials. Access denied.');
      }
    } catch {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6 text-neutral-100 relative overflow-hidden backdrop-blur-xl">
        {/* Subtle accent bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        {/* Clean Logo Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-neutral-950 border border-neutral-800 p-2 flex items-center justify-center mx-auto shadow-xl">
            <img
              src="/logo.png"
              alt="Arabian Shawarma & Pizza"
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <h1 className="text-xl font-bold text-white font-display">
            Admin Portal
          </h1>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-300 font-medium block">Admin ID</label>
            <input
              type="text"
              required
              autoComplete="username"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-neutral-300 font-medium block">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onBackToStore}
            className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            ← Back to Store
          </button>
        </div>
      </div>
    </div>
  );
};
