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

    // Use streak and name to generate a "vibe" or "focus lens" for variety
    const lenses = [
      'técnica', 'mentalidad', 'entorno', 'variedad',
      'recuperación', 'curiosidad', 'identidad', 'obstáculos',
      'preparación', 'sentidos', 'celebración', 'social'
    ];
    const lens = lenses[Math.floor(Math.random() * lenses.length)];

    const prompt = `
      Basado en el concepto de "Hábitos Atómicos" de James Clear, donde buscamos mejorar un 1% cada día.

      El usuario tiene un hábito llamado: "${challengeName}".
      Actualmente tiene una racha de ${streak} días.
      El progreso actual es de ${currentMetric} ${unit}.
      La unidad de medida es: "${unit}".
      ${initialContext ? `El punto de partida o base actual del usuario es: "${initialContext}".` : ''}
      ${targetGoal ? `La meta final del usuario es: "${targetGoal}".` : ''}
      ${lastTask ? `La tarea anterior fue: "${lastTask}".` : ''}

      Tu objetivo es generar una sugerencia o micro-tarea única para mañana, enfocándote hoy especialmente en la lente de: **${lens.toUpperCase()}**.

      Si el hábito es cuantitativo (tiene métricas numéricas como ${unit}):
      Genera un "Tip de mejora" o una variación creativa para alcanzar los ${currentMetric} ${unit} de mañana. No cambies la métrica, sino CÓMO lograrla con mejor técnica, enfoque o variedad.

      Si el hábito es cualitativo (subjetivo):
      Genera la SIGUIENTE tarea específica que represente ese incremento del 1% en dificultad o complejidad.

      Es CRÍTICO que la sugerencia NO sea repetitiva y se sienta fresca.
      INSTRUCCIONES DE NO REPETICIÓN:
      1. Si se proporciona "la tarea anterior", la nueva debe ser NOTABLEMENTE diferente en enfoque o acción.
      2. Usa la lente "${lens}" para forzar un ángulo nuevo (ej. si es técnica, enfócate en la forma; si es entorno, enfócate en el espacio de trabajo; si es identidad, enfócate en cómo se ve alguien que ya domina el hábito).
      3. Evita consejos obvios o genéricos. Busca el "detalle del 1%".

      Además, si se proporciona una meta final, estima cuántos días de consistencia (mejora diaria del 1%) faltan para alcanzarla razonablemente. Si el tiempo estimado es superior a 365 días, simplemente indica "un año o más".

      La tarea debe ser:
      1. Concreta y accionable.
      2. Muy pequeña (fácil de lograr).
      3. Diferente a la tarea anterior (si se proporciona).
      4. Escrita en español de forma motivadora, breve y fresca.

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

    // Improved JSON parsing to handle potential Markdown blocks
    let data;
    try {
      const jsonString = content.includes('```json')
        ? content.split('```json')[1].split('```')[0].trim()
        : content;
      data = JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse AI JSON:', content);
      data = { nextTask: "Hoy simplemente repite tu hábito con consciencia plena.", estimatedDays: null };
    }

    return NextResponse.json({
      nextTask: data.nextTask || "Hoy simplemente repite tu hábito con consciencia plena.",
      estimatedDays: data.estimatedDays
    });
  } catch (error: unknown) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Error al generar la tarea con IA' }, { status: 500 });
  }
}
