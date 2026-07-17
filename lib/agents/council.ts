/**
 * Consejo multi-agente: Schopenhauer + influencia + masas + narrativa + abogado del diablo.
 * Debaten el caso y proponen el golpe ganador (sin censura, frases completas).
 */

import { ABILITIES, pickAbilities, type Ability } from "../knowledge/abilities";
import { polishComplete } from "../knowledge/styles";

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
    abilityIds: ["amplify", "burden", "decontext", "adhom", "avalanche", "dichotomy", "indignation", "smoke"],
  },
  {
    id: "influencia",
    name: "Agente Influencia",
    role: "Prueba social, autoridad, compromiso, escasez de atención",
    color: "#7c5cff",
    abilityIds: ["social-proof", "authority", "commitment", "liking", "scarcity", "emotion-first"],
  },
  {
    id: "masas",
    name: "Agente Masas",
    role: "Enemigo abstracto, consenso falso, división, etiquetas",
    color: "#ff6b5e",
    abilityIds: ["enemy", "false-consensus", "divide", "label", "sunk-cost"],
  },
  {
    id: "narrativa",
    name: "Agente Narrativa",
    role: "Gancho, núcleo humano, escena, anti-slop",
    color: "#ffd84d",
    abilityIds: ["narrative-kernel", "hook", "anti-slop", "emotion-first"],
  },
  {
    id: "diablo",
    name: "Abogado del Diablo",
    role: "Busca el mejor golpe del rival y cómo aplastarlo igual",
    color: "#9a94b0",
    abilityIds: ["burden", "decontext", "adhom", "commitment"],
  },
];

export type CouncilInput = {
  opponentText: string;
  stanceText: string;
  /** Quién habla / a qué se dedica */
  personName?: string;
  personRole?: string;
  personContext?: string;
  /** Narrativa que el usuario quiere expresar */
  narrativeIntent?: string;
  /** Hallazgos de research web (texto plano) */
  researchNotes?: string;
  seed?: number;
};

export type AgentTurn = {
  agentId: AgentId;
  agentName: string;
  color: string;
  /** Qué ve / diagnostica */
  read: string;
  /** Golpe que propone */
  move: string;
  abilities: Ability[];
};

export type CouncilResult = {
  turns: AgentTurn[];
  /** Síntesis del consejo: cómo ganar */
  synthesis: string;
  /** Comentario final listo (sin censura, completo) */
  finalStrike: string;
  /** Comentario alterno más narrativo */
  narrativeStrike: string;
};

function clipWordSafe(s: string, max: number): string {
  const t = s.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const sp = slice.lastIndexOf(" ");
  return sp > 20 ? slice.slice(0, sp) : slice;
}

function h(s: string): number {
  let x = 0;
  for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(x);
}

function quoteOf(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 14) return text.trim();
  const mid = Math.floor(words.length / 4);
  return words.slice(mid, mid + 12).join(" ");
}

export function runCouncil(input: CouncilInput): CouncilResult {
  const seed = input.seed ?? 1;
  const q = quoteOf(input.opponentText || "su discurso vacío");
  const person = [input.personName, input.personRole].filter(Boolean).join(", ");
  const target = person || "este personaje";
  const stance = input.stanceText.trim() || "mirar la realidad sin maquillaje";
  const narrative = input.narrativeIntent?.trim() || stance;
  const research = input.researchNotes?.trim();

  const turns: AgentTurn[] = AGENTS.map((agent, idx) => {
    const abilities = pickAbilities(agent.abilityIds).slice(0, 4);
    const n = h(q + agent.id + String(seed + idx));

    let read = "";
    let move = "";

    switch (agent.id) {
      case "schopenhauer":
        read = polishComplete(
          `El rival no está buscando verdad. Está defendiendo el ego con la frase "${clipWordSafe(q, 120)}". Eso se desmonta con amplificación y carga de prueba, no con educación educada`,
        );
        move = polishComplete(
          research
            ? `Estira su punto hasta el ridículo, exige una prueba imposible, y si el fondo se le sostiene ataca el oficio de ${target}. Lo que investigamos solo confirma que habla con pose. No pidas permiso. No suavices`
            : `Traduce "${clipWordSafe(q, 90)}" al extremo absurdo. Después: una sola prueba medible o silencio. Si se pone técnico, ve a la persona: qué ha construido ${target} para dar lecciones`,
        );
        break;
      case "influencia":
        read = polishComplete(
          `La audiencia no lee el hilo completo. Decide en segundos por afinidad. Quien suene a "gente normal" gana. ${target} está pidiendo estatus, no diálogo`,
        );
        move = polishComplete(
          `Habla como portavoz del feed: "cualquiera con dos dedos de frente ya vio el bluff". Usa autoridad percibida (tono seguro) y cierra con escasez: o aterriza ahora o queda como monólogo. Incluye a la audiencia en el nosotros`,
        );
        break;
      case "masas":
        read = polishComplete(
          `Hay que fabricar un "ellos": no pelees con un individuo simpático, pelea con el arquetipo. ${target} es el moralista / el vacío / el cosplay de experto, según el caso`,
        );
        move = polishComplete(
          `Etiquétalo en una palabra que pegue (sermón, bluff, postureo) y sepáralo del pueblo. "Eso no es la gente. Eso es su eco". El enemigo abstracto une likes; el matiz los mata`,
        );
        break;
      case "narrativa":
        read = polishComplete(
          `La narrativa que tú quieres imponer es: ${clipWordSafe(narrative, 160)}. El post rival es el villano de esa escena. No es un informe: es orgullo herido o hipocresía en vivo`,
        );
        move = polishComplete(
          `Gancho sucio en la primera línea. Después una escena de dos oraciones donde se vea la hipocresía. Cierra con el kernel: ${clipWordSafe(narrative, 100)}. Suena humano, no a brochure`,
        );
        break;
      case "diablo":
        read = polishComplete(
          `El mejor golpe del rival sería: "tú también generalizas / no traes datos / eres tan ideológico como yo". Si no lo anticipas, te lo clava en el reply`,
        );
        move = polishComplete(
          `Inocula la objeción: admítela en media línea y gira el cuchillo ("aunque trajera un PDF, sigue sin responder a ${clipWordSafe(stance, 80)}"). Nunca dejes el último frame al otro`,
        );
        break;
    }

    // Variar un poco con seed
    if (n % 3 === 0 && agent.id === "schopenhauer") {
      move = polishComplete(
        `${move} Multiplica preguntas: de dónde sale, quién paga el costo, qué pasa si se equivoca. Que colapse por saturación`,
      );
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
      `Consejo unánime: ganar ante el scroller, no convertir al fan del rival.`,
      person
        ? `Blanco: ${person}${input.personContext ? ` (${clipWordSafe(input.personContext, 100)})` : ""}.`
        : `Blanco: el discurso pegado, sin nombre claro.`,
      research
        ? `Intel web: ${clipWordSafe(research, 220)}.`
        : `Sin ficha web sólida: golpea el vacío de prueba y la pose.`,
      `Narrativa a imponer: ${clipWordSafe(narrative, 140)}.`,
      `Arsenal prioritario: amplificación, carga de prueba, etiqueta tribal, gancho narrativo, anticipar el contraataque.`,
    ].join(" "),
  );

  const finalStrike = polishComplete(
    [
      `Seamos claros con quien lee: "${clipWordSafe(q, 100)}" no es un argumento. Es una pose con teclado.`,
      person
        ? `Y cuando lo suelta ${clipWordSafe(String(input.personName || target), 60)}${input.personRole ? `, ${clipWordSafe(input.personRole, 50)}` : ""}, el truco se ve más: estatus primero, prueba después (o nunca).`
        : `El truco se ve: estatus primero, prueba después (o nunca).`,
      research
        ? `Si uno se toma el trabajo de mirar el historial, el patrón no sorprende: ${clipWordSafe(research, 160)}`
        : `Mientras no traiga un hecho concreto, medible y no anecdótico, esto es fe con Wi-Fi.`,
      `Aquí no hay gris cómodo: o defendemos ${clipWordSafe(stance, 90)}, o le regalamos el feed al sermonario.`,
      `Trae una prueba real. Una. Si no puedes, deja de dar lecciones. La audiencia ya eligió entre sentido común y postureo.`,
    ].join(" "),
  );

  const narrativeStrike = polishComplete(
    [
      `Hay un tipo de frase que solo sirve para que el autor se sienta limpio: "${clipWordSafe(q, 90)}".`,
      `Lo que queremos decir de verdad es otra cosa: ${clipWordSafe(narrative, 140)}.`,
      person
        ? `Cuando ${clipWordSafe(String(input.personName || "ese personaje"), 50)} se para en ese altar, no está informando. Está cobrando peaje de moral.`
        : `No está informando. Está cobrando peaje de moral.`,
      `La gente normal no necesita un diccionario para oler el bluff. O aterrizas en la realidad de ${clipWordSafe(stance, 70)}, o te quedas gritando al espejo. Nosotros no vamos a aplaudir el espejo.`,
    ].join(" "),
  );

  return { turns, synthesis, finalStrike, narrativeStrike };
}

export function listAbilityCatalog(): Ability[] {
  return ABILITIES;
}
