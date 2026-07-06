import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Plus } from 'lucide-react';
import { useTraining } from '@/hooks/useTraining';
import { RoutineCard } from './RoutineCard';
import { NewRoutineForm } from './NewRoutineForm';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export const TrainingSection = () => {
  const { routines, addRoutine, deleteRoutine, completeRoutine } = useTraining();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Mis Rutinas</h2>
          <p className="text-zinc-500 text-sm">Incrementa el peso o las repeticiones un 1% cada sesión.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="hidden sm:flex" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Rutina
        </Button>
      </div>

      {routines.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-zinc-900/50 border border-zinc-800 border-dashed">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
            <Dumbbell className="w-8 h-8 text-zinc-700" />
          </div>
          <h3 className="text-zinc-100 font-bold text-lg mb-2">No hay rutinas de entrenamiento</h3>
          <p className="text-zinc-500 max-w-xs mx-auto mb-8">Crea tu primera rutina para empezar a aplicar el crecimiento compuesto en el gimnasio.</p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Crear mi primera rutina
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onComplete={completeRoutine}
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
          className="w-14 h-14 rounded-full shadow-2xl"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nueva Rutina"
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
