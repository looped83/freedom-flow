import type { Goal, Portfolio } from '../types';

// Monthly dividends: 808 € → annual 9,696 € → at 4% yield → portfolio ~242,400 €
export const DEFAULT_PORTFOLIO: Portfolio = {
  value: 242_400,
  dividendYield: 4.0,
  monthlySavings: 4_000,
  dividendGrowth: 6.5,
  priceReturn: 5.0,
  horizonYears: 10,
  monthlyIncome: 808,
};

export const CURRENT_YEAR = new Date().getFullYear();

let _id = 1;
const id = () => String(_id++);

export const DEFAULT_GOALS: Goal[] = [
  { id: id(), name: 'Wohnung / Miete',        monthlyAmount: 548.35, category: 'Wohnen',        emoji: '🏠' },
  { id: id(), name: 'Strom',                  monthlyAmount:  42.87, category: 'Nebenkosten',   emoji: '⚡' },
  { id: id(), name: 'Internet',               monthlyAmount:  44.99, category: 'Kommunikation', emoji: '🌐' },
  { id: id(), name: 'GEZ',                    monthlyAmount:  18.36, category: 'Wohnen',        emoji: '📺' },
  { id: id(), name: 'Handy (Lutz)',           monthlyAmount:  10.00, category: 'Kommunikation', emoji: '📱' },
  { id: id(), name: 'Handy (René)',           monthlyAmount:  10.00, category: 'Kommunikation', emoji: '📱' },
  { id: id(), name: 'Hausrat',                monthlyAmount:   5.57, category: 'Versicherungen', emoji: '🛡️' },
  { id: id(), name: 'Haftpflicht',            monthlyAmount:   2.21, category: 'Versicherungen', emoji: '🛡️' },
  { id: id(), name: 'OP Versicherung (Paul)', monthlyAmount:  31.50, category: 'Haustiere',     emoji: '🐕' },
  { id: id(), name: 'Haftpflicht (Paul)',     monthlyAmount:   3.70, category: 'Haustiere',     emoji: '🐕' },
  { id: id(), name: 'Apple iCloud',           monthlyAmount:   2.99, category: 'Streaming',     emoji: '☁️' },
  { id: id(), name: 'Spotify',                monthlyAmount:   6.00, category: 'Streaming',     emoji: '🎵' },
  { id: id(), name: 'DivvyDiary',             monthlyAmount:   2.75, category: 'Sonstiges',     emoji: '📊' },
  { id: id(), name: 'Peloton',                monthlyAmount:  39.00, category: 'Sport',         emoji: '🚴' },
  { id: id(), name: 'Fitnessstudio',          monthlyAmount:  42.90, category: 'Sport',         emoji: '💪' },
  { id: id(), name: 'Lebensmittel',           monthlyAmount: 400.00, category: 'Ernährung',     emoji: '🛒' },
  { id: id(), name: 'Drogerie',               monthlyAmount:  50.00, category: 'Körperpflege',  emoji: '🧴' },
  { id: id(), name: 'Futter (Paul)',          monthlyAmount:  50.00, category: 'Haustiere',     emoji: '🦴' },
  { id: id(), name: 'Tierarzt (Paul)',        monthlyAmount: 100.00, category: 'Haustiere',     emoji: '🩺' },
  { id: id(), name: 'Friseur (Lutz)',         monthlyAmount:  20.00, category: 'Körperpflege',  emoji: '✂️' },
  { id: id(), name: 'Friseur (René)',         monthlyAmount:  20.00, category: 'Körperpflege',  emoji: '✂️' },
  { id: id(), name: 'Urlaub',                monthlyAmount: 150.00, category: 'Urlaub',        emoji: '✈️' },
  { id: id(), name: 'Geschenke',              monthlyAmount:  20.00, category: 'Geschenke',     emoji: '🎁' },
  { id: id(), name: 'Wohnen',                monthlyAmount:  35.00, category: 'Wohnen',        emoji: '🛋️' },
  { id: id(), name: 'Kleidung',              monthlyAmount: 100.00, category: 'Kleidung',      emoji: '👕' },
  { id: id(), name: 'Gaming',               monthlyAmount:  50.00, category: 'Gaming',        emoji: '🎮' },
  { id: id(), name: 'Zahnarzt',             monthlyAmount:  50.00, category: 'Gesundheit',    emoji: '🦷' },
];

export const CATEGORY_ORDER: Record<string, number> = {
  Wohnen: 0,
  Nebenkosten: 1,
  Mobilität: 2,
  Ernährung: 3,
  Restaurant: 4,
  Gesundheit: 5,
  Medizin: 6,
  Sport: 7,
  Körperpflege: 8,
  Kleidung: 9,
  Elektronik: 10,
  Haustiere: 11,
  Freizeit: 12,
  Gaming: 13,
  Geschenke: 14,
  Urlaub: 15,
  Kommunikation: 16,
  Streaming: 17,
  Bildung: 18,
  Versicherungen: 19,
  Sonstiges: 20,
};

// Sum of all default monthly costs (unchanged: Friseur 40 € = 2 × 20 €)
export const TOTAL_MONTHLY_COSTS = 2_153.19;
