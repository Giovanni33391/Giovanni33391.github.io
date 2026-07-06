import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

function getHeuristicFallback(name: string, streak: number, unit?: string, currentMetric?: number) {
  if (currentMetric !== undefined && unit) {
    const nextValue = currentMetric > 0 ? (currentMetric * 1.01).toFixed(1) : "1";
    return `Mañana intenta alcanzar ${nextValue} ${unit}. ¡El progreso constante es la clave!`;
  }

  const fallbacks = [
    `Hoy enfócate en la técnica perfecta para ${name}, más que en la cantidad.`,
    `Intenta realizar ${name} en un entorno diferente para refrescar tu mente.`,
    `Dedica 2 minutos extra hoy a reflexionar sobre tu progreso con ${name}.`,
    `Busca un micro-detalle en ${name} que puedas optimizar hoy.`,
    `Prueba a hacer ${name} en un horario ligeramente distinto al de ayer.`,
    `Visualiza tu éxito con ${name} antes de empezar la sesión de mañana.`,
    `Prepara todo lo necesario para ${name} 10 minutos antes de empezar.`,
    `Encuentra una forma de hacer ${name} un poco más divertido o interesante.`,
    `Anota un pequeño aprendizaje que hayas tenido hoy con ${name}.`,
    `Recuerda por qué empezaste con ${name} y úsalo como motor para mañana.`
  ];
  return fallbacks[streak % fallbacks.length];
}

export async function POST(req: Request) {
  let body: {
    challengeName: string;
    streak: number;
    unit?: string;
    lastTask?: string;
    initialContext?: string;
    targetGoal?: string;
    currentMetric?: number;
    targetMetric?: number;
    type?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo de solicitud inválido' }, { status: 400 });
  }

  const {
    challengeName,
    streak,
    unit,
    lastTask,
    initialContext,
    targetGoal,
    currentMetric,
    targetMetric,
    type
  } = body;

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API Key');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const isQuantitative = type === 'quantitative' || (currentMetric !== undefined);

    const prompt = `
      Basado en el concepto de "Hábitos Atómicos" de James Clear, donde buscamos mejorar un 1% cada día.

      El usuario tiene un hábito llamado: "${challengeName}".
      Tipo de hábito: ${isQuantitative ? 'Cuantitativo (basado en números)' : 'Cualitativo (basado en habilidad/calidad)'}.
      Actualmente tiene una racha de ${streak} días.
      ${unit ? `Unidad de medida: "${unit}".` : ''}
      ${currentMetric !== undefined ? `Métrica actual: ${currentMetric}.` : ''}
      ${targetMetric !== undefined ? `Meta numérica final: ${targetMetric}.` : ''}
      ${initialContext ? `Punto de partida/contexto actual: "${initialContext}".` : ''}
      ${targetGoal ? `Meta final deseada: "${targetGoal}".` : ''}
      ${lastTask ? `La tarea anterior fue: "${lastTask}".` : ''}

      Por favor, genera la SIGUIENTE tarea específica para mañana que represente un incremento del 1% respecto al progreso actual.
      Es MUY IMPORTANTE que la tarea NO sea repetitiva. Debe ser creativa, variada y ofrecer un nuevo ángulo o desafío pequeño para mantener el interés.

      ${isQuantitative ? 'IMPORTANTE: Aunque sea cuantitativo, NO te limites a solo subir el número. Sugiere una pequeña variación en la técnica, intensidad, entorno o enfoque que complemente el incremento.' : ''}

      Además, estima cuántos días de consistencia (mejora diaria del 1%) faltan para alcanzar la meta razonablemente.
      Si el tiempo estimado es superior a 365 días, simplemente indica "un año o más".

      La tarea debe ser:
      1. Concreta y accionable.
      2. Muy pequeña (fácil de lograr).
      3. Diferente a la tarea anterior (si se proporciona).
      4. Escrita en español de forma motivadora y breve.

      Responde ÚNICAMENTE en formato JSON:
      {
        "nextTask": "texto de la tarea",
        "estimatedDays": "número de días o 'un año o más' o null si no hay meta"
      }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres un experto en formación de hábitos y productividad minimalista. Respondes siempre en JSON puro sin decoraciones markdown.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content?.trim() || '{}';

    // Robust JSON extraction
    let data = { nextTask: '', estimatedDays: null };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        data = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, 'Content:', content);
      throw parseError;
    }

    return NextResponse.json({
      nextTask: data.nextTask || getHeuristicFallback(challengeName, streak, unit, currentMetric),
      estimatedDays: data.estimatedDays
    });

  } catch (error: unknown) {
    console.error('AI Generation Error:', error);

    // Fallback to heuristic generation if API fails or Key is missing
    return NextResponse.json({
      nextTask: getHeuristicFallback(challengeName, streak, unit, currentMetric),
      estimatedDays: null,
      isFallback: true
    });
  }
}
