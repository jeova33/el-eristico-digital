/**
 * Prompts multi-LLM.
 * variants[].text = SOLO texto humano copiable (sin meta de IA).
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
      hint: "CORTA: 3–6 oraciones. Mínimo 280 caracteres. Un bloque natural de comentario.",
      minSentences: 3,
      minChars: 280,
      maxTokens: 2000,
      retryMaxTokens: 1600,
    };
  }
  if (length === "larga") {
    return {
      hint:
        "LARGA: como un post de grupo bien escrito. MÍNIMO 16 oraciones y 1200 caracteres por variants[].text. " +
        "Párrafos. Desarrollo real. NO un mini-reply.",
      minSentences: 16,
      minChars: 1200,
      maxTokens: 8192,
      retryMaxTokens: 6000,
    };
  }
  return {
    hint: "MEDIA: 7–12 oraciones. Mínimo 600 caracteres. Varios párrafos cortos.",
    minSentences: 7,
    minChars: 600,
    maxTokens: 4000,
    retryMaxTokens: 3000,
  };
}

/** Quita basura meta si el modelo se cuela en el texto publicable */
export function sanitizePublishableText(raw: string): string {
  let t = String(raw || "").trim();
  // Quitar bloques de análisis / etiquetas
  t = t.replace(/^#{1,3}\s*.*$/gm, "");
  t = t.replace(
    /^(An[aá]lisis\s+T[aá]ctico|El\s+Contraataque|Uso\s+la\s+|Estratagema\s*\d+|Gem\s+personalizada|El\s+Rey\s+de\s+la\s+Disputa).*$/gim,
    "",
  );
  t = t.replace(/\*?An[aá]lisis\s+T[aá]ctico\*?:?[\s\S]*?(?=(\n\n|$))/gi, "");
  t = t.replace(/\*?El\s+Contraataque\*?:?\s*/gi, "");
  t = t.replace(/\(Est\.?\s*\d+\)/gi, "");
  t = t.replace(/Estratagema\s*\d+/gi, "");
  t = t.replace(/Amplificaci[oó]n\s+Absurda/gi, "");
  t = t.replace(/Misil\s+Ad\s+Hominem/gi, "");
  t = t.replace(/Schopenhauer/gi, "");
  t = t.replace(/\bel oponente\b/gi, "esa postura");
  t = t.replace(/\bal oponente\b/gi, "a esa idea");
  t = t.replace(/\bdel oponente\b/gi, "de ese mensaje");
  t = t.replace(/\s{2,}/g, " ");
  t = t.replace(/\n{3,}/g, "\n\n");
  return t.trim();
}

export function buildSystemPrompt(): string {
  return `${SYSTEM_PROMPT_CORE}

REGLAS DE SALIDA JSON:
1. variants[].text = ÚNICAMENTE el texto que el usuario pega en el grupo. Voz humana. Sin meta.
2. analysis = solo para el panel de la app (ahí sí táctica).
3. Cumple ÓRDENES DEL USUARIO dentro del texto publicable (criterio, datos, bíblicas, etc.).
4. Responde al claim REAL del post. Citas solo oraciones completas del original si citas.
5. JSON puro, sin markdown.`;
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
PRESUPUESTO: ${budget.hint}
  → Mínimo ${budget.minSentences} oraciones y ${budget.minChars} caracteres en CADA variants[].text
ESTILO: ${style?.label || "Humano"} — ${(style?.rules || []).join(" ")}

=== POST O COMENTARIO AL QUE RESPONDES (texto real del hilo) ===
${opponent || "(vacío)"}

=== POST EXTRA (si hay) ===
${post && post !== opponent ? post : "(igual)"}

=== ÓRDENES DEL USUARIO (obligatorias DENTRO del texto publicable) ===
${stance || "Escribe con criterio, voz de miembro del grupo, sin sonar a IA."}

=== NARRATIVA A IMPONER ===
${narrative || stance || "(la que gane el hilo con sentido común)"}

=== FICHA ===
${(body.personName || "").trim() || "n/a"} | ${(body.personRole || "").trim() || "n/a"}
${(body.personContext || "").trim() || ""}

=== INTEL ===
${(body.researchNotes || "").trim() || "n/a"}

=== APOYO INTERNO (no lo copies al texto publicable) ===
Claim: ${analysis.claimSummary}
Tipo: ${analysis.kindLabel}
Cifras: ${[...analysis.percents, ...analysis.numbers].slice(0, 8).join(", ") || "ninguna"}

=== TAREA ===
Devuelve JSON con:
- analysis: 2–4 frases INTERNAS (táctica). El usuario NO pega esto.
- variants: 3 objetos. En cada uno, "text" es un comentario/post listo para COPIAR Y PEGAR:
  * Suena a que el USUARIO lo escribió (primera persona / voz de grupo).
  * Responde al mensaje de arriba como en un grupo de Facebook.
  * PROHIBIDO: "el oponente", "análisis táctico", "estratagema", "el contraataque", meta de IA.
  * Cumple las órdenes del usuario.
  * Ángulos: A reencuadre · B datos/criterio · C público/cierre (órdenes incluidas).

${isPro ? `council: 5 agentes (schopenhauer, influencia, masas, narrativa, diablo) solo en panel interno; sus "move" describen táctica, NO son el texto a pegar.` : `"council": null`}

Ejemplo de TONO publicable (estructura, NO copies el tema): párrafos naturales, "Llevo un tiempo leyendo…", "En serio…", sin títulos de informe.

JSON:
{
  "analysis": "...",
  "attackProfile": "...",
  "plainSummary": "...",
  "weakPoints": [{"title":"","detail":"","howToWin":""}],
  "winLevers": [],
  "avoid": [],
  "researchLeads": [],
  "searchQueries": [],
  "variants": [
    {"id":"v1","label":"Variante A","angle":"...","text":"...SOLO TEXTO HUMANO PARA PEGAR...","stratagemIds":[1,12]},
    {"id":"v2","label":"Variante B","angle":"...","text":"...","stratagemIds":[15,4]},
    {"id":"v3","label":"Variante C","angle":"...","text":"...","stratagemIds":[9,5]}
  ],
  "council": null
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
        text: sanitizePublishableText(String(v.text || "")),
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
