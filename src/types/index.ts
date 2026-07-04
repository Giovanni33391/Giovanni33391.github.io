export interface Challenge {
  id: string;
  name: string;
  type: 'quantitative' | 'qualitative';
  initialMetric: number;
  currentMetric: number;
  unit: string;
  streak: number;
  nextTask?: string; // AI generated next step for qualitative habits
  startDate: string; // ISO string
  lastCompletedDate: string | null; // ISO string
  createdAt: string; // ISO string
}

export interface DailyProgress {
  date: string; // ISO string (YYYY-MM-DD)
  completed: boolean;
  metric: number;
}
