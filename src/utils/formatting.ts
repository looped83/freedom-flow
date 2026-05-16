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
