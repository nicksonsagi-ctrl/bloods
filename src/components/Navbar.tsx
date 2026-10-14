import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Globe, Menu, X, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Language } from '../data/translations.js';

interface NavbarProps {
  onOpenAuth?: (tab: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'DONOR') return '/donor/dashboard';
    return '/requester/dashboard';
  };

  const navLinks = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.findDonors, href: '/find-donors' },
    { label: t.nav.requestBlood, href: '/request-blood' },
    { label: t.nav.campaigns, href: '/campaigns' },
    { label: t.nav.guide, href: '/donation-guide' },
    { label: t.nav.about, href: '/about-us' },
    { label: t.nav.contact, href: '/contact-us' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark with Crimson Symbol */}
        <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <div className="w-9 h-9 rounded-lg bg-[#DC0A20] flex items-center justify-center text-white shadow-sm group-hover:bg-[#B80020] transition-colors">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#151515]">
            Life<span className="text-[#DC0A20]">Link</span>
          </span>
        </Link>

        {/* Zone 2: Navigation Links (single line, subtle hover) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-600">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`whitespace-nowrap transition-colors py-1 ${
                  isActive
                    ? 'text-[#DC0A20] font-semibold border-b-2 border-[#DC0A20]'
                    : 'hover:text-[#DC0A20]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Language Selector + Auth / User Dashboard) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Switcher */}
          <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 border border-neutral-200 text-xs font-medium">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-md transition-colors ${
                language === 'en' ? 'bg-white text-neutral-900 shadow-xs font-semibold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('si')}
              className={`px-2 py-1 rounded-md transition-colors ${
                language === 'si' ? 'bg-white text-neutral-900 shadow-xs font-semibold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              සිං
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2 py-1 rounded-md transition-colors ${
                language === 'ta' ? 'bg-white text-neutral-900 shadow-xs font-semibold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              தமி
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={getDashboardRoute()}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#DC0A20] rounded-lg hover:bg-[#B80020] transition-colors whitespace-nowrap shadow-xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{t.nav.dashboard}</span>
              </Link>
              <button
                onClick={() => logout()}
                title={t.nav.logout}
                className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth ? onOpenAuth('login') : navigate('/login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:text-[#DC0A20] hover:bg-neutral-50 rounded-lg transition-colors whitespace-nowrap"
              >
                {t.nav.login}
              </button>
              <button
                onClick={() => onOpenAuth ? onOpenAuth('register') : navigate('/register')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#DC0A20] rounded-lg hover:bg-[#B80020] transition-colors whitespace-nowrap shadow-xs"
              >
                {t.nav.register}
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 focus:outline-hidden"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-[#DC0A20] hover:bg-neutral-50"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="pt-4 border-t border-neutral-100 space-y-2">
              <Link
                to={getDashboardRoute()}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 px-4 rounded-lg bg-[#DC0A20] text-white font-medium text-sm"
              >
                {t.nav.dashboard} ({user.role})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="block text-center w-full py-2 px-4 rounded-lg border border-neutral-200 text-neutral-700 text-sm"
              >
                {t.nav.logout}
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuth) onOpenAuth('login');
                }}
                className="w-full py-2 text-center text-sm font-semibold border border-neutral-300 rounded-lg text-neutral-700"
              >
                {t.nav.login}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuth) onOpenAuth('register');
                }}
                className="w-full py-2 text-center text-sm font-semibold bg-[#DC0A20] text-white rounded-lg"
              >
                {t.nav.register}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
