import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Activity, User, Package, ChevronRight, Stethoscope, ArrowRight } from 'lucide-react';
import { HEALTH_CATEGORIES } from '../data/categories';
import { DOCTORS } from '../data/doctors';
import { HEALTH_PRODUCTS } from '../data/products';
import { HealthCategoryId } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryId: HealthCategoryId) => void;
  onSelectDoctor: (doctorId: string) => void;
  onSelectProduct: (productId: string) => void;
  onOpenAssessment: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  onSelectDoctor,
  onSelectProduct,
  onOpenAssessment,
}) => {
  const [query, setQuery] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();

    const matchedCategories = HEALTH_CATEGORIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.overview.toLowerCase().includes(q) ||
        c.symptoms.some((s) => s.toLowerCase().includes(q))
    ).slice(0, 3);

    const matchedDoctors = DOCTORS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.hospital.toLowerCase().includes(q) ||
        d.about.toLowerCase().includes(q)
    ).slice(0, 3);

    const matchedProducts = HEALTH_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.dosageOrSize.toLowerCase().includes(q)
    ).slice(0, 3);

    const isAssessmentMatch =
      q.includes('diabet') ||
      q.includes('risk') ||
      q.includes('xgboost') ||
      q.includes('glucose') ||
      q.includes('insulin') ||
      q.includes('assess');

    return {
      categories: matchedCategories,
      doctors: matchedDoctors,
      products: matchedProducts,
      isAssessmentMatch,
      totalCount:
        matchedCategories.length +
        matchedDoctors.length +
        matchedProducts.length +
        (isAssessmentMatch ? 1 : 0),
    };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-100 px-4 py-3.5">
          <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symptoms, categories, doctors, medications, or AI tools..."
            autoFocus
            className="w-full pl-3 pr-8 py-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] text-slate-400 bg-slate-100 border border-slate-200 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Content Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-slate-100">
          {!query.trim() ? (
            <div className="py-6 px-2 space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Popular Health Topics
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Diabetes AI Screener',
                  'Dr. Elena Rostova',
                  'Blood Glucose Monitor',
                  'Cardiology',
                  'Eczema & Barrier',
                  'Magnesium Glycinate',
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-xs text-slate-600 hover:text-teal-700 bg-slate-50 hover:bg-teal-50/60 px-3 py-1.5 rounded-lg border border-slate-200/80 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : searchResults && searchResults.totalCount === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-sm font-medium text-slate-700">No medical results found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for 'Diabetes', 'Cardiologist', 'Glucose', or 'Blood Pressure'
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* AI Assessment match */}
              {searchResults?.isAssessmentMatch && (
                <div
                  onClick={() => {
                    onOpenAssessment();
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-teal-50/80 border border-teal-200/70 hover:bg-teal-100/70 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-600 text-white rounded-lg">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        XGBoost AI Diabetes Risk Assessment
                      </h4>
                      <p className="text-xs text-teal-800 mt-0.5">
                        Clinical probability model with SHAP factor attribution
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-teal-700" />
                </div>
              )}

              {/* Categories */}
              {searchResults?.categories && searchResults.categories.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Health Categories
                  </h4>
                  <div className="space-y-1">
                    {searchResults.categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.id);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900 group-hover:text-teal-700">
                            {cat.name}
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-1">{cat.tagline}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctors */}
              {searchResults?.doctors && searchResults.doctors.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Specialist Doctors
                  </h4>
                  <div className="space-y-1">
                    {searchResults.doctors.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => {
                          onSelectDoctor(doc.id);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={doc.image}
                            alt={doc.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-900 group-hover:text-teal-700">
                              {doc.name}
                            </p>
                            <p className="text-xs text-slate-500">{doc.specialty} · {doc.hospital}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-teal-700 tabular-nums">
                          From ${doc.telehealthFee}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {searchResults?.products && searchResults.products.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Healthcare Products & Supplies
                  </h4>
                  <div className="space-y-1">
                    {searchResults.products.map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => {
                          onSelectProduct(prod.id);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 group-hover:text-teal-700 line-clamp-1">
                              {prod.name}
                            </p>
                            <p className="text-xs text-slate-500">{prod.brand} · {prod.dosageOrSize}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">
                          ${prod.price.toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Search covers 7 clinical categories, specialist roster & supplies</span>
          <button onClick={onClose} className="hover:text-slate-600 font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
