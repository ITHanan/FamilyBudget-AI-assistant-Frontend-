export const currency = new Intl.NumberFormat('sv-SE', {
  style: 'currency',
  currency: 'SEK',
  maximumFractionDigits: 0
});

export const shortDate = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  day: 'numeric'
});

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
