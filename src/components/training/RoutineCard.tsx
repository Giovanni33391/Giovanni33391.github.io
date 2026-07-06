import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Flame, Trash2, CheckCircle2, ChevronRight } from 'lucide-react';
import { Routine } from '@/types';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface RoutineCardProps {
  routine: Routine;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export const RoutineCard = ({ routine, onComplete, onDelete }: RoutineCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#059669']
    });

    setTimeout(() => {
      onComplete(routine.id);
      setIsCompleting(false);
    }, 500);
  };

  return (
    <motion.div
      layout
      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-zinc-700 transition-all"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-zinc-100">{routine.name}</h3>
              <ChevronRight className={cn("w-4 h-4 text-zinc-500 transition-transform", isExpanded && "rotate-90")} />
            </div>
            <div className="flex items-center text-sm text-emerald-400 font-medium">
              <Flame className="w-4 h-4 mr-1.5" />
              Racha: {routine.streak} {routine.streak === 1 ? 'sesión' : 'sesiones'}
            </div>
          </div>
          <button
            onClick={() => onDelete(routine.id)}
            className="p-2 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 mb-6 pt-2">
                {routine.exercises.map((ex) => (
                  <div key={ex.id} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                    <div>
                      <p className="text-sm font-bold text-zinc-200">{ex.name}</p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>Inicial: {ex.initialMetric}{ex.unit}</span>
                        <span className="text-emerald-500/50">→</span>
                        <span className="text-emerald-400 font-medium">Siguiente: {(ex.currentMetric * 1.01).toFixed(2)}{ex.unit}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-zinc-100">{ex.currentMetric}{ex.unit}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Hoy</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-zinc-800 text-zinc-400 hover:text-zinc-100"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Ocultar' : 'Ver ejercicios'}
          </Button>
          <Button
            className="flex-1"
            onClick={handleComplete}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <CheckCircle2 className="w-5 h-5 animate-bounce" />
            ) : (
              <span className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                Completar 1%
              </span>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
