import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import posthog from 'posthog-js';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProModal({ isOpen, onClose }: ProModalProps) {
  const handleUpgradeClick = () => {
    posthog.capture('pro_intent_click');
    alert("Proximamente: Integración con Stripe. ¡Gracias por tu interés!");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
              className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl shadow-emerald-900/20 overflow-hidden pointer-events-auto relative"
            >
              {/* Premium Background Gradient Glow */}
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-br from-emerald-500/20 via-yellow-500/10 to-transparent blur-3xl -z-10" />

              <div className="flex justify-end p-4">
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 text-zinc-400 hover:text-zinc-100">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="px-8 pb-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg mb-6 rotate-3">
                  <Crown className="w-8 h-8 text-zinc-950 drop-shadow-sm" />
                </div>
                
                <h2 className="text-2xl font-bold text-zinc-100 mb-3 tracking-tight">
                  Has alcanzado tu límite
                </h2>
                
                <p className="text-zinc-400 mb-8 leading-relaxed">
                  La versión gratuita te permite enfocarte en 3 hábitos clave. Desbloquea tu potencial infinito y añade desafíos ilimitados con <strong className="text-zinc-200">OnePercent Pro</strong>.
                </p>

                <Button 
                  size="lg" 
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 border-none"
                  onClick={handleUpgradeClick}
                >
                  <span className="relative z-10 font-bold flex items-center justify-center gap-2">
                    Mejorar a Pro <Crown className="w-4 h-4" />
                  </span>
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Button>
                
                <button onClick={onClose} className="mt-4 text-sm text-zinc-500 hover:text-zinc-300 font-medium transition-colors">
                  Quizás más tarde
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
