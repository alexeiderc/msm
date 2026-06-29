import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-msm-blue px-4 py-2 text-sm font-bold text-white shadow-[0_14px_34px_rgba(25,123,210,0.24)] transition hover:-translate-y-0.5 hover:bg-msm-electric focus:outline-none focus:ring-2 focus:ring-msm-electric disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
}
