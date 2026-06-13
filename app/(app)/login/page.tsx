
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { createAuthClient } from "better-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const authClient = createAuthClient();
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const { error } = await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
        },
        {
          onSuccess: () => {
            router.replace("/dashboard");
          },
          onError: (ctx) => {
            console.error(ctx.error.message);
          },
        }
      );

      if (error) {
        console.error("Login error:", error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
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
    <div className="min-h-screen bg-black text-zinc-300 font-sans flex items-center justify-center p-6 selection:bg-white selection:text-black relative">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_40%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#050505] p-8 sm:p-10 border border-zinc-800 rounded-xl relative z-10 shadow-2xl"
      >
        {/* Header */}
        <div className="space-y-3 mb-8 text-center">
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            skillify // v2.0
          </div>

          <h1 className="text-3xl text-white font-medium tracking-tighter">
            Resume Session
          </h1>

          <p className="text-sm text-zinc-400">
            Drop back into the meta. Your roadmap is waiting.
          </p>
        </div>

        {/* Google OAuth */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleAuth}
          className="w-full h-11 bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-md font-medium transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
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

          Auth via Google
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-zinc-900 flex-1" />
          <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
            or execute manual
          </span>
          <div className="h-px bg-zinc-900 flex-1" />
        </div>

        {/* Form */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-xs text-zinc-400 font-medium">
                  Comms // Email
                </FieldLabel>

                <Input
                  {...field}
                  type="email"
                  placeholder="piyush@example.com"
                  aria-invalid={fieldState.invalid}
                  className="h-11 bg-transparent border-zinc-800 text-white placeholder:text-zinc-700 rounded-md focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-transparent transition-all"
                />

                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel className="text-xs text-zinc-400 font-medium">
                    Security Key // Password
                  </FieldLabel>

                  <a
                    href="/forgot-password"
                    className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    Lost Access?
                  </a>
                </div>

                <Input
                  {...field}
                  type="password"
                  placeholder="••••••••"
                  aria-invalid={fieldState.invalid}
                  className="h-11 bg-transparent border-zinc-800 text-white placeholder:text-zinc-700 rounded-md focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:border-transparent transition-all"
                />

                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-2 bg-white text-black hover:bg-zinc-200 rounded-md font-medium transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="font-mono text-[10px] uppercase tracking-widest">
                  Authenticating...
                </span>
              </>
            ) : (
              <>
                Lock In
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-500 mt-8">
          Not in the system?{" "}
          <a
            href="/signup"
            className="font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Initialize Profile.
          </a>
        </p>
      </motion.div>
    </div>
  );
}

