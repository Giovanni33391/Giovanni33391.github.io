import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Zap, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Challenge } from '@/types';

interface StatsDashboardProps {
  challenges: Challenge[];
}

export function StatsDashboard({ challenges }: StatsDashboardProps) {
  // Calculate Total Impulse (Aggregated growth)
  const totalImpulse = challenges.reduce((acc, c) => {
    const growth = ((c.currentMetric - c.initialMetric) / (c.initialMetric || 1)) * 100;
    return acc + Math.max(0, growth);
  }, 0);

  // Mastery Level (based on consistency/streaks)
  const totalStreak = challenges.reduce((acc, c) => acc + c.streak, 0);
  const masteryLevel = Math.floor(totalStreak / 10) + 1;

  // Mock data for weekly activity (in a real app this would come from challenge_logs)
  const weeklyData = [
    { name: 'Lun', completed: 2 },
    { name: 'Mar', completed: 5 },
    { name: 'Mie', completed: 3 },
    { name: 'Jue', completed: 4 },
    { name: 'Vie', completed: 6 },
    { name: 'Sab', completed: 2 },
    { name: 'Dom', completed: 1 },
  ];

  return (
    <div className="space-y-6 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Impulse */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Impulso Total</p>
            <h4 className="text-2xl font-black text-zinc-100">+{totalImpulse.toFixed(1)}%</h4>
          </div>
        </motion.div>

        {/* Mastery Level */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Nivel de Maestría</p>
            <h4 className="text-2xl font-black text-zinc-100">Lvl {masteryLevel}</h4>
          </div>
        </motion.div>

        {/* Best Streak */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Mejor Racha</p>
            <h4 className="text-2xl font-black text-zinc-100">
              {Math.max(0, ...challenges.map(c => c.streak))} días
            </h4>
          </div>
        </motion.div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-4 h-4 text-zinc-500" />
          <h5 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Actividad Semanal</h5>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 4 ? '#10b981' : '#27272a'}
                  />
                ))}
              </Bar>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 12 }}
                dy={10}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
