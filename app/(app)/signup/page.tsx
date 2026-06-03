"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, User, AlertCircle } from "lucide-react";
import { createAuthClient } from "better-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signupSchema } from "@/schemas/frontend/signupSchema";
import { useRouter } from "next/navigation";

type SignupFormData = z.infer<typeof signupSchema>;

// ─── Main Component ───────────────────────────────────────────────────────────
const Page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const authClient = createAuthClient();
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

 const onSubmit = async (signup_data: SignupFormData) => {
	setIsLoading(true);
	try {
		const { data, error } = await authClient.signUp.email({
			name: signup_data.name,
			email: signup_data.email,
			password: signup_data.password,
		}, {
			onSuccess: () => {
				router.replace("/dashboard")
			},
			onError: (ctx) => {
				console.error(ctx.error.message);
			}
		});

		if (error) {
			console.error("Signup error:", error);
		}
	} catch (error) {
		console.error(error);
	} finally {
		setIsLoading(false);
	}
};

  const handleGoogleAuth = async () => {
    console.log("Trigger Google Auth");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-6 font-serif selection:bg-[#D8DDDE] selection:text-[var(--color-chestnut,#8C271E)] relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md bg-white p-10 md:p-12 rounded-[32px] shadow-xl border border-[#E5E4E0] relative z-10"
      >
        {/* Header */}
        <div className="space-y-2 mb-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-[var(--color-chestnut,#8C271E)]">
            skillcheck.
          </p>
          <h1 className="text-3xl text-neutral-900 tracking-tight leading-tight">
            Create your account.
          </h1>
          <p className="text-sm font-sans text-neutral-500">
            Lock in and build your personalized roadmap.
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-3 bg-white border border-[#CFCBCA] text-neutral-800 px-4 py-3.5 rounded-2xl font-sans font-medium text-sm hover:bg-[#F7F6F3] hover:border-neutral-400 transition-all focus:outline-none focus:ring-4 focus:ring-neutral-100"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="h-px bg-[#E5E4E0] flex-1" />
          <span className="text-[10px] font-sans text-neutral-400 uppercase tracking-widest font-bold">
            Or use email
          </span>
          <div className="h-px bg-[#E5E4E0] flex-1" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-[var(--color-chestnut,#8C271E)]">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Piyush Chhabra"
                {...register("name")}
                className={`w-full pl-11 pr-4 py-3.5 bg-[#F7F6F3] border rounded-2xl font-sans text-sm text-neutral-900 focus:outline-none focus:ring-4 transition-all placeholder:text-neutral-400 ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-[#CFCBCA] focus:border-[var(--color-chestnut,#8C271E)] focus:ring-[var(--color-chestnut,#8C271E)]/10"
                }`}
              />
            </div>
            {errors.name && (
              <p className="flex items-center gap-1.5 text-red-500 text-xs font-sans mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-[var(--color-chestnut,#8C271E)]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="email"
                placeholder="piyush@example.com"
                {...register("email")}
                className={`w-full pl-11 pr-4 py-3.5 bg-[#F7F6F3] border rounded-2xl font-sans text-sm text-neutral-900 focus:outline-none focus:ring-4 transition-all placeholder:text-neutral-400 ${
                  errors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-[#CFCBCA] focus:border-[var(--color-chestnut,#8C271E)] focus:ring-[var(--color-chestnut,#8C271E)]/10"
                }`}
              />
            </div>
            {errors.email && (
              <p className="flex items-center gap-1.5 text-red-500 text-xs font-sans mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-[var(--color-chestnut,#8C271E)]">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className={`w-full pl-11 pr-4 py-3.5 bg-[#F7F6F3] border rounded-2xl font-sans text-sm text-neutral-900 focus:outline-none focus:ring-4 transition-all placeholder:text-neutral-400 ${
                  errors.password
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                    : "border-[#CFCBCA] focus:border-[var(--color-chestnut,#8C271E)] focus:ring-[var(--color-chestnut,#8C271E)]/10"
                }`}
              />
            </div>
            {errors.password && (
              <p className="flex items-center gap-1.5 text-red-500 text-xs font-sans mt-1">
                <AlertCircle className="w-3 h-3" />
                {errors.password.message}
              </p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#1A1918] text-white py-4 mt-2 rounded-2xl font-sans font-bold text-sm hover:bg-black transition-all shadow-lg shadow-neutral-900/10 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Create account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <p className="text-center text-xs font-sans text-neutral-500 mt-8">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-bold text-neutral-900 hover:text-[var(--color-chestnut,#8C271E)] transition-colors"
          >
            Log in
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Page;
