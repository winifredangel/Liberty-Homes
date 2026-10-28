import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordRequested, setForgotPasswordRequested] = useState(false);
  const { login, loading, error, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // If already logged in as authorized admin, redirect to dashboard
  if (user && isAdmin) {
    navigate('/admin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) return;

    const res = await login(identifier, password);
    if (res.success) {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-[#E8DED3] shadow-md">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#4E342E] text-white rounded-xl flex items-center justify-center mx-auto shadow-xs">
            <Shield className="w-6 h-6 text-[#c9b3a0]" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#795548] block">
            Liberty Homes Abuja
          </span>
          <h2 className="text-2xl font-serif font-bold text-[#171717]">
            Administrative Portal
          </h2>
          <p className="text-xs text-[#6B6B6B]">
            Restricted access for authorized real estate administrators.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-[#C62828] text-xs rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{error}</div>
          </div>
        )}

        {forgotPasswordRequested && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-lg">
            Password recovery links must be dispatched through your Supabase Auth dashboard or connected SMTP provider for security.
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E342E] mb-1">
              Email or Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@libertyhomes.ng"
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4E342E]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotPasswordRequested(true)}
                className="text-[11px] text-[#795548] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                className="w-full pl-9 pr-10 py-2 text-xs bg-[#F8F6F3] border border-[#E8DED3] rounded-lg focus:outline-hidden focus:border-[#795548]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-[#6B6B6B] hover:text-[#171717] absolute right-2 top-1/2 -translate-y-1/2"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#795548] hover:bg-[#4E342E] disabled:opacity-50 rounded-lg transition-colors shadow-sm"
          >
            {loading ? 'Authenticating with Supabase...' : 'Sign In as Administrator'}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            to="/"
            className="text-xs text-[#6B6B6B] hover:text-[#4E342E] hover:underline"
          >
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};
