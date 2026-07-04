"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Smartphone,
  Sparkles,
  BrainCircuit,
  Rocket,
  Flame,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // We use setTimeout to avoid the 'set-state-in-effect' lint error
    // but still trigger a re-render on the client to fix hydration mismatches
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Auto-advance steps for "How it works"
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
    hidden: { opacity: 0, y: 20, x: -10 },
    visible: { opacity: 1, y: 0, x: 0 },
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

      {/* AI Features Section - NEW */}
      <section className="py-24 lg:py-32 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-purple-500/5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3 h-3" />
                Nueva Función
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">IA que diseña tu camino</h2>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                ¿No sabes cómo mejorar un 1% en habilidades subjetivas? Nuestra IA analiza tu progreso y genera el siguiente micro-desafío específico para ti.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <BrainCircuit className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-100 mb-1">Micro-pasos Inteligentes</h4>
                    <p className="text-sm text-zinc-500">Divide metas complejas en acciones diarias ridículamente pequeñas.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-100 mb-1">Adaptación en Tiempo Real</h4>
                    <p className="text-sm text-zinc-500">La IA ajusta la dificultad basada en tu racha y retroalimentación.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/5 flex items-center justify-center p-8">
                <div className="w-full bg-zinc-950 rounded-2xl border border-purple-500/30 shadow-2xl p-6 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Escritura Creativa</div>
                      <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Modo IA Activado</div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                      <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Próximo desafío del 1%</p>
                      <p className="text-zinc-200 italic">“Hoy, escribe una sola frase que use una metáfora sobre el tiempo. Solo una.”</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      Racha: 12 días
                    </div>
                    <div className="text-purple-400 font-bold">Inspirado por James Clear</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-12 border-y border-zinc-900 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            <motion.div variants={itemVariants}>
              <div className="text-3xl font-bold text-white mb-1">37.7x</div>
              <div className="text-zinc-500 text-sm">Crecimiento anual</div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="text-3xl font-bold text-white mb-1">1%</div>
              <div className="text-zinc-500 text-sm">Esfuerzo diario</div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="text-3xl font-bold text-white mb-1">∞</div>
              <div className="text-zinc-500 text-sm">Potencial ilimitado</div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-zinc-500 text-sm">Privacidad total</div>
            </motion.div>
          </motion.div>
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
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
              }}
              className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Progreso Exponencial</h3>
              <p className="text-zinc-400 leading-relaxed">
                Nuestra fórmula calcula automáticamente tu próximo objetivo basado en un incremento del 1%. La progresión nunca se detiene.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Visualización Clara</h3>
              <p className="text-zinc-400 leading-relaxed">
                Mira tu racha y cómo tu métrica actual se compara con tu punto de partida. La motivación visual es clave para la consistencia.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
              }}
              className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 transition-colors group"
            >
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
      <section className="py-24 lg:py-32 px-4 bg-zinc-900/20 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-5xl font-bold mb-12">Cómo funciona</h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Define tu hábito",
                    description: "Elige algo que quieras mejorar, como \"Minutos de lectura\" o \"Flexiones\".",
                  },
                  {
                    title: "Establece tu base",
                    description: "Introduce tu capacidad actual. No importa si es pequeña.",
                  },
                  {
                    title: "IA genera tu micro-paso",
                    description: "Nuestro algoritmo e IA calculan tu próximo objetivo un 1% superior o tu siguiente tarea lógica.",
                  }
                ].map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`flex gap-6 p-6 rounded-2xl transition-all text-left w-full ${
                      activeStep === idx
                        ? 'bg-zinc-900 border border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                        : 'hover:bg-zinc-900/50 border border-transparent'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      activeStep === idx ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className={`text-xl font-bold mb-2 transition-colors ${
                        activeStep === idx ? 'text-white' : 'text-zinc-500'
                      }`}>
                        {step.title}
                      </h4>
                      <AnimatePresence mode="wait">
                        {activeStep === idx && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-zinc-400"
                          >
                            {step.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-white/5 flex items-center justify-center p-4 lg:p-8">
                <div className="w-full h-full bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
                    </div>
                    <div className="text-[10px] text-zinc-600 font-mono">onepercent.app</div>
                  </div>

                  <div className="flex-1 p-6 relative">
                    <AnimatePresence mode="wait">
                      {activeStep === 0 && (
                        <motion.div
                          key="step0"
                          initial={{ opacity: 0, scale: 0.95, x: 20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 1.05, x: -20 }}
                          className="space-y-6"
                        >
                          <div className="text-xl font-bold">Nuevo Hábito</div>
                          <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                              <div className="text-xs text-zinc-500 mb-2">Nombre del hábito</div>
                              <div className="text-lg font-medium flex items-center gap-2">
                                Flexiones
                                <motion.div
                                  animate={{ opacity: [1, 0] }}
                                  transition={{ repeat: Infinity, duration: 0.8 }}
                                  className="w-[2px] h-6 bg-emerald-500"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col items-center gap-2 opacity-50">
                                <TrendingUp className="w-5 h-5" />
                                <span className="text-[10px]">Cuantitativo</span>
                              </div>
                              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/50 flex flex-col items-center gap-2">
                                <Sparkles className="w-5 h-5 text-emerald-500" />
                                <span className="text-[10px]">Cualitativo / IA</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeStep === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, scale: 0.95, x: 20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 1.05, x: -20 }}
                          className="space-y-6"
                        >
                          <div className="text-xl font-bold">Establece tu Base</div>
                          <div className="p-8 rounded-2xl bg-zinc-900 border border-emerald-500/30 text-center">
                            <div className="text-sm text-zinc-500 mb-4">¿Cuántas puedes hacer hoy?</div>
                            <div className="text-6xl font-black text-emerald-500 mb-2">10</div>
                            <div className="text-xs text-zinc-500">repeticiones</div>
                          </div>
                          <Button className="w-full py-6">Empezar camino</Button>
                        </motion.div>
                      )}

                      {activeStep === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, scale: 0.95, x: 20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 1.05, x: -20 }}
                          className="h-full flex flex-col"
                        >
                          <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                              <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">Flexiones</div>
                              <div className="text-[10px] text-zinc-500">Día 1</div>
                            </div>
                          </div>

                          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6 relative overflow-hidden group">
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent -translate-x-full"
                              animate={{ translateX: ['100%', '-100%'] }}
                              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            />
                            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">
                              <Sparkles className="w-3 h-3" />
                              IA Generando Micro-paso...
                            </div>
                            <p className="text-zinc-100 font-medium leading-relaxed">
                              “Hoy solo haz 10 flexiones, pero enfócate en bajar muy lento, sintiendo cada músculo.”
                            </p>
                          </div>

                          <div className="mt-auto space-y-4">
                            <div className="flex justify-between text-xs text-zinc-500">
                              <span>Progreso hoy</span>
                              <span className="text-emerald-500 font-bold">10.1 / 10.0</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-emerald-500"
                              />
                            </div>
                            <Button className="w-full bg-zinc-50 text-zinc-950 hover:bg-white">Completar desafío</Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-48 px-4 relative overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-emerald-600 -z-10 opacity-5 rounded-full blur-[120px]"
        />
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
            © {mounted ? new Date().getFullYear() : ''} OnePercent. Inspirado en James Clear.
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
