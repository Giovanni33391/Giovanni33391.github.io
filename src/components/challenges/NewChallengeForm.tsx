import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Zap, BarChart3, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewChallengeFormProps {
  onSubmit: (name: string, initialMetric: number, unit: string, type: 'quantitative' | 'qualitative', targetMetric?: number, frequency?: number[], initialContext?: string) => void;
  onCancel: () => void;
}

export function NewChallengeForm({ onSubmit, onCancel }: NewChallengeFormProps) {
  const [name, setName] = useState('');
  const [metric, setMetric] = useState('1');
  const [targetMetric, setTargetMetric] = useState('');
  const [unit, setUnit] = useState('');
  const [initialContext, setInitialContext] = useState('');
  const [frequency, setFrequency] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [type, setType] = useState<'quantitative' | 'qualitative'>('quantitative');

  const daysOfWeek = [
    { label: 'D', value: 0 },
    { label: 'L', value: 1 },
    { label: 'M', value: 2 },
    { label: 'X', value: 3 },
    { label: 'J', value: 4 },
    { label: 'V', value: 5 },
    { label: 'S', value: 6 },
  ];

  const toggleDay = (day: number) => {
    setFrequency(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !metric || !unit.trim()) return;
    
    onSubmit(
      name.trim(),
      Number(metric),
      unit.trim(),
      type,
      targetMetric ? Number(targetMetric) : undefined,
      frequency,
      initialContext.trim() || undefined
    );
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
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="metric" className="text-sm font-medium text-zinc-400">
                Métrica inicial
              </label>
              <input
                id="metric"
                type="number"
                min="0"
                step="any"
                placeholder="Ej. 1"
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
                placeholder="Ej. flexiones"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="targetMetric" className="text-sm font-medium text-zinc-400">
              Meta final (opcional)
            </label>
            <input
              id="targetMetric"
              type="number"
              min="0"
              step="any"
              placeholder="Ej. 50"
              value={targetMetric}
              onChange={(e) => setTargetMetric(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              La IA calculará cuántos días te llevará alcanzar esta meta mejorando un 1% diario.
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="initialContext" className="text-sm font-medium text-zinc-400">
              ¿Cuál es tu situación actual? (Contexto para la IA)
            </label>
            <textarea
              id="initialContext"
              placeholder="Ej. Puedo escribir 200 palabras pero me trabo mucho..."
              value={initialContext}
              onChange={(e) => setInitialContext(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all min-h-[100px] resize-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="unit" className="text-sm font-medium text-zinc-400">
              Unidad de medida
            </label>
            <input
              id="unit"
              type="text"
              placeholder="Ej. palabras, minutos, calidad"
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

      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-400">
          ¿Qué días vas a entrenar?
        </label>
        <div className="flex justify-between gap-1">
          {daysOfWeek.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={cn(
                "w-10 h-10 rounded-xl border text-xs font-bold transition-all",
                frequency.includes(day.value)
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                  : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
              )}
            >
              {day.label}
            </button>
          ))}
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
