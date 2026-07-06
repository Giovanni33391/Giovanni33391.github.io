import { useState, useEffect, useCallback } from 'react';
import { Routine, Exercise } from '@/types';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const ROUTINES_STORAGE_KEY = 'onepercent_routines';

export function useTraining() {
  const [routines, setRoutines] = useState<Routine[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(ROUTINES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

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

  const addRoutine = useCallback((name: string, exercises: Omit<Exercise, 'id'>[]) => {
    const newRoutine: Routine = {
      id: crypto.randomUUID(),
      name,
      exercises: exercises.map(ex => ({ ...ex, id: crypto.randomUUID() })),
      lastCompletedDate: null,
      streak: 0,
      createdAt: new Date().toISOString(),
    };
    setRoutines(prev => [...prev, newRoutine]);
  }, []);

  const deleteRoutine = useCallback((id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
  }, []);

  const completeRoutine = useCallback((id: string) => {
    setRoutines(prev => prev.map(routine => {
      if (routine.id !== id) return routine;

      const newStreak = routine.streak + 1;
      const updatedExercises = routine.exercises.map(ex => ({
        ...ex,
        currentMetric: Number((ex.currentMetric * 1.01).toFixed(2))
      }));

      return {
        ...routine,
        streak: newStreak,
        lastCompletedDate: new Date().toISOString(),
        exercises: updatedExercises
      };
    }));
  }, []);

  return {
    routines,
    addRoutine,
    deleteRoutine,
    completeRoutine,
    user
  };
}
