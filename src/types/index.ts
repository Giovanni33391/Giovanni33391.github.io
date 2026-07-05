export interface Challenge {
  id: string;
  name: string;
  type: 'quantitative' | 'qualitative';
  initialMetric: number;
  currentMetric: number;
  unit: string;
  streak: number;
  nextTask?: string; // AI generated next step for qualitative habits
  frequency: number[]; // Days of the week (0-6, where 0 is Sunday)
  startDate: string; // ISO string
  lastCompletedDate: string | null; // ISO string
  createdAt: string; // ISO string
}

export interface DailyProgress {
  date: string; // ISO string (YYYY-MM-DD)
  completed: boolean;
  metric: number;
}
