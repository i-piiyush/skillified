"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "dark" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "!bg-[#050505] !border !border-zinc-800 !rounded-md !shadow-2xl !text-zinc-300 font-mono",
          title:
            "!text-[10px] !uppercase !tracking-widest !font-bold",
          description:
            "!text-xs !text-zinc-400",
          success:
            "!border-green-900/50 !bg-green-950/40",
          error:
            "!border-red-900/50 !bg-red-950/40",
          warning:
            "!border-yellow-900/50 !bg-yellow-950/40",
          info:
            "!border-zinc-800 !bg-zinc-900",
          closeButton:
            "!bg-transparent !border-zinc-700",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };