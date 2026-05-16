import type { Goal, Portfolio } from '../types';

// Monthly dividends: 808 € → annual 9,696 € → at 4% yield → portfolio ~242,400 €
export const DEFAULT_PORTFOLIO: Portfolio = {
  value: 242_400,
  dividendYield: 4.0,
  monthlySavings: 4_000,
  dividendGrowth: 6.5,
  priceReturn: 5.0,
  horizonYears: 10,
};

export const CURRENT_YEAR = 2026;

let _id = 1;
const id = () => String(_id++);

export const DEFAULT_GOALS: Goal[] = [
  { id: id(), name: 'Wohnung / Miete',    monthlyAmount: 548.35, category: 'Wohnen',        emoji: '🏠' },
  { id: id(), name: 'Strom',              monthlyAmount:  42.87, category: 'Wohnen',        emoji: '⚡' },
  { id: id(), name: 'Internet',           monthlyAmount:  44.99, category: 'Kommunikation', emoji: '🌐' },
  { id: id(), name: 'GEZ',               monthlyAmount:  18.36, category: 'Kommunikation', emoji: '📺' },
  { id: id(), name: 'Handy (Lutz)',           monthlyAmount:  10.00, category: 'Kommunikation', emoji: '📱' },
  { id: id(), name: 'Handy (René)',           monthlyAmount:  10.00, category: 'Kommunikation', emoji: '📱' },
  { id: id(), name: 'Hausrat',               monthlyAmount:   5.57, category: 'Versicherungen', emoji: '🛡️' },
  { id: id(), name: 'Haftpflicht',           monthlyAmount:   2.21, category: 'Versicherungen', emoji: '🛡️' },
  { id: id(), name: 'OP Versicherung (Paul)',monthlyAmount:  31.50, category: 'Versicherungen', emoji: '🐕' },
  { id: id(), name: 'Haftpflicht (Paul)',    monthlyAmount:   3.70, category: 'Versicherungen', emoji: '🐕' },
  { id: id(), name: 'Apple iCloud',      monthlyAmount:   2.99, category: 'Freizeit',       emoji: '☁️' },
  { id: id(), name: 'Spotify',           monthlyAmount:   6.00, category: 'Freizeit',       emoji: '🎵' },
  { id: id(), name: 'DivvyDiary',        monthlyAmount:   2.75, category: 'Freizeit',       emoji: '📊' },
  { id: id(), name: 'Peloton',           monthlyAmount:  39.00, category: 'Gesundheit',     emoji: '🚴' },
  { id: id(), name: 'Fitnessstudio',     monthlyAmount:  42.90, category: 'Gesundheit',     emoji: '💪' },
  { id: id(), name: 'Lebensmittel',      monthlyAmount: 400.00, category: 'Ernährung',      emoji: '🛒' },
  { id: id(), name: 'Drogerie',          monthlyAmount:  50.00, category: 'Ernährung',      emoji: '🧴' },
  { id: id(), name: 'Futter (Paul)',     monthlyAmount:  50.00, category: 'Sonstiges',      emoji: '🦴' },
  { id: id(), name: 'Arzt (Paul)',       monthlyAmount: 100.00, category: 'Gesundheit',     emoji: '🩺' },
  { id: id(), name: 'Friseur (Lutz)',   monthlyAmount:  20.00, category: 'Sonstiges',      emoji: '✂️' },
  { id: id(), name: 'Friseur (René)',   monthlyAmount:  20.00, category: 'Sonstiges',      emoji: '✂️' },
  { id: id(), name: 'Urlaub',            monthlyAmount: 150.00, category: 'Freizeit',       emoji: '✈️' },
  { id: id(), name: 'Geschenke',         monthlyAmount:  20.00, category: 'Sonstiges',      emoji: '🎁' },
  { id: id(), name: 'Wohnen',            monthlyAmount:  35.00, category: 'Wohnen',        emoji: '🛋️' },
  { id: id(), name: 'Kleidung',          monthlyAmount: 100.00, category: 'Sonstiges',      emoji: '👕' },
  { id: id(), name: 'Gaming',            monthlyAmount:  50.00, category: 'Freizeit',       emoji: '🎮' },
  { id: id(), name: 'Zahnarzt',          monthlyAmount:  50.00, category: 'Gesundheit',     emoji: '🦷' },
];

export const CATEGORY_ORDER: Record<string, number> = {
  Wohnen: 0,
  Kommunikation: 1,
  Versicherungen: 2,
  Ernährung: 3,
  Gesundheit: 4,
  Freizeit: 5,
  Sonstiges: 6,
};

// Sum of all default monthly costs (unchanged: Friseur 40 € = 2 × 20 €)
export const TOTAL_MONTHLY_COSTS = 2_153.19;
