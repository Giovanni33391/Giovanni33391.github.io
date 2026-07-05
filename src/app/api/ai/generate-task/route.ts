import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Allow guest users to use AI generation for testing/trial
    const {
      challengeName,
      streak,
      unit,
      lastTask,
      initialContext,
      targetGoal,
      targetMetric,
      currentMetric,
      type
    } = await req.json();

    const isQuantitative = type === 'quantitative';

    const prompt = `
      Basado en el concepto de "Hábitos Atómicos" de James Clear, donde buscamos mejorar un 1% cada día.

      El usuario tiene un hábito llamado: "${challengeName}".
      Tipo de hábito: ${isQuantitative ? 'Cuantitativo (basado en números)' : 'Cualitativo (basado en habilidad/calidad)'}.
      Actualmente tiene una racha de ${streak} días.
      ${isQuantitative ? `Valor actual: ${currentMetric} ${unit}.` : `Contexto actual: "${initialContext || 'Empezando desde cero'}".`}
      ${isQuantitative ? (targetMetric ? `Meta final: ${targetMetric} ${unit}.` : '') : (targetGoal ? `Meta final: "${targetGoal}".` : '')}
      ${lastTask ? `La última tarea sugerida fue: "${lastTask}".` : ''}

      TU TAREA:
      1. Genera la SIGUIENTE tarea específica para mañana que represente un incremento del 1% respecto al progreso actual.
         - Si es cuantitativo, la tarea debe sugerir realizar un pequeño incremento o mejora técnica.
         - Si es cualitativo, debe ser un paso accionable y pequeño.
         - Es MUY IMPORTANTE que la tarea NO sea repetitiva. Debe ser creativa y variada.

      2. Estima cuántos días de consistencia (mejorando un 1% diario) faltan para alcanzar la meta final.
         - Si es cuantitativo, usa la fórmula de crecimiento compuesto: Meta = Actual * (1.01)^n.
         - Si es cualitativo, haz una estimación profesional basada en la complejidad de la meta.
         - REGLA CRÍTICA: Si el tiempo estimado es superior a 365 días, responde EXACTAMENTE "un año o más".
         - Si no hay meta, devuelve null para estimatedDays.

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

    let content = response.choices[0]?.message?.content?.trim() || '{}';

    // Robust JSON parsing (handles markdown code blocks)
    if (content.includes('```')) {
      content = content.replace(/```json\n?|```/g, '').trim();
    }

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
