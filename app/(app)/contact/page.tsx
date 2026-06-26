"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TerminalSquare, 
  Send, 
  Loader2, 
  Mail, 
  CheckCircle2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaGithub, FaXTwitter } from "react-icons/fa6";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { ContactFormData, contactSchema } from "@/schemas/frontend/contact";
import { WordRevealHeading } from "@/components/ui/Landing-components";

// ─── Zod Schema ──────────────────────────────────────────────────────────────



export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    // Simulate network request/webhook logic
    try {
      console.log("Transmitting payload:");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
      form.reset();
    } catch (error) {
      console.error("Transmission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-white selection:text-black relative overflow-hidden">
      
      {/* Background Radial Glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_40%)]" />
      </div>

      <main className="relative z-10 pt-32 pb-32 max-w-6xl mx-auto px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* Left Column: Context & Socials */}
          <div className="space-y-10">
            <div>
              <div className="flex items-center gap-3 border-b border-zinc-900 pb-4 mb-8">
                <TerminalSquare size={16} className="text-zinc-500" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  system // comms
                </span>
              </div>
              
              <WordRevealHeading
                title="Open a channel."
                className="text-5xl font-medium tracking-tighter text-white sm:text-7xl leading-tight mb-6"
              />
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-base text-zinc-400 leading-relaxed font-sans max-w-md"
              >
                Found a bug in the protocol? Need enterprise access? Or just want to talk about the meta? Drop a payload here and we will sync up.
              </motion.p>
            </div>

            {/* Direct Links */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="space-y-4 pt-6 border-t border-zinc-900"
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-6">
                Direct Node Access
              </div>

              <a 
                href="mailto:ping@skillify.dev" 
                className="flex items-center gap-4 p-4 border border-zinc-800 bg-[#050505] rounded-sm hover:border-zinc-600 hover:bg-zinc-900/50 transition-all group"
              >
                <div className="h-8 w-8 bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-zinc-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Email Server</div>
                  <div className="font-mono text-[10px] text-zinc-500 mt-1">ping@skillify.dev</div>
                </div>
              </a>

              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 p-4 border border-zinc-800 bg-[#050505] rounded-sm hover:border-zinc-600 hover:bg-zinc-900/50 transition-all group"
              >
                <div className="h-8 w-8 bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                  <FaXTwitter size={14} className="text-zinc-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">X / Twitter</div>
                  <div className="font-mono text-[10px] text-zinc-500 mt-1">@piiyush_jsx</div>
                </div>
              </a>

              <a 
                href="https://github.com/i-piiyush" 
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 p-4 border border-zinc-800 bg-[#050505] rounded-sm hover:border-zinc-600 hover:bg-zinc-900/50 transition-all group"
              >
                <div className="h-8 w-8 bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                  <FaGithub size={14} className="text-zinc-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">GitHub</div>
                  <div className="font-mono text-[10px] text-zinc-500 mt-1">Pull requests & issues</div>
                </div>
              </a>
            </motion.div>
          </div>

          {/* Right Column: Form Payload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="border border-zinc-800 bg-[#050505] p-8 md:p-10 rounded-sm relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
            
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-8">
                    Execute Transmission
                  </div>

                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                    noValidate
                  >
                    <div className="grid sm:grid-cols-2 gap-6">
                      <Field
                        data-invalid={!!form.formState.errors.name}
                        className="space-y-2"
                      >
                        <FieldLabel className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                          Alias // Name
                        </FieldLabel>

                        <Input
                          {...form.register("name")}
                          placeholder="e.g. John Doe"
                          className="h-11 bg-black border-zinc-800 text-white placeholder:text-zinc-700 rounded-sm focus-visible:ring-1 focus-visible:ring-zinc-500 transition-all"
                        />

                        <FieldError errors={[form.formState.errors.name]} className="font-mono text-[10px] uppercase tracking-wider text-red-400" />
                      </Field>

                      <Field
                        data-invalid={!!form.formState.errors.email}
                        className="space-y-2"
                      >
                        <FieldLabel className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                          Return Addr // Email
                        </FieldLabel>

                        <Input
                          type="email"
                          {...form.register("email")}
                          placeholder="john@domain.com"
                          className="h-11 bg-black border-zinc-800 text-white placeholder:text-zinc-700 rounded-sm focus-visible:ring-1 focus-visible:ring-zinc-500 transition-all"
                        />

                        <FieldError errors={[form.formState.errors.email]} className="font-mono text-[10px] uppercase tracking-wider text-red-400" />
                      </Field>
                    </div>

                    <Field
                      data-invalid={!!form.formState.errors.message}
                      className="space-y-2"
                    >
                      <FieldLabel className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                        Payload // Message
                      </FieldLabel>

                      <Textarea
                        {...form.register("message")}
                        placeholder="Describe the issue, feature, or objective..."
                        className="min-h-40 resize-none bg-black border-zinc-800 text-white placeholder:text-zinc-700 rounded-sm focus-visible:ring-1 focus-visible:ring-zinc-500 transition-all p-4"
                      />

      <FieldError errors={[form.formState.errors.message]} className="font-mono text-[10px] uppercase tracking-wider text-red-400" />
    </Field>

    <Button
      type="submit"
      disabled={isSubmitting}
      className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-sm font-medium transition-colors mt-4"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className="font-mono text-[10px] uppercase tracking-widest">
            Transmitting...
          </span>
        </>
      ) : (
        <>
          Transmit Payload
          <Send className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  </form>

                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-16 text-center"
                >
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-sm bg-zinc-900 border border-zinc-800 mb-6">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-medium text-white tracking-tight mb-2">
                    Transmission Successful.
                  </h3>
                  <p className="text-sm text-zinc-500 font-sans mb-8">
                    The payload has been delivered to our servers. We will sync up with you shortly via the provided return address.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsSuccess(false)}
                    className="h-11 bg-transparent border-zinc-800 text-white  rounded-sm font-mono text-[10px] uppercase tracking-widest"
                  >
                    Send Another Packet
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>
      </main>
    </div>
  );
}