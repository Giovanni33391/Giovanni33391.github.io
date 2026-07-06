import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Save, X, Timer } from 'lucide-react';
import { Routine, ExerciseSet } from '@/types';
import { Button } from '../ui/Button';

interface ActiveWorkoutProps {
  routine: Routine;
  onUpdateSet: (exId: string, setId: string, updates: Partial<ExerciseSet>) => void;
  onFinish: () => void;
  onCancel: () => void;
}

export const ActiveWorkout = ({ routine, onUpdateSet, onFinish, onCancel }: ActiveWorkoutProps) => {
  const [seconds, setSeconds] = useState(0);
  const isTimerRunning = true;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const allSetsCompleted = routine.exercises.every(ex => ex.sets.every(s => s.completed));

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-zinc-100">{routine.name}</h2>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
            <Timer className="w-4 h-4" />
            {formatTime(seconds)}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-zinc-500">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Exercise List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-32 no-scrollbar">
        {routine.exercises.map((exercise) => (
          <div key={exercise.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-100">{exercise.name}</h3>
              <span className="text-xs text-zinc-500 uppercase tracking-widest">{exercise.targetSets} sets x {exercise.targetReps} reps</span>
            </div>

            <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">
              <div className="col-span-2">Set</div>
              <div className="col-span-4 text-center">Peso ({exercise.unit})</div>
              <div className="col-span-4 text-center">Reps</div>
              <div className="col-span-2 text-right">OK</div>
            </div>

            <div className="space-y-2">
              {exercise.sets.map((set, idx) => (
                <motion.div
                  key={set.id}
                  whileTap={{ scale: 0.98 }}
                  className={`grid grid-cols-12 gap-2 p-3 rounded-xl border transition-all ${
                    set.completed
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-zinc-900 border-zinc-800"
                  }`}
                >
                  <div className="col-span-2 flex items-center font-black text-zinc-400">{idx + 1}</div>

                  <div className="col-span-4">
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) => onUpdateSet(exercise.id, set.id, { weight: parseFloat(e.target.value) })}
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-1 text-center text-zinc-100 font-bold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-4">
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => onUpdateSet(exercise.id, set.id, { reps: parseInt(e.target.value) })}
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-1 text-center text-zinc-100 font-bold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => onUpdateSet(exercise.id, set.id, { completed: !set.completed })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        set.completed
                        ? "bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20"
                        : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
        <Button
          onClick={onFinish}
          className="w-full py-4 text-lg font-black shadow-2xl shadow-emerald-500/20"
          disabled={!allSetsCompleted}
        >
          <Save className="w-5 h-5 mr-2" />
          Finalizar Entrenamiento
        </Button>
      </div>
    </div>
  );
};
