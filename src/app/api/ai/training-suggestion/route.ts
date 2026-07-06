import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Exercise, WorkoutSession } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { exercise, sessionHistory, mode } = body as { exercise: Exercise, sessionHistory: WorkoutSession[], mode: string };

    if (!process.env.OPENAI_API_KEY) {
      // Direct heuristic if no API key
      const weightOption = Number((exercise.currentMetric + (exercise.unit === 'kg' ? 1.25 : 2.5)).toFixed(2));
      const repOption = exercise.targetReps + 1;

      return NextResponse.json({
        options: {
          weight: { value: weightOption, label: `+${exercise.unit === 'kg' ? '1.25' : '2.5'} ${exercise.unit}` },
          reps: { value: repOption, label: "+1 rep" }
        },
        reason: "Buen rendimiento."
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
      Eres un entrenador experto. Analiza: ${exercise.name} (${mode}).
      Actual: ${exercise.targetSets}x${exercise.targetReps} @ ${exercise.currentMetric}${exercise.unit}.
      Desempeño: ${JSON.stringify(sessionHistory.slice(0, 1))}

      Genera DOS opciones de progresión DIRECTAS:
      1. Aumento de peso (entre 1% y 5%).
      2. Aumento de repeticiones (normalmente +1 o +2).

      REGLA ORO: La razón debe tener MÁXIMO 5 palabras. Sé seco y directo.

      Responde ÚNICAMENTE en JSON:
      {
        "options": {
          "weight": { "value": número, "label": "+Xkg" },
          "reps": { "value": número, "label": "+X reps" }
        },
        "reason": "texto corto"
      }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 150,
    });

    const content = response.choices[0]?.message?.content?.trim() || '{}';
    const data = JSON.parse(content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1));

    return NextResponse.json(data);

  } catch (error) {
    console.error('Training Suggestion Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
