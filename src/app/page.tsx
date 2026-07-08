"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, LogIn, LogOut, LayoutGrid, List } from 'lucide-react';
import { useOnePercent } from '@/hooks/useOnePercent';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/challenges/EmptyState';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { NewChallengeForm } from '@/components/challenges/NewChallengeForm';
import { StatsDashboard } from '@/components/dashboard/StatsDashboard';
import { TrainingSection } from '@/components/training/TrainingSection';
import { FinanceSection } from '@/components/finance/FinanceSection';
import { CleaningSection } from '@/components/cleaning/CleaningSection';
import { ScheduleGrid } from '@/components/challenges/ScheduleGrid';
import { ChallengeModal } from '@/components/challenges/ChallengeModal';
import { ProModal } from '@/components/ui/ProModal';
import { LandingPage } from '@/components/landing/LandingPage';
import { AuthModal } from '@/components/auth/AuthModal';
import { Challenge } from '@/types';
import posthog from 'posthog-js';

export default function Home() {
  const { 
    challenges, 
    isLoaded, 
    user,
    signOut,
    stats,
    addChallenge, 
    completeChallenge, 
    deleteChallenge, 
    refreshChallengeTask,
    isToday 
  } = useOnePercent();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'habits' | 'training' | 'finance' | 'cleaning' | 'stats'>('habits');
  const [habitsView, setHabitsView] = useState<'grid' | 'list'>('grid');
  
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

  const MAX_FREE_CHALLENGES = 3;

  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());

  const DAYS = [
    { label: 'Dom', value: 0 },
    { label: 'Lun', value: 1 },
    { label: 'Mar', value: 2 },
    { label: 'Mié', value: 3 },
    { label: 'Jue', value: 4 },
    { label: 'Vie', value: 5 },
    { label: 'Sáb', value: 6 },
  ];

  const handleCreateChallenge = (
    name: string,
    initialMetric: number,
    unit: string,
    type: 'quantitative' | 'qualitative' | 'static',
    frequency: number[],
    initialContext?: string,
    targetMetric?: number,
    targetGoal?: string,
    startTime?: string
  ) => {
    addChallenge(name, initialMetric, unit, type, frequency, initialContext, targetMetric, targetGoal, startTime);
    posthog.capture('challenge_created', { name, unit, type, frequency, initialContext, targetMetric, targetGoal, start_time: startTime });
    setIsModalOpen(false);
  };
  
  const handleOpenNewChallenge = () => {
    if (challenges.length >= MAX_FREE_CHALLENGES) {
      setIsProModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  }

  const handleCompleteChallenge = (id: string, manualMetric?: number) => {
    completeChallenge(id, manualMetric);
    posthog.capture('habit_completed', { challenge_id: id, manual_metric: manualMetric });
  }

  const handleRefreshChallenge = (id: string) => {
    refreshChallengeTask(id);
    posthog.capture('habit_task_refreshed', { challenge_id: id });
  }

  const handleChallengeClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsChallengeModalOpen(true);
  };

  const filteredChallenges = challenges.filter(challenge =>
    (challenge.frequency || [0, 1, 2, 3, 4, 5, 6]).includes(selectedDay)
  );

  if (!isLoaded) return null;

  if (!user && challenges.length === 0 && !isGuestMode) {
    return (
      <>
        <LandingPage
          onGetStarted={() => setIsGuestMode(true)}
          onSignIn={() => setIsAuthModalOpen(true)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-12"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">OnePercent</h1>
            <p className="text-sm text-zinc-400 font-medium tracking-wide uppercase">Crecimiento Compuesto</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button onClick={signOut} variant="ghost" size="sm" className="text-zinc-400 hover:text-red-400">
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsAuthModalOpen(true)} variant="default" size="sm">
              <LogIn className="w-4 h-4 mr-2" />
              Sincronizar
            </Button>
          )}
        </div>
      </motion.header>

      {/* Persistent Nav Switcher */}
      <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-2xl mb-12 w-full max-w-4xl mx-auto overflow-x-auto no-scrollbar">
        {(['habits', 'training', 'finance', 'cleaning', 'stats'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
              activeTab === tab
                ? "bg-emerald-500 text-zinc-950 shadow-lg"
                : "text-zinc-500 hover:text-zinc-200"
            )}
          >
            {tab === 'habits' ? 'Hábitos' : tab === 'training' ? 'Entrenamiento' : tab === 'finance' ? 'Finanzas' : tab === 'cleaning' ? 'Limpieza' : 'Stats'}
          </button>
        ))}
      </div>

      <div className="relative">
        {activeTab === 'habits' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                  {DAYS.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => setSelectedDay(day.value)}
                      className={cn(
                        "flex-shrink-0 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border",
                        selectedDay === day.value
                          ? "bg-emerald-500 border-emerald-500 text-zinc-950"
                          : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      )}
                    >
                      {day.label}
                    </button>
                  ))}
               </div>

               <div className="flex items-center gap-3">
                  <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <button
                      onClick={() => setHabitsView('grid')}
                      className={cn("p-2 rounded-lg transition-all", habitsView === 'grid' ? "bg-zinc-800 text-emerald-500" : "text-zinc-600")}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setHabitsView('list')}
                      className={cn("p-2 rounded-lg transition-all", habitsView === 'list' ? "bg-zinc-800 text-emerald-500" : "text-zinc-600")}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  <Button onClick={handleOpenNewChallenge} size="sm" className="font-black text-[10px] uppercase tracking-widest py-3">
                    <Plus className="w-3.5 h-3.5 mr-2" />
                    Nuevo Desafío
                  </Button>
               </div>
            </div>

            {filteredChallenges.length === 0 ? (
              <EmptyState onCreateClick={handleOpenNewChallenge} />
            ) : habitsView === 'grid' ? (
              <ScheduleGrid
                challenges={filteredChallenges}
                onChallengeClick={handleChallengeClick}
                onAddClick={handleOpenNewChallenge}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onComplete={handleCompleteChallenge}
                    onDelete={deleteChallenge}
                    onRefresh={handleRefreshChallenge}
                    isToday={isToday}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'training' && <TrainingSection />}
        {activeTab === 'finance' && <FinanceSection />}
        {activeTab === 'cleaning' && <CleaningSection />}
        {activeTab === 'stats' && (
           <div className="space-y-8">
              {stats && <StatsDashboard stats={stats} />}
              {challenges.length === 0 && (
                <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-zinc-800 border-dashed text-center">
                  <p className="text-zinc-500 font-medium">Crea tu primer hábito para ver tus estadísticas.</p>
                </div>
              )}
           </div>
        )}
      </div>

      {/* Challenge Modal (Expanded View for Grid) */}
      <ChallengeModal
        challenge={selectedChallenge}
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        onComplete={handleCompleteChallenge}
        onDelete={deleteChallenge}
        onRefresh={handleRefreshChallenge}
        isToday={isToday}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nuevo Desafío">
        <NewChallengeForm onSubmit={handleCreateChallenge} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <ProModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />

      {!user && (challenges.length > 0 || isGuestMode) && (
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      )}
    </main>
  );
}
