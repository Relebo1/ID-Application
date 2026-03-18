"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileCheck, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const DISTRICTS = ["Maseru", "Leribe", "Berea", "Mafeteng", "Mohale's Hoek", "Quthing", "Qacha's Nek", "Mokhotlong", "Thaba-Tseka", "Butha-Buthe"];
const ID_TYPES = ["New ID", "Replacement ID", "Renewal"];
const REQUIRED_DOCS = [
  { key: "birth_certificate", label: "Birth Certificate", required: true },
  { key: "photo", label: "Passport Photo", required: true },
  { key: "proof_of_residence", label: "Proof of Residence", required: false },
];

type FormData = {
  firstName: string; lastName: string; dob: string; gender: string;
  district: string; village: string; phone: string; email: string; idType: string;
};

type UploadedDoc = { name: string; type: string; uploadedAt: string };

const EMPTY: FormData = { firstName: "", lastName: "", dob: "", gender: "", district: "", village: "", phone: "", email: "", idType: "" };
const STEPS = ["Personal Info", "Address & Contact", "ID Type", "Documents", "Review & Submit"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Guard: must be logged in to apply
  useEffect(() => {
    const stored = localStorage.getItem("citizen");
    if (!stored) {
      router.replace("/login?next=/register");
    } else {
      const user = JSON.parse(stored);
      if (user.mustChangePassword) router.replace("/change-password");
      else setForm((f) => ({ ...f, email: user.email }));
    }
  }, [router]);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof FormData, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleFileUpload = (type: string, label: string, file: File) => {
    setDocuments((prev) => {
      const filtered = prev.filter((d) => d.type !== type);
      return [...filtered, { name: file.name, type, uploadedAt: new Date().toISOString().split("T")[0] }];
    });
    // suppress unused warning
    void label;
  };

  const removeDoc = (type: string) => setDocuments((prev) => prev.filter((d) => d.type !== type));

  const validateStep = () => {
    if (step === 0 && (!form.firstName || !form.lastName || !form.dob || !form.gender)) return "Please fill all required fields.";
    if (step === 1 && (!form.district || !form.village || !form.phone || !form.email)) return "Please fill all required fields.";
    if (step === 2 && !form.idType) return "Please select an ID type.";
    if (step === 3) {
      const missing = REQUIRED_DOCS.filter((d) => d.required && !documents.find((u) => u.type === d.key));
      if (missing.length) return `Please upload: ${missing.map((d) => d.label).join(", ")}.`;
    }
    return "";
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, documents }),
      });
      const data = await res.json();
      router.push(`/track?id=${data.id}&success=1`);
    } catch {
      setError("Submission failed. Please try again.");
      setSubmitting(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Navbar />
      <main id="main-content" className="flex-1 py-10 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-[#003580] mb-2">National ID Application</h1>
          <p className="text-gray-500 text-sm mb-6">Complete all steps to submit your application.</p>

          {/* Step indicator */}
          <nav aria-label="Application steps" className="mb-8">
            <ol className="flex items-center">
              {STEPS.map((label, i) => (
                <li key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                      i < step ? "bg-[#009A44] border-[#009A44] text-white"
                      : i === step ? "bg-[#003580] border-[#003580] text-white"
                      : "bg-white border-gray-300 text-gray-400"
                    }`} aria-current={i === step ? "step" : undefined}>
                      {i < step ? "✓" : i + 1}
                    </div>
                    <span className={`text-xs mt-1 text-center hidden sm:block ${i === step ? "text-[#003580] font-semibold" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${i < step ? "bg-[#009A44]" : "bg-gray-200"}`} />}
                </li>
              ))}
            </ol>
          </nav>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            {error && (
              <div role="alert" className="mb-4 bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Step 0: Personal Info */}
            {step === 0 && (
              <fieldset>
                <legend className="text-lg font-semibold text-gray-800 mb-4">Personal Information</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className={labelClass}>First Name *</label>
                    <input id="firstName" className={inputClass} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} autoComplete="given-name" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className={labelClass}>Last Name *</label>
                    <input id="lastName" className={inputClass} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} autoComplete="family-name" />
                  </div>
                  <div>
                    <label htmlFor="dob" className={labelClass}>Date of Birth *</label>
                    <input id="dob" type="date" className={inputClass} value={form.dob} onChange={(e) => set("dob", e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="gender" className={labelClass}>Gender *</label>
                    <select id="gender" className={inputClass} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                      <option value="">Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </fieldset>
            )}

            {/* Step 1: Address & Contact */}
            {step === 1 && (
              <fieldset>
                <legend className="text-lg font-semibold text-gray-800 mb-4">Address & Contact</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="district" className={labelClass}>District *</label>
                    <select id="district" className={inputClass} value={form.district} onChange={(e) => set("district", e.target.value)}>
                      <option value="">Select district</option>
                      {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="village" className={labelClass}>Village / Town *</label>
                    <input id="village" className={inputClass} value={form.village} onChange={(e) => set("village", e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="phone" className={labelClass}>Phone Number *</label>
                    <input id="phone" type="tel" className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" placeholder="+266..." />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClass}>Email Address *</label>
                    <input id="email" type="email" className={`${inputClass} bg-gray-50 text-gray-500`} value={form.email} readOnly autoComplete="email" />
                  </div>
                </div>
              </fieldset>
            )}

            {/* Step 2: ID Type */}
            {step === 2 && (
              <fieldset>
                <legend className="text-lg font-semibold text-gray-800 mb-4">ID Application Type</legend>
                <div className="flex flex-col gap-3">
                  {ID_TYPES.map((type) => (
                    <label key={type} className={`flex items-center gap-3 border-2 rounded-lg px-4 py-3 cursor-pointer transition-colors ${form.idType === type ? "border-[#003580] bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <input type="radio" name="idType" value={type} checked={form.idType === type} onChange={() => set("idType", type)} className="accent-[#003580]" />
                      <span className="font-medium text-gray-800">{type}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {/* Step 3: Document Upload */}
            {step === 3 && (
              <fieldset>
                <legend className="text-lg font-semibold text-gray-800 mb-1">Upload Documents</legend>
                <p className="text-sm text-gray-500 mb-4">Upload clear scans or photos. Accepted formats: PDF, JPG, PNG.</p>
                <div className="flex flex-col gap-4">
                  {REQUIRED_DOCS.map(({ key, label, required }) => {
                    const uploaded = documents.find((d) => d.type === key);
                    return (
                      <div key={key} className={`border-2 rounded-lg p-4 transition-colors ${uploaded ? "border-[#009A44] bg-green-50" : "border-gray-200"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-800">
                            {label} {required && <span className="text-red-500">*</span>}
                          </span>
                          {uploaded && (
                            <button onClick={() => removeDoc(key)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label={`Remove ${label}`}>
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {uploaded ? (
                          <div className="flex items-center gap-2 text-sm text-green-700">
                            <FileCheck className="w-4 h-4" aria-hidden="true" />
                            <span>{uploaded.name}</span>
                          </div>
                        ) : (
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-[#003580] hover:text-blue-800">
                            <Upload className="w-4 h-4" aria-hidden="true" />
                            <span>Click to upload</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(key, label, file);
                              }}
                              aria-label={`Upload ${label}`}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Review Your Application</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                  {(Object.entries(form) as [keyof FormData, string][]).map(([key, val]) => (
                    <div key={key} className="bg-gray-50 rounded-lg px-4 py-3">
                      <dt className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</dt>
                      <dd className="font-semibold text-gray-800 mt-0.5">{val || "—"}</dd>
                    </div>
                  ))}
                </dl>
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm">
                  <p className="text-gray-500 mb-2">Uploaded Documents</p>
                  {documents.length === 0 ? (
                    <p className="text-gray-400">None</p>
                  ) : (
                    <ul className="space-y-1">
                      {documents.map((d) => (
                        <li key={d.type} className="flex items-center gap-2 text-green-700">
                          <FileCheck className="w-4 h-4" aria-hidden="true" />
                          <span>{d.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  By submitting, you confirm that all information provided is accurate and complete.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
              {step > 0 ? (
                <button onClick={() => { setStep((s) => s - 1); setError(""); }} className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors">
                  Back
                </button>
              ) : <div />}
              {step < STEPS.length - 1 ? (
                <button onClick={next} className="px-6 py-2 rounded-lg bg-[#003580] text-white text-sm font-semibold hover:bg-blue-900 transition-colors">
                  Next
                </button>
              ) : (
                <button onClick={submit} disabled={submitting} className="px-6 py-2 rounded-lg bg-[#009A44] text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60">
                  {submitting ? "Submitting…" : "Submit Application"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
