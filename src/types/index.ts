export type ChallengeType = 'quantitative' | 'qualitative';

export interface QualitativeTask {
  id: string;
  task: string;
}

export interface Challenge {
  id: string;
  type: ChallengeType;
  name: string;
  
  // Quantitative fields
  initialMetric: number;
  currentMetric: number;
  unit: string;
  
  // Qualitative fields
  goalDescription?: string;
  taskQueue?: QualitativeTask[];
  completedTasks?: string[];
  
  // Common fields
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
