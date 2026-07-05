import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Allow guest users to use AI generation for testing/trial
    const { challengeName, streak, unit, currentMetric, lastTask, initialContext, targetGoal } = await req.json();

    const prompt = `
      Basado en el concepto de "Hábitos Atómicos" de James Clear, donde buscamos mejorar un 1% cada día.

      El usuario tiene un hábito llamado: "${challengeName}".
      Actualmente tiene una racha de ${streak} días.
      El progreso actual es de ${currentMetric} ${unit}.
      La unidad de medida es: "${unit}".
      ${initialContext ? `El punto de partida o base actual del usuario es: "${initialContext}".` : ''}
      ${targetGoal ? `La meta final del usuario es: "${targetGoal}".` : ''}
      ${lastTask ? `La tarea anterior fue: "${lastTask}".` : ''}

      Tu objetivo es generar una sugerencia o micro-tarea para mañana.

      Si el hábito es cuantitativo (tiene métricas numéricas como ${unit}):
      Genera un "Tip de mejora" o una variación creativa para alcanzar los ${currentMetric} ${unit} de mañana. No cambies la métrica, sino CÓMO lograrla con mejor técnica, enfoque o variedad.

      Si el hábito es cualitativo (subjetivo):
      Genera la SIGUIENTE tarea específica que represente ese incremento del 1% en dificultad o complejidad.

      Es MUY IMPORTANTE que la sugerencia NO sea repetitiva. Debe ser creativa, variada y ofrecer un nuevo ángulo o desafío pequeño relacionado con el hábito para mantener el interés.

      Además, si se proporciona una meta final, estima cuántos días de consistencia (mejora diaria del 1%) faltan para alcanzarla razonablemente. Si el tiempo estimado es superior a 365 días, simplemente indica "un año o más".

      La tarea debe ser:
      1. Concreta y accionable.
      2. Muy pequeña (fácil de lograr).
      3. Diferente a la tarea anterior (si se proporciona).
      4. Escrita en español de forma motivadora y breve.

      Ejemplo si el hábito es "Escribir un libro":
      Día 0: Escribe una frase.
      Día 1: Escribe dos frases.
      Día 2: Lee tu frase favorita en voz alta y cámbiale un adjetivo.
      Día 3: Escribe una descripción de un personaje usando solo 5 palabras.

      Responde en formato JSON:
      {
        "nextTask": "texto de la tarea",
        "estimatedDays": "número de días o 'un año o más' o null si no hay meta"
      }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres un experto en formación de hábitos y productividad minimalista.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 150,
    });

    const content = response.choices[0]?.message?.content?.trim() || '{}';
    const data = JSON.parse(content);

    return NextResponse.json({
      nextTask: data.nextTask,
      estimatedDays: data.estimatedDays
    });
  } catch (error: unknown) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Error al generar la tarea con IA' }, { status: 500 });
  }
}
