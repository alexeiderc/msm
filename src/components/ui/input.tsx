import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-md border border-msm-silver bg-white px-3 text-sm font-semibold text-msm-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none transition placeholder:text-slate-400 focus:border-msm-blue focus:ring-2 focus:ring-blue-100",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-11 w-full rounded-md border border-msm-silver bg-white px-3 text-sm font-semibold text-msm-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none transition focus:border-msm-blue focus:ring-2 focus:ring-blue-100",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-msm-silver bg-white px-3 py-2 text-sm font-semibold text-msm-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] outline-none transition placeholder:text-slate-400 focus:border-msm-blue focus:ring-2 focus:ring-blue-100",
        className
      )}
      {...props}
    />
  );
}
