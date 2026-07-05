export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Error de Autenticación</h1>
        <p className="text-zinc-400 mb-6">
          Hubo un problema al procesar tu inicio de sesión. Esto puede deberse a un enlace expirado o a un error en la configuración.
        </p>
        <a
          href="/"
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  )
}
