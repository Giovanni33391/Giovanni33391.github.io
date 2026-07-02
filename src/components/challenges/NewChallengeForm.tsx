import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface NewChallengeFormProps {
  onSubmit: (name: string, initialMetric: number, unit: string) => void;
  onCancel: () => void;
}

export function NewChallengeForm({ onSubmit, onCancel }: NewChallengeFormProps) {
  const [name, setName] = useState('');
  const [metric, setMetric] = useState('');
  const [unit, setUnit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !metric || !unit.trim()) return;
    
    onSubmit(name.trim(), Number(metric), unit.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            required
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
            required
          />
        </div>
      </div>

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
