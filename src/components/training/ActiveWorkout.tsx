import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Save, X, Timer, Coffee, Zap, TrendingUp, BarChart3, Clock, Trophy, UserCircle, ChevronRight } from 'lucide-react';
import { Routine, ExerciseSet, TrainingMode } from '@/types';
import { Button } from '../ui/Button';

interface ActiveWorkoutProps {
  routine: Routine;
  onUpdateSet: (exId: string, setId: string, updates: Partial<ExerciseSet>) => void;
  onFinish: (duration: number, selections: Record<string, 'weight' | 'reps' | null>) => void;
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
  const [showSummary, setShowSummary] = useState(false);
  const [selections, setSelections] = useState<Record<string, 'weight' | 'reps' | null>>({});

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

  const totalVolume = routine.exercises.reduce((acc, ex) => {
    return acc + ex.sets.reduce((sAcc, s) => s.completed ? sAcc + (s.weight * s.reps) : sAcc, 0);
  }, 0);

  const allSetsCompleted = routine.exercises.every(ex => ex.sets.every(s => s.completed));
  const currentExercise = routine.exercises[currentExerciseIndex];

  if (showSummary) {
    return (
      <div className="fixed inset-0 z-[70] bg-zinc-950 flex flex-col p-6 overflow-y-auto no-scrollbar selection:bg-emerald-500/30">
        <div className="max-w-md mx-auto w-full space-y-8 pb-32">
          <div className="text-center space-y-2 pt-8">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <Trophy className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">Evolución Completada</h2>
            <p className="text-zinc-500 font-medium">Analizando métricas de rendimiento...</p>
          </div>

          {/* AI Global Assessment */}
          <div className="bg-zinc-900 border border-emerald-500/20 rounded-[2rem] p-6 relative overflow-hidden">
             <div className="flex items-center gap-3 mb-4">
                <UserCircle className="w-6 h-6 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Evaluación del Coach</span>
             </div>
             <p className="text-xl font-black text-white leading-tight italic">
                &quot;{routine.lastGlobalAssessment || "Entrenamiento sólido. Mantén el foco en la técnica."}&quot;
             </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-[2.5rem]">
              <BarChart3 className="w-5 h-5 text-emerald-500 mb-2" />
              <div className="text-3xl font-black text-white leading-none tracking-tighter">{totalVolume.toLocaleString()}</div>
              <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-2">Volumen Total</div>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-[2.5rem]">
              <Clock className="w-5 h-5 text-purple-500 mb-2" />
              <div className="text-3xl font-black text-white leading-none tracking-tighter">{formatTime(seconds)}</div>
              <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-2">Tiempo</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] pl-2">Planificación Próxima Sesión</h3>
            {routine.exercises.map((ex) => (
              <div key={ex.id} className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-black text-white leading-tight mb-1">{ex.name}</h4>
                    <div className="flex items-center gap-2">
                       <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                       <p className="text-[10px] text-emerald-500/70 font-black uppercase tracking-widest">
                          {ex.suggestion?.reason || "Mantener ritmo"}
                       </p>
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest bg-zinc-800 px-2 py-1 rounded-lg">
                    {ex.mode}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelections(prev => ({ ...prev, [ex.id]: prev[ex.id] === 'weight' ? null : 'weight' }))}
                    className={`p-4 rounded-3xl border text-left transition-all relative overflow-hidden group ${
                      selections[ex.id] === 'weight'
                      ? "bg-emerald-500 border-emerald-400 text-zinc-950 shadow-xl shadow-emerald-500/20"
                      : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    <div className="text-[8px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Objetivo Peso</div>
                    <div className="text-2xl font-black tabular-nums">
                       {ex.suggestion?.options?.weight.label || `+1.25${ex.unit}`}
                    </div>
                  </button>
                  <button
                    onClick={() => setSelections(prev => ({ ...prev, [ex.id]: prev[ex.id] === 'reps' ? null : 'reps' }))}
                    className={`p-4 rounded-3xl border text-left transition-all relative overflow-hidden group ${
                      selections[ex.id] === 'reps'
                      ? "bg-emerald-500 border-emerald-400 text-zinc-950 shadow-xl shadow-emerald-500/20"
                      : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    <div className="text-[8px] font-black uppercase tracking-[0.2em] mb-1 opacity-60">Objetivo Reps</div>
                    <div className="text-2xl font-black tabular-nums">
                       {ex.suggestion?.options?.reps.label || "+1 rep"}
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
          <Button
            className="w-full py-8 rounded-[2.5rem] font-black text-xl bg-emerald-500 text-zinc-950 shadow-2xl shadow-emerald-500/40 hover:bg-emerald-400 transition-all transform active:scale-95"
            onClick={() => onFinish(seconds, selections)}
          >
            GUARDAR Y EVOLUCIONAR
            <ChevronRight className="w-6 h-6 ml-2 stroke-[3]" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-zinc-950 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Header */}
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

      {/* Rest Timer */}
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
                <Button variant="ghost" className="flex-1 bg-white/5 text-white font-black text-xs hover:bg-white/10 rounded-2xl py-6" onClick={() => setRestSeconds(s => s + 15)}>+15s</Button>
                <Button variant="default" className="flex-1 bg-emerald-500 text-zinc-950 font-black text-xs hover:bg-emerald-400 rounded-2xl py-6 shadow-lg shadow-emerald-500/20" onClick={() => setIsResting(false)}>SALTAR</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise View */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
         <div className="flex justify-center gap-2 py-6 px-4">
            {routine.exercises.map((_, i) => (
              <button key={i} onClick={() => setCurrentExerciseIndex(i)} className={`h-1.5 transition-all rounded-full ${i === currentExerciseIndex ? "w-8 bg-emerald-500" : "w-1.5 bg-zinc-800"}`} />
            ))}
         </div>

         <motion.div key={currentExercise?.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-4 space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                 <Zap className="w-3 h-3 fill-emerald-500" />
                 {currentExercise?.mode || 'Hypertrophy'}
              </div>
              <h3 className="text-4xl font-black text-white tracking-tight leading-none">{currentExercise?.name}</h3>
              <p className="text-zinc-500 text-sm font-medium">Objetivo: {currentExercise?.targetSets} series de {currentExercise?.targetReps} reps</p>
            </div>

            <div className="space-y-3">
              {currentExercise?.sets.map((set, idx) => (
                <div key={set.id} className={`grid grid-cols-12 gap-2 p-4 rounded-[1.5rem] border transition-all ${set.completed ? "bg-emerald-500/10 border-emerald-500/40" : "bg-zinc-900 border-zinc-800/50"}`}>
                  <div className="col-span-2 flex items-center font-black text-lg text-zinc-500">{idx + 1}</div>
                  <div className="col-span-4 flex items-center justify-center">
                    <input type="number" step="0.1" value={set.weight} onChange={(e) => onUpdateSet(currentExercise.id, set.id, { weight: parseFloat(e.target.value) })} className="w-full bg-transparent text-center text-2xl font-black text-white focus:outline-none tabular-nums" />
                  </div>
                  <div className="col-span-4 flex items-center justify-center">
                    <input type="number" value={set.reps} onChange={(e) => onUpdateSet(currentExercise.id, set.id, { reps: parseInt(e.target.value) })} className="w-full bg-transparent text-center text-2xl font-black text-white focus:outline-none tabular-nums" />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button onClick={() => handleSetToggle(currentExercise.id, set.id, set.completed, currentExercise.mode)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${set.completed ? "bg-emerald-500 text-zinc-950 shadow-xl" : "bg-zinc-800 text-zinc-600"}`}><CheckCircle2 className="w-6 h-6 stroke-[3]" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-6 flex gap-4 items-start">
               <TrendingUp className="w-5 h-5 text-emerald-500 flex-shrink-0" />
               <p className="text-sm text-zinc-300 font-medium leading-relaxed">Controla la fase excéntrica (bajada) para maximizar hipertrofia.</p>
            </div>
         </motion.div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent flex gap-3">
        <div className="flex gap-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl flex-1">
           <button disabled={currentExerciseIndex === 0} onClick={() => setCurrentExerciseIndex(i => i - 1)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 disabled:opacity-20">Anterior</button>
           <button disabled={currentExerciseIndex === routine.exercises.length - 1} onClick={() => setCurrentExerciseIndex(i => i + 1)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-500 disabled:opacity-20">Siguiente</button>
        </div>
        <Button onClick={() => setShowSummary(true)} className={`px-8 rounded-2xl font-black text-sm uppercase tracking-widest ${allSetsCompleted ? "bg-emerald-500 text-zinc-950" : "bg-zinc-800 text-zinc-500"}`} disabled={!allSetsCompleted}>RESUMEN</Button>
      </div>
    </div>
  );
};
