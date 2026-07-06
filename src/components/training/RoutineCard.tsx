import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Flame, Trash2, Play, ChevronRight, TrendingUp, Calendar, Zap, Check, X, Sparkles } from 'lucide-react';
import { Routine } from '@/types';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';

interface RoutineCardProps {
  routine: Routine;
  onStart: (routine: Routine) => void;
  onDelete: (id: string) => void;
  onApplySuggestion: (routineId: string, exerciseId: string) => void;
  onIgnoreSuggestion: (routineId: string, exerciseId: string) => void;
}

export const RoutineCard = ({ routine, onStart, onDelete, onApplySuggestion, onIgnoreSuggestion }: RoutineCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasSuggestions = routine.exercises.some(ex => !!ex.suggestion);

  return (
    <motion.div
      layout
      className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] overflow-hidden group hover:border-emerald-500/30 transition-all shadow-2xl relative"
    >
      {/* Premium Gradient Overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px] -z-10" />

      <div className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer flex-1">
            <h3 className="text-3xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors tracking-tight">
              {routine.name}
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-xs text-emerald-400 font-black uppercase tracking-widest">
                <Flame className="w-3.5 h-3.5 mr-1.5 fill-current" />
                {routine.streak} {routine.streak === 1 ? 'Sesión' : 'Sesiones'}
              </div>
              {routine.lastCompletedDate && (
                <div className="flex items-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  <Calendar className="w-3 h-3 mr-1.5" />
                  {new Date(routine.lastCompletedDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => onDelete(routine.id)}
            className="p-2 text-zinc-800 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* AI Suggestion Highlight */}
        <AnimatePresence>
          {hasSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Sparkles className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Mejora Detectada</p>
                <p className="text-xs text-zinc-300 font-medium leading-tight">La IA ha sugerido ajustes basados en tu rendimiento.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4 mb-10">
          {routine.exercises.slice(0, isExpanded ? undefined : 2).map((ex) => (
            <div key={ex.id} className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-[1.5rem] border border-zinc-800/50 group/ex relative overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover/ex:border-emerald-500/30 transition-all">
                    <Dumbbell className="w-5 h-5 text-zinc-600 group-hover/ex:text-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{ex.name}</p>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                      {ex.targetSets}x{ex.targetReps} • {ex.currentMetric}{ex.unit} • {ex.mode || 'Hyp'}
                    </p>
                  </div>
                </div>

                {!ex.suggestion && (
                  <div className="text-right">
                    <TrendingUp className="w-4 h-4 text-zinc-800 ml-auto mb-1" />
                    <p className="text-[8px] text-zinc-700 font-black uppercase">Consistencia</p>
                  </div>
                )}
              </div>

              {/* Suggestion Card Inline */}
              <AnimatePresence>
                {ex.suggestion && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-zinc-900 border border-emerald-500/30 rounded-[1.5rem] shadow-xl shadow-emerald-500/5"
                  >
                    <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Recomendación IA</span>
                       </div>
                       <div className="text-xs font-black text-white bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-700">
                          {ex.suggestion.weight && `${ex.suggestion.weight}${ex.unit}`}
                          {ex.suggestion.weight && ex.suggestion.reps && ' / '}
                          {ex.suggestion.reps && `${ex.suggestion.reps} reps`}
                       </div>
                    </div>
                    <p className="text-xs text-zinc-400 font-medium mb-4 leading-relaxed italic">
                      &quot;{ex.suggestion.reason}&quot;
                    </p>
                    <div className="flex gap-2">
                       <button
                        onClick={() => onApplySuggestion(routine.id, ex.id)}
                        className="flex-1 bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                       >
                        <Check className="w-3 h-3 stroke-[4]" /> Aplicar
                       </button>
                       <button
                        onClick={() => onIgnoreSuggestion(routine.id, ex.id)}
                        className="bg-zinc-800 text-zinc-400 p-2.5 rounded-xl hover:bg-zinc-700 transition-all"
                       >
                        <X className="w-4 h-4" />
                       </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {!isExpanded && routine.exercises.length > 2 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full py-3 bg-zinc-900/50 rounded-2xl text-[10px] font-black text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-[0.2em]"
            >
              + {routine.exercises.length - 2} Ejercicios Ocultos
            </button>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            className="flex-[3] py-7 text-xl font-black bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-2xl shadow-emerald-500/30 rounded-3xl group/btn"
            onClick={() => onStart(routine)}
          >
            <Play className="w-6 h-6 mr-3 fill-current group-hover/btn:scale-110 transition-transform" />
            ENTRENAR
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="flex-1 py-7 border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-zinc-100 hover:border-zinc-700 rounded-3xl"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronRight className={cn("w-6 h-6 transition-transform duration-500", isExpanded && "rotate-90")} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
