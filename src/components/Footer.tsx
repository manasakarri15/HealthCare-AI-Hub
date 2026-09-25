import React from 'react';
import { Activity, ShieldCheck, Heart, ExternalLink } from 'lucide-react';
import { HealthCategoryId } from '../types';
import { HEALTH_CATEGORIES } from '../data/categories';

interface FooterProps {
  onNavigate: (view: string) => void;
  onSelectCategory: (categoryId: HealthCategoryId) => void;
  onOpenDisclaimer: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onSelectCategory,
  onOpenDisclaimer,
}) => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-20 pt-12 pb-10 text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white">
                <Activity className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">HealthCare AI Hub</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
              Modern digital health platform uniting XGBoost predictive metabolic screening, certified clinical specialists, and hospital-grade medical supplies.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-teal-800 dark:text-teal-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Evidence-Grounded Clinical Framework</span>
            </div>
          </div>

          {/* Clinical Categories Col */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Health Specialties
            </h4>
            <ul className="space-y-1.5">
              {HEALTH_CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className="hover:text-teal-800 dark:hover:text-teal-300 transition-colors cursor-pointer text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Tools Col */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Clinical Platform
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onNavigate('assessment')}
                  className="hover:text-teal-800 dark:hover:text-teal-300 transition-colors cursor-pointer text-left"
                >
                  Diabetes AI Risk Assessment
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('doctors')}
                  className="hover:text-teal-800 dark:hover:text-teal-300 transition-colors cursor-pointer text-left"
                >
                  Specialist Doctor Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-teal-800 dark:hover:text-teal-300 transition-colors cursor-pointer text-left"
                >
                  Healthcare Supplies & Kits
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-teal-800 dark:hover:text-teal-300 transition-colors cursor-pointer text-left"
                >
                  Patient Health Records
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency & Disclaimer Notice Col */}
          <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Emergency Advisory
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              HealthCare AI Hub is designed for informational, educational, and risk awareness purposes. It does not provide medical diagnosis or treatment plans.
            </p>
            <p className="text-[11px] leading-relaxed text-rose-800 dark:text-rose-400 font-semibold">
              In a life-threatening crisis, call 911 or visit your nearest emergency emergency room immediately.
            </p>
            <button
              onClick={onOpenDisclaimer}
              className="text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 font-semibold underline text-[11px] cursor-pointer"
            >
              Full Clinical Disclaimer
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center gap-2">
            <span>© 2026 HealthCare AI Hub · Clinical Prototype Demo</span>
            <span aria-hidden="true">·</span>
            <span>All mock doctor & product data labeled for evaluation</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onOpenDisclaimer} className="hover:text-slate-900 dark:hover:text-slate-200">
              Disclaimer
            </button>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400 dark:text-slate-500">ISO 15197 / HIPAA Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
