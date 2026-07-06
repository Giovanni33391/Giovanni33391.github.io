import { useState, useEffect, useCallback, useMemo } from 'react';
import { Challenge } from '@/types';
import { calculateCompoundedMetric } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const STORAGE_KEY = 'onepercent_challenges';
const LOGS_KEY = 'onepercent_logs';
const PENDING_SYNC_KEY = 'onepercent_pending_sync';

export interface ChallengeLog {
  id?: string;
  challenge_id: string;
  user_id?: string;
  metric_achieved: number;
  completed_at: string;
}

// Define a type for pending sync actions instead of using any
type PendingAction = 
  | { type: 'INSERT'; data: Challenge }
  | { type: 'UPDATE'; data: { id: string; streak: number; currentMetric: number; lastCompletedDate: string; nextTask?: string; initialContext?: string, estimatedDays?: string | number | null } }
  | { type: 'DELETE'; data: { id: string } };

// Helper to check if a date string is today
export const isToday = (dateString: string | null) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Helper to check if a date string was yesterday
export const isYesterday = (dateString: string | null) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

export function useOnePercent() {
  const [logs, setLogs] = useState<ChallengeLog[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(LOGS_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    // 1. Synchronously initialize from local storage to prevent hydration mismatch
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    try {
      const initialChallenges: Challenge[] = JSON.parse(stored);
      return initialChallenges.map(challenge => {
        if (!challenge.lastCompletedDate || isToday(challenge.lastCompletedDate) || isYesterday(challenge.lastCompletedDate)) {
          return challenge;
        }
        return {
          ...challenge,
          streak: 0,
          currentMetric: challenge.initialMetric,
        };
      });
    } catch (error) {
      console.error('Failed to parse challenges:', error);
      return [];
    }
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Need to memoize supabase client inside useOnePercent to avoid dependency issues
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    // 2. Check Auth Status asynchronously
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      return () => subscription.unsubscribe();
    };

    checkAuth();
    setTimeout(() => setIsLoaded(true), 0);
  }, [supabase.auth]);

  // Handle pending offline mutations
  const addPendingSync = useCallback((action: PendingAction) => {
    const pending: PendingAction[] = JSON.parse(localStorage.getItem(PENDING_SYNC_KEY) || '[]');
    pending.push(action);
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
  }, []);

  const processPendingSync = useCallback(async (currentUser: User) => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const pendingStr = localStorage.getItem(PENDING_SYNC_KEY);
      if (!pendingStr) return;
      
      const pendingActions: PendingAction[] = JSON.parse(pendingStr);
      if (pendingActions.length === 0) return;

      const remainingActions: PendingAction[] = [];

      for (const action of pendingActions) {
        if (action.type === 'INSERT') {
          const { error } = await supabase.from('challenges').upsert({
            id: action.data.id,
            user_id: currentUser.id,
            name: action.data.name,
            type: action.data.type,
            initial_metric: action.data.initialMetric,
            current_metric: action.data.currentMetric,
            unit: action.data.unit,
            streak: action.data.streak,
            last_completed_date: action.data.lastCompletedDate,
            next_task: action.data.nextTask,
            initial_context: action.data.initialContext,
            target_metric: action.data.targetMetric,
            target_goal: action.data.targetGoal,
            estimated_days: action.data.estimatedDays?.toString(),
            frequency: action.data.frequency,
          });
          if (error) remainingActions.push(action);
        } else if (action.type === 'UPDATE') {
           const { error } = await supabase.from('challenges').update({
             streak: action.data.streak,
             current_metric: action.data.currentMetric,
             last_completed_date: action.data.lastCompletedDate,
             next_task: action.data.nextTask,
             estimated_days: action.data.estimatedDays?.toString(),
           }).eq('id', action.data.id);

           if (!error) {
              await supabase.from('challenge_logs').insert({
                challenge_id: action.data.id,
                user_id: currentUser.id,
                metric_achieved: action.data.currentMetric,
                completed_at: action.data.lastCompletedDate
              });
           } else {
             remainingActions.push(action);
           }
        } else if (action.type === 'DELETE') {
           const { error } = await supabase.from('challenges').delete().eq('id', action.data.id);
           if (error) remainingActions.push(action);
        }
      }

      localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(remainingActions));
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, supabase]);

  // 3. Sync from Cloud if Authenticated
  useEffect(() => {
    if (!user || !isLoaded) return;

    const syncWithCloud = async () => {
      await processPendingSync(user);

      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', user.id);

      if (error) return;

      const { data: logsData } = await supabase
        .from('challenge_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (logsData) {
        setLogs(logsData);
      }

      if (data) {
        setChallenges(prevLocal => {
          const localMap = new Map(prevLocal.map(c => [c.id, c]));
          const mergedChallenges = [...prevLocal];

          for (const dbChallenge of data) {
            const cloudDate = dbChallenge.last_completed_date ? new Date(dbChallenge.last_completed_date).getTime() : 0;
            const localChallenge = localMap.get(dbChallenge.id);
            const localDate = localChallenge?.lastCompletedDate ? new Date(localChallenge.lastCompletedDate).getTime() : 0;

            const cloudMapped: Challenge = {
              id: dbChallenge.id,
              name: dbChallenge.name,
              type: dbChallenge.type || 'quantitative',
              initialMetric: dbChallenge.initial_metric,
              currentMetric: dbChallenge.current_metric,
              targetMetric: dbChallenge.target_metric,
              targetGoal: dbChallenge.target_goal,
              estimatedDays: dbChallenge.estimated_days,
              unit: dbChallenge.unit,
              streak: dbChallenge.streak,
              nextTask: dbChallenge.next_task,
              initialContext: dbChallenge.initial_context,
              frequency: dbChallenge.frequency || [0, 1, 2, 3, 4, 5, 6],
              startDate: dbChallenge.created_at,
              lastCompletedDate: dbChallenge.last_completed_date,
              createdAt: dbChallenge.created_at,
            };

            if (!localChallenge) {
              mergedChallenges.push(cloudMapped);
            } else if (cloudDate > localDate) {
              const index = mergedChallenges.findIndex(c => c.id === dbChallenge.id);
              if (index !== -1) mergedChallenges[index] = cloudMapped;
            }
          }
          return mergedChallenges;
        });
      }
    };

    syncWithCloud();

    const handleOnline = () => syncWithCloud();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);

  }, [user, isLoaded, supabase, processPendingSync]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    }
  }, [challenges, logs, isLoaded]);

  // AI Task Generation Helper
  const fetchNextAITask = async (
    challengeName: string,
    streak: number,
    unit: string,
    lastTask?: string,
    initialContext?: string,
    targetGoal?: string,
    targetMetric?: number,
    currentMetric?: number,
    type: 'quantitative' | 'qualitative' = 'qualitative'
  ) => {
    try {
      const response = await fetch('/api/ai/generate-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeName,
          streak,
          unit,
          lastTask,
          initialContext,
          targetGoal,
          targetMetric,
          currentMetric,
          type
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API responded with status ${response.status}`);
      }

      const data = await response.json();
      return { nextTask: data.nextTask, estimatedDays: data.estimatedDays };
    } catch (err) {
      console.error('Failed to fetch AI task:', err);
      return null;
    }
  };

  // Auth Methods
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const getBetterFallback = (name: string, streak: number) => {
    const fallbacks = [
      `Hoy enfócate en la técnica perfecta para ${name}, más que en la cantidad.`,
      `Intenta realizar ${name} en un entorno diferente para refrescar tu mente.`,
      `Dedica 2 minutos extra hoy a reflexionar sobre tu progreso con ${name}.`,
      `Busca un micro-detalle en ${name} que puedas optimizar hoy.`,
      `Prueba a hacer ${name} en un horario ligeramente distinto al de ayer.`,
      `Divide tu práctica de ${name} en dos sesiones más cortas hoy.`,
      `Visualiza el éxito con ${name} durante 30 segundos antes de empezar.`,
      `Elimina una distracción de tu entorno antes de comenzar with ${name}.`,
      `Haz ${name} inmediatamente después de una tarea que ya sea un hábito.`,
      `Celebra tu racha de ${streak} días con un pequeño gesto positivo.`,
      `Escribe una frase sobre por qué ${name} es importante para ti hoy.`,
      `Realiza ${name} con una sonrisa, aunque te cueste un poco más.`,
      `Simplifica al máximo ${name} hoy; lo importante es no romper la racha.`,
      `Observa cómo te sientes físicamente después de completar ${name}.`,
      `Busca un compañero o amigo y cuéntale tu progreso con ${name}.`
    ];
    // Use a pseudo-random selection based on name and streak for consistency but variety
    const index = (name.length + streak) % fallbacks.length;
    return fallbacks[index];
  };

  // Actions
  const addChallenge = useCallback(async (
    name: string,
    initialMetric: number,
    unit: string,
    type: 'quantitative' | 'qualitative' = 'quantitative',
    frequency: number[] = [0, 1, 2, 3, 4, 5, 6],
    initialContext?: string,
    targetMetric?: number,
    targetGoal?: string
  ) => {
    // Generate an instant initial task
    const initialTask = type === 'qualitative'
      ? getBetterFallback(name, 0)
      : `Realiza ${initialMetric} ${unit} con técnica perfecta hoy.`;

    const newChallenge: Challenge = {
      id: crypto.randomUUID(),
      name,
      type,
      initialMetric,
      currentMetric: initialMetric,
      targetMetric,
      targetGoal,
      estimatedDays: undefined,
      unit,
      streak: 0,
      nextTask: initialTask,
      initialContext,
      frequency,
      startDate: new Date().toISOString(),
      lastCompletedDate: null,
      createdAt: new Date().toISOString(),
    };
    
    // Optimistic Update
    setChallenges(prev => [...prev, newChallenge]);

    // Handle initial insert to Supabase
    if (user) {
      const { data, error } = await supabase.from('challenges').insert({
        id: newChallenge.id,
        user_id: user.id,
        name: newChallenge.name,
        type: newChallenge.type,
        initial_metric: newChallenge.initialMetric,
        current_metric: newChallenge.currentMetric,
        unit: newChallenge.unit,
        streak: newChallenge.streak,
        last_completed_date: newChallenge.lastCompletedDate,
        next_task: newChallenge.nextTask,
        initial_context: newChallenge.initialContext,
        target_metric: newChallenge.targetMetric,
        target_goal: newChallenge.targetGoal,
        frequency: newChallenge.frequency,
      }).select().single();

      if (error) {
        addPendingSync({ type: 'INSERT', data: newChallenge });
      } else if (data) {
        setChallenges(prev => prev.map(c => c.id === newChallenge.id ? { ...c, createdAt: data.created_at } : c));
      }
    }

    // Background AI generation
    const generateAI = async () => {
      let nextTask = undefined;
      let estimatedDays = undefined;

      try {
        if (user && (type === 'qualitative' || (type === 'quantitative' && targetMetric))) {
          const aiData = await fetchNextAITask(
            name, 0, unit, undefined, initialContext, targetGoal, targetMetric, initialMetric, type
          );
          nextTask = aiData?.nextTask;
          estimatedDays = aiData?.estimatedDays;
        }
      } catch (err) {
        console.error('Error generating AI task:', err);
      }

      // Fallback for qualitative or if AI fails to return a task
      if (!nextTask && type === 'qualitative') {
        nextTask = getBetterFallback(name, 0);
      }

      // If we still have no task but it's quantitative, provide a generic fallback
      if (!nextTask && type === 'quantitative') {
        nextTask = `Mejora un 1% tu técnica en ${name} hoy.`;
      }

      if (nextTask || estimatedDays) {
        setChallenges(prev => prev.map(c =>
          c.id === newChallenge.id ? { ...c, nextTask, estimatedDays } : c
        ));

        if (user) {
          await supabase.from('challenges').update({
            next_task: nextTask,
            estimated_days: estimatedDays?.toString()
          }).eq('id', newChallenge.id);
        }
      }
    };

    generateAI();
  }, [user, supabase, addPendingSync]);

  const refreshChallengeTask = useCallback(async (id: string) => {
    if (!user) return;

    const challenge = challenges.find(c => c.id === id);
    if (!challenge) return;

    const aiData = await fetchNextAITask(
      challenge.name,
      challenge.streak,
      challenge.unit,
      challenge.nextTask,
      challenge.initialContext,
      challenge.targetGoal,
      challenge.targetMetric,
      challenge.currentMetric,
      challenge.type
    );

    if (aiData) {
      setChallenges(prev => prev.map(c =>
        c.id === id ? { ...c, nextTask: aiData.nextTask, estimatedDays: aiData.estimatedDays } : c
      ));

      await supabase.from('challenges').update({
        next_task: aiData.nextTask,
        estimated_days: aiData.estimatedDays?.toString()
      }).eq('id', id);
    }
  }, [challenges, user, supabase]);

  const completeChallenge = useCallback(async (id: string) => {
    const challengeToUpdate = challenges.find(c => c.id === id);
    if (!challengeToUpdate || isToday(challengeToUpdate.lastCompletedDate)) return;

    const newStreak = isYesterday(challengeToUpdate.lastCompletedDate) ? challengeToUpdate.streak + 1 : 1;
    const nextMetric = calculateCompoundedMetric(challengeToUpdate.initialMetric, newStreak);
    const now = new Date().toISOString();

    // Generate an instant next task for quantitative habits
    const instantNextTask = challengeToUpdate.type === 'quantitative'
      ? `Mañana incrementa a ${nextMetric} ${challengeToUpdate.unit} (objetivo +1%).`
      : undefined;

    // Optimistic progress update
    setChallenges(prev => 
      prev.map(challenge => {
        if (challenge.id !== id) return challenge;
        return {
          ...challenge,
          streak: newStreak,
          currentMetric: nextMetric,
          lastCompletedDate: now,
          nextTask: instantNextTask || challenge.nextTask,
        };
      })
    );

    const newLog: ChallengeLog = {
      challenge_id: id,
      user_id: user?.id,
      metric_achieved: nextMetric,
      completed_at: now
    };

    setLogs(prev => [newLog, ...prev]);

    if (user) {
      const { error: updateError } = await supabase
        .from('challenges')
        .update({
          streak: newStreak,
          current_metric: nextMetric,
          last_completed_date: now,
          next_task: instantNextTask || challengeToUpdate.nextTask,
        })
        .eq('id', id);
        
      if (!updateError) {
        await supabase.from('challenge_logs').insert(newLog);
      } else {
        addPendingSync({
          type: 'UPDATE',
          data: {
            id,
            streak: newStreak,
            currentMetric: nextMetric,
            lastCompletedDate: now
          }
        });
      }
    }

    // Background AI generation for the NEXT step
    const generateNextTask = async () => {
      try {
        if (user && (challengeToUpdate.type === 'qualitative' || (challengeToUpdate.type === 'quantitative' && challengeToUpdate.targetMetric))) {
          const aiData = await fetchNextAITask(
            challengeToUpdate.name,
            newStreak,
            challengeToUpdate.unit,
            challengeToUpdate.nextTask,
            challengeToUpdate.initialContext,
            challengeToUpdate.targetGoal,
            challengeToUpdate.targetMetric,
            nextMetric,
            challengeToUpdate.type
          );

          let nextTask = aiData?.nextTask;
          const estimatedDays = aiData?.estimatedDays;

          if (!nextTask && challengeToUpdate.type === 'qualitative') {
            nextTask = getBetterFallback(challengeToUpdate.name, newStreak);
          }

          if (!nextTask && challengeToUpdate.type === 'quantitative') {
            nextTask = `Sigue así! Has mejorado un 1% más en ${challengeToUpdate.name}.`;
          }

          if (nextTask || estimatedDays) {
            setChallenges(prev =>
              prev.map(challenge => {
                if (challenge.id !== id) return challenge;
                return {
                  ...challenge,
                  nextTask: nextTask || challenge.nextTask,
                  estimatedDays: estimatedDays || challenge.estimatedDays
                };
              })
            );

            if (user) {
              await supabase
                .from('challenges')
                .update({
                  next_task: nextTask,
                  estimated_days: estimatedDays?.toString()
                })
                .eq('id', id);
            }
          }
        }
      } catch (error) {
        console.error('Error in generateNextTask:', error);
      }
    };

    generateNextTask();
  }, [challenges, user, supabase, addPendingSync]);

  const deleteChallenge = useCallback(async (id: string) => {
    setChallenges(prev => prev.filter(c => c.id !== id));

    if (user) {
      const { error } = await supabase.from('challenges').delete().eq('id', id);
      if (error) {
        addPendingSync({ type: 'DELETE', data: { id } });
      }
    }
  }, [user, supabase, addPendingSync]);

  const stats = useMemo(() => {
    if (challenges.length === 0) return null;

    const totalCompoundedGrowth = challenges.reduce((acc, c) => {
      const growth = ((c.currentMetric - c.initialMetric) / c.initialMetric) * 100;
      return acc + (isNaN(growth) ? 0 : growth);
    }, 0);

    const bestStreak = Math.max(...challenges.map(c => c.streak), 0);

    // Weekly activity (last 7 days)
    const now = new Date();
    const weeklyActivity = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = logs.filter(l => l.completed_at.startsWith(dateStr)).length;
      return { date: dateStr, count };
    }).reverse();

    const totalCompletions = logs.length;
    const masteryLevel = Math.floor(Math.sqrt(totalCompletions * 10));

    return {
      totalCompoundedGrowth,
      bestStreak,
      weeklyActivity,
      totalCompletions,
      masteryLevel
    };
  }, [challenges, logs]);

  return {
    challenges,
    logs,
    stats,
    isLoaded,
    user,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    addChallenge,
    completeChallenge,
    deleteChallenge,
    refreshChallengeTask,
    isToday
  };
}
