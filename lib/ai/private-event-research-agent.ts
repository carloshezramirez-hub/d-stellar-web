import Anthropic from "@anthropic-ai/sdk";
import type { EventProspectDossier } from "./private-event-dossier";

const MODEL = "claude-sonnet-5";
export const CONFIDENCE_GATE = 85;

export interface EventOutreachPlan {
  confidence: number;
  send: boolean;
  evidenceLine: string;
  whatWeChecked: string[];
  emailSubject: string;
  emailBody: string;
}

const SEGMENT_ANGLE: Record<EventProspectDossier["segment"], string> = {
  marca:
    "Este prospecto es una agencia/marca — el ángulo es una activación o colaboración de marca: un espacio con identidad propia y buena reputación real, a un paso de su oficina, para algo distinto a un salón de eventos genérico.",
  corporativo:
    "Este prospecto es una oficina/coworking — el ángulo es un offsite o evento de equipo pequeño: algo distinto a la sala de juntas de siempre, sin necesidad de trasladarse lejos.",
  comunidad:
    "Este prospecto es una organización comunitaria/sin fines de lucro — el ángulo es un espacio seguro y cercano para un taller o reunión, coherente con que d-stellar es un espacio trans-safe LGBTQ+.",
  particulares:
    "Este prospecto organiza eventos para terceros (wedding planner, organizador de eventos) — el ángulo es sumar d-stellar como una opción de venue íntimo y diferenciado en su propio catálogo de espacios para futuros clientes.",
};

const SYSTEM_PROMPT = `Eres el agente de investigación-a-copy para d-stellar, una tienda de cookies y espacio íntimo LGBTQ+/trans-safe en Hipódromo Condesa, CDMX. d-stellar renta su espacio completo fuera de horario para eventos privados pequeños (cumpleaños, activaciones de marca, talleres, offsites). Tu tarea es escribir el PRIMER correo en frío a un negocio real cercano, invitándolo a considerar el espacio para su próximo evento.

A diferencia de un cold email típico de "arreglamos algo roto en tu negocio", aquí NO hay ninguna debilidad del prospecto que se esté señalando — el prospecto no tiene nada mal. La evidencia real que sostiene la personalización son otras tres cosas, todas verificadas, nunca inventadas:
1. La distancia CAMINABLE real (ya calculada, no estimada) entre el prospecto y d-stellar.
2. La reputación real de d-stellar (rating y número de reseñas reales de Google, y una cita textual real de una reseña).
3. La categoría real del propio prospecto (de qué tipo de negocio es, según Google Places) — de ahí sale el ángulo del pitch.

HARD RULES — si las violas, debes poner send=false:
- NUNCA inventes, estimes o asumas ningún dato que no esté en el dossier. Nada de cifras, nombres, rankings de Google no medidos, ni afirmaciones sobre lo que el prospecto "necesita" o "le falta" — no lo sabes, no está en el dossier.
- NUNCA abras con elogio genérico ("¡Qué bien se ve su negocio!", "Vi que tienen excelentes reseñas").
- NUNCA uses relleno de cold email genérico ("Espero que estés bien", "Me encontré con su sitio", "Ayudamos a negocios como el suyo").
- Dirígete por nombre de pila SOLO si el dossier trae un contactName real; si no, dirígete al negocio/equipo de forma natural, sin llamar la atención sobre no saber el nombre.
- El nombre real del negocio prospecto (businessName) debe aparecer al menos una vez, integrado naturalmente.
- El correo debe tener EXACTAMENTE un llamado a la acción, de baja fricción — "responde y te cuento disponibilidad", nunca "agenda una llamada de 30 minutos".
- NO menciones precio ni tarifas en este primer correo.
- Incluye siempre, de forma natural (puede ser parte del cierre), una línea de opt-out — algo como "si prefieres que no te escribamos de nuevo, contesta este correo y no insistimos".
- El lector debe sentir "de verdad me investigaron y calcularon que está cerca", nunca "esto es una plantilla con el nombre cambiado". Si el dossier no da para eso, pon send=false en vez de forzar relleno genérico.
- Escribe todo en español natural de México, tono cálido pero directo — nunca corporativo/rígido.

Autoevalúa tu confianza (0-100) honestamente: si la distancia caminable y el ángulo del segmento no alcanzan para sentirse genuinamente personal, confidence debe quedar debajo de 85 y send=false.

Responde SOLO llamando la herramienta submit_event_outreach_plan.`;

const TOOL: Anthropic.Tool = {
  name: "submit_event_outreach_plan",
  description: "Envía el plan de outreach terminado y verificado para este prospecto.",
  input_schema: {
    type: "object",
    properties: {
      confidence: { type: "integer", minimum: 0, maximum: 100 },
      send: { type: "boolean" },
      evidenceLine: {
        type: "string",
        description: "La observación más concreta y verificable (distancia caminable + algo real del prospecto)",
      },
      whatWeChecked: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
      emailSubject: { type: "string" },
      emailBody: {
        type: "string",
        description: "Correo en texto plano, 80-150 palabras, párrafos separados por línea en blanco, firmado '— Hernán, d-stellar'",
      },
    },
    required: ["confidence", "send", "evidenceLine", "whatWeChecked", "emailSubject", "emailBody"],
  },
};

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY no está configurada.");
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

/**
 * Llama al research agent (Claude) con el dossier de hechos verificados de
 * un prospecto y devuelve el plan de outreach, o null solo si la llamada a
 * la API falló — en ese caso la regla es NO ENVIAR, nunca degradar a un
 * template genérico.
 *
 * A propósito NO aplica aquí el gate de confianza (`confidence >= 85`):
 * lo decide el caller, que también es responsable de persistir el plan
 * completo SIEMPRE, incluso cuando el gate no se cumple.
 */
export async function generateEventOutreachPlan(dossier: EventProspectDossier): Promise<EventOutreachPlan | null> {
  const system = `${SYSTEM_PROMPT}\n\nÁngulo para este segmento (${dossier.segment}): ${SEGMENT_ANGLE[dossier.segment]}`;
  const userContent = JSON.stringify(dossier, null, 2);

  try {
    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 2000,
      system,
      tools: [TOOL],
      tool_choice: { type: "tool", name: TOOL.name },
      messages: [{ role: "user", content: userContent }],
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") return null;

    return toolUse.input as EventOutreachPlan;
  } catch (err) {
    console.error("[private-event-research-agent]", err);
    return null;
  }
}
