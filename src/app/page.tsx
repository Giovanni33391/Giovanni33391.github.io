"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnePercent } from '@/hooks/useOnePercent';
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
    isGuestMode,
    enterGuestMode,
    signOut,
    addChallenge, 
    completeChallenge, 
    deleteChallenge, 
    isToday 
  } = useOnePercent();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  
  const daysOfWeek = [
    { label: 'Dom', value: 0 },
    { label: 'Lun', value: 1 },
    { label: 'Mar', value: 2 },
    { label: 'Mié', value: 3 },
    { label: 'Jue', value: 4 },
    { label: 'Vie', value: 5 },
    { label: 'Sáb', value: 6 },
  ];

  const MAX_FREE_CHALLENGES = 3;

  const handleCreateChallenge = (name: string, initialMetric: number, unit: string, type: 'quantitative' | 'qualitative', targetMetric?: number) => {
    addChallenge(name, initialMetric, unit, type, targetMetric);
    posthog.capture('challenge_created', { name, unit, type, targetMetric });
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

  const filteredChallenges = challenges.filter(challenge => {
    // If no frequency is set, show on all days (fallback)
    if (!challenge.frequency || challenge.frequency.length === 0) return true;
    return challenge.frequency.includes(selectedDay);
  });

  // Prevent hydration mismatch by returning null until loaded
  if (!isLoaded) return null;

  const handleGetStarted = () => {
    setIsAuthModalOpen(false);
    enterGuestMode();
  };

  // Show landing page if user is not logged in AND has no challenges AND not in guest mode
  if (!user && challenges.length === 0 && !isGuestMode) {
    return (
      <>
        <LandingPage
          onGetStarted={handleGetStarted}
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

      {/* Main Content */}
      {challenges.length === 0 ? (
        <EmptyState onCreateClick={handleOpenNewChallenge} />
      ) : (
        <>
          <StatsDashboard challenges={challenges} />

          {/* Day Selector */}
          <div className="flex justify-between items-center mb-8 bg-zinc-900/30 p-1 rounded-xl border border-zinc-800/50">
            {daysOfWeek.map((day) => (
              <button
                key={day.value}
                onClick={() => setSelectedDay(day.value)}
                className={cn(
                  "flex-1 py-2 text-xs font-bold transition-all rounded-lg",
                  selectedDay === day.value
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                )}
              >
                {day.label}
              </button>
            ))}
          </div>

          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map((challenge, index) => (
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
                  isToday={isToday}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-zinc-900/20 border border-zinc-800/50 border-dashed rounded-3xl">
              <p className="text-zinc-500 font-medium">No hay desafíos programados para hoy.</p>
            </div>
          )}
        </motion.div>
        </>
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
