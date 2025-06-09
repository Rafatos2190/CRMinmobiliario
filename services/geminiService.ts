import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { GEMINI_TEXT_MODEL, GEMINI_JSON_MODEL } from '../constants';
import { Property, PropertyType, GroundingChunk, PropertyValuationResult, LandingPageParams, LandingPageContent, LandingPageFeature, LandingPageProcessStep } from "../types";

// IMPORTANT: API_KEY must be set in the environment variables for this service to work.
// e.g., process.env.API_KEY
// The application should handle the case where the API key is not available gracefully.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY && API_KEY !== "undefined_API_KEY") { // Check if API_KEY is actually set
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.warn("Gemini API Key is not configured. AI features will be disabled.");
}

export const isGeminiAvailable = (): boolean => !!ai;

// Export the AI instance for more flexible usage if needed, like creating custom chat sessions.
export const getGenAIInstance = (): GoogleGenAI | null => ai;

export const generatePropertyDescription = async (
    propertyType: PropertyType,
    features: string,
    location: string,
    bedrooms?: number,
    bathrooms?: number,
    area?: number
): Promise<string> => {
  if (!ai) return "Servicio de IA no disponible. Verifique la configuración de API Key.";

  let prompt = `Eres un experto agente inmobiliario. Genera una descripción atractiva y profesional para una propiedad.
Tipo de Propiedad: ${propertyType}
Ubicación: ${location}
Características principales: ${features}`;

  if (bedrooms) prompt += `\nNúmero de Habitaciones: ${bedrooms}`;
  if (bathrooms) prompt += `\nNúmero de Baños: ${bathrooms}`;
  if (area) prompt += `\nÁrea: ${area} m²`;

  prompt += "\n\nLa descripción debe ser persuasiva, destacar los beneficios clave y tener un tono profesional pero acogedor. Longitud aproximada: 100-150 palabras.";
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating property description:", error);
    return "Error al generar descripción. Intente de nuevo.";
  }
};

export const suggestWhatsAppMessage = async (
    clientName: string,
    context: string, // e.g., "follow-up on property X", "new listing that matches preferences"
    property?: Property
): Promise<string> => {
    if (!ai) return "Servicio de IA no disponible.";

    let prompt = `Eres un asistente virtual para un agente inmobiliario. Redacta un mensaje de WhatsApp amigable y profesional para un cliente.
Nombre del Cliente: ${clientName}
Contexto: ${context}`;

    if (property) {
        prompt += `\n\nDetalles de la Propiedad Relevante:
Dirección: ${property.address}
Tipo: ${property.type}
Precio: ${property.price.toLocaleString('es-SV', { style: 'currency', currency: 'USD' })}`; 
    }

    prompt += "\n\nEl mensaje debe ser conciso, incluir un llamado a la acción (ej. agendar visita, solicitar más información), y mantener un tono cordial. Evita usar emojis excesivamente.";

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error suggesting WhatsApp message:", error);
        return "Error al generar sugerencia de mensaje.";
    }
};

export const suggestMessengerMessage = async (
    clientName: string,
    context: string,
    property?: Property
): Promise<string> => {
    if (!ai) return "Servicio de IA no disponible.";

    let prompt = `Eres un asistente virtual para un agente inmobiliario. Redacta un mensaje para Facebook Messenger amigable y profesional para un cliente.
Nombre del Cliente: ${clientName}
Contexto: ${context}`;

    if (property) {
        prompt += `\n\nDetalles de la Propiedad Relevante:
Dirección: ${property.address}
Tipo: ${property.type}
Precio: ${property.price.toLocaleString('es-SV', { style: 'currency', currency: 'USD' })}`;
    }

    prompt += "\n\nEl mensaje debe ser conciso, incluir un llamado a la acción (ej. agendar visita, solicitar más información), y mantener un tono cordial y profesional. Evita usar emojis excesivamente.";

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error suggesting Messenger message:", error);
        return "Error al generar sugerencia de mensaje para Messenger.";
    }
};


export const getMarketAnalysis = async (
  location: string,
  propertyType: PropertyType
): Promise<{ analysis: string; sources: GroundingChunk[] }> => {
  if (!ai) return { analysis: "Servicio de IA no disponible.", sources: [] };

  const prompt = `Proporciona un breve análisis del mercado inmobiliario actual para propiedades de tipo "${propertyType}" en la zona de "${location}". Incluye tendencias de precios, demanda y cualquier factor relevante para compradores o vendedores.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    const analysisText = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { analysis: analysisText, sources: sources.filter(s => s.web || s.retrievedContext) };
  } catch (error) {
    console.error("Error getting market analysis:", error);
    if (error instanceof Error && error.message.includes("application/json") && error.message.includes("googleSearch")) {
        return { 
            analysis: "Error: El tipo de respuesta JSON no es compatible con la herramienta de búsqueda de Google. Por favor, contacte al administrador.", 
            sources: [] 
        };
    }
    return { analysis: "Error al obtener análisis de mercado.", sources: [] };
  }
};

// General purpose chat instance, can be used for things like a general assistant inside the CRM
let generalChatInstance: Chat | null = null;

export const startGeneralChat = (systemInstruction?: string) => {
    if (!ai) {
        console.warn("AI service not available to start general chat.");
        return;
    }
    generalChatInstance = ai.chats.create({
        model: GEMINI_TEXT_MODEL,
        config: {
            systemInstruction: systemInstruction || "Eres un útil asistente de CRM inmobiliario.",
        },
    });
    console.log("General purpose chat started.");
};

export const sendMessageToGeneralChat = async (userMessageContent: string): Promise<string> => {
    if (!generalChatInstance) {
        startGeneralChat(); 
        if (!generalChatInstance) return "El chat general no está disponible.";
    }
    try {
        const response: GenerateContentResponse = await generalChatInstance!.sendMessage({ message: userMessageContent });
        return response.text;
    } catch (error) {
        console.error("Error sending message to general chat:", error);
        return "Error al comunicarse con el chat general.";
    }
};

export const createChatSession = (systemInstruction: string): Chat | null => {
    if (!ai) {
        console.warn("AI service not available to create a new chat session.");
        return null;
    }
    try {
        const chat = ai.chats.create({
            model: GEMINI_TEXT_MODEL,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return chat;
    } catch (error) {
        console.error("Error creating new chat session:", error);
        return null;
    }
};

export const generateEmailCampaignContent = async (
    goal: string,
    keyPoints?: string,
    property?: Property
): Promise<{ subject: string; body: string }> => {
    if (!ai) {
        return {
            subject: "Servicio de IA no disponible",
            body: "El servicio de IA no está disponible. Verifique la configuración de API Key."
        };
    }

    let propertyDetails = "";
    if (property) {
        propertyDetails = `
Detalles de la Propiedad Relevante:
Dirección: ${property.address}
Tipo: ${property.type}
Precio: ${property.price.toLocaleString('es-SV', { style: 'currency', currency: 'USD' })}
${property.bedrooms ? `Habitaciones: ${property.bedrooms}\n` : ''}${property.bathrooms ? `Baños: ${property.bathrooms}\n` : ''}${property.areaSqMeters ? `Área: ${property.areaSqMeters} m²\n` : ''}Descripción Corta: ${property.description.substring(0,150)}...
`;
    }

    const prompt = `
Eres un experto en marketing inmobiliario digital. Tu tarea es redactar el contenido para una campaña de email marketing.

Objetivo de la campaña: ${goal}
${keyPoints ? `Puntos clave a incluir o destacar: ${keyPoints}` : ''}
${propertyDetails}

El correo debe tener:
1. Un Asunto (subject) atractivo, conciso y que genere curiosidad (máximo 70 caracteres).
2. Un Cuerpo del Email (body) profesional, persuasivo y amigable.
   - Utiliza "[Nombre del Cliente]" como placeholder para el saludo personalizado (ej. "Hola [Nombre del Cliente],").
   - Incluye una introducción clara del propósito del correo.
   - Desarrolla los puntos clave o detalles de la propiedad de forma atractiva.
   - Incorpora un llamado a la acción claro y motivador (ej. "Agenda una visita hoy mismo", "Descubre más sobre esta oportunidad", "Contáctanos para más información").
   - Finaliza con una despedida profesional (ej. "Saludos cordiales,\nEl Equipo de [Nombre Inmobiliaria]").

Formato de respuesta:
Debes devolver EXCLUSIVAMENTE un objeto JSON válido con las claves "subject" (string) y "body" (string). Asegúrate de que el JSON esté bien formado.
Ejemplo de respuesta JSON válida:
{
  "subject": "¡Tu nuevo hogar te espera en [Zona Destacada]!",
  "body": "Hola [Nombre del Cliente],\\n\\nTenemos el placer de presentarte una oportunidad única en [Zona Destacada]. Si estás buscando [Característica principal], ¡esto te interesa!\\n\\n[Desarrollo del contenido, descripción de la propiedad o promoción]\\n\\nNo dejes pasar esta oportunidad. Para más información o para agendar una visita, haz clic aquí: [Enlace o Instrucción]\\n\\nEstaremos encantados de atenderte.\\n\\nSaludos cordiales,\\nEl Equipo de Tu Inmobiliaria Ideal"
}
`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_JSON_MODEL, 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        const parsed = JSON.parse(jsonStr);
        if (parsed.subject && parsed.body) {
            return { subject: parsed.subject, body: parsed.body };
        } else {
            console.error("Generated JSON does not contain subject and body:", parsed);
            return { subject: "Error en formato IA", body: "La IA generó una respuesta en un formato inesperado." };
        }

    } catch (error) {
        console.error("Error generating email campaign content:", error);
        return { subject: "Error de IA", body: `Error al generar contenido con IA: ${error instanceof Error ? error.message : String(error)}` };
    }
};


export const generateAdCopy = async (
    platform: string,
    productDescription: string,
    targetAudience: string,
    keyMessage: string,
    callToAction: string,
    tone?: string
): Promise<string> => {
    if (!ai) return "Servicio de IA no disponible. Verifique la configuración de API Key.";

    let prompt = `Eres un experto redactor publicitario especializado en anuncios para redes sociales. 
Tu tarea es crear un texto de anuncio convincente y efectivo.

Plataforma de Red Social: ${platform}
Producto/Servicio/Propiedad a promocionar: ${productDescription}
Público Objetivo: ${targetAudience}
Mensaje Clave / Beneficio Principal: ${keyMessage}
Llamada a la Acción (CTA): ${callToAction}`;

    if (tone && tone !== "General") {
        prompt += `\nTono del Anuncio: ${tone}`;
    }

    prompt += `\n\nConsideraciones Específicas:
- El anuncio debe ser atractivo, conciso y optimizado para la plataforma "${platform}".
- Si la plataforma es Instagram o TikTok, sugiere también hashtags relevantes (ej. #hashtag1 #hashtag2).
- Si la plataforma es Facebook o LinkedIn, enfócate en un texto un poco más descriptivo pero igualmente directo.
- Para "General", crea un texto versátil que pueda adaptarse fácilmente.
- Evita el uso excesivo de mayúsculas o emojis a menos que el tono lo justifique (ej. "Divertido").
- El texto debe ser original y creativo.

Devuelve únicamente el texto del anuncio generado.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating ad copy:", error);
        return `Error al generar el anuncio con IA: ${error instanceof Error ? error.message : String(error)}`;
    }
};

export const estimatePropertyValue = async (
    propertyDetails: {
        address: string;
        type: PropertyType;
        areaSqMeters?: number;
        bedrooms?: number;
        bathrooms?: number;
        features?: string;
        marketPricePerSqM?: number; // User's reference for CNR/CASALCO like data
        marketNotes?: string; // User's reference for CNR/CASALCO like data
    }
): Promise<PropertyValuationResult> => {
    if (!ai) {
        return {
            valueRange: "N/A",
            justification: "Servicio de IA no disponible. Verifique la configuración de API Key.",
            sources: [],
        };
    }

    let prompt = `Eres un experto tasador inmobiliario con profundo conocimiento del mercado de El Salvador.
Tu tarea es estimar el valor de una propiedad basándote en los siguientes detalles.
Si el usuario proporciona "Precio Promedio por m² en la Zona" o "Notas del Mercado Local", considéralos como datos de referencia importantes del mercado (similares a los que podrían provenir del CNR o CASALCO).
Si no se proporcionan esos datos de mercado específicos, utiliza tu conocimiento general y la herramienta de búsqueda de Google para encontrar tendencias actuales y precios comparables en el mercado inmobiliario de El Salvador para la zona y tipo de propiedad indicados.

Detalles de la Propiedad:
- Dirección: ${propertyDetails.address}
- Tipo de Propiedad: ${propertyDetails.type}
${propertyDetails.areaSqMeters ? `- Área: ${propertyDetails.areaSqMeters} m²` : ''}
${propertyDetails.bedrooms ? `- Habitaciones: ${propertyDetails.bedrooms}` : ''}
${propertyDetails.bathrooms ? `- Baños: ${propertyDetails.bathrooms}` : ''}
${propertyDetails.features ? `- Características Adicionales/Estado: ${propertyDetails.features}` : ''}

Datos de Mercado Proporcionados por el Usuario (Considerar como referencias importantes):
${propertyDetails.marketPricePerSqM ? `- Precio Promedio por m² en la Zona (referencia usuario): $${propertyDetails.marketPricePerSqM}` : '- (No se proporcionó precio promedio por m² por el usuario)'}
${propertyDetails.marketNotes ? `- Notas del Mercado Local (referencia usuario): ${propertyDetails.marketNotes}` : '- (No se proporcionaron notas del mercado local por el usuario)'}

Por favor, proporciona tu estimación en el siguiente formato JSON:
{
  "valueRange": "Un rango de precio estimado en USD (ej. '$80,000 - $95,000 USD')",
  "justification": "Una explicación detallada de cómo llegaste a esta estimación, mencionando los factores clave considerados (ubicación, tipo, tamaño, características, estado, datos de mercado proporcionados por el usuario y/o tendencias generales encontradas en la búsqueda si aplica). Si usaste búsqueda, menciona brevemente qué tipo de información encontraste."
}

Indica siempre los precios en USD.
Si utilizas la herramienta de búsqueda de Google para información del mercado general, asegúrate de que las fuentes se incluyan en la respuesta.
Sé lo más realista posible para el mercado salvadoreño.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_JSON_MODEL, // This model should be capable of returning JSON.
            contents: prompt,
            config: {
                // responseMimeType: "application/json", // REMOVED: This was causing the "Tool use... unsupported" error
                tools: [{ googleSearch: {} }], 
            }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const parsed = JSON.parse(jsonStr);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        if (parsed.valueRange && parsed.justification) {
            return {
                valueRange: parsed.valueRange,
                justification: parsed.justification,
                sources: sources.filter(s => s.web || s.retrievedContext),
                rawResponse: response.text // For debugging
            };
        } else {
            console.error("Generated JSON does not contain valueRange and justification:", parsed);
            return { valueRange: "Error en formato IA", justification: `La IA generó una respuesta en un formato inesperado. Raw: ${response.text}`, sources: [] };
        }

    } catch (error) {
        console.error("Error estimating property value:", error);
        let errorMessage = `Error al estimar valor con IA: ${error instanceof Error ? error.message : String(error)}`;
        // Check if the error message is the specific one we are trying to avoid
        if (error instanceof Error && error.message.includes("Tool use with a response mime type") && error.message.includes("application/json")) {
            errorMessage = "Error de configuración de API: La solicitud de JSON estructurado no es compatible con la búsqueda de Google en este modelo/configuración. La IA intentará devolver JSON en texto plano.";
        }
        return { 
            valueRange: "Error de IA", 
            justification: errorMessage,
            sources: [] 
        };
    }
};

export const suggestManualReply = async (
    receivedMessage: string,
    context?: string
): Promise<string> => {
    if (!ai) return "Servicio de IA no disponible. Verifique la configuración de API Key.";

    let prompt = `Eres un asistente experto de un agente inmobiliario. Has recibido un mensaje de un cliente y necesitas redactar una respuesta.
    
Mensaje Recibido del Cliente:
---
${receivedMessage}
---
`;

    if (context && context.trim()) {
        prompt += `
Contexto Adicional (Información que tienes sobre este cliente o situación):
---
${context}
---
`;
    }

    prompt += `
Tu Tarea:
Redacta una respuesta profesional, amigable y útil para el cliente. 
- Si es una pregunta, intenta responderla.
- Si es una solicitud, indica cómo procederás.
- Si es un comentario general, responde apropiadamente.
- Mantén un tono positivo y servicial.
- Sé conciso pero completo.
- Si es pertinente, incluye un llamado a la acción (ej. "¿Te gustaría agendar una visita?", "¿Necesitas más detalles sobre X?").
- Dirígete al cliente de forma respetuosa.

Devuelve ÚNICAMENTE el texto de la respuesta sugerida. No incluyas saludos como "Claro, aquí tienes una sugerencia:" o despedidas. Solo la respuesta que el agente debería enviar.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error suggesting manual reply:", error);
        return `Error al generar la sugerencia de respuesta con IA: ${error instanceof Error ? error.message : String(error)}`;
    }
};

export const generatePropertyListingOffer = async (
    agencyName: string,
    serviceFocus: string
): Promise<string> => {
    if (!ai) return "Servicio de IA no disponible. Verifique la configuración de API Key.";

    const prompt = `
Eres un experto en marketing inmobiliario y redactor publicitario persuasivo.
Tu tarea es generar un texto atractivo y convincente (aproximadamente 100-150 palabras) dirigido a propietarios de inmuebles, invitándolos a listar su propiedad con la agencia "${agencyName}".
Destaca los beneficios de trabajar con la agencia, mencionando su enfoque en "${serviceFocus}".
El tono debe ser profesional, confiable, pero también entusiasta y orientado a resultados.
Anímales a dejar sus datos para una valoración gratuita o más información sobre cómo pueden beneficiarse de tus servicios.
Devuelve solo el texto de la oferta. No incluyas saludos ni despedidas adicionales.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating property listing offer:", error);
        return `Error al generar la oferta con IA: ${error instanceof Error ? error.message : String(error)}`;
    }
};

export const generateRealEstateLandingPageContent = async (
    params: LandingPageParams
): Promise<LandingPageContent> => {
    if (!ai) {
        throw new Error("Servicio de IA no disponible. Verifique la configuración de API Key.");
    }

    const keyPointsFormatted = params.keyPoints.map(p => `- ${p}`).join("\n");

    const prompt = `
Eres un experto en copywriting y marketing digital inmobiliario, especializado en el mercado de ${params.language || 'El Salvador'}.
Tu tarea es generar el contenido textual para una landing page de embudo inmobiliario moderna y profesional.
Parámetros de la Landing Page:
- Objetivo del Embudo: ${params.objective}
- Público Objetivo: ${params.targetAudience}
- Propuesta Única de Valor (USP): ${params.usp}
- Puntos Clave a destacar (para la sección de características):
${keyPointsFormatted}
- Nombre de la Agencia: ${params.agencyName}
- Teléfono de Contacto: ${params.contactPhone || 'No especificado'}
- Email de Contacto: ${params.contactEmail || 'No especificado'}
- Idioma: ${params.language || 'es-SV'}

Devuelve EXCLUSIVAMENTE un objeto JSON bien formado con el siguiente contenido textual. Sé creativo, persuasivo, moderno y adapta el tono al público objetivo y al mercado especificado:

{
  "heroHeadline": "string (Titular principal impactante y conciso, ej: 'Tu Próximo Hogar de Ensueño te Espera')",
  "heroSubheadline": "string (Subtítulo que complemente el titular, añada valor y motive, ej: 'Descubre propiedades exclusivas en las mejores zonas de ${params.language || 'El Salvador'}.')",
  "heroCtaText": "string (Texto para el botón de llamada a la acción principal, ej: 'Explorar Propiedades Ahora')",
  "heroCTALink": "string (Opcional, Enlace para el CTA del héroe, ej: '#features' o '#contact')",
  "offerTitle": "string (Título para la sección de la oferta o USP, ej: 'La Diferencia de Trabajar con ${params.agencyName}')",
  "offerBody": "string (Texto desarrollando la USP o la oferta principal de forma convincente, 2-3 párrafos. Destaca beneficios claros.)",
  "featuresTitle": "string (Título para la sección de características/beneficios, ej: 'Beneficios que Marcan la Diferencia')",
  "features": [
    { "icon": "string (sugerir nombre de icono simple ej: 'home', 'key', 'users', 'map-pin', 'check-circle', 'star')", "title": "string (Título de la característica 1)", "description": "string (Descripción breve y persuasiva)" },
    { "icon": "string (sugerir icono)", "title": "string (Título de la característica 2)", "description": "string (Descripción)" },
    { "icon": "string (sugerir icono)", "title": "string (Título de la característica 3)", "description": "string (Descripción)" }
  ],
  "processSectionTitle": "string (Opcional, Título para la sección 'Nuestro Proceso', ej: 'Nuestro Proceso Simplificado Para Ti')",
  "processSteps": [
    { "icon": "string (sugerir icono ej: 'search', 'briefcase', 'handshake')", "title": "string (Título del paso 1)", "description": "string (Descripción breve del paso 1)" },
    { "icon": "string (sugerir icono)", "title": "string (Título del paso 2)", "description": "string (Descripción breve del paso 2)" },
    { "icon": "string (sugerir icono)", "title": "string (Título del paso 3)", "description": "string (Descripción breve del paso 3)" }
  ],
  "gallerySectionTitle": "string (Opcional, Título para la sección de galería de propiedades, ej: 'Propiedades Destacadas')",
  "testimonialSectionTitle": "string (Título para la sección de testimonios, ej: 'Lo Que Nuestros Clientes Opinan')",
  "finalCtaHeadline": "string (Titular para la sección final de llamada a la acción, ej: '¿Listo Para Encontrar Tu Lugar Ideal?')",
  "finalCtaSubheadline": "string (Opcional, Subtítulo para la sección final de CTA, ej: 'No esperes más, contáctanos hoy mismo.')",
  "finalCtaButtonText": "string (Texto para el botón de CTA final, ej: 'Solicitar Asesoría Gratuita')",
  "finalCTALink": "string (Opcional, Enlace para el CTA final, ej: '#contact-form')",
  "formContactTitle": "string (Opcional, Título para el formulario de contacto, ej: 'Hablemos de Tus Necesidades')",
  "footerText": "string (Texto para el pie de página. DEBE usar los placeholders {{agencyName}} y {{currentYear}}. Ej: '© {{currentYear}} {{agencyName}}. Todos los derechos reservados. Expertos en bienes raíces en ${params.language || 'El Salvador'}.')"
}

Asegúrate de que los textos sean concisos, orientados a la conversión y culturalmente relevantes para ${params.language || 'El Salvador'}. No uses markdown en los strings del JSON.
El 'footerText' DEBE usar los placeholders {{agencyName}} y {{currentYear}}.
Si se proporcionan datos de contacto (teléfono, email), puedes incorporarlos sutilmente en el footerText o en alguna CTA si tiene sentido.
Para las 'features' y 'processSteps', sugiere nombres de iconos simples si se te ocurren, si no, déjalo vacío o como null.
Los textos para los botones CTA deben ser imperativos y claros.
El contenido de 'offerBody' debe ser particularmente persuasivo y profesional.
Evita clichés y usa un lenguaje fresco y moderno.
`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_JSON_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Regex to remove markdown fences
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        const parsed = JSON.parse(jsonStr) as LandingPageContent;

        // Replace placeholders in footerText
        if (parsed.footerText) {
            parsed.footerText = parsed.footerText.replace(/\{\{agencyName\}\}/g, params.agencyName)
                                               .replace(/\{\{currentYear\}\}/g, new Date().getFullYear().toString());
        }
        // Ensure features is an array, even if AI fails
        if (!Array.isArray(parsed.features)) {
            parsed.features = [
                { title: "Beneficio Clave 1", description: "Descripción detallada de este beneficio.", icon: "star" },
                { title: "Beneficio Clave 2", description: "Descripción detallada de este beneficio.", icon: "check-circle" },
                { title: "Beneficio Clave 3", description: "Descripción detallada de este beneficio.", icon: "home" },
            ] as LandingPageFeature[];
        }
         // Ensure processSteps is an array if processSectionTitle exists
        if (parsed.processSectionTitle && !Array.isArray(parsed.processSteps)) {
            parsed.processSteps = [
                { title: "Paso 1: Consulta Inicial", description: "Entendemos tus necesidades y objetivos.", icon: "search" },
                { title: "Paso 2: Selección de Propiedades", description: "Te presentamos las mejores opciones del mercado.", icon: "briefcase" },
                { title: "Paso 3: Cierre Exitoso", description: "Te acompañamos hasta la entrega de llaves.", icon: "handshake" },
            ] as LandingPageProcessStep[];
        }


        return parsed;

    } catch (error) {
        console.error("Error generating landing page content:", error);
        throw new Error(`Error al generar contenido con IA: ${error instanceof Error ? error.message : String(error)}. Raw response: ${error instanceof Error && 'response' in error ? (error as any).response?.text : 'N/A'}`);
    }
};

export const findOnlinePropertiesElSalvador = async (
    keywords: string,
    propertyType?: PropertyType,
    location?: string
): Promise<{ summary: string; sources: GroundingChunk[] }> => {
    if (!ai) return { summary: "Servicio de IA no disponible.", sources: [] };

    let prompt = `Eres un asistente de búsqueda inmobiliaria especializado en El Salvador.
Tu tarea es encontrar propiedades en venta o alquiler en El Salvador basándote en los siguientes criterios.
Criterios de búsqueda principales: "${keywords}"`;

    if (propertyType) {
        prompt += `\nTipo de Propiedad: "${propertyType}"`;
    }
    if (location && location.trim()) {
        prompt += `\nUbicación Específica (si se puede refinar): "${location}"`;
    }

    prompt += `\n\nInstrucciones de Búsqueda y Filtrado:
- Utiliza Google Search para encontrar enlaces a:
  1. Portales inmobiliarios tradicionales (ej. Encuentra24, OLX El Salvador, etc.).
  2. Sitios de anuncios clasificados.
  3. Páginas de agencias inmobiliarias.
  4. Resultados de búsqueda en Facebook Marketplace que Google haya indexado.
  5. Perfiles públicos o páginas de Instagram y TikTok de agentes o inmobiliarias en El Salvador que anuncien propiedades (si Google los indexa).
  6. Grupos públicos de Facebook relevantes para bienes raíces en El Salvador.
- **Importante**: Intenta priorizar anuncios o publicaciones que parezcan tener una antigüedad de tres meses o menos. Si encuentras fechas de publicación o actualización en las páginas, tenlas en cuenta para enfocarte en lo más reciente.
- **Requisito Indispensable**: Todos los resultados proporcionados DEBEN ser exclusivamente del mercado inmobiliario de El Salvador. Descarta cualquier enlace o información que no pertenezca claramente a El Salvador.
- Prioriza fuentes conocidas y populares en El Salvador.
- Proporciona un breve resumen y los enlaces encontrados. Indica si un enlace parece ser de Facebook Marketplace, Instagram o TikTok.
- Ten en cuenta que la información de plataformas sociales puede ser menos directa o requerir iniciar sesión en dichas plataformas para ver detalles. La precisión del filtrado por fecha depende de la información disponible públicamente.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL, 
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        const summaryText = response.text || "Se encontraron algunos resultados. Revisa las fuentes a continuación.";
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        return { 
            summary: summaryText, 
            sources: sources.filter(s => s.web || s.retrievedContext) 
        };

    } catch (error) {
        console.error("Error finding online properties:", error);
        if (error instanceof Error && error.message.includes("application/json") && error.message.includes("googleSearch")) {
            return { 
                summary: "Error de configuración de API: El tipo de respuesta JSON no es compatible con la herramienta de búsqueda de Google para esta tarea. Por favor, contacte al administrador.", 
                sources: [] 
            };
        }
        return { summary: "Error al realizar la búsqueda de propiedades en línea.", sources: [] };
    }
};