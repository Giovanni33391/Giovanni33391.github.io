"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, LogIn, LogOut } from 'lucide-react';
import { useOnePercent } from '@/hooks/useOnePercent';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/challenges/EmptyState';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { NewChallengeForm } from '@/components/challenges/NewChallengeForm';
import { StatsDashboard } from '@/components/dashboard/StatsDashboard';
import { ProModal } from '@/components/ui/ProModal';
import { LandingPage } from '@/components/landing/LandingPage';
import { AuthModal } from '@/components/auth/AuthModal';
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
    refreshChallengeTask,
    deleteChallenge, 
    isToday 
  } = useOnePercent();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  
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
    type: 'quantitative' | 'qualitative',
    frequency: number[],
    initialContext?: string,
    targetMetric?: number,
    targetGoal?: string
  ) => {
    addChallenge(name, initialMetric, unit, type, frequency, initialContext, targetMetric, targetGoal);
    posthog.capture('challenge_created', { name, unit, type, frequency, initialContext, targetMetric, targetGoal });
    setIsModalOpen(false);
  };
  
  const handleOpenNewChallenge = () => {
    if (challenges.length >= MAX_FREE_CHALLENGES) {
      setIsProModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  }

  const handleCompleteChallenge = (id: string) => {
    completeChallenge(id);
    posthog.capture('habit_completed', { challenge_id: id });
  }

  const filteredChallenges = challenges.filter(challenge =>
    (challenge.frequency || [0, 1, 2, 3, 4, 5, 6]).includes(selectedDay)
  );

  // Prevent hydration mismatch by returning null until loaded
  if (!isLoaded) return null;

  // Show landing page if user is not logged in AND has no challenges AND not in guest mode
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
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
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
          {!user && challenges.length > 0 && (
            <Button onClick={handleOpenNewChallenge} className="hidden sm:flex" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Desafío
            </Button>
          )}
          {user ? (
            <>
              <Button onClick={handleOpenNewChallenge} className="hidden sm:flex" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Desafío
              </Button>
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

      {/* Stats Section */}
      {stats && (
        <StatsDashboard stats={stats} />
      )}

      {/* Day Selector Tabs */}
      {challenges.length > 0 && (
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2 no-scrollbar">
          {DAYS.map((day) => (
            <button
              key={day.value}
              onClick={() => setSelectedDay(day.value)}
              className={cn(
                "flex-shrink-0 px-6 py-3 rounded-2xl font-bold transition-all border",
                selectedDay === day.value
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
              )}
            >
              {day.label}
              {day.value === new Date().getDay() && (
                <span className="ml-2 w-1.5 h-1.5 rounded-full bg-current inline-block" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      {challenges.length === 0 ? (
        <EmptyState onCreateClick={handleOpenNewChallenge} />
      ) : filteredChallenges.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center"
        >
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
            <Target className="w-8 h-8 text-zinc-700" />
          </div>
          <h3 className="text-zinc-100 font-bold text-lg mb-2">No hay desafíos para este día</h3>
          <p className="text-zinc-500 max-w-xs mx-auto">Selecciona otro día o crea uno nuevo para mejorar un 1% hoy.</p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredChallenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <ChallengeCard 
                challenge={challenge}
                onComplete={handleCompleteChallenge}
                onDelete={deleteChallenge}
                onRefreshTask={refreshChallengeTask}
                isToday={isToday}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Mobile FAB */}
      {challenges.length > 0 && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 sm:hidden z-40"
        >
          <Button 
            size="icon" 
            className="w-14 h-14 rounded-full shadow-2xl"
            onClick={handleOpenNewChallenge}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      )}

      {/* Modal for New Challenge */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Desafío"
      >
        <NewChallengeForm 
          onSubmit={handleCreateChallenge}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ProModal 
        isOpen={isProModalOpen} 
        onClose={() => setIsProModalOpen(false)} 
      />

      {!user && challenges.length > 0 && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </main>
  );
}
