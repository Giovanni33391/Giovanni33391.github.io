export interface Challenge {
  id: string;
  name: string;
  type: 'quantitative' | 'qualitative' | 'static';
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
  startTime?: string; // HH:mm format
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

export interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export type TrainingMode = 'strength' | 'hypertrophy' | 'calisthenics' | 'myoreps' | 'endurance';

export interface Exercise {
  id: string;
  name: string;
  currentMetric: number; // usually target weight
  initialMetric: number;
  unit: string;
  targetSets: number;
  targetReps: number;
  mode: TrainingMode;
  sets: ExerciseSet[];
  notes?: string;
  suggestion?: {
    options?: {
      weight: { value: number; label: string };
      reps: { value: number; label: string };
    };
    reason?: string;
  };
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  routineName: string;
  date: string;
  duration: number; // seconds
  totalVolume: number;
  exercises: Exercise[];
}

export interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
  lastCompletedDate: string | null;
  streak: number;
  createdAt: string;
  history?: WorkoutSession[];
  isRefreshingAI?: boolean;
  lastGlobalAssessment?: string;
}

export interface FinanceTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string; // ISO
}

export interface CleaningTask {
  id: string;
  name: string;
  frequencyDays: number;
  lastCleanedDate: string | null; // ISO
  createdAt: string;
}
