import { useState, useEffect, useCallback } from 'react';
import { Challenge } from '@/types';
import { calculateCompoundedMetric } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const STORAGE_KEY = 'onepercent_challenges';
const PENDING_SYNC_KEY = 'onepercent_pending_sync';

// Define a type for pending sync actions instead of using any
type PendingAction = 
  | { type: 'INSERT'; data: Challenge }
  | { type: 'UPDATE'; data: { id: string; streak: number; currentMetric: number; nextTask?: string; lastCompletedDate: string } }
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
  // But createClient() returns a new instance each time if we aren't careful, so we use memo
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
            next_task: action.data.nextTask,
            last_completed_date: action.data.lastCompletedDate,
          });
          if (error) remainingActions.push(action);
        } else if (action.type === 'UPDATE') {
           const { error } = await supabase.from('challenges').update({
             streak: action.data.streak,
             current_metric: action.data.currentMetric,
             next_task: action.data.nextTask,
             last_completed_date: action.data.lastCompletedDate
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

  // 3. Sync from Cloud if Authenticated (Merge Strategy)
  useEffect(() => {
    if (!user || !isLoaded) return;

    const syncWithCloud = async () => {
      // First, try to push any pending offline updates up to the cloud
      await processPendingSync(user);

      // Then fetch the latest from the cloud
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching from Supabase:', error);
        return;
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
              unit: dbChallenge.unit,
              streak: dbChallenge.streak,
              nextTask: dbChallenge.next_task,
              startDate: dbChallenge.created_at,
              lastCompletedDate: dbChallenge.last_completed_date,
              createdAt: dbChallenge.created_at,
            };

            if (!localChallenge) {
              // It's in the cloud but not local (e.g. fresh login)
              mergedChallenges.push(cloudMapped);
            } else if (cloudDate > localDate) {
              // Cloud is strictly newer, overwrite local
              const index = mergedChallenges.findIndex(c => c.id === dbChallenge.id);
              if (index !== -1) mergedChallenges[index] = cloudMapped;
            }
            // If localDate >= cloudDate, we keep local. The processPendingSync will eventually push it.
          }
          return mergedChallenges;
        });
      }
    };

    syncWithCloud();

    // Set up network listener to retry sync when online
    const handleOnline = () => {
      syncWithCloud();
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);

  }, [user, isLoaded, supabase, processPendingSync]);

  // 4. Save to LocalStorage Whenever State Changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
    }
  }, [challenges, isLoaded]);

  // Auth Methods
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
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

  // Actions
  const generateAITask = async (habitName: string, streak: number) => {
    try {
      const res = await fetch('/api/ai/generate-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitName, streak, type: 'qualitative' }),
      });
      const data = await res.json();
      return data.task as string;
    } catch (error) {
      console.error('Failed to generate AI task:', error);
      return 'Realiza una pequeña mejora hoy.';
    }
  };

  const addChallenge = useCallback(async (name: string, initialMetric: number, unit: string, type: 'quantitative' | 'qualitative' = 'quantitative') => {
    let nextTask: string | undefined;
    if (type === 'qualitative') {
      nextTask = await generateAITask(name, 0);
    }

    const newChallenge: Challenge = {
      id: crypto.randomUUID(),
      name,
      type,
      initialMetric,
      currentMetric: initialMetric,
      unit,
      streak: 0,
      nextTask,
      startDate: new Date().toISOString(),
      lastCompletedDate: null,
      createdAt: new Date().toISOString(),
    };
    
    setChallenges(prev => [...prev, newChallenge]);

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
        next_task: newChallenge.nextTask,
        last_completed_date: newChallenge.lastCompletedDate,
      }).select().single();

      if (error) {
        // Failed network -> queue for offline sync
        addPendingSync({ type: 'INSERT', data: newChallenge });
      } else if (data) {
        setChallenges(prev => prev.map(c => c.id === newChallenge.id ? { ...c, createdAt: data.created_at } : c));
      }
    }
  }, [user, supabase, addPendingSync]);

  const completeChallenge = useCallback(async (id: string) => {
    const challengeToUpdate = challenges.find(c => c.id === id);
    if (!challengeToUpdate || isToday(challengeToUpdate.lastCompletedDate)) return;

    const newStreak = isYesterday(challengeToUpdate.lastCompletedDate) ? challengeToUpdate.streak + 1 : 1;
    const nextMetric = calculateCompoundedMetric(challengeToUpdate.initialMetric, newStreak);
    const now = new Date().toISOString();

    let nextTask: string | undefined;
    if (challengeToUpdate.type === 'qualitative') {
      nextTask = await generateAITask(challengeToUpdate.name, newStreak);
    }

    setChallenges(prev => 
      prev.map(challenge => {
        if (challenge.id !== id) return challenge;
        return {
          ...challenge,
          streak: newStreak,
          currentMetric: nextMetric,
          nextTask,
          lastCompletedDate: now,
        };
      })
    );

    if (user) {
      const updateData = {
        id,
        streak: newStreak,
        currentMetric: nextMetric,
        nextTask,
        lastCompletedDate: now
      };

      const { error: updateError } = await supabase
        .from('challenges')
        .update({
          streak: newStreak,
          current_metric: nextMetric,
          next_task: nextTask,
          last_completed_date: now
        })
        .eq('id', id);
        
      if (updateError) {
        addPendingSync({ type: 'UPDATE', data: updateData });
      } else {
        await supabase.from('challenge_logs').insert({
          challenge_id: id,
          user_id: user.id,
          metric_achieved: nextMetric,
          completed_at: now
        });
      }
    }
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

  return {
    challenges,
    isLoaded,
    user,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    addChallenge,
    completeChallenge,
    deleteChallenge,
    isToday
  };
}
