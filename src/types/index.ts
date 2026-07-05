export interface Challenge {
  id: string;
  name: string;
  type: 'quantitative' | 'qualitative';
  initialMetric: number;
  currentMetric: number;
  targetMetric?: number;
  unit: string;
  streak: number;
  nextTask?: string; // AI generated next step for qualitative habits
  initialContext?: string; // Starting point for qualitative habits
  estimatedDays?: number; // AI estimated days to reach goal
  frequency?: number[]; // [0,1,2,3,4,5,6] where 0 is Sunday
  startDate: string; // ISO string
  lastCompletedDate: string | null; // ISO string
  createdAt: string; // ISO string
}

export interface DailyProgress {
  date: string; // ISO string (YYYY-MM-DD)
  completed: boolean;
  metric: number;
}
