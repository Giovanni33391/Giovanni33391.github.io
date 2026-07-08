import { useState, useEffect, useCallback } from 'react';
import { CleaningTask } from '@/types';

const STORAGE_KEY = 'onepercent_cleaning';

export function useCleaning() {
  const [tasks, setTasks] = useState<CleaningTask[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((name: string, frequencyDays: number) => {
    const newTask: CleaningTask = {
      id: crypto.randomUUID(),
      name,
      frequencyDays,
      lastCleanedDate: null, // Initialize as null to show 0% progress
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, lastCleanedDate: new Date().toISOString() } : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, addTask, completeTask, deleteTask };
}
