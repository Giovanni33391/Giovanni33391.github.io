import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Flame, Trash2, Play, ChevronRight, TrendingUp, Calendar } from 'lucide-react';
import { Routine } from '@/types';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';

interface RoutineCardProps {
  routine: Routine;
  onStart: (routine: Routine) => void;
  onDelete: (id: string) => void;
}

export const RoutineCard = ({ routine, onStart, onDelete }: RoutineCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden group hover:border-emerald-500/30 transition-all shadow-xl"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer flex-1">
            <h3 className="text-2xl font-black text-zinc-100 mb-1 group-hover:text-emerald-400 transition-colors">
              {routine.name}
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-emerald-400 font-bold">
                <Flame className="w-4 h-4 mr-1.5" />
                {routine.streak} {routine.streak === 1 ? 'sesión' : 'sesiones'}
              </div>
              {routine.lastCompletedDate && (
                <div className="flex items-center text-xs text-zinc-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  Última: {new Date(routine.lastCompletedDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => onDelete(routine.id)}
            className="p-2 text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 mb-8">
          {routine.exercises.slice(0, isExpanded ? undefined : 2).map((ex) => (
            <div key={ex.id} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 group/ex">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800">
                  <Dumbbell className="w-4 h-4 text-zinc-600 group-hover/ex:text-emerald-500 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-200">{ex.name}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{ex.targetSets}x{ex.targetReps} @ {ex.currentMetric}{ex.unit}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-black">
                  <TrendingUp className="w-3 h-3" />
                  +1%
                </div>
                <p className="text-[10px] text-zinc-600 uppercase">Progreso</p>
              </div>
            </div>
          ))}
          {!isExpanded && routine.exercises.length > 2 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full text-center text-xs font-bold text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              + {routine.exercises.length - 2} ejercicios más
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-[2] py-6 text-lg font-black bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/10"
            onClick={() => onStart(routine)}
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            ENTRENAR
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="flex-1 py-6 border-zinc-800 text-zinc-500 hover:text-zinc-100 hover:border-zinc-700"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronRight className={cn("w-5 h-5 transition-transform", isExpanded && "rotate-90")} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
