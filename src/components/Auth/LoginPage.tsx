import React, { useState } from 'react';
import {
  Home,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, pass: string) => Promise<unknown>;
  onSignup: (email: string, pass: string, name?: string) => Promise<unknown>;
  onGuestLogin: () => Promise<unknown>;
  onResetPassword: (email: string) => Promise<void>;
  error: string | null;
  onClearError: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onSignup,
  onGuestLogin,
  onResetPassword,
  error,
  onClearError,
}) => {
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('mihirakanshana2k04@gmail.com');
  const [password, setPassword] = useState<string>('123456');
  const [displayName, setDisplayName] = useState<string>('Admin');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      if (isSignup) {
        await onSignup(email, password, displayName);
      } else {
        await onLogin(email, password);
      }
    } catch {
      // Error handled by parent / hook
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      await onGuestLogin();
    } catch {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    try {
      await onResetPassword(resetEmail);
      setResetSuccess(true);
    } catch {
      // Handled
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F14] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#151B23] border border-white/8 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative z-10">
        {/* Brand Logo & Titles */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30 mb-4">
            <Home className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Smart Home</h1>
          <p className="text-xs text-[#8B95A5] mt-1 font-medium">
            Intelligent Home Monitoring & Control
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/8 text-[11px] text-[#8B95A5] mt-3">
            <Cpu className="w-3 h-3 text-indigo-400" />
            <span>ESP32 & Firebase Realtime Engine</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Login / Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="text-xs font-semibold text-[#8B95A5] block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  onClearError();
                }}
                required
                placeholder="e.g. John Doe"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#8B95A5]/60 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#8B95A5] block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  onClearError();
                }}
                required
                placeholder="name@domain.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-[#8B95A5]/60 focus:outline-none focus:border-indigo-500 transition"
              />
              <Mail className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8B95A5] block mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  onClearError();
                }}
                required
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-[#8B95A5]/60 focus:outline-none focus:border-indigo-500 transition"
              />
              <Lock className="w-4 h-4 text-[#8B95A5] absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#8B95A5] hover:text-white absolute right-3.5 top-3 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isSignup && (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-[#8B95A5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 accent-indigo-600 rounded"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setShowForgotModal(true);
                }}
                className="text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isSignup ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Smart Home Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Smart Home</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Instant Sign-In Options */}
        <div className="mt-6 pt-6 border-t border-white/8 space-y-3">
          <button
            onClick={handleGuest}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/8 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Instant Access / Explore Live Dashboard</span>
          </button>

          <div className="text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                onClearError();
              }}
              className="text-xs text-[#8B95A5] hover:text-white transition cursor-pointer"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-[#151B23] border border-white/15 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Reset Password</h3>
            <p className="text-xs text-[#8B95A5] mb-4">
              Enter your email to receive a password reset link from Firebase.
            </p>

            {resetSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Password reset link sent! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-3">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                >
                  Send Reset Link
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setShowForgotModal(false);
                setResetSuccess(false);
              }}
              className="w-full mt-2 py-2 rounded-xl text-xs text-[#8B95A5] hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
