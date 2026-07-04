"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">OnePercent</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onSignIn}
              className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Iniciar sesión
            </button>
            <Button size="sm" onClick={onGetStarted}>
              Empezar ahora
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6"
          >
            <Zap className="w-3 h-3" />
            Filosofía de Hábitos Atómicos
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent leading-[1.1]"
          >
            Sé un 3700% mejor <br /> en tan solo un año.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            El poder del interés compuesto aplicado a tus hábitos. Mejora un <strong>1% cada día</strong> y observa cómo pequeñas acciones se convierten en resultados extraordinarios.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto" onClick={onGetStarted}>
              Comienza tu transformación
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Gratis para siempre
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-12 border-y border-zinc-900 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-1">37.7x</div>
              <div className="text-zinc-500 text-sm">Crecimiento anual</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">1%</div>
              <div className="text-zinc-500 text-sm">Esfuerzo diario</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">∞</div>
              <div className="text-zinc-500 text-sm">Potencial ilimitado</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-zinc-500 text-sm">Privacidad total</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4">Todo lo que necesitas para crecer</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Diseñado para ser simple, efectivo y adictivo (en el buen sentido).</p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <motion.div variants={itemVariants} className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 transition-colors group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Progreso Exponencial</h3>
              <p className="text-zinc-400 leading-relaxed">
                Nuestra fórmula calcula automáticamente tu próximo objetivo basado en un incremento del 1%. La progresión nunca se detiene.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={itemVariants} className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Visualización Clara</h3>
              <p className="text-zinc-400 leading-relaxed">
                Mira tu racha y cómo tu métrica actual se compara con tu punto de partida. La motivación visual es clave para la consistencia.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={itemVariants} className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 transition-colors group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Modo PWA Offline</h3>
              <p className="text-zinc-400 leading-relaxed">
                Funciona sin conexión. Regístra tus hábitos en cualquier lugar y se sincronizará automáticamente cuando recuperes la red.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 lg:py-32 px-4 bg-zinc-900/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-5xl font-bold mb-8">Cómo funciona</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Define tu hábito</h4>
                    <p className="text-zinc-400">Elige algo que quieras mejorar, como &quot;Minutos de lectura&quot; o &quot;Flexiones&quot;.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Establece tu base</h4>
                    <p className="text-zinc-400">Introduce tu capacidad actual. No importa si es pequeña.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="text-lg font-bold mb-1">Mejora un 1% cada día</h4>
                    <p className="text-zinc-400">Cada vez que completes el hábito, calculamos tu nuevo objetivo un 1% superior.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/5 flex items-center justify-center p-8">
                <div className="w-full h-full bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col p-6">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Lectura diaria</div>
                      <div className="text-[10px] text-zinc-500">Racha de 15 días</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full w-[65%] bg-emerald-500" />
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs text-zinc-500 mb-1">Objetivo de hoy</div>
                        <div className="text-2xl font-bold text-white">11.6 <span className="text-sm font-normal text-zinc-500">minutos</span></div>
                      </div>
                      <div className="text-xs text-emerald-500 font-bold">+1% aumento</div>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="w-full h-12 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-zinc-600 text-sm">
                      Siguiente nivel: 11.7 min
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-48 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-600 -z-10 opacity-5" />
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-8 tracking-tight">¿Listo para ser 37 veces mejor?</h2>
          <p className="text-zinc-400 text-lg mb-12 max-w-xl mx-auto">
            Únete a otros que ya están hackeando su crecimiento diario. Sin fricciones, sin complicaciones.
          </p>
          <Button size="lg" className="h-16 px-12 text-xl rounded-2xl" onClick={onGetStarted}>
            Empieza gratis hoy
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">OnePercent</span>
          </div>
          <div className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} OnePercent. Inspirado en James Clear.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-zinc-500 hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="text-zinc-500 hover:text-white transition-colors">Términos</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
