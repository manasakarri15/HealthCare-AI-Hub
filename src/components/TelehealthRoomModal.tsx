import React, { useState, useEffect } from 'react';
import {
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  ShieldCheck,
  Activity,
  FileText,
  User,
} from 'lucide-react';
import { Appointment, UserProfile } from '../types';

interface TelehealthRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  currentUser: UserProfile;
  onEndCall: (appointmentId: string) => void;
}

export const TelehealthRoomModal: React.FC<TelehealthRoomModalProps> = ({
  isOpen,
  onClose,
  appointment,
  currentUser,
  onEndCall,
}) => {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCallDuration(0);
      return;
    }
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    onEndCall(appointment.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Top Bar */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold">{appointment.doctorName}</h3>
              <p className="text-[11px] text-slate-400">{appointment.doctorSpecialty}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-xs font-mono tabular-nums text-slate-200">
              {formatTime(callDuration)}
            </span>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-teal-400">
              <ShieldCheck className="w-4 h-4" />
              <span>HIPAA Encrypted</span>
            </div>
          </div>
        </div>

        {/* Video Stage & Side Panel */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Main Video Viewport (8 Cols) */}
          <div className="lg:col-span-8 bg-slate-950 relative flex items-center justify-center p-4">
            {/* Simulated Doctor Video Stream */}
            <div className="relative w-full h-full max-h-[500px] rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-800">
              <img
                src={appointment.doctorImage}
                alt={appointment.doctorName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-90"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              {/* Doctor Label overlay */}
              <div className="absolute bottom-4 left-4 text-white text-xs font-medium flex items-center gap-2">
                <span className="px-2 py-1 bg-black/50 backdrop-blur-xs rounded-md">
                  {appointment.doctorName}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>

              {/* Patient Picture-in-Picture */}
              <div className="absolute top-4 right-4 w-28 h-20 sm:w-36 sm:h-24 bg-slate-800 rounded-xl overflow-hidden border border-white/20 shadow-lg flex items-center justify-center">
                {videoOn ? (
                  <div className="relative w-full h-full bg-slate-700 flex items-center justify-center">
                    <User className="w-8 h-8 text-slate-400" />
                    <span className="absolute bottom-1 left-1.5 text-[9px] text-white/80 bg-black/40 px-1 rounded">
                      You ({currentUser.name.split(' ')[0]})
                    </span>
                  </div>
                ) : (
                  <div className="text-center p-2 text-[10px] text-slate-400">
                    Camera Off
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clinical Notes Pane (4 Cols) */}
          <div className="lg:col-span-4 bg-slate-900/90 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-400" />
                <span>Encounter Record</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Live consultation transcription & doctor notes
              </p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                Reason for Visit
              </span>
              <p className="text-slate-200 leading-relaxed">{appointment.notes}</p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                Active Patient Profile
              </span>
              <div className="space-y-1 text-slate-300">
                <p><strong>Patient:</strong> {currentUser.name}</p>
                <p><strong>Age / Gender:</strong> {currentUser.age} yrs · {currentUser.gender}</p>
                <p><strong>Blood Group:</strong> {currentUser.bloodType}</p>
                <p><strong>Condition:</strong> {currentUser.primaryCondition}</p>
              </div>
            </div>

            <div className="p-3 bg-teal-950/40 rounded-xl border border-teal-800/60 text-teal-200 space-y-1 text-[11px] leading-relaxed">
              <p className="font-semibold text-teal-300">Physician Clinical Recommendation:</p>
              <p>
                "Reviewed metabolic trends. Keep fasting glycemic levels below 100 mg/dL through consistent aerobic movement. Schedule repeat HbA1c in 90 days."
              </p>
            </div>
          </div>
        </div>

        {/* Video Call Controls Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-4">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`p-3 rounded-full transition-colors ${
              micOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
            }`}
            title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setVideoOn(!videoOn)}
            className={`p-3 rounded-full transition-colors ${
              videoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white'
            }`}
            title={videoOn ? 'Turn Video Off' : 'Turn Video On'}
          >
            {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={handleFinish}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-full transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Consultation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
