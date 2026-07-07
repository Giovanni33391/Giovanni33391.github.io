import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Zap, BarChart3, Info, Lock, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewChallengeFormProps {
  onSubmit: (
    name: string,
    initialMetric: number,
    unit: string,
    type: 'quantitative' | 'qualitative' | 'static',
    frequency: number[],
    initialContext?: string,
    targetMetric?: number,
    targetGoal?: string,
    startTime?: string
  ) => void;
  onCancel: () => void;
}

const DAYS = [
  { label: 'D', value: 0 },
  { label: 'L', value: 1 },
  { label: 'M', value: 2 },
  { label: 'X', value: 3 },
  { label: 'J', value: 4 },
  { label: 'V', value: 5 },
  { label: 'S', value: 6 },
];

export function NewChallengeForm({ onSubmit, onCancel }: NewChallengeFormProps) {
  const [name, setName] = useState('');
  const [metric, setMetric] = useState('1');
  const [targetMetric, setTargetMetric] = useState('');
  const [targetGoal, setTargetGoal] = useState('');
  const [unit, setUnit] = useState('');
  const [type, setType] = useState<'quantitative' | 'qualitative' | 'static'>('quantitative');
  const [frequency, setFrequency] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [initialContext, setInitialContext] = useState('');
  const [startTime, setStartTime] = useState('');

  const toggleDay = (day: number) => {
    setFrequency(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const setAllDays = () => setFrequency([0, 1, 2, 3, 4, 5, 6]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (type !== 'static' && (!metric || !unit.trim())) || frequency.length === 0) return;
    
    onSubmit(
      name.trim(),
      type === 'static' ? 0 : Number(metric),
      type === 'static' ? 'mantener' : unit.trim(),
      type,
      frequency,
      type === 'qualitative' ? initialContext.trim() : undefined,
      type === 'quantitative' && targetMetric ? Number(targetMetric) : undefined,
      type === 'qualitative' && targetGoal ? targetGoal.trim() : undefined,
      startTime || undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type Selector */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setType('quantitative')}
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
            type === 'quantitative'
              ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
              : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
          )}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-center">Evolutivo</span>
        </button>
        <button
          type="button"
          onClick={() => setType('qualitative')}
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
            type === 'qualitative'
              ? "bg-purple-500/10 border-purple-500 text-purple-400"
              : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
          )}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-center">IA Skill</span>
        </button>
        <button
          type="button"
          onClick={() => setType('static')}
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
            type === 'static'
              ? "bg-blue-500/10 border-blue-500 text-blue-400"
              : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
          )}
        >
          <Lock className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-center">Estático</span>
        </button>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Configuración de Tiempo</label>
        <div className="flex gap-4">
           <div className="flex-1 space-y-2">
              <label className="text-xs text-zinc-400 font-medium flex items-center gap-2">
                 <Clock className="w-3.5 h-3.5" /> Horario (Opcional)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
           </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {DAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={cn(
                "w-10 h-10 rounded-full border text-[10px] font-black transition-all",
                frequency.includes(day.value)
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-700"
              )}
            >
              {day.label}
            </button>
          ))}
          <button
            type="button"
            onClick={setAllDays}
            className={cn(
              "px-3 h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
              frequency.length === 7
                ? "bg-zinc-800 border-zinc-700 text-zinc-100"
                : "bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-700"
            )}
          >
            Todos
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-zinc-400">
          {type === 'quantitative' ? '¿Qué quieres mejorar?' : type === 'static' ? '¿Qué hábito quieres mantener?' : '¿Qué habilidad quieres desarrollar?'}
        </label>
        <input
          id="name"
          type="text"
          placeholder={type === 'quantitative' ? "Ej. Hacer flexiones" : "Ej. Leer 20 páginas"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-bold"
          required
        />
      </div>
      
      {type === 'quantitative' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="metric" className="text-sm font-medium text-zinc-400">Métrica base</label>
            <input
              id="metric"
              type="number"
              min="1"
              step="any"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 font-bold focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="unit" className="text-sm font-medium text-zinc-400">Unidad</label>
            <input
              id="unit"
              type="text"
              placeholder="reps, kg, etc."
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 font-bold focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>
      )}

      {type === 'qualitative' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="context" className="text-sm font-medium text-zinc-400">Punto de partida</label>
            <textarea
              id="context"
              placeholder="Contexto para la IA..."
              value={initialContext}
              onChange={(e) => setInitialContext(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-purple-500 min-h-[80px] resize-none"
            />
          </div>
        </div>
      )}

      <div className="pt-4 flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} className="text-zinc-500 font-bold">
          Cancelar
        </Button>
        <Button type="submit" variant="default" className="px-8 font-black uppercase tracking-widest">
          Crear
        </Button>
      </div>
    </form>
  );
}
