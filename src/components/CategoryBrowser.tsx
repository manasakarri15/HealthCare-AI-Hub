import React from 'react';
import {
  Activity,
  Heart,
  Sparkles,
  Users,
  Shield,
  Smile,
  Compass,
  ArrowRight,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';
import { HEALTH_CATEGORIES } from '../data/categories';
import { HealthCategoryId } from '../types';

interface CategoryBrowserProps {
  onSelectCategory: (categoryId: HealthCategoryId) => void;
  onOpenAssessment: () => void;
}

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  onSelectCategory,
  onOpenAssessment,
}) => {
  const getIcon = (id: HealthCategoryId) => {
    switch (id) {
      case 'diabetes':
        return <Activity className="w-5 h-5 text-teal-600" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-600" />;
      case 'skin':
        return <Sparkles className="w-5 h-5 text-amber-600" />;
      case 'women':
        return <Users className="w-5 h-5 text-purple-600" />;
      case 'bone':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'mental':
        return <Smile className="w-5 h-5 text-emerald-600" />;
      case 'general':
        return <Compass className="w-5 h-5 text-slate-700" />;
      default:
        return <Activity className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinical Departments</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Explore Health Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Select a specialty to access clinical guidance, certified specialist doctors, evidence-based lifestyle protocols, and category-tailored medical supplies.
          </p>
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {HEALTH_CATEGORIES.map((cat) => {
          const isDiabetes = cat.id === 'diabetes';
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group bg-white dark:bg-slate-900 rounded-2xl p-6 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isDiabetes
                  ? 'border-teal-300 dark:border-teal-700/80 hover:border-teal-500 dark:hover:border-teal-500 shadow-xs hover:shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/80 group-hover:bg-teal-50/80 dark:group-hover:bg-teal-950/60 rounded-xl transition-colors shrink-0">
                    {getIcon(cat.id)}
                  </div>
                  {cat.hasAiAssessment && (
                    <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60">
                      AI Model Available
                    </span>
                  )}
                </div>

                {/* Title & Tagline */}
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-800 dark:group-hover:text-teal-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {cat.tagline}
                </p>

                {/* Key stat snippet without pill clutter */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <p className="line-clamp-2 italic text-slate-500 dark:text-slate-400">
                    "{cat.keyStatistics[0]}"
                  </p>
                </div>
              </div>

              {/* Bottom links */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {cat.specialistTitle.split('&')[0]}
                </span>
                <span className="font-semibold text-teal-700 dark:text-teal-400 group-hover:text-teal-900 dark:group-hover:text-teal-300 inline-flex items-center gap-1 transition-colors">
                  <span>Explore Guide</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
