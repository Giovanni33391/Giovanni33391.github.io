import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
  });
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { habitName, streak, type } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ task: 'Micro-tarea generada (IA no configurada)' });
    }

    if (type !== 'qualitative') {
      return NextResponse.json({ error: 'Only qualitative habits require AI tasks' }, { status: 400 });
    }

    const openai = getOpenAIClient();

    const prompt = `Eres un coach experto en formación de hábitos basado en la filosofía de "Hábitos Atómicos" de James Clear.
    El usuario tiene un hábito cualitativo llamado: "${habitName}".
    Su racha actual es de ${streak} días.

    Tu tarea es generar la SIGUIENTE micro-tarea específica para hoy que represente una mejora del 1% o un paso incremental lógico.

    Reglas:
    1. La tarea debe ser extremadamente simple y realizable en menos de 5-10 minutos.
    2. Debe ser específica y accionable (ej. "Lee 2 páginas", no "Lee un poco").
    3. Si la racha es 0, sugiere el paso inicial más pequeño posible.
    4. Si la racha es alta, aumenta ligeramente la dificultad o profundidad, pero mantén la filosofía del 1%.
    5. Responde ÚNICAMENTE con la descripción de la tarea, sin introducciones ni explicaciones.
    6. Idioma: Español.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Or gpt-4o if available
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    const task = response.choices[0].message.content?.trim();

    return NextResponse.json({ task });
  } catch (error) {
    console.error('AI Task Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate AI task' }, { status: 500 });
  }
}
