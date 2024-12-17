import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateCorrectRate(correct: number, wrong: number): number {
  return Math.round((correct / (correct + wrong)) * 100);
}

export function formatMinutes(minutes: number): string {
  return `${minutes}分`;
}

export function formatPercentage(value: number): string {
  return `${value}%`;
}