import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronRight,
  Heart,
  Info,
  Package,
  Plus,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';
import { HealthCategory, Doctor, Product } from '../types';
import { DOCTORS } from '../data/doctors';
import { HEALTH_PRODUCTS } from '../data/products';

interface CategoryDetailViewProps {
  category: HealthCategory;
  onBack: () => void;
  onOpenAssessment: () => void;
  onBookDoctor: (doctor: Doctor) => void;
  onSelectDoctorProfile: (doctor: Doctor) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  category,
  onBack,
  onOpenAssessment,
  onBookDoctor,
  onSelectDoctorProfile,
  onAddToCart,
  onSelectProduct,
}) => {
  const [checkedSymptoms, setCheckedSymptoms] = useState<Record<number, boolean>>({});

  const toggleSymptom = (index: number) => {
    setCheckedSymptoms((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Filter doctors for this category
  const relevantDoctors = DOCTORS.filter((d) => d.categoryId === category.id);

  // Filter products for this category
  const relevantProducts = HEALTH_PRODUCTS.filter((p) => p.categoryId === category.id);

  const checkedCount = Object.values(checkedSymptoms).filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Top Breadcrumb & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Health Categories</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Department</span>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-slate-800">{category.name}</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Clinical Specialization
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {category.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {category.tagline}
            </p>
          </div>

          {/* AI Banner CTA for Diabetes */}
          {category.hasAiAssessment && (
            <div className="bg-teal-50 p-4 rounded-xl border border-teal-200/80 max-w-xs shrink-0 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-800">
                <Activity className="w-4 h-4 text-teal-700" />
                <span>XGBoost AI Risk Screener</span>
              </div>
              <p className="text-xs text-teal-900 leading-relaxed">
                Estimate 5-year diabetes probability using glucose, BMI, and metabolic markers.
              </p>
              <button
                onClick={onOpenAssessment}
                className="w-full py-2 px-3 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Launch AI Screener</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Clinical Statistics (Zero-pill clean layout) */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {category.keyStatistics.map((stat, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Clinical Evidence {i + 1}
              </span>
              <p className="text-slate-800 font-medium leading-snug">{stat}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Clinical Guide Sections: Overview & Symptoms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Overview & Lifestyle (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Pathophysiology & Overview */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-700" />
              <span>Clinical Overview & Pathophysiology</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {category.overview}
            </p>
          </div>

          {/* Evidence-Based Lifestyle & Prevention Protocols */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-700" />
              <span>Evidence-Based Lifestyle & Preventive Protocol</span>
            </h2>
            <div className="space-y-3">
              {category.lifestyleTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Red Flags */}
          <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-200/70 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>When to Seek Immediate Medical Attention (Red Flags)</span>
            </div>
            <ul className="space-y-2 text-xs text-rose-950">
              {category.clinicalRedFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold shrink-0">·</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Interactive Symptom Self-Check (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Symptom Self-Checklist
                </h3>
                {checkedCount > 0 && (
                  <span className="text-xs font-semibold text-teal-700 tabular-nums">
                    {checkedCount} selected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Check symptoms you or a family member have experienced over the last 30 days:
              </p>
            </div>

            <div className="space-y-2">
              {category.symptoms.map((symptom, idx) => {
                const isChecked = !!checkedSymptoms[idx];
                return (
                  <label
                    key={idx}
                    onClick={() => toggleSymptom(idx)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isChecked
                        ? 'border-teal-500 bg-teal-50/50 text-slate-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 accent-teal-600 rounded"
                    />
                    <span className="leading-snug">{symptom}</span>
                  </label>
                );
              })}
            </div>

            {checkedCount >= 2 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5 animate-in fade-in duration-150">
                <p className="font-semibold">
                  Multiple indicators reported ({checkedCount})
                </p>
                <p className="text-[11px] leading-relaxed">
                  We recommend scheduling a clinical consult with a qualified {category.specialistTitle} to review your biomarker profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Relevant Specialist Doctors for this Category */}
      <section className="space-y-5 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Specialist Directory</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {category.specialistTitle}s Available
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {relevantDoctors.length} certified physician{relevantDoctors.length > 1 ? 's' : ''} in this specialty
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {relevantDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{doc.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{doc.title}</p>
                    <p className="text-xs text-teal-800 font-medium truncate mt-0.5">
                      {doc.hospital}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="font-semibold text-slate-800 tabular-nums">★ {doc.rating}</span>
                      <span aria-hidden="true">·</span>
                      <span>{doc.experienceYears} yrs exp</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-2">
                  {doc.about}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Telehealth: </span>
                  <span className="font-bold text-slate-900 tabular-nums">${doc.telehealthFee}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectDoctorProfile(doc)}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onBookDoctor(doc)}
                    className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Slot</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Relevant Healthcare Products for this Category */}
      <section className="space-y-5 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider">
              <Package className="w-3.5 h-3.5" />
              <span>Category Supplies & Diagnostics</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Recommended for {category.name}
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {relevantProducts.length} verified item{relevantProducts.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {relevantProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between group"
            >
              <div>
                {/* Product image container with fallback */}
                <div
                  onClick={() => onSelectProduct(prod)}
                  className="aspect-4/3 w-full bg-slate-100 rounded-xl overflow-hidden mb-3.5 relative cursor-pointer"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  {prod.badge && (
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-slate-800 px-2 py-0.5 rounded shadow-2xs">
                      {prod.badge}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] text-slate-400 font-medium">{prod.brand}</div>
                  <h3
                    onClick={() => onSelectProduct(prod)}
                    className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors line-clamp-2 cursor-pointer"
                  >
                    {prod.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">{prod.dosageOrSize}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-extrabold text-slate-900 tabular-nums">
                      ${prod.price.toFixed(2)}
                    </span>
                    {prod.originalPrice && (
                      <span className="text-xs text-slate-400 line-through tabular-nums">
                        ${prod.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium">In Stock</span>
                </div>

                <button
                  onClick={() => onAddToCart(prod)}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
