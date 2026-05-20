export type GoalCategory =
  | 'Wohnen'
  | 'Nebenkosten'
  | 'Mobilität'
  | 'Ernährung'
  | 'Restaurant'
  | 'Auto'
  | 'Gesundheit'
  | 'Sport'
  | 'Körperpflege'
  | 'Kleidung'
  | 'Elektronik'
  | 'Haustiere'
  | 'Freizeit'
  | 'Gaming'
  | 'Geschenke'
  | 'Urlaub'
  | 'Kommunikation'
  | 'Streaming'
  | 'Bildung'
  | 'Versicherungen'
  | 'Sonstiges';

export type GoalStatus = 'covered' | 'partial' | 'open';

export interface Goal {
  id: string;
  name: string;
  monthlyAmount: number;
  category: GoalCategory;
}

export interface Portfolio {
  value: number;
  dividendYield: number;
  monthlySavings: number;
  dividendGrowth: number;
  priceReturn: number;
  horizonYears: number;
  monthlyIncome: number;
  lifetimeDividends: number;
  lifetimeStartYear: number;
}

export interface TimelineEntry {
  year: number;
  projectedMonthly: number;
  newGoals: Goal[];          // goals newly unlocked this year
  isCurrentYear: boolean;
  isFreedomYear: boolean;
  isPastYear: boolean;       // retrospective entry (estimated from growth model)
}

export interface GoalResult extends Goal {
  status: GoalStatus;
  coveredAmount: number;
  coveragePercent: number;
  achievedYear: number | null;
}

export type MilestoneIconName =
  | 'trophy'
  | 'star'
  | 'flag'
  | 'rocket'
  | 'mountain'
  | 'crown'
  | 'gem'
  | 'medal'
  | 'target'
  | 'home'
  | 'palm'
  | 'car'
  | 'gift'
  | 'heart'
  | 'calendar';

export type MilestoneType = 'dividend' | 'date';

export interface Milestone {
  id: string;
  title: string;
  type: MilestoneType;
  icon: MilestoneIconName;
  /** Required when type === 'dividend' — target monthly dividends in € */
  dividendTarget?: number;
  /** Required when type === 'date' — ISO yyyy-mm-dd */
  dateTarget?: string;
}

export type MilestoneStatus = 'achieved' | 'open';

export interface MilestoneResult extends Milestone {
  status: MilestoneStatus;
  /** 0–100 for dividend milestones; 0 or 100 for date milestones */
  progressPercent: number;
  /** €/month still missing (only for dividend milestones; 0 if achieved) */
  missingMonthly: number;
  /** Whole days remaining (only for date milestones; negative if past) */
  daysRemaining: number | null;
  /** Calendar year the milestone is (or was) reached; null if beyond lookahead */
  achievedYear: number | null;
}

export interface AppState {
  portfolio: Portfolio;
  goals: Goal[];
  milestones: Milestone[];
}
