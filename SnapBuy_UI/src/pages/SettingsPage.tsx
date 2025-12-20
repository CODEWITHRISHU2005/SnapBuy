import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Moon, Sun, Bell, Shield, ArrowRight } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-md w-full mx-4 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-8 text-center shadow-xl dark:shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
          <p className="text-slate-700 dark:text-slate-200 mb-4 text-lg font-semibold">You need to be logged in to access settings.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white font-semibold shadow-lg shadow-purple-500/40 dark:shadow-[0_12px_32px_rgba(236,72,153,0.5)] hover:-translate-y-0.5 transition-all duration-300 border border-white/10"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
              Settings
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Manage your account, appearance, and notifications for SnapBuy.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6">
          {/* Account settings */}
          <section className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-xl dark:shadow-[0_18px_60px_rgba(0,0,0,0.7)] p-6 sm:p-7 space-y-5">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              Account
            </h2>
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {user.profileImage && user.profileImage.trim() !== '' ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-white/20"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={user.profileImage && user.profileImage.trim() !== '' ? 'hidden' : 'w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white border border-slate-200 dark:border-white/20'}>
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{user.email}</span>
                    </p>
                  </div>
                </div>
              </div>

              {user.roles && user.roles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-200"
                    >
                      <Shield className="w-3 h-3" />
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Theme + notifications */}
          <section className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-xl dark:shadow-[0_18px_60px_rgba(0,0,0,0.7)] p-6 sm:p-7 space-y-6">
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                Appearance
              </h2>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Switch between light and dark modes for your workspace.
                </p>
                <button
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/30 transition-all duration-150"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4" />
                      Light mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4" />
                      Dark mode
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                Notifications
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Coming soon – you&apos;ll be able to fine-tune order and promotion alerts here.
              </p>
            </div>
          </section>
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
          <span>Looking for your orders or cart?</span>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/orders')}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/30 transition-all duration-150"
            >
              Orders
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/30 transition-all duration-150"
            >
              Cart
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;


