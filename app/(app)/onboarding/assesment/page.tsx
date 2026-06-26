"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  X,
  TerminalSquare,
  Activity,
} from "lucide-react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

// 🔥 Your existing schema import
import { onboardValidation } from "../../../../schemas/frontend/onboardSchema";
import { SignUpFormData } from "@/types/signUp";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import Loader from "@/components/ui/Loader";

// ─── Types ────────────────────────────────────────────────────────────────────

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

const STEP_FIELDS: Record<number, (keyof SignUpFormData)[]> = {
  0: ["name", "email", "domain"],
  1: ["stack"],
  2: ["role"],
};

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
  const { data: session, isPending,refetch } = authClient.useSession();

  useEffect(() => {
    if (isPending) {
      return;
    }
  }, [isPending]);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(onboardValidation),
    defaultValues: {
      name: "",
      email: "",
      domain: "",
      stack: "",
      role: "",
    },
  });

  const {
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = form;

  const selectedDomain = watch("domain") || "";
  const selectedStack = watch("stack") || "";
  const selectedRole = watch("role") || "";
  const [nameValue, emailValue] = watch(["name", "email"]);

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

      if (!res.data?.success)
        throw new Error("Server returned unsuccessful response.");
      if (!Array.isArray(res.data.stack) || res.data.stack.length === 0)
        throw new Error("No technologies returned.");

      setStackOptions(res.data.stack);
      setStep(1);
    } catch (error) {
      const message = parseAxiosError(error);
      setStepError(message);
      toast.error("Generation Failed", {
        description: message,
      });
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
        userId: session?.user?.id || session?.session?.userId,
      });
      return true;
    } catch (error) {
      const message = parseAxiosError(error);
      setStepError(message);

      toast.error("Assessment Execution Failed", {
        description: message,
      });
      return false;
    }
  };

  const handleNext = async () => {
    setStepError(null);
    const fields = STEP_FIELDS[step];
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

  // 🔥 Enforces a STRICT 3-second minimum loader as requested
  const handleFinalSubmit = async () => {
    setIsGeneratingTest(true);
    try {
      const [testStarted] = await Promise.all([
        startTest(),
        new Promise((resolve) => setTimeout(resolve, 3000)), // Minimum 3s wait
      ]);

      if (testStarted) {
        await refetch()
        
        router.push("/test");
      } else {
        setIsGeneratingTest(false);
      }
    } catch (error) {
      setIsGeneratingTest(false);
    }
  };
  if (isPending) {
    return <Loader />;
  }
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans selection:bg-white selection:text-black relative overflow-hidden">
      {/* Background Radial */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_40%)]" />
      </div>

      {/* 🔥 Custom Terminal Loader (3s Minimum) */}
      <AnimatePresence>
        {isGeneratingTest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-200 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
          >
            <div className="w-full max-w-sm border border-zinc-800 bg-[#050505] p-8 rounded-md relative shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
              <div className="flex items-center gap-3 border-b border-zinc-900 pb-4 mb-6">
                <TerminalSquare size={16} className="text-zinc-500" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  skillify // execution
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 font-mono text-sm text-white">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                  <span>Test is generating...</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    <span>Compiling Node Map</span>
                    <span className="animate-pulse">Active</span>
                  </div>
                  <div className="h-0.5 w-full bg-zinc-900 overflow-hidden rounded-full">
                    <motion.div
                      className="h-full bg-white"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "linear" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Flat Wireframe Progress Bar */}
        <div className="flex gap-0.5 justify-center mb-10 w-full">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-[2px] flex-1 transition-all duration-500 ${
                i <= step ? "bg-white" : "bg-zinc-900"
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-[#050505] p-8 md:p-12 min-h-125 flex flex-col justify-between border border-zinc-800 rounded-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

          <form className="space-y-8 flex-1">
            <AnimatePresence mode="wait">
              {/* ── Step 0: Identity ── */}
              {step === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 block mb-2">
                      [SYS_INIT] // Identity
                    </span>
                    <h1 className="text-3xl text-white font-medium tracking-tighter">
                      Define Parameters.
                    </h1>
                  </div>

                  <div className="space-y-5">
                    <Controller
                      name="name"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                            Alias // Name
                          </FieldLabel>

                          <Input
                            {...field}
                            placeholder="e.g. Piyush Chhabra"
                            aria-invalid={fieldState.invalid}
                            className="h-11 bg-transparent border-zinc-800 text-white rounded-sm focus-visible:ring-1 focus-visible:ring-zinc-500"
                          />

                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      name="email"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                            Comms // Email
                          </FieldLabel>

                          <Input
                            {...field}
                            type="email"
                            placeholder="piyush@example.com"
                            aria-invalid={fieldState.invalid}
                            className="h-11 bg-transparent border-zinc-800 text-white rounded-sm focus-visible:ring-1 focus-visible:ring-zinc-500"
                          />

                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    {/* Custom Dropdown mapped to React Hook Form */}
                    <div className="space-y-2 relative" ref={domainRef}>
                      <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                        Vector // Domain
                      </label>

                      <button
                        type="button"
                        onClick={() => setDomainOpen(!domainOpen)}
                        className={`w-full flex items-center justify-between px-4 h-11 bg-transparent border rounded-sm transition-all font-sans text-sm ${
                          domainOpen
                            ? "border-zinc-500 ring-1 ring-zinc-500"
                            : "border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <span
                          className={
                            selectedDomain ? "text-white" : "text-zinc-600"
                          }
                        >
                          {selectedDomain || "Select your field..."}
                        </span>

                        <ChevronDown
                          className={`w-4 h-4 text-zinc-500 transition-transform ${
                            domainOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {errors.domain && (
                        <p className="text-[10px] uppercase font-mono text-red-400">
                          {errors.domain.message}
                        </p>
                      )}

                      <AnimatePresence>
                        {domainOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute top-full left-0 right-0 mt-1 bg-[#0A0A0A] border border-zinc-800 rounded-sm shadow-xl z-50 py-1 max-h-60 overflow-y-auto custom-scrollbar"
                          >
                            {DOMAINS.map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => {
                                  setValue("domain", d, {
                                    shouldValidate: true,
                                  });
                                  setValue("stack", "");
                                  setDomainOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors flex items-center justify-between"
                              >
                                <span>{d}</span>

                                {selectedDomain === d && (
                                  <Check className="w-4 h-4 text-white" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 1: Arsenal ── */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 block mb-2">
                      [SYS_VAR] // Arsenal
                    </span>
                    <h1 className="text-3xl text-white font-medium tracking-tighter">
                      Select Primary Tech.
                    </h1>
                  </div>

                  <div className="relative mt-6" ref={stackRef}>
                    <button
                      type="button"
                      onClick={() => setStackOpen(!stackOpen)}
                      className={`w-full flex items-center justify-between px-4 h-11 bg-transparent border rounded-sm transition-all font-sans text-sm ${
                        stackOpen
                          ? "border-zinc-500 ring-1 ring-zinc-500"
                          : "border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <span
                        className={
                          selectedStack ? "text-white" : "text-zinc-600"
                        }
                      >
                        {selectedStack || "Target Stack..."}
                      </span>
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    </button>
                    {errors.stack && (
                      <p className="text-[10px] uppercase font-mono text-red-400 mt-2">
                        {errors.stack.message}
                      </p>
                    )}

                    <AnimatePresence>
                      {stackOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-[#0A0A0A] border border-zinc-800 rounded-sm shadow-xl z-50 p-1"
                        >
                          <input
                            className="w-full px-3 h-9 bg-black border border-zinc-800 rounded-sm text-sm text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 mb-1"
                            placeholder="Search registry..."
                            value={stackSearch}
                            onChange={(e) => setStackSearch(e.target.value)}
                          />
                          <div className="max-h-48 overflow-y-auto custom-scrollbar">
                            {stackOptions.filter((s) =>
                              s
                                .toLowerCase()
                                .includes(stackSearch.toLowerCase()),
                            ).length === 0 ? (
                              <p className="text-center text-xs text-zinc-600 font-mono py-4">
                                No match found.
                              </p>
                            ) : (
                              stackOptions
                                .filter((s) =>
                                  s
                                    .toLowerCase()
                                    .includes(stackSearch.toLowerCase()),
                                )
                                .map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => {
                                      setValue("stack", s, {
                                        shouldValidate: true,
                                      });
                                      setStackOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-900 rounded-sm transition-colors text-left"
                                  >
                                    <span className="text-sm text-zinc-300">
                                      {s}
                                    </span>
                                    {selectedStack === s && (
                                      <Check className="w-4 h-4 text-white" />
                                    )}
                                  </button>
                                ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Objective ── */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 block mb-2">
                      [SYS_GOAL] // Objective
                    </span>
                    <h1 className="text-3xl text-white font-medium tracking-tighter">
                      Set Target Node.
                    </h1>
                  </div>

                  <div className="grid grid-cols-1 gap-2 max-h-75 overflow-y-auto custom-scrollbar pr-1">
                    {ROLES.map((r) => (
                      <button
                        key={r.label}
                        type="button"
                        onClick={() =>
                          setValue("role", r.label, { shouldValidate: true })
                        }
                        className={`flex flex-col items-start p-4 rounded-sm border text-left transition-all ${
                          selectedRole === r.label
                            ? "border-white bg-white/5 text-white"
                            : "border-zinc-800 bg-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                        }`}
                      >
                        <span className="text-sm font-medium">{r.label}</span>
                        <span className="text-xs font-mono mt-1 opacity-70">
                          {r.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                  {errors.role && (
                    <p className="text-[10px] uppercase font-mono text-red-400">
                      {errors.role.message}
                    </p>
                  )}
                </motion.div>
              )}

              {/* ── Step 3: Review ── */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <div className="w-12 h-12 border border-zinc-700 bg-zinc-900 rounded-sm flex items-center justify-center mx-auto">
                    <Activity className="text-white w-5 h-5" />
                  </div>
                  <h1 className="text-3xl text-white font-medium tracking-tighter">
                    Configuration Complete.
                  </h1>

                  <div className="border border-zinc-800 bg-[#0A0A0A] p-6 rounded-sm text-left space-y-4">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-zinc-600 uppercase tracking-widest">
                        Alias
                      </span>
                      <span className="text-zinc-300">
                        {nameValue || "N/A"}
                      </span>
                    </div>
                    <div className="h-px bg-zinc-900 w-full" />
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-zinc-600 uppercase tracking-widest">
                        Vector
                      </span>
                      <span className="text-zinc-300">
                        {selectedDomain || "N/A"}
                      </span>
                    </div>
                    <div className="h-px bg-zinc-900 w-full" />
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-zinc-600 uppercase tracking-widest">
                        Tech
                      </span>
                      <span className="text-zinc-300">
                        {selectedStack || "N/A"}
                      </span>
                    </div>
                    <div className="h-px bg-zinc-900 w-full" />
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-zinc-600 uppercase tracking-widest">
                        Target
                      </span>
                      <span className="text-zinc-300">
                        {selectedRole || "N/A"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {stepError && (
              <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-900/50 rounded-sm font-mono text-[10px] uppercase tracking-widest text-red-400 mt-4">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{stepError}</span>
              </div>
            )}
          </form>

          {/* ── Action Buttons ── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-900">
            {step > 0 ? (
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={loading || isGeneratingTest}
                className="text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-sm font-mono text-xs uppercase tracking-widest"
              >
                &larr; Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={loading}
                className="bg-white text-black hover:bg-zinc-200 rounded-sm font-medium h-10 px-6"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Continue"
                )}
              </Button>
            ) : (
              <Button
                disabled={loading || isGeneratingTest}
                onClick={handleSubmit(handleFinalSubmit)}
                className="bg-white text-black hover:bg-zinc-200 rounded-sm font-medium h-10 px-6 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Execute Protocol"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
