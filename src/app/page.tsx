"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, LogIn, LogOut } from 'lucide-react';
import { useOnePercent } from '@/hooks/useOnePercent';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/challenges/EmptyState';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { NewChallengeForm } from '@/components/challenges/NewChallengeForm';
import { ProModal } from '@/components/ui/ProModal';
import { LandingPage } from '@/components/landing/LandingPage';
import posthog from 'posthog-js';

export default function Home() {
  const { 
    challenges, 
    isLoaded, 
    user,
    signInWithGoogle,
    signOut,
    addChallenge, 
    completeChallenge, 
    deleteChallenge, 
    isToday 
  } = useOnePercent();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  
  const MAX_FREE_CHALLENGES = 3;

  const handleCreateChallenge = (name: string, initialMetric: number, unit: string) => {
    addChallenge(name, initialMetric, unit);
    posthog.capture('challenge_created', { name, unit });
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

  // Prevent hydration mismatch by returning null until loaded
  if (!isLoaded) return null;

  // Show landing page if user is not logged in AND has no challenges
  if (!user && challenges.length === 0) {
    return (
      <LandingPage
        onGetStarted={handleOpenNewChallenge}
        onSignIn={signInWithGoogle}
      />
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
            <Button onClick={signInWithGoogle} variant="default" size="sm">
              <LogIn className="w-4 h-4 mr-2" />
              Sincronizar (Google)
            </Button>
          )}
        </div>
      </motion.header>

      {/* Main Content */}
      {challenges.length === 0 ? (
        <EmptyState onCreateClick={handleOpenNewChallenge} />
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {challenges.map((challenge, index) => (
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
    </main>
  );
}
