import React, { useState } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Video,
  Building,
  CheckCircle,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  User,
  Mail,
  FileText,
} from 'lucide-react';
import { Doctor, Appointment, UserProfile } from '../types';

interface DoctorBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  currentUser: UserProfile;
  onBookingConfirmed: (appointment: Appointment) => void;
  onViewInDashboard: () => void;
}

export const DoctorBookingModal: React.FC<DoctorBookingModalProps> = ({
  isOpen,
  onClose,
  doctor,
  currentUser,
  onBookingConfirmed,
  onViewInDashboard,
}) => {
  const [consultType, setConsultType] = useState<'telehealth' | 'in-person'>('telehealth');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-28');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [confirmedAppt, setConfirmedAppt] = useState<Appointment | null>(null);

  if (!isOpen || !doctor) return null;

  // Initialize selectedTime from doctor time slots if empty
  const availableSlots = doctor.timeSlots || ['09:00 AM', '10:30 AM', '01:15 PM', '03:45 PM'];
  const activeTime = selectedTime || availableSlots[0];

  const datesList = [
    { label: 'Tomorrow', date: '2026-09-26', weekday: 'Sat' },
    { label: 'Monday', date: '2026-09-28', weekday: 'Mon' },
    { label: 'Tuesday', date: '2026-09-29', weekday: 'Tue' },
    { label: 'Wednesday', date: '2026-09-30', weekday: 'Wed' },
    { label: 'Thursday', date: '2026-10-01', weekday: 'Thu' },
  ];

  const fee = consultType === 'telehealth' ? doctor.telehealthFee : doctor.consultationFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAppointment: Appointment = {
      id: `apt-${Date.now().toString().slice(-5)}`,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorImage: doctor.image,
      date: selectedDate,
      time: activeTime,
      type: consultType,
      fee: fee,
      status: 'confirmed',
      patientName: currentUser.name,
      patientEmail: currentUser.email,
      notes: notes || 'Clinical consultation review and assessment follow-up.',
      createdAt: new Date().toISOString(),
    };

    setConfirmedAppt(newAppointment);
    onBookingConfirmed(newAppointment);
    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setConfirmedAppt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{doctor.name}</h3>
                  <p className="text-xs text-slate-500">{doctor.title}</p>
                  <p className="text-[11px] text-teal-800 font-medium">{doctor.hospital}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5 flex-1">
              {/* Consultation Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Select Consultation Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultType('telehealth')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      consultType === 'telehealth'
                        ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Video className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-bold text-slate-900">Telehealth Video</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Encrypted HD video room</p>
                    <p className="text-xs font-extrabold text-teal-800 mt-2 tabular-nums">
                      ${doctor.telehealthFee}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConsultType('in-person')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      consultType === 'in-person'
                        ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="w-4 h-4 text-slate-700" />
                      <span className="text-xs font-bold text-slate-900">In-Clinic Visit</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Hospital outpatient suite</p>
                    <p className="text-xs font-extrabold text-slate-900 mt-2 tabular-nums">
                      ${doctor.consultationFee}
                    </p>
                  </button>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Choose Appointment Date
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {datesList.map((d) => (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => setSelectedDate(d.date)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        selectedDate === d.date
                          ? 'border-teal-600 bg-teal-600 text-white font-semibold'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="block text-[10px] opacity-80">{d.weekday}</span>
                      <span className="block text-xs font-bold tabular-nums">
                        {d.date.slice(-2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Select Time Window
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all text-center tabular-nums ${
                        activeTime === slot
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Visit / Clinical Symptoms
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Discuss recent fasting glucose results, fatigue, and diet regimen..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:border-teal-600 focus:outline-none"
                />
              </div>

              {/* Patient Info Strip */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900">{currentUser.name}</span>
                  <span className="text-slate-400"> ({currentUser.email})</span>
                </div>
                <span className="text-[11px] text-teal-800 font-semibold">Insurance Verified</span>
              </div>
            </div>

            {/* Modal Footer with Fee & Confirm */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Total Consultation Fee
                </span>
                <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                  ${fee}.00
                </span>
              </div>

              <button
                type="submit"
                className="py-2.5 px-5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Confirm Appointment</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation Success Screen */
          <div className="p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Appointment Confirmed!</h3>
              <p className="text-xs text-slate-500">
                Booking ID: <span className="font-mono text-slate-700">{confirmedAppt?.id}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Doctor:</span>
                <span className="font-semibold text-slate-900">{doctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Time:</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {confirmedAppt?.date} at {confirmedAppt?.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Consultation Type:</span>
                <span className="font-semibold text-slate-900 capitalize">
                  {confirmedAppt?.type === 'telehealth' ? 'Telehealth Video Call' : 'In-Person Clinic'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-400">Fee:</span>
                <span className="font-bold text-slate-900 tabular-nums">${fee}.00</span>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleReset();
                  onViewInDashboard();
                }}
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
              >
                View in Patient Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
