import React, { useState, useEffect } from "react";
import { specialistService } from "../../services/specialistService";
import { Specialist } from "../../types";
import {
  Users,
  Building,
  Mail,
  Phone,
  Award,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";

export const AdminDoctors: React.FC = () => {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    specialistService
      .getAllSpecialists()
      .then((data) => setSpecialists(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-clinical-blue block mb-1">
            Clinical Administration
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hospital Attending Physicians & Specialists
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Staff roster mapped for automated symptom referral routing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-60 bg-slate-100 rounded-xl animate-pulse" />
          ))
        ) : (
          specialists.map((doc) => (
            <div
              key={doc._id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                    <span className="text-xs font-bold text-clinical-blue">
                      {doc.specialty}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {doc.availabilityStatus}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.hospitalWing}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.department}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    {doc.qualification}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                <span>{doc.email}</span>
                <span>{doc.phone}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
