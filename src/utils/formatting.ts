// German locale throughout. Intl.NumberFormat construction is expensive, so
// each (decimals, currency) combination is built once and cached.
const formatters = new Map<number, Intl.NumberFormat>();

function numberFormat(decimals: number, currency: boolean): Intl.NumberFormat {
  const key = decimals * 2 + (currency ? 1 : 0);
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat('de-DE', {
      ...(currency && { style: 'currency', currency: 'EUR' }),
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    formatters.set(key, f);
  }
  return f;
}

/** "1.234,56 €" */
export const formatEuro = (value: number, decimals = 2): string => numberFormat(decimals, true).format(value);

/** "1.234,5" */
export const formatNumber = (value: number, decimals = 0): string => numberFormat(decimals, false).format(value);

/** "1.234,56" — the editable form of a euro amount. */
export const formatDecimal = (value: number): string => formatNumber(value, 2);

/** "37,4 %" */
export const formatPercent = (value: number, decimals = 1): string => `${formatNumber(value, decimals)} %`;

/** Euro amount with enough decimals that tiny rates never read as 0,00 €. */
export function formatEuroAdaptive(value: number): string {
  const v = Number.isFinite(value) && value > 0 ? value : 0;
  return formatEuro(v, v >= 1 || v === 0 ? 2 : v >= 0.01 ? 3 : 4);
}

/** One-line goal / milestone status shared by Dashboard and Setup:
 *  "Erreicht" · "Noch 104,83 € · ab 2027" · "297,00 € · ab 2028". */
export function formatProgressStatus({
  achieved, missing, full, year, showFull = true,
}: { achieved: boolean; missing: number; full: number; year: number | null; showFull?: boolean }): string {
  if (achieved) return 'Erreicht';
  const amount = full <= 0 ? '' : missing < full ? `Noch ${formatEuro(missing)}` : showFull ? formatEuro(full) : '';
  const when = year != null ? `ab ${year}` : 'außerhalb des Horizonts';
  return amount ? `${amount} · ${when}` : when;
}

/** Generate a short unique id, locally scoped to the user's session. */
export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Add German thousand-separator dots to the integer part while preserving the decimal comma. */
export function liveFormatAmount(raw: string): string {
  const stripped = raw.replace(/\./g, '').replace(/[^0-9,]/g, '');
  const commaIdx = stripped.indexOf(',');
  const intPart = commaIdx >= 0 ? stripped.slice(0, commaIdx) : stripped;
  const decPart = commaIdx >= 0 ? stripped.slice(commaIdx + 1) : null;
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decPart !== null ? `${formattedInt},${decPart}` : formattedInt;
}

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
