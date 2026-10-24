import React, { useState, useEffect } from "react";
import { adminService } from "../../services/adminService";
import { Users, Search, Mail, Phone, Calendar, Heart } from "lucide-react";

export const AdminPatients: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    adminService
      .getPatients()
      .then((data) => setPatients(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredPatients = patients.filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const email = (p.email || "").toLowerCase();
    const query = search.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-clinical-blue block mb-1">
          Hospital Medical Records
        </span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Patient Registry & Health Profiles ({patients.length})
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Registered patients undergoing AI-assisted clinical triage surveillance.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient registry by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Demographics</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">BMI Index</th>
                <th className="py-3 px-4">Chronic Conditions</th>
                <th className="py-3 px-4">Known Allergies</th>
                <th className="py-3 px-4 text-right">Emergency Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading registered patient directory...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No patients match your search query.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const pr = p.profile;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{p.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {pr?.age ? `${pr.age} yrs` : "N/A"} • {pr?.gender || "Unknown"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                          {pr?.bloodGroup || "Unknown"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {pr?.bmi ? (
                          <span className="font-semibold text-slate-800">
                            {pr.bmi} ({pr.bmiCategory})
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs">
                        {pr?.chronicConditions && pr.chronicConditions.length > 0 ? (
                          pr.chronicConditions.join(", ")
                        ) : (
                          <span className="text-slate-400 italic">None reported</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {pr?.allergies && pr.allergies.length > 0 ? (
                          <span className="text-rose-700 font-medium">
                            {pr.allergies.join(", ")}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No allergies</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {pr?.emergencyContact?.name ? (
                          <div>
                            <span className="font-semibold text-slate-900">
                              {pr.emergencyContact.name} ({pr.emergencyContact.relationship})
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {pr.emergencyContact.phone}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
