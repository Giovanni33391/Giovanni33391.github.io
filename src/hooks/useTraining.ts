import { useState, useEffect, useCallback } from 'react';
import { Routine, Exercise, ExerciseSet, WorkoutSession } from '@/types';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const ROUTINES_STORAGE_KEY = 'onepercent_routines';
const SESSIONS_STORAGE_KEY = 'onepercent_workout_sessions';

export function useTraining() {
  const [routines, setRoutines] = useState<Routine[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(ROUTINES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [sessions, setSessions] = useState<WorkoutSession[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(SESSIONS_STORAGE_KEY);
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
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  }, [routines, sessions]);

  // Cloud Sync Logic
  useEffect(() => {
    if (!user) return;

    const syncWithCloud = async () => {
      // Sync Routines
      const { data: cloudRoutines } = await supabase.from('routines').select('*').eq('user_id', user.id);
      if (cloudRoutines) {
        setRoutines(prev => {
          const localMap = new Map(prev.map(r => [r.id, r]));
          cloudRoutines.forEach(cr => {
            const cloudMapped: Routine = {
              id: cr.id,
              name: cr.name,
              exercises: cr.exercises,
              lastCompletedDate: cr.last_completed_date,
              streak: cr.streak,
              createdAt: cr.created_at
            };

            const local = localMap.get(cr.id);
            if (!local) {
              localMap.set(cr.id, cloudMapped);
            } else {
              // Simple conflict resolution: cloud with more recent completion wins
              const cloudTime = cr.last_completed_date ? new Date(cr.last_completed_date).getTime() : 0;
              const localTime = local.lastCompletedDate ? new Date(local.lastCompletedDate).getTime() : 0;
              if (cloudTime > localTime) {
                localMap.set(cr.id, cloudMapped);
              }
            }
          });
          return Array.from(localMap.values());
        });
      }

      // Sync Sessions
      const { data: cloudSessions } = await supabase.from('workout_sessions').select('*').eq('user_id', user.id).order('date', { ascending: false });
      if (cloudSessions) {
        setSessions(cloudSessions.map(cs => ({
          id: cs.id,
          routineId: cs.routine_id,
          routineName: cs.routine_name,
          date: cs.date,
          duration: cs.duration,
          totalVolume: cs.total_volume,
          exercises: cs.exercises
        })));
      }
    };
    syncWithCloud().catch(console.error);
  }, [user, supabase]);

  const addRoutine = useCallback(async (name: string, exercises: Omit<Exercise, 'id' | 'sets'>[]) => {
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

    if (user) {
      await supabase.from('routines').insert({
        id: newRoutine.id,
        user_id: user.id,
        name: newRoutine.name,
        exercises: newRoutine.exercises,
        streak: newRoutine.streak,
        created_at: newRoutine.createdAt
      });
    }
  }, [user, supabase]);

  const deleteRoutine = useCallback(async (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    if (user) {
      await supabase.from('routines').delete().eq('id', id);
    }
  }, [user, supabase]);

  const startWorkout = useCallback((routine: Routine) => {
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
  }, []);

  const finishWorkout = useCallback(async (duration: number) => {
    if (!activeRoutine) return;

    const now = new Date().toISOString();
    let totalVolume = 0;
    activeRoutine.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed) totalVolume += s.weight * s.reps;
      });
    });

    const newSession: WorkoutSession = {
      id: crypto.randomUUID(),
      routineId: activeRoutine.id,
      routineName: activeRoutine.name,
      date: now,
      duration,
      totalVolume,
      exercises: JSON.parse(JSON.stringify(activeRoutine.exercises))
    };

    setSessions(prev => [newSession, ...prev]);

    let finalRoutine: Routine | null = null;
    const updatedRoutines = routines.map(routine => {
      if (routine.id !== activeRoutine.id) return routine;

      const newStreak = routine.streak + 1;
      const updatedExercises = routine.exercises.map(ex => {
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

      finalRoutine = {
        ...routine,
        streak: newStreak,
        lastCompletedDate: now,
        exercises: updatedExercises
      };
      return finalRoutine;
    });

    setRoutines(updatedRoutines);
    setActiveRoutine(null);

    if (user && finalRoutine) {
      await supabase.from('routines').update({
        streak: (finalRoutine as Routine).streak,
        last_completed_date: (finalRoutine as Routine).lastCompletedDate,
        exercises: (finalRoutine as Routine).exercises
      }).eq('id', (finalRoutine as Routine).id);

      await supabase.from('workout_sessions').insert({
        id: newSession.id,
        user_id: user.id,
        routine_id: newSession.routineId,
        routine_name: newSession.routineName,
        date: newSession.date,
        duration: newSession.duration,
        total_volume: newSession.totalVolume,
        exercises: newSession.exercises
      });
    }
  }, [activeRoutine, routines, user, supabase]);

  return {
    routines,
    sessions,
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
