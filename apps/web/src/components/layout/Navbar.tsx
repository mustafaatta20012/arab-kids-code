import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu, X, LogIn, Globe, Moon, Sun,
  LogOut, LayoutDashboard, ChevronDown, ShieldCheck,
} from 'lucide-react';

import { useThemeStore } from '../../lib/theme';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const dashboardPath = isAdmin
    ? '/admin'
    : user?.role === 'parent'
    ? '/parent'
    : '/student';

  const navLinks = [
    { path: '/',             label: t('nav.home') },
    { path: '/lessons/free', label: t('nav.freeLesson') },
    { path: '/curriculum',   label: t('nav.curriculum') },
    { path: '/instructor',   label: t('nav.instructor') },
    { path: '/pricing',      label: t('nav.pricing') },
    { path: '/contact',      label: t('nav.contact') },
  ];

  // ── Auth section shown in desktop header ────────────────────────────────
  const AuthSection = () => {
    // While loading: show a neutral skeleton (no flicker)
    if (loading) {
      return (
        <div className="w-28 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      );
    }

    // Logged out
    if (!isAuthenticated) {
      return (
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-sky-500/20 hover:shadow-lg transition-all active:scale-95"
        >
          <LogIn className="w-4 h-4" />
          <span>{t('nav.login')}</span>
        </Link>
      );
    }

    // Logged in — user dropdown
    return (
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen((o) => !o)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm"
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
        >
          {/* Avatar circle */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <span className="max-w-[100px] truncate">{user?.name}</span>
          {isAdmin && (
            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold">
              معلم
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {userMenuOpen && (
          <div className="absolute left-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-fade-in">
            {/* User info */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.phone}</p>
            </div>

            {/* Dashboard */}
            <Link
              to={dashboardPath}
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-700 dark:hover:text-sky-400 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>لوحة التحكم</span>
            </Link>

            {/* Admin panel (only for admins) */}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>لوحة المعلم</span>
              </Link>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header
      className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-sky-100 dark:border-slate-800 shadow-sm"
      role="banner"
    >
      {/* Skip to main content (accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-sky-600 focus:text-white focus:rounded-xl focus:shadow-xl font-bold text-sm"
      >
        {t('common.skipToContent', 'انتقل إلى المحتوى الرئيسي')}
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xl"
            aria-label="الصفحة الرئيسية لمنصة كود أطفال العرب"
          >
            <img
              src="/images/Friendly 3D Coding Avatar with Colorful Blocks.png"
              alt="شعار منصة كود أطفال العرب"
              width={48}
              height={48}
              loading="eager"
              className="w-12 h-12 rounded-2xl object-contain shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="text-xl font-black bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 dark:from-sky-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                كود أطفال العرب
              </span>
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Arab Kids Code</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/80'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark mode */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-xs font-bold shadow-sm"
              aria-label="تغيير المظهر"
            >
              {theme === 'dark'
                ? <><Sun className="w-4 h-4 text-amber-400" /><span>مضيء</span></>
                : <><Moon className="w-4 h-4 text-indigo-600" /><span>داكن</span></>
              }
            </button>

            {/* Language */}
            <button
              onClick={toggleLanguage}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-sm"
            >
              <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{i18n.language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Auth section */}
            <AuthSection />
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 shadow-sm" aria-label="تغيير المظهر">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
            <button onClick={toggleLanguage} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 shadow-sm">
              {i18n.language === 'ar' ? 'EN' : 'عربي'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
              aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-2 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 space-y-2">
            {loading ? (
              <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-600 text-white font-bold text-base shadow-md"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>لوحة التحكم</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-bold text-base"
                >
                  <LogOut className="w-5 h-5" />
                  <span>تسجيل الخروج</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold text-base shadow-md"
              >
                <LogIn className="w-5 h-5" />
                <span>{t('nav.login')}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
