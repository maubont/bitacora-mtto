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
            model: "gpt-3.5-turbo",
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
