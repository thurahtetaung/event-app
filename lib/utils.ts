import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format as dateFnsFormat } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string for display, handling timezone issues consistently.
 * @param dateString - ISO date string (from API/database)
 * @param formatStr - Date-fns format string
 * @returns Formatted date string in local timezone
 */
export function formatDate(dateString: string, formatStr: string = "PPP") {
  // Create a date object - this will automatically convert to local timezone
  const date = new Date(dateString);
  return dateFnsFormat(date, formatStr);
}

/**
 * Formats a time string for display.
 * @param dateString - ISO date string (from API/database)
 * @param formatStr - Date-fns format string
 * @returns Formatted time string in local timezone
 */
export function formatTime(dateString: string, formatStr: string = "p") {
  const date = new Date(dateString);
  return dateFnsFormat(date, formatStr);
}

/**
 * Formats a date and time range for display.
 * @param startDateString - ISO date string for start time
 * @param endDateString - ISO date string for end time
 * @returns Formatted date and time range string
 */
export function formatDateTimeRange(startDateString: string, endDateString: string) {
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);

  // If same day, show date once with time range
  if (startDate.toDateString() === endDate.toDateString()) {
    return `${dateFnsFormat(startDate, "PPP")} · ${dateFnsFormat(startDate, "p")} - ${dateFnsFormat(endDate, "p")}`;
  }

  // Different days, show full range
  return `${dateFnsFormat(startDate, "PPP")} ${dateFnsFormat(startDate, "p")} - ${dateFnsFormat(endDate, "PPP")} ${dateFnsFormat(endDate, "p")}`;
}