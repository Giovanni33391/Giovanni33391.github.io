export interface Challenge {
  id: string;
  name: string;
  type: 'quantitative' | 'qualitative';
  initialMetric: number;
  currentMetric: number;
  targetMetric?: number; // Target for quantitative
  targetGoal?: string; // Target for qualitative
  estimatedDays?: string | number | null; // AI estimate
  unit: string;
  streak: number;
  nextTask?: string; // AI generated next step for qualitative habits
  initialContext?: string; // Initial state or base for qualitative habits
  frequency: number[]; // Days of the week (0-6, where 0 is Sunday)
  startDate: string; // ISO string
  lastCompletedDate: string | null; // ISO string
  createdAt: string; // ISO string
  isRefreshing?: boolean; // AI generation in progress
}

export interface DailyProgress {
  date: string; // ISO string (YYYY-MM-DD)
  completed: boolean;
  metric: number;
}

export interface Exercise {
  id: string;
  name: string;
  currentMetric: number;
  initialMetric: number;
  unit: string;
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
  lastCompletedDate: string | null;
  streak: number;
  createdAt: string;
}
