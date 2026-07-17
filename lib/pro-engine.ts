/**
 * Motor PRO: captura de post, contexto del personaje, narrativa,
 * research web, consejo multi-agente, respuestas sin censura ni frases cortadas.
 */

import { runCouncil, type CouncilResult } from "./agents/council";
import type { ResearchPack } from "./research/person-research";
import { buildResearchQueries, buildSearchLinks, deriveAngles } from "./research/person-research";
import {
  polishComplete,
  softClipComplete,
  type WriteStyleId,
  resolveWriteStylePrompt,
} from "./knowledge/styles";
import { generateEristic, type Intensity, type ReplyFocus, type ReplyLength, type ReplyVariant } from "./eristico-engine";

export type ProInput = {
  /** Texto del post o comentario enemigo */
  postText: string;
  /** Comentario o post del oponente (si difiere del post principal) */
  opponentComment?: string;
  stanceText: string;
  personName?: string;
  personRole?: string;
  personContext?: string;
  /** Narrativa que el usuario quiere expresar */
  narrativeIntent: string;
  intensity?: Intensity;
  focus?: ReplyFocus;
  length?: ReplyLength;
  writeStyle?: WriteStyleId;
  writeStyleCustom?: string;
  focusCustom?: string;
  research?: ResearchPack | null;
  seed?: number;
};

export type ProOutput = {
  council: CouncilResult;
  variants: ReplyVariant[];
  analysis: string;
  research: ResearchPack;
  /** Comentario listo para el post (sin censura) */
  postComment: string;
  /** Variante narrativa */
  narrativeComment: string;
  styleId: WriteStyleId;
};

function applyStyle(text: string, styleId: WriteStyleId, length: ReplyLength): string {
  let t = polishComplete(text);
  // Sin censura: no reescribimos groserías ni golpes; solo completamos y limpiamos truncados
  if (styleId === "calle") {
    t = t.replace(/con todo respeto,?/gi, "");
    t = t.replace(/si me permites,?/gi, "");
  }
  if (styleId === "anti-slop") {
    t = t.replace(/\b(es importante destacar|en un mundo|en conclusión|sin duda alguna)\b/gi, "");
  }
  if (styleId === "datos-duros") {
    if (!/prueba|dato|hecho|número|fuente|ejemplo/i.test(t)) {
      t = polishComplete(
        `${t} Una prueba concreta. Nombre, fecha o cifra. Si no hay, era teatro`,
      );
    }
  }
  const max = length === "corta" ? 420 : length === "media" ? 900 : 1400;
  return softClipComplete(t, max);
}

export function generatePro(input: ProInput): ProOutput {
  const seed = input.seed ?? Date.now() % 100000;
  const styleId: WriteStyleId = input.writeStyle ?? "eristico";
  const length: ReplyLength = input.length ?? "media";
  const intensity: Intensity = input.intensity ?? "devastador";
  const focus: ReplyFocus = input.focus ?? "publico";

  const post = input.postText.trim();
  const opponent = (input.opponentComment || post).trim();
  const stance = input.stanceText.trim();
  const narrative = input.narrativeIntent.trim() || stance;

  const queries = buildResearchQueries({
    personName: input.personName,
    personRole: input.personRole,
    personContext: input.personContext,
    opponentText: opponent || post,
    narrativeIntent: narrative,
  });

  const research: ResearchPack = input.research ?? {
    query: queries[0] || input.personName || "debate",
    hits: [],
    notes: [
      input.personName ? `Persona: ${input.personName}.` : "",
      input.personRole ? `Rol: ${input.personRole}.` : "",
      input.personContext ? `Contexto: ${input.personContext}.` : "",
      "Investigación web pendiente o sin ficha; el consejo opera con lo declarado por el usuario.",
    ]
      .filter(Boolean)
      .join(" "),
    searchLinks: buildSearchLinks(queries),
    angles: deriveAngles("", input.personName),
  };

  const council = runCouncil({
    opponentText: opponent || post || "comentario o post vacío",
    stanceText: stance,
    personName: input.personName,
    personRole: input.personRole,
    personContext: input.personContext,
    narrativeIntent: narrative,
    researchNotes: research.notes,
    seed,
  });

  // Variantes base del motor erístico + strikes del consejo
  const base = generateEristic({
    mode: "contraataque",
    intensity,
    opponentText: opponent || post,
    stanceText: [stance, narrative, input.personName, input.personRole].filter(Boolean).join(" | "),
    focus,
    length,
    seed,
  });

  const styledCouncil = applyStyle(council.finalStrike, styleId, length);
  const styledNarrative = applyStyle(council.narrativeStrike, styleId, length);

  const variants: ReplyVariant[] = [
    {
      id: "pro-council",
      label: "Pro · Consejo",
      angle: "Síntesis multi-agente sin censura",
      text: styledCouncil,
      stratagemIds: [1, 5, 12, 15],
    },
    {
      id: "pro-narrative",
      label: "Pro · Narrativa",
      angle: narrative.slice(0, 80) || "Kernel narrativo",
      text: styledNarrative,
      stratagemIds: [9, 6, 16],
    },
    ...(base.variants || []).slice(0, 2).map((v, i) => ({
      ...v,
      id: `pro-e-${i}`,
      label: i === 0 ? "Pro · Marco erístico" : "Pro · Carga de prueba",
      text: applyStyle(v.text, styleId, length),
    })),
  ];

  const styleMeta = resolveWriteStylePrompt(styleId, input.writeStyleCustom);
  const analysis = polishComplete(
    [
      `Modo PRO. Estilo: ${styleMeta.label}${styleId === "custom" && input.writeStyleCustom ? " (personalizado)" : styleId === "libre" ? " (IA decide)" : ""}. Intensidad: ${intensity}.`,
      `Personaje: ${input.personName || "sin nombre"} · ${input.personRole || "sin rol"}.`,
      `Narrativa a imponer: ${narrative || "no declarada"}.`,
      `Intel: ${research.notes.slice(0, 280)}.`,
      `Ángulos: ${research.angles.join(" / ") || "n/a"}.`,
      council.synthesis,
    ].join(" "),
  );

  return {
    council,
    variants,
    analysis,
    research,
    postComment: variants[0].text,
    narrativeComment: variants[1].text,
    styleId,
  };
}
