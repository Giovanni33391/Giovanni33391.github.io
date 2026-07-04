import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (process.env.NODE_ENV === 'development' && (!supabaseUrl || !supabaseAnonKey)) {
    console.error(
      'ADVERTENCIA: Las variables de entorno de Supabase no están configuradas. ' +
      'El inicio de sesión y la base de datos no funcionarán correctamente. ' +
      'Asegúrate de configurar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }

  return createBrowserClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
  )
}
