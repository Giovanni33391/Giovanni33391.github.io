import { useState, useEffect, useCallback } from 'react';
import { Routine, Exercise, ExerciseSet, WorkoutSession, TrainingMode } from '@/types';
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
            if (!local || (cr.last_completed_date && new Date(cr.last_completed_date).getTime() > (local.lastCompletedDate ? new Date(local.lastCompletedDate).getTime() : 0))) {
              localMap.set(cr.id, cloudMapped);
            }
          });
          return Array.from(localMap.values());
        });
      }

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
    if (user) await supabase.from('routines').delete().eq('id', id);
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

          const setIndex = ex.sets.findIndex(s => s.id === setId);
          let newSets = ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s);

          // Auto-fill logic for the first set
          if (setIndex === 0 && (updates.weight !== undefined || updates.reps !== undefined)) {
            newSets = newSets.map((s, idx) => {
              if (idx > 0 && !s.completed) {
                return {
                  ...s,
                  weight: updates.weight !== undefined ? updates.weight : s.weight,
                  reps: updates.reps !== undefined ? updates.reps : s.reps
                };
              }
              return s;
            });
          }

          return { ...ex, sets: newSets };
        })
      };
    });
  }, []);

  const fetchTrainingSuggestions = async (routine: Routine, history: WorkoutSession[]) => {
    const updatedExercises = [...routine.exercises];
    for (let i = 0; i < updatedExercises.length; i++) {
      const ex = updatedExercises[i];
      const exerciseHistory = history
        .filter(s => s.routineId === routine.id)
        .map(s => s.exercises.find(e => e.name === ex.name))
        .filter(Boolean);

      try {
        const res = await fetch('/api/ai/training-suggestion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exercise: ex, sessionHistory: exerciseHistory, mode: ex.mode })
        });
        if (res.ok) {
          const data = await res.json();
          updatedExercises[i] = { ...ex, suggestion: data };
        }
      } catch (err) {
        console.error('Failed to fetch suggestion for', ex.name, err);
      }
    }
    return updatedExercises;
  };

  const finishWorkout = useCallback(async (duration: number, selectedSuggestions: Record<string, 'weight' | 'reps' | null>) => {
    if (!activeRoutine) return;
    const now = new Date().toISOString();
    let totalVolume = 0;
    activeRoutine.exercises.forEach(ex => {
      ex.sets.forEach(s => { if (s.completed) totalVolume += s.weight * s.reps; });
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

    const updatedRoutines = routines.map(r => {
      if (r.id !== activeRoutine.id) return r;

      const nextExercises = r.exercises.map(ex => {
        const choice = selectedSuggestions[ex.id];
        if (!choice || !ex.suggestion?.options) return ex;

        const nextVal = ex.suggestion.options[choice].value;
        const nextMetric = choice === 'weight' ? nextVal : ex.currentMetric;
        const nextReps = choice === 'reps' ? nextVal : ex.targetReps;

        return {
          ...ex,
          currentMetric: nextMetric,
          targetReps: nextReps,
          suggestion: undefined,
          sets: ex.sets.map(s => ({
            ...s,
            weight: nextMetric,
            reps: nextReps,
            completed: false
          }))
        };
      });

      const updated = {
        ...r,
        streak: r.streak + 1,
        lastCompletedDate: now,
        exercises: nextExercises,
        isRefreshingAI: true
      };

      // Fetch fresh suggestions for the NEXT session in background
      fetchTrainingSuggestions(updated, [newSession, ...sessions]).then(suggestedExs => {
        setRoutines(prev => prev.map(pr => pr.id === updated.id ? { ...pr, exercises: suggestedExs, isRefreshingAI: false } : pr));
        if (user) {
          supabase.from('routines').update({ exercises: suggestedExs }).eq('id', updated.id).then();
        }
      });

      return updated;
    });

    setRoutines(updatedRoutines);
    setActiveRoutine(null);

    if (user) {
      const routine = updatedRoutines.find(r => r.id === activeRoutine.id);
      if (routine) {
        await supabase.from('routines').update({
          streak: routine.streak,
          last_completed_date: routine.lastCompletedDate,
          exercises: routine.exercises
        }).eq('id', routine.id);
      }

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
  }, [activeRoutine, routines, sessions, user, supabase]);

  const applySuggestion = useCallback(async (routineId: string, exerciseId: string, choice: 'weight' | 'reps') => {
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      const updatedExercises = r.exercises.map(ex => {
        if (ex.id !== exerciseId || !ex.suggestion?.options) return ex;
        const nextVal = ex.suggestion.options[choice].value;
        const nextMetric = choice === 'weight' ? nextVal : ex.currentMetric;
        const nextReps = choice === 'reps' ? nextVal : ex.targetReps;

        return {
          ...ex,
          currentMetric: nextMetric,
          targetReps: nextReps,
          suggestion: undefined,
          sets: ex.sets.map(s => ({
            ...s,
            weight: nextMetric,
            reps: nextReps,
            completed: false
          }))
        };
      });

      const updated = { ...r, exercises: updatedExercises };
      if (user) {
        supabase.from('routines').update({ exercises: updatedExercises }).eq('id', r.id).then();
      }
      return updated;
    }));
  }, [user, supabase]);

  const ignoreSuggestion = useCallback(async (routineId: string, exerciseId: string) => {
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      const updatedExercises = r.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, suggestion: undefined } : ex
      );
      const updated = { ...r, exercises: updatedExercises };
      if (user) {
        supabase.from('routines').update({ exercises: updatedExercises }).eq('id', r.id).then();
      }
      return updated;
    }));
  }, [user, supabase]);

  return {
    routines,
    sessions,
    activeRoutine,
    addRoutine,
    deleteRoutine,
    startWorkout,
    updateSet,
    finishWorkout,
    applySuggestion,
    ignoreSuggestion,
    cancelWorkout: () => setActiveRoutine(null),
    user
  };
}
