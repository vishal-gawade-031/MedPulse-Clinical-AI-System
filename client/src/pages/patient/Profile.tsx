import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { patientService } from "../../services/patientService";
import { PatientProfile } from "../../types";
import {
  User,
  Heart,
  Scale,
  ShieldAlert,
  Phone,
  Save,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";

export const Profile: React.FC = () => {
  const { user, profile, updateProfileState, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState<string>(user?.firstName || "");
  const [lastName, setLastName] = useState<string>(user?.lastName || "");
  const [phone, setPhone] = useState<string>(user?.phone || "");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [age, setAge] = useState<number>(profile?.age || 42);
  const [gender, setGender] = useState<string>(profile?.gender || "Male");
  const [bloodGroup, setBloodGroup] = useState<string>(profile?.bloodGroup || "O+");
  const [height, setHeight] = useState<number>(profile?.height || 178);
  const [weight, setWeight] = useState<number>(profile?.weight || 82);
  const [allergies, setAllergies] = useState<string[]>(profile?.allergies || []);
  const [newAllergy, setNewAllergy] = useState<string>("");
  const [chronicConditions, setChronicConditions] = useState<string[]>(
    profile?.chronicConditions || []
  );
  const [newCondition, setNewCondition] = useState<string>("");
  const [currentMedications, setCurrentMedications] = useState<string[]>(
    profile?.currentMedications || []
  );
  const [newMedication, setNewMedication] = useState<string>("");
  const [emergencyContact, setEmergencyContact] = useState({
    name: profile?.emergencyContact?.name || "",
    relationship: profile?.emergencyContact?.relationship || "",
    phone: profile?.emergencyContact?.phone || "",
  });

  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setPhone(user.phone || "");
    }
    if (profile) {
      setAge(profile.age || 42);
      setGender(profile.gender || "Male");
      setBloodGroup(profile.bloodGroup || "O+");
      setHeight(profile.height || 178);
      setWeight(profile.weight || 82);
      setAllergies(profile.allergies || []);
      setChronicConditions(profile.chronicConditions || []);
      setCurrentMedications(profile.currentMedications || []);
      if (profile.emergencyContact) {
        setEmergencyContact({
          name: profile.emergencyContact.name || "",
          relationship: profile.emergencyContact.relationship || "",
          phone: profile.emergencyContact.phone || "",
        });
      }
      if (profile.dateOfBirth) {
        setDateOfBirth(profile.dateOfBirth.split("T")[0]);
      }
    }
  }, [user, profile]);

  // Live BMI calculation
  const calculatedBmi =
    height > 0 && weight > 0
      ? Number((weight / ((height / 100) * (height / 100))).toFixed(1))
      : 0;

  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { category: "Underweight", color: "text-amber-600 bg-amber-50 border-amber-200" };
    if (val < 25) return { category: "Normal weight", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (val < 30) return { category: "Overweight", color: "text-blue-700 bg-blue-50 border-blue-200" };
    return { category: "Obese", color: "text-rose-700 bg-rose-50 border-rose-200" };
  };

  const bmiDetails = getBmiCategory(calculatedBmi);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await patientService.updateProfile({
        firstName,
        lastName,
        phone,
        dateOfBirth: dateOfBirth ? dateOfBirth : undefined,
        age: Number(age),
        gender: gender as any,
        bloodGroup: bloodGroup as any,
        height: Number(height),
        weight: Number(weight),
        allergies,
        chronicConditions,
        currentMedications,
        emergencyContact,
      });

      updateProfileState(updated);
      await refreshUser();
      showToast("Clinical health profile successfully saved.", "success");
    } catch (err: any) {
      showToast("Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const addTag = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    val: string,
    setVal: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (val.trim() && !list.includes(val.trim())) {
      setList([...list, val.trim()]);
      setVal("");
    }
  };

  const removeTag = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    setList(list.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-clinical-border rounded-xl p-6 shadow-clinical">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-bold text-clinical-blue uppercase tracking-wider">
              Patient Identification & Demographics
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Clinical Health Profile
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Maintained under HIPAA confidentiality standards for precise symptom triage.
            </p>
          </div>

          {/* BMI Live Indicator Badge */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl self-start sm:self-auto">
            <Scale className="w-6 h-6 text-clinical-blue" />
            <div>
              <div className="text-xs text-slate-500 font-medium">Calculated BMI</div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900">
                  {calculatedBmi || "N/A"}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${bmiDetails.color}`}
                >
                  {bmiDetails.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* Identity & Basic Demographics */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              1. Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Physiological Metrics */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              2. Physiological Biometrics & Blood Group
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min={50}
                  max={250}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min={20}
                  max={300}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Clinical History & Allergies */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Clinical History, Allergies & Medications
            </h2>

            {/* Allergies */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Known Drug & Environmental Allergies
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(allergies, setAllergies, newAllergy, setNewAllergy);
                    }
                  }}
                  placeholder="e.g. Penicillin, Latex, Peanuts (Press Add)"
                  className="flex-1 text-sm rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => addTag(allergies, setAllergies, newAllergy, setNewAllergy)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allergies.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(allergies, setAllergies, idx)}
                      className="text-rose-400 hover:text-rose-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Chronic Conditions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Known Chronic Medical Conditions
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(chronicConditions, setChronicConditions, newCondition, setNewCondition);
                    }
                  }}
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                  className="flex-1 text-sm rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => addTag(chronicConditions, setChronicConditions, newCondition, setNewCondition)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {chronicConditions.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(chronicConditions, setChronicConditions, idx)}
                      className="text-blue-400 hover:text-blue-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Current Medications */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Regular Medications & Dosages
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(currentMedications, setCurrentMedications, newMedication, setNewMedication);
                    }
                  }}
                  placeholder="e.g. Metformin 500mg, Lisinopril 10mg"
                  className="flex-1 text-sm rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => addTag(currentMedications, setCurrentMedications, newMedication, setNewMedication)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentMedications.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(currentMedications, setCurrentMedications, idx)}
                      className="text-emerald-400 hover:text-emerald-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Contact Information */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              4. Designated Emergency Contact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Full Name
                </label>
                <input
                  type="text"
                  value={emergencyContact.name}
                  onChange={(e) =>
                    setEmergencyContact({ ...emergencyContact, name: e.target.value })
                  }
                  placeholder="e.g. Jane Doe"
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={emergencyContact.relationship}
                  onChange={(e) =>
                    setEmergencyContact({
                      ...emergencyContact,
                      relationship: e.target.value,
                    })
                  }
                  placeholder="e.g. Spouse / Parent / Sibling"
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  value={emergencyContact.phone}
                  onChange={(e) =>
                    setEmergencyContact({ ...emergencyContact, phone: e.target.value })
                  }
                  placeholder="+1 (555) 000-0000"
                  className="w-full text-sm rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-clinical-blue focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Submit Save Button */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-clinical-blue hover:bg-clinical-dark text-white font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Health Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
