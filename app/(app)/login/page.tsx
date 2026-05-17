"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X, Sparkles, Loader2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Constants
const ROLES = [
  { label: "Internship", sub: "3–6 month stint" },
  { label: "SDE1", sub: "0–2 years experience" },
  { label: "SDE2", sub: "2–5 years experience" },
  { label: "SDE3", sub: "5+ years experience" },
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
  const router = useRouter()

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

  const submitUser = async () => {
    try {
      setLoading(true)
      const res = await axios.post("/api/create-user", form)
      localStorage.setItem("userId", res.data.userId) 
      console.log("res: ",res)
      router.push("/test")

    } catch (error) {
      console.log(error)
    }
    finally{
      setLoading(false);
    }
  }


  const handleNext = () => {
    if (step === 0) {
      fetchStack(); // Fetch options before showing Step 1
    } else {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => setStep((s) => s - 1);

  return (
    // Background updated from bg-stone-400 to bg-khaki
    <div className="min-h-screen bg-khaki flex items-center justify-center p-6 font-serif selection:bg-alabaster selection:text-chestnut">
      
      <div className="relative z-10 w-full max-w-lg">
        {/* Progress Bar */}
        <div className="flex gap-2 justify-center mb-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              // Switched progress to bg-alabaster (active) and bg-khaki (inactive)
              className={`h-1 rounded-full transition-all duration-500 ${
                i <= step ? "bg-alabaster w-8" : "bg-dust/50 w-4"
              }`}
            />
          ))}
        </div>

        {/* Card */}
        {/* Main card background set to white for contrast */}
        <div className="bg-white p-10 md:p-14 min-h-[500px] flex flex-col justify-between rounded-3xl shadow-xl">
          <div className="space-y-8">
            {step === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Labels changed from text-red-800 to text-chestnut */}
                <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-chestnut">
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
                    <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-chestnut mb-2 block">
                      Domain
                    </label>
                    <button
                      onClick={() => setDomainOpen(!domainOpen)}
                      // Dropdown styling and focus changed to chestnut
                      className={`w-full flex items-center justify-between px-4 py-3.5 bg-dust/20 border rounded-2xl transition-all font-sans text-sm ${domainOpen ? "border-chestnut ring-4 ring-chestnut/5" : "border-dust/60"}`}
                    >
                      <span className={form.domain ? "text-stone-900" : "text-stone-400"}>
                        {form.domain || "Select your field"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${domainOpen ? "rotate-180" : ""}`} />
                    </button>
                    {domainOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-alabaster/60 rounded-2xl shadow-xl z-50 py-2 max-h-60 overflow-y-auto animate-in zoom-in-95 duration-200">
                        {DOMAINS.map((d) => (
                          <button
                            key={d}
                            onClick={() => {
                              setForm({ ...form, domain: d, stack: "" }); // Reset stack if domain changes
                              setDomainOpen(false);
                            }}
                            // Hover/Active updated to dust and orange-500
                            className="w-full text-left px-4 py-2.5 text-sm font-sans hover:bg-dust/30 transition-colors flex items-center justify-between"
                          >
                            {d} {form.domain === d && <Check className="w-4 h-4 text-chestnut" />}
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
                <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-chestnut">
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
                    // Dropdown button base color updated to dust
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-dust/20 border border-dust/60 rounded-2xl font-sans text-sm"
                  >
                    <span className={form.stack ? "text-stone-900" : "text-stone-400"}>
                      {form.stack || "Pick a technology..."}
                    </span>
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  </button>

                  {stackOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-alabaster/60 rounded-2xl shadow-xl z-50 p-2 animate-in zoom-in-95 duration-200">
                      <input
                        // Search focus border updated to dust
                        className="w-full px-3 py-2 bg-dust/30 rounded-xl text-sm outline-none border border-transparent focus:border-dust mb-2"
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
                              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-dust/30 rounded-lg transition-colors text-left"
                            >
                              <span className="text-sm font-sans">{s}</span>
                              {form.stack === s && <Check className="w-4 h-4 text-chestnut" />}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-chestnut">
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
                      // Role card active borders/rings set to chestnut and dust
                      className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                        form.role === r.label
                          ? "border-chestnut bg-dust/30 ring-1 ring-chestnut"
                          : "border-alabaster/60 bg-white hover:border-dust"
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
                {/* Final step icon color change to chestnut */}
                <div className="w-16 h-16 bg-chestnut rounded-full flex items-center justify-center mx-auto shadow-lg shadow-chestnut/20">
                  <Sparkles className="text-white w-8 h-8" />
                </div>
                <h1 className="text-3xl text-stone-900 mt-6 tracking-tight">
                  Ready, {form.name.split(" ")[0]}?
                </h1>
                <div className="mt-8 p-6 bg-dust/20 rounded-3xl border border-alabaster/60 text-left space-y-3 font-sans">
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
              // Back button hover color to chestnut
              <button onClick={prevStep} className="text-stone-400 hover:text-chestnut font-sans text-sm transition-colors">
                ← Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                disabled={!canProceed()}
                onClick={handleNext}
                // Primary button colors changed to stone-900 (dark) and chestnut (hover)
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-sans font-bold text-sm transition-all ${
                  canProceed()
                    ? "bg-stone-900 text-white hover:bg-chestnut hover:scale-[1.02] shadow-lg shadow-dust"
                    : "bg-dust/50 text-stone-400 cursor-not-allowed"
                }`}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Analyzing..." : step === 2 ? "Generate Test →" : "Continue →"}
              </button>
            ) : (
              // Final primary button changed to chestnut
              <button className="w-full bg-chestnut text-white py-4 rounded-2xl font-sans font-bold hover:bg-chestnut/90 transition-all shadow-xl" onClick={()=>submitUser()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Start Assessment"}
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
      {/* Label and focus/ring changed to chestnut/dust */}
      <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-chestnut">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 bg-dust/20 border border-dust/60 rounded-2xl font-sans text-sm focus:outline-none focus:border-dust focus:ring-4 focus:ring-dust/10 transition-all"
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