"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X, Sparkles, Loader2 } from "lucide-react";
import axios from "axios";

// Constants
const ROLES = [
  { label: "Internship", sub: "3–6 month stint" },
  { label: "SDE – 1", sub: "0–2 years experience" },
  { label: "SDE – 2", sub: "2–5 years experience" },
  { label: "SDE – 3 / Senior", sub: "5+ years experience" },
];

const DOMAINS = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Cybersecurity",
  "Blockchain",
  "Game Development",
  "Cloud Computing",
  "System Design",
];

type FormData = {
  name: string;
  email: string;
  domain: string;
  stack: string; // Single string for 1 selection
  role: string;
};

export default function RegistrationPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    domain: "",
    stack: "",
    role: "",
  });
  
  const [stackOptions, setStackOptions] = useState<string[]>([]);

  // UI States
  const [stackOpen, setStackOpen] = useState(false);
  const [stackSearch, setStackSearch] = useState("");
  const [domainOpen, setDomainOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const stackRef = useRef<HTMLDivElement>(null);
  const domainRef = useRef<HTMLDivElement>(null);

  // Click outside handlers
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!stackRef.current?.contains(e.target as Node)) setStackOpen(false);
      if (!domainRef.current?.contains(e.target as Node)) setDomainOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const canProceed = () => {
    if (loading) return false;
    if (step === 0) return form.name.trim() && form.email.trim() && form.domain.trim();
    if (step === 1) return form.stack.trim() !== "";
    if (step === 2) return form.role.trim() !== "";
    return false;
  };

  const fetchStack = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/generate-stack", {
        domain: form.domain,
      });
      if (res.data.success) {
        setStackOptions(res.data.stack);
        setStep(1); // Advance to stack selection once data is ready
      } else {
        alert("Could not fetch technologies for this domain. Please try again.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 0) {
      fetchStack(); // Fetch options before showing Step 1
    } else {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => setStep((s) => s - 1);

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6 font-serif selection:bg-orange-100 selection:text-orange-900">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-50/50 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Progress Bar */}
        <div className="flex gap-2 justify-center mb-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i <= step ? "bg-orange-500 w-8" : "bg-orange-200/50 w-4"
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-orange-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 md:p-14 min-h-[500px] flex flex-col justify-between">
          <div className="space-y-8">
            {step === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-orange-500">
                  Step 01 — Identity
                </span>
                <h1 className="text-3xl text-stone-900 mt-2 tracking-tight">
                  Tell us about yourself.
                </h1>
                <div className="space-y-4 mt-8">
                  <Input
                    label="What should we call you?"
                    placeholder="e.g. Piyush Chhabra"
                    value={form.name}
                    onChange={(v: string) => setForm({ ...form, name: v })}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="piyush@example.com"
                    value={form.email}
                    onChange={(v: string) => setForm({ ...form, email: v })}
                  />

                  {/* Domain Dropdown */}
                  <div className="relative" ref={domainRef}>
                    <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-orange-500 mb-2 block">
                      Domain
                    </label>
                    <button
                      onClick={() => setDomainOpen(!domainOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 bg-stone-50/50 border rounded-2xl transition-all font-sans text-sm ${domainOpen ? "border-orange-400 ring-4 ring-orange-400/5" : "border-stone-200"}`}
                    >
                      <span className={form.domain ? "text-stone-900" : "text-stone-400"}>
                        {form.domain || "Select your field"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${domainOpen ? "rotate-180" : ""}`} />
                    </button>
                    {domainOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-100 rounded-2xl shadow-xl z-50 py-2 max-h-60 overflow-y-auto animate-in zoom-in-95 duration-200">
                        {DOMAINS.map((d) => (
                          <button
                            key={d}
                            onClick={() => {
                              setForm({ ...form, domain: d, stack: "" }); // Reset stack if domain changes
                              setDomainOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-sans hover:bg-orange-50 transition-colors flex items-center justify-between"
                          >
                            {d} {form.domain === d && <Check className="w-4 h-4 text-orange-500" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-orange-500">
                  Step 02 — Arsenal
                </span>
                <h1 className="text-3xl text-stone-900 mt-2 tracking-tight">
                  Choose your Tech.
                </h1>
                <p className="text-stone-500 font-sans text-sm mt-1">
                  Select the primary technology for your assessment.
                </p>

                <div className="relative mt-8" ref={stackRef}>
                  <button
                    onClick={() => setStackOpen(!stackOpen)}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-stone-50/50 border border-stone-200 rounded-2xl font-sans text-sm"
                  >
                    <span className={form.stack ? "text-stone-900" : "text-stone-400"}>
                      {form.stack || "Pick a technology..."}
                    </span>
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  </button>

                  {stackOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-100 rounded-2xl shadow-xl z-50 p-2 animate-in zoom-in-95 duration-200">
                      <input
                        className="w-full px-3 py-2 bg-stone-50 rounded-xl text-sm outline-none border border-transparent focus:border-orange-200 mb-2"
                        placeholder="Search stack..."
                        value={stackSearch}
                        onChange={(e) => setStackSearch(e.target.value)}
                      />
                      <div className="max-h-48 overflow-y-auto">
                        {stackOptions
                          .filter((s) => s.toLowerCase().includes(stackSearch.toLowerCase()))
                          .map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                setForm({ ...form, stack: s });
                                setStackOpen(false);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-stone-50 rounded-lg transition-colors text-left"
                            >
                              <span className="text-sm font-sans">{s}</span>
                              {form.stack === s && <Check className="w-4 h-4 text-orange-500" />}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {form.stack && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-full text-xs font-sans shadow-sm">
                      {form.stack}
                      <button onClick={() => setForm({ ...form, stack: "" })}>
                        <X className="w-3 h-3 text-orange-100 hover:text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-orange-500">
                  Step 03 — Objective
                </span>
                <h1 className="text-3xl text-stone-900 mt-2 tracking-tight">
                  What's the goal?
                </h1>
                <div className="grid grid-cols-1 gap-3 mt-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {ROLES.map((r) => (
                    <button
                      key={r.label}
                      onClick={() => setForm({ ...form, role: r.label })}
                      className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                        form.role === r.label
                          ? "border-orange-500 bg-orange-50/50 ring-1 ring-orange-500"
                          : "border-stone-100 bg-white hover:border-orange-200"
                      }`}
                    >
                      <span className="text-sm font-sans font-medium text-stone-900">{r.label}</span>
                      <span className="text-xs font-sans text-stone-400 mt-0.5">{r.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="text-center animate-in fade-in zoom-in-95 duration-700">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-orange-200">
                  <Sparkles className="text-white w-8 h-8" />
                </div>
                <h1 className="text-3xl text-stone-900 mt-6 tracking-tight">
                  Ready, {form.name.split(" ")[0]}?
                </h1>
                <div className="mt-8 p-6 bg-stone-50 rounded-3xl border border-stone-100 text-left space-y-3 font-sans">
                  <DetailRow label="Domain" value={form.domain} />
                  <DetailRow label="Stack" value={form.stack} />
                  <DetailRow label="Target" value={form.role} />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-12">
            {step > 0 && step < 3 ? (
              <button onClick={prevStep} className="text-stone-400 hover:text-orange-500 font-sans text-sm transition-colors">
                ← Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                disabled={!canProceed()}
                onClick={handleNext}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-sans font-bold text-sm transition-all ${
                  canProceed()
                    ? "bg-stone-900 text-white hover:bg-orange-600 hover:scale-[1.02] shadow-lg shadow-stone-200"
                    : "bg-stone-100 text-stone-300 cursor-not-allowed"
                }`}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Analyzing..." : step === 2 ? "Generate Test →" : "Continue →"}
              </button>
            ) : (
              <button className="w-full bg-stone-900 text-white py-4 rounded-2xl font-sans font-bold hover:bg-stone-800 transition-all shadow-xl">
                Start Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components for cleaner code
function Input({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-orange-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 bg-stone-50/50 border border-stone-200 rounded-2xl font-sans text-sm focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/5 transition-all"
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-stone-400">{label}</span>
      <span className="text-stone-900 font-medium">{value}</span>
    </div>
  );
}