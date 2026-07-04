"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Mail, LogIn, Loader2 } from 'lucide-react';
import { useOnePercent } from '@/hooks/useOnePercent';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail } = useOnePercent();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch {
      setError('Error al iniciar sesión con Google');
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError(null);
      await signInWithEmail(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el enlace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Iniciar Sesión">
      <div className="space-y-6">
        <p className="text-sm text-zinc-400">
          Sincroniza tus hábitos y tu progreso en todos tus dispositivos.
        </p>

        <Button
          variant="outline"
          className="w-full h-12 flex items-center justify-center gap-3 border-zinc-800 hover:bg-zinc-800"
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-2 text-zinc-500 font-medium">O con email</span>
          </div>
        </div>

        {sent ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <Mail className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-emerald-500 font-bold mb-1">Enlace enviado</h3>
            <p className="text-sm text-emerald-500/80">Revisa tu correo para completar el inicio de sesión.</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-emerald-500 hover:text-emerald-400"
              onClick={() => setSent(false)}
            >
              Intentar con otro email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                required
              />
            </div>
            {error && (
              <p className="text-xs text-red-400 px-1">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full h-12"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Enviar Magic Link
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
}
