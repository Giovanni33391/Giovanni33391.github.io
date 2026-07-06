import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Exercise } from '@/types';

interface NewRoutineFormProps {
  onSubmit: (name: string, exercises: Omit<Exercise, 'id'>[]) => void;
  onCancel: () => void;
}

export const NewRoutineForm = ({ onSubmit, onCancel }: NewRoutineFormProps) => {
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<Omit<Exercise, 'id'>[]>([]);

  const [newExName, setNewExName] = useState('');
  const [newExMetric, setNewExMetric] = useState('');
  const [newExUnit, setNewExUnit] = useState('kg');

  const handleAddExercise = () => {
    if (!newExName || !newExMetric) return;
    setExercises([...exercises, {
      name: newExName,
      initialMetric: parseFloat(newExMetric),
      currentMetric: parseFloat(newExMetric),
      unit: newExUnit
    }]);
    setNewExName('');
    setNewExMetric('');
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || exercises.length === 0) return;
    onSubmit(name, exercises);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">Nombre de la Rutina</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Empuje, Pierna, Rutina A"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
          required
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-zinc-400">Ejercicios</label>

        {exercises.map((ex, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <div>
              <p className="font-bold text-zinc-100">{ex.name}</p>
              <p className="text-sm text-zinc-500">{ex.initialMetric} {ex.unit}</p>
            </div>
            <button type="button" onClick={() => removeExercise(index)} className="text-zinc-500 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        <div className="grid grid-cols-12 gap-2 p-3 bg-zinc-900/30 border border-zinc-800 border-dashed rounded-xl">
          <div className="col-span-6">
            <input
              type="text"
              placeholder="Ejercicio"
              value={newExName}
              onChange={(e) => setNewExName(e.target.value)}
              className="w-full bg-transparent border-none text-sm text-zinc-100 focus:ring-0 px-0"
            />
          </div>
          <div className="col-span-3">
            <input
              type="number"
              placeholder="0"
              value={newExMetric}
              onChange={(e) => setNewExMetric(e.target.value)}
              className="w-full bg-transparent border-none text-sm text-zinc-100 focus:ring-0 px-0"
            />
          </div>
          <div className="col-span-2">
            <select
              value={newExUnit}
              onChange={(e) => setNewExUnit(e.target.value)}
              className="w-full bg-transparent border-none text-sm text-zinc-400 focus:ring-0 px-0"
            >
              <option value="kg">kg</option>
              <option value="reps">reps</option>
              <option value="min">min</option>
              <option value="m">m</option>
            </select>
          </div>
          <div className="col-span-1 flex justify-end">
            <button
              type="button"
              onClick={handleAddExercise}
              className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={!name || exercises.length === 0}>
          Crear Rutina
        </Button>
      </div>
    </form>
  );
};
