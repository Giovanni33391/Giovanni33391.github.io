import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Flame, TrendingUp, Trash2, Zap, Sparkles, Target, RotateCcw, Plus, Minus, ArrowRight } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import { Challenge } from '@/types';
import { formatMetric, calculateCompoundedMetric, cn } from '@/lib/utils';
import { Button } from '../ui/Button';

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete: (id: string, manualMetric?: number) => void;
  onDelete: (id: string) => void;
  onRefresh?: (id: string) => void;
  isToday: (date: string | null) => boolean;
}

export const ChallengeCard = React.memo(({ challenge, onComplete, onDelete, onRefresh, isToday }: ChallengeCardProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualMetric, setManualMetric] = useState<number>(0);

  const completedToday = isToday(challenge.lastCompletedDate);
  const isQualitative = challenge.type === 'qualitative';

  const daysToTarget = useMemo(() => {
    if (challenge.estimatedDays) return challenge.estimatedDays;
    if (!challenge.targetMetric || challenge.targetMetric <= challenge.currentMetric) return null;

    const days = Math.log(challenge.targetMetric / challenge.currentMetric) / Math.log(1.01);
    const roundedDays = Math.ceil(days);

    if (roundedDays > 365) return "un año o más";
    return roundedDays;
  }, [challenge.currentMetric, challenge.targetMetric, challenge.estimatedDays]);

  const recommendedNext = useMemo(() => {
     return Number((challenge.currentMetric * 1.01).toFixed(2));
  }, [challenge.currentMetric]);

  React.useEffect(() => {
    if (showManualEntry) setManualMetric(recommendedNext);
  }, [showManualEntry, recommendedNext]);
  
  const handleComplete = async (finalMetric?: number) => {
    if (completedToday || isCompleting) return;
    
    setIsCompleting(true);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: isQualitative ? ['#a855f7', '#8b5cf6', '#7c3aed'] : ['#34d399', '#10b981', '#059669']
    });
    
    try {
      await onComplete(challenge.id, finalMetric);
      setShowManualEntry(false);
    } finally {
      setIsCompleting(false);
    }
  };

  const chartData = useMemo(() => {
    const data = [];
    const baseMetric = challenge.initialMetric;
    for (let i = 0; i <= 30; i++) {
      data.push({
        day: i,
        value: calculateCompoundedMetric(baseMetric, i)
      });
    }
    return data;
  }, [challenge.initialMetric]);

  const daysToTargetLabel = useMemo(() => {
    if (!daysToTarget) return null;
    if (daysToTarget === "un año o más") return daysToTarget;
    const num = Number(daysToTarget);
    return `faltan aprox. ${num} ${num === 1 ? 'día' : 'días'}`;
  }, [daysToTarget]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-zinc-900 border rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all relative",
        isQualitative
          ? "border-purple-500/20 hover:border-purple-500/40"
          : "border-zinc-800 hover:border-emerald-500/20"
      )}
    >
      <div className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-black text-white tracking-tight">{challenge.name}</h3>
              {isQualitative && <Zap className="w-4 h-4 text-purple-400 fill-current" />}
            </div>
            <div className={cn(
              "flex items-center text-xs font-black uppercase tracking-widest",
              isQualitative ? "text-purple-400" : "text-emerald-400"
            )}>
              <Flame className="w-4 h-4 mr-1.5 fill-current" />
              {challenge.streak} {challenge.streak === 1 ? 'Día' : 'Días'} de racha
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(challenge.id)}
            className="text-zinc-700 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>

        {/* AI Task Section - Only for Qualitative */}
        {isQualitative && (
          <div className="mb-8 p-6 bg-purple-500/5 border border-purple-500/10 rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Sparkles className="w-10 h-10 text-purple-400" />
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-purple-400">Próximo Paso IA</p>
                {challenge.isRefreshing && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
              </div>
              {onRefresh && (
                <button onClick={() => onRefresh(challenge.id)} disabled={challenge.isRefreshing} className="p-1 text-purple-400/50 hover:text-purple-400 transition-colors">
                  <RotateCcw className={cn("w-3.5 h-3.5", challenge.isRefreshing && "animate-spin")} />
                </button>
              )}
            </div>

            <p className="text-zinc-100 font-bold leading-relaxed mb-4">
              {challenge.nextTask || 'Diseñando evolución...'}
            </p>

            {daysToTargetLabel && (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-400/70">
                <Target className="w-3.5 h-3.5" />
                {daysToTargetLabel}
              </div>
            )}
          </div>
        )}

        {!isQualitative && (
          <div className="space-y-8 mb-10">
            <div className="flex items-baseline justify-between border-b border-zinc-800 pb-6">
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Métrica Actual</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-white tracking-tighter">
                    {formatMetric(challenge.currentMetric)}
                  </span>
                  <span className="text-zinc-500 font-bold text-lg uppercase">{challenge.unit}</span>
                </div>
              </div>
              {daysToTargetLabel && (
                <div className="text-right">
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Objetivo</p>
                   <p className="text-xs font-bold text-zinc-400">{daysToTargetLabel}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {showManualEntry && !completedToday ? (
            <motion.div
              key="manual-entry"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
               <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] space-y-4">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] text-center">¿Cuánto has logrado hoy?</p>
                  <div className="flex items-center justify-between">
                     <button onClick={() => setManualMetric(m => Math.max(0, m - 1))} className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors">
                        <Minus className="w-5 h-5" />
                     </button>
                     <div className="text-center flex-1 px-4">
                        <input
                          type="number"
                          value={manualMetric}
                          onChange={(e) => setManualMetric(parseFloat(e.target.value))}
                          className="w-full bg-transparent text-4xl font-black text-white text-center focus:outline-none tabular-nums"
                        />
                        <p className="text-[10px] font-black text-zinc-500 uppercase mt-1">{challenge.unit}</p>
                     </div>
                     <button onClick={() => setManualMetric(m => m + 1)} className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors">
                        <Plus className="w-5 h-5" />
                     </button>
                  </div>
                  <div className="pt-2 flex justify-center gap-2">
                     <button onClick={() => setManualMetric(recommendedNext)} className="text-[10px] font-black text-zinc-500 hover:text-emerald-500 transition-colors uppercase tracking-widest underline underline-offset-4">
                        Resetear a sugerido (+1%)
                     </button>
                  </div>
               </div>

               <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setShowManualEntry(false)} className="flex-1 rounded-2xl text-zinc-500 py-6">Cancelar</Button>
                  <Button onClick={() => handleComplete(manualMetric)} className="flex-[2] rounded-2xl bg-emerald-500 text-zinc-950 font-black py-6 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    CONFIRMAR
                  </Button>
               </div>
            </motion.div>
          ) : (
            <motion.div
              key="main-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Button
                variant={completedToday ? "success" : "default"}
                size="lg"
                className={cn(
                  "w-full py-7 rounded-[2rem] font-black text-lg transition-all",
                  !completedToday && isQualitative && "bg-purple-600 hover:bg-purple-500 border-none shadow-lg shadow-purple-500/20",
                  !completedToday && !isQualitative && "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20"
                )}
                onClick={() => isQualitative ? handleComplete() : setShowManualEntry(true)}
                disabled={completedToday}
              >
                {completedToday ? (
                  <span className="flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 mr-3" />
                    COMPLETADO
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    {isQualitative ? "¡LISTO!" : "REGISTRAR PROGRESO"}
                    {!isQualitative && <ArrowRight className="w-5 h-5 ml-2" />}
                  </span>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isQualitative && (
        <div className="h-32 w-full mt-4 opacity-20 group-hover:opacity-40 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`color-${challenge.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#color-${challenge.id})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
});

ChallengeCard.displayName = 'ChallengeCard';
