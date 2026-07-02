import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Flame, TrendingUp, Trash2 } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import confetti from 'canvas-confetti';
import { Challenge } from '@/types';
import { formatMetric, calculateCompoundedMetric } from '@/lib/utils';
import { Button } from '../ui/Button';

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  isToday: (date: string | null) => boolean;
}

export function ChallengeCard({ challenge, onComplete, onDelete, isToday }: ChallengeCardProps) {
  const completedToday = isToday(challenge.lastCompletedDate);
  
  const handleComplete = () => {
    if (completedToday) return;
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#34d399', '#10b981', '#059669'] // Emerald shades
    });
    
    onComplete(challenge.id);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/5 hover:border-zinc-700 transition-all relative"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-zinc-100 mb-1">{challenge.name}</h3>
            <div className="flex items-center text-emerald-400 text-sm font-medium">
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

        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm text-zinc-400 mb-1">Objetivo de hoy</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-zinc-100 tracking-tight">
                {formatMetric(challenge.currentMetric)}
              </span>
              <span className="text-zinc-500 font-medium">{challenge.unit}</span>
            </div>
          </div>
        </div>

        <Button 
          variant={completedToday ? "success" : "default"} 
          size="lg" 
          className="w-full relative overflow-hidden"
          onClick={handleComplete}
          disabled={completedToday}
        >
          {completedToday ? (
            <span className="flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Completado por hoy
            </span>
          ) : (
            "Completar 1% de hoy"
          )}
        </Button>
      </div>

      {/* 30-day projection chart */}
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
    </motion.div>
  );
}
