import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Challenge } from '@/types';
import { cn } from '@/lib/utils';
import { Clock, Plus, Zap, BarChart3, Lock } from 'lucide-react';

interface ScheduleGridProps {
  challenges: Challenge[];
  onChallengeClick: (challenge: Challenge) => void;
  onAddClick: () => void;
}

export const ScheduleGrid = ({ challenges, onChallengeClick, onAddClick }: ScheduleGridProps) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const challengesWithTime = useMemo(() => {
    return challenges.filter(c => c.startTime);
  }, [challenges]);

  const unscheduledChallenges = useMemo(() => {
    return challenges.filter(c => !c.startTime);
  }, [challenges]);

  const getPositionForTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60 + minutes) * (100 / 1440); // Percentage of the day
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Timeline Grid */}
      <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-6 lg:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -z-10" />

        <div className="flex items-center justify-between mb-10">
          <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
             <Clock className="w-5 h-5 text-emerald-500" />
             Horarios de Hoy
          </h3>
          <button
            onClick={onAddClick}
            className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-emerald-500 hover:text-zinc-950 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative space-y-4">
          {hours.map(hour => (
            <div key={hour} className="group flex items-start gap-4">
              <div className="w-12 text-[10px] font-black text-zinc-700 group-hover:text-zinc-500 transition-colors uppercase tracking-widest pt-1">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="flex-1 h-px bg-zinc-800/50 mt-3 group-hover:bg-zinc-800 transition-colors relative">
                {/* Challenges at this hour */}
                <div className="absolute top-[-16px] left-0 right-0 flex flex-wrap gap-2 pointer-events-none">
                  {challengesWithTime
                    .filter(c => parseInt(c.startTime!.split(':')[0]) === hour)
                    .map(challenge => (
                      <motion.button
                        key={challenge.id}
                        layoutId={challenge.id}
                        onClick={() => onChallengeClick(challenge)}
                        className={cn(
                          "pointer-events-auto h-8 px-4 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all shadow-xl",
                          challenge.type === 'static' ? "bg-zinc-800 border-zinc-700 text-zinc-300" :
                          challenge.type === 'qualitative' ? "bg-purple-500/10 border-purple-500/30 text-purple-400" :
                          "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        )}
                      >
                        {challenge.type === 'static' ? <Lock className="w-3 h-3" /> :
                         challenge.type === 'qualitative' ? <Zap className="w-3 h-3 fill-current" /> :
                         <BarChart3 className="w-3 h-3" />}
                        {challenge.name}
                        <span className="opacity-40">{challenge.startTime}</span>
                      </motion.button>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unscheduled Section */}
      <div className="lg:w-80 space-y-6">
        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] pl-2">Sin Horario Fijo</h4>
        <div className="grid grid-cols-1 gap-3">
           {unscheduledChallenges.map(challenge => (
             <motion.button
               key={challenge.id}
               layoutId={challenge.id}
               onClick={() => onChallengeClick(challenge)}
               className={cn(
                 "w-full p-5 rounded-[2rem] border text-left flex items-center justify-between group hover:shadow-2xl transition-all",
                 challenge.type === 'static' ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700" :
                 challenge.type === 'qualitative' ? "bg-purple-500/5 border-purple-500/10 hover:border-purple-500/30" :
                 "bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30"
               )}
             >
               <div>
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-widest mb-1",
                    challenge.type === 'static' ? "text-zinc-600" :
                    challenge.type === 'qualitative' ? "text-purple-400" :
                    "text-emerald-400"
                  )}>{challenge.type}</p>
                  <p className="font-black text-white">{challenge.name}</p>
               </div>
               <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-700 group-hover:text-emerald-500 transition-colors">
                  <Plus className="w-5 h-5" />
               </div>
             </motion.button>
           ))}
           {unscheduledChallenges.length === 0 && (
             <div className="p-8 rounded-[2rem] border-2 border-dashed border-zinc-800 text-center">
                <p className="text-xs font-bold text-zinc-600 italic">Todos tus desafíos están agendados.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
