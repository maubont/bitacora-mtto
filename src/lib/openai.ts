import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Initialize OpenAI client
// dangerouslyAllowBrowser: true is required for client-side usage in Vite
// Note: In a production app, this should be moved to a backend/Edge Function to protect the API Key
export const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
});

export async function generateActivityDescription(roughNotes: string, category: string): Promise<string> {
    if (!apiKey) {
        throw new Error('OpenAI API Key not configured');
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Eres un experto técnico de mantenimiento industrial en Extractora La Gloria. 
          Tu tarea es transformar notas rápidas y coloquiales en descripciones técnicas profesionales para una bitácora de mantenimiento.
          
          Reglas:
          1. Usa terminología técnica precisa (ej: "rodamiento" en vez de "balinera", "contactor" en vez de "cosito eléctrico").
          2. Mantén un tono formal y objetivo.
          3. Sé conciso pero incluye los detalles importantes.
          4. Corrige ortografía y gramática.
          5. El formato debe ser: "Acción realizada + Componente/Equipo + Detalles específicos".
          
          Categoría de la actividad: ${category}`
                },
                {
                    role: "user",
                    content: roughNotes
                }
            ],
            temperature: 0.3,
            max_tokens: 150,
        });

        return response.choices[0]?.message?.content || roughNotes;
    } catch (error) {
        console.error('Error generating description:', error);
        throw error;
    }
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface ActivityContext {
    area: string;
    equipment: string;
    specialty: string;
    workType: string;
    os?: string;
}

export async function generateStructuredActivityLog(
    context: ActivityContext,
    userMessage: string,
    chatHistory: ChatMessage[] = []
): Promise<{ reply: string; description: string | null; novedad: string | null }> {
    if (!apiKey) {
        throw new Error('OpenAI API Key not configured');
    }

    try {
        const systemPrompt = `Eres un asistente técnico de mantenimiento en Extractora La Gloria.

CONTEXTO DE LA ACTIVIDAD:
- Área: ${context.area}
- Equipo: ${context.equipment}
- Especialidad: ${context.specialty}
- Tipo de trabajo: ${context.workType}
${context.os ? `- Orden de servicio: ${context.os}` : ''}

TU TAREA:
1. Conversa de forma natural con el técnico para obtener detalles de la actividad
2. Cuando tengas suficiente información, genera:
   - "description": Descripción técnica profesional de la actividad
   - "novedad": Si hubo algún problema, pendiente o novedad (null si no aplica)

FORMATO DE RESPUESTA:
- Si necesitas más información: Responde con preguntas naturales
- Si ya tienes suficiente info: Responde con un JSON así:
{
  "description": "Descripción técnica profesional aquí",
  "novedad": "Novedad o pendiente (o null)"
}

Sé conversacional, amigable pero profesional.`;

        const messages: any[] = [
            { role: 'system', content: systemPrompt },
            ...chatHistory,
            { role: 'user', content: userMessage }
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            temperature: 0.7,
            max_tokens: 300
        });

        const reply = response.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.';

        // Try to parse JSON response
        try {
            const jsonMatch = reply.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    reply: '✅ Perfecto, he generado el resumen de tu actividad. Revísalo y confírmalo.',
                    description: parsed.description,
                    novedad: parsed.novedad || null
                };
            }
        } catch {
            // Not JSON, just a conversational reply
        }

        return {
            reply,
            description: null,
            novedad: null
        };
    } catch (error) {
        console.error('Error in generateStructuredActivityLog:', error);
        throw error;
    }
}

