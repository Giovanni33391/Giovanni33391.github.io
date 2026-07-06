import React, { useState } from 'react';
import { Plus, X, Dumbbell, Hash, Weight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Exercise } from '@/types';

interface NewRoutineFormProps {
  onSubmit: (name: string, exercises: Omit<Exercise, 'id' | 'sets'>[]) => void;
  onCancel: () => void;
}

export const NewRoutineForm = ({ onSubmit, onCancel }: NewRoutineFormProps) => {
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<Omit<Exercise, 'id' | 'sets'>[]>([]);

  const [newExName, setNewExName] = useState('');
  const [newExMetric, setNewExMetric] = useState('');
  const [newExSets, setNewExSets] = useState('3');
  const [newExReps, setNewExReps] = useState('10');
  const [newExUnit, setNewExUnit] = useState('kg');

  const handleAddExercise = () => {
    if (!newExName || !newExMetric) return;
    setExercises([...exercises, {
      name: newExName,
      initialMetric: parseFloat(newExMetric),
      currentMetric: parseFloat(newExMetric),
      targetSets: parseInt(newExSets),
      targetReps: parseInt(newExReps),
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
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Identidad de la Rutina</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Empuje Explosivo, Día de Pierna"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors font-bold"
          required
        />
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Ejercicios del Plan</label>

        <div className="space-y-2">
          {exercises.map((ex, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
              <div>
                <p className="font-bold text-zinc-100 text-sm">{ex.name}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">{ex.targetSets}x{ex.targetReps} • {ex.initialMetric}{ex.unit}</p>
              </div>
              <button type="button" onClick={() => removeExercise(index)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 bg-zinc-950/50 border border-zinc-800 border-dashed rounded-2xl space-y-4">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12">
              <div className="relative">
                <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Nombre del Ejercicio"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="col-span-6">
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="number"
                  placeholder="Peso"
                  value={newExMetric}
                  onChange={(e) => setNewExMetric(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="col-span-6">
              <select
                value={newExUnit}
                onChange={(e) => setNewExUnit(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-400 focus:border-emerald-500 focus:outline-none font-bold"
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
                <option value="reps">reps</option>
                <option value="min">min</option>
              </select>
            </div>

            <div className="col-span-6">
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="number"
                  placeholder="Sets"
                  value={newExSets}
                  onChange={(e) => setNewExSets(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none font-medium"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-zinc-700 uppercase">Sets</span>
              </div>
            </div>

            <div className="col-span-6">
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="number"
                  placeholder="Reps"
                  value={newExReps}
                  onChange={(e) => setNewExReps(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none font-medium"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-zinc-700 uppercase">Reps</span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleAddExercise}
            variant="outline"
            className="w-full border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 py-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Ejercicio
          </Button>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 text-zinc-500">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 font-black" disabled={!name || exercises.length === 0}>
          FORJAR RUTINA
        </Button>
      </div>
    </form>
  );
};
