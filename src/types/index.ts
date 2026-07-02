export interface Challenge {
  id: string;
  name: string;
  initialMetric: number;
  currentMetric: number;
  unit: string;
  streak: number;
  startDate: string; // ISO string
  lastCompletedDate: string | null; // ISO string
  createdAt: string; // ISO string
}

export interface DailyProgress {
  date: string; // ISO string (YYYY-MM-DD)
  completed: boolean;
  metric: number;
}
