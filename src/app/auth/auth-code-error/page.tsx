import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AuthCodeError() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Error de autenticación</h1>
        <p className="text-zinc-400 mb-8">
          No pudimos verificar tu sesión. El código de autorización puede haber expirado o ser inválido.
        </p>

        <div className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full h-12">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>

          <p className="text-xs text-zinc-500 mt-6">
            Si el problema persiste, intenta cerrar la pestaña y volver a iniciar sesión.
          </p>
        </div>
      </div>
    </main>
  );
}
