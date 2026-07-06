import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Plus, Zap } from 'lucide-react';
import { useTraining } from '@/hooks/useTraining';
import { RoutineCard } from './RoutineCard';
import { NewRoutineForm } from './NewRoutineForm';
import { ActiveWorkout } from './ActiveWorkout';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export const TrainingSection = () => {
  const {
    routines,
    activeRoutine,
    addRoutine,
    deleteRoutine,
    startWorkout,
    updateSet,
    finishWorkout,
    cancelWorkout
  } = useTraining();

  const [isModalOpen, setIsModalOpen] = useState(false);

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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-zinc-100 flex items-center gap-3">
            Gimnasio
            <Zap className="w-6 h-6 text-emerald-500 fill-emerald-500" />
          </h2>
          <p className="text-zinc-500 text-sm font-medium">Forja tu mejor versión con el interés compuesto.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="hidden sm:flex" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Rutina
        </Button>
      </div>

      {routines.length === 0 ? (
        <div className="py-24 text-center rounded-[2rem] bg-zinc-900/50 border border-zinc-800 border-dashed">
          <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-zinc-800 shadow-2xl">
            <Dumbbell className="w-12 h-12 text-zinc-700" />
          </div>
          <h3 className="text-2xl font-black text-zinc-100 mb-2">Sin Rutinas Activas</h3>
          <p className="text-zinc-500 max-w-xs mx-auto mb-10 font-medium">El 1% extra hoy es lo que marca la diferencia mañana. Crea tu plan ahora.</p>
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
        </div>
      )}

      {/* Mobile FAB */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 sm:hidden z-40"
      >
        <Button
          size="icon"
          className="w-16 h-16 rounded-full shadow-2xl bg-emerald-500 text-zinc-950"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-8 h-8" />
        </Button>
      </motion.div>

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
