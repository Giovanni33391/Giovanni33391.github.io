# OnePercent

OnePercent es un motor de progresión incremental inspirado en la filosofía de *Hábitos Atómicos*. Te ayuda a mejorar un 1% cada día, rastreando y exigiendo automáticamente el crecimiento compuesto de tus hábitos.

## Stack Tecnológico
- **Framework:** Next.js (App Router) con React
- **Estilos:** Tailwind CSS
- **Autenticación y Base de Datos:** Supabase (con políticas RLS)
- **Desarrollo Frontend:** Framer Motion, Recharts, Lucide React
- **Telemetría y Observabilidad:** PostHog y Sentry
- **Infraestructura:** Preparado para Vercel (PWA)

## Despliegue en Vercel (Guía Rápida)

Para lanzar OnePercent a producción, utiliza Vercel. Sigue estos pasos:

1. Haz push de este repositorio a GitHub.
2. En tu cuenta de Vercel, crea un nuevo proyecto e importa el repositorio de GitHub.
3. Asegúrate de que el "Framework Preset" esté configurado automáticamente en **Next.js**.
4. Antes de hacer el despliegue, **añade las siguientes Variables de Entorno (Environment Variables)** en la configuración del proyecto en Vercel.

### Variables de Entorno Requeridas

**Supabase (Base de datos y Autenticación)**
- `NEXT_PUBLIC_SUPABASE_URL`: La URL de tu proyecto de Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: La clave anónima pública de tu proyecto de Supabase.

**PostHog (Telemetría de Negocio)**
- `NEXT_PUBLIC_POSTHOG_KEY`: Tu clave de proyecto de PostHog.
- `NEXT_PUBLIC_POSTHOG_HOST`: Habitualmente `https://app.posthog.com` (o la URL de tu instancia).

**Sentry (Captura de Errores)**
- `NEXT_PUBLIC_SENTRY_DSN`: El DSN de tu proyecto Sentry (Frontend).
- `SENTRY_AUTH_TOKEN`: Token de autenticación de Sentry (Necesario para que Vercel suba los source maps).
- `SENTRY_ORG`: Tu organización en Sentry.
- `SENTRY_PROJECT`: Tu proyecto en Sentry.

5. Haz clic en **Deploy**. Vercel se encargará de instalar las dependencias, construir el proyecto (incluyendo la inyección de los source maps a Sentry) y desplegarlo.

## Configuración de Supabase (Base de datos)

Recuerda ejecutar el archivo de esquema inicial en Supabase antes de lanzar a producción:
1. Ve al panel de SQL Editor de tu proyecto en Supabase.
2. Copia y ejecuta todo el contenido del archivo `supabase/schema.sql` (esto creará las tablas `users`, `challenges`, `challenge_logs`, activará el RLS, y configurará el trigger de nuevos usuarios).

---

¡Disfruta construyendo mejores hábitos!
