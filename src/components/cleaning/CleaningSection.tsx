import React, { useState } from 'react';
import { Home, Plus, Sparkles, Clock, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCleaning } from '@/hooks/useCleaning';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export const CleaningSection = () => {
  const { tasks, addTask, completeTask, deleteTask } = useCleaning();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomCount, setRoomCount] = useState<string>('');
  const [step, setStep] = useState<'setup' | 'dashboard'>(tasks.length > 0 ? 'dashboard' : 'setup');

  const [taskName, setTaskName] = useState('');
  const [frequency, setFrequency] = useState('1');

  const getTaskStatus = (task: { lastCleanedDate: string; frequencyDays: number }) => {
    const lastCleaned = new Date(task.lastCleanedDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastCleaned.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const progress = Math.max(0, Math.min(100, (diffDays / task.frequencyDays) * 100));
    const isOverdue = diffDays > task.frequencyDays;

    return { progress, isOverdue };
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName) return;
    addTask(taskName, parseInt(frequency));
    setTaskName('');
    setFrequency('1');
    setIsModalOpen(false);
    setStep('dashboard');
  };

  const handleInitialSetup = () => {
    const count = parseInt(roomCount);
    if (isNaN(count)) return;

    // Add default rooms
    for (let i = 1; i <= count; i++) {
      addTask(`Habitación ${i}`, 7);
    }
    addTask('Baño', 3);
    addTask('Cocina', 2);
    setStep('dashboard');
  };

  if (step === 'setup') {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Home className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-black text-zinc-100 mb-4">Configura tu Hogar</h2>
        <p className="text-zinc-500 mb-8">Indica cuántas habitaciones tiene tu casa para organizar la limpieza.</p>

        <div className="space-y-4">
          <input
            type="number"
            placeholder="Número de habitaciones (ej: 3)"
            value={roomCount}
            onChange={(e) => setRoomCount(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-zinc-100 focus:border-emerald-500 focus:outline-none text-center text-xl"
          />
          <Button onClick={handleInitialSetup} className="w-full py-4 text-lg font-black" disabled={!roomCount}>
            Empezar Planificación
          </Button>
          <button onClick={() => setStep('dashboard')} className="text-zinc-600 text-sm hover:text-zinc-400 underline underline-offset-4">
            Saltar y añadir manualmente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Estado de Limpieza</h2>
          <p className="text-zinc-500 text-sm">Gestiona la higiene de cada sector de tu hogar.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Añadir Sector
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => {
          const { progress, isOverdue } = getTaskStatus(task);
          return (
            <motion.div
              key={task.id}
              layout
              className={cn(
                "bg-zinc-900 border p-6 rounded-3xl group transition-all",
                isOverdue ? "border-rose-500/50 shadow-lg shadow-rose-500/5" : "border-zinc-800"
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100 mb-1">{task.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="w-3 h-3" />
                    Frecuencia: {task.frequencyDays} {task.frequencyDays === 1 ? 'día' : 'días'}
                  </div>
                </div>
                <button onClick={() => deleteTask(task.id)} className="text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className={isOverdue ? "text-rose-400" : "text-zinc-500"}>
                    {isOverdue ? 'Toca Limpiar' : 'Limpio'}
                  </span>
                  <span className="text-zinc-500">{(100 - progress).toFixed(0)}% restante</span>
                </div>
                <div className="h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - progress}%` }}
                    className={cn(
                      "h-full rounded-full transition-all",
                      isOverdue ? "bg-rose-500" : progress > 70 ? "bg-amber-500" : "bg-emerald-500"
                    )}
                  />
                </div>
              </div>

              <Button
                onClick={() => completeTask(task.id)}
                className="w-full bg-zinc-950 border border-zinc-800 hover:bg-emerald-500 hover:border-emerald-500 group-hover:text-white transition-all"
                variant="ghost"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Marcar como Limpio
              </Button>
            </motion.div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Sector o Tarea">
        <form onSubmit={handleAddTask} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Nombre del Sector</label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:border-emerald-500 focus:outline-none"
                placeholder="Ej: Cocina, Dormitorio Principal, Cama"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Frecuencia de Limpieza (días)</label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 7, 14].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setFrequency(d.toString())}
                    className={cn(
                      "py-3 rounded-xl border text-sm font-bold transition-all",
                      frequency === d.toString() ? "bg-emerald-500 border-emerald-500 text-white" : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    )}
                  >
                    {d === 1 ? 'Día' : d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full py-4 text-lg font-black">
            Añadir a Plan de Limpieza
          </Button>
        </form>
      </Modal>
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');
