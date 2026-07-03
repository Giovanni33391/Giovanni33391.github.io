import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

export const maxDuration = 8; // Vercel edge/serverless max duration

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { goal, completedTasks = [] } = body;

    if (!goal || typeof goal !== 'string') {
      return NextResponse.json({ error: 'Goal is required and must be a string' }, { status: 400 });
    }

    // Set a strict timeout to ensure we don't hang the app, returning 503 if we hit it
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500);

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      system: `Eres un experto en micro-aprendizaje y psicología del comportamiento. Tu trabajo es deconstruir un objetivo grande en pequeñas acciones accionables de 5 minutos (1% de mejora).
      
      Regla de Tareas: Cada tarea debe empezar con un verbo de acción claro. Nada de teoría extensa, solo práctica inmediata. 
      
      Debes devolver exactamente un lote de 5 tareas.`,
      prompt: `El objetivo del usuario es: "${goal}".
      
      ${
        completedTasks.length > 0 
        ? `Revisa las tareas completadas y aumenta progresivamente la dificultad. NUNCA repitas una tarea anterior.\nTareas ya completadas: ${completedTasks.join(', ')}`
        : 'Este es un nuevo hábito. Comienza con los pasos más básicos y fundamentales.'
      }`,
      schema: z.object({
        tasks: z.array(
          z.object({
            id: z.string().describe('Un identificador unico corto, ej. task-1, task-2'),
            task: z.string().describe('La micro-misión accionable de 5 minutos.'),
          })
        ).length(5).describe('Exactamente 5 tareas secuenciales.')
      }),
      abortSignal: controller.signal,
    });

    clearTimeout(timeoutId);

    return NextResponse.json(result.object);

  } catch (error: unknown) {
    console.error('Error generating micro-tasks:', error);
    
    // Check if it was an abort/timeout
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'AI processing timeout. Please try again later.' }, { status: 503 });
    }

    return NextResponse.json({ error: 'Failed to generate tasks' }, { status: 500 });
  }
}
