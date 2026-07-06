import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Exercise, WorkoutSession } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { exercise, sessionHistory, mode } = body as { exercise: Exercise, sessionHistory: WorkoutSession[], mode: string };

    if (!process.env.OPENAI_API_KEY) {
      // Basic heuristic fallback if no API key
      const lastSession = sessionHistory[0];
      const completedSets = lastSession?.exercises.find(e => e.name === exercise.name)?.sets.filter(s => s.completed).length || 0;

      let suggestedWeight = exercise.currentMetric;
      const suggestedReps = exercise.targetReps;
      let reason = "Basado en tu última sesión.";

      if (completedSets >= exercise.targetSets) {
        suggestedWeight = Number((exercise.currentMetric * 1.025).toFixed(1)); // 2.5% increase
        reason = "¡Excelente trabajo! Has completado todas las series. Es hora de subir un poco el peso.";
      }

      return NextResponse.json({
        suggestion: { weight: suggestedWeight, reps: suggestedReps, reason }
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
      Eres un entrenador experto en fitness. Analiza el desempeño del usuario en el ejercicio "${exercise.name}".
      Modo de entrenamiento: ${mode}.
      Objetivo: ${exercise.targetSets} series de ${exercise.targetReps} reps con ${exercise.currentMetric}${exercise.unit}.

      Últimas sesiones (más reciente primero):
      ${JSON.stringify(sessionHistory.slice(0, 3))}

      Reglas según modo:
      - Fuerza: Descansos largos, subidas de peso pequeñas pero constantes (2.5kg o 1-2%).
      - Hipertrofia: Rango de 8-12 reps. Si hace todas las reps, subir peso.
      - Calistenia: Foco en repeticiones y control.
      - Mio-reps: Foco en fatiga acumulada.

      Basado en esto, ¿debería subir el peso, las repeticiones o mantenerse?
      Genera una recomendación específica y motivadora en español.

      Responde ÚNICAMENTE en JSON:
      {
        "suggestion": {
          "weight": número,
          "reps": número,
          "reason": "explicación breve y motivadora"
        }
      }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content?.trim() || '{}';
    const data = JSON.parse(content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1));

    return NextResponse.json(data);

  } catch (error) {
    console.error('Training Suggestion Error:', error);
    return NextResponse.json({ error: 'Failed to generate suggestion' }, { status: 500 });
  }
}
