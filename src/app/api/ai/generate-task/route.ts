import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { challengeName, streak, unit, lastTask } = await req.json();

    const prompt = `
      Basado en el concepto de "Hábitos Atómicos" de James Clear, donde buscamos mejorar un 1% cada día.

      El usuario tiene un hábito llamado: "${challengeName}".
      Actualmente tiene una racha de ${streak} días.
      La unidad de medida es: "${unit}".
      ${lastTask ? `La tarea anterior fue: "${lastTask}".` : ''}

      Por favor, genera la SIGUIENTE tarea específica para mañana que represente un incremento del 1% respecto al día anterior.
      Es MUY IMPORTANTE que la tarea NO sea repetitiva. Debe ser creativa, variada y ofrecer un nuevo ángulo o desafío pequeño relacionado con el hábito para mantener el interés.

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
      max_tokens: 100,
    });

    const nextTask = response.choices[0]?.message?.content?.trim();

    return NextResponse.json({ nextTask });
  } catch (error: unknown) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Error al generar la tarea con IA' }, { status: 500 });
  }
}
