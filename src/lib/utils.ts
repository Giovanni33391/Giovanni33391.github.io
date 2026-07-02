import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate the 1% improvement compounded over days
export function calculateCompoundedMetric(initial: number, days: number): number {
  return initial * Math.pow(1.01, days);
}

// Format number to 1 decimal place if needed
export function formatMetric(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}
