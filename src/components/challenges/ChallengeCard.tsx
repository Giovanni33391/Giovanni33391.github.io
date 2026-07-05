import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Flame, TrendingUp, Trash2, Zap, Sparkles, Target } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import { Challenge } from '@/types';
import { formatMetric, calculateCompoundedMetric, cn } from '@/lib/utils';
import { Button } from '../ui/Button';

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  isToday: (date: string | null) => boolean;
}

export function ChallengeCard({ challenge, onComplete, onDelete, isToday }: ChallengeCardProps) {
  const [mounted, setMounted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const completedToday = isToday(challenge.lastCompletedDate);
  const isQualitative = challenge.type === 'qualitative';

  const daysToTarget = useMemo(() => {
    if (isQualitative) return challenge.estimatedDays;
    if (!challenge.targetMetric || challenge.targetMetric <= challenge.currentMetric) return null;

    // Formula for compound growth: target = current * (1.01)^n
    // n = log(target/current) / log(1.01)
    const days = Math.log(challenge.targetMetric / challenge.currentMetric) / Math.log(1.01);
    const roundedDays = Math.ceil(days);

    if (roundedDays > 365) return "un año o más";
    return roundedDays;
  }, [challenge.currentMetric, challenge.targetMetric, challenge.estimatedDays, isQualitative]);
  
  const handleComplete = async () => {
    if (completedToday || isCompleting) return;
    
    setIsCompleting(true);

    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: isQualitative ? ['#a855f7', '#8b5cf6', '#7c3aed'] : ['#34d399', '#10b981', '#059669']
    });
    
    try {
      await onComplete(challenge.id);
    } finally {
      setIsCompleting(false);
    }
  };

  // Generate mock chart data projecting 30 days of 1% growth
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

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "bg-zinc-900 border rounded-2xl overflow-hidden group hover:shadow-2xl transition-all relative",
        isQualitative
          ? "border-purple-500/20 hover:border-purple-500/40 hover:shadow-purple-500/5"
          : "border-zinc-800 hover:border-zinc-700 hover:shadow-emerald-500/5"
      )}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-zinc-100">{challenge.name}</h3>
              {isQualitative && <Zap className="w-4 h-4 text-purple-400" />}
            </div>
            <div className={cn(
              "flex items-center text-sm font-medium",
              isQualitative ? "text-purple-400" : "text-emerald-400"
            )}>
              <Flame className="w-4 h-4 mr-1.5" />
              Racha: {challenge.streak} {challenge.streak === 1 ? 'día' : 'días'}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(challenge.id)}
            className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Eliminar desafío"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {isQualitative ? (
          <div className="mb-8 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <p className="text-[10px] uppercase font-bold text-purple-400 tracking-widest mb-2">Próximo paso IA (1%)</p>
            <p className="text-zinc-100 font-medium leading-relaxed">
              {challenge.nextTask || 'Generando tu próximo desafío...'}
            </p>
            {daysToTarget && (
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-purple-400/80 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Faltan aprox. {daysToTarget} {!isNaN(Number(daysToTarget)) ? 'días' : ''}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Objetivo de hoy</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-zinc-100 tracking-tight">
                  {formatMetric(challenge.currentMetric)}
                </span>
                <span className="text-zinc-500 font-medium">{challenge.unit}</span>
              </div>
              {daysToTarget && (
                <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-500/80 uppercase tracking-wider">
                  <Target className="w-3 h-3" />
                  Meta: {challenge.targetMetric} — Faltan {daysToTarget} {!isNaN(Number(daysToTarget)) ? 'días' : ''}
                </div>
              )}
            </div>
          </div>
        )}

        <Button 
          variant={completedToday ? "success" : (isQualitative ? "default" : "default")}
          size="lg" 
          className={cn(
            "w-full relative overflow-hidden",
            !completedToday && isQualitative && "bg-purple-600 hover:bg-purple-500 border-none"
          )}
          onClick={handleComplete}
          disabled={completedToday}
        >
          {completedToday ? (
            <span className="flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Completado por hoy
            </span>
          ) : (
            isQualitative ? "¡Hecho!" : "Completar 1% de hoy"
          )}
        </Button>
      </div>

      {!isQualitative && (
        <div className="h-24 w-full mt-2 opacity-30 group-hover:opacity-50 transition-opacity">
          <div className="absolute bottom-24 left-6 flex items-center text-xs font-medium text-emerald-500/80">
            <TrendingUp className="w-3 h-3 mr-1" />
            Proyección a 30 días
          </div>
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
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#color-${challenge.id})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
