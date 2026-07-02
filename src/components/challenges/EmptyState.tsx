import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Target } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-emerald-500/20">
        <Target className="w-10 h-10 text-emerald-400" />
      </div>
      
      <h3 className="text-2xl font-bold text-zinc-100 mb-3">
        El viaje de las mil millas comienza con un solo paso
      </h3>
      
      <p className="text-zinc-400 max-w-md mx-auto mb-8 text-lg">
        Mejorar un 1% cada día te hará 37 veces mejor en un año. 
        Añade tu primer desafío y empieza a construir el hábito hoy mismo.
      </p>
      
      <div className="relative">
        <Button size="lg" onClick={onCreateClick} className="group relative z-10">
          Nuevo Desafío
          <ArrowUpRight className="ml-2 w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Button>
        
        {/* Decorative arrow pointing to button */}
        <svg 
          className="absolute -top-12 -left-16 w-16 h-16 text-emerald-500/30 -rotate-12 animate-pulse" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </motion.div>
  );
}
