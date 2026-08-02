import { format, parseISO } from "date-fns";

export const compDateFormat = "yyyy-MM-dd";

export function toCompDateOnly(date: Date | string = new Date()): string {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, compDateFormat);
}
