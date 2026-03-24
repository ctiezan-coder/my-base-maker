import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize a string for use in PostgREST filter expressions.
 * Escapes characters that could manipulate filter grammar.
 */
export function sanitizeFilterValue(value: string): string {
  return value.replace(/[,.()"\\*]/g, '');
}
