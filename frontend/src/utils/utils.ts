export function formatAud(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}


export function roundToNearest5(number: number): number {
  return Math.round(number / 5) * 5;
}
