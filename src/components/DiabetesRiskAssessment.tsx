import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { DiabetesAssessmentInput, DiabetesAssessmentResult } from '../types';
import { predictDiabetesRisk } from '../utils/xgboostModel';

interface DiabetesRiskAssessmentProps {
  onSaveAssessment: (result: DiabetesAssessmentResult) => void;
  onBookDoctor: (doctorSpecialty?: string) => void;
}

export const DiabetesRiskAssessment: React.FC<DiabetesRiskAssessmentProps> = ({
  onSaveAssessment,
  onBookDoctor,
}) => {
  // Assessment Inputs
  const [glucose, setGlucose] = useState<number>(108);
  const [bmi, setBmi] = useState<number>(26.5);
  const [age, setAge] = useState<number>(42);
  const [bloodPressure, setBloodPressure] = useState<number>(80);
  const [insulin, setInsulin] = useState<number>(85);
  const [pregnancies, setPregnancies] = useState<number>(0);
  const [familyHistory, setFamilyHistory] = useState<'none' | 'first-degree' | 'second-degree'>('first-degree');
  const [waistCircumference, setWaistCircumference] = useState<number>(88);
  const [physicalActivity, setPhysicalActivity] = useState<'sedentary' | 'light' | 'moderate' | 'active'>('light');

  // BMI Calculator Helper drawer
  const [showBmiCalc, setShowBmiCalc] = useState<boolean>(false);
  const [heightCm, setHeightCm] = useState<number>(172);
  const [weightKg, setWeightKg] = useState<number>(78);

  // Result state
  const [result, setResult] = useState<DiabetesAssessmentResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  // Quick Preset Handlers
  const applyPreset = (type: 'healthy' | 'borderline' | 'high_risk') => {
    if (type === 'healthy') {
      setGlucose(86);
      setBmi(22.1);
      setAge(28);
      setBloodPressure(72);
      setInsulin(45);
      setFamilyHistory('none');
      setWaistCircumference(76);
      setPhysicalActivity('active');
    } else if (type === 'borderline') {
      setGlucose(114);
      setBmi(27.8);
      setAge(44);
      setBloodPressure(82);
      setInsulin(110);
      setFamilyHistory('first-degree');
      setWaistCircumference(89);
      setPhysicalActivity('light');
    } else {
      setGlucose(165);
      setBmi(34.2);
      setAge(56);
      setBloodPressure(92);
      setInsulin(185);
      setFamilyHistory('first-degree');
      setWaistCircumference(106);
      setPhysicalActivity('sedentary');
    }
    setResult(null);
  };

  const calculateBmi = () => {
    if (heightCm > 0 && weightKg > 0) {
      const heightM = heightCm / 100;
      const calculated = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
      setBmi(calculated);
      setShowBmiCalc(false);
    }
  };

  const handleRunAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);

    // Simulate brief inference delay for UX credibility
    setTimeout(() => {
      const input: DiabetesAssessmentInput = {
        glucose,
        bmi,
        age,
        bloodPressure,
        insulin,
        pregnancies,
        familyHistory,
        waistCircumference,
        physicalActivity,
      };

      const computed = predictDiabetesRisk(input);
      setResult(computed);
      setIsCalculating(false);
      // Automatically record in parent handler
      onSaveAssessment(computed);
      setSavedNotification(true);
      setTimeout(() => setSavedNotification(false), 3000);
    }, 450);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-teal-700 text-xs font-bold tracking-wide uppercase">
              <Activity className="w-4 h-4" />
              <span>XGBoost Gradient Boosted Ensemble</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              AI Diabetes Risk Assessment
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Trained on clinical metabolic parameters from validated epidemiological cohorts. Evaluates non-linear feature interactions, fasting glycemic thresholds, and insulin resistance indicators with full explainability.
            </p>
          </div>

          {/* Quick Preset Buttons for review */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 shrink-0">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quick Test Profiles
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('healthy')}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition-colors cursor-pointer"
              >
                Normal Glycemia
              </button>
              <button
                type="button"
                onClick={() => applyPreset('borderline')}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 text-slate-700 hover:text-amber-700 hover:border-amber-300 transition-colors cursor-pointer"
              >
                Pre-Diabetic
              </button>
              <button
                type="button"
                onClick={() => applyPreset('high_risk')}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-slate-200 text-slate-700 hover:text-rose-700 hover:border-rose-300 transition-colors cursor-pointer"
              >
                Elevated Risk
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs (7 Cols on desktop) */}
        <form
          onSubmit={handleRunAssessment}
          className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Clinical Biomarkers & Risk Inputs
            </h2>
            <span className="text-xs text-slate-400">All fields required for inference</span>
          </div>

          {/* 1. Fasting Plasma Glucose */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <span>Fasting Blood Glucose</span>
                <span className="text-slate-400 font-normal">(mg/dL)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {glucose < 100 ? 'Normal (<100)' : glucose <= 125 ? 'Pre-diabetic (100-125)' : 'Diabetic (≥126)'}
                </span>
                <input
                  type="number"
                  min="60"
                  max="300"
                  value={glucose}
                  onChange={(e) => setGlucose(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-right text-xs font-semibold tabular-nums border border-slate-200 rounded-md focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="65"
              max="240"
              step="1"
              value={glucose}
              onChange={(e) => setGlucose(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 tabular-nums">
              <span>70 (Optimal)</span>
              <span>100 (Threshold)</span>
              <span>126 (Clinical)</span>
              <span>240+ (Severe)</span>
            </div>
          </div>

          {/* 2. BMI with quick toggle calculator */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <span>Body Mass Index (BMI)</span>
                <span className="text-slate-400 font-normal">(kg/m²)</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBmiCalc(!showBmiCalc)}
                  className="text-[11px] font-medium text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Scale className="w-3 h-3" />
                  <span>{showBmiCalc ? 'Close Calc' : 'Calculate BMI'}</span>
                </button>
                <input
                  type="number"
                  step="0.1"
                  min="15"
                  max="55"
                  value={bmi}
                  onChange={(e) => setBmi(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-right text-xs font-semibold tabular-nums border border-slate-200 rounded-md focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Quick BMI calculator popdown */}
            {showBmiCalc && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 animate-in fade-in duration-100">
                <span className="text-xs font-semibold text-slate-700 block">
                  Quick Height & Weight Calculator
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-800"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={calculateBmi}
                  className="w-full py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                >
                  Apply Calculated BMI
                </button>
              </div>
            )}

            <input
              type="range"
              min="16"
              max="45"
              step="0.1"
              value={bmi}
              onChange={(e) => setBmi(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 tabular-nums">
              <span>18.5 (Normal)</span>
              <span>25.0 (Overweight)</span>
              <span>30.0 (Obesity I)</span>
              <span>40.0+ (Severe)</span>
            </div>
          </div>

          {/* 3. Age & Diastolic Blood Pressure Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800">Age</label>
                <span className="text-xs font-semibold text-slate-900 tabular-nums">{age} yrs</span>
              </div>
              <input
                type="range"
                min="18"
                max="85"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800">
                  Diastolic BP <span className="text-slate-400 font-normal">(mmHg)</span>
                </label>
                <span className="text-xs font-semibold text-slate-900 tabular-nums">
                  {bloodPressure} mmHg
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="120"
                value={bloodPressure}
                onChange={(e) => setBloodPressure(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>
          </div>

          {/* 4. Serum Insulin & Waist Circumference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800">
                  Serum Insulin <span className="text-slate-400 font-normal">(μU/mL)</span>
                </label>
                <span className="text-xs font-semibold text-slate-900 tabular-nums">
                  {insulin} μU/mL
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="250"
                value={insulin}
                onChange={(e) => setInsulin(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800">
                  Waist Circumference <span className="text-slate-400 font-normal">(cm)</span>
                </label>
                <span className="text-xs font-semibold text-slate-900 tabular-nums">
                  {waistCircumference} cm
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="140"
                value={waistCircumference}
                onChange={(e) => setWaistCircumference(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>
          </div>

          {/* 5. Family History (Segmented control) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-800 block">
              Family History of Diabetes (Genetic Susceptibility)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'No History' },
                { id: 'second-degree', label: '2nd Degree (Grandparents)' },
                { id: 'first-degree', label: '1st Degree (Parent/Sibling)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFamilyHistory(opt.id as any)}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border transition-all text-center ${
                    familyHistory === opt.id
                      ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Physical Activity Level */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-800 block">
              Weekly Physical Activity
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'sedentary', label: 'Sedentary', sub: '<30 min/wk' },
                { id: 'light', label: 'Light', sub: '30-90 min/wk' },
                { id: 'moderate', label: 'Moderate', sub: '90-150 min/wk' },
                { id: 'active', label: 'Active', sub: '150+ min/wk' },
              ].map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => setPhysicalActivity(act.id as any)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    physicalActivity === act.id
                      ? 'border-teal-600 bg-teal-50 text-teal-900'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-semibold">{act.label}</p>
                  <p className="text-[10px] text-slate-500">{act.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isCalculating}
              className="w-full py-3 px-6 bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Feature Trees...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Compute AI Risk Prediction & Factors</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Results Column (5 Cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {!result ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4">
              <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Awaiting Assessment Inputs</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  Adjust the biomarkers on the left or select a quick test profile, then press "Compute AI Risk Prediction" to view the probabilistic model output and SHAP factor weights.
                </p>
              </div>
              <button
                type="button"
                onClick={() => applyPreset('borderline')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline"
              >
                Or load Pre-Diabetic sample case
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
              {/* Risk Level & Gauge */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Calculated 5-Year Risk</span>
                  <span className="tabular-nums">
                    {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-4 mt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                      {result.riskProbability}%
                    </span>
                    <span className="text-xs font-semibold text-slate-500">probability</span>
                  </div>

                  {/* Classification Badge */}
                  <div
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      result.riskLevel === 'Low'
                        ? 'bg-emerald-100 text-emerald-800'
                        : result.riskLevel === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {result.riskLevel === 'Low' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    <span>{result.riskLevel} Risk</span>
                  </div>
                </div>

                {/* Progress bar visual meter */}
                <div className="mt-4">
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${result.riskProbability}%` }}
                      className={`h-full transition-all duration-500 ${
                        result.riskLevel === 'Low'
                          ? 'bg-emerald-500'
                          : result.riskLevel === 'Medium'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 tabular-nums">
                    <span>0% (Low)</span>
                    <span>25% (Pre-diabetic Alert)</span>
                    <span>60% (High Risk)</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Explainable AI: Feature Contribution / SHAP */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Model Explainability (SHAP Impact)
                  </h4>
                  <span className="text-[11px] text-slate-400">Contribution to Risk</span>
                </div>

                {/* Drivers increasing risk */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-rose-600 block">
                    Factors Increasing Probability:
                  </span>
                  {result.topDrivers.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No significant elevated risk factors.</p>
                  ) : (
                    result.topDrivers.slice(0, 3).map((driver) => (
                      <div
                        key={driver.feature}
                        className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-100 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-slate-900">{driver.label}</span>
                          <span className="text-rose-700 font-semibold tabular-nums">
                            +{Math.round(driver.impactScore * 10)}% impact
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{driver.explanation}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Protective factors */}
                {result.protectiveFactors.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-semibold text-emerald-600 block">
                      Protective Counter-Factors:
                    </span>
                    {result.protectiveFactors.slice(0, 2).map((factor) => (
                      <div
                        key={factor.feature}
                        className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-slate-900">{factor.label}</span>
                          <span className="text-emerald-700 font-semibold tabular-nums">
                            {Math.round(factor.impactScore * 10)}% protection
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{factor.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clinical Interpretation & Actions */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Info className="w-4 h-4 text-teal-700" />
                  <span>Clinical Interpretation</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{result.clinicalSummary}</p>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Recommended Evidence-Based Steps:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                    {result.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => onBookDoctor('Endocrinology & Metabolic Health')}
                  className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Book Consultation with Endocrinologist</span>
                </button>

                {savedNotification && (
                  <div className="p-2 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg text-center border border-emerald-200 flex items-center justify-center gap-1.5">
                    <BookmarkCheck className="w-4 h-4" />
                    <span>Saved to your Patient Dashboard history!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
