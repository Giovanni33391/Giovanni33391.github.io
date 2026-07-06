import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { WorkoutSession } from '@/types';
import { TrendingUp, Award, Activity } from 'lucide-react';

interface TrainingStatsProps {
  sessions: WorkoutSession[];
}

export const TrainingStats = ({ sessions }: TrainingStatsProps) => {
  const chartData = [...sessions].reverse().map(s => ({
    date: new Date(s.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
    volume: s.totalVolume
  }));

  const totalVolume = sessions.reduce((acc, s) => acc + s.totalVolume, 0);
  const avgDuration = sessions.length > 0
    ? Math.floor(sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length / 60)
    : 0;

  // Find Personal Records (PRs)
  const exerciseMaxMap = new Map<string, { weight: number; unit: string }>();

  sessions.forEach(session => {
    session.exercises.forEach(ex => {
      const maxWeight = Math.max(...ex.sets.map(s => s.weight));
      const existing = exerciseMaxMap.get(ex.name);
      if (!existing || maxWeight > existing.weight) {
        exerciseMaxMap.set(ex.name, { weight: maxWeight, unit: ex.unit });
      }
    });
  });

  const topPrs = Array.from(exerciseMaxMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Volumen Total</span>
          </div>
          <div className="text-2xl font-black text-white">
            {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}
            <span className="text-xs text-zinc-500 ml-1">kg</span>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl">
          <div className="flex items-center gap-2 text-purple-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Duración Media</span>
          </div>
          <div className="text-2xl font-black text-white">
            {avgDuration}
            <span className="text-xs text-zinc-500 ml-1">min</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      {sessions.length >= 2 && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem]">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Progresión de Volumen</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#3f3f46"
                  fontSize={10}
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorVolume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* PRs */}
      {topPrs.length > 0 && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-[2rem]">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-emerald-500" />
            <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest">Records Personales (PR)</h3>
          </div>
          <div className="space-y-4">
            {topPrs.map((pr, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-300">{pr.name}</span>
                <div className="text-lg font-black text-white">
                  {pr.weight} <span className="text-xs text-zinc-500">{pr.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
