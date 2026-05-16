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

export type SortMode = 'amount' | 'category' | 'default';
