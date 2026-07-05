import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Allow guest users to use AI generation for testing/trial

    const { challengeName, streak, unit } = await req.json();

    const prompt = `
      Basado en el concepto de "Hábitos Atómicos" de James Clear, donde buscamos mejorar un 1% cada día.

      El usuario tiene un hábito llamado: "${challengeName}".
      Actualmente tiene una racha de ${streak} días.
      La unidad de medida es: "${unit}".

      Por favor, genera la SIGUIENTE tarea específica para mañana que represente un incremento del 1% respecto al día anterior.
      La tarea debe ser:
      1. Concreta y accionable.
      2. Muy pequeña (fácil de lograr).
      3. Escrita en español de forma motivadora y breve.

      Ejemplo si el hábito es "Escribir un libro":
      Día 0: Escribe una frase.
      Día 1: Escribe dos frases.
      Día 2: Escribe un párrafo pequeño.

      Responde SOLO con el texto de la tarea, sin explicaciones ni comillas.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en formación de hábitos, psicología del comportamiento y productividad minimalista. Tu objetivo es dar consejos extremadamente creativos, específicos y accionables.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    const nextTask = response.choices[0]?.message?.content?.trim();

    return NextResponse.json({ nextTask });
  } catch (error: unknown) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Error al generar la tarea con IA' }, { status: 500 });
  }
}
