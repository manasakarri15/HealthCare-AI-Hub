import React, { useState } from 'react';
import { AlertCircle, ChevronRight, ShieldAlert, X } from 'lucide-react';

export const MedicalDisclaimerBanner: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span className="font-medium text-slate-200">Clinical Prototype & Educational Notice:</span>
            <span className="hidden sm:inline text-slate-400">
              For evaluation purposes with sample demo doctors & supplies. Not a substitute for licensed medical diagnosis.
            </span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="text-teal-400 hover:text-teal-300 underline font-medium cursor-pointer transition-colors inline-flex items-center gap-1"
          >
            <span>Read Healthcare Disclaimer</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg shrink-0 border border-amber-200/60 dark:border-amber-800/60">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Healthcare Information & AI Disclaimer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Please review before using HealthCare AI Hub tools</p>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 border-y border-slate-100 dark:border-slate-800 py-4 my-2">
              <p>
                <strong>1. Educational & Screening Scope:</strong> The predictive models (including the XGBoost diabetes risk assessment) and health guides provided on this platform are for informational, statistical risk estimation, and educational purposes only.
              </p>
              <p>
                <strong>2. Not Medical Advice or Diagnosis:</strong> This application does not offer medical diagnosis, official clinical treatment plans, or prescription writing. Machine learning risk scores represent statistical probabilities based on population cohorts, not clinical determinations.
              </p>
              <p>
                <strong>3. Consult Qualified Professionals:</strong> Always consult with a licensed physician, endocrinologist, or qualified healthcare provider regarding symptoms, medication changes, or specific medical conditions.
              </p>
              <p>
                <strong>4. Medical Emergencies:</strong> If you are experiencing symptoms of a medical emergency (e.g., severe chest pain, shortness of breath, acute confusion, or loss of consciousness), call your local emergency services (e.g., 911 or 112) immediately.
              </p>
              <p>
                <strong>5. Demonstration Data:</strong> Doctor profiles, scheduling slots, and product listings in this preview build are sample demonstrations crafted for portfolio and technical evaluation.
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                I Understand and Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
