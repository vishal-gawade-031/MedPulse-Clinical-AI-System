import React, { useState, useEffect } from "react";
import { specialistService } from "../../services/specialistService";
import { Specialist } from "../../types";
import {
  Users,
  Search,
  Mail,
  Phone,
  Building,
  Award,
  CheckCircle,
  Clock,
  Calendar,
  Stethoscope,
  Heart,
} from "lucide-react";

export const DoctorDirectory: React.FC = () => {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All");

  useEffect(() => {
    specialistService
      .getAllSpecialists()
      .then((data) => setSpecialists(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const specialties = [
    "All",
    "Cardiologist",
    "Pulmonologist",
    "Neurologist",
    "Gastroenterologist",
    "Dermatologist",
    "General Physician",
  ];

  const filteredDoctors = specialists.filter((doc) => {
    const matchesSpec =
      selectedSpecialty === "All" || doc.specialty === selectedSpecialty;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpec && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-clinical-border rounded-xl p-6 shadow-clinical">
        <span className="text-xs font-bold text-clinical-blue uppercase tracking-wider">
          Hospital Medical Staff
        </span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Clinical Specialists Directory
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Consult board-certified department chairs and attending clinicians across hospital pavilions.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-clinical-border rounded-xl p-4 shadow-clinical space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by physician name, department, or clinical subspecialty..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap transition-colors ${
                selectedSpecialty === spec
                  ? "bg-clinical-blue text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ))
        ) : filteredDoctors.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            No specialists match the selected criteria.
          </div>
        ) : (
          filteredDoctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white border border-clinical-border rounded-xl p-5 shadow-clinical flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {doc.name}
                    </h3>
                    <span className="text-xs font-bold text-clinical-blue">
                      {doc.specialty}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      doc.availabilityStatus === "Available Today"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : doc.availabilityStatus === "On Call"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {doc.availabilityStatus}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{doc.hospitalWing}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{doc.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="line-clamp-1">{doc.qualification}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Clinical Experience: {doc.experienceYears} Years
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <a
                  href={`mailto:${doc.email}`}
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-clinical-blue font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email Office
                </a>
                <a
                  href={`tel:${doc.phone}`}
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-clinical-blue font-medium"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Clinic
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
