import { useState, useEffect, useCallback } from 'react';
import { Routine, Exercise, ExerciseSet } from '@/types';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const ROUTINES_STORAGE_KEY = 'onepercent_routines';

export function useTraining() {
  const [routines, setRoutines] = useState<Routine[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(ROUTINES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      return () => subscription.unsubscribe();
    };
    checkAuth();
  }, [supabase.auth]);

  useEffect(() => {
    localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(routines));
  }, [routines]);

  const addRoutine = useCallback((name: string, exercises: Omit<Exercise, 'id' | 'sets'>[]) => {
    const newRoutine: Routine = {
      id: crypto.randomUUID(),
      name,
      exercises: exercises.map(ex => ({
        ...ex,
        id: crypto.randomUUID(),
        sets: Array.from({ length: ex.targetSets }).map(() => ({
          id: crypto.randomUUID(),
          reps: ex.targetReps,
          weight: ex.currentMetric,
          completed: false
        }))
      })),
      lastCompletedDate: null,
      streak: 0,
      createdAt: new Date().toISOString(),
    };
    setRoutines(prev => [...prev, newRoutine]);
  }, []);

  const deleteRoutine = useCallback((id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  }, []);

  const startWorkout = useCallback((routine: Routine) => {
    // Reset completed status for the workout session
    const workoutSession = {
      ...routine,
      exercises: routine.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({ ...s, completed: false }))
      }))
    };
    setActiveRoutine(workoutSession);
  }, []);

  const updateSet = useCallback((exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => {
    if (!activeRoutine) return;
    setActiveRoutine(prev => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          return {
            ...ex,
            sets: ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
          };
        })
      };
    });
  }, [activeRoutine]);

  const finishWorkout = useCallback(() => {
    if (!activeRoutine) return;

    setRoutines(prev => prev.map(routine => {
      if (routine.id !== activeRoutine.id) return routine;

      const newStreak = routine.streak + 1;
      const updatedExercises = routine.exercises.map(ex => {
        // Calculate new target weight based on 1% increase
        return {
          ...ex,
          currentMetric: Number((ex.currentMetric * 1.01).toFixed(2)),
          sets: ex.sets.map(s => ({
            ...s,
            weight: Number((s.weight * 1.01).toFixed(2)),
            completed: false
          }))
        };
      });

      return {
        ...routine,
        streak: newStreak,
        lastCompletedDate: new Date().toISOString(),
        exercises: updatedExercises
      };
    }));

    setActiveRoutine(null);
  }, [activeRoutine]);

  return {
    routines,
    activeRoutine,
    addRoutine,
    deleteRoutine,
    startWorkout,
    updateSet,
    finishWorkout,
    cancelWorkout: () => setActiveRoutine(null),
    user
  };
}
