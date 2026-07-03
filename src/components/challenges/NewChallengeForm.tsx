import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BarChart2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface NewChallengeFormProps {
  onSubmit: (
    type: 'quantitative' | 'qualitative',
    name: string,
    initialMetric: number,
    unit: string,
    goalDescription: string,
    initialTasks: { id: string; task: string }[]
  ) => void;
  onCancel: () => void;
}

export function NewChallengeForm({ onSubmit, onCancel }: NewChallengeFormProps) {
  const [type, setType] = useState<'quantitative' | 'qualitative'>('quantitative');
  const [name, setName] = useState('');
  
  // Quant
  const [metric, setMetric] = useState('');
  const [unit, setUnit] = useState('');
  
  // Qual
  const [goalDescription, setGoalDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (type === 'quantitative') {
      if (!metric || !unit.trim()) return;
      onSubmit('quantitative', name.trim(), Number(metric), unit.trim(), '', []);
    } else {
      if (!goalDescription.trim()) return;
      
      setIsGenerating(true);
      try {
        const response = await fetch('/api/generate-micro-tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal: goalDescription.trim() }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate tasks');
        }

        const data = await response.json();
        onSubmit('qualitative', name.trim(), 0, '', goalDescription.trim(), data.tasks);
      } catch (err) {
        console.error(err);
        alert("Ocurrió un error conectando con la IA. Por favor intenta de nuevo.");
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Type Toggle */}
      <div className="flex p-1 bg-zinc-950 border border-zinc-800 rounded-xl relative">
        <button
          type="button"
          onClick={() => setType('quantitative')}
          className={`flex-1 relative py-2 text-sm font-medium z-10 transition-colors ${type === 'quantitative' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <BarChart2 className="w-4 h-4" />
            Medible
          </div>
        </button>
        <button
          type="button"
          onClick={() => setType('qualitative')}
          className={`flex-1 relative py-2 text-sm font-medium z-10 transition-colors ${type === 'qualitative' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Guiado por IA
          </div>
        </button>
        {/* Animated Background Pill */}
        <motion.div
          className="absolute inset-y-1 w-[calc(50%-4px)] bg-zinc-800 rounded-lg shadow-sm"
          initial={false}
          animate={{ x: type === 'quantitative' ? '4px' : 'calc(100% + 4px)' }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="generating"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center py-10 space-y-4"
          >
            <div className="relative w-12 h-12">
               <motion.div
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                 className="absolute inset-0 rounded-full border-t-2 border-emerald-500 opacity-70"
               />
               <Sparkles className="absolute inset-0 m-auto text-emerald-400 animate-pulse w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-zinc-300 animate-pulse">Analizando tu objetivo...</p>
            <p className="text-xs text-zinc-500">Diseñando tu plan de 1%.</p>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0, x: type === 'quantitative' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: type === 'quantitative' ? 20 : -20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-zinc-400">
                Nombre corto del hábito
              </label>
              <input
                id="name"
                type="text"
                placeholder={type === 'quantitative' ? "Ej. Hacer flexiones" : "Ej. Aprender React"}
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
              <div className="space-y-2">
                <label htmlFor="goal" className="text-sm font-medium text-zinc-400">
                  ¿Cuál es tu objetivo final?
                </label>
                <textarea
                  id="goal"
                  rows={3}
                  placeholder="Ej. Quiero aprender a crear aplicaciones web interactivas y entender los hooks."
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
                  required
                />
              </div>
            )}

            <div className="pt-4 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" variant="default">
                {type === 'quantitative' ? 'Crear Desafío' : 'Generar Misiones'}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
