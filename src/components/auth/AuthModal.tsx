"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Mail, LogIn, Loader2, UserPlus, Key, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useOnePercent } from '@/hooks/useOnePercent';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'signin' | 'signup' | 'magic-link';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUp, signInWithPassword } = useOnePercent();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setError(null);
    setSent(false);
    setLoading(false);
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch {
      setError('Error al iniciar sesión con Google');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError(null);

      if (mode === 'magic-link') {
        await signInWithEmail(email);
        setSent(true);
      } else if (mode === 'signin') {
        await signInWithPassword(email, password);
        onClose();
      } else if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        await signUp(email, password);
        setSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'signin' ? 'Bienvenido de nuevo' :
        mode === 'signup' ? 'Crear cuenta' :
        'Acceso rápido'
      }
    >
      <div className="space-y-6">
        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => handleModeChange('signin')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === 'signin' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => handleModeChange('signup')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === 'signup' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Registrarse
          </button>
        </div>

        {sent ? (
          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl text-zinc-100 font-bold mb-2">
              {mode === 'signup' ? '¡Ya casi estás!' : 'Enlace enviado'}
            </h3>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              {mode === 'signup'
                ? 'Hemos enviado un correo de confirmación. Por favor, revisa tu bandeja de entrada.'
                : 'Revisa tu correo para completar el inicio de sesión.'}
            </p>
            <Button
              variant="outline"
              className="w-full border-zinc-800"
              onClick={() => setSent(false)}
            >
              Volver atrás
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="outline"
              className="w-full h-12 flex items-center justify-center gap-3 border-zinc-800 hover:bg-zinc-800 transition-colors"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-zinc-900 px-3 text-zinc-500 font-bold">O con tu cuenta</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                    required
                  />
                </div>

                {mode !== 'magic-link' && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-12 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="text-xs text-red-400 text-center font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 shadow-lg shadow-emerald-500/10"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {mode === 'signin' ? <LogIn className="w-5 h-5 mr-2" /> :
                     mode === 'signup' ? <UserPlus className="w-5 h-5 mr-2" /> :
                     <Sparkles className="w-5 h-5 mr-2" />}
                    {mode === 'signin' ? 'Iniciar Sesión' :
                     mode === 'signup' ? 'Crear Mi Cuenta' :
                     'Enviar Enlace Mágico'}
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleModeChange(mode === 'magic-link' ? 'signin' : 'magic-link')}
                  className="text-xs text-zinc-500 hover:text-emerald-500 transition-colors underline-offset-4 hover:underline"
                >
                  {mode === 'magic-link' ? 'Volver al acceso con contraseña' : '¿Prefieres entrar sin contraseña?'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
