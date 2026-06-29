import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-msm-line bg-white px-2.5 py-1 text-xs font-semibold text-msm-ink",
        className
      )}
      {...props}
    />
  );
}
