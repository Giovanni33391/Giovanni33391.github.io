import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { exercise, sessionHistory, mode, isGlobal } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        options: {
          weight: { value: (exercise?.currentMetric || 0) + 1.25, label: "+1.25kg" },
          reps: { value: (exercise?.targetReps || 0) + 1, label: "+1 rep" }
        },
        reason: "Sigue así.",
        assessment: "Buen trabajo general."
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    if (isGlobal) {
      const { routineName, volume, duration, history } = body;
      const prompt = `
        Eres un Head Coach de élite. Analiza este entrenamiento de "${routineName}":
        - Volumen Total: ${volume}kg
        - Duración: ${Math.floor(duration/60)} min
        - Ejercicios: ${history[0]?.exercises.length || 0}

        Dame una evaluación GLOBAL profesional, directa y motivadora (MÁXIMO 6 PALABRAS).
        No uses exclamaciones innecesarias. Sé el Coach que el atleta necesita escuchar.
      `;
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'Eres un Head Coach de élite. Directo y profesional.' }, { role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 50,
      });
      return NextResponse.json({ assessment: response.choices[0]?.message?.content?.trim().replace(/"/g, '') });
    }

    // Individual Exercise Suggestion
    const currentSets = sessionHistory[0]?.exercises.find((e: { name: string }) => e.name === exercise.name)?.sets || [];
    const prompt = `
      Analiza el ejercicio "${exercise.name}" en modo "${mode}".
      Objetivo: ${exercise.targetSets}x${exercise.targetReps} @ ${exercise.currentMetric}${exercise.unit}.
      Resultados de hoy: ${JSON.stringify(currentSets)}

      Genera dos opciones de evolución:
      1. Incrementar peso (+1.25kg a +2.5kg o +2.5% a +5%).
      2. Incrementar repeticiones (+1 a +2 reps).

      CRITERIOS:
      - Si hizo todas las reps: Prioriza subir peso.
      - Si falló en alguna serie: Prioriza subir reps o mantener peso.

      RAZÓN: MÁXIMO 5 PALABRAS. Directo y seco.

      Responde JSON puro:
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
      messages: [
        { role: 'system', content: 'Eres un sistema de recomendación técnica para atletas. Respondes solo JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 150,
    });

    const content = response.choices[0]?.message?.content?.trim() || '{}';
    const data = JSON.parse(content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1));
    return NextResponse.json(data);

  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
