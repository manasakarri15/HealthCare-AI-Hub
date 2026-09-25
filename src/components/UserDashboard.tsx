import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  User,
  Video,
  Heart,
} from 'lucide-react';
import { Appointment, DiabetesAssessmentResult, Order, UserProfile, VitalLog } from '../types';
import { HealthMetricsPanel } from './HealthMetricsPanel';

interface UserDashboardProps {
  currentUser: UserProfile;
  assessments: DiabetesAssessmentResult[];
  appointments: Appointment[];
  orders: Order[];
  vitals: VitalLog[];
  onAddVitalLog: (log: Omit<VitalLog, 'id'>) => void;
  onDeleteVitalLog: (id: string) => void;
  onResetDefaultVitals?: () => void;
  initialTab?: 'assessments' | 'appointments' | 'orders' | 'metrics';
  onOpenAssessment: () => void;
  onOpenDoctorDirectory: () => void;
  onOpenProducts: () => void;
  onJoinTelehealth: (appt: Appointment) => void;
  onCancelAppointment: (apptId: string) => void;
  onSwitchProfile: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  assessments,
  appointments,
  orders,
  vitals,
  onAddVitalLog,
  onDeleteVitalLog,
  onResetDefaultVitals,
  initialTab = 'assessments',
  onOpenAssessment,
  onOpenDoctorDirectory,
  onOpenProducts,
  onJoinTelehealth,
  onCancelAppointment,
  onSwitchProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'assessments' | 'appointments' | 'orders' | 'metrics' | 'profile'>(initialTab);
  const [selectedAssessment, setSelectedAssessment] = useState<DiabetesAssessmentResult | null>(
    assessments[0] || null
  );

  const upcomingAppointments = appointments.filter((a) => a.status === 'confirmed');
  const pastAppointments = appointments.filter((a) => a.status !== 'confirmed');

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Patient Profile Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {currentUser.name}
              </h1>
              <span className="text-[11px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md font-semibold border border-teal-200">
                Verified Patient
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 mt-2">
              <span>{currentUser.age} yrs</span>
              <span aria-hidden="true">·</span>
              <span>{currentUser.gender}</span>
              <span aria-hidden="true">·</span>
              <span>Blood: {currentUser.bloodType}</span>
              <span aria-hidden="true">·</span>
              <span className="text-teal-800 font-medium">{currentUser.primaryCondition}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onSwitchProfile}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer self-start md:self-auto"
        >
          Switch Account / Persona
        </button>
      </div>

      {/* Main Tabs (Segmented controls) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl max-w-fit border border-transparent dark:border-slate-700/60">
        <button
          onClick={() => setActiveTab('assessments')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'assessments'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-teal-300 shadow-xs border border-transparent dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>AI Health Assessments ({assessments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'appointments'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-teal-300 shadow-xs border border-transparent dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>My Appointments ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-teal-300 shadow-xs border border-transparent dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Orders & Supplies ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'metrics'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-rose-400 shadow-xs border border-transparent dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span>Health Metrics & Vitals ({vitals.length})</span>
        </button>
      </div>

      {/* TAB 1: HEALTH ASSESSMENTS */}
      {activeTab === 'assessments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Saved AI Risk Assessments</h2>
              <p className="text-xs text-slate-500">
                Machine learning evaluations with SHAP factor attributions and lifestyle action plans
              </p>
            </div>
            <button
              onClick={onOpenAssessment}
              className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Assessment</span>
            </button>
          </div>

          {assessments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No assessments taken yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Take the XGBoost Diabetes Risk Screener to evaluate your metabolic profile.
              </p>
              <button
                onClick={onOpenAssessment}
                className="mt-4 px-4 py-2 bg-teal-700 text-white text-xs font-semibold rounded-lg"
              >
                Launch Screener
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Assessments List (5 Cols) */}
              <div className="lg:col-span-5 space-y-3">
                {assessments.map((evalItem) => {
                  const isSelected = selectedAssessment?.id === evalItem.id;
                  return (
                    <div
                      key={evalItem.id}
                      onClick={() => setSelectedAssessment(evalItem)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-teal-600 ring-1 ring-teal-600 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 tabular-nums">
                          {new Date(evalItem.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            evalItem.riskLevel === 'Low'
                              ? 'bg-emerald-100 text-emerald-800'
                              : evalItem.riskLevel === 'Medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {evalItem.riskLevel} Risk
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                          {evalItem.riskProbability}%
                        </span>
                        <span className="text-xs text-slate-500">5-year estimated probability</span>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {evalItem.clinicalSummary}
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-800 font-medium">
                        <span>Fasting Glucose: {evalItem.inputs.glucose} mg/dL</span>
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <span>View Detail</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Assessment Details Pane (7 Cols) */}
              <div className="lg:col-span-7">
                {selectedAssessment && (
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                          Full Clinical Breakdown
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">
                          Diabetes Risk Assessment Details
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400 tabular-nums">
                        {new Date(selectedAssessment.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Vitals snapshot */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">Fasting Glucose</span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {selectedAssessment.inputs.glucose} mg/dL
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">BMI</span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {selectedAssessment.inputs.bmi.toFixed(1)} kg/m²
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">Blood Pressure</span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {selectedAssessment.inputs.bloodPressure} mmHg
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">Activity</span>
                        <span className="font-bold text-slate-900 capitalize">
                          {selectedAssessment.inputs.physicalActivity}
                        </span>
                      </div>
                    </div>

                    {/* SHAP Factor contributions */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Feature Importance Analysis
                      </h4>
                      <div className="space-y-2">
                        {selectedAssessment.topDrivers.map((driver) => (
                          <div
                            key={driver.feature}
                            className="p-3 bg-rose-50/40 rounded-xl border border-rose-100 text-xs space-y-1"
                          >
                            <div className="flex justify-between font-medium">
                              <span className="text-slate-900">{driver.label}</span>
                              <span className="text-rose-700 font-semibold tabular-nums">
                                +{Math.round(driver.impactScore * 10)}% risk contribution
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">{driver.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actionable recommendations */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <span className="font-bold text-slate-900 uppercase tracking-wider block">
                        Recommended Medical Next Steps:
                      </span>
                      <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                        {selectedAssessment.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 flex justify-between items-center">
                      <button
                        onClick={onOpenDoctorDirectory}
                        className="py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
                      >
                        Schedule Endocrinologist Follow-Up
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Patient Appointments</h2>
              <p className="text-xs text-slate-500">
                Scheduled telehealth video consultations and outpatient clinical visits
              </p>
            </div>
            <button
              onClick={onOpenDoctorDirectory}
              className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Specialist</span>
            </button>
          </div>

          {/* Upcoming Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Upcoming Scheduled Visits ({upcomingAppointments.length})
            </h3>

            {upcomingAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No upcoming consultations booked.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start gap-3.5">
                        <img
                          src={appt.doctorImage}
                          alt={appt.doctorName}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {appt.doctorName}
                            </h4>
                            <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                              Confirmed
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">{appt.doctorSpecialty}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium mt-2">
                            <Clock className="w-3.5 h-3.5 text-teal-700" />
                            <span className="tabular-nums">
                              {appt.date} at {appt.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      {appt.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg mt-3 border border-slate-100">
                          {appt.notes}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 capitalize">
                        {appt.type === 'telehealth' ? 'Video Telehealth' : 'In-Person Clinic'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onCancelAppointment(appt.id)}
                          className="text-slate-400 hover:text-rose-600 font-medium transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        {appt.type === 'telehealth' && (
                          <button
                            onClick={() => onJoinTelehealth(appt)}
                            className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Video Call</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Appointments Section */}
          {pastAppointments.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Past Consultations ({pastAppointments.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 text-xs flex items-center justify-between opacity-85"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">{appt.doctorName}</h4>
                      <p className="text-slate-500">{appt.doctorSpecialty}</p>
                      <p className="text-slate-400 mt-1 tabular-nums">
                        {appt.date} · {appt.time}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Medical Supplies Orders</h2>
              <p className="text-xs text-slate-500">
                Track shipments, view itemized receipts, and reorder diagnostic tools
              </p>
            </div>
            <button
              onClick={onOpenProducts}
              className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Browse Store</span>
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No medical orders placed</p>
              <p className="text-xs text-slate-400 mt-1">
                Order certified testing kits, monitors, and clinical supplements.
              </p>
              <button
                onClick={onOpenProducts}
                className="mt-4 px-4 py-2 bg-teal-700 text-white text-xs font-semibold rounded-lg"
              >
                Browse Supplies
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {ord.id}
                        </span>
                        <span className="text-xs text-slate-400 tabular-nums">· {ord.date}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Tracking: <span className="font-mono text-slate-700">{ord.trackingNumber}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                        {ord.status}
                      </span>
                      <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                        ${ord.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="divide-y divide-slate-100">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900">{item.productName}</span>
                            <span className="text-slate-400 ml-2">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 tabular-nums">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping address footer */}
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>
                      Delivering to: {ord.shippingAddress.fullName} · {ord.shippingAddress.street}, {ord.shippingAddress.city} {ord.shippingAddress.zip}
                    </span>
                    <span className="text-teal-800 font-medium">Standard Courier Transit</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: HEALTH METRICS & BIOMETRIC TELEMETRY */}
      {activeTab === 'metrics' && (
        <HealthMetricsPanel
          currentUser={currentUser}
          vitals={vitals}
          onAddVitalLog={onAddVitalLog}
          onDeleteVitalLog={onDeleteVitalLog}
          onResetDefaultVitals={onResetDefaultVitals}
        />
      )}
    </div>
  );
};
