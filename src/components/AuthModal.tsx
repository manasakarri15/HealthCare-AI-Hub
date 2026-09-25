import React, { useState } from 'react';
import { X, UserCheck, ShieldCheck, Mail, Lock, User, LogIn, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [tab, setTab] = useState<'login' | 'signup' | 'personas'>('personas');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const demoPersonas: UserProfile[] = [
    {
      id: 'user_sarah_102',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      age: 38,
      gender: 'Female',
      bloodType: 'A+',
      primaryCondition: 'Metabolic Health & Pre-diabetes',
      avatar: '/src/assets/images/doctor_endocrinologist_1790327143178.jpg',
    },
    {
      id: 'user_david_204',
      name: 'David Chen',
      email: 'david.chen@example.com',
      age: 52,
      gender: 'Male',
      bloodType: 'O+',
      primaryCondition: 'Cardiovascular Risk & Hypertension',
      avatar: '/src/assets/images/doctor_cardiologist_1790327163933.jpg',
    },
    {
      id: 'user_elena_305',
      name: 'Elena Rostova (Guest Clinical Reviewer)',
      email: 'guest.reviewer@medical.org',
      age: 41,
      gender: 'Female',
      bloodType: 'B+',
      primaryCondition: 'Clinical Evaluator',
      avatar: '/src/assets/images/doctor_dermatologist_1790327184541.jpg',
    },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const newProfile: UserProfile = {
      id: `user_${Date.now()}`,
      name: name || email.split('@')[0],
      email: email,
      age: 34,
      gender: 'Specified in Profile',
      bloodType: 'O+',
      primaryCondition: 'General Health Surveillance',
      avatar: '/src/assets/images/doctor_endocrinologist_1790327143178.jpg',
    };
    onSelectUser(newProfile);
    setSuccessMsg('Signed in successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-teal-600 mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold tracking-wide uppercase">Patient Portal</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {tab === 'personas' ? 'Switch Patient Profile' : tab === 'login' ? 'Sign In to HealthCare Hub' : 'Create Patient Account'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Access secure health assessments, appointments, and prescriptions.
          </p>

          {/* Segmented Tab Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mt-4 text-xs font-medium">
            <button
              onClick={() => setTab('personas')}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                tab === 'personas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Demo Personas
            </button>
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                tab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                tab === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg border border-emerald-200">
              {successMsg}
            </div>
          )}

          {tab === 'personas' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Select a preset patient account to instantly preview personalized data and assessment records:
              </p>
              {demoPersonas.map((persona) => {
                const isActive = currentUser.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => {
                      onSelectUser(persona);
                      setSuccessMsg(`Switched profile to ${persona.name}`);
                      setTimeout(() => {
                        setSuccessMsg('');
                        onClose();
                      }, 700);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isActive
                        ? 'border-teal-600 bg-teal-50/40 ring-1 ring-teal-600'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{persona.name}</span>
                          {isActive && (
                            <span className="text-[10px] bg-teal-600 text-white px-1.5 py-0.5 rounded font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{persona.email}</p>
                        <p className="text-[11px] text-teal-700 font-medium mt-0.5">
                          {persona.primaryCondition}
                        </p>
                      </div>
                    </div>
                    <UserCheck className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          )}

          {(tab === 'login' || tab === 'signup') && (
            <form onSubmit={handleCustomSubmit} className="space-y-3.5">
              {tab === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Jordan Taylor"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@healthcarehub.org"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{tab === 'login' ? 'Sign In to Patient Record' : 'Register New Account'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
