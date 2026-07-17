/**
 * Prompts para Grok / Gemini / NVIDIA.
 * Postura del usuario = órdenes de entrega OBLIGATORIAS en cada variante.
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
  } | null;
  source: "xai" | "gemini" | "nvidia" | "grok" | "local";
  model: string;
};

export function lengthBudget(length: ReplyLength): {
  hint: string;
  minSentences: number;
  minChars: number;
  maxTokens: number;
  retryMaxTokens: number;
} {
  if (length === "corta") {
    return {
      hint: "CORTA: 3 a 5 oraciones completas por variante. Un solo bloque denso. Mínimo 280 caracteres por text.",
      minSentences: 3,
      minChars: 280,
      maxTokens: 1800,
      retryMaxTokens: 1400,
    };
  }
  if (length === "larga") {
    return {
      hint:
        "LARGA (OBLIGATORIO): cada variante.text debe tener MÍNIMO 18 oraciones y MÍNIMO 1400 caracteres. " +
        "Desarrolla: 1) apertura, 2) cátedra de datos/argumentos con varios puntos, 3) criterio y juicio, " +
        "4) desmontaje del claim, 5) cierre. NO resumas. NO acortes. Si te quedas corto, la respuesta se considera inválida.",
      minSentences: 18,
      minChars: 1400,
      maxTokens: 8192,
      retryMaxTokens: 6000,
    };
  }
  return {
    hint: "MEDIA: 7 a 11 oraciones completas por variante. Mínimo 650 caracteres por text.",
    minSentences: 7,
    minChars: 650,
    maxTokens: 3500,
    retryMaxTokens: 2800,
  };
}

export function buildSystemPrompt(): string {
  return `${SYSTEM_PROMPT_CORE}

REGLAS CRÍTICAS (obligatorias — si fallas una, fallas todo):

1. COHERENCIA CON EL POST: rebates el claim REAL del oponente/post. Citas solo oraciones completas.

2. INSTRUCCIONES DEL USUARIO (campo POSTURA / ÓRDENES DE ENTREGA):
   - Son ÓRDENES, no "contexto opcional".
   - Si el usuario dice "cátedra de datos", "criterio", "frases bíblicas", "tono X", "termina con…", etc.,
     CADA variante.text DEBE cumplir TODAS esas órdenes de forma visible y explícita.
   - Ejemplo: si pide frases bíblicas al final, el cierre de cada variante incluye al menos 1–2 versículos
     o alusiones bíblicas claras (citas reconocibles), no genéricas.
   - Si pide cátedra de datos: desarrolla varios puntos con hechos, cifras, definiciones, fuentes posibles,
     no un párrafo flojo.

3. LARGO: respeta el presupuesto de longitud del user message. "Larga" significa TEXTOS LARGOS de verdad.
   No entregues mini-comentarios si pidió larga.

4. Sin censura blanda. Frases completas. Español natural de redes.

5. JSON puro, sin markdown ni \`\`\`. Tres variantes distintas en ángulo, todas cumpliendo las órdenes del usuario.

6. stratagemIds: enteros 1–38 relevantes.`;
}

export function buildUserPrompt(body: GenerateRequestBody): string {
  const post = (body.postText || "").trim();
  const opponent = (body.opponentText || post).trim();
  const analysis = analyzeContent(opponent || post || "");
  const style = WRITE_STYLES.find((s) => s.id === (body.writeStyle || "eristico"));
  const isPro = body.mode === "pro";
  const budget = lengthBudget(body.length);
  const stance = (body.stanceText || "").trim();
  const narrative = (body.narrativeIntent || "").trim();

  return `MODO: ${body.mode}
INTENSIDAD: ${INTENSITY_GUIDE[body.intensity].label} — ${INTENSITY_GUIDE[body.intensity].style}
ENFOQUE: ${FOCUS_GUIDE[body.focus].label} — ${FOCUS_GUIDE[body.focus].style}
LARGO: ${LENGTH_GUIDE[body.length].label}
PRESUPUESTO DE LONGITUD: ${budget.hint}
  → Mínimo ${budget.minSentences} oraciones y ${budget.minChars} caracteres en CADA variants[].text
ESTILO: ${style?.label || "Erístico"} — ${(style?.rules || []).join(" ")}

=== TEXTO DEL OPONENTE / POST A COMBATIR (FUENTE DE VERDAD) ===
${opponent || "(vacío)"}

=== TEXTO DEL POST (si difiere) ===
${post && post !== opponent ? post : "(igual o no aplica)"}

=== ÓRDENES DE ENTREGA DEL USUARIO (OBLIGATORIAS EN CADA VARIANTE) ===
${stance || "(no declaró órdenes; usa criterio crítico de sentido común)"}

IMPORTANTE: Si hay órdenes arriba (ej. "ten criterio", "cátedra de datos", "termina con frases bíblicas"),
cada variants[].text debe:
- Mostrar criterio (juicio claro, no tibio).
- Si pidió cátedra/datos: desarrollar varios bloques con datos, definiciones y carga de prueba.
- Si pidió cierre bíblico (o similar): terminar con frases bíblicas explícitas.
- Cumplir CUALQUIER otra instrucción literal del usuario.

=== NARRATIVA / MENSAJE A IMPONER ===
${narrative || stance || "(no declarada)"}

=== FICHA DEL EMISOR ===
Nombre: ${(body.personName || "").trim() || "desconocido"}
Rol: ${(body.personRole || "").trim() || "desconocido"}
Contexto: ${(body.personContext || "").trim() || "n/a"}

=== INTEL / RESEARCH ===
${(body.researchNotes || "").trim() || "sin research externo"}

=== ANÁLISIS LOCAL DE APOYO ===
Tipo: ${analysis.kindLabel}
Claim: ${analysis.claimSummary}
Cita segura: ${analysis.safeQuote}
Temas: ${analysis.topics.join(", ") || "n/a"}
Cifras: ${[...analysis.percents, ...analysis.numbers].slice(0, 8).join(", ") || "ninguna"}
Ángulos: ${analysis.dismantleAngles.join(" | ")}
Preguntas: ${analysis.attackQuestions.join(" | ")}

=== TAREA ===
Genera análisis táctico + ${isPro ? "consejo multi-agente (5 voces) + " : ""}exactamente 3 variantes LISTAS PARA PUBLICAR.
Las 3 deben:
1) Atacar el claim real del oponente.
2) Cumplir al 100% las ÓRDENES DE ENTREGA.
3) Respetar el PRESUPUESTO DE LONGITUD (${body.length}).

Ángulos:
- A "Marco": reencuadra el claim + órdenes del usuario.
- B "Prueba / cátedra": datos, método, fuentes + órdenes del usuario.
- C "Público + cierre": audiencia del feed + órdenes del usuario (cierre bíblico si se pidió).

${isPro ? `Consejo multi-agente agentId: schopenhauer, influencia, masas, narrativa, diablo.
Colores: #e91e8c, #7c5cff, #ff6b5e, #ffd84d, #9a94b0.
Cada turn: read + move anclados a ESTE claim y a las órdenes del usuario.` : `"council": null`}

Responde SOLO con este JSON:
{
  "analysis": "breve: claim + cómo cumples las órdenes del usuario",
  "attackProfile": "string",
  "plainSummary": "qué dice el post/comentario",
  "weakPoints": [{"title":"","detail":"","howToWin":""}],
  "winLevers": ["..."],
  "avoid": ["..."],
  "researchLeads": ["..."],
  "searchQueries": ["..."],
  "variants": [
    {"id":"v1","label":"Variante A · Marco","angle":"...","text":"...TEXTO LARGO COMPLETO...","stratagemIds":[1,12,15]},
    {"id":"v2","label":"Variante B · Prueba","angle":"...","text":"...TEXTO LARGO COMPLETO...","stratagemIds":[15,4,1]},
    {"id":"v3","label":"Variante C · Público","angle":"...","text":"...TEXTO LARGO COMPLETO...","stratagemIds":[9,5,6]}
  ],
  "council": ${isPro ? `{ "synthesis":"...", "turns":[ {"agentId":"schopenhauer","agentName":"Schopenhauer","color":"#e91e8c","read":"...","move":"..."} ] }` : "null"}
}`;
}

export function parseGrokJson(raw: string): GrokGeneratePayload | null {
  let t = raw.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  t = t.slice(start, end + 1);
  try {
    const data = JSON.parse(t) as GrokGeneratePayload;
    if (!data.variants || !Array.isArray(data.variants) || data.variants.length < 1) return null;
    data.variants = data.variants
      .slice(0, 5)
      .map((v, i) => ({
        id: v.id || `v${i + 1}`,
        label: v.label || `Variante ${i + 1}`,
        angle: v.angle || "",
        text: String(v.text || "").trim(),
        stratagemIds: Array.isArray(v.stratagemIds)
          ? v.stratagemIds.filter((n) => typeof n === "number")
          : [],
      }))
      .filter((v) => v.text.length > 40);
    if (!data.variants.length) return null;
    data.source = data.source || "xai";
    return data;
  } catch {
    return null;
  }
}
