import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Save, X, Timer, Coffee, Zap, TrendingUp } from 'lucide-react';
import { Routine, ExerciseSet, TrainingMode } from '@/types';
import { Button } from '../ui/Button';

interface ActiveWorkoutProps {
  routine: Routine;
  onUpdateSet: (exId: string, setId: string, updates: Partial<ExerciseSet>) => void;
  onFinish: (duration: number) => void;
  onCancel: () => void;
}

const GET_REST_TIME = (mode: TrainingMode = 'hypertrophy') => {
  switch (mode) {
    case 'strength': return 180;
    case 'hypertrophy': return 90;
    case 'calisthenics': return 120;
    case 'myoreps': return 30;
    case 'endurance': return 60;
    default: return 90;
  }
};

export const ActiveWorkout = ({ routine, onUpdateSet, onFinish, onCancel }: ActiveWorkoutProps) => {
  const [seconds, setSeconds] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (isResting && restSeconds > 0) {
      restTimerRef.current = setInterval(() => {
        setRestSeconds(s => {
          if (s <= 1) {
            setIsResting(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
    }
    return () => { if (restTimerRef.current) clearInterval(restTimerRef.current); };
  }, [isResting, restSeconds]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSetToggle = (exerciseId: string, setId: string, currentlyCompleted: boolean, mode: TrainingMode) => {
    onUpdateSet(exerciseId, setId, { completed: !currentlyCompleted });

    if (!currentlyCompleted) {
      setRestSeconds(GET_REST_TIME(mode));
      setIsResting(true);
    } else {
      setIsResting(false);
      setRestSeconds(0);
    }
  };

  const allSetsCompleted = routine.exercises.every(ex => ex.sets.every(s => s.completed));
  const currentExercise = routine.exercises[currentExerciseIndex];

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Header with Glassmorphism */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border-b border-zinc-800/50 p-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">{routine.name}</h2>
          <div className="flex items-center gap-3 mt-0.5">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase tracking-widest">
              <Timer className="w-3 h-3" />
              {formatTime(seconds)}
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-800" />
            <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
              {routine.exercises.length} Ejercicios
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-zinc-500 hover:bg-white/5 rounded-full w-10 h-10 p-0">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Dynamic Rest Timer Overlay */}
      <AnimatePresence>
        {isResting && (
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            className="absolute top-24 left-4 right-4 z-50 pointer-events-none"
          >
            <div className="bg-emerald-500/10 backdrop-blur-2xl border border-emerald-500/30 rounded-[2rem] p-6 shadow-2xl shadow-emerald-500/20 flex flex-col items-center gap-2 pointer-events-auto max-w-sm mx-auto">
              <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px]">
                <Coffee className="w-4 h-4" />
                Descanso Activo
              </div>
              <div className="text-6xl font-black text-white tabular-nums tracking-tighter">
                {formatTime(restSeconds)}
              </div>
              <div className="flex gap-2 w-full mt-4">
                <Button
                  variant="ghost"
                  className="flex-1 bg-white/5 text-white font-black text-xs hover:bg-white/10 rounded-2xl py-6"
                  onClick={() => setRestSeconds(s => s + 15)}
                >
                  +15s
                </Button>
                <Button
                  variant="default"
                  className="flex-1 bg-emerald-500 text-zinc-950 font-black text-xs hover:bg-emerald-400 rounded-2xl py-6 shadow-lg shadow-emerald-500/20"
                  onClick={() => setIsResting(false)}
                >
                  SALTAR
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
         {/* Exercise Navigation Dots */}
         <div className="flex justify-center gap-2 py-6 px-4">
            {routine.exercises.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentExerciseIndex(i)}
                className={`h-1.5 transition-all rounded-full ${
                  i === currentExerciseIndex ? "w-8 bg-emerald-500" : "w-1.5 bg-zinc-800"
                }`}
              />
            ))}
         </div>

         {/* Current Exercise View */}
         <motion.div
            key={currentExercise?.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-4 space-y-8"
         >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                 <Zap className="w-3 h-3 fill-emerald-500" />
                 {currentExercise?.mode || 'Hypertrophy'}
              </div>
              <h3 className="text-4xl font-black text-white tracking-tight leading-none">
                {currentExercise?.name}
              </h3>
              <p className="text-zinc-500 text-sm font-medium">
                Objetivo: {currentExercise?.targetSets} series de {currentExercise?.targetReps} reps
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                <div className="col-span-2">Set</div>
                <div className="col-span-4 text-center">Peso ({currentExercise?.unit})</div>
                <div className="col-span-4 text-center">Reps</div>
                <div className="col-span-2 text-right">OK</div>
              </div>

              {currentExercise?.sets.map((set, idx) => (
                <motion.div
                  key={set.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`grid grid-cols-12 gap-2 p-4 rounded-[1.5rem] border transition-all ${
                    set.completed
                    ? "bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                    : "bg-zinc-900 border-zinc-800/50"
                  }`}
                >
                  <div className="col-span-2 flex items-center font-black text-lg text-zinc-500">{idx + 1}</div>

                  <div className="col-span-4 flex items-center justify-center">
                    <input
                      type="number"
                      step="0.1"
                      value={set.weight}
                      onChange={(e) => onUpdateSet(currentExercise.id, set.id, { weight: parseFloat(e.target.value) })}
                      className="w-full bg-transparent text-center text-2xl font-black text-white focus:outline-none tabular-nums"
                    />
                  </div>

                  <div className="col-span-4 flex items-center justify-center">
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) => onUpdateSet(currentExercise.id, set.id, { reps: parseInt(e.target.value) })}
                      className="w-full bg-transparent text-center text-2xl font-black text-white focus:outline-none tabular-nums"
                    />
                  </div>

                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => handleSetToggle(currentExercise.id, set.id, set.completed, currentExercise.mode)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        set.completed
                        ? "bg-emerald-500 text-zinc-950 shadow-xl shadow-emerald-500/40 scale-110"
                        : "bg-zinc-800 text-zinc-600 hover:bg-zinc-700"
                      }`}
                    >
                      <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* AI Coaching Tips could go here */}
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 flex gap-4 items-start">
               <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Tip de Rendimiento</p>
                  <p className="text-sm text-zinc-300 font-medium leading-relaxed">
                    Mantén una fase excéntrica controlada de 2-3 segundos para maximizar la tensión mecánica.
                  </p>
               </div>
            </div>
         </motion.div>
      </div>

      {/* Navigation & Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent flex gap-3">
        <div className="flex gap-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl flex-1">
           <button
            disabled={currentExerciseIndex === 0}
            onClick={() => setCurrentExerciseIndex(i => i - 1)}
            className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 disabled:opacity-20"
           >
            Anterior
           </button>
           <div className="w-px h-full bg-zinc-800" />
           <button
            disabled={currentExerciseIndex === routine.exercises.length - 1}
            onClick={() => setCurrentExerciseIndex(i => i + 1)}
            className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-500 disabled:opacity-20"
           >
            Siguiente
           </button>
        </div>

        <Button
          onClick={() => onFinish(seconds)}
          className={`px-8 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
            allSetsCompleted ? "bg-emerald-500 text-zinc-950" : "bg-zinc-800 text-zinc-500"
          }`}
          disabled={!allSetsCompleted}
        >
          <Save className="w-4 h-4 mr-2" />
          Finalizar
        </Button>
      </div>
    </div>
  );
};
