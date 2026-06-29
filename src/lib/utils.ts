import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currency(value: number, code = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${code}`;
  }
}

export function makeOrderNumber(date = new Date()) {
  const stamp = date.toISOString().slice(0, 10).replaceAll("-", "");
  const entropy = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MSM-${stamp}-${entropy}`;
}
