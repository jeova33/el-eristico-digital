/**
 * Motor local de El Erístico Digital.
 * Variantes · enfoque (datos / público / filosófico) · longitud · navegador de debate.
 * Lenguaje claro, poco tecnicismo.
 */

import {
  getStratagem,
  pickStratagemsForText,
  type Stratagem,
} from "./knowledge/stratagemas";
import {
  INTENSITY_GUIDE,
  type Intensity,
} from "./knowledge/persuasion";
import { polishComplete, softClipComplete } from "./knowledge/styles";

export type { Intensity };
export type Mode = "contraataque" | "desmontar" | "arsenal" | "pro";

/** Cómo quieres que suene la respuesta */
export type ReplyFocus = "datos" | "publico" | "filosofico";

/** Largo del comentario */
export type ReplyLength = "corta" | "media" | "larga";

export type EngineInput = {
  mode: Mode;
  intensity: Intensity;
  opponentText: string;
  stanceText: string;
  focus?: ReplyFocus;
  length?: ReplyLength;
  /** Semilla para variar textos al pedir "otra ronda" */
  seed?: number;
};

export type ReplyVariant = {
  id: string;
  label: string;
  angle: string;
  text: string;
  stratagemIds: number[];
};

export type WeakPoint = {
  title: string;
  detail: string;
  howToWin: string;
};

export type DebateBrowser = {
  /** Quién / qué tipo de ataque es */
  attackProfile: string;
  /** Resumen en palabras simples */
  plainSummary: string;
  /** Fallos y vacíos del oponente */
  weakPoints: WeakPoint[];
  /** Cosas a investigar o buscar sobre el ataque / atacante */
  researchLeads: string[];
  /** Preguntas de búsqueda sugeridas */
  searchQueries: string[];
  /** Palancas para ganar siempre (marco a tu favor) */
  winLevers: string[];
  /** Qué NO hacer */
  avoid: string[];
};

export type EngineOutput = {
  analysis: string;
  counterattack: string;
  fullText: string;
  stratagemIds: number[];
  copyOnlyCounterattack: string;
  variants: ReplyVariant[];
  browser: DebateBrowser;
  focus: ReplyFocus;
  length: ReplyLength;
};

export const FOCUS_GUIDE: Record<
  ReplyFocus,
  { label: string; hint: string; style: string }
> = {
  datos: {
    label: "Con datos",
    hint: "Números, hechos y pruebas (en palabras simples)",
    style:
      "Habla de cifras, ejemplos concretos y 'muéstrame la prueba'. Sin jerga de laboratorio.",
  },
  publico: {
    label: "Público general",
    hint: "Como habla la gente en el feed",
    style:
      "Tono de vecino listo: claro, directo, un poco de ironía. Cero palabras raras.",
  },
  filosofico: {
    label: "Filosófico",
    hint: "Ideas grandes, sin ser pedante",
    style:
      "Preguntas profundas y sentido común elevado. Suena a sabio de café, no a manual universitario.",
  },
};

export const LENGTH_GUIDE: Record<
  ReplyLength,
  { label: string; sentences: [number, number]; hint: string }
> = {
  corta: { label: "Corta", sentences: [2, 3], hint: "Golpe rápido" },
  media: { label: "Media", sentences: [4, 6], hint: "Equilibrada" },
  larga: { label: "Larga", sentences: [7, 11], hint: "Avalancha completa" },
};

function clip(s: string, max: number) {
  // Nunca cortar con "…" a mitad de palabra/idea (frases incompletas prohibidas)
  return softClipComplete(s, max);
}

function extractQuote(text: string): string {
  const cleaned = text.trim().replace(/^["«]|["»]$/g, "");
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length <= 8) return clip(cleaned, 90);
  const mid = Math.floor(words.length / 3);
  return clip(words.slice(mid, mid + 10).join(" "), 90);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(arr: T[], n: number): T {
  return arr[n % arr.length];
}

/** Señales simples en el texto del oponente */
function scanSignals(text: string) {
  const t = text.toLowerCase();
  return {
    insults: /idiota|tonto|estúp|basura|ridícul|payaso|ignorante|pende|imbécil/.test(t),
    noProof: /obvio|todo el mundo|todos saben|es claro|sin duda|siempre|nunca/.test(t),
    moral: /deberías|inmoral|ética|vergüenza|falta de respeto|ofende|odio/.test(t),
    authority: /experto|estudio|ciencia|datos|prueba|fuente|estadística/.test(t),
    personal: /tú no|usted no|ni siquiera|desde tu|con tu cara|quién eres/.test(t),
    empty: text.trim().split(/\s+/).length < 12,
    questions: (text.match(/\?/g) || []).length,
    absolutist: /siempre|nunca|todos|nadie|jamás|absolutamente/.test(t),
  };
}

function buildBrowser(
  opponentText: string,
  stanceText: string,
  stratagems: Stratagem[],
): DebateBrowser {
  const s = scanSignals(opponentText);
  const quote = extractQuote(opponentText);
  const stance = clip(stanceText || "tu postura", 80);

  let attackProfile = "Opinión suelta disfrazada de veredicto";
  if (s.insults && s.personal) attackProfile = "Ataque personal (va por ti, no por la idea)";
  else if (s.moral) attackProfile = "Sermón moral: busca que te sientas culpable";
  else if (s.authority) attackProfile = "Se pinta de 'experto' sin traer la prueba completa";
  else if (s.noProof || s.absolutist) attackProfile = "Afirmaciones absolutas sin matices ni prueba";
  else if (s.empty) attackProfile = "Comentario corto y vacío: más pose que argumento";
  else if (s.questions > 1) attackProfile = "Lluvia de preguntas para marearte";

  const weakPoints: WeakPoint[] = [];

  if (s.noProof || s.absolutist || !s.authority) {
    weakPoints.push({
      title: "No trae prueba real",
      detail: `Dice cosas como si fueran hechos, pero no muestra de dónde salen. Frase clave: "${quote}".`,
      howToWin:
        "Pídele una sola prueba concreta y medible. Mientras no la traiga, ganas ante el público.",
    });
  }
  if (s.absolutist) {
    weakPoints.push({
      title: "Habla en blanco o negro",
      detail: "Usa siempre/nunca/todos. La vida real tiene grises; su mapa es demasiado simple.",
      howToWin:
        "Muestra un solo caso que rompa su 'siempre' o 'nunca'. Con un contraejemplo, se cae el absolutismo.",
    });
  }
  if (s.moral) {
    weakPoints.push({
      title: "Cambia el tema a moralina",
      detail: "En vez de discutir el punto, te empuja a sentirte mala persona.",
      howToWin:
        "Nombra el truco en voz alta: 'estás moralizando, no argumentando'. Vuelve al tema concreto.",
    });
  }
  if (s.personal || s.insults) {
    weakPoints.push({
      title: "Ataca a la persona",
      detail: "Cuando alguien insulta o te descalifica, suele ser porque el fondo se le acabó.",
      howToWin:
        "Señálalo con calma frente a la audiencia: 'si el argumento fuera fuerte, no haría falta el golpe bajo'.",
    });
  }
  if (s.empty) {
    weakPoints.push({
      title: "Comentario demasiado fino",
      detail: "Hay poco contenido. Fácil de rellenar con humo y parecer profundo.",
      howToWin: "Exige que complete la idea en una frase clara. El vacío se ve solo.",
    });
  }
  if (s.authority) {
    weakPoints.push({
      title: "Autoridad de adorno",
      detail: "Menciona datos o 'expertos' sin enlazar ni precisar.",
      howToWin:
        "Pide el nombre del estudio, el año y el número exacto. Si no puede, era adorno.",
    });
  }
  // Siempre al menos 2 puntos
  if (weakPoints.length < 2) {
    weakPoints.push({
      title: "No responde a tu marco",
      detail: `Tu postura (${stance}) puede quedar fuera de su ataque. Eso es un vacío a tu favor.`,
      howToWin: "Reencuadra: 'el punto real es…' y ancla en lo que tú defiendes.",
    });
  }
  if (weakPoints.length < 3) {
    weakPoints.push({
      title: "Juega para su tribu, no para la verdad",
      detail: "Busca likes de los que ya piensan como él, no convencer con cuidado.",
      howToWin: "Habla al público del medio: sentido común, ejemplos de la vida diaria.",
    });
  }

  const researchLeads = [
    "¿Dice lo mismo en otros hilos o cambia de opinión según le convenga?",
    "¿Trae fuentes o solo eslóganes y adjetivos?",
    "¿Habla desde experiencia real o solo desde el teclado?",
    "¿Usa siempre el mismo truco (insulto, moralina, 'todos saben')?",
    stanceText.trim()
      ? `¿Su ataque realmente choca con tu postura (“${clip(stanceText, 50)}”) o está peleando con un fantasma?`
      : "¿Qué parte de su frase se cae si le pides un ejemplo real de la calle?",
  ];

  const topicBits = opponentText
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 6)
    .join(" ");

  const searchQueries = [
    `${topicBits || "tema del debate"} críticas argumentos en contra`,
    `${topicBits || "afirmación del oponente"} es cierto o falso`,
    ` falacias en debates sobre ${topicBits || "opiniones en redes"}`,
    `"${clip(quote, 40)}" contexto`,
  ];

  const winLevers = [
    "Ganas ante la audiencia, no ante el oponente. Escribe para el que scrollea.",
    "Invierte la carga: que él demuestre lo suyo con un nivel absurdo de detalle.",
    "Aísla una frase suya y enséñala al revés (descontextualización controlada).",
    "Ofrece solo dos caminos: contigo (sentido común) o con el absurdo de su extremo.",
    stanceText.trim()
      ? `Ancla siempre en: ${clip(stanceText, 100)}`
      : "Define tu postura en una frase y no salgas de ahí.",
    `Estratagemas listas: ${stratagems.map((x) => `E${x.id}`).join(", ")}.`,
  ];

  const avoid = [
    "No entres en su insulto al mismo nivel (pierdes la foto ante el público).",
    "No te disculpes de más: suena a debilidad.",
    "No uses tecnicismos largos: la gente deja de leer.",
    "No respondas solo al ego: responde para que el feed te dé la razón.",
  ];

  return {
    attackProfile,
    plainSummary: `Está diciendo, en corto: “${quote}”. Tipo de golpe: ${attackProfile.toLowerCase()}.`,
    weakPoints: weakPoints.slice(0, 5),
    researchLeads,
    searchQueries,
    winLevers,
    avoid,
  };
}

type BuildOpts = {
  focus: ReplyFocus;
  length: ReplyLength;
  intensity: Intensity;
  variantIndex: number;
  seed: number;
};

function openers(focus: ReplyFocus, intensity: Intensity, quote: string, vi: number): string[] {
  const q = clip(quote, 55);
  const pool: Record<ReplyFocus, string[]> = {
    datos: [
      `Antes de gritar, ¿dónde está el número que respalda “${q}”?`,
      `Bonita frase. Ahora el dato: ¿fuente, año, cifra? Porque “${q}” solo no alcanza.`,
      `Si esto fuera tan claro, vendría con una prueba, no con un eslogan como “${q}”.`,
    ],
    publico: [
      `Seamos honestos con la gente que lee: “${q}” suena fuerte… y se cae solo.`,
      `Tranquilo, ya vimos el truco. “${q}” no es argumento: es pose.`,
      `A ver, para el que llega al hilo ahora: lo que dijeron es “${q}”. Léanlo otra vez.`,
    ],
    filosofico: [
      `Cuando alguien dice “${q}”, no está buscando la verdad: está defendiendo su orgullo.`,
      `Hay una diferencia incómoda entre tener razón y necesitar tenerla. “${q}” huele a lo segundo.`,
      `La pregunta no es si “${q}” suena bonito. Es si sobrevive al sentido común.`,
    ],
  };
  if (intensity === "devastador") {
    return [
      `Es revelador que se publique algo como “${q}” y se espere aplauso.`,
      ...pool[focus],
    ];
  }
  return pool[focus];
}

function bodyChunks(
  focus: ReplyFocus,
  quote: string,
  stance: string,
  vi: number,
  seed: number,
): string[] {
  const q = clip(quote, 60);
  const st = clip(stance || "mirar la realidad de frente", 70);
  const h = seed + vi * 17;

  const amplify = pick(
    [
      `Si estiramos tu lógica un poco más, “${q}” deja de ser matiz y se vuelve “que se rompa todo mientras yo me siento superior”.`,
      `Traducido sin maquillaje: quieres que tu gusto se vuelva ley para todos. Eso no es debate, es capricho con teclado.`,
      `Llevado al extremo, tu punto pide que ignoremos lo obvio solo para no herir tu relato.`,
    ],
    h,
  );

  const burden = pick(
    [
      `La carga es tuya: una prueba concreta, no un “confía en mí”.`,
      `Trae un ejemplo real de la calle. Si no puedes, estás predicando, no argumentando.`,
      `Muéstrame un solo caso bien contado. Hasta entonces, es fe con Wi‑Fi.`,
    ],
    h + 1,
  );

  const dichotomy = pick(
    [
      `Aquí la gente ve dos caminos: ${st}, o el absurdo que estás vendiendo.`,
      `O miramos lo que pasa de verdad (${st}), o seguimos tu cuento. No hay tercera opción cómoda.`,
      `El feed ya eligió: sentido común de un lado; postureo del otro.`,
    ],
    h + 2,
  );

  const smoke = pick(
    [
      `Mientras tanto, el tema de fondo sigue ahí: ${st}. Curioso que siempre se escape la mirada justo en ese punto.`,
      `Podemos marearnos con adjetivos o hablar de lo que importa: ${st}.`,
      `Bonito humo. Cuando se va, queda lo mismo: ${st}.`,
    ],
    h + 3,
  );

  const adHom = pick(
    [
      `Opinar con esa seguridad sin mostrar oficio no es valentía: es cosplay de autoridad.`,
      `¿Desde qué experiencia concreta sueltas veredictos? Desde aquí se ve más ego que camino recorrido.`,
      `Hablar es gratis. La credibilidad se gana. Tú trajiste volumen, no recorrido.`,
    ],
    h + 4,
  );

  const focusExtra: Record<ReplyFocus, string[]> = {
    datos: [
      `No pido un paper de 40 páginas: pido una cifra, un año, un hecho comprobable. “${q}” no es eso.`,
      `En la vida real contamos costos, tiempos y resultados. ¿Cuál es el tuyo, en números o en hechos?`,
      `Si tu idea funciona, se nota en algo medible. Si no se nota, era solo narrativa.`,
    ],
    publico: [
      `La gente normal no necesita un diccionario para oler cuando alguien está bluffeando.`,
      `Esto no es la universidad: es un comentario. Si no se entiende en dos lecturas, era humo.`,
      `A la mayoría le importa lo que le toca el bolsillo, el tiempo y la paz. Tu discurso no aterriza ahí.`,
    ],
    filosofico: [
      `Tener razón de verdad duele a veces. Necesitar tener razón, en cambio, grita.`,
      `El orgullo disfrazado de principio es el error más viejo del debate humano.`,
      `Si tu idea no soporta una pregunta simple, no era idea: era identidad.`,
    ],
  };

  return [amplify, burden, dichotomy, smoke, adHom, pick(focusExtra[focus], h + 5)];
}

function closer(focus: ReplyFocus, intensity: Intensity, stance: string, vi: number): string {
  const st = clip(stance || "lo que se sostiene solo", 50);
  const options: Record<ReplyFocus, string[]> = {
    datos: [
      `Cuando traigas el dato, hablamos. Hasta entonces, esto es monólogo con testigos.`,
      `Una prueba. Una. El resto es ruido.`,
      `Sin número ni hecho, tu certeza es solo volumen.`,
    ],
    publico: [
      `Like si también viste el truco. Silencio si aún crees que eso era lógica.`,
      `La gente ya entendió. Tú decide si te unes o sigues el show.`,
      `Fin del cuento: o aterrizas o admites que solo venías a pelear.`,
    ],
    filosofico: [
      `La verdad no necesita tanto teatro. El ego, sí.`,
      `Quien busca comprender pregunta. Quien busca ganar, acusa. Ya se vio cuál eras.`,
      `Puedes seguir defendiendo el relato, o puedes mirar lo que queda en pie: ${st}.`,
    ],
  };
  if (intensity === "cirujano") {
    return pick(
      [
        `No hace falta gritar: basta con no regalarle a la falacia el estatus de argumento.`,
        `Con eso basta. El resto es adorno.`,
      ],
      vi,
    );
  }
  if (intensity === "devastador") {
    return pick(
      [
        `Cuando tengas prueba real —no humo, no moralina— vuelves. Hasta entonces, no es debate.`,
        `Demuéstralo o baja el volumen. La audiencia ya eligió.`,
      ],
      vi,
    );
  }
  return pick(options[focus], vi);
}

function applyLength(parts: string[], length: ReplyLength): string {
  const { sentences } = LENGTH_GUIDE[length];
  const target = sentences[1];
  // parts are already sentence-like chunks
  let chosen = parts.slice(0, Math.min(target, parts.length));
  if (length === "corta") chosen = parts.slice(0, Math.max(2, sentences[0]));
  if (length === "media") chosen = parts.slice(0, Math.min(6, Math.max(4, parts.length)));
  if (length === "larga") {
    // reusar con variaciones ligeras
    const extra = parts.slice(0, 3).map((p, i) =>
      i === 0 ? p : p.replace(/^/, "").trim(),
    );
    chosen = [...parts, ...extra].slice(0, 10);
  }
  return chosen.join(" ").replace(/\s+/g, " ").trim();
}

function buildVariantText(
  opponentText: string,
  stanceText: string,
  opts: BuildOpts,
): string {
  const quote = extractQuote(opponentText);
  const { focus, length, intensity, variantIndex, seed } = opts;
  const open = pick(openers(focus, intensity, quote, variantIndex), seed + variantIndex);
  const chunks = bodyChunks(focus, quote, stanceText, variantIndex, seed);
  // Orden distinto por variante
  const order =
    variantIndex === 0
      ? [0, 1, 2, 5]
      : variantIndex === 1
        ? [1, 3, 4, 5]
        : [2, 0, 1, 3];
  const ordered = order.map((i) => chunks[i % chunks.length]);
  const stanceLine = stanceText.trim()
    ? focus === "filosofico"
      ? `Lo que se sostiene con más honestidad es esto: ${clip(stanceText, length === "corta" ? 80 : 120)}.`
      : focus === "datos"
        ? `Del otro lado hay algo concreto que sí se puede defender: ${clip(stanceText, length === "corta" ? 80 : 120)}.`
        : `Mientras tanto, la postura que sí le habla a la gente es: ${clip(stanceText, length === "corta" ? 80 : 120)}.`
    : "";
  const end = closer(focus, intensity, stanceText, variantIndex + seed);

  const pool = [open, ...ordered, stanceLine, end].filter(Boolean);
  return polishComplete(applyLength(pool, length));
}

const VARIANT_META = [
  {
    id: "v1",
    label: "Variante A · Marco",
    angle: "Reencuadra el tema y deja al oponente fuera de juego",
  },
  {
    id: "v2",
    label: "Variante B · Prueba",
    angle: "Invierte la carga: que él demuestre o se vea vacío",
  },
  {
    id: "v3",
    label: "Variante C · Público",
    angle: "Habla a la audiencia y aísla al rival",
  },
];

function buildAnalysis(
  stratagems: Stratagem[],
  intensity: Intensity,
  mode: Mode,
  focus: ReplyFocus,
  length: ReplyLength,
): string {
  const list = stratagems.map((s) => `E${s.id} ${s.digitalName}`).join(" · ");
  const modeNote =
    mode === "desmontar"
      ? "Modo Desmontar: leo sus trucos y se los devuelvo."
      : mode === "arsenal"
        ? "Modo Arsenal: paquete completo de golpes."
        : mode === "pro"
          ? "Modo PRO: research + consejo multi-agente + narrativa."
          : "Modo Contraataque: varias respuestas listas para elegir.";
  return polishComplete(
    `${modeNote} Enfoque: ${FOCUS_GUIDE[focus].label}. Largo: ${LENGTH_GUIDE[length].label}. Intensidad: ${INTENSITY_GUIDE[intensity].label}. Estratagemas: ${list}. Lenguaje claro, sin tecnicismos de adorno, sin frases cortadas, sin censura blanda. Ganas ante quien scrollea`,
  );
}

function resolveStratagems(mode: Mode, opponent: string, stance: string): Stratagem[] {
  if (mode === "desmontar") {
    const detected = pickStratagemsForText(opponent, 4);
    const core = [16, 15, 5, 12].map(getStratagem);
    for (const c of core) {
      if (!detected.some((s) => s.id === c.id)) detected.push(c);
    }
    return detected.slice(0, 5);
  }
  if (mode === "arsenal") {
    return [1, 4, 5, 6, 9, 12, 15, 16].map(getStratagem);
  }
  const picked = pickStratagemsForText(`${opponent} ${stance}`, 4);
  for (const id of [1, 15, 5, 12, 9, 4, 6, 16]) {
    if (picked.length >= 4) break;
    if (!picked.some((s) => s.id === id)) picked.push(getStratagem(id));
  }
  return picked.slice(0, 4);
}

export function generateEristic(input: EngineInput): EngineOutput {
  const opponent = input.opponentText.trim();
  const stance = input.stanceText.trim();
  const focus: ReplyFocus = input.focus ?? "publico";
  const length: ReplyLength = input.length ?? "media";
  const seed = input.seed ?? Date.now() % 10000;
  const intensity = input.intensity;

  if (!opponent) {
    const msg =
      "Pega el comentario del oponente (y tu postura si puedes). Sin blanco no hay misil.";
    const emptyBrowser: DebateBrowser = {
      attackProfile: "Sin texto",
      plainSummary: "Aún no hay ataque que analizar.",
      weakPoints: [],
      researchLeads: [],
      searchQueries: [],
      winLevers: [],
      avoid: [],
    };
    return {
      analysis: "Sin input.",
      counterattack: msg,
      fullText: msg,
      stratagemIds: [],
      copyOnlyCounterattack: msg,
      variants: [],
      browser: emptyBrowser,
      focus,
      length,
    };
  }

  const stratagems = resolveStratagems(input.mode, opponent, stance);
  const analysis =
    input.mode === "desmontar"
      ? (() => {
          const lines = stratagems
            .map(
              (s) =>
                `• Posible E${s.id} (${s.digitalName}): ${s.summary} → contra en simple: ${s.digitalUse}`,
            )
            .join("\n");
          return `Lectura del comentario enemigo:\n${lines}\n\n${buildAnalysis(stratagems, intensity, input.mode, focus, length)}`;
        })()
      : buildAnalysis(stratagems, intensity, input.mode, focus, length);

  const browser = buildBrowser(opponent, stance, stratagems);

  const stratSets: number[][] = [
    stratagems.map((s) => s.id),
    [1, 15, 12, 5].filter(Boolean),
    [6, 9, 4, 16],
  ];

  const variants: ReplyVariant[] = VARIANT_META.map((meta, i) => {
    const text = buildVariantText(opponent, stance, {
      focus,
      length,
      intensity,
      variantIndex: i,
      seed,
    });
    return {
      ...meta,
      text,
      stratagemIds: stratSets[i] ?? stratagems.map((s) => s.id),
    };
  });

  const counterattack = variants[0]?.text ?? "";
  const fullText = `Análisis táctico:\n${analysis}\n\nNavegador — perfil: ${browser.attackProfile}\n${browser.plainSummary}\n\nEl contraataque (variante A):\n${counterattack}`;

  return {
    analysis,
    counterattack,
    fullText,
    stratagemIds: stratagems.map((s) => s.id),
    copyOnlyCounterattack: counterattack,
    variants,
    browser,
    focus,
    length,
  };
}

export { SYSTEM_PROMPT_CORE } from "./knowledge/persuasion";
