import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Zap, BarChart3, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    
    onSubmit(name.trim(), Number(metric), unit.trim(), type);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setType('quantitative')}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
            type === 'quantitative'
              ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
              : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
          )}
        >
          <BarChart3 className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-wider">Cuantitativo</span>
        </button>
        <button
          type="button"
          onClick={() => setType('qualitative')}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
            type === 'qualitative'
              ? "bg-purple-500/10 border-purple-500 text-purple-400"
              : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
          )}
        >
          <Zap className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-wider">IA Cualitativa</span>
        </button>
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-zinc-400">
          {type === 'quantitative' ? '¿Qué quieres mejorar?' : '¿Qué habilidad quieres desarrollar?'}
        </label>
        <input
          id="name"
          type="text"
          placeholder={type === 'quantitative' ? "Ej. Hacer flexiones" : "Ej. Escritura creativa"}
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
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="unit" className="text-sm font-medium text-zinc-400">
              ¿Cómo lo medirías? (Para contexto de la IA)
            </label>
            <input
              id="unit"
              type="text"
              placeholder="Ej. calidad, fluidez, complejidad"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              required
            />
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 text-xs text-purple-300/80 leading-relaxed">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>La IA generará tareas un 1% más desafiantes cada día basadas en tu objetivo. No necesitas métricas numéricas.</p>
          </div>
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
