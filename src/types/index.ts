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
  iconCategory?: GoalCategory;
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

export type MilestoneIcon =
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
  icon: MilestoneIcon;
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
}

export interface AppState {
  portfolio: Portfolio;
  goals: Goal[];
  milestones: Milestone[];
}
