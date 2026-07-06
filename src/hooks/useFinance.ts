import { useState, useEffect, useCallback, useMemo } from 'react';
import { FinanceTransaction } from '@/types';

const STORAGE_KEY = 'onepercent_finance';

export function useFinance() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = useCallback((data: Omit<FinanceTransaction, 'id'>) => {
    const newTransaction: FinanceTransaction = {
      ...data,
      id: crypto.randomUUID()
    };
    setTransactions(prev => [newTransaction, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    return { totalIncome, totalExpense, balance };
  }, [transactions]);

  return { transactions, addTransaction, deleteTransaction, stats };
}
