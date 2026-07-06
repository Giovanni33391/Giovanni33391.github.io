import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { WorkoutSession } from '@/types';

interface WorkoutHistoryProps {
  sessions: WorkoutSession[];
}

export const WorkoutHistory = ({ sessions }: WorkoutHistoryProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  if (sessions.length === 0) {
    return (
      <div className="py-20 text-center bg-zinc-900/30 rounded-[2rem] border border-zinc-800 border-dashed">
        <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-zinc-400">Sin historial aún</h3>
        <p className="text-zinc-600 text-sm mt-2">Completa tu primer entrenamiento para ver tus estadísticas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session, idx) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="group bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl hover:border-emerald-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                {formatDate(session.date)}
              </span>
              <h4 className="text-lg font-black text-zinc-100">{session.routineName}</h4>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-zinc-100">{session.totalVolume.toLocaleString()} <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">kg</span></div>
              <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Volumen Total</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-200">{formatDuration(session.duration)}</div>
                <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Duración</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-200">{session.exercises.length} Ejercicios</div>
                <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Completados</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
             <div className="space-y-2">
                {session.exercises.map(ex => (
                  <div key={ex.id} className="flex items-center justify-between text-xs font-medium">
                    <span className="text-zinc-400">{ex.name}</span>
                    <span className="text-zinc-100">{ex.sets.filter(s => s.completed).length} x {ex.targetReps} @ {ex.currentMetric}{ex.unit}</span>
                  </div>
                ))}
             </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
