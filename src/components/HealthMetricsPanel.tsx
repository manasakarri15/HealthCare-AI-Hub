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
  Lightbulb,
  Stethoscope,
  BookmarkCheck,
  ChevronDown,
  Flame,
  Trophy,
  Minus,
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
  const handleDownloadReport = (format: 'csv' | 'json' | 'pdf') => {
    if (!vitals.length) {
      showToast('No vitals records available to export.', 'info');
      return;
    }

    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = currentUser.name.replace(/\s+/g, '_');

    if (format === 'csv') {
      const metadataRows = [
        ['# CLINICAL HEALTH METRICS & BIOMETRIC TELEMETRY REPORT'],
        [`# Patient Name: ${currentUser.name}`],
        [`# Patient ID: ${currentUser.id}`],
        [`# Demographics: Age ${currentUser.age} | ${currentUser.gender} | Blood Group: ${currentUser.bloodType}`],
        [`# Primary Clinical Focus: ${currentUser.primaryCondition || 'General Health Monitoring'}`],
        [`# Report Generated: ${new Date().toISOString()}`],
        [`# Total Records: ${stats.totalLogs}`],
        [`# Average Resting Heart Rate: ${stats.avgHr} bpm (Range: ${stats.minHr} - ${stats.maxHr} bpm)`],
        [`# Average Oxygen Saturation (SpO2): ${stats.avgSpo2}%`],
        [`# Average Sleep Duration: ${stats.avgSleep} hrs/night`],
        [],
      ];

      const headers = [
        'Timestamp',
        'Source',
        'Heart Rate (bpm)',
        'SpO2 (%)',
        'Sleep (hours)',
        'Sleep Quality',
        'BP Systolic (mmHg)',
        'BP Diastolic (mmHg)',
        'Clinical Notes',
      ];

      const dataRows = vitals.map((v) => [
        v.timestamp,
        v.source === 'simulated_sensor' ? 'Simulated Sensor (BLE)' : 'Manual Entry',
        v.heartRate,
        v.oxygenSaturation,
        v.sleepHours,
        v.sleepQuality || 'N/A',
        v.bloodPressureSystolic || '',
        v.bloodPressureDiastolic || '',
        `"${(v.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [
          ...metadataRows.map((r) => r.join(',')),
          headers.join(','),
          ...dataRows.map((r) => r.join(',')),
        ].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Health_Report_${safeName}_${timestampStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Health Report (CSV) downloaded successfully!', 'success');
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
  const handleExportCSV = () => {
    handleDownloadReport('csv');
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
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${hrZone.bg} ${hrZone.color}`}>
                {hrZone.label}
              </span>
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
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${spo2Status.bg} ${spo2Status.color}`}>
                {spo2Status.label}
              </span>
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
          <div className="flex items-center gap-2 self-start sm:self-auto">
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

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download vitals history as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
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
    </div>
  );
};
