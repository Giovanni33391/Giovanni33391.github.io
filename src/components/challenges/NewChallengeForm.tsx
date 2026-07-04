import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface NewChallengeFormProps {
  onSubmit: (name: string, initialMetric: number, unit: string, type: 'quantitative' | 'qualitative') => void;
  onCancel: () => void;
}

export function NewChallengeForm({ onSubmit, onCancel }: NewChallengeFormProps) {
  const [name, setName] = useState('');
  const [metric, setMetric] = useState('1');
  const [unit, setUnit] = useState('');
  const [type, setType] = useState<'quantitative' | 'qualitative'>('quantitative');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (type === 'quantitative' && (!metric || !unit.trim())) return;
    
    const finalMetric = type === 'qualitative' ? 1 : Number(metric);
    const finalUnit = type === 'qualitative' ? 'nivel' : unit.trim();

    onSubmit(name.trim(), finalMetric, finalUnit, type);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex p-1 bg-zinc-900 rounded-xl border border-zinc-800">
        <button
          type="button"
          onClick={() => setType('quantitative')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            type === 'quantitative'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Cuantitativo
        </button>
        <button
          type="button"
          onClick={() => setType('qualitative')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            type === 'qualitative'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Cualitativo (IA)
        </button>
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-zinc-400">
          ¿Qué quieres mejorar?
        </label>
        <input
          id="name"
          type="text"
          placeholder="Ej. Hacer flexiones"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          required
        />
      </div>
      
      {type === 'quantitative' ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="metric" className="text-sm font-medium text-zinc-400">
              Métrica base
            </label>
            <input
              id="metric"
              type="number"
              min="1"
              step="any"
              placeholder="Ej. 10"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              required={type === 'quantitative'}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="unit" className="text-sm font-medium text-zinc-400">
              Unidad
            </label>
            <input
              id="unit"
              type="text"
              placeholder="Ej. repeticiones"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              required={type === 'quantitative'}
            />
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
          <p className="text-sm text-emerald-400 leading-relaxed">
            La IA desglosará tu objetivo en micro-tareas diarias del 1% de mejora. Ideal para metas complejas como &quot;Aprender Inglés&quot; o &quot;Escribir un Libro&quot;.
          </p>
        </div>
      )}

      <div className="pt-4 flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="default">
          Crear Desafío
        </Button>
      </div>
    </form>
  );
}
