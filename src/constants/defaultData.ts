import type { Goal, Milestone, Portfolio } from '../types';

// Monthly dividends: 808 € → annual 9,696 € → at 4% yield → portfolio ~242,400 €
export const DEFAULT_PORTFOLIO: Portfolio = {
  value: 242_400,
  dividendYield: 4.0,
  monthlySavings: 4_000,
  dividendGrowth: 6.5,
  priceReturn: 5.0,
  horizonYears: 10,
  monthlyIncome: 808,
  lifetimeDividends: 42_134.24,
  lifetimeStartYear: 2012,
};

export const CURRENT_YEAR = new Date().getFullYear();

/** Auto-managed goal that absorbs Hero-edited overshoot. Created on demand. */
export const BONUS_GOAL_ID = 'bonus';

/** Auto-managed milestone whose dividendTarget tracks the sum of all goals. */
export const AUTO_EXPENSES_MS_ID = 'ms-all-expenses';

let _id = 1;
const id = () => String(_id++);

export const DEFAULT_GOALS: Goal[] = [
  { id: id(), name: 'Wohnung / Miete',        monthlyAmount: 548.35, category: 'Wohnen'         },
  { id: id(), name: 'Strom',                  monthlyAmount:  42.87, category: 'Nebenkosten'    },
  { id: id(), name: 'Internet',               monthlyAmount:  44.99, category: 'Kommunikation'  },
  { id: id(), name: 'GEZ',                    monthlyAmount:  18.36, category: 'Wohnen'         },
  { id: id(), name: 'Handy (Lutz)',           monthlyAmount:  10.00, category: 'Kommunikation'  },
  { id: id(), name: 'Handy (René)',           monthlyAmount:  10.00, category: 'Kommunikation'  },
  { id: id(), name: 'Hausrat',                monthlyAmount:   5.57, category: 'Versicherungen' },
  { id: id(), name: 'Haftpflicht',            monthlyAmount:   2.21, category: 'Versicherungen' },
  { id: id(), name: 'OP Versicherung (Paul)', monthlyAmount:  31.50, category: 'Haustiere'      },
  { id: id(), name: 'Haftpflicht (Paul)',     monthlyAmount:   3.70, category: 'Haustiere'      },
  { id: id(), name: 'Apple iCloud',           monthlyAmount:   2.99, category: 'Streaming'      },
  { id: id(), name: 'Spotify',                monthlyAmount:   6.00, category: 'Streaming'      },
  { id: id(), name: 'DivvyDiary',             monthlyAmount:   2.75, category: 'Sonstiges'      },
  { id: id(), name: 'Peloton',                monthlyAmount:  39.00, category: 'Sport'          },
  { id: id(), name: 'Fitnessstudio',          monthlyAmount:  42.90, category: 'Sport'          },
  { id: id(), name: 'Lebensmittel',           monthlyAmount: 400.00, category: 'Ernährung'      },
  { id: id(), name: 'Drogerie',               monthlyAmount:  50.00, category: 'Körperpflege'   },
  { id: id(), name: 'Futter (Paul)',          monthlyAmount:  50.00, category: 'Haustiere'      },
  { id: id(), name: 'Tierarzt (Paul)',        monthlyAmount: 100.00, category: 'Haustiere'      },
  { id: id(), name: 'Friseur (Lutz)',         monthlyAmount:  20.00, category: 'Körperpflege'   },
  { id: id(), name: 'Friseur (René)',         monthlyAmount:  20.00, category: 'Körperpflege'   },
  { id: id(), name: 'Urlaub',                 monthlyAmount: 150.00, category: 'Urlaub'         },
  { id: id(), name: 'Geschenke',              monthlyAmount:  20.00, category: 'Geschenke'      },
  { id: id(), name: 'Wohnen',                 monthlyAmount:  35.00, category: 'Wohnen'         },
  { id: id(), name: 'Kleidung',               monthlyAmount: 100.00, category: 'Kleidung'       },
  { id: id(), name: 'Gaming',                 monthlyAmount:  50.00, category: 'Gaming'         },
  { id: id(), name: 'Zahnarzt',               monthlyAmount:  50.00, category: 'Gesundheit'     },
  { id: id(), name: 'Auto',                   monthlyAmount: 297.00, category: 'Auto'           },
];

// Default milestones — even 250 €/month steps from 100 € all the way through
// 3.500 €/month, plus two motivating "Fixkosten" landmarks beyond the steps.
export const DEFAULT_MILESTONES: Milestone[] = [
  { id: 'ms-32', title: '25 € / Monat',               type: 'dividend', icon: 'heart',    dividendTarget:    25 },
  { id: 'ms-33', title: '50 € / Monat',               type: 'dividend', icon: 'gift',     dividendTarget:    50 },
  { id: 'ms-1',  title: '100 € / Monat',              type: 'dividend', icon: 'star',     dividendTarget:   100 },
  { id: 'ms-2',  title: '250 € / Monat',              type: 'dividend', icon: 'rocket',   dividendTarget:   250 },
  { id: 'ms-3',  title: '500 € / Monat',              type: 'dividend', icon: 'flag',     dividendTarget:   500 },
  { id: 'ms-23', title: '750 € / Monat',              type: 'dividend', icon: 'medal',    dividendTarget:   750 },
  { id: 'ms-13', title: '1.000 € / Monat',            type: 'dividend', icon: 'mountain', dividendTarget: 1_000 },
  { id: 'ms-24', title: '1.250 € / Monat',            type: 'dividend', icon: 'medal',    dividendTarget: 1_250 },
  { id: 'ms-14', title: '1.500 € / Monat',            type: 'dividend', icon: 'mountain', dividendTarget: 1_500 },
  { id: 'ms-25', title: '1.750 € / Monat',            type: 'dividend', icon: 'gem',      dividendTarget: 1_750 },
  { id: 'ms-15', title: '2.000 € / Monat',            type: 'dividend', icon: 'flag',     dividendTarget: 2_000 },
  { id: 'ms-26', title: '2.250 € / Monat',                 type: 'dividend', icon: 'target',   dividendTarget: 2_250 },
  { id: AUTO_EXPENSES_MS_ID, title: 'Alle Ausgaben / Monat', type: 'dividend', icon: 'trophy',   dividendTarget: 2_450 },
  { id: 'ms-27', title: '2.500 € / Monat',                 type: 'dividend', icon: 'mountain', dividendTarget: 2_500 },
  { id: 'ms-28', title: '2.750 € / Monat',            type: 'dividend', icon: 'gem',      dividendTarget: 2_750 },
  { id: 'ms-29', title: '3.000 € / Monat',            type: 'dividend', icon: 'mountain', dividendTarget: 3_000 },
  { id: 'ms-30', title: '3.250 € / Monat',            type: 'dividend', icon: 'gem',      dividendTarget: 3_250 },
  { id: 'ms-31', title: '3.500 € / Monat',            type: 'dividend', icon: 'crown',    dividendTarget: 3_500 },
];
