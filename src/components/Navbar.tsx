import React, { useState } from 'react';
import {
  Activity,
  Search,
  ShoppingCart,
  Bell,
  User,
  Menu,
  X,
  Stethoscope,
  ChevronDown,
  Sparkles,
  Sun,
  Moon,
  Heart,
} from 'lucide-react';
import { HealthCategoryId, UserProfile } from '../types';
import { HEALTH_CATEGORIES } from '../data/categories';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onSelectCategory: (catId: HealthCategoryId) => void;
  cartCount: number;
  unreadNotifsCount: number;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onOpenNotifs: () => void;
  onOpenAuth: () => void;
  onOpenGeminiChat: () => void;
  currentUser: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  onSelectCategory,
  cartCount,
  unreadNotifsCount,
  onOpenSearch,
  onOpenCart,
  onOpenNotifs,
  onOpenAuth,
  onOpenGeminiChat,
  currentUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Zone - Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="text-left group cursor-pointer focus:outline-none flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-700 dark:bg-teal-500 dark:group-hover:bg-teal-400 transition-colors">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-teal-900 dark:text-slate-100 dark:group-hover:text-teal-300 transition-colors">
                HealthCare AI Hub
              </span>
            </button>
          </div>

          {/* Zone 2: 4-6 Clean Text Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {/* Categories dropdown trigger */}
            <div
              className="relative"
              onMouseEnter={() => setCategoriesDropdownOpen(true)}
              onMouseLeave={() => setCategoriesDropdownOpen(false)}
            >
              <button
                onClick={() => onNavigate('categories')}
                className={`flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer py-2 ${
                  activeView === 'categories' || activeView === 'category-detail' ? 'text-teal-700 dark:text-teal-400 font-bold' : ''
                }`}
              >
                <span>Health Categories</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </button>

              {categoriesDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Clinical Specialties
                  </div>
                  {HEALTH_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.id);
                        setCategoriesDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 hover:text-teal-800 dark:hover:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                    >
                      <span className="font-medium">{cat.name}</span>
                      {cat.hasAiAssessment && (
                        <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800/60">
                          AI Risk
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('assessment')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeView === 'assessment' ? 'text-teal-700 dark:text-teal-400 font-bold' : ''
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span>Diabetes AI Assessment</span>
            </button>

            <button
              onClick={() => onNavigate('doctors')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer ${
                activeView === 'doctors' ? 'text-teal-700 dark:text-teal-400 font-bold' : ''
              }`}
            >
              Specialist Doctors
            </button>

            <button
              onClick={() => onNavigate('products')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer ${
                activeView === 'products' ? 'text-teal-700 dark:text-teal-400 font-bold' : ''
              }`}
            >
              Medical Supplies
            </button>

            <button
              onClick={() => onNavigate('metrics')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeView === 'metrics' ? 'text-rose-600 dark:text-rose-400 font-bold' : ''
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
              <span>Health Metrics</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer ${
                activeView === 'dashboard' ? 'text-teal-700 dark:text-teal-400 font-bold' : ''
              }`}
            >
              Patient Dashboard
            </button>
          </nav>

          {/* Zone 3: Primary Actions & User Affordances */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Gemini AI Assistant Button */}
            <button
              onClick={onOpenGeminiChat}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/60 dark:to-emerald-950/60 text-teal-800 dark:text-teal-200 border border-teal-200/80 dark:border-teal-750 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-100/70 dark:hover:bg-teal-900/60 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
              title="Ask Gemini Medical Assistant & Live Voice"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Ask AI / Voice</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
            </button>

            {/* Global Dark / Light Mode Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode (deep slate)'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={isDark}
              type="button"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-transform group-hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 group-hover:text-slate-900 group-hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Search shortcut button */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Search symptoms, doctors & supplies"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications button */}
            <button
              onClick={onOpenNotifs}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Health alerts"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Shopping Cart button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center"
              title="Medical supplies cart"
              aria-label="Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-600 dark:bg-teal-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* User Profile / Switcher button */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 py-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Navigation
          </div>

          {/* Mobile Theme Toggle Row */}
          <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
              <span>{isDark ? 'Dark Theme (Deep Slate)' : 'Light Theme'}</span>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                isDark ? 'bg-teal-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={isDark}
              aria-label="Toggle dark mode theme"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            onClick={() => {
              onOpenGeminiChat();
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left py-2 text-sm font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-3 rounded-lg border border-teal-100 dark:border-teal-800"
          >
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Ask Gemini AI / Live Voice</span>
          </button>
          <button
            onClick={() => {
              onNavigate('categories');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400"
          >
            Health Categories
          </button>
          <button
            onClick={() => {
              onNavigate('assessment');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-semibold text-teal-700 dark:text-teal-400"
          >
            Diabetes AI Risk Assessment
          </button>
          <button
            onClick={() => {
              onNavigate('doctors');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400"
          >
            Specialist Doctors Directory
          </button>
          <button
            onClick={() => {
              onNavigate('products');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400"
          >
            Healthcare Products & Supplies
          </button>
          <button
            onClick={() => {
              onNavigate('metrics');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left py-2 text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Health Metrics & Vitals</span>
          </button>
          <button
            onClick={() => {
              onNavigate('dashboard');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400"
          >
            Patient Dashboard
          </button>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-lg text-center"
            >
              Switch Patient Profile
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

