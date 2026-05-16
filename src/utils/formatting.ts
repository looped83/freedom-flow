const euroFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const euroFormatterCompact = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatEuro = (value: number): string => euroFormatter.format(value);
export const formatEuroCompact = (value: number): string => euroFormatterCompact.format(value);

export const formatPercent = (value: number, decimals = 1): string =>
  `${value.toFixed(decimals).replace('.', ',')} %`;

export const formatDays = (days: number): string => {
  const rounded = Math.round(days * 10) / 10;
  return `${rounded.toFixed(1).replace('.', ',')}`;
};

/** Parse a German-formatted number: "1.000,00" → 1000, "6,5" → 6.5, "42.90" → 42.90 */
export function parseGerman(raw: string): number {
  const s = raw.trim().replace(/\s/g, '');
  if (s.includes('.') && s.includes(',')) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.'));
  }
  if (s.includes(',')) return parseFloat(s.replace(',', '.'));
  if (s.includes('.')) {
    const after = s.split('.')[1] ?? '';
    if (after.length === 3) return parseFloat(s.replace('.', ''));
  }
  return parseFloat(s);
}

