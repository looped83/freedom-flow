export type GoalCategory =
  | 'Wohnen'
  | 'Versicherungen'
  | 'Kommunikation'
  | 'Gesundheit'
  | 'Ernährung'
  | 'Freizeit'
  | 'Sonstiges';

export type GoalStatus = 'covered' | 'partial' | 'open';

export interface Goal {
  id: string;
  name: string;
  monthlyAmount: number;
  category: GoalCategory;
  emoji: string;
}

export interface Portfolio {
  value: number;
  dividendYield: number;
  monthlySavings: number;
  dividendGrowth: number;
  priceReturn: number;
  horizonYears: number;
  monthlyIncome: number;
}

export type UnlockType = 'income' | 'goal' | 'freedom' | 'lifetime';

export interface Unlock {
  id: string;
  type: UnlockType;
  title: string;
  subtitle: string;
  emoji: string;
  achieved: boolean;
  progressPct: number;      // 0–100
  missingMonthly: number;   // how much more €/month needed (0 if achieved)
}

export interface TimelineEntry {
  year: number;
  projectedMonthly: number;
  newGoals: Goal[];          // goals newly unlocked this year
  isCurrentYear: boolean;    // year 0 = already achieved today
  isFreedomYear: boolean;    // all goals covered this year
}

export interface GoalResult extends Goal {
  status: GoalStatus;
  coveredAmount: number;
  coveragePercent: number;
  achievedYear: number | null;
}

export interface ProjectionYear {
  year: number;
  portfolioValue: number;
  annualDividends: number;
  monthlyDividends: number;
  coveragePercent: number;
  coveredGoals: number;
  freeDaysPerMonth: number;
}

export interface AppState {
  portfolio: Portfolio;
  goals: Goal[];
}

// Dashboard display filter – separate from coverage allocation order
export type FilterMode = 'amount' | 'category' | 'covered' | 'open';
export type SortDir = 'asc' | 'desc';
export interface DisplayFilter {
  mode: FilterMode;
  dir: SortDir;
}
