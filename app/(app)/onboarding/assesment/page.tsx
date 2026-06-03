"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Check,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// 🔥 Apna existing schema aur type yahan import karo
// NOTE: Is path ko apne project ke hisaab se update kar lena jahan schema rakha hai
import { signUpValidation } from "../../../../schemas/frontend/signupSchema"; 
import { SignUpFormData } from "@/types/signUp";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToastMessage {
  id: number;
  type: "error" | "success" | "info";
  title: string;
  message: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = [
  { label: "Internship", sub: "3–6 month stint" },
  { label: "SDE1", sub: "0–2 years experience" },
  { label: "SDE2", sub: "2–5 years experience" },
  { label: "SDE3", sub: "5+ years experience" },
];

export const DOMAINS = [
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

// Step fields matching your existing schema keys
const STEP_FIELDS: Record<number, (keyof SignUpFormData)[]> = {
  0: ["name", "email", "domain"],
  1: ["stack"],
  2: ["role"],
};

// ─── Toast Component ──────────────────────────────────────────────────────────

function Toast({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border font-sans text-sm animate-in slide-in-from-right-4 duration-300 ${
            toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">{toast.title}</p>
            <p className="text-xs mt-0.5 opacity-80">{toast.message}</p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function StepErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl font-sans text-sm text-red-700 animate-in fade-in duration-200 mt-6">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counterRef = useRef(0);

  const addToast = (
    type: ToastMessage["type"],
    title: string,
    message: string,
    duration = 5000,
  ) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    if (duration > 0) setTimeout(() => dismissToast(id), duration);
  };

  const dismissToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, addToast, dismissToast };
}

function parseAxiosError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorResponse>;
    if (!axiosErr.response) {
      if (axiosErr.code === "ECONNABORTED") return "Request timed out.";
      if (axiosErr.code === "ERR_NETWORK") return "Network error.";
      return "Could not reach the server.";
    }
    const status = axiosErr.response.status;
    const serverMsg =
      axiosErr.response.data?.message ||
      axiosErr.response.data?.error ||
      axiosErr.message;
    if (status === 409) return "This email may already be registered.";
    return serverMsg || "An unexpected error occurred.";
  }
  if (error instanceof Error) return error.message;
  return "An unknown error occurred.";
}


// ─── Main Component ───────────────────────────────────────────────────────────

export default function RegistrationPage() {
  const [step, setStep] = useState(0);
  const [stackOptions, setStackOptions] = useState<string[]>([]);

  const [stackOpen, setStackOpen] = useState(false);
  const [stackSearch, setStackSearch] = useState("");
  const [domainOpen, setDomainOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const stackRef = useRef<HTMLDivElement>(null);
  const domainRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toasts, addToast, dismissToast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    trigger,
    setError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpValidation), 
    defaultValues: {
      name: "",
      email: "",
      domain: "",
      stack: "",
      role: "",
    },
  });

  const selectedDomain = watch("domain") || "";
  const selectedStack = watch("stack") || "";
  const selectedRole = watch("role") || "";
  const [nameValue, emailValue] = watch([
    "name",
    "email",
  
  ]);

  useEffect(() => {
    setStepError(null);
  }, [step]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!stackRef.current?.contains(e.target as Node)) setStackOpen(false);
      if (!domainRef.current?.contains(e.target as Node)) setDomainOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchStack = async () => {
    setStepError(null);
    setLoading(true);
    try {
      const res = await axios.post<{ success: boolean; stack: string[] }>(
        "/api/generate-stack",
        { domain: selectedDomain },
        { timeout: 15_000 },
      );

      if (!res.data?.success) throw new Error("Server returned unsuccessful response.");
      if (!Array.isArray(res.data.stack) || res.data.stack.length === 0) throw new Error("No technologies returned.");
      
      setStackOptions(res.data.stack);
      setStep(1);
    } catch (error) {
      const message = parseAxiosError(error);
      setStepError(message);
      addToast("error", "Could not load technologies", message);
    } finally {
      setLoading(false);
    }
  };


  const startTest = async (): Promise<boolean> => {
    try {
      await axios.post("/api/onboard-user", {
        domain: selectedDomain,
        role: selectedRole,
        email: emailValue,
        stack: selectedStack,
      });
      return true;
    } catch (error) {
      const message = parseAxiosError(error);
      setStepError(message);
      addToast("error", "Could not start assessment", message);
      return false;
    }
  };

  const handleNext = async () => {
    setStepError(null);
    const fields = STEP_FIELDS[step];
    console.log(fields)
    
    if (fields) {
      const isValid = await trigger(fields);
      if (!isValid) return; 
    }
    
    if (step === 0) await fetchStack();
    else if (step === 1) setStep((s) => s + 1);
    else if (step === 2) setStep((s) => s + 1);
  };

  const prevStep = () => {
    setStepError(null);
    setStep((s) => s - 1);
  };

  const handleFinalSubmit = async () => {
   
    
    setIsGeneratingTest(true);

    try {
      const [testStarted] = await Promise.all([
        startTest(),
        new Promise((resolve) => setTimeout(resolve, 2000)), 
      ]);

      if (testStarted) {
        router.push("/test"); 
      } else {
        setIsGeneratingTest(false);
      }
    } catch (error) {
      setIsGeneratingTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-khaki flex items-center justify-center p-6 font-serif selection:bg-alabaster selection:text-chestnut relative">
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {isGeneratingTest && (
        <div className="fixed inset-0 z-200 flex flex-col items-center justify-center bg-stone-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <Loader2 className="w-12 h-12 text-white animate-spin mb-6" />
          <h2 className="text-2xl md:text-3xl text-white font-serif tracking-tight mb-2 text-center px-4">
            Generating your test...
          </h2>
          <p className="text-stone-300 font-sans text-sm text-center px-4 max-w-sm">
            Please wait while we analyze your stack and craft the perfect assessment.
          </p>
        </div>
      )}

      <div className="relative z-10 w-full max-w-lg">
        {/* Progress Bar */}
        <div className="flex gap-2 justify-center mb-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i <= step ? "bg-alabaster w-8" : "bg-dust/50 w-4"
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white p-10 md:p-14 min-h-125 flex flex-col justify-between rounded-3xl shadow-xl">
          <div className="space-y-8">
            {/* ── Step 0 ── */}
            {step === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-chestnut">
                  Step 01 — Identity
                </span>
                <h1 className="text-3xl text-stone-900 mt-2 tracking-tight">
                  Tell us about yourself.
                </h1>
                <div className="space-y-4 mt-8">
                  <div>
                    <Input
                      label="What should we call you?"
                      placeholder="e.g. Piyush Chhabra"
                      register={register("name")}
                    />
                    {errors.name && <FieldError message={errors.name.message} />}
                  </div>
                  <div>
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="piyush@example.com"
                      register={register("email")}
                    />
                    {errors.email && <FieldError message={errors.email.message} />}
                  </div>
                 

                  {/* Domain Dropdown */}
                  <div className="relative" ref={domainRef}>
                    <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-chestnut mb-2 block">
                      Domain
                    </label>
                    <button
                      type="button"
                      onClick={() => setDomainOpen(!domainOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 bg-dust/20 border rounded-2xl transition-all font-sans text-sm ${
                        domainOpen ? "border-chestnut ring-4 ring-chestnut/5" : "border-dust/60"
                      }`}
                    >
                      <span className={selectedDomain ? "text-stone-900" : "text-stone-400"}>
                        {selectedDomain || "Select your field"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 transition-transform ${domainOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {errors.domain && <FieldError message={errors.domain.message} />}

                    {domainOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-alabaster/60 rounded-2xl shadow-xl z-50 py-2 max-h-60 overflow-y-auto animate-in zoom-in-95 duration-200">
                        {DOMAINS.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => {
                              setValue("domain", d, { shouldValidate: true });
                              setValue("stack", "");
                              setDomainOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm font-sans hover:bg-dust/30 transition-colors flex items-center justify-between"
                          >
                            <span>{d}</span>
                            {selectedDomain === d && <Check className="w-4 h-4 text-chestnut" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 1 ── */}
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
                    type="button"
                    onClick={() => setStackOpen(!stackOpen)}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-dust/20 border border-dust/60 rounded-2xl font-sans text-sm"
                  >
                    <span className={selectedStack ? "text-stone-900" : "text-stone-400"}>
                      {selectedStack || "Pick a technology..."}
                    </span>
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  </button>
                  {errors.stack && <FieldError message={errors.stack.message} />}

                  {stackOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-alabaster/60 rounded-2xl shadow-xl z-50 p-2 animate-in zoom-in-95 duration-200">
                      <input
                        className="w-full px-3 py-2 bg-dust/30 rounded-xl text-sm outline-none border border-transparent focus:border-dust mb-2"
                        placeholder="Search stack..."
                        value={stackSearch}
                        onChange={(e) => setStackSearch(e.target.value)}
                      />
                      <div className="max-h-48 overflow-y-auto">
                        {stackOptions.filter((s) =>
                          s.toLowerCase().includes(stackSearch.toLowerCase()),
                        ).length === 0 ? (
                          <p className="text-center text-xs text-stone-400 font-sans py-4">
                            No results for &quot;{stackSearch}&quot;
                          </p>
                        ) : (
                          stackOptions
                            .filter((s) => s.toLowerCase().includes(stackSearch.toLowerCase()))
                            .map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => {
                                  setValue("stack", s, { shouldValidate: true });
                                  setStackOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-dust/30 rounded-lg transition-colors text-left"
                              >
                                <span className="text-sm font-sans">{s}</span>
                                {selectedStack === s && <Check className="w-4 h-4 text-chestnut" />}
                              </button>
                            ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-chestnut">
                  Step 03 — Objective
                </span>
                <h1 className="text-3xl text-stone-900 mt-2 tracking-tight">
                  What&apos;s the goal?
                </h1>
                <div className="grid grid-cols-1 gap-3 mt-8 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                  {ROLES.map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => setValue("role", r.label, { shouldValidate: true })}
                      className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                        selectedRole === r.label
                          ? "border-chestnut bg-dust/30 ring-1 ring-chestnut"
                          : "border-alabaster/60 bg-white hover:border-dust"
                      }`}
                    >
                      <span className="text-sm font-sans font-medium text-stone-900">{r.label}</span>
                      <span className="text-xs font-sans text-stone-400 mt-0.5">{r.sub}</span>
                    </button>
                  ))}
                </div>
                {errors.role && <FieldError message={errors.role.message} />}
              </div>
            )}

            {/* ── Step 3 (Review) ── */}
            {step === 3 && (
              <div className="text-center animate-in fade-in zoom-in-95 duration-700">
                <div className="w-16 h-16 bg-chestnut rounded-full flex items-center justify-center mx-auto shadow-lg shadow-chestnut/20">
                  <Sparkles className="text-white w-8 h-8" />
                </div>
                <h1 className="text-3xl text-stone-900 mt-6 tracking-tight">
                  Ready, {nameValue ? nameValue.trim().split(" ")[0] : "there"}?
                </h1>
                <div className="mt-8 p-6 bg-dust/20 rounded-3xl border border-alabaster/60 text-left space-y-3 font-sans">
                  <DetailRow label="Domain" value={selectedDomain} />
                  <DetailRow label="Stack" value={selectedStack} />
                  <DetailRow label="Target" value={selectedRole} />
                </div>
              </div>
            )}

            <StepErrorBanner message={stepError} />
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center justify-between mt-12">
            {step > 0 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={loading || isGeneratingTest}
                className="text-stone-400 hover:text-chestnut font-sans text-sm transition-colors disabled:opacity-40"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl font-sans font-bold text-sm transition-all bg-stone-900 text-white hover:bg-chestnut hover:scale-[1.02] shadow-lg shadow-dust"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Analyzing..." : step === 2 ? "Generate Test →" : "Continue →"}
              </button>
            ) : (
              <button
                type="button"
                disabled={loading || isGeneratingTest}
                className="w-full bg-chestnut text-white py-4 rounded-2xl font-sans font-bold hover:bg-chestnut/90 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSubmit(handleFinalSubmit)}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Start Assessment"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Small Components ─────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-red-500 text-xs font-sans mt-1 animate-in fade-in zoom-in duration-200">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {message}
    </p>
  );
}

function Input({ label, placeholder, type = "text", register }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-chestnut">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        {...register}
        className="w-full px-4 py-3.5 bg-dust/20 border border-dust/60 rounded-2xl font-sans text-sm focus:outline-none focus:border-dust focus:ring-4 focus:ring-dust/10 transition-all"
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-stone-400">{label}</span>
      <span className="text-stone-900 font-medium">
        {value || <span className="text-red-400 italic">missing</span>}
      </span>
    </div>
  );
}