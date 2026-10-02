import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Activity,
  Heart,
  Droplets,
  Moon,
  Plus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  Sliders,
  Download,
  Trash2,
  X,
  Gauge,
  Info,
  FileText,
  FileSpreadsheet,
  FileCode,
  Target,
  Edit3,
  RotateCcw,
  Check,
  Award,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  Stethoscope,
  BookmarkCheck,
  ChevronDown,
  ChevronRight,
  Flame,
  Trophy,
  Minus,
  Bell,
  BellRing,
  Bookmark,
  Volume2,
  VolumeX,
  Copy,
  Filter,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { VitalLog, UserProfile } from '../types';

export interface DailyHealthGoals {
  sleepHoursGoal: number; // e.g. 8.0 hours
  heartRateTarget: number; // e.g. 70 bpm
}

export const DEFAULT_DAILY_GOALS: DailyHealthGoals = {
  sleepHoursGoal: 8.0,
  heartRateTarget: 70,
};

export interface ClinicalThresholdConfig {
  hrBradycardiaCritical: number; // < 45 bpm
  hrBradycardiaWarning: number; // < 50 bpm
  hrBradycardiaCaution: number; // < 60 bpm
  hrTachycardiaCaution: number; // > 90 bpm
  hrTachycardiaWarning: number; // > 100 bpm (AHA normal resting upper limit)
  hrTachycardiaCritical: number; // > 120 bpm (marked resting tachycardia)
  spo2Caution: number; // < 95% (normal is 95-100%)
  spo2Warning: number; // < 92% (moderate hypoxemia per WHO)
  spo2Critical: number; // < 88% (severe hypoxemia per WHO/ATS)
}

export const CLINICAL_THRESHOLDS: ClinicalThresholdConfig = {
  hrBradycardiaCritical: 45,
  hrBradycardiaWarning: 50,
  hrBradycardiaCaution: 60,
  hrTachycardiaCaution: 90,
  hrTachycardiaWarning: 100,
  hrTachycardiaCritical: 120,
  spo2Caution: 95,
  spo2Warning: 92,
  spo2Critical: 88,
};

export interface ThresholdAlert {
  id: string;
  metric: 'heart_rate' | 'oxygen_saturation' | 'both';
  severity: 'critical' | 'warning' | 'caution';
  title: string;
  message: string;
  currentValues: {
    heartRate?: number;
    oxygenSaturation?: number;
  };
  healthyRangeText: string;
  guidelineReference: string;
  clinicalRecommendation: string;
  timestamp: string;
}

export const evaluateVitalThresholds = (
  hr: number,
  spo2: number,
  timestamp?: string
): ThresholdAlert | null => {
  const isHrCriticalHigh = hr >= CLINICAL_THRESHOLDS.hrTachycardiaCritical;
  const isHrWarningHigh = hr > CLINICAL_THRESHOLDS.hrTachycardiaWarning;
  const isHrCriticalLow = hr < CLINICAL_THRESHOLDS.hrBradycardiaCritical;
  const isHrWarningLow = hr < CLINICAL_THRESHOLDS.hrBradycardiaWarning;
  const isHrCaution = hr > CLINICAL_THRESHOLDS.hrTachycardiaCaution || (hr >= 50 && hr < 60);

  const isSpo2Critical = spo2 <= CLINICAL_THRESHOLDS.spo2Critical;
  const isSpo2Warning = spo2 < CLINICAL_THRESHOLDS.spo2Warning;
  const isSpo2Caution = spo2 < CLINICAL_THRESHOLDS.spo2Caution;

  const hrOutOfRange = isHrWarningHigh || isHrWarningLow || isHrCriticalHigh || isHrCriticalLow;
  const spo2OutOfRange = isSpo2Warning || isSpo2Critical;

  if (!hrOutOfRange && !spo2OutOfRange && !isHrCaution && !isSpo2Caution) {
    return null;
  }

  const alertTime = timestamp || new Date().toISOString();

  // Dual out of range alert
  if ((hrOutOfRange || isHrCaution) && (spo2OutOfRange || isSpo2Caution)) {
    const isCritical = isHrCriticalHigh || isHrCriticalLow || isSpo2Critical;
    const isWarning = isHrWarningHigh || isHrWarningLow || isSpo2Warning;
    const severity = isCritical ? 'critical' : isWarning ? 'warning' : 'caution';

    return {
      id: `alert_dual_${Date.now()}`,
      metric: 'both',
      severity,
      title: isCritical
        ? 'Critical Clinical Alert: Heart Rate & Oxygen Saturation Out of Healthy Bounds'
        : 'Medical Threshold Warning: Resting Pulse & Oxygen Deviating from Healthy Guidelines',
      message: `Resting heart rate (${hr} bpm) and arterial oxygen saturation (${spo2}%) fall outside standard medical thresholds.`,
      currentValues: { heartRate: hr, oxygenSaturation: spo2 },
      healthyRangeText: 'Healthy Guidelines: Resting Heart Rate 60–100 bpm (AHA) · SpO2 95–100% (WHO)',
      guidelineReference: 'American Heart Association (AHA) & World Health Organization (WHO) Standards',
      clinicalRecommendation: isCritical
        ? 'Seek immediate urgent medical evaluation. Sit upright in high-Fowler position, administer supplemental oxygen if clinically prescribed, and cease all physical activity.'
        : 'Sit comfortably, practice slow diaphragmatic breathing (in for 4s, out for 6s), hydrate, and recheck readings in 5 minutes. If symptoms like shortness of breath persist, consult your physician.',
      timestamp: alertTime,
    };
  }

  // Heart Rate Out of Range
  if (hrOutOfRange || isHrCaution) {
    if (isHrCriticalHigh) {
      return {
        id: `alert_hr_${Date.now()}`,
        metric: 'heart_rate',
        severity: 'critical',
        title: 'Critical Tachycardia Alert: Resting Heart Rate ≥ 120 bpm',
        message: `Resting heart rate of ${hr} bpm is significantly elevated, exceeding normal resting upper limits and indicating pronounced tachycardia.`,
        currentValues: { heartRate: hr },
        healthyRangeText: 'Standard Adult Resting Heart Rate: 60–100 bpm (AHA Guidelines)',
        guidelineReference: 'American College of Cardiology (ACC) / AHA Tachycardia Standards',
        clinicalRecommendation:
          'Cease all exertion immediately. Sit calmly, drink water to address possible dehydration, and seek immediate healthcare evaluation if palpitations, chest pressure, or dizziness occur.',
        timestamp: alertTime,
      };
    }
    if (isHrWarningHigh) {
      return {
        id: `alert_hr_${Date.now()}`,
        metric: 'heart_rate',
        severity: 'warning',
        title: 'Tachycardia Warning: Elevated Resting Pulse (>100 bpm)',
        message: `Resting pulse of ${hr} bpm exceeds the healthy resting threshold of 100 bpm, increasing myocardial oxygen consumption.`,
        currentValues: { heartRate: hr },
        healthyRangeText: 'Healthy Adult Resting Zone: 60–100 bpm',
        guidelineReference: 'American Heart Association (AHA) Clinical Reference',
        clinicalRecommendation:
          'Sit in a quiet room, avoid caffeine, perform 5 minutes of calm breathing, and re-test. Contact a clinician if resting pulse remains above 100 bpm.',
        timestamp: alertTime,
      };
    }
    if (isHrCriticalLow) {
      return {
        id: `alert_hr_${Date.now()}`,
        metric: 'heart_rate',
        severity: 'critical',
        title: 'Severe Bradycardia Alert: Resting Pulse < 45 bpm',
        message: `Resting heart rate of ${hr} bpm is markedly depressed. Unless an elite endurance athlete, this may indicate sinus node or conduction dysfunction.`,
        currentValues: { heartRate: hr },
        healthyRangeText: 'Healthy Adult Resting Heart Rate: 60–100 bpm (Athletic Baseline: 50–60 bpm)',
        guidelineReference: 'AHA / ACC / HRS Guidelines for Bradycardia Evaluation',
        clinicalRecommendation:
          'Sit down to prevent falls or syncope. If accompanied by lightheadedness, fatigue, or cold clammy skin, seek urgent medical assessment.',
        timestamp: alertTime,
      };
    }
    if (isHrWarningLow) {
      return {
        id: `alert_hr_${Date.now()}`,
        metric: 'heart_rate',
        severity: 'warning',
        title: 'Bradycardia Caution: Resting Pulse < 50 bpm',
        message: `Resting heart rate of ${hr} bpm is below the standard healthy resting threshold of 60 bpm.`,
        currentValues: { heartRate: hr },
        healthyRangeText: 'Healthy Adult Resting Heart Rate: 60–100 bpm',
        guidelineReference: 'AHA Clinical Reference for Resting Heart Rate',
        clinicalRecommendation:
          'Assess whether you feel dizzy or fatigued. If you are not in intensive endurance training or taking chronotropic medications (e.g. beta-blockers), notify your healthcare provider.',
        timestamp: alertTime,
      };
    }
    return {
      id: `alert_hr_${Date.now()}`,
      metric: 'heart_rate',
      severity: 'caution',
      title: 'Borderline Resting Heart Rate',
      message: `Resting heart rate is ${hr} bpm, hovering outside optimal zones.`,
      currentValues: { heartRate: hr },
      healthyRangeText: 'Optimal Resting Zone: 60–80 bpm',
      guidelineReference: 'AHA Heart Rate Telemetry Guidance',
      clinicalRecommendation: 'Monitor rest and hydration over the next 24 hours.',
      timestamp: alertTime,
    };
  }

  // SpO2 Out of Range
  if (isSpo2Critical) {
    return {
      id: `alert_spo2_${Date.now()}`,
      metric: 'oxygen_saturation',
      severity: 'critical',
      title: 'Critical Hypoxemia Alert: Arterial SpO2 ≤ 88%',
      message: `Arterial oxygen saturation of ${spo2}% indicates severe respiratory desaturation requiring immediate intervention.`,
      currentValues: { oxygenSaturation: spo2 },
      healthyRangeText: 'Normal Arterial Oxygen Saturation: 95–100% (WHO Standards)',
      guidelineReference: 'World Health Organization (WHO) & ATS Pulse Oximetry Guidelines',
      clinicalRecommendation:
        'Immediate emergency medical evaluation required. Sit fully upright (high-Fowler position), loosen constrictive clothing, and initiate supplemental oxygen if prescribed.',
      timestamp: alertTime,
    };
  }
  if (isSpo2Warning) {
    return {
      id: `alert_spo2_${Date.now()}`,
      metric: 'oxygen_saturation',
      severity: 'warning',
      title: 'Moderate Hypoxemia Warning: SpO2 < 92%',
      message: `Blood oxygen saturation is ${spo2}%, falling below the clinical safe threshold of 92%.`,
      currentValues: { oxygenSaturation: spo2 },
      healthyRangeText: 'Standard Clinical Saturation: 95–100%',
      guidelineReference: 'WHO Clinical Oximetry Benchmarks',
      clinicalRecommendation:
        'Adjust posture to upright seated position, practice slow deep diaphragmatic breathing, ensure fingers are warm and free of nail polish, and re-test. Consult your care team if saturation persists under 92%.',
      timestamp: alertTime,
    };
  }
  return {
    id: `alert_spo2_${Date.now()}`,
    metric: 'oxygen_saturation',
    severity: 'caution',
    title: 'Mild Oxygen Desaturation: SpO2 92–94%',
    message: `Blood oxygen saturation is ${spo2}%, slightly below optimal 95–100% saturation.`,
    currentValues: { oxygenSaturation: spo2 },
    healthyRangeText: 'Optimal Oxygen Saturation: 95–100%',
    guidelineReference: 'WHO Clinical Oximetry Standards',
    clinicalRecommendation:
      'Perform several deep calm breaths, verify proper sensor placement, and re-measure while resting quietly.',
    timestamp: alertTime,
  };
};

export interface WeeklyGoalAchievement {
  weekId: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  dateRangeLabel: string;
  relativeLabel: string;
  totalLogs: number;
  sleepHoursAvg: number;
  sleepGoalTarget: number;
  sleepDaysMet: number;
  sleepTotalDays: number;
  sleepCompliancePercent: number;
  sleepStatus: 'achieved' | 'near' | 'deficit';
  heartRateAvg: number;
  heartRateCeiling: number;
  hrDaysMet: number;
  hrTotalDays: number;
  hrCompliancePercent: number;
  hrStatus: 'maintained' | 'borderline' | 'elevated';
  compositeScore: number;
  tier: 'gold' | 'silver' | 'bronze' | 'attention';
  statusLabel: string;
  clinicalAccountabilityNote: string;
  dailyBreakdown: {
    dayName: string;
    dateLabel: string;
    sleepHours: number;
    sleepMet: boolean;
    heartRate: number;
    hrMet: boolean;
  }[];
}

export interface GoalAchievementNotification {
  id: string;
  goalType: 'sleep' | 'heart_rate' | 'both';
  title: string;
  encouragingTip: string;
  tipHeadline: string;
  metricSummary: string;
  timestamp: string;
  read: boolean;
  bookmarked?: boolean;
}

export const ENCOURAGING_TIPS_LIBRARY: Record<
  'sleep' | 'heart_rate' | 'both',
  { title: string; tip: string; clinicalBenefit: string }[]
> = {
  sleep: [
    {
      title: 'Circadian Champion!',
      tip: 'Achieving consistent 7.5+ hours of restorative rest lowers systemic cortisol, optimizes metabolic insulin sensitivity, and accelerates nocturnal cellular repair.',
      clinicalBenefit: 'Promotes deep non-REM slow-wave recovery and vascular rejuvenation.',
    },
    {
      title: 'Sleep Architecture Mastered!',
      tip: 'Reaching your sleep target helps preserve optimal REM cognitive cycles—sharpening executive memory consolidation and daytime alertness.',
      clinicalBenefit: 'Enhances prefrontal cortex neuroplasticity and emotional resilience.',
    },
    {
      title: 'Immune & Cellular Triumph!',
      tip: 'Restorative sleep stimulates cytokine release and primes cytotoxic T-lymphocytes, strengthening your body’s immunological defenses.',
      clinicalBenefit: 'Improves innate pathogen resistance and reduces chronic low-grade inflammation.',
    },
    {
      title: 'Cardiovascular Rest Restored!',
      tip: 'During deep restorative sleep, your blood pressure naturally dips (healthy nocturnal dipping), easing strain on the myocardial muscle.',
      clinicalBenefit: 'Safeguards arterial elasticity and promotes nighttime parasympathetic dominance.',
    },
    {
      title: 'Metabolic Balance Maintained!',
      tip: 'Adequate sleep regulates ghrelin and leptin signaling, curbing sugar cravings and sustaining steady daytime mitochondrial energy.',
      clinicalBenefit: 'Balances glycemic regulation and reduces sympathetic burnout.',
    },
  ],
  heart_rate: [
    {
      title: 'Cardiovascular Equilibrium!',
      tip: 'Maintaining your resting heart rate at or below target reflects optimal ventricular stroke volume and healthy parasympathetic autonomic balance.',
      clinicalBenefit: 'Reduces myocardial workload and preserves long-term cardiac output efficiency.',
    },
    {
      title: 'Vascular Peace & Calm!',
      tip: 'A serene resting pulse minimizes hemodynamic shear strain on endothelial blood vessel walls, keeping circulation smooth and resilient.',
      clinicalBenefit: 'Protects arterial endothelium and supports normotensive homeostasis.',
    },
    {
      title: 'Autonomic Vagal Resilience!',
      tip: 'Sustaining a calm baseline pulse signals excellent vagus nerve tone and efficient physiological recovery from daily cognitive and physical stressors.',
      clinicalBenefit: 'Improves Heart Rate Variability (HRV) and autonomic responsiveness.',
    },
    {
      title: 'Aerobic Reserve Preserved!',
      tip: 'By conserving energy at rest with an efficient pulse, your heart retains greater aerobic reserve for exercise, movement, and peak daily focus.',
      clinicalBenefit: 'Optimizes myocardial oxygen extraction and physical endurance.',
    },
    {
      title: 'Steady Cardiac Harmony!',
      tip: 'Your resting baseline is in an ideal zone—a strong sign that your hydration, rest, and cardiovascular conditioning are harmonizing beautifully.',
      clinicalBenefit: 'Stabilizes chronotropic regulation and reduces cardiovascular stress markers.',
    },
  ],
  both: [
    {
      title: 'Dual Target Triumph!',
      tip: 'You conquered both your sleep restoration and resting pulse targets today! Your circadian and cardiovascular systems are working in prime biometric synergy.',
      clinicalBenefit: 'Achieves multi-system biological homeostasis and high clinical wellness score.',
    },
    {
      title: 'Peak Biometric Mastery!',
      tip: 'Optimal sleep combined with a calm, efficient resting heart rate puts you in the top tier of preventive health dedication. Outstanding dedication to your body!',
      clinicalBenefit: 'Maximizes nocturnal parasympathetic reset and daytime cardiac efficiency.',
    },
    {
      title: 'Cardio-Circadian Synergy!',
      tip: 'Deep restorative sleep directly reduces resting sympathetic tone, keeping your pulse steady and tranquil. You have mastered your daily recovery loop!',
      clinicalBenefit: 'Reduces cardiovascular event risk and enhances cellular mitochondrial vitality.',
    },
  ],
};

export interface AIHealthTip {
  title: string;
  category: string;
  guidelineRef: string;
  action: string;
  benefit: string;
}

export interface AIHealthInsightData {
  overallAssessment: string;
  riskLevel: 'Optimal' | 'Low Risk' | 'Moderate' | 'Attention Needed' | string;
  keyObservations: string[];
  personalizedTips: AIHealthTip[];
  lifestyleAdvice: string;
  safetyFlags: string[];
  generatedAt?: string;
  source?: 'ai' | 'guideline_engine';
}

export function getDeterministicClinicalInsights(
  user: UserProfile,
  latestVital: VitalLog,
  avgHr: number,
  avgSpo2: number,
  avgSleep: number
): AIHealthInsightData {
  const tips: AIHealthTip[] = [];
  const observations: string[] = [];

  // 1. Cardiovascular Tip
  if (latestVital.heartRate > 80) {
    observations.push(`Resting heart rate of ${latestVital.heartRate} bpm is elevated above optimal resting threshold (<80 bpm).`);
    tips.push({
      title: 'Targeted Aerobic Pacing & Vagal Tone',
      category: 'Cardiovascular',
      guidelineRef: 'AHA 2023 Physical Activity Guidelines',
      action: 'Incorporate 20-30 minutes of low-intensity steady-state zone 2 aerobic walking and diaphragmatic 4-7-8 breathing exercises daily.',
      benefit: 'Enhances parasympathetic tone, decreases sympathetic drive, and lowers resting pulse over a 2-4 week window.',
    });
  } else {
    observations.push(`Resting heart rate at ${latestVital.heartRate} bpm demonstrates stable sinus rhythm within optimal adult baseline (60-80 bpm).`);
    tips.push({
      title: 'Maintain Cardiovascular Conditioning',
      category: 'Cardiovascular',
      guidelineRef: 'AHA / ACC Preventive Guidelines',
      action: 'Continue aiming for at least 150 minutes of moderate-intensity aerobic exercise per week split over 4-5 days.',
      benefit: 'Sustains optimal stroke volume, stabilizes arterial compliance, and reduces lifetime cardiovascular disease risk.',
    });
  }

  // 2. Sleep Architecture Tip
  if (latestVital.sleepHours < 7) {
    observations.push(`Recorded sleep duration of ${latestVital.sleepHours}h is below the 7-9h restorative window recommended for adult circadian repair.`);
    tips.push({
      title: 'Circadian Phase Anchoring & Sleep Hygiene',
      category: 'Circadian Sleep',
      guidelineRef: 'National Sleep Foundation (NSF) Consensus',
      action: 'Establish a strict 30-minute digital wind-down routine, dim ambient lighting, and keep room temperature between 65-68°F (18-20°C).',
      benefit: 'Stimulates endogenous melatonin secretion, prolongs slow-wave deep sleep, and accelerates cellular recovery.',
    });
  } else {
    observations.push(`Sleep duration of ${latestVital.sleepHours}h meets target restorative duration for metabolic recovery.`);
    tips.push({
      title: 'Protect Deep Sleep Cycles',
      category: 'Circadian Sleep',
      guidelineRef: 'National Sleep Foundation (NSF)',
      action: 'Maintain regular bed and wake times within a 30-minute variance window even on weekends.',
      benefit: 'Synchronizes master suprachiasmatic circadian pacemaker, supporting glucose homeostasis and immune function.',
    });
  }

  // 3. Respiratory / SpO2 Tip
  if (latestVital.oxygenSaturation < 95) {
    observations.push(`Blood oxygen saturation at ${latestVital.oxygenSaturation}% is below normal ambient baseline (≥95%).`);
    tips.push({
      title: 'Prone Breathing & Respiratory Re-check',
      category: 'Pulmonary',
      guidelineRef: 'WHO Pulse Oximetry Guidelines',
      action: 'Warm peripheral fingers, sit upright or walk briefly, and repeat pulse oximetry check after 10 deep breaths.',
      benefit: 'Eliminates poor peripheral perfusion artifacts and maximizes alveolar functional residual capacity.',
    });
  } else {
    observations.push(`Peripheral oxygen saturation (SpO2) at ${latestVital.oxygenSaturation}% indicates optimal pulmonary gas exchange.`);
    tips.push({
      title: 'Diaphragmatic Breathwork Protocol',
      category: 'Respiratory',
      guidelineRef: 'American Thoracic Society Guidelines',
      action: 'Practice 5 minutes of box breathing (4s inhale, 4s hold, 4s exhale, 4s hold) during mid-day transition periods.',
      benefit: 'Improves oxygenation efficiency, reduces cortisol levels, and strengthens diaphragm musculature.',
    });
  }

  // 4. Blood Pressure / Lifestyle Tip
  const sys = latestVital.bloodPressureSystolic || 118;
  const dia = latestVital.bloodPressureDiastolic || 76;
  if (sys >= 130 || dia >= 85) {
    observations.push(`Blood pressure reading (${sys}/${dia} mmHg) shows mild elevation into Stage 1 monitoring range.`);
    tips.push({
      title: 'DASH Dietary Sodium Modulation',
      category: 'Blood Pressure',
      guidelineRef: 'AHA / ACC Hypertension Guidelines',
      action: 'Reduce dietary sodium to under 2,000 mg/day, increase potassium-rich leafy greens, and avoid caffeine 4 hours before bedtime.',
      benefit: 'Reduces vascular peripheral resistance and lowers systolic blood pressure by 4-8 mmHg.',
    });
  } else {
    observations.push(`Blood pressure at ${sys}/${dia} mmHg reflects healthy normotensive vascular pressure.`);
    tips.push({
      title: 'Arterial Elasticity & Daily Hydration',
      category: 'Recovery',
      guidelineRef: 'WHO Hydration & Metabolic Standards',
      action: 'Target 2.0 to 2.5 liters of water daily, spaced evenly throughout morning and afternoon hours.',
      benefit: 'Maintains optimal blood viscosity, facilitates renal filtration, and prevents orthostatic dizziness.',
    });
  }

  return {
    overallAssessment: `Biometric evaluation for ${user.name} indicates generally stable cardiopulmonary parameters with an average resting heart rate of ${avgHr} bpm and ${avgSleep} hours average sleep. Maintaining consistent circadian schedules and targeted aerobic pacing will optimize longitudinal recovery.`,
    riskLevel:
      latestVital.oxygenSaturation < 94 || latestVital.heartRate > 95
        ? 'Attention Needed'
        : latestVital.sleepHours < 6.5 || (latestVital.bloodPressureSystolic && latestVital.bloodPressureSystolic >= 130)
        ? 'Moderate'
        : 'Optimal',
    keyObservations: observations,
    personalizedTips: tips,
    lifestyleAdvice:
      'Emphasize daytime natural light exposure within 1 hour of waking, maintain consistent hydration, and avoid blue-spectrum digital screens 45 minutes before sleep.',
    safetyFlags: [
      'Seek prompt medical evaluation if you experience persistent resting tachycardia (>100 bpm), chest discomfort, or unexplained shortness of breath.',
      'Pulse oximeter readings consistently below 94% on multiple fingers warrant immediate physician consult.',
    ],
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    source: 'guideline_engine',
  };
}

interface HealthMetricsPanelProps {
  currentUser: UserProfile;
  vitals: VitalLog[];
  onAddVitalLog: (log: Omit<VitalLog, 'id'>) => void;
  onDeleteVitalLog: (id: string) => void;
  onResetDefaultVitals?: () => void;
}

export const HealthMetricsPanel: React.FC<HealthMetricsPanelProps> = ({
  currentUser,
  vitals,
  onAddVitalLog,
  onDeleteVitalLog,
  onResetDefaultVitals,
}) => {
  // Active Trend Chart Metric
  const [selectedChartMetric, setSelectedChartMetric] = useState<'heartRate' | 'oxygen' | 'sleep'>('heartRate');

  // Manual Log Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Download Health Report Modal & Dropdown
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);

  // Close download dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(event.target as Node)) {
        setIsDownloadDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDownloadDropdownOpen(false);
      }
    };
    if (isDownloadDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDownloadDropdownOpen]);

  // Live Sensor Simulation State
  const [isLiveSimulating, setIsLiveSimulating] = useState(false);
  const [isScanningSensor, setIsScanningSensor] = useState(false);
  const [scanStepMessage, setScanStepMessage] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Daily Goals State (persisted to localStorage)
  const [dailyGoals, setDailyGoals] = useState<DailyHealthGoals>(() => {
    try {
      const stored = localStorage.getItem('hc_hub_daily_goals');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.sleepHoursGoal === 'number' && typeof parsed.heartRateTarget === 'number') {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_DAILY_GOALS;
  });

  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [tempSleepGoal, setTempSleepGoal] = useState<number>(dailyGoals.sleepHoursGoal);
  const [tempHeartRateGoal, setTempHeartRateGoal] = useState<number>(dailyGoals.heartRateTarget);

  useEffect(() => {
    try {
      localStorage.setItem('hc_hub_daily_goals', JSON.stringify(dailyGoals));
    } catch {
      // ignore storage errors
    }
  }, [dailyGoals]);

  const handleSaveGoals = () => {
    const validatedSleep = Math.max(4, Math.min(12, parseFloat(Number(tempSleepGoal).toFixed(1)) || 8));
    const validatedHr = Math.max(50, Math.min(100, Math.round(Number(tempHeartRateGoal)) || 70));
    setDailyGoals({
      sleepHoursGoal: validatedSleep,
      heartRateTarget: validatedHr,
    });
    setIsEditingGoals(false);
    showToast('Daily health targets updated and saved!', 'success');
  };

  const handleResetGoals = () => {
    setTempSleepGoal(DEFAULT_DAILY_GOALS.sleepHoursGoal);
    setTempHeartRateGoal(DEFAULT_DAILY_GOALS.heartRateTarget);
    setDailyGoals(DEFAULT_DAILY_GOALS);
    setIsEditingGoals(false);
    showToast('Goals reset to clinical recommendations (8.0h sleep, 70 bpm).', 'info');
  };

  // Form State for Manual Logging
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().slice(0, 16));
  const [formHeartRate, setFormHeartRate] = useState<number>(72);
  const [formOxygen, setFormOxygen] = useState<number>(98);
  const [formSleepHours, setFormSleepHours] = useState<number>(7.5);
  const [formSleepQuality, setFormSleepQuality] = useState<'poor' | 'fair' | 'good' | 'optimal'>('good');
  const [formBpSystolic, setFormBpSystolic] = useState<number>(118);
  const [formBpDiastolic, setFormBpDiastolic] = useState<number>(76);
  const [formNotes, setFormNotes] = useState<string>('');

  // Table Filter
  const [filterSource, setFilterSource] = useState<'all' | 'simulated' | 'manual'>('all');

  // Live fluctuating sensor reading state (when live simulation is on)
  const [livePulse, setLivePulse] = useState<number>(72);
  const [liveSpO2, setLiveSpO2] = useState<number>(98);
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Latest Vital Record
  const latestVital = vitals[0] || {
    id: 'fallback',
    timestamp: new Date().toISOString(),
    heartRate: 72,
    oxygenSaturation: 98,
    sleepHours: 7.5,
    sleepQuality: 'good',
    bloodPressureSystolic: 118,
    bloodPressureDiastolic: 76,
    source: 'simulated_sensor',
    notes: 'Initial resting reference baseline',
  };

  // Keep live pulse around latest recorded value
  useEffect(() => {
    if (!isLiveSimulating) {
      setLivePulse(latestVital.heartRate);
      setLiveSpO2(latestVital.oxygenSaturation);
    }
  }, [latestVital.heartRate, latestVital.oxygenSaturation, isLiveSimulating]);

  // Handle continuous live sensor stream simulation
  useEffect(() => {
    if (isLiveSimulating) {
      liveIntervalRef.current = setInterval(() => {
        // Natural physiological variation (+- 1-3 bpm, +- 1% SpO2)
        setLivePulse((prev) => {
          const delta = (Math.random() - 0.5) * 4;
          const next = Math.round(Math.max(58, Math.min(105, prev + delta)));
          return next;
        });

        setLiveSpO2((prev) => {
          const delta = (Math.random() - 0.5) * 1.5;
          const next = Math.round(Math.max(95, Math.min(100, prev + delta)));
          return next;
        });
      }, 2500);
    } else {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
    }

    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
    };
  }, [isLiveSimulating]);

  // Toast feedback helper
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4000);
  };

  // Trigger Mock Wearable Sensor Scan
  const handleTriggerSensorScan = () => {
    if (isScanningSensor) return;
    setIsScanningSensor(true);
    setScanStepMessage('Initiating Bluetooth PPG Sensor Handshake...');

    setTimeout(() => {
      setScanStepMessage('Measuring optical reflectance & photoplethysmogram pulse...');
    }, 800);

    setTimeout(() => {
      setScanStepMessage('Calculating SpO2 absorption ratio (660nm / 940nm)...');
    }, 1600);

    setTimeout(() => {
      // Generate realistic reading with slight random healthy offset
      const generatedHr = Math.floor(68 + Math.random() * 10); // 68 - 77 bpm
      const generatedSpo2 = Math.random() > 0.2 ? 98 : 99; // 98 - 99%
      const generatedSleep = parseFloat((7.0 + Math.random() * 1.4).toFixed(1)); // 7.0 - 8.4 hrs
      const generatedSys = Math.floor(116 + Math.random() * 6);
      const generatedDia = Math.floor(74 + Math.random() * 5);

      onAddVitalLog({
        timestamp: new Date().toISOString(),
        heartRate: generatedHr,
        oxygenSaturation: generatedSpo2,
        sleepHours: generatedSleep,
        sleepQuality: generatedSleep >= 7.5 ? 'optimal' : 'good',
        bloodPressureSystolic: generatedSys,
        bloodPressureDiastolic: generatedDia,
        source: 'simulated_sensor',
        notes: `Automated optical sensor scan · BLE connected · Signal Quality 99%`,
      });

      setLivePulse(generatedHr);
      setLiveSpO2(generatedSpo2);
      setIsScanningSensor(false);
      setScanStepMessage('');
      showToast(`Sensor Sync Complete: ${generatedHr} bpm · ${generatedSpo2}% SpO2 captured!`, 'success');
    }, 2400);
  };

  // Handle Manual Log Submission
  const handleSubmitManualLog = (e: React.FormEvent) => {
    e.preventDefault();

    if (formHeartRate < 35 || formHeartRate > 220) {
      alert('Please enter a realistic heart rate between 35 and 220 bpm.');
      return;
    }
    if (formOxygen < 70 || formOxygen > 100) {
      alert('Please enter an oxygen saturation percentage between 70% and 100%.');
      return;
    }
    if (formSleepHours < 0 || formSleepHours > 24) {
      alert('Please enter sleep hours between 0 and 24.');
      return;
    }

    onAddVitalLog({
      timestamp: new Date(formDate).toISOString(),
      heartRate: formHeartRate,
      oxygenSaturation: formOxygen,
      sleepHours: formSleepHours,
      sleepQuality: formSleepQuality,
      bloodPressureSystolic: formBpSystolic || undefined,
      bloodPressureDiastolic: formBpDiastolic || undefined,
      source: 'manual_entry',
      notes: formNotes.trim() || 'Manual vitals log entry',
    });

    setIsLogModalOpen(false);
    setFormNotes('');
    showToast('New clinical vitals record saved to your health profile!', 'success');
  };

  // Statistical calculations
  const stats = useMemo(() => {
    if (!vitals.length) {
      return {
        avgHr: 72,
        minHr: 68,
        maxHr: 76,
        avgSpo2: 98,
        avgSleep: 7.5,
        totalLogs: 0,
      };
    }
    const hrValues = vitals.map((v) => v.heartRate);
    const spo2Values = vitals.map((v) => v.oxygenSaturation);
    const sleepValues = vitals.map((v) => v.sleepHours);

    const avgHr = Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length);
    const minHr = Math.min(...hrValues);
    const maxHr = Math.max(...hrValues);
    const avgSpo2 = parseFloat((spo2Values.reduce((a, b) => a + b, 0) / spo2Values.length).toFixed(1));
    const avgSleep = parseFloat((sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length).toFixed(1));

    return {
      avgHr,
      minHr,
      maxHr,
      avgSpo2,
      avgSleep,
      totalLogs: vitals.length,
    };
  }, [vitals]);

  // 7-day chronological points for charting
  const chartData = useMemo(() => {
    // Reverse so oldest is left, latest is right (up to 7 logs)
    const slice = [...vitals].slice(0, 7).reverse();
    return slice.map((item) => {
      const d = new Date(item.timestamp);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      return {
        id: item.id,
        label,
        heartRate: item.heartRate,
        oxygen: item.oxygenSaturation,
        sleep: item.sleepHours,
        rawDate: item.timestamp,
        source: item.source,
      };
    });
  }, [vitals]);

  // Filtered logs for history table
  const filteredLogs = useMemo(() => {
    if (filterSource === 'all') return vitals;
    if (filterSource === 'simulated') return vitals.filter((v) => v.source === 'simulated_sensor');
    return vitals.filter((v) => v.source === 'manual_entry');
  }, [vitals, filterSource]);

  // Download Health Report in CSV, JSON, or PDF
  const handleDownloadReport = (
    format: 'csv' | 'json' | 'pdf',
    customRecords?: VitalLog[],
    exportLabel?: string
  ) => {
    const recordsToExport = customRecords && customRecords.length ? customRecords : vitals;
    if (!recordsToExport.length) {
      showToast('No vitals records available to export.', 'info');
      return;
    }

    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = currentUser.name.replace(/\s+/g, '_');

    if (format === 'csv') {
      const avgHr = Math.round(
        recordsToExport.reduce((acc, v) => acc + (v.heartRate || 70), 0) / recordsToExport.length
      );
      const avgSpo2 = parseFloat(
        (
          recordsToExport.reduce((acc, v) => acc + (v.oxygenSaturation || 98), 0) / recordsToExport.length
        ).toFixed(1)
      );
      const avgSleep = parseFloat(
        (
          recordsToExport.reduce((acc, v) => acc + (v.sleepHours || 7.5), 0) / recordsToExport.length
        ).toFixed(1)
      );

      const metadataRows = [
        ['# CLINICAL HEALTH METRICS & BIOMETRIC TELEMETRY REPORT'],
        [`# Patient Name: ${currentUser.name}`],
        [`# Patient ID: ${currentUser.id}`],
        [`# Demographics: Age ${currentUser.age} | Gender: ${currentUser.gender} | Blood Group: ${currentUser.bloodType}`],
        [`# Primary Clinical Focus: ${currentUser.primaryCondition || 'General Health Monitoring'}`],
        [`# Export Scope: ${exportLabel || 'Complete Personal Vitals History'}`],
        [`# Report Generated: ${new Date().toISOString()}`],
        [`# Total Records Exported: ${recordsToExport.length}`],
        [`# Average Resting Heart Rate: ${avgHr} bpm (Range: ${stats.minHr} - ${stats.maxHr} bpm)`],
        [`# Average Oxygen Saturation (SpO2): ${avgSpo2}%`],
        [`# Average Sleep Duration: ${avgSleep} hrs/night`],
        [],
      ];

      const headers = [
        'Record ID',
        'ISO Timestamp',
        'Formatted Date & Time',
        'Telemetry Source',
        'Heart Rate (bpm)',
        'Heart Rate Evaluation',
        'SpO2 (%)',
        'Oxygenation Status',
        'Sleep Duration (hours)',
        'Sleep Architecture Quality',
        'BP Systolic (mmHg)',
        'BP Diastolic (mmHg)',
        'Mean Arterial Pressure MAP (mmHg)',
        'Clinical Notes',
      ];

      const dataRows = recordsToExport.map((v) => {
        const hrEval =
          v.heartRate < 60
            ? 'Bradycardia / Low'
            : v.heartRate <= 100
            ? 'Normal Resting'
            : 'Tachycardia / Elevated';
        const spo2Eval =
          v.oxygenSaturation >= 95
            ? 'Optimal Saturation'
            : v.oxygenSaturation >= 92
            ? 'Mild/Moderate Hypoxemia'
            : 'Critical Hypoxemia';
        const mapValue =
          v.bloodPressureSystolic && v.bloodPressureDiastolic
            ? Math.round(v.bloodPressureDiastolic + (v.bloodPressureSystolic - v.bloodPressureDiastolic) / 3)
            : '';

        return [
          v.id,
          v.timestamp,
          `"${new Date(v.timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}"`,
          v.source === 'simulated_sensor' ? 'Simulated Sensor (BLE)' : 'Manual Clinical Entry',
          v.heartRate,
          `"${hrEval}"`,
          v.oxygenSaturation,
          `"${spo2Eval}"`,
          v.sleepHours,
          `"${v.sleepQuality || 'good'}"`,
          v.bloodPressureSystolic || '',
          v.bloodPressureDiastolic || '',
          mapValue,
          `"${(v.notes || '').replace(/"/g, '""')}"`,
        ];
      });

      const csvContent = [
        ...metadataRows.map((r) => r.join(',')),
        headers.join(','),
        ...dataRows.map((r) => r.join(',')),
      ].join('\n');

      // Prefix with UTF-8 BOM (\uFEFF) for optimal Excel and spreadsheet compatibility
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Health_Vitals_History_${safeName}_${timestampStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(
        `Downloaded ${recordsToExport.length} vitals log${recordsToExport.length === 1 ? '' : 's'} as CSV for personal records!`,
        'success'
      );
    } else if (format === 'json') {
      const reportPayload = {
        reportTitle: 'Personalized Clinical Health Metrics & Vitals Telemetry Report',
        generatedAt: new Date().toISOString(),
        patient: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          age: currentUser.age,
          gender: currentUser.gender,
          bloodType: currentUser.bloodType,
          primaryCondition: currentUser.primaryCondition,
        },
        biometricSummary: {
          totalRecordCount: stats.totalLogs,
          restingHeartRate: {
            averageBpm: stats.avgHr,
            minimumBpm: stats.minHr,
            maximumBpm: stats.maxHr,
            classification: hrZone.label,
          },
          oxygenSaturation: {
            averagePercent: stats.avgSpo2,
            classification: spo2Status.label,
          },
          sleepArchitecture: {
            averageHoursPerNight: stats.avgSleep,
            classification: sleepStatus.label,
          },
          latestVitals: latestVital,
        },
        vitalLogs: vitals,
      };

      const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportPayload, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', jsonStr);
      link.setAttribute('download', `Health_Report_${safeName}_${timestampStr}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Health Report (JSON) downloaded successfully!', 'success');
    } else if (format === 'pdf') {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 14;
        const contentWidth = pageWidth - margin * 2; // 182mm

        // Top banner
        doc.setFillColor(15, 118, 110); // Teal 700
        doc.rect(0, 0, pageWidth, 18, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('HEALTHCARE AI HUB · CLINICAL BIOMETRICS REPORT', margin, 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(
          `Generated: ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          pageWidth - margin,
          12,
          { align: 'right' }
        );

        let y = 26;

        // Patient Demographics Box
        doc.setFillColor(248, 250, 252); // Slate 50
        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.roundedRect(margin, y, contentWidth, 27, 2, 2, 'FD');

        doc.setTextColor(15, 23, 42); // Slate 900
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(`Patient: ${currentUser.name}`, margin + 4, y + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105); // Slate 600
        doc.text(
          `Patient ID: ${currentUser.id}  |  Age: ${currentUser.age}  |  Gender: ${currentUser.gender}  |  Blood Group: ${currentUser.bloodType}`,
          margin + 4,
          y + 12
        );
        doc.text(
          `Primary Clinical Focus: ${currentUser.primaryCondition || 'General Wellness & Preventive Monitoring'}`,
          margin + 4,
          y + 18
        );
        doc.text(`Email: ${currentUser.email}  |  Total Telemetry Records: ${stats.totalLogs}`, margin + 4, y + 23);

        y += 33;

        // Physiological Summary
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text('PHYSIOLOGICAL TELEMETRY BASELINES', margin, y);
        y += 4;

        const cardWidth = (contentWidth - 6) / 3;
        const cardHeight = 22;

        // Card 1: Heart Rate
        doc.setFillColor(255, 241, 242);
        doc.setDrawColor(254, 205, 211);
        doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, 'FD');
        doc.setTextColor(159, 18, 57);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('RESTING HEART RATE', margin + 3, y + 5);
        doc.setFontSize(13);
        doc.text(`${stats.avgHr} bpm`, margin + 3, y + 12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Range: ${stats.minHr} - ${stats.maxHr} bpm (${hrZone.label})`, margin + 3, y + 18);

        // Card 2: SpO2
        doc.setFillColor(236, 253, 245);
        doc.setDrawColor(167, 243, 208);
        doc.roundedRect(margin + cardWidth + 3, y, cardWidth, cardHeight, 2, 2, 'FD');
        doc.setTextColor(6, 95, 70);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('OXYGEN SATURATION (SpO2)', margin + cardWidth + 6, y + 5);
        doc.setFontSize(13);
        doc.text(`${stats.avgSpo2}%`, margin + cardWidth + 6, y + 12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Status: ${spo2Status.label}`, margin + cardWidth + 6, y + 18);

        // Card 3: Sleep
        doc.setFillColor(238, 242, 255);
        doc.setDrawColor(199, 210, 254);
        doc.roundedRect(margin + (cardWidth + 3) * 2, y, cardWidth, cardHeight, 2, 2, 'FD');
        doc.setTextColor(55, 48, 163);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('SLEEP ARCHITECTURE', margin + (cardWidth + 3) * 2 + 3, y + 5);
        doc.setFontSize(13);
        doc.text(`${stats.avgSleep} hrs/night`, margin + (cardWidth + 3) * 2 + 3, y + 12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Goal: ${dailyGoals.sleepHoursGoal}h (${sleepStatus.label})`, margin + (cardWidth + 3) * 2 + 3, y + 18);

        y += cardHeight + 8;

        // Vitals Table
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text('LONGITUDINAL TELEMETRY LOGS', margin, y);
        y += 4;

        // Table Header
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.rect(margin, y, contentWidth, 7, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59);

        const colX = [
          margin + 2,
          margin + 36,
          margin + 62,
          margin + 84,
          margin + 104,
          margin + 126,
          margin + 150,
        ];

        doc.text('Date & Time', colX[0], y + 4.8);
        doc.text('Source', colX[1], y + 4.8);
        doc.text('Heart Rate', colX[2], y + 4.8);
        doc.text('SpO2', colX[3], y + 4.8);
        doc.text('Sleep', colX[4], y + 4.8);
        doc.text('Blood Pressure', colX[5], y + 4.8);
        doc.text('Contextual Notes', colX[6], y + 4.8);

        y += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);

        const rowHeight = 6.5;

        vitals.forEach((vital, index) => {
          if (y + rowHeight > pageHeight - 16) {
            doc.addPage();
            y = 16;
            doc.setFillColor(241, 245, 249);
            doc.rect(margin, y, contentWidth, 7, 'FD');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(30, 41, 59);
            doc.text('Date & Time', colX[0], y + 4.8);
            doc.text('Source', colX[1], y + 4.8);
            doc.text('Heart Rate', colX[2], y + 4.8);
            doc.text('SpO2', colX[3], y + 4.8);
            doc.text('Sleep', colX[4], y + 4.8);
            doc.text('Blood Pressure', colX[5], y + 4.8);
            doc.text('Contextual Notes', colX[6], y + 4.8);
            y += 7;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
          }

          if (index % 2 === 1) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y, contentWidth, rowHeight, 'F');
          }
          doc.setDrawColor(241, 245, 249);
          doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

          const dateStr = new Date(vital.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          const bpStr =
            vital.bloodPressureSystolic && vital.bloodPressureDiastolic
              ? `${vital.bloodPressureSystolic}/${vital.bloodPressureDiastolic} mmHg`
              : '—';

          const truncatedNotes =
            (vital.notes || '').length > 22
              ? (vital.notes || '').substring(0, 20) + '...'
              : vital.notes || '—';

          doc.setTextColor(51, 65, 85);
          doc.text(dateStr, colX[0], y + 4.5);
          doc.text(vital.source === 'simulated_sensor' ? 'Sensor BLE' : 'Manual', colX[1], y + 4.5);
          doc.text(`${vital.heartRate} bpm`, colX[2], y + 4.5);
          doc.text(`${vital.oxygenSaturation}%`, colX[3], y + 4.5);
          doc.text(`${vital.sleepHours}h (${vital.sleepQuality || 'good'})`, colX[4], y + 4.5);
          doc.text(bpStr, colX[5], y + 4.5);
          doc.text(truncatedNotes, colX[6], y + 4.5);

          y += rowHeight;
        });

        // Page Footers
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setDrawColor(226, 232, 240);
          doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.text(
            'Healthcare AI Hub · Confidential Patient Record · For clinical and personal health monitoring',
            margin,
            pageHeight - 8
          );
          doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
        }

        doc.save(`Health_Report_${safeName}_${timestampStr}.pdf`);
        showToast('Health Report (PDF) downloaded successfully!', 'success');
      } catch (pdfErr) {
        console.error('PDF export error:', pdfErr);
        showToast('Could not generate PDF. Please try CSV or JSON.', 'info');
      }
    }

    setIsDownloadModalOpen(false);
  };

  // Export records as CSV helper
  const handleExportCSV = (customRecords?: VitalLog[], label?: string) => {
    handleDownloadReport('csv', customRecords, label);
  };

  // Heart Rate zone status evaluation
  const getHeartRateZone = (bpm: number) => {
    if (bpm < 60) return { label: 'Bradycardia / Low Resting', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' };
    if (bpm <= 100) return { label: 'Normal Resting Range', color: 'text-teal-700 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800' };
    return { label: 'Elevated / Tachycardia', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' };
  };

  // SpO2 status evaluation
  const getSpo2Status = (spo2: number) => {
    if (spo2 >= 96) return { label: 'Optimal Oxygenation', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' };
    if (spo2 >= 94) return { label: 'Acceptable Baseline', color: 'text-sky-700 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800' };
    return { label: 'Hypoxemia Caution (<94%)', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' };
  };

  // Sleep status evaluation
  const getSleepStatus = (hours: number) => {
    if (hours >= 7 && hours <= 9) return { label: 'Target Restorative (7-9h)', color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' };
    if (hours < 7) return { label: 'Sleep Depicit (<7h)', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' };
    return { label: 'Extended Rest (>9h)', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };
  };

  const currentHrDisplay = isLiveSimulating ? livePulse : latestVital.heartRate;
  const currentSpo2Display = isLiveSimulating ? liveSpO2 : latestVital.oxygenSaturation;
  const hrZone = getHeartRateZone(currentHrDisplay);
  const spo2Status = getSpo2Status(currentSpo2Display);
  const sleepStatus = getSleepStatus(latestVital.sleepHours);

  // Active Threshold-Based Medical Alert
  const currentThresholdAlert = useMemo(() => {
    return evaluateVitalThresholds(currentHrDisplay, currentSpo2Display, latestVital.timestamp);
  }, [currentHrDisplay, currentSpo2Display, latestVital.timestamp]);

  const [dismissedAlertId, setDismissedAlertId] = useState<string | null>(null);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState<boolean>(false);

  // Simulate abnormal vitals to demonstrate threshold alert system
  const handleSimulateAbnormalVital = (type: 'tachycardia' | 'hypoxemia' | 'critical_dual' | 'normal') => {
    let hr = 72;
    let spo2 = 98;
    let note = '';

    if (type === 'tachycardia') {
      hr = 112;
      spo2 = 97;
      note = 'Simulated resting tachycardia (AHA guideline threshold: >100 bpm)';
    } else if (type === 'hypoxemia') {
      hr = 78;
      spo2 = 91;
      note = 'Simulated moderate hypoxemia (WHO guideline threshold: <95%)';
    } else if (type === 'critical_dual') {
      hr = 126;
      spo2 = 87;
      note = 'Simulated critical cardiorespiratory distress';
    } else {
      hr = 70;
      spo2 = 99;
      note = 'Simulated healthy baseline vitals';
    }

    onAddVitalLog({
      timestamp: new Date().toISOString(),
      heartRate: hr,
      oxygenSaturation: spo2,
      sleepHours: 7.8,
      sleepQuality: 'good',
      bloodPressureSystolic: hr > 100 ? 134 : 118,
      bloodPressureDiastolic: hr > 100 ? 84 : 76,
      source: 'simulated_sensor',
      notes: note,
    });

    setLivePulse(hr);
    setLiveSpO2(spo2);
    setDismissedAlertId(null);
    setIsThresholdModalOpen(false);

    if (type !== 'normal') {
      showToast(`⚠️ Medical Threshold Warning: ${hr} bpm · ${spo2}% SpO2 logged. Threshold alert active!`, 'info');
    } else {
      showToast(`Healthy normal baseline restored: ${hr} bpm · ${spo2}% SpO2.`, 'success');
    }
  };

  // Daily Goal Progress Calculations
  const currentSleepHours = latestVital.sleepHours;
  const sleepGoalPercent = Math.min(100, Math.round((currentSleepHours / dailyGoals.sleepHoursGoal) * 100));
  const sleepDiff = parseFloat((currentSleepHours - dailyGoals.sleepHoursGoal).toFixed(1));

  // Heart Rate Target Progress Calculations
  const hrTargetDiff = currentHrDisplay - dailyGoals.heartRateTarget;
  const hrGoalPercent =
    currentHrDisplay <= dailyGoals.heartRateTarget
      ? 100
      : Math.max(15, Math.round((1 - hrTargetDiff / 35) * 100));

  // Selected Day for Goal History Inspection
  const [selectedHistoryDayId, setSelectedHistoryDayId] = useState<string | null>(null);

  // Quick Goal Stepper Handlers
  const handleQuickAdjustSleep = (delta: number) => {
    const updated = Math.max(5.0, Math.min(11.0, parseFloat((dailyGoals.sleepHoursGoal + delta).toFixed(1))));
    setDailyGoals((prev) => ({ ...prev, sleepHoursGoal: updated }));
    setTempSleepGoal(updated);
    showToast(`Sleep target adjusted to ${updated.toFixed(1)}h/night`, 'info');
  };

  const handleQuickAdjustHr = (delta: number) => {
    const updated = Math.max(55, Math.min(90, dailyGoals.heartRateTarget + delta));
    setDailyGoals((prev) => ({ ...prev, heartRateTarget: updated }));
    setTempHeartRateGoal(updated);
    showToast(`Resting heart rate ceiling set to ≤${updated} bpm`, 'info');
  };

  const handleSetSleepPreset = (hours: number) => {
    setDailyGoals((prev) => ({ ...prev, sleepHoursGoal: hours }));
    setTempSleepGoal(hours);
    showToast(`Sleep target set to ${hours.toFixed(1)}h`, 'info');
  };

  const handleSetHrPreset = (bpm: number) => {
    setDailyGoals((prev) => ({ ...prev, heartRateTarget: bpm }));
    setTempHeartRateGoal(bpm);
    showToast(`Resting HR ceiling set to ≤${bpm} bpm`, 'info');
  };

  // 7-day chronological goal achievement calculations
  const goalTrackingHistory = useMemo(() => {
    const logs = [...vitals].slice(0, 7).reverse();
    return logs.map((log) => {
      const date = new Date(log.timestamp);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const sleepMet = log.sleepHours >= dailyGoals.sleepHoursGoal;
      const hrMet = log.heartRate <= dailyGoals.heartRateTarget;
      const bothMet = sleepMet && hrMet;
      return {
        id: log.id,
        timestamp: log.timestamp,
        dayName,
        dateLabel,
        sleepHours: log.sleepHours,
        heartRate: log.heartRate,
        sleepMet,
        hrMet,
        bothMet,
      };
    });
  }, [vitals, dailyGoals]);

  // Current Streak
  const currentStreak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < vitals.length; i++) {
      const v = vitals[i];
      if (v.sleepHours >= dailyGoals.sleepHoursGoal || v.heartRate <= dailyGoals.heartRateTarget) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [vitals, dailyGoals]);

  const weeklySleepCompliance = useMemo(() => {
    if (!goalTrackingHistory.length) return 0;
    const metCount = goalTrackingHistory.filter((d) => d.sleepMet).length;
    return Math.round((metCount / goalTrackingHistory.length) * 100);
  }, [goalTrackingHistory]);

  const weeklyHrCompliance = useMemo(() => {
    if (!goalTrackingHistory.length) return 0;
    const metCount = goalTrackingHistory.filter((d) => d.hrMet).length;
    return Math.round((metCount / goalTrackingHistory.length) * 100);
  }, [goalTrackingHistory]);

  // --- Historical Weekly Goal Achievements (Long-Term Accountability) ---
  const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null);
  const [weeklyAccountabilityFilter, setWeeklyAccountabilityFilter] = useState<
    'all' | 'gold' | 'sleep_met' | 'hr_met' | 'attention'
  >('all');
  const [weeklySearchQuery, setWeeklySearchQuery] = useState<string>('');

  const weeklyGoalAchievements = useMemo<WeeklyGoalAchievement[]>(() => {
    // Generate up to 6 historical weekly accountability cycles
    const anchorDate = vitals[0] ? new Date(vitals[0].timestamp) : new Date();
    const weeks: WeeklyGoalAchievement[] = [];

    const historicalFallbacks = [
      { sleepOffset: 0.1, hrOffset: -2, complianceBias: 6, note: 'Superb autonomic recovery with consistent deep sleep cycles.' },
      { sleepOffset: -0.2, hrOffset: -1, complianceBias: 5, note: 'Circadian targets achieved; stable hemodynamic rest baseline.' },
      { sleepOffset: 0.3, hrOffset: -3, complianceBias: 7, note: 'Optimal non-REM slow wave restoration; resting heart rate well controlled.' },
      { sleepOffset: -0.4, hrOffset: 2, complianceBias: 4, note: 'Mild sleep deficit mid-week; cardiovascular parameters remained resilient.' },
      { sleepOffset: 0.2, hrOffset: -2, complianceBias: 6, note: 'Consistently achieved bedtime routines and normotensive resting pulse.' },
      { sleepOffset: 0.0, hrOffset: 0, complianceBias: 5, note: 'Baseline establishment week; balanced cardiopulmonary vitals throughout.' },
    ];

    for (let w = 0; w < 6; w++) {
      const endMs = anchorDate.getTime() - w * 7 * 24 * 60 * 60 * 1000;
      const startMs = endMs - 6 * 24 * 60 * 60 * 1000;
      const weekEndDate = new Date(endMs);
      const weekStartDate = new Date(startMs);

      const startLabel = weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endLabel = weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const dateRangeLabel = `${startLabel} – ${endLabel}`;
      const relativeLabel = w === 0 ? 'Current Week' : `${w} Week${w > 1 ? 's' : ''} Ago`;

      const inWindowVitals = vitals.filter((v) => {
        const vMs = new Date(v.timestamp).getTime();
        return vMs >= startMs - 12 * 60 * 60 * 1000 && vMs <= endMs + 12 * 60 * 60 * 1000;
      });

      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const fb = historicalFallbacks[w % historicalFallbacks.length];

      let dailyBreakdown: WeeklyGoalAchievement['dailyBreakdown'] = [];
      let sleepSum = 0;
      let hrSum = 0;
      let sleepMetCount = 0;
      let hrMetCount = 0;
      const count = 7;

      if (w === 0 && goalTrackingHistory.length > 0) {
        dailyBreakdown = goalTrackingHistory.map((d) => ({
          dayName: d.dayName,
          dateLabel: d.dateLabel,
          sleepHours: d.sleepHours,
          sleepMet: d.sleepMet,
          heartRate: d.heartRate,
          hrMet: d.hrMet,
        }));
        sleepSum = dailyBreakdown.reduce((acc, d) => acc + d.sleepHours, 0);
        hrSum = dailyBreakdown.reduce((acc, d) => acc + d.heartRate, 0);
        sleepMetCount = dailyBreakdown.filter((d) => d.sleepMet).length;
        hrMetCount = dailyBreakdown.filter((d) => d.hrMet).length;
      } else {
        for (let d = 0; d < 7; d++) {
          const dayDate = new Date(startMs + d * 24 * 60 * 60 * 1000);
          const dayName = dayNames[d];
          const dateLabel = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          const match = inWindowVitals.find((v) => {
            const vDate = new Date(v.timestamp);
            return vDate.getDate() === dayDate.getDate() && vDate.getMonth() === dayDate.getMonth();
          });

          const sleepHours = match
            ? match.sleepHours
            : parseFloat(
                Math.max(6.0, Math.min(9.5, dailyGoals.sleepHoursGoal + fb.sleepOffset + (d % 2 === 0 ? 0.3 : -0.2))).toFixed(1)
              );
          const heartRate = match
            ? match.heartRate
            : Math.max(58, Math.min(85, dailyGoals.heartRateTarget + fb.hrOffset + (d === 3 ? 3 : -2)));

          const sleepMet = sleepHours >= dailyGoals.sleepHoursGoal;
          const hrMet = heartRate <= dailyGoals.heartRateTarget;

          if (sleepMet) sleepMetCount++;
          if (hrMet) hrMetCount++;
          sleepSum += sleepHours;
          hrSum += heartRate;

          dailyBreakdown.push({
            dayName,
            dateLabel,
            sleepHours,
            sleepMet,
            heartRate,
            hrMet,
          });
        }
      }

      const sleepHoursAvg = parseFloat((sleepSum / count).toFixed(1));
      const heartRateAvg = Math.round(hrSum / count);
      const sleepCompliancePercent = Math.round((sleepMetCount / count) * 100);
      const hrCompliancePercent = Math.round((hrMetCount / count) * 100);
      const compositeScore = Math.round((sleepCompliancePercent + hrCompliancePercent) / 2);

      let sleepStatus: 'achieved' | 'near' | 'deficit' = 'deficit';
      if (sleepCompliancePercent >= 85) sleepStatus = 'achieved';
      else if (sleepCompliancePercent >= 70) sleepStatus = 'near';

      let hrStatus: 'maintained' | 'borderline' | 'elevated' = 'elevated';
      if (hrCompliancePercent >= 85) hrStatus = 'maintained';
      else if (hrCompliancePercent >= 70) hrStatus = 'borderline';

      let tier: 'gold' | 'silver' | 'bronze' | 'attention' = 'attention';
      let statusLabel = 'Needs Accountability Focus';
      if (compositeScore >= 88) {
        tier = 'gold';
        statusLabel = '🏆 Gold Tier · Dual Goals Met';
      } else if (compositeScore >= 75) {
        tier = 'silver';
        statusLabel = '🥈 Silver Tier · Solid Adherence';
      } else if (compositeScore >= 60) {
        tier = 'bronze';
        statusLabel = '🥉 Bronze Tier · Target Met';
      }

      weeks.push({
        weekId: `week_hist_${w}_${weekStartDate.toISOString().slice(0, 10)}`,
        weekNumber: 6 - w,
        startDate: weekStartDate.toISOString(),
        endDate: weekEndDate.toISOString(),
        dateRangeLabel,
        relativeLabel,
        totalLogs: count,
        sleepHoursAvg,
        sleepGoalTarget: dailyGoals.sleepHoursGoal,
        sleepDaysMet: sleepMetCount,
        sleepTotalDays: count,
        sleepCompliancePercent,
        sleepStatus,
        heartRateAvg,
        heartRateCeiling: dailyGoals.heartRateTarget,
        hrDaysMet: hrMetCount,
        hrTotalDays: count,
        hrCompliancePercent,
        hrStatus,
        compositeScore,
        tier,
        statusLabel,
        clinicalAccountabilityNote: fb.note,
        dailyBreakdown,
      });
    }

    return weeks;
  }, [vitals, dailyGoals, goalTrackingHistory]);

  const weeklySummaryStats = useMemo(() => {
    if (!weeklyGoalAchievements.length) {
      return {
        overallCompliance: 0,
        weeksMet: 0,
        totalWeeks: 0,
        goldWeeks: 0,
        currentWeeklyStreak: 0,
      };
    }
    const totalWeeks = weeklyGoalAchievements.length;
    const overallCompliance = Math.round(
      weeklyGoalAchievements.reduce((acc, w) => acc + w.compositeScore, 0) / totalWeeks
    );
    const weeksMet = weeklyGoalAchievements.filter((w) => w.compositeScore >= 70).length;
    const goldWeeks = weeklyGoalAchievements.filter((w) => w.tier === 'gold').length;

    let currentWeeklyStreak = 0;
    for (const w of weeklyGoalAchievements) {
      if (w.compositeScore >= 70) currentWeeklyStreak++;
      else break;
    }

    return {
      overallCompliance,
      weeksMet,
      totalWeeks,
      goldWeeks,
      currentWeeklyStreak,
    };
  }, [weeklyGoalAchievements]);

  // Export weekly accountability table to CSV
  const handleExportWeeklyAccountabilityCSV = () => {
    if (!weeklyGoalAchievements.length) {
      showToast('No weekly goal logs available to export.', 'info');
      return;
    }
    const safeName = currentUser.name.replace(/\s+/g, '_');
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const metadataRows = [
      ['# LONG-TERM WEEKLY GOAL ACHIEVEMENTS & ACCOUNTABILITY REPORT'],
      [`# Patient: ${currentUser.name} (ID: ${currentUser.id})`],
      [`# Report Generated: ${new Date().toISOString()}`],
      [`# Active Sleep Target: ${dailyGoals.sleepHoursGoal} hrs/night | Resting Pulse Ceiling: <= ${dailyGoals.heartRateTarget} bpm`],
      [`# Overall Historical Compliance: ${weeklySummaryStats.overallCompliance}% (${weeklySummaryStats.weeksMet}/${weeklySummaryStats.totalWeeks} Weeks Meeting Targets)`],
      [],
    ];

    const headers = [
      'Week Number',
      'Timeline',
      'Date Range',
      'Average Sleep (hrs)',
      'Sleep Target (hrs)',
      'Sleep Days Met',
      'Sleep Compliance (%)',
      'Resting Heart Rate Avg (bpm)',
      'Resting HR Ceiling (bpm)',
      'HR Days Met',
      'HR Compliance (%)',
      'Composite Score (%)',
      'Accountability Tier',
      'Clinical Accountability Review',
    ];

    const rows = weeklyGoalAchievements.map((w) => [
      `Week ${w.weekNumber}`,
      `"${w.relativeLabel}"`,
      `"${w.dateRangeLabel}"`,
      w.sleepHoursAvg,
      w.sleepGoalTarget,
      `${w.sleepDaysMet}/${w.sleepTotalDays}`,
      `${w.sleepCompliancePercent}%`,
      w.heartRateAvg,
      w.heartRateCeiling,
      `${w.hrDaysMet}/${w.hrTotalDays}`,
      `${w.hrCompliancePercent}%`,
      `${w.compositeScore}%`,
      `"${w.statusLabel}"`,
      `"${w.clinicalAccountabilityNote.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [
      ...metadataRows.map((r) => r.join(',')),
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Weekly_Goal_Accountability_${safeName}_${timestampStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Weekly goal accountability report exported to CSV!', 'success');
  };

  // --- Local Goal Achievement Notification System ---
  const [activeAchievementNotif, setActiveAchievementNotif] = useState<GoalAchievementNotification | null>(null);
  const [notifProgress, setNotifProgress] = useState<number>(100);
  const [isNotifPaused, setIsNotifPaused] = useState<boolean>(false);
  const notifProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Persisted notifications history
  const [achievementHistory, setAchievementHistory] = useState<GoalAchievementNotification[]>(() => {
    try {
      const stored = localStorage.getItem('hc_hub_goal_notifications');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Persisted notification sound preference
  const [isNotifSoundEnabled, setIsNotifSoundEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('hc_hub_notif_sound');
      if (stored !== null) return stored === 'true';
    } catch {}
    return true;
  });

  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifHistoryFilter, setNotifHistoryFilter] = useState<'all' | 'bookmarked' | 'sleep' | 'heart_rate'>('all');
  const [activeTipIndex, setActiveTipIndex] = useState<number>(0);

  // Signature ref to avoid repeat triggers for unchanged data
  const lastNotifiedSigRef = useRef<string | null>(null);

  // Play gentle celebratory chime using Web Audio API
  const playAchievementChime = () => {
    if (!isNotifSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      // Note 1: C5 -> E5
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2: G5 -> C6
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.1);
      osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3);
      gain2.gain.setValueAtTime(0.1, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.55);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Persist history & sound preference
  useEffect(() => {
    try {
      localStorage.setItem('hc_hub_goal_notifications', JSON.stringify(achievementHistory.slice(0, 30)));
    } catch {}
  }, [achievementHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('hc_hub_notif_sound', String(isNotifSoundEnabled));
    } catch {}
  }, [isNotifSoundEnabled]);

  // Trigger Goal Notification with brief encouraging tip
  const triggerGoalNotification = (
    goalType: 'sleep' | 'heart_rate' | 'both',
    options?: { force?: boolean; tipIndex?: number; notifyToast?: boolean }
  ) => {
    const tipsList = ENCOURAGING_TIPS_LIBRARY[goalType];
    const index =
      options?.tipIndex !== undefined
        ? options.tipIndex % tipsList.length
        : Math.floor(Math.random() * tipsList.length);
    setActiveTipIndex(index);
    const selected = tipsList[index];

    let title = '🎉 Daily Goal Achieved!';
    let metricSummary = '';
    if (goalType === 'both') {
      title = '🏆 Dual Target Triumph: Both Daily Goals Achieved!';
      metricSummary = `Sleep ${currentSleepHours}h / ${dailyGoals.sleepHoursGoal}h · Resting HR ${currentHrDisplay} bpm (Target ≤${dailyGoals.heartRateTarget} bpm)`;
    } else if (goalType === 'sleep') {
      title = '🌙 Daily Sleep Target Achieved!';
      metricSummary = `${currentSleepHours}h restorative sleep (${sleepGoalPercent}% of ${dailyGoals.sleepHoursGoal}h target)`;
    } else {
      title = '❤️ Resting Heart Rate Ceiling Maintained!';
      metricSummary = `${currentHrDisplay} bpm resting heart rate within target range (≤${dailyGoals.heartRateTarget} bpm)`;
    }

    const notif: GoalAchievementNotification = {
      id: `goal_notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      goalType,
      title,
      encouragingTip: selected.tip,
      tipHeadline: selected.title,
      metricSummary,
      timestamp: new Date().toISOString(),
      read: false,
      bookmarked: false,
    };

    setActiveAchievementNotif(notif);
    setNotifProgress(100);
    setIsNotifPaused(false);

    setAchievementHistory((prev) => [
      notif,
      ...prev.filter(
        (p) => p.title !== notif.title || Math.abs(new Date(p.timestamp).getTime() - Date.now()) > 30000
      ),
    ]);

    playAchievementChime();
    if (options?.notifyToast) {
      showToast('Encouraging daily health tip displayed!', 'info');
    }
  };

  // Auto-detect daily goal achievements
  useEffect(() => {
    const sleepAchieved = currentSleepHours >= dailyGoals.sleepHoursGoal;
    const hrAchieved = currentHrDisplay <= dailyGoals.heartRateTarget;

    if (!sleepAchieved && !hrAchieved) return;

    const achievedType: 'both' | 'sleep' | 'heart_rate' =
      sleepAchieved && hrAchieved ? 'both' : sleepAchieved ? 'sleep' : 'heart_rate';

    const todayStr = new Date().toISOString().slice(0, 10);
    const signature = `${todayStr}_${latestVital.id}_${achievedType}_${dailyGoals.sleepHoursGoal}_${dailyGoals.heartRateTarget}`;

    if (lastNotifiedSigRef.current !== signature) {
      lastNotifiedSigRef.current = signature;
      try {
        sessionStorage.setItem('hc_hub_last_goal_notif_sig', signature);
      } catch {}

      const timer = setTimeout(() => {
        triggerGoalNotification(achievedType);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [currentSleepHours, currentHrDisplay, dailyGoals, latestVital.id]);

  // Handle auto-dismiss and countdown bar for active notification banner
  useEffect(() => {
    if (!activeAchievementNotif) return;
    if (isNotifPaused) return;

    const DURATION = 9000; // 9 seconds
    const INTERVAL = 50;
    const step = (INTERVAL / DURATION) * 100;

    notifProgressIntervalRef.current = setInterval(() => {
      setNotifProgress((prev) => {
        if (prev <= step) {
          clearInterval(notifProgressIntervalRef.current!);
          setActiveAchievementNotif(null);
          return 0;
        }
        return prev - step;
      });
    }, INTERVAL);

    return () => {
      if (notifProgressIntervalRef.current) clearInterval(notifProgressIntervalRef.current);
    };
  }, [activeAchievementNotif, isNotifPaused]);

  // Cycle to next encouraging tip
  const handleCycleTip = () => {
    if (!activeAchievementNotif) return;
    const list = ENCOURAGING_TIPS_LIBRARY[activeAchievementNotif.goalType];
    const nextIdx = (activeTipIndex + 1) % list.length;
    setActiveTipIndex(nextIdx);
    const nextTip = list[nextIdx];
    setActiveAchievementNotif((prev) =>
      prev
        ? {
            ...prev,
            encouragingTip: nextTip.tip,
            tipHeadline: nextTip.title,
          }
        : null
    );
    setNotifProgress(100);
    showToast('Displaying next encouraging tip!', 'info');
  };

  // Toggle bookmark on active notification
  const handleToggleBookmarkActive = () => {
    if (!activeAchievementNotif) return;
    const newBookmarked = !activeAchievementNotif.bookmarked;
    setActiveAchievementNotif((prev) => (prev ? { ...prev, bookmarked: newBookmarked } : null));
    setAchievementHistory((prev) =>
      prev.map((item) =>
        item.id === activeAchievementNotif.id ? { ...item, bookmarked: newBookmarked } : item
      )
    );
    showToast(
      newBookmarked ? 'Encouraging tip bookmarked to your saved health notes!' : 'Tip removed from bookmarks.',
      'info'
    );
  };

  // Copy encouraging tip text
  const handleCopyTip = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      showToast('Encouraging health tip copied to clipboard!', 'success');
    } catch {
      showToast('Could not copy to clipboard.', 'info');
    }
  };

  // Active status of goals for current day
  const isCurrentSleepAchieved = currentSleepHours >= dailyGoals.sleepHoursGoal;
  const isCurrentHrAchieved = currentHrDisplay <= dailyGoals.heartRateTarget;
  const isAnyGoalAchieved = isCurrentSleepAchieved || isCurrentHrAchieved;
  const isBothGoalsAchieved = isCurrentSleepAchieved && isCurrentHrAchieved;

  // Active Filter for AI Health Tips
  const [selectedTipCategory, setSelectedTipCategory] = useState<string>('all');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // AI Health Insights state (initialized with deterministic clinical guidelines engine)
  const [aiInsights, setAiInsights] = useState<AIHealthInsightData>(() =>
    getDeterministicClinicalInsights(currentUser, latestVital, stats.avgHr, stats.avgSpo2, stats.avgSleep)
  );

  // Update insights if user profile or primary metrics change
  useEffect(() => {
    setAiInsights((prev) => {
      if (prev.source === 'ai') return prev;
      return getDeterministicClinicalInsights(currentUser, latestVital, stats.avgHr, stats.avgSpo2, stats.avgSleep);
    });
  }, [currentUser, latestVital, stats.avgHr, stats.avgSpo2, stats.avgSleep]);

  // Request fresh insights from Gemini 3.8 Flash
  const handleRefreshAIInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const response = await fetch('/api/gemini/health-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: currentUser,
          vitals,
          dailyGoals,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data && data.overallAssessment) {
        setAiInsights({
          ...data,
          generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'ai',
        });
        showToast('AI clinical health insights updated via Gemini 3.8 Flash!', 'success');
      } else {
        throw new Error('Invalid format returned by AI model');
      }
    } catch (err: any) {
      console.warn('AI Insights API unavailable, using clinical guideline engine:', err);
      const fallback = getDeterministicClinicalInsights(
        currentUser,
        latestVital,
        stats.avgHr,
        stats.avgSpo2,
        stats.avgSleep
      );
      setAiInsights(fallback);
      showToast('Health insights updated via Clinical Guidelines Engine (AHA/NSF).', 'info');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const filteredTips = useMemo(() => {
    if (!aiInsights?.personalizedTips) return [];
    if (selectedTipCategory === 'all') return aiInsights.personalizedTips;
    return aiInsights.personalizedTips.filter((tip) =>
      tip.category.toLowerCase().includes(selectedTipCategory.toLowerCase())
    );
  }, [aiInsights, selectedTipCategory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 text-xs font-medium animate-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* Floating Goal Achievement Local Notification Banner */}
      {activeAchievementNotif && (
        <div
          onMouseEnter={() => setIsNotifPaused(true)}
          onMouseLeave={() => setIsNotifPaused(false)}
          className="fixed top-6 right-3 sm:right-6 z-50 max-w-sm sm:max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-emerald-500/40 dark:border-emerald-500/50 p-4 sm:p-5 space-y-3.5 backdrop-blur-md animate-in slide-in-from-top-4 fade-in duration-300 ring-4 ring-emerald-500/10"
        >
          {/* Header Row: Badge, Title & Dismiss */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
                  activeAchievementNotif.goalType === 'both'
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/20'
                    : activeAchievementNotif.goalType === 'sleep'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/20'
                    : 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/20'
                }`}
              >
                {activeAchievementNotif.goalType === 'both' ? (
                  <Trophy className="w-5 h-5 animate-bounce" />
                ) : activeAchievementNotif.goalType === 'sleep' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Heart className="w-5 h-5 fill-white/20" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    Daily Goal Achieved!
                  </span>
                  <span className="text-[10px] text-slate-400">Just now</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                  {activeAchievementNotif.tipHeadline}
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveAchievementNotif(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Metric Summary Pill */}
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{activeAchievementNotif.metricSummary}</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Target Met</span>
          </div>

          {/* Encouraging Tip Quote Body */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
            <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              "{activeAchievementNotif.encouragingTip}"
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                Evidence-Based Biometric Advice
              </span>
              <span>{isNotifPaused ? 'Timer paused (hovered)' : 'Auto-dismissing'}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCycleTip}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                title="View another encouraging tip"
              >
                <RefreshCw className="w-3 h-3 text-slate-500" />
                <span>Next Tip</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyTip(activeAchievementNotif.encouragingTip)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                title="Copy tip text"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>

              <button
                type="button"
                onClick={handleToggleBookmarkActive}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                  activeAchievementNotif.bookmarked
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Bookmark encouraging tip"
              >
                <Bookmark className={`w-3 h-3 ${activeAchievementNotif.bookmarked ? 'fill-amber-500 text-amber-600' : ''}`} />
                <span>{activeAchievementNotif.bookmarked ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveAchievementNotif(null)}
              className="px-3 py-1 rounded-lg text-[11px] font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer"
            >
              Got it!
            </button>
          </div>

          {/* Auto-Dismiss Countdown Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-75"
              style={{ width: `${notifProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Header Banner & Sensor Control Hub */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Vitals & Biometric Telemetry
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Mock BLE Sensor Connected
              </span>
              {isLiveSimulating && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700 animate-pulse">
                  <Zap className="w-3 h-3 text-teal-500" />
                  Streaming Live (2.5s)
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Personalized Health Metrics & Vitals
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Real-time physiological tracking for cardiovascular rhythm, blood oxygenation, and sleep architecture.
              Simulate connected sensor hardware or manually log vitals for clinical longitudinal monitoring.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            {/* Live Stream Toggle */}
            <button
              onClick={() => setIsLiveSimulating((prev) => !prev)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                isLiveSimulating
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
              title="Toggle continuous mock wearable sensor telemetry"
            >
              <Zap className={`w-3.5 h-3.5 ${isLiveSimulating ? 'text-rose-600 fill-rose-600 animate-pulse' : 'text-slate-500'}`} />
              <span>{isLiveSimulating ? 'Stop Live Stream' : 'Stream Live Sensor'}</span>
            </button>

            {/* Quick Sensor Scan */}
            <button
              onClick={handleTriggerSensorScan}
              disabled={isScanningSensor}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-600 dark:text-teal-400 ${isScanningSensor ? 'animate-spin' : ''}`} />
              <span>{isScanningSensor ? 'Scanning Vitals...' : 'Simulate Sensor Reading'}</span>
            </button>

            {/* Direct Download Vitals CSV Button */}
            <button
              type="button"
              onClick={() => handleExportCSV()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Download your complete vitals history as a formatted CSV spreadsheet for personal records"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Download CSV ({vitals.length})</span>
            </button>

            {/* Download Health Report Dropdown Container */}
            <div className="relative inline-block" ref={downloadDropdownRef}>
              <button
                type="button"
                onClick={() => setIsDownloadDropdownOpen((prev) => !prev)}
                aria-expanded={isDownloadDropdownOpen}
                aria-haspopup="true"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                title="Download Health Report in CSV, JSON, or PDF format"
              >
                <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Download Report</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isDownloadDropdownOpen ? 'rotate-180 text-teal-600 dark:text-teal-400' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDownloadDropdownOpen && (
                <div
                  role="menu"
                  aria-orientation="vertical"
                  className="absolute right-0 sm:left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1"
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Export Health Report</span>
                    <span className="font-mono text-[9px] text-teal-600 dark:text-teal-400 font-semibold">
                      {vitals.length} records
                    </span>
                  </div>

                  {/* PDF Option */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      handleDownloadReport('pdf');
                      setIsDownloadDropdownOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-rose-50/70 dark:hover:bg-rose-950/30 flex items-start gap-3 transition-colors text-left group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Clinical PDF Report
                        </span>
                        <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                          .pdf
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                        Printable document with demographics, baseline metrics & telemetry table.
                      </p>
                    </div>
                  </button>

                  {/* CSV Option */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      handleDownloadReport('csv');
                      setIsDownloadDropdownOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-teal-50/70 dark:hover:bg-teal-950/30 flex items-start gap-3 transition-colors text-left group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400 shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          CSV Spreadsheet
                        </span>
                        <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                          .csv
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                        Tabular spreadsheet for Excel, Numbers, Sheets & EMR systems.
                      </p>
                    </div>
                  </button>

                  {/* JSON Option */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      handleDownloadReport('json');
                      setIsDownloadDropdownOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-sky-50/70 dark:hover:bg-sky-950/30 flex items-start gap-3 transition-colors text-left group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-700 dark:text-sky-400 shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          JSON Telemetry
                        </span>
                        <span className="text-[10px] font-mono text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                          .json
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                        Structured telemetry schema for developer integrations and analytics.
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Manual Entry Button with Information Tooltip */}
            <div className="relative group/manual inline-block">
              <button
                type="button"
                onClick={() => setIsLogModalOpen(true)}
                aria-describedby="manual-log-tooltip"
                title="These logs are automatically saved to local storage and sync with the dashboard."
                data-tooltip="These logs are automatically saved to local storage and sync with the dashboard."
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Vitals Manually</span>
                <span
                  title="These logs are automatically saved to local storage and sync with the dashboard."
                  className="inline-flex items-center justify-center p-0.5 rounded-full hover:bg-teal-600/70 transition-colors"
                >
                  <Info className="w-3.5 h-3.5 text-teal-200 group-hover/manual:text-white transition-colors" />
                </span>
              </button>

              {/* Information Tooltip Popup */}
              <div
                id="manual-log-tooltip"
                role="tooltip"
                className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 bottom-full mb-2.5 w-64 p-2.5 bg-slate-900 text-slate-100 dark:bg-slate-800 dark:text-slate-100 text-[11px] rounded-xl shadow-xl border border-slate-700/80 dark:border-slate-600 pointer-events-none opacity-0 group-hover/manual:opacity-100 group-focus-within/manual:opacity-100 transition-all duration-150 z-50 flex items-start gap-2"
              >
                <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  These logs are automatically saved to <strong>local storage</strong> and sync with the dashboard.
                </span>
                <div className="absolute top-full right-6 sm:left-1/2 sm:-translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
              </div>
            </div>

            {/* Medical Guidelines & Threshold Simulator Button */}
            <button
              type="button"
              onClick={() => setIsThresholdModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="View standard medical guidelines and thresholds (AHA/WHO)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Medical Guidelines</span>
            </button>
          </div>
        </div>

        {/* Scanning Progress Bar & Step Notice */}
        {isScanningSensor && (
          <div className="mt-5 p-3.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-teal-900 dark:text-teal-200 font-medium mb-1.5">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600 dark:text-teal-400 animate-ping" />
                {scanStepMessage || 'Reading optical photoplethysmography sensor...'}
              </span>
              <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400">Sensor BLE 2.4 GHz</span>
            </div>
            <div className="w-full bg-teal-200/60 dark:bg-teal-900/60 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-600 dark:bg-teal-400 h-full rounded-full animate-pulse transition-all duration-300 w-full" />
            </div>
          </div>
        )}
      </div>

      {/* Clinical Threshold Alert Banner (When Vitals are Out of Healthy Range) */}
      {currentThresholdAlert && dismissedAlertId !== currentThresholdAlert.id && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border shadow-lg transition-all animate-in slide-in-from-top-3 duration-200 ${
            currentThresholdAlert.severity === 'critical'
              ? 'bg-rose-50/95 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100 ring-4 ring-rose-500/10'
              : currentThresholdAlert.severity === 'warning'
              ? 'bg-red-50/90 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-950 dark:text-red-100 ring-2 ring-red-500/10'
              : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100 ring-2 ring-amber-500/10'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  currentThresholdAlert.severity === 'critical'
                    ? 'bg-rose-600 text-white animate-pulse'
                    : currentThresholdAlert.severity === 'warning'
                    ? 'bg-red-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      currentThresholdAlert.severity === 'critical'
                        ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700'
                        : currentThresholdAlert.severity === 'warning'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700'
                        : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                    }`}
                  >
                    {currentThresholdAlert.severity.toUpperCase()} THRESHOLD ALERT
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {currentThresholdAlert.guidelineReference}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  {currentThresholdAlert.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {currentThresholdAlert.message}
                </p>

                <div className="p-3 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-black/5 dark:border-white/10 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Clinical Recommendation (Standard Medical Protocol):</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {currentThresholdAlert.clinicalRecommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
              <button
                type="button"
                onClick={() => setIsThresholdModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
              >
                View Guidelines
              </button>
              <button
                type="button"
                onClick={() => setDismissedAlertId(currentThresholdAlert.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Acknowledge alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Metrics Grid (Heart Rate, Oxygen Saturation, Sleep Duration, Blood Pressure) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CARD 1: HEART RATE */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Heart className={`w-4 h-4 fill-rose-500/20 ${isLiveSimulating ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Heart Rate
                  </h2>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Optical PPG Sensor</span>
                </div>
              </div>
              {currentThresholdAlert && (currentThresholdAlert.metric === 'heart_rate' || currentThresholdAlert.metric === 'both') ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                  currentThresholdAlert.severity === 'critical'
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                }`}>
                  <AlertTriangle className="w-3 h-3" />
                  <span>{currentThresholdAlert.severity === 'critical' ? 'Critical Alert' : 'Out of Bounds'}</span>
                </span>
              ) : (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${hrZone.bg} ${hrZone.color}`}>
                  {hrZone.label}
                </span>
              )}
            </div>

            <div className="pt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
                {currentHrDisplay}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">bpm</span>
            </div>

            {/* ECG Pulse Wave Visualization */}
            <div className="h-10 w-full py-1">
              <svg className="w-full h-full text-rose-500" viewBox="0 0 100 24" preserveAspectRatio="none" fill="none">
                <path
                  d="M0,12 L20,12 L25,3 L30,21 L35,12 L50,12 L55,7 L60,18 L65,12 L80,12 L85,0 L90,24 L95,12 L100,12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isLiveSimulating ? 'opacity-100 animate-pulse' : 'opacity-70'}
                />
              </svg>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Range: {stats.minHr} - {stats.maxHr} bpm</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">Avg: {stats.avgHr} bpm</span>
          </div>
        </div>

        {/* CARD 2: OXYGEN SATURATION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Droplets className="w-4 h-4 fill-teal-500/20" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    SpO2 Oxygen
                  </h2>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Pulse Oximetry</span>
                </div>
              </div>
              {currentThresholdAlert && (currentThresholdAlert.metric === 'oxygen_saturation' || currentThresholdAlert.metric === 'both') ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                  currentThresholdAlert.severity === 'critical'
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                }`}>
                  <AlertTriangle className="w-3 h-3" />
                  <span>{currentThresholdAlert.severity === 'critical' ? 'Critical Hypoxemia' : 'Hypoxemia Caution'}</span>
                </span>
              ) : (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${spo2Status.bg} ${spo2Status.color}`}>
                  {spo2Status.label}
                </span>
              )}
            </div>

            <div className="pt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
                {currentSpo2Display}%
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Arterial Sat.</span>
            </div>

            {/* Saturation Gauge Bar */}
            <div className="space-y-1 py-1">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                <div
                  className="bg-linear-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, currentSpo2Display))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>90% Alert</span>
                <span>95% Normal</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Clinical Standard: &gt;95%</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">7-Day Avg: {stats.avgSpo2}%</span>
          </div>
        </div>

        {/* CARD 3: SLEEP HOURS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Moon className="w-4 h-4 fill-indigo-500/20" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Sleep Duration
                  </h2>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Polysomnography</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${sleepStatus.bg} ${sleepStatus.color}`}>
                {latestVital.sleepQuality ? `${latestVital.sleepQuality.toUpperCase()}` : 'RECORDED'}
              </span>
            </div>

            <div className="pt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
                {latestVital.sleepHours}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">hours/night</span>
            </div>

            {/* Sleep Architecture Breakdown Bars */}
            <div className="space-y-1.5 py-1">
              <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 gap-0.5">
                <div className="bg-indigo-600 h-full rounded-l-full" style={{ width: '25%' }} title="Deep Sleep (25%)" />
                <div className="bg-sky-500 h-full" style={{ width: '25%' }} title="REM Sleep (25%)" />
                <div className="bg-indigo-300 dark:bg-indigo-700 h-full rounded-r-full" style={{ width: '50%' }} title="Light Sleep (50%)" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">Deep 1.8h</span>
                <span className="text-sky-600 dark:text-sky-400 font-medium">REM 1.9h</span>
                <span>Light 3.9h</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Target: 7.0 - 9.0 hrs</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">7-Day Avg: {stats.avgSleep} hrs</span>
          </div>
        </div>

        {/* CARD 4: BLOOD PRESSURE & RECOVERY */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Blood Pressure
                  </h2>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Oscillometric</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                Optimal ACC/AHA
              </span>
            </div>

            <div className="pt-2 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
                {latestVital.bloodPressureSystolic || 118}/{latestVital.bloodPressureDiastolic || 76}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">mmHg</span>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Normotensive Baseline
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Diastolic &lt;80 mm Hg and Systolic &lt;120 mm Hg. Normal hemodynamic resistance.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Last Logged:</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {new Date(latestVital.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Health Goals & Target Progress Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        {/* Section Header & Edit Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
                <Target className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Daily Health Goals & Target Progress
              </h2>
              <span className="text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                Active Tracking
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set customized daily goals for sleep duration and resting heart rate. Track live compliance and progress against your logged vitals.
            </p>
          </div>

          {/* Goal Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Notifications & Tips History Button */}
            <button
              type="button"
              onClick={() => setIsNotifModalOpen(true)}
              className="relative px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="View Encouraging Tips & Achievement History"
            >
              <Bell className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Tips & Alerts</span>
              {achievementHistory.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {achievementHistory.length > 9 ? '9+' : achievementHistory.length}
                </span>
              )}
            </button>

            {/* Sound Toggle Button */}
            <button
              type="button"
              onClick={() => {
                const next = !isNotifSoundEnabled;
                setIsNotifSoundEnabled(next);
                showToast(next ? 'Celebration audio chime enabled 🔔' : 'Celebration chime muted 🔕', 'info');
              }}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title={isNotifSoundEnabled ? 'Mute celebratory notification chime' : 'Enable celebratory notification chime'}
            >
              {isNotifSoundEnabled ? (
                <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Celebrate Goal Quick Button */}
            <button
              type="button"
              onClick={() => {
                const goal = isBothGoalsAchieved
                  ? 'both'
                  : isCurrentSleepAchieved
                  ? 'sleep'
                  : isCurrentHrAchieved
                  ? 'heart_rate'
                  : 'sleep';
                triggerGoalNotification(goal, { notifyToast: true });
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Celebrate goal and display encouraging tip"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Celebrate Goal</span>
            </button>

            {!isEditingGoals ? (
              <button
                type="button"
                onClick={() => {
                  setTempSleepGoal(dailyGoals.sleepHoursGoal);
                  setTempHeartRateGoal(dailyGoals.heartRateTarget);
                  setIsEditingGoals(true);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Adjust Goals</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetGoals}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Reset to recommended clinical baselines (8.0h sleep, 70 bpm)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Baselines</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingGoals(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveGoals}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Targets</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* In-Panel Encouraging Tip & Goal Achievement Status Banner */}
        {isAnyGoalAchieved ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-slate-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-200/90 dark:border-emerald-800/80 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  {isBothGoalsAchieved ? <Trophy className="w-4 h-4 animate-bounce" /> : <Award className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                    {isBothGoalsAchieved
                      ? 'Dual Target Triumph! Both Daily Goals Achieved'
                      : isCurrentSleepAchieved
                      ? 'Daily Sleep Target Met!'
                      : 'Resting Heart Rate Ceiling Maintained!'}
                  </span>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    {isBothGoalsAchieved
                      ? `Sleep: ${currentSleepHours}h / ${dailyGoals.sleepHoursGoal}h · Pulse: ${currentHrDisplay} bpm / ≤${dailyGoals.heartRateTarget} bpm`
                      : isCurrentSleepAchieved
                      ? `${currentSleepHours}h restorative rest achieved (${sleepGoalPercent}% of ${dailyGoals.sleepHoursGoal}h goal)`
                      : `${currentHrDisplay} bpm resting heart rate within ceiling (≤${dailyGoals.heartRateTarget} bpm)`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    const goal = isBothGoalsAchieved ? 'both' : isCurrentSleepAchieved ? 'sleep' : 'heart_rate';
                    triggerGoalNotification(goal, { notifyToast: true });
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Display Encouraging Tip</span>
                </button>
              </div>
            </div>

            {/* In-Panel Encouraging Tip Card */}
            <div className="p-3.5 bg-white dark:bg-slate-900/80 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  {ENCOURAGING_TIPS_LIBRARY[isBothGoalsAchieved ? 'both' : isCurrentSleepAchieved ? 'sleep' : 'heart_rate'][activeTipIndex % ENCOURAGING_TIPS_LIBRARY[isBothGoalsAchieved ? 'both' : isCurrentSleepAchieved ? 'sleep' : 'heart_rate'].length].title}
                </span>
                <span className="text-[10px] text-slate-400">American College of Cardiology & NSF Standards</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                "{ENCOURAGING_TIPS_LIBRARY[isBothGoalsAchieved ? 'both' : isCurrentSleepAchieved ? 'sleep' : 'heart_rate'][activeTipIndex % ENCOURAGING_TIPS_LIBRARY[isBothGoalsAchieved ? 'both' : isCurrentSleepAchieved ? 'sleep' : 'heart_rate'].length].tip}"
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">
                  Clinical Benefit:{' '}
                  <strong className="text-slate-700 dark:text-slate-300 font-medium">
                    {ENCOURAGING_TIPS_LIBRARY[isBothGoalsAchieved ? 'both' : isCurrentSleepAchieved ? 'sleep' : 'heart_rate'][activeTipIndex % ENCOURAGING_TIPS_LIBRARY[isBothGoalsAchieved ? 'both' : isCurrentSleepAchieved ? 'sleep' : 'heart_rate'].length].clinicalBenefit}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const list = ENCOURAGING_TIPS_LIBRARY[isBothGoalsAchieved ? 'both' : isCurrentSleepAchieved ? 'sleep' : 'heart_rate'];
                    setActiveTipIndex((prev) => (prev + 1) % list.length);
                  }}
                  className="text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer self-end sm:self-auto"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Next Tip</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>
                Keep working toward your daily goals! When you reach {dailyGoals.sleepHoursGoal}h sleep or maintain resting heart rate ≤{dailyGoals.heartRateTarget} bpm, a local encouraging tip notification will celebrate your achievement.
              </span>
            </div>
            <button
              type="button"
              onClick={() => triggerGoalNotification('sleep', { notifyToast: true })}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              <span>Preview Encouraging Tip</span>
            </button>
          </div>
        )}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GOAL CARD 1: SLEEP HOURS GOAL */}
          <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Sleep Duration Goal</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Restorative circadian cycle</p>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    sleepGoalPercent >= 100
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : sleepGoalPercent >= 85
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {sleepGoalPercent >= 100
                    ? 'Goal Achieved'
                    : sleepGoalPercent >= 85
                    ? 'Near Target'
                    : 'Sleep Deficit'}
                </span>
              </div>

              {/* Goal Controls when Editing */}
              {isEditingGoals ? (
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-900/60 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Set Sleep Target:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                      {tempSleepGoal.toFixed(1)} hrs/night
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="11"
                    step="0.5"
                    value={tempSleepGoal}
                    onChange={(e) => setTempSleepGoal(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400">Presets:</span>
                    {[7.0, 7.5, 8.0, 8.5, 9.0].map((hours) => (
                      <button
                        key={hours}
                        type="button"
                        onClick={() => setTempSleepGoal(hours)}
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-colors cursor-pointer ${
                          tempSleepGoal === hours
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Numbers Overview */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {currentSleepHours}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                    / {dailyGoals.sleepHoursGoal.toFixed(1)} hrs goal
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                    {sleepGoalPercent}%
                  </span>
                  <span className="text-[11px] text-slate-400 block">completed</span>
                </div>
              </div>

              {/* Progress Indicator Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sleepGoalPercent >= 100
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                        : sleepGoalPercent >= 85
                        ? 'bg-gradient-to-r from-indigo-500 to-sky-400'
                        : 'bg-gradient-to-r from-amber-500 to-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, sleepGoalPercent))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>0h baseline</span>
                  <span>Target: {dailyGoals.sleepHoursGoal}h</span>
                  <span>
                    {sleepDiff >= 0 ? `+${sleepDiff}h surplus` : `${sleepDiff}h remaining`}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>7-Day Average: <strong className="text-slate-700 dark:text-slate-200">{stats.avgSleep} hrs</strong></span>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">Optimal: 7.0 - 9.0 hrs</span>
            </div>
          </div>

          {/* GOAL CARD 2: HEART RATE TARGET GOAL */}
          <div className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <Heart className="w-4 h-4 fill-rose-500/20" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Resting Heart Rate Ceiling</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Cardiovascular rest baseline</p>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    currentHrDisplay <= dailyGoals.heartRateTarget
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : currentHrDisplay <= dailyGoals.heartRateTarget + 8
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {currentHrDisplay <= dailyGoals.heartRateTarget
                    ? 'Target Maintained'
                    : `+${hrTargetDiff} bpm Above Target`}
                </span>
              </div>

              {/* Goal Controls when Editing */}
              {isEditingGoals ? (
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/60 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Set Resting Ceiling:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 font-mono text-sm">
                      ≤ {tempHeartRateGoal} bpm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="55"
                    max="90"
                    step="1"
                    value={tempHeartRateGoal}
                    onChange={(e) => setTempHeartRateGoal(parseInt(e.target.value, 10))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400">Presets:</span>
                    {[65, 70, 75, 80].map((bpm) => (
                      <button
                        key={bpm}
                        type="button"
                        onClick={() => setTempHeartRateGoal(bpm)}
                        className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-colors cursor-pointer ${
                          tempHeartRateGoal === bpm
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                        }`}
                      >
                        ≤{bpm} bpm
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Numbers Overview */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {currentHrDisplay}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                    bpm current (target ≤ {dailyGoals.heartRateTarget} bpm)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                    {hrGoalPercent}%
                  </span>
                  <span className="text-[11px] text-slate-400 block">zone efficiency</span>
                </div>
              </div>

              {/* Progress Indicator Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      currentHrDisplay <= dailyGoals.heartRateTarget
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                        : currentHrDisplay <= dailyGoals.heartRateTarget + 8
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                        : 'bg-gradient-to-r from-rose-500 to-rose-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, hrGoalPercent))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>50 bpm min</span>
                  <span>Ceiling: ≤ {dailyGoals.heartRateTarget} bpm</span>
                  <span>
                    {currentHrDisplay <= dailyGoals.heartRateTarget
                      ? 'Within safe zone'
                      : `+${hrTargetDiff} bpm above`}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Range: <strong className="text-slate-700 dark:text-slate-200">{stats.minHr} - {stats.maxHr} bpm</strong></span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">Resting Goal: ≤ {dailyGoals.heartRateTarget} bpm</span>
            </div>
          </div>
        </div>

        {/* 7-Day Goal Tracking & Streak Summary */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{currentStreak} Day Goal Streak</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Weekly Compliance: Sleep <strong className="text-indigo-600 dark:text-indigo-400">{weeklySleepCompliance}%</strong> · Resting HR <strong className="text-rose-600 dark:text-rose-400">{weeklyHrCompliance}%</strong>
              </span>
            </div>

            <span className="text-[11px] text-slate-400">
              Last 7 Logged Health Records · Click a day for details
            </span>
          </div>

          {/* 7-Day Day Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {goalTrackingHistory.map((day) => {
              const isSelected = selectedHistoryDayId === day.id;
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setSelectedHistoryDayId(isSelected ? null : day.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/50 dark:bg-teal-950/30'
                      : day.bothMet
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-300'
                      : day.sleepMet || day.hrMet
                      ? 'border-sky-200 dark:border-sky-800 bg-sky-50/30 dark:bg-sky-950/20 hover:border-sky-300'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{day.dayName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{day.dateLabel}</span>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Moon className="w-3 h-3 text-indigo-500" />
                        {day.sleepHours}h
                      </span>
                      {day.sleepMet ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500" />
                        {day.heartRate} bpm
                      </span>
                      {day.hrMet ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Inspection Card when a day is selected */}
          {selectedHistoryDayId && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between animate-in fade-in duration-150">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {goalTrackingHistory.find((d) => d.id === selectedHistoryDayId)?.dayName},{' '}
                  {goalTrackingHistory.find((d) => d.id === selectedHistoryDayId)?.dateLabel}:
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  Sleep: <strong>{goalTrackingHistory.find((d) => d.id === selectedHistoryDayId)?.sleepHours}h</strong>{' '}
                  ({goalTrackingHistory.find((d) => d.id === selectedHistoryDayId)?.sleepMet ? 'Target Met ✅' : 'Below Target ❌'})
                  {' · '}
                  Pulse: <strong>{goalTrackingHistory.find((d) => d.id === selectedHistoryDayId)?.heartRate} bpm</strong>{' '}
                  ({goalTrackingHistory.find((d) => d.id === selectedHistoryDayId)?.hrMet ? 'Ceiling Maintained ✅' : 'Above Ceiling ❌'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHistoryDayId(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-[11px]"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Historical Weekly Goal Achievements & Long-Term Accountability Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        {/* Section Header & Export Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-400">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Historical Weekly Goal Achievements
              </h2>
              <span className="text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full">
                Long-Term Accountability
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-week longitudinal compliance audit. Track adherence to your daily sleep ({dailyGoals.sleepHoursGoal}h) and resting heart rate (≤{dailyGoals.heartRateTarget} bpm) goals over past weeks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Export Weekly Table to CSV */}
            <button
              type="button"
              onClick={handleExportWeeklyAccountabilityCSV}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Download weekly goal achievement summary as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Export Weekly CSV</span>
            </button>
          </div>
        </div>

        {/* Accountability KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Overall Historical Compliance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                {weeklySummaryStats.overallCompliance}%
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                Target ≥75%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Weighted composite across all tracked weeks
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Weeks Meeting Targets
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-teal-700 dark:text-teal-400 font-mono">
                {weeklySummaryStats.weeksMet} / {weeklySummaryStats.totalWeeks}
              </span>
              <span className="text-[11px] text-slate-500">Weeks</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              {Math.round((weeklySummaryStats.weeksMet / weeklySummaryStats.totalWeeks) * 100)}% weekly success rate
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Gold Tier Weeks (Dual Met)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 font-mono">
                {weeklySummaryStats.goldWeeks}
              </span>
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
            </div>
            <span className="text-[10px] text-slate-400 block">
              Sleep and pulse both achieved simultaneously
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Current Weekly Streak
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-400 font-mono">
                {weeklySummaryStats.currentWeeklyStreak}
              </span>
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
            </div>
            <span className="text-[10px] text-slate-400 block">
              Consecutive weeks with ≥70% compliance
            </span>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </span>
            {[
              { id: 'all', label: `All Weeks (${weeklyGoalAchievements.length})` },
              { id: 'gold', label: `🏆 Gold Tier (${weeklyGoalAchievements.filter((w) => w.tier === 'gold').length})` },
              { id: 'sleep_met', label: '🌙 Sleep Met' },
              { id: 'hr_met', label: '❤️ Pulse Maintained' },
              { id: 'attention', label: '⚠️ Needs Focus' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setWeeklyAccountabilityFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  weeklyAccountabilityFilter === f.id
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search by week, date, note..."
              value={weeklySearchQuery}
              onChange={(e) => setWeeklySearchQuery(e.target.value)}
              className="px-3 py-1.5 pl-8 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-full sm:w-60"
            />
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            {weeklySearchQuery && (
              <button
                type="button"
                onClick={() => setWeeklySearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Weekly Goal Achievements Historical Log Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Week & Timeline</th>
                <th className="py-3 px-3">Sleep Target ({dailyGoals.sleepHoursGoal}h)</th>
                <th className="py-3 px-3">Resting HR (≤{dailyGoals.heartRateTarget} bpm)</th>
                <th className="py-3 px-3">Composite Score</th>
                <th className="py-3 px-3">Accountability Tier</th>
                <th className="py-3 px-4 hidden md:table-cell">Clinical Review</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {weeklyGoalAchievements
                .filter((w) => {
                  if (weeklyAccountabilityFilter === 'gold') return w.tier === 'gold';
                  if (weeklyAccountabilityFilter === 'sleep_met') return w.sleepCompliancePercent >= 70;
                  if (weeklyAccountabilityFilter === 'hr_met') return w.hrCompliancePercent >= 70;
                  if (weeklyAccountabilityFilter === 'attention') return w.compositeScore < 70;
                  return true;
                })
                .filter((w) => {
                  if (!weeklySearchQuery.trim()) return true;
                  const q = weeklySearchQuery.toLowerCase();
                  return (
                    w.dateRangeLabel.toLowerCase().includes(q) ||
                    w.relativeLabel.toLowerCase().includes(q) ||
                    w.statusLabel.toLowerCase().includes(q) ||
                    w.clinicalAccountabilityNote.toLowerCase().includes(q)
                  );
                })
                .map((week) => {
                  const isExpanded = expandedWeekId === week.weekId;
                  return (
                    <React.Fragment key={week.weekId}>
                      <tr
                        onClick={() => setExpandedWeekId(isExpanded ? null : week.weekId)}
                        className={`transition-colors cursor-pointer ${
                          isExpanded
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                            : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Week Period & Timeline */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              Week {week.weekNumber}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                week.relativeLabel === 'Current Week'
                                  ? 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-bold border border-teal-300 dark:border-teal-700'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {week.relativeLabel}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {week.dateRangeLabel}
                          </div>
                        </td>

                        {/* Sleep Performance */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                              {week.sleepHoursAvg}h
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              ({week.sleepDaysMet}/{week.sleepTotalDays} days)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  week.sleepCompliancePercent >= 85
                                    ? 'bg-emerald-500'
                                    : week.sleepCompliancePercent >= 70
                                    ? 'bg-sky-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${week.sleepCompliancePercent}%` }}
                              />
                            </div>
                            <span
                              className={`text-[10px] font-bold ${
                                week.sleepCompliancePercent >= 85
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : week.sleepCompliancePercent >= 70
                                  ? 'text-sky-700 dark:text-sky-400'
                                  : 'text-amber-700 dark:text-amber-400'
                              }`}
                            >
                              {week.sleepCompliancePercent}%
                            </span>
                          </div>
                        </td>

                        {/* Heart Rate Performance */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                              {week.heartRateAvg} bpm
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              ({week.hrDaysMet}/{week.hrTotalDays} days)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  week.hrCompliancePercent >= 85
                                    ? 'bg-emerald-500'
                                    : week.hrCompliancePercent >= 70
                                    ? 'bg-sky-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${week.hrCompliancePercent}%` }}
                              />
                            </div>
                            <span
                              className={`text-[10px] font-bold ${
                                week.hrCompliancePercent >= 85
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : week.hrCompliancePercent >= 70
                                  ? 'text-sky-700 dark:text-sky-400'
                                  : 'text-rose-700 dark:text-rose-400'
                              }`}
                            >
                              {week.hrCompliancePercent}%
                            </span>
                          </div>
                        </td>

                        {/* Composite Compliance Score */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-base font-extrabold font-mono ${
                                week.compositeScore >= 88
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : week.compositeScore >= 75
                                  ? 'text-sky-700 dark:text-sky-400'
                                  : week.compositeScore >= 60
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {week.compositeScore}%
                            </span>
                            <span className="text-[10px] text-slate-400">adherence</span>
                          </div>
                        </td>

                        {/* Accountability Tier Badge */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              week.tier === 'gold'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                                : week.tier === 'silver'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                                : week.tier === 'bronze'
                                ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {week.statusLabel}
                          </span>
                        </td>

                        {/* Clinical Review Note */}
                        <td className="py-3.5 px-4 hidden md:table-cell max-w-xs">
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {week.clinicalAccountabilityNote}
                          </p>
                        </td>

                        {/* Details Toggle Button */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={isExpanded ? 'Collapse daily details' : 'Expand daily breakdown'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Daily Accountability Row */}
                      {isExpanded && (
                        <tr className="bg-indigo-50/30 dark:bg-indigo-950/20 border-t border-b border-indigo-100 dark:border-indigo-900/40">
                          <td colSpan={7} className="p-4 sm:p-5">
                            <div className="space-y-3 animate-in fade-in duration-150">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/80 dark:border-indigo-900/40 pb-2">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    Day-by-Day Compliance Audit · Week {week.weekNumber} ({week.dateRangeLabel})
                                  </span>
                                </div>
                                <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                                  Sleep Target: ≥{dailyGoals.sleepHoursGoal}h · Resting HR Ceiling: ≤{dailyGoals.heartRateTarget} bpm
                                </span>
                              </div>

                              {/* Daily 7-day Breakdown Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                                {week.dailyBreakdown.map((day, dIdx) => (
                                  <div
                                    key={dIdx}
                                    className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                                      day.sleepMet && day.hrMet
                                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                                        : day.sleepMet || day.hrMet
                                        ? 'bg-sky-50/50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                      <span>{day.dayName}</span>
                                      <span className="text-[10px] text-slate-400 font-normal">{day.dateLabel}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="text-slate-500 flex items-center gap-1">
                                        <Moon className="w-3 h-3 text-indigo-500" />
                                        {day.sleepHours}h
                                      </span>
                                      {day.sleepMet ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                      ) : (
                                        <Minus className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="text-slate-500 flex items-center gap-1">
                                        <Heart className="w-3 h-3 text-rose-500" />
                                        {day.heartRate} bpm
                                      </span>
                                      {day.hrMet ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                      ) : (
                                        <Minus className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  Behavioral Accountability Summary:
                                </span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-medium text-[11px]">
                                  {week.clinicalAccountabilityNote}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Health Insights & Clinical Guidelines Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-xs">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                AI Health Insights & Clinical Guidelines
              </h2>
              <span className="text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>Gemini 3.8 Flash</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized physiological evaluation synthesized against American Heart Association (AHA), American College of Cardiology (ACC), National Sleep Foundation (NSF), & WHO medical standards.
            </p>
          </div>

          {/* Action Button & Timestamp */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {aiInsights?.generatedAt && (
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Analyzed at {aiInsights.generatedAt}
              </span>
            )}
            <button
              type="button"
              onClick={handleRefreshAIInsights}
              disabled={isGeneratingInsights}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-purple-600 dark:text-purple-400 ${
                  isGeneratingInsights ? 'animate-spin' : ''
                }`}
              />
              <span>{isGeneratingInsights ? 'Analyzing Vitals...' : 'Refresh AI Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Loading State Overlay / Skeleton */}
        {isGeneratingInsights ? (
          <div className="p-8 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-center space-y-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-800 mx-auto flex items-center justify-center text-purple-600 dark:text-purple-300">
              <RefreshCw className="w-5 h-5 animate-spin" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Analyzing Vitals with Gemini 3.8 Flash...
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Synthesizing heart rate dynamics, SpO2 pulmonary saturation, and circadian architecture with published medical guidelines.
            </p>
          </div>
        ) : (
          <>
            {/* Clinical Synthesis & Highlights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Overall Clinical Assessment */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 via-slate-50 to-teal-50/40 dark:from-purple-950/30 dark:via-slate-900 dark:to-teal-950/20 border border-purple-200/70 dark:border-purple-900/50 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Cardiopulmonary & Circadian Synthesis
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      aiInsights.riskLevel === 'Optimal'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : aiInsights.riskLevel === 'Low Risk'
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800'
                        : aiInsights.riskLevel === 'Moderate'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    Risk Status: {aiInsights.riskLevel}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {aiInsights.overallAssessment}
                </p>

                <div className="pt-2 border-t border-purple-100 dark:border-purple-900/40 flex items-start gap-2 text-xs text-purple-900 dark:text-purple-300">
                  <Lightbulb className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">{aiInsights.lifestyleAdvice}</p>
                </div>
              </div>

              {/* Key Observations List */}
              <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Physiological Highlights
                  </h3>
                </div>
                <ul className="space-y-2">
                  {aiInsights.keyObservations.map((obs, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 leading-snug"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Filter Pills for Recommendations */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Guideline-Grounded Recommendations ({filteredTips.length})
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {['all', 'Cardiovascular', 'Sleep', 'Pulmonary', 'Blood Pressure', 'Recovery'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedTipCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer capitalize ${
                      selectedTipCategory === cat
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {cat === 'all' ? 'All Focus Areas' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Personalized Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs hover:border-purple-300 dark:hover:border-purple-800 transition-all space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {tip.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span>Ref:</span>
                        <strong className="text-slate-700 dark:text-slate-300">{tip.guidelineRef}</strong>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {tip.title}
                    </h4>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Action:</strong> {tip.action}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Clinical Benefit:</strong> {tip.benefit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Safety Precautions & Medical Disclaimer */}
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Clinical Precaution Guidelines & Threshold Monitoring</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-850 dark:text-amber-300/90 leading-relaxed">
                {aiInsights.safetyFlags.map((flag, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600">•</span>
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                Note: AI Health Insights are educational recommendations referencing published clinical guidelines. For medical emergencies or acute symptoms, contact emergency services or consult your primary care physician immediately.
              </p>
            </div>
          </>
        )}
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                7-Day Physiological Trend History
              </h2>
              <span className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                Longitudinal Overview
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review daily changes and baseline stability across your logged readings
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            <button
              onClick={() => setSelectedChartMetric('heartRate')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedChartMetric === 'heartRate'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Heart Rate</span>
            </button>

            <button
              onClick={() => setSelectedChartMetric('oxygen')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedChartMetric === 'oxygen'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>SpO2 Oxygen</span>
            </button>

            <button
              onClick={() => setSelectedChartMetric('sleep')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedChartMetric === 'sleep'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Sleep Hours</span>
            </button>
          </div>
        </div>

        {/* Clean SVG Trend Chart */}
        <div className="pt-2">
          {chartData.length < 2 ? (
            <div className="h-56 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center p-6 text-slate-400">
              <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs">Add at least two vitals logs to render interactive trend line.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Reference Baseline Guide */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-2 px-2">
                <span>
                  Target Clinical Reference Band: {' '}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {selectedChartMetric === 'heartRate' && '60 - 100 bpm (Normal Resting Zone)'}
                    {selectedChartMetric === 'oxygen' && '95% - 100% (Adequate Saturation)'}
                    {selectedChartMetric === 'sleep' && '7.0 - 9.0 Hours (Restorative Sleep Target)'}
                  </strong>
                </span>
                <span>Latest 7 Recorded Entries</span>
              </div>

              {/* Chart Visualizer */}
              <div className="h-64 w-full bg-slate-50/50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                {/* SVG Curves */}
                <div className="relative h-48 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Reference Grid Lines */}
                    <line x1="0" y1="40" x2="600" y2="40" stroke="currentColor" strokeDasharray="4 4" className="text-slate-200 dark:text-slate-700" />
                    <line x1="0" y1="80" x2="600" y2="80" stroke="currentColor" strokeDasharray="4 4" className="text-slate-200 dark:text-slate-700" />
                    <line x1="0" y1="120" x2="600" y2="120" stroke="currentColor" strokeDasharray="4 4" className="text-slate-200 dark:text-slate-700" />

                    {/* Data coordinates mapping */}
                    {(() => {
                      const count = chartData.length;
                      let minVal = 0;
                      let maxVal = 100;

                      if (selectedChartMetric === 'heartRate') {
                        minVal = 55;
                        maxVal = 95;
                      } else if (selectedChartMetric === 'oxygen') {
                        minVal = 92;
                        maxVal = 100;
                      } else {
                        minVal = 4;
                        maxVal = 11;
                      }

                      const points = chartData.map((pt, idx) => {
                        const val =
                          selectedChartMetric === 'heartRate'
                            ? pt.heartRate
                            : selectedChartMetric === 'oxygen'
                            ? pt.oxygen
                            : pt.sleep;
                        const x = (idx / (count - 1)) * 560 + 20;
                        const y = 140 - ((val - minVal) / (maxVal - minVal)) * 120;
                        return { x, y: Math.max(10, Math.min(150, y)), val, label: pt.label, source: pt.source };
                      });

                      const pathD = points.reduce((acc, p, idx) => {
                        return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
                      }, '');

                      const areaD = `${pathD} L ${points[points.length - 1].x} 155 L ${points[0].x} 155 Z`;

                      const strokeColor =
                        selectedChartMetric === 'heartRate'
                          ? '#f43f5e'
                          : selectedChartMetric === 'oxygen'
                          ? '#0d9488'
                          : '#6366f1';

                      const gradientId =
                        selectedChartMetric === 'heartRate'
                          ? 'url(#roseGradient)'
                          : selectedChartMetric === 'oxygen'
                          ? 'url(#tealGradient)'
                          : 'url(#indigoGradient)';

                      return (
                        <g>
                          <path d={areaD} fill={gradientId} />
                          <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          {points.map((p, idx) => (
                            <g key={idx}>
                              <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke={strokeColor} strokeWidth="2.5" />
                              <text
                                x={p.x}
                                y={p.y - 10}
                                textAnchor="middle"
                                fill="currentColor"
                                className="text-[10px] font-bold text-slate-800 dark:text-slate-200 font-mono"
                              >
                                {p.val}
                                {selectedChartMetric === 'heartRate' ? ' bpm' : selectedChartMetric === 'oxygen' ? '%' : 'h'}
                              </text>
                            </g>
                          ))}
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                {/* X-Axis Day Labels */}
                <div className="flex justify-between items-center px-4 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  {chartData.map((d, idx) => (
                    <div key={idx} className="text-center">
                      <span>{d.label}</span>
                      <span className="block text-[9px] text-slate-400">
                        {d.source === 'simulated_sensor' ? 'BLE' : 'Manual'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Personalized Clinical Insights Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cardiovascular Status</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Resting heart rate has maintained a stable mean of <strong className="text-slate-900 dark:text-white">{stats.avgHr} bpm</strong>.
              No episodes of resting tachycardia recorded across recent telemetry frames.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-400">
              <Droplets className="w-3.5 h-3.5" />
              <span>Pulmonary Oxygenation</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Arterial SpO2 averages <strong className="text-slate-900 dark:text-white">{stats.avgSpo2}%</strong>, safely above the 95% clinical threshold.
              Consistent with robust alveolar gas exchange and healthy airway clearance.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400">
              <Moon className="w-3.5 h-3.5" />
              <span>Sleep & Recovery Hygiene</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Average restorative sleep stands at <strong className="text-slate-900 dark:text-white">{stats.avgSleep} hours</strong> per cycle.
              Meets standard CDC guidelines for metabolic regeneration.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Logs Data Table & Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Biometric Logs & Telemetry History ({filteredLogs.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete chronological audit trail with timestamp verification
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter pills */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setFilterSource('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterSource === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                All ({vitals.length})
              </button>
              <button
                onClick={() => setFilterSource('simulated')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterSource === 'simulated'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Sensor ({vitals.filter((v) => v.source === 'simulated_sensor').length})
              </button>
              <button
                onClick={() => setFilterSource('manual')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterSource === 'manual'
                    ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Manual ({vitals.filter((v) => v.source === 'manual_entry').length})
              </button>
            </div>

            {/* Export Vitals History to CSV */}
            <button
              type="button"
              onClick={() =>
                handleExportCSV(
                  filteredLogs,
                  filterSource === 'all'
                    ? 'All Vitals Records'
                    : filterSource === 'simulated'
                    ? 'Sensor Telemetry Records (BLE)'
                    : 'Manual Clinical Entries'
                )
              }
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Download vitals history as a formatted CSV spreadsheet for personal records"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV ({filteredLogs.length})</span>
            </button>

            {/* Reset to initial mock vitals */}
            {onResetDefaultVitals && (
              <button
                onClick={() => {
                  if (confirm('Reset vitals history to initial sample records?')) {
                    onResetDefaultVitals();
                    showToast('Vitals records reset to baseline samples.', 'info');
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                title="Restore default test data"
              >
                Reset Demo
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-3">Telemetry Source</th>
                <th className="py-3 px-3">Heart Rate</th>
                <th className="py-3 px-3">SpO2 Oxygen</th>
                <th className="py-3 px-3">Sleep Hours</th>
                <th className="py-3 px-3">Blood Pressure</th>
                <th className="py-3 px-4">Clinical Notes</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => {
                const dateObj = new Date(log.timestamp);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
                const formattedTime = dateObj.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{formattedDate}</div>
                      <div className="text-[11px] text-slate-400">{formattedTime}</div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {log.source === 'simulated_sensor' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          <Zap className="w-3 h-3 text-teal-600" />
                          Simulated Sensor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          <Sliders className="w-3 h-3 text-sky-600" />
                          Manual Entry
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{log.heartRate}</span>
                      <span className="text-slate-400 ml-1">bpm</span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{log.oxygenSaturation}%</span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{log.sleepHours}h</span>
                      {log.sleepQuality && (
                        <span className="text-[10px] text-slate-400 block capitalize">{log.sleepQuality}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-slate-700 dark:text-slate-300">
                      {log.bloodPressureSystolic && log.bloodPressureDiastolic
                        ? `${log.bloodPressureSystolic}/${log.bloodPressureDiastolic}`
                        : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate" title={log.notes}>
                      {log.notes || '—'}
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onDeleteVitalLog(log.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete this record"
                        aria-label="Delete vital log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Vitals Logging Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Log Personalized Vitals</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Record self-measured health observations</p>
                </div>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitManualLog} className="space-y-4 text-xs">
              {/* Timestamp field */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reading Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  required
                />
              </div>

              {/* Heart Rate & SpO2 in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Heart Rate */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Heart Rate (bpm)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="35"
                      max="220"
                      value={formHeartRate}
                      onChange={(e) => setFormHeartRate(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-600 font-mono font-bold"
                      required
                    />
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setFormHeartRate((p) => Math.max(40, p - 2))}
                        className="px-2 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormHeartRate((p) => Math.min(200, p + 2))}
                        className="px-2 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">Normal resting: 60 - 100 bpm</span>
                </div>

                {/* Oxygen Saturation */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    SpO2 Oxygen (%)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="70"
                      max="100"
                      value={formOxygen}
                      onChange={(e) => setFormOxygen(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-600 font-mono font-bold"
                      required
                    />
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setFormOxygen((p) => Math.max(80, p - 1))}
                        className="px-2 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormOxygen((p) => Math.min(100, p + 1))}
                        className="px-2 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">Target baseline: 95% - 100%</span>
                </div>
              </div>

              {/* Sleep Hours & Sleep Quality in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sleep Hours */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Sleep Duration (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="24"
                    value={formSleepHours}
                    onChange={(e) => setFormSleepHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-600 font-mono font-bold"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Target: 7.0 - 9.0 hours</span>
                </div>

                {/* Sleep Quality */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Sleep Quality Rating
                  </label>
                  <select
                    value={formSleepQuality}
                    onChange={(e) => setFormSleepQuality(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="optimal">Optimal (Deeply Rested)</option>
                    <option value="good">Good (Normal Rest)</option>
                    <option value="fair">Fair (Interrupted / Woke Up)</option>
                    <option value="poor">Poor (Restless / Short)</option>
                  </select>
                </div>
              </div>

              {/* Blood Pressure Systolic & Diastolic (Optional) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    BP Systolic (mmHg)
                  </label>
                  <input
                    type="number"
                    min="70"
                    max="250"
                    value={formBpSystolic}
                    onChange={(e) => setFormBpSystolic(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    BP Diastolic (mmHg)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="150"
                    value={formBpDiastolic}
                    onChange={(e) => setFormBpDiastolic(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contextual Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Measured 30 min post-breakfast, felt calm and alert"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {/* Info storage sync notice */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800 text-[11px] text-teal-850 dark:text-teal-300">
                <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>These logs are automatically saved to local storage and sync with the dashboard.</span>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  title="These logs are automatically saved to local storage and sync with the dashboard."
                  className="px-5 py-2 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Vitals Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Download Health Report Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Download Health Report</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Export biometric telemetry & vitals records</p>
                </div>
              </div>
              <button
                onClick={() => setIsDownloadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient & Data Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                <span>Patient: {currentUser.name}</span>
                <span className="text-teal-700 dark:text-teal-400 font-mono font-bold">{vitals.length} Logs Available</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                Includes heart rate (bpm), SpO2 oxygen saturation (%), sleep hours with architecture breakdown, and blood pressure telemetry.
              </p>
            </div>

            {/* Format Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* PDF Option */}
              <button
                type="button"
                onClick={() => handleDownloadReport('pdf')}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-rose-500 dark:hover:border-rose-400 hover:shadow-xs transition-all text-left space-y-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-xs block">Clinical PDF</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Printable summary with table & stats
                  </span>
                </div>
                <div className="pt-1 flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  <span>Download .pdf</span>
                  <Download className="w-3 h-3" />
                </div>
              </button>

              {/* CSV Option */}
              <button
                type="button"
                onClick={() => handleDownloadReport('csv')}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-xs transition-all text-left space-y-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-xs block">CSV Sheet</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Excel, Numbers & Sheets compatible
                  </span>
                </div>
                <div className="pt-1 flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                  <span>Download .csv</span>
                  <Download className="w-3 h-3" />
                </div>
              </button>

              {/* JSON Option */}
              <button
                type="button"
                onClick={() => handleDownloadReport('json')}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-xs transition-all text-left space-y-2 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-700 dark:text-sky-400 group-hover:scale-105 transition-transform">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-xs block">JSON Telemetry</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Raw structured clinical schema
                  </span>
                </div>
                <div className="pt-1 flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                  <span>Download .json</span>
                  <Download className="w-3 h-3" />
                </div>
              </button>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Instant direct file download</span>
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Encouraging Tips & Goal Achievement Notifications History Modal */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-4 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Goal Achievement Tips & Alerts
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Local history of celebratory tips earned from reaching daily health targets
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNotifModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs & Preferences Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: `All (${achievementHistory.length})` },
                  {
                    id: 'bookmarked',
                    label: `Saved (${achievementHistory.filter((n) => n.bookmarked).length})`,
                  },
                  {
                    id: 'sleep',
                    label: 'Sleep 🌙',
                  },
                  {
                    id: 'heart_rate',
                    label: 'Heart Rate ❤️',
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setNotifHistoryFilter(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      notifHistoryFilter === tab.id
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = !isNotifSoundEnabled;
                    setIsNotifSoundEnabled(next);
                    showToast(next ? 'Celebration chime enabled 🔔' : 'Celebration chime muted 🔕', 'info');
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Toggle chime sound"
                >
                  {isNotifSoundEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Sound On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sound Off</span>
                    </>
                  )}
                </button>

                {achievementHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Clear all saved goal achievement tips history?')) {
                        setAchievementHistory([]);
                        localStorage.removeItem('hc_hub_goal_notifications');
                        showToast('Notification history cleared.', 'info');
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Notification Items List */}
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {achievementHistory
                .filter((item) => {
                  if (notifHistoryFilter === 'bookmarked') return item.bookmarked;
                  if (notifHistoryFilter === 'sleep') return item.goalType === 'sleep' || item.goalType === 'both';
                  if (notifHistoryFilter === 'heart_rate')
                    return item.goalType === 'heart_rate' || item.goalType === 'both';
                  return true;
                })
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            item.goalType === 'both'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                              : item.goalType === 'sleep'
                              ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {item.goalType === 'both' ? (
                            <Trophy className="w-3.5 h-3.5" />
                          ) : item.goalType === 'sleep' ? (
                            <Moon className="w-3.5 h-3.5" />
                          ) : (
                            <Heart className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {item.tipHeadline}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = achievementHistory.map((hist) =>
                              hist.id === item.id ? { ...hist, bookmarked: !hist.bookmarked } : hist
                            );
                            setAchievementHistory(updated);
                            showToast(
                              !item.bookmarked
                                ? 'Encouraging tip saved to bookmarks!'
                                : 'Tip removed from bookmarks.',
                              'info'
                            );
                          }}
                          className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            item.bookmarked
                              ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                          title={item.bookmarked ? 'Remove bookmark' : 'Bookmark tip'}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${item.bookmarked ? 'fill-amber-500' : ''}`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyTip(item.encouragingTip)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Copy tip"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveAchievementNotif(item);
                            setNotifProgress(100);
                            setIsNotifPaused(false);
                            setIsNotifModalOpen(false);
                            playAchievementChime();
                          }}
                          className="p-1.5 rounded-lg text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors cursor-pointer"
                          title="Display as active notification banner"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      "{item.encouragingTip}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-mono">{item.metricSummary}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Target Achieved
                      </span>
                    </div>
                  </div>
                ))}

              {achievementHistory.length === 0 && (
                <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    No Goal Achievement Alerts Yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Achieve your daily sleep duration target or keep your resting heart rate within your goal ceiling to trigger local encouraging tips.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      triggerGoalNotification('both', { notifyToast: true });
                      setIsNotifModalOpen(false);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    🎉 Trigger Encouraging Tip Now
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
              <span>Local notifications stored in your browser session</span>
              <button
                type="button"
                onClick={() => setIsNotifModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
