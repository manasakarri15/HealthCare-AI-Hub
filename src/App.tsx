/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Compass,
  FileText,
  Heart,
  Package,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';

import {
  Appointment,
  CartItem,
  DiabetesAssessmentResult,
  Doctor,
  HealthCategory,
  HealthCategoryId,
  NotificationItem,
  Order,
  Product,
  UserProfile,
  VitalLog,
} from './types';
import { HEALTH_CATEGORIES } from './data/categories';
import { DOCTORS } from './data/doctors';
import { HEALTH_PRODUCTS } from './data/products';
import { INITIAL_VITALS } from './data/mockData';
import { storage } from './utils/storage';

import { MedicalDisclaimerBanner } from './components/MedicalDisclaimer';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AuthModal } from './components/AuthModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { CategoryBrowser } from './components/CategoryBrowser';
import { CategoryDetailView } from './components/CategoryDetailView';
import { DiabetesRiskAssessment } from './components/DiabetesRiskAssessment';
import { DoctorDirectory } from './components/DoctorDirectory';
import { DoctorBookingModal } from './components/DoctorBookingModal';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { TelehealthRoomModal } from './components/TelehealthRoomModal';
import { UserDashboard } from './components/UserDashboard';
import { HealthMetricsPanel } from './components/HealthMetricsPanel';
import { GeminiChatModal } from './components/GeminiChatModal';

export default function App() {
  // Navigation State
  const [activeView, setActiveView] = useState<string>('home');
  const [dashboardInitialTab, setDashboardInitialTab] = useState<'assessments' | 'appointments' | 'orders' | 'metrics'>('assessments');
  const [selectedCategoryId, setSelectedCategoryId] = useState<HealthCategoryId>('diabetes');

  // Core Data State (with localStorage persistence)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storage.getUser());
  const [cart, setCart] = useState<CartItem[]>(() => storage.getCart());
  const [appointments, setAppointments] = useState<Appointment[]>(() => storage.getAppointments());
  const [assessments, setAssessments] = useState<DiabetesAssessmentResult[]>(() => storage.getAssessments());
  const [orders, setOrders] = useState<Order[]>(() => storage.getOrders());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => storage.getNotifications());
  const [vitals, setVitals] = useState<VitalLog[]>(() => storage.getVitals());

  // Modal Dialog States
  const [geminiChatOpen, setGeminiChatOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [productDetailModalOpen, setProductDetailModalOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [telehealthModalOpen, setTelehealthModalOpen] = useState(false);
  const [activeTelehealthAppt, setActiveTelehealthAppt] = useState<Appointment | null>(null);

  // Sync state to storage
  useEffect(() => {
    storage.setUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    storage.setCart(cart);
  }, [cart]);

  useEffect(() => {
    storage.setAppointments(appointments);
  }, [appointments]);

  useEffect(() => {
    storage.setAssessments(assessments);
  }, [assessments]);

  useEffect(() => {
    storage.setOrders(orders);
  }, [orders]);

  useEffect(() => {
    storage.setNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    storage.setVitals(vitals);
  }, [vitals]);

  // Global Keyboard Shortcut for Search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleSelectCategory = (catId: HealthCategoryId) => {
    setSelectedCategoryId(catId);
    setActiveView('category-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDoctorBooking = (doctor: Doctor) => {
    setSelectedDoctorForBooking(doctor);
    setBookingModalOpen(true);
  };

  const handleBookingConfirmed = (newAppt: Appointment) => {
    setAppointments((prev) => [newAppt, ...prev]);

    // Create a new notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Appointment Booked',
      message: `Consultation confirmed with ${newAppt.doctorName} for ${newAppt.date} at ${newAppt.time}.`,
      timestamp: 'Just now',
      read: false,
      type: 'appointment',
      linkTab: 'appointments',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateCartQty = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
    } else {
      setCart((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity: newQty } : i))
      );
    }
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleProceedToCheckout = () => {
    setCartDrawerOpen(false);
    setCheckoutModalOpen(true);
  };

  const handleOrderPlaced = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]); // Clear cart

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Medical Order Confirmed',
      message: `Order #${newOrder.id} (${newOrder.items.length} items) placed. Tracking: ${newOrder.trackingNumber}.`,
      timestamp: 'Just now',
      read: false,
      type: 'order',
      linkTab: 'orders',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleSaveAssessment = (result: DiabetesAssessmentResult) => {
    setAssessments((prev) => [result, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Diabetes Risk Stored',
      message: `Calculated 5-year risk: ${result.riskProbability}% (${result.riskLevel} Risk).`,
      timestamp: 'Just now',
      read: false,
      type: 'assessment',
      linkTab: 'assessments',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleCancelAppointment = (apptId: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status: 'cancelled' } : a))
    );
  };

  const handleJoinTelehealth = (appt: Appointment) => {
    setActiveTelehealthAppt(appt);
    setTelehealthModalOpen(true);
  };

  const handleEndTelehealthCall = (apptId: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status: 'completed' } : a))
    );
  };

  const handleMarkAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAllNotifs = () => {
    setNotifications([]);
  };

  const handleAddVitalLog = (logData: Omit<VitalLog, 'id'>) => {
    const newLog: VitalLog = {
      ...logData,
      id: `vital-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setVitals((prev) => [newLog, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-vital-${Date.now()}`,
      title: 'Vitals Logged Successfully',
      message: `Recorded ${newLog.heartRate} bpm, ${newLog.oxygenSaturation}% SpO2, and ${newLog.sleepHours}h sleep.`,
      timestamp: 'Just now',
      read: false,
      type: 'vital',
      linkTab: 'metrics',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleDeleteVitalLog = (id: string) => {
    setVitals((prev) => prev.filter((v) => v.id !== id));
  };

  const handleResetDefaultVitals = () => {
    setVitals(INITIAL_VITALS);
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setNotificationsDrawerOpen(false);
    if (notif.linkTab === 'metrics') {
      setDashboardInitialTab('metrics');
      setActiveView('dashboard');
    } else if (notif.linkTab) {
      setDashboardInitialTab(notif.linkTab);
      setActiveView('dashboard');
    } else {
      setActiveView('dashboard');
    }
  };

  // Find active category object
  const currentCategory =
    HEALTH_CATEGORIES.find((c) => c.id === selectedCategoryId) || HEALTH_CATEGORIES[0];

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-150">
      {/* Top Clinical Prototype & Disclaimer Notice */}
      <MedicalDisclaimerBanner />

      {/* Strict Top Bar Contract Navigation */}
      <Navbar
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCategory={handleSelectCategory}
        cartCount={totalCartCount}
        unreadNotifsCount={unreadNotifsCount}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenNotifs={() => setNotificationsDrawerOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenGeminiChat={() => setGeminiChatOpen(true)}
        currentUser={currentUser}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* VIEW 1: HOME VIEW */}
        {activeView === 'home' && (
          <div className="space-y-16">
            {/* Hero Section */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
              <div className="max-w-3xl space-y-6 relative z-10">
                <div className="inline-flex items-center gap-2 text-teal-800 dark:text-teal-300 text-xs font-bold tracking-wide uppercase bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-md border border-teal-200 dark:border-teal-800/80">
                  <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Preventive Clinical Intelligence Platform</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Intelligent Healthcare Hub: <br />
                  <span className="text-teal-700 dark:text-teal-400">Predictive AI Screening</span> & Specialist Care
                </h1>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  Analyze metabolic risk factors using our validated XGBoost diabetes machine learning model, converse with our multimodal Gemini assistant with Google Search & Maps Grounding, schedule consultations with board-certified physicians, and order verified diagnostic supplies.
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setActiveView('assessment');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-3 bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Run Diabetes AI Assessment</span>
                  </button>

                  <button
                    onClick={() => setGeminiChatOpen(true)}
                    className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Ask Gemini Assistant & Voice</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('doctors');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-transparent dark:border-slate-700"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Find Specialist Doctors</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('categories');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Browse 7 Categories
                  </button>
                </div>

                {/* Proof & Rigor strip (clean metadata, no pill slop) */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>XGBoost Decision Tree Surrogate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>SHAP Factor Attribution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>HIPAA Compliant Video Consulting</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured AI Risk Assessment Spotlight Banner */}
            <section className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden border border-slate-800/80">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Featured Predictive Model</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Machine Learning Diabetes Risk Evaluation
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                    Our calibrated gradient boosted tree algorithm evaluates non-linear relationships between fasting plasma glucose, BMI, age, and insulin resistance indicators. Gain a transparent probability score and specific lifestyle intervention roadmap.
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => {
                        setActiveView('assessment');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span>Take AI Assessment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-400">Takes ~2 minutes · Instant SHAP explainability</span>
                  </div>
                </div>

                {/* Simulated Risk Meter Mockup */}
                <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>XGBoost Inferred Probability</span>
                    <span className="font-mono text-teal-300 font-semibold">Pre-Diabetes Alert</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white tabular-nums">38%</span>
                    <span className="text-xs text-slate-300">5-year projected risk</span>
                  </div>
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="w-[38%] h-full bg-amber-400 rounded-full" />
                  </div>
                  <div className="pt-2 text-[11px] text-slate-300 space-y-1">
                    <p>• Impaired Fasting Glucose (+10.5% risk contribution)</p>
                    <p>• 1st Degree Family History (+6.5% risk contribution)</p>
                    <p>• Blood pressure normal (-2.0% protective factor)</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Live Biometric Health Metrics Snapshot Card */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
                      Live Physiological Telemetry
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Mock Optical Sensor Active
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Personalized Vitals Dashboard & Trend Tracking
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Continuously monitor your cardiovascular pulse rhythm, blood oxygen saturation (SpO2), and sleep architecture. Run automated optical sensor simulations or manually log clinical vitals.
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        setActiveView('metrics');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Activity className="w-4 h-4" />
                      <span>Open Health Metrics Panel</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveView('metrics');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      <span>Simulate Sensor Reading</span>
                    </button>
                  </div>
                </div>

                {/* Live mini vitals meters */}
                <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
                  <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center min-w-[110px]">
                    <div className="w-7 h-7 mx-auto mb-2 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                      <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {vitals[0]?.heartRate || 72}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">bpm Heart Rate</div>
                    <span className="text-[9px] text-teal-600 dark:text-teal-400 font-bold block mt-0.5">Resting Zone</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center min-w-[110px]">
                    <div className="w-7 h-7 mx-auto mb-2 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {vitals[0]?.oxygenSaturation || 98}%
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">SpO2 Oxygen</div>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">Optimal Sat.</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center min-w-[110px]">
                    <div className="w-7 h-7 mx-auto mb-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {vitals[0]?.sleepHours || 7.6}h
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Sleep Duration</div>
                    <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold block mt-0.5">Restorative</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Health Categories Section */}
            <CategoryBrowser
              onSelectCategory={handleSelectCategory}
              onOpenAssessment={() => {
                setActiveView('assessment');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Featured Specialist Doctors Section */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Specialist Physicians</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Consult with Leading Clinical Specialists
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                    Book convenient telehealth video visits or in-person consultations with board-certified practitioners.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveView('doctors');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Doctors ({DOCTORS.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {DOCTORS.slice(0, 3).map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-start gap-3.5">
                        <img
                          src={doc.image}
                          alt={doc.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{doc.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{doc.title}</p>
                          <p className="text-[11px] text-teal-800 dark:text-teal-300 font-medium truncate mt-0.5">
                            {doc.hospital}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                        {doc.about}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400">Telehealth: </span>
                        <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                          ${doc.telehealthFee}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenDoctorBooking(doc)}
                        className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Book Visit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Healthcare Products Section */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
                    <Package className="w-3.5 h-3.5" />
                    <span>Medical Devices & Supplements</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Essential Health & Diagnostic Supplies
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                    Hospital-standard blood glucose meters, upper arm blood pressure cuffs, and clinically formulated therapeutics.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveView('products');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Supplies ({HEALTH_PRODUCTS.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {HEALTH_PRODUCTS.slice(0, 4).map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setSelectedProductForDetail(prod);
                      setProductDetailModalOpen(true);
                    }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden mb-3 relative">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>

                      <span className="text-[10px] text-slate-400 font-medium block">
                        {prod.brand}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mt-0.5 group-hover:text-teal-800 dark:group-hover:text-teal-300">
                        {prod.name}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                        ${prod.price.toFixed(2)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(prod);
                        }}
                        className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: CATEGORIES VIEW */}
        {activeView === 'categories' && (
          <div className="space-y-8">
            <CategoryBrowser
              onSelectCategory={handleSelectCategory}
              onOpenAssessment={() => {
                setActiveView('assessment');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* VIEW 3: CATEGORY DETAIL VIEW */}
        {activeView === 'category-detail' && (
          <CategoryDetailView
            category={currentCategory}
            onBack={() => setActiveView('categories')}
            onOpenAssessment={() => {
              setActiveView('assessment');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBookDoctor={handleOpenDoctorBooking}
            onSelectDoctorProfile={(doc) => handleOpenDoctorBooking(doc)}
            onAddToCart={handleAddToCart}
            onSelectProduct={(prod) => {
              setSelectedProductForDetail(prod);
              setProductDetailModalOpen(true);
            }}
          />
        )}

        {/* VIEW 4: DIABETES AI RISK ASSESSMENT */}
        {activeView === 'assessment' && (
          <DiabetesRiskAssessment
            onSaveAssessment={handleSaveAssessment}
            onBookDoctor={(specialty) => {
              const endocrinologist = DOCTORS.find((d) => d.categoryId === 'diabetes') || DOCTORS[0];
              handleOpenDoctorBooking(endocrinologist);
            }}
          />
        )}

        {/* VIEW 5: DOCTORS DIRECTORY */}
        {activeView === 'doctors' && (
          <DoctorDirectory
            onBookDoctor={handleOpenDoctorBooking}
            onSelectDoctorProfile={(doc) => handleOpenDoctorBooking(doc)}
          />
        )}

        {/* VIEW 6: PRODUCTS / STORE */}
        {activeView === 'products' && (
          <ProductCatalog
            onAddToCart={handleAddToCart}
            onSelectProduct={(prod) => {
              setSelectedProductForDetail(prod);
              setProductDetailModalOpen(true);
            }}
          />
        )}

        {/* VIEW 7: PATIENT DASHBOARD */}
        {activeView === 'dashboard' && (
          <UserDashboard
            currentUser={currentUser}
            assessments={assessments}
            appointments={appointments}
            orders={orders}
            vitals={vitals}
            onAddVitalLog={handleAddVitalLog}
            onDeleteVitalLog={handleDeleteVitalLog}
            onResetDefaultVitals={handleResetDefaultVitals}
            initialTab={dashboardInitialTab}
            onOpenAssessment={() => {
              setActiveView('assessment');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenDoctorDirectory={() => {
              setActiveView('doctors');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenProducts={() => {
              setActiveView('products');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onJoinTelehealth={handleJoinTelehealth}
            onCancelAppointment={handleCancelAppointment}
            onSwitchProfile={() => setAuthModalOpen(true)}
          />
        )}

        {/* VIEW 8: HEALTH METRICS & BIOMETRIC TELEMETRY */}
        {activeView === 'metrics' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <HealthMetricsPanel
              currentUser={currentUser}
              vitals={vitals}
              onAddVitalLog={handleAddVitalLog}
              onDeleteVitalLog={handleDeleteVitalLog}
              onResetDefaultVitals={handleResetDefaultVitals}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCategory={handleSelectCategory}
        onOpenDisclaimer={() => {
          // Open disclaimer modal
          const btn = document.querySelector('button[aria-label="Read Healthcare Disclaimer"]');
          if (btn) (btn as HTMLElement).click();
        }}
      />

      {/* Global Modals & Drawers */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectCategory={handleSelectCategory}
        onSelectDoctor={(docId) => {
          const doc = DOCTORS.find((d) => d.id === docId);
          if (doc) handleOpenDoctorBooking(doc);
        }}
        onSelectProduct={(prodId) => {
          const prod = HEALTH_PRODUCTS.find((p) => p.id === prodId);
          if (prod) {
            setSelectedProductForDetail(prod);
            setProductDetailModalOpen(true);
          }
        }}
        onOpenAssessment={() => {
          setActiveView('assessment');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={(newUser) => setCurrentUser(newUser)}
      />

      <NotificationsDrawer
        isOpen={notificationsDrawerOpen}
        onClose={() => setNotificationsDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotifsRead}
        onClearAll={handleClearAllNotifs}
        onNotificationClick={handleNotificationClick}
      />

      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        items={cart}
        currentUser={currentUser}
        onOrderPlaced={handleOrderPlaced}
        onViewOrdersInDashboard={() => {
          setActiveView('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <DoctorBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        doctor={selectedDoctorForBooking}
        currentUser={currentUser}
        onBookingConfirmed={handleBookingConfirmed}
        onViewInDashboard={() => {
          setActiveView('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <ProductDetailModal
        isOpen={productDetailModalOpen}
        onClose={() => setProductDetailModalOpen(false)}
        product={selectedProductForDetail}
        onAddToCart={handleAddToCart}
      />

      <TelehealthRoomModal
        isOpen={telehealthModalOpen}
        onClose={() => setTelehealthModalOpen(false)}
        appointment={activeTelehealthAppt}
        currentUser={currentUser}
        onEndCall={handleEndTelehealthCall}
      />

      {/* Gemini AI Assistant Modal */}
      <GeminiChatModal
        isOpen={geminiChatOpen}
        onClose={() => setGeminiChatOpen(false)}
      />

      {/* Global Floating AI Assistant & Voice Button */}
      <button
        onClick={() => setGeminiChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-teal-800 hover:bg-teal-900 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl border border-teal-600/50 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer group"
        title="Open Gemini Medical Assistant & Live Voice"
        aria-label="Gemini AI Assistant"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-teal-800"></span>
        </div>
        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          Ask Gemini AI / Voice
        </span>
      </button>
    </div>
  );
}
