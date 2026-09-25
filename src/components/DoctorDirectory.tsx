import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Filter,
  GraduationCap,
  Hospital,
  Languages,
  Search,
  Star,
  Stethoscope,
  Video,
} from 'lucide-react';
import { Doctor, HealthCategoryId } from '../types';
import { DOCTORS } from '../data/doctors';

interface DoctorDirectoryProps {
  onBookDoctor: (doctor: Doctor) => void;
  onSelectDoctorProfile: (doctor: Doctor) => void;
  initialCategory?: HealthCategoryId | 'all';
}

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({
  onBookDoctor,
  onSelectDoctorProfile,
  initialCategory = 'all',
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const specialties = [
    { id: 'all', label: 'All Specialists' },
    { id: 'diabetes', label: 'Diabetes & Metabolism' },
    { id: 'heart', label: 'Cardiology' },
    { id: 'skin', label: 'Dermatology' },
    { id: 'women', label: "Women's Health" },
    { id: 'bone', label: 'Orthopedics' },
    { id: 'mental', label: 'Psychiatry & Brain' },
    { id: 'general', label: 'Internal Medicine' },
  ];

  const filteredDoctors = useMemo(() => {
    return DOCTORS.filter((doc) => {
      const matchSpecialty =
        selectedSpecialty === 'all' || doc.categoryId === selectedSpecialty;
      const matchSearch =
        !searchQuery.trim() ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.about.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSpecialty && matchSearch;
    });
  }, [selectedSpecialty, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Directory Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider">
            <Stethoscope className="w-4 h-4" />
            <span>Physician Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Specialist Doctors Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Board-certified endocrinologists, cardiologists, and medical specialists offering in-clinic visits and HIPAA-compliant telehealth consultations.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name or clinic..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-teal-600 focus:outline-none bg-slate-50/50"
          />
        </div>
      </div>

      {/* Specialty Filter Buttons (Functional tabs with zero pill slop) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {specialties.map((spec) => (
          <button
            key={spec.id}
            onClick={() => setSelectedSpecialty(spec.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedSpecialty === spec.id
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {spec.label}
          </button>
        ))}
      </div>

      {/* Doctor Cards Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No doctors match your criteria</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting "All Specialists"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialty('all');
            }}
            className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                {/* Header with Portrait and Title */}
                <div className="flex items-start gap-4">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900 truncate">{doc.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span className="tabular-nums">{doc.rating}</span>
                        <span className="text-slate-400 font-normal">({doc.reviewCount})</span>
                      </div>
                    </div>

                    <p className="text-xs text-teal-800 font-medium">{doc.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Hospital className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.hospital}</span>
                    </p>
                  </div>
                </div>

                {/* Credentials & Details (Clean text separators) */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{doc.experienceYears} Years Experience</span>
                  <span aria-hidden="true">·</span>
                  <span>{doc.qualifications.split('·')[0]}</span>
                  <span aria-hidden="true">·</span>
                  <span>Languages: {doc.languages.join(', ')}</span>
                </div>

                {/* About bio snippet */}
                <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-3">
                  {doc.about}
                </p>

                {/* Next available slot banner */}
                <div className="mt-3.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-teal-700" />
                    <span>Next Open Slot:</span>
                  </div>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {doc.nextAvailableSlot}
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Consultation Fee</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      ${doc.telehealthFee}
                    </span>
                    <span className="text-[10px] text-slate-500">Video</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      ${doc.consultationFee}
                    </span>
                    <span className="text-[10px] text-slate-500">Clinic</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectDoctorProfile(doc)}
                    className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onBookDoctor(doc)}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Slot</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
