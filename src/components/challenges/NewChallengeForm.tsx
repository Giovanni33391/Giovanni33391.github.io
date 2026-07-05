import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Zap, BarChart3, Info, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewChallengeFormProps {
  onSubmit: (
    name: string,
    initialMetric: number,
    unit: string,
    type: 'quantitative' | 'qualitative',
    frequency: number[],
    initialContext?: string,
    targetMetric?: number,
    targetGoal?: string
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
  const [type, setType] = useState<'quantitative' | 'qualitative'>('quantitative');
  const [frequency, setFrequency] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [initialContext, setInitialContext] = useState('');

  const estimatedDays = useMemo(() => {
    if (type === 'qualitative') return null;
    const current = Number(metric);
    const target = Number(targetMetric);
    if (!current || !target || target <= current) return null;

    // Formula for compound growth: target = current * (1.01)^n
    // n = log(target/current) / log(1.01)
    const days = Math.log(target / current) / Math.log(1.01);
    const roundedDays = Math.ceil(days);

    if (roundedDays > 365) return "un año o más";
    return roundedDays;
  }, [metric, targetMetric, type]);

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
    if (!name.trim() || !metric || !unit.trim() || frequency.length === 0) return;
    
    onSubmit(
      name.trim(),
      Number(metric),
      unit.trim(),
      type,
      frequency,
      type === 'qualitative' ? initialContext.trim() : undefined,
      type === 'quantitative' && targetMetric ? Number(targetMetric) : undefined,
      type === 'qualitative' && targetGoal ? targetGoal.trim() : undefined
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

      <div className="space-y-4">
        <label className="text-sm font-medium text-zinc-400">Frecuencia</label>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={cn(
                "w-10 h-10 rounded-full border text-xs font-bold transition-all",
                frequency.includes(day.value)
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
              )}
            >
              {day.label}
            </button>
          ))}
          <button
            type="button"
            onClick={setAllDays}
            className={cn(
              "px-3 h-10 rounded-xl border text-xs font-bold transition-all",
              frequency.length === 7
                ? "bg-zinc-800 border-zinc-700 text-zinc-100"
                : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
            )}
          >
            Todos los días
          </button>
        </div>
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

          <div className="col-span-2 space-y-2">
            <label htmlFor="targetMetric" className="text-sm font-medium text-zinc-400">
              Meta final (Opcional)
            </label>
            <input
              id="targetMetric"
              type="number"
              min="1"
              step="any"
              placeholder="Ej. 30"
              value={targetMetric}
              onChange={(e) => setTargetMetric(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          {estimatedDays && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="col-span-2 flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            >
              <Clock className="w-5 h-5" />
              <div className="text-sm font-bold uppercase tracking-tight">
                Tiempo estimado: <span className="text-white ml-1">{estimatedDays} {!isNaN(Number(estimatedDays)) ? 'días' : ''}</span>
              </div>
            </motion.div>
          )}
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
          <div className="space-y-2">
            <label htmlFor="context" className="text-sm font-medium text-zinc-400">
              ¿Cuál es tu punto de partida actual?
            </label>
            <textarea
              id="context"
              placeholder="Ej. Actualmente camino 10 minutos o ya conozco los acordes básicos de la guitarra."
              value={initialContext}
              onChange={(e) => setInitialContext(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="targetGoal" className="text-sm font-medium text-zinc-400">
              ¿Cuál es tu meta final? (Opcional)
            </label>
            <input
              id="targetGoal"
              type="text"
              placeholder="Ej. Tocar un solo de blues con fluidez"
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
            />
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 text-xs text-purple-300/80 leading-relaxed">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="mb-2">La IA generará tareas un 1% más desafiantes cada día basadas en tu objetivo y punto de partida.</p>
              <div className="flex items-center gap-1.5 text-purple-400 font-bold uppercase tracking-tight">
                <Calendar className="w-3.5 h-3.5" />
                La IA estimará el tiempo para tu meta
              </div>
            </div>
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
