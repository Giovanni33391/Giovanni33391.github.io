import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Plus, Zap, History, BarChart3, LayoutGrid } from 'lucide-react';
import { useTraining } from '@/hooks/useTraining';
import { RoutineCard } from './RoutineCard';
import { NewRoutineForm } from './NewRoutineForm';
import { ActiveWorkout } from './ActiveWorkout';
import { WorkoutHistory } from './WorkoutHistory';
import { TrainingStats } from './TrainingStats';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export const TrainingSection = () => {
  const {
    routines,
    sessions,
    activeRoutine,
    addRoutine,
    deleteRoutine,
    startWorkout,
    updateSet,
    finishWorkout,
    cancelWorkout
  } = useTraining();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'routines' | 'history' | 'stats'>('routines');

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {activeRoutine && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <ActiveWorkout
              routine={activeRoutine}
              onUpdateSet={updateSet}
              onFinish={finishWorkout}
              onCancel={cancelWorkout}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-zinc-100 flex items-center gap-3">
            Gimnasio
            <Zap className="w-6 h-6 text-emerald-500 fill-emerald-500" />
          </h2>
          <p className="text-zinc-500 text-sm font-medium">Forja tu mejor versión con el interés compuesto.</p>
        </div>

        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-2xl">
          <button
            onClick={() => setView('routines')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              view === 'routines' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden xs:inline">Rutinas</span>
          </button>
          <button
            onClick={() => setView('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              view === 'history' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <History className="w-4 h-4" />
            <span className="hidden xs:inline">Historial</span>
          </button>
          <button
            onClick={() => setView('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              view === 'stats' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden xs:inline">Stats</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'routines' && (
          <motion.div
            key="routines"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {routines.length === 0 ? (
              <div className="py-24 text-center rounded-[2rem] bg-zinc-900/50 border border-zinc-800 border-dashed">
                <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-zinc-800 shadow-2xl">
                  <Dumbbell className="w-12 h-12 text-zinc-700" />
                </div>
                <h3 className="text-2xl font-black text-zinc-100 mb-2">Sin Rutinas Activas</h3>
                <p className="text-zinc-500 max-w-xs mx-auto mb-10 font-medium">El 1% extra hoy es lo que marca la diferencia mañana.</p>
                <Button onClick={() => setIsModalOpen(true)} size="lg" className="px-8 font-black">
                  Comenzar mi Legado
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {routines.map((routine) => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    onStart={startWorkout}
                    onDelete={deleteRoutine}
                  />
                ))}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group h-full min-h-[200px] rounded-[2rem] border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-4 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-zinc-500 group-hover:text-emerald-500" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-emerald-500">Añadir Nueva Rutina</span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {view === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <WorkoutHistory sessions={sessions} />
          </motion.div>
        )}

        {view === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <TrainingStats sessions={sessions} />
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Diseñar Rutina"
      >
        <NewRoutineForm
          onSubmit={(name, exercises) => {
            addRoutine(name, exercises);
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
