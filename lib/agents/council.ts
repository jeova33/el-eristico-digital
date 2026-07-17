/**
 * Consejo multi-agente anclado al CONTENIDO real del post.
 * Schopenhauer + influencia + masas + narrativa + abogado del diablo.
 */

import { pickAbilities, selectAbilitiesForText, type Ability } from "../knowledge/abilities";
import { polishComplete } from "../knowledge/styles";
import {
  analyzeContent,
  groundedBody,
  groundedCloser,
  groundedOpener,
} from "../content-analysis";

export type AgentId =
  | "schopenhauer"
  | "influencia"
  | "masas"
  | "narrativa"
  | "diablo";

export type AgentVoice = {
  id: AgentId;
  name: string;
  role: string;
  color: string;
  abilityIds: string[];
};

export const AGENTS: AgentVoice[] = [
  {
    id: "schopenhauer",
    name: "Schopenhauer",
    role: "Dialéctica erística: ganar el debate a cualquier precio lógico",
    color: "#e91e8c",
    abilityIds: [
      "amplify",
      "burden",
      "decontext",
      "adhom",
      "avalanche",
      "dichotomy",
      "indignation",
      "smoke",
      "ambiguity",
      "trap-yes",
    ],
  },
  {
    id: "influencia",
    name: "Agente Influencia",
    role: "Cialdini, 52 leyes, ciencia de la influencia, FOMO, anclaje",
    color: "#7c5cff",
    abilityIds: [
      "social-proof",
      "authority",
      "commitment",
      "liking",
      "scarcity",
      "reciprocity",
      "anchor",
      "foot-door",
      "bandwagon",
      "unity",
    ],
  },
  {
    id: "masas",
    name: "Agente Masas",
    role: "Contagio emocional, polarización, enemigo, sugestión de masa",
    color: "#ff6b5e",
    abilityIds: [
      "enemy",
      "false-consensus",
      "divide",
      "label",
      "emotional-contagion",
      "suggestion",
      "echo-chamber",
      "tribal-shame",
      "status-threat",
    ],
  },
  {
    id: "narrativa",
    name: "Agente Narrativa",
    role: "Gancho, historia, anti-slop, punchline (voz humana)",
    color: "#ffd84d",
    abilityIds: ["narrative-kernel", "hook", "anti-slop", "storytime", "punchline", "priming", "zeigarnik"],
  },
  {
    id: "diablo",
    name: "Abogado del Diablo",
    role: "Anticipa el golpe del rival; proyección, reencuadre, carga de prueba",
    color: "#9a94b0",
    abilityIds: ["burden", "decontext", "adhom", "commitment", "projection", "gaslight-light", "trojan"],
  },
];

export type CouncilInput = {
  opponentText: string;
  stanceText: string;
  personName?: string;
  personRole?: string;
  personContext?: string;
  narrativeIntent?: string;
  researchNotes?: string;
  seed?: number;
};

export type AgentTurn = {
  agentId: AgentId;
  agentName: string;
  color: string;
  read: string;
  move: string;
  abilities: Ability[];
};

export type CouncilResult = {
  turns: AgentTurn[];
  synthesis: string;
  finalStrike: string;
  narrativeStrike: string;
};

function clipWordSafe(s: string, max: number): string {
  const t = s.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const sp = slice.lastIndexOf(" ");
  return sp > 20 ? slice.slice(0, sp) : slice;
}

export function runCouncil(input: CouncilInput): CouncilResult {
  const seed = input.seed ?? 1;
  const content = analyzeContent(input.opponentText || "su discurso vacío");
  const person = [input.personName, input.personRole].filter(Boolean).join(", ");
  const target = person || "quien publica el boletín";
  const stance = input.stanceText.trim() || "mirar el cuadro completo, no el indicador de campaña";
  const narrative = input.narrativeIntent?.trim() || stance;
  const research = input.researchNotes?.trim();
  const q = content.safeQuote;
  const claim = content.claimSummary;
  const topic = content.topics[0] || "el tema del post";
  const pct = content.percents[0];
  const isStats = content.kind === "estadistica" || content.kind === "exito_gobierno";

  // Mezcla arsenal del agente + habilidades del post
  const textAbilities = selectAbilitiesForText(input.opponentText || "", 6);

  const turns: AgentTurn[] = AGENTS.map((agent) => {
    const base = pickAbilities(agent.abilityIds).slice(0, 3);
    const extra = textAbilities.filter((t) => !base.some((b) => b.id === t.id)).slice(0, 2);
    const abilities = [...base, ...extra].slice(0, 5);
    let read = "";
    let move = "";

    switch (agent.id) {
      case "schopenhauer":
        read = polishComplete(
          isStats
            ? `El rival no trae un argumento abierto: trae un comunicado con claim medible —${clipWordSafe(claim, 160)}. Se desmonta por fuente, definición, recorte temporal y salto causal, no con una cita rota ni pidiendo "un caso" al azar`
            : `Defiende el ego con: "${clipWordSafe(q, 120)}". Desmontaje: amplificación del claim real + carga de prueba anclada a lo que sí escribió`,
        );
        move = polishComplete(
          isStats
            ? `Repite su cifra (${pct || content.numbers.slice(0, 2).join(", ") || "el porcentaje del post"}) y exige: 1) fuente primaria, 2) definición del delito, 3) por qué ese tramo de fechas, 4) prueba de que el gobierno causó la baja. Multiplica preguntas sobre SU estadística`
            : `Estira SU frase hasta el ridículo y exige evidencia de ESE claim. No pelees un espantapájaros`,
        );
        break;
      case "influencia":
        read = polishComplete(
          isStats
            ? `El post busca autoridad por número: "el semestre más bajo", "48%", "tres órdenes de gobierno". La audiencia compra estatus de logro si nadie pide el tablero crudo`
            : `Quiere sonar a sentido común. Hay que sonar más "gente de a pie" que el boletín`,
        );
        move = polishComplete(
          isStats
            ? `Habla al scroller: "bonito el comunicado de ${topic}; ahora enséñame la serie y la fuente, no el eslogan de tranquilidad del pueblo". Autoridad percibida + escasez: o aterriza el método o queda como marketing`
            : `Portavoz del feed: cualquiera huele el bluff cuando no hay anclaje. Incluye al nosotros`,
        );
        break;
      case "masas":
        read = polishComplete(
          isStats
            ? `Arquetipo: el boletín de gobierno / la narrativa de "ya estamos bien". Separar al pueblo del comunicador que vende calma con un indicador`
            : `Etiqueta al rival como arquetipo (sermón, bluff, vacío), no como persona simpática`,
        );
        move = polishComplete(
          isStats
            ? `Etiqueta: "boletín de logros". Ellos = quienes confunden un % de homicidio doloso con vida tranquila. Nosotros = quienes piden el resto del tablero (extorsión, desaparición, percepción)`
            : `Etiqueta corta que pegue y separe al rival de la gente normal`,
        );
        break;
      case "narrativa":
        read = polishComplete(
          `Narrativa a imponer: ${clipWordSafe(narrative, 140)}. El post rival es la escena del "éxito anunciado". El conflicto: boletín vs calle / vs cuadro incompleto`,
        );
        move = polishComplete(
          isStats
            ? `Gancho: "Bajó el homicidio doloso en el comunicado; falta todo lo demás." Escena: alguien lee el % y se le vende paz. Cierre con el kernel: ${clipWordSafe(narrative || stance, 100)}`
            : `Gancho con el claim real del post. Cierre con tu narrativa, no con moral genérica`,
        );
        break;
      case "diablo":
        read = polishComplete(
          isStats
            ? `El mejor golpe del rival: "niegas los datos", "quieres que la violencia suba en la narrativa", "no traes tus propias cifras". Hay que inocularlo`
            : `Te van a acusar de no leer o de mala fe. Anticípalo`,
        );
        move = polishComplete(
          isStats
            ? `Inocula: "No niego que un indicador pueda bajar. Niego que un boletín con ${pct || "un %"} y sin metodología sea prueba de 'tranquilidad del pueblo' ni de causalidad de gestión." Luego vuelve a ${clipWordSafe(stance, 80)}`
            : `Admite lo mínimo del rival y gira al agujero real de SU texto`,
        );
        break;
    }

    return {
      agentId: agent.id,
      agentName: agent.name,
      color: agent.color,
      read,
      move,
      abilities,
    };
  });

  const synthesis = polishComplete(
    [
      `Claim del post (parafraseo fiel): ${clipWordSafe(claim, 200)}.`,
      `Tipo: ${content.kindLabel}. Temas: ${content.topics.join(", ") || "n/a"}.`,
      pct || content.numbers.length
        ? `Cifras en juego: ${[...content.percents, ...content.numbers].slice(0, 6).join(", ")}.`
        : `Sin cifras claras.`,
      person ? `Emisor: ${person}.` : "",
      research ? `Intel: ${clipWordSafe(research, 180)}.` : "",
      `Ángulos: ${content.dismantleAngles.slice(0, 3).join(" | ")}`,
      `Narrativa nuestra: ${clipWordSafe(narrative, 100)}.`,
      `Regla: citar el claim completo o una oración con sentido; nunca mitades sin contexto.`,
    ]
      .filter(Boolean)
      .join(" "),
  );

  // Golpes finales anclados al contenido (mismo motor grounded)
  const open0 = groundedOpener(content, "datos", seed % 3);
  const body0 = groundedBody(content, stance, narrative, 0);
  const close0 = groundedCloser(content, stance, 0);
  const personLine = person
    ? `Cuando lo publica ${clipWordSafe(String(input.personName || target), 50)}${input.personRole ? ` (${clipWordSafe(input.personRole, 40)})` : ""}, el marco de logro se vuelve más evidente: estatus de gestión primero, auditoría después.`
    : "";

  const finalStrike = polishComplete(
    [open0, ...body0.slice(0, 4), personLine, research ? `Contexto extra: ${clipWordSafe(research, 120)}.` : "", close0]
      .filter(Boolean)
      .join(" "),
  );

  const openN = groundedOpener(content, "publico", (seed + 1) % 3);
  const bodyN = groundedBody(content, stance, narrative, 2);
  const closeN = groundedCloser(content, stance, 2);
  const narrativeStrike = polishComplete(
    [openN, bodyN[0], bodyN[1], `La historia que no entra en el comunicado: ${clipWordSafe(narrative, 140)}.`, closeN]
      .filter(Boolean)
      .join(" "),
  );

  return { turns, synthesis, finalStrike, narrativeStrike };
}

export function listAbilityCatalog(): Ability[] {
  return ABILITIES;
}
