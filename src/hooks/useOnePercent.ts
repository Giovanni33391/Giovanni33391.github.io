import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

type PendingAction = 
  | { type: 'INSERT'; data: Challenge }
  | { type: 'UPDATE'; data: { id: string; streak: number; currentMetric: number; lastCompletedDate: string; nextTask?: string; initialContext?: string, estimatedDays?: string | number | null } }
  | { type: 'DELETE'; data: { id: string } };

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

  // Use a ref to keep track of challenges for UI display and internal sync logic
  const challengesRef = useRef(challenges);
  useEffect(() => {
    challengesRef.current = challenges;
  }, [challenges]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
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
    setTimeout(() => setIsLoaded(true), 0);
  }, [supabase.auth]);

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

  useEffect(() => {
    if (!user || !isLoaded) return;
    const syncWithCloud = async () => {
      await processPendingSync(user);
      const { data, error } = await supabase.from('challenges').select('*').eq('user_id', user.id);
      if (error) return;
      const { data: logsData } = await supabase.from('challenge_logs').select('*').eq('user_id', user.id).order('completed_at', { ascending: false });
      if (logsData) setLogs(logsData);
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

  const fetchNextAITask = async (challenge: Challenge) => {
    try {
      const response = await fetch('/api/ai/generate-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeName: challenge.name,
          streak: challenge.streak,
          unit: challenge.unit,
          lastTask: challenge.nextTask,
          initialContext: challenge.initialContext,
          targetGoal: challenge.targetGoal,
          currentMetric: challenge.currentMetric,
          targetMetric: challenge.targetMetric,
          type: challenge.type
        }),
      });
      const data = await response.json();
      return { nextTask: data.nextTask, estimatedDays: data.estimatedDays };
    } catch (err) {
      console.error('Failed to fetch AI task:', err);
      return null;
    }
  };

  const updateChallengeWithAI = useCallback(async (challenge: Challenge) => {
    const { id } = challenge;

    setChallenges(prev => prev.map(c => c.id === id ? { ...c, isRefreshing: true } : c));

    const aiData = await fetchNextAITask(challenge);

    if (aiData) {
      setChallenges(prev => prev.map(c => {
        if (c.id !== id) return c;
        return {
          ...c,
          nextTask: aiData.nextTask,
          estimatedDays: aiData.estimatedDays,
          isRefreshing: false
        };
      }));

      if (user) {
        await supabase.from('challenges').update({
          next_task: aiData.nextTask,
          estimated_days: aiData.estimatedDays?.toString()
        }).eq('id', id);
      }
    } else {
      setChallenges(prev => prev.map(c => c.id === id ? { ...c, isRefreshing: false } : c));
    }
  }, [user, supabase]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
  };

  const signInWithEmail = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const getHeuristicFallback = (name: string, streak: number, unit?: string, currentMetric?: number) => {
    if (currentMetric !== undefined && unit) {
      const nextValue = currentMetric > 0 ? (currentMetric * 1.01).toFixed(1) : "1";
      return `Mañana intenta alcanzar ${nextValue} ${unit}. ¡El progreso constante es la clave!`;
    }
    const fallbacks = [
      `Hoy enfócate en la técnica perfecta para ${name}, más que en la cantidad.`,
      `Intenta realizar ${name} en un entorno diferente para refrescar tu mente.`,
      `Dedica 2 minutos extra hoy a reflexionar sobre tu progreso con ${name}.`,
      `Busca un micro-detalle en ${name} que puedas optimizar hoy.`,
      `Prueba a hacer ${name} en un horario ligeramente distinto al de ayer.`
    ];
    return fallbacks[streak % fallbacks.length];
  };

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
    const newChallenge: Challenge = {
      id: crypto.randomUUID(),
      name,
      type,
      initialMetric,
      currentMetric: initialMetric,
      targetMetric,
      targetGoal,
      unit,
      streak: 0,
      nextTask: getHeuristicFallback(name, 0, unit, initialMetric),
      initialContext,
      frequency,
      startDate: new Date().toISOString(),
      lastCompletedDate: null,
      createdAt: new Date().toISOString(),
      isRefreshing: true
    };
    
    setChallenges(prev => [...prev, newChallenge]);
    updateChallengeWithAI(newChallenge);

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
  }, [user, supabase, addPendingSync, updateChallengeWithAI]);

  const completeChallenge = useCallback(async (id: string) => {
    const challengeToUpdate = challengesRef.current.find(c => c.id === id);
    if (!challengeToUpdate || isToday(challengeToUpdate.lastCompletedDate)) return;

    const newStreak = isYesterday(challengeToUpdate.lastCompletedDate) ? challengeToUpdate.streak + 1 : 1;
    const nextMetric = calculateCompoundedMetric(challengeToUpdate.initialMetric, newStreak);
    const now = new Date().toISOString();
    const heuristicTask = getHeuristicFallback(challengeToUpdate.name, newStreak, challengeToUpdate.unit, nextMetric);

    const updatedChallenge: Challenge = {
      ...challengeToUpdate,
      streak: newStreak,
      currentMetric: nextMetric,
      lastCompletedDate: now,
      nextTask: heuristicTask,
      isRefreshing: true
    };

    setChallenges(prev => 
      prev.map(challenge => challenge.id === id ? updatedChallenge : challenge)
    );

    const newLog: ChallengeLog = {
      challenge_id: id,
      user_id: user?.id,
      metric_achieved: nextMetric,
      completed_at: now
    };
    setLogs(prev => [newLog, ...prev]);

    updateChallengeWithAI(updatedChallenge);

    if (user) {
      const { error: updateError } = await supabase
        .from('challenges')
        .update({
          streak: newStreak,
          current_metric: nextMetric,
          last_completed_date: now,
          next_task: heuristicTask
        })
        .eq('id', id);
        
      if (updateError) {
        addPendingSync({ type: 'UPDATE', data: {
          id,
          streak: newStreak,
          currentMetric: nextMetric,
          lastCompletedDate: now,
          nextTask: heuristicTask
        }});
      } else {
        await supabase.from('challenge_logs').insert(newLog);
      }
    }
  }, [user, supabase, addPendingSync, updateChallengeWithAI]);

  const refreshChallengeTask = useCallback((id: string) => {
    const challenge = challengesRef.current.find(c => c.id === id);
    if (challenge) {
      updateChallengeWithAI(challenge);
    }
  }, [updateChallengeWithAI]);

  const deleteChallenge = useCallback(async (id: string) => {
    setChallenges(prev => prev.filter(c => c.id !== id));
    if (user) {
      const { error } = await supabase.from('challenges').delete().eq('id', id);
      if (error) addPendingSync({ type: 'DELETE', data: { id } });
    }
  }, [user, supabase, addPendingSync]);

  const stats = useMemo(() => {
    if (challenges.length === 0) {
      return {
        totalCompoundedGrowth: 0,
        bestStreak: 0,
        weeklyActivity: Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return { date: d.toISOString().split('T')[0], count: 0 };
        }),
        totalCompletions: 0,
        masteryLevel: 0
      };
    }
    const totalCompoundedGrowth = challenges.reduce((acc, c) => {
      const growth = ((c.currentMetric - c.initialMetric) / c.initialMetric) * 100;
      return acc + (isNaN(growth) ? 0 : growth);
    }, 0);
    const bestStreak = Math.max(...challenges.map(c => c.streak), 0);
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
    return { totalCompoundedGrowth, bestStreak, weeklyActivity, totalCompletions, masteryLevel };
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
