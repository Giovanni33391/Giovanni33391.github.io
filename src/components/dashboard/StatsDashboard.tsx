import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, Trophy, Activity, Zap } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

interface StatsDashboardProps {
  stats: {
    totalCompoundedGrowth: number;
    bestStreak: number;
    weeklyActivity: { date: string; count: number }[];
    totalCompletions: number;
    masteryLevel: number;
  };
}

export const StatsDashboard = memo(function StatsDashboard({ stats }: StatsDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
      {/* Compound Growth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:col-span-2 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <TrendingUp className="w-24 h-24 text-emerald-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Impulso Total</span>
          </div>
          <h3 className="text-4xl font-black text-zinc-100 mb-1">
            +{stats.totalCompoundedGrowth.toFixed(1)}%
          </h3>
          <p className="text-zinc-500 text-sm font-medium">Mejora acumulada en todos tus hábitos</p>
        </div>
      </motion.div>

      {/* Mastery Level Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-xs font-bold text-zinc-500">NIVEL {stats.masteryLevel}</span>
        </div>
        <div>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Maestría</p>
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.totalCompletions % 10) * 10}%` }}
              className="h-full bg-purple-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Best Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between"
      >
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
          <Flame className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h4 className="text-2xl font-bold text-zinc-100">{stats.bestStreak}</h4>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Mejor Racha</p>
        </div>
      </motion.div>

      {/* Weekly Activity Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="md:col-span-4 p-6 rounded-3xl bg-zinc-900 border border-zinc-800"
      >
        <div className="flex items-center gap-2 mb-6 text-zinc-400">
          <Activity className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Actividad de la Semana</span>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weeklyActivity}>
              <XAxis
                dataKey="date"
                hide
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                itemStyle={{ color: '#10b981' }}
                labelStyle={{ display: 'none' }}
              />
              <Bar
                dataKey="count"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                minPointSize={4}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
});

StatsDashboard.displayName = 'StatsDashboard';
