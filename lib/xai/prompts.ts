/**
 * System + user prompts for Grok (xAI).
 * El modelo debe responder SOLO al contenido real del post/comentario.
 */

import type { Intensity, Mode, ReplyFocus, ReplyLength } from "../eristico-engine";
import type { WriteStyleId } from "../knowledge/styles";
import { FOCUS_GUIDE, LENGTH_GUIDE } from "../eristico-engine";
import { INTENSITY_GUIDE } from "../knowledge/persuasion";
import { WRITE_STYLES } from "../knowledge/styles";
import { SYSTEM_PROMPT_CORE } from "../knowledge/persuasion";
import { analyzeContent } from "../content-analysis";

export type GenerateRequestBody = {
  mode: Mode;
  intensity: Intensity;
  focus: ReplyFocus;
  length: ReplyLength;
  writeStyle?: WriteStyleId;
  opponentText: string;
  stanceText?: string;
  postText?: string;
  personName?: string;
  personRole?: string;
  personContext?: string;
  narrativeIntent?: string;
  researchNotes?: string;
  seed?: number;
};

export type GrokGeneratePayload = {
  analysis: string;
  attackProfile: string;
  plainSummary: string;
  weakPoints: Array<{ title: string; detail: string; howToWin: string }>;
  winLevers: string[];
  avoid: string[];
  researchLeads: string[];
  searchQueries: string[];
  variants: Array<{
    id: string;
    label: string;
    angle: string;
    text: string;
    stratagemIds: number[];
  }>;
  council?: {
    synthesis: string;
    turns: Array<{
      agentId: string;
      agentName: string;
      color: string;
      read: string;
      move: string;
    }>;
  };
  source: "xai" | "gemini" | "nvidia" | "grok" | "local";
  model: string;
};

export function buildSystemPrompt(): string {
  return `${SYSTEM_PROMPT_CORE}

REGLAS CRÍTICAS DE COHERENCIA (obligatorias):
1. Lee el POST o COMENTARIO completo. Tu respuesta debe rebatir ESE claim, no un fantasma ni una cita rota.
2. NUNCA cites a mitad de frase ni inventes un extracto sin sentido. Si citas, usa una oración completa del texto original.
3. Si el texto trae cifras (%, fechas, "bajó", "subió"), ataca fuente, metodología, definición, recorte temporal y saltos causales — no pidas "un caso" genérico si ya trajeron agregados.
4. Si pide un POST propio (no solo reply), escribe un post publicable coherente con la narrativa y postura del usuario.
5. Frases completas. Sin censura blanda. Sin tecnicismos de adorno. Español natural de redes.
6. Entrega EXACTAMENTE el JSON pedido. Sin markdown fuera del JSON. Sin \`\`\`.
7. Cada variante debe ser distinta en ángulo pero TODAS ancladas al mismo claim real.
8. stratagemIds: usa números 1-38 de Schopenhauer relevantes (ej. 1,4,5,6,9,12,15,16).`;
}

export function buildUserPrompt(body: GenerateRequestBody): string {
  const post = (body.postText || "").trim();
  const opponent = (body.opponentText || post).trim();
  const analysis = analyzeContent(opponent || post || "");
  const style = WRITE_STYLES.find((s) => s.id === (body.writeStyle || "eristico"));
  const isPro = body.mode === "pro";

  const lengthHint =
    body.length === "corta"
      ? "2-4 oraciones por variante"
      : body.length === "larga"
        ? "8-12 oraciones por variante, densas pero legibles"
        : "4-7 oraciones por variante";

  return `MODO: ${body.mode}
INTENSIDAD: ${INTENSITY_GUIDE[body.intensity].label} — ${INTENSITY_GUIDE[body.intensity].style}
ENFOQUE: ${FOCUS_GUIDE[body.focus].label} — ${FOCUS_GUIDE[body.focus].style}
LARGO: ${LENGTH_GUIDE[body.length].label} (${lengthHint})
ESTILO DE ESCRITURA: ${style?.label || "Erístico"} — ${(style?.rules || []).join(" ")}

=== TEXTO DEL OPONENTE / POST A COMBATIR (FUENTE DE VERDAD) ===
${opponent || "(vacío)"}

=== TEXTO DEL POST (si difiere del ataque) ===
${post && post !== opponent ? post : "(igual o no aplica)"}

=== POSTURA DEL USUARIO (lo que debe ganar en el hilo) ===
${(body.stanceText || "").trim() || "(no declarada: infiere un marco de sentido común crítico)"}

=== NARRATIVA QUE QUIERE IMPONER ===
${(body.narrativeIntent || body.stanceText || "").trim() || "(no declarada)"}

=== FICHA DEL PERSONAJE / EMISOR ===
Nombre: ${(body.personName || "").trim() || "desconocido"}
Rol: ${(body.personRole || "").trim() || "desconocido"}
Contexto: ${(body.personContext || "").trim() || "n/a"}

=== INTEL / RESEARCH (si hay) ===
${(body.researchNotes || "").trim() || "sin research externo"}

=== ANÁLISIS LOCAL DE APOYO (puedes corregirlo si está mal, pero no ignores el texto original) ===
Tipo detectado: ${analysis.kindLabel}
Claim resumido: ${analysis.claimSummary}
Cita segura: ${analysis.safeQuote}
Temas: ${analysis.topics.join(", ") || "n/a"}
Cifras: ${[...analysis.percents, ...analysis.numbers].slice(0, 8).join(", ") || "ninguna"}
Ángulos de desmontaje: ${analysis.dismantleAngles.join(" | ")}
Preguntas de ataque: ${analysis.attackQuestions.join(" | ")}

=== TAREA ===
Genera análisis táctico + ${isPro ? "consejo multi-agente (5 voces) + " : ""}3 variantes de texto LISTO PARA PUBLICAR (comentario o post).
Las 3 variantes:
- A "Marco": reencuadra el claim real del texto.
- B "Prueba": carga de la prueba / fuente / método anclado a SUS cifras o afirmaciones.
- C "Público": habla a la audiencia del feed, tribalismo suave, punchline.

${isPro ? `Consejo multi-agente con exactamente estos agentId: schopenhauer, influencia, masas, narrativa, diablo.
Colores sugeridos: schopenhauer #e91e8c, influencia #7c5cff, masas #ff6b5e, narrativa #ffd84d, diablo #9a94b0.
Cada turn: read (qué ve en ESTE texto) + move (golpe concreto contra ESTE claim).` : "NO incluyas council (o ponlo null)."}

Responde SOLO con este JSON (sin texto fuera):
{
  "analysis": "string breve táctico",
  "attackProfile": "string",
  "plainSummary": "qué dice realmente el post/comentario",
  "weakPoints": [{"title":"","detail":"","howToWin":""}],
  "winLevers": ["..."],
  "avoid": ["..."],
  "researchLeads": ["..."],
  "searchQueries": ["queries útiles en español"],
  "variants": [
    {"id":"v1","label":"Variante A · Marco","angle":"...","text":"texto publicable completo","stratagemIds":[1,12,15]},
    {"id":"v2","label":"Variante B · Prueba","angle":"...","text":"...","stratagemIds":[15,4,1]},
    {"id":"v3","label":"Variante C · Público","angle":"...","text":"...","stratagemIds":[9,5,6]}
  ],
  "council": ${isPro ? `{ "synthesis":"...", "turns":[ {"agentId":"schopenhauer","agentName":"Schopenhauer","color":"#e91e8c","read":"...","move":"..."}, ... ] }` : "null"}
}`;
}

export function parseGrokJson(raw: string): GrokGeneratePayload | null {
  let t = raw.trim();
  // quitar fences si el modelo las pone
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  t = t.slice(start, end + 1);
  try {
    const data = JSON.parse(t) as GrokGeneratePayload;
    if (!data.variants || !Array.isArray(data.variants) || data.variants.length < 1) return null;
    // normalizar textos
    data.variants = data.variants.slice(0, 5).map((v, i) => ({
      id: v.id || `v${i + 1}`,
      label: v.label || `Variante ${i + 1}`,
      angle: v.angle || "",
      text: String(v.text || "").trim(),
      stratagemIds: Array.isArray(v.stratagemIds) ? v.stratagemIds.filter((n) => typeof n === "number") : [],
    })).filter((v) => v.text.length > 20);
    if (!data.variants.length) return null;
    data.source = data.source || "xai";
    return data;
  } catch {
    return null;
  }
}
