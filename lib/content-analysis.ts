/**
 * Análisis del texto real del oponente/post.
 * Evita citas rotas y respuestas desconectadas del claim.
 */

export type ClaimKind =
  | "estadistica"
  | "exito_gobierno"
  | "moral"
  | "ataque_personal"
  | "opinion_general"
  | "pregunta"
  | "vacio";

export type ContentAnalysis = {
  /** Texto limpio completo (sin cortar a mitad) */
  full: string;
  /** Primera oración completa y usable */
  firstSentence: string;
  /** Resumen del claim en 1–2 oraciones propias (parafraseo fiel) */
  claimSummary: string;
  /** Cita corta PERO siempre oración o fragmento con sentido (no mitad de palabra) */
  safeQuote: string;
  kind: ClaimKind;
  kindLabel: string;
  /** Números, %, fechas detectados */
  numbers: string[];
  dates: string[];
  percents: string[];
  /** Temas/palabras clave de sustancia */
  topics: string[];
  /** Preguntas de ataque ancladas al claim (no genéricas) */
  attackQuestions: string[];
  /** Ángulos de desmontaje específicos */
  dismantleAngles: string[];
  /** Una línea de amplificación absurda del claim real */
  amplifyLine: string;
  /** Etiqueta corta del tipo de discurso */
  label: string;
};

function clean(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Oraciones reales (respeta . ! ? y saltos) */
export function splitSentences(text: string): string[] {
  const t = clean(text);
  if (!t) return [];
  const parts = t
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return parts.length ? parts : [t];
}

/** Cita usable: primera oración completa, o hasta N chars en límite de palabra SIN empezar a mitad */
export function safeQuoteFrom(text: string, max = 140): string {
  const sentences = splitSentences(text);
  const first = sentences[0] || text.trim();
  if (first.length <= max) return first;
  // Cortar en espacio, nunca a mitad de palabra, y preferir no dejar basura
  const slice = first.slice(0, max);
  const sp = slice.lastIndexOf(" ");
  const base = sp > 40 ? slice.slice(0, sp) : slice;
  // Si el recorte empieza con minúscula o basura, usar claim corto
  return base.replace(/[,:;]\s*$/, "").trim();
}

function extractNumbers(text: string): string[] {
  const m = text.match(/\d+(?:[.,]\d+)?/g) || [];
  return [...new Set(m)].slice(0, 12);
}

function extractPercents(text: string): string[] {
  const m = text.match(/\d+(?:[.,]\d+)?\s*%/g) || [];
  const m2 = text.match(/\d+(?:[.,]\d+)?\s*por\s*ciento/gi) || [];
  return [...new Set([...m, ...m2])].slice(0, 8);
}

function extractDates(text: string): string[] {
  const years = text.match(/\b(19|20)\d{2}\b/g) || [];
  const months =
    text.match(
      /\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+\d{4}\b/gi,
    ) || [];
  const ranges = text.match(/\b(19|20)\d{2}\s*[-–—a]+\s*(19|20)\d{2}\b/gi) || [];
  return [...new Set([...months, ...ranges, ...years])].slice(0, 10);
}

const TOPIC_MAP: Array<{ re: RegExp; topic: string }> = [
  { re: /homicidio|asesinat|doloso|violencia|crimen|insegur|delincuen/i, topic: "seguridad / homicidios" },
  { re: /inflaci[oó]n|precios|econom[ií]a|pib|empleo|desempleo/i, topic: "economía" },
  { re: /salud|hospital|vacun|covid|medico/i, topic: "salud" },
  { re: /educaci[oó]n|escuela|universidad/i, topic: "educación" },
  { re: /migraci[oó]n|frontera|deportaci/i, topic: "migración" },
  { re: /corrupci[oó]n|soborno|desv[ií]o/i, topic: "corrupción" },
  { re: /elecci[oó]n|voto|partido|gobierno|presidente|gobernad/i, topic: "política / gobierno" },
  { re: /clima|medio ambiente|contamin/i, topic: "medio ambiente" },
  { re: /mujer|feminicidio|g[eé]nero/i, topic: "violencia de género" },
  { re: /impuesto|hacienda|presupuesto/i, topic: "impuestos / gasto público" },
];

function detectKind(text: string): { kind: ClaimKind; kindLabel: string; label: string } {
  const t = text.toLowerCase();
  const hasStats =
    /\d+\s*%|\d+\s*por\s*ciento|\d+\s*casos|baj[oó]|subi[oó]|aument|disminu|semestre|desde\s+20\d{2}/i.test(
      text,
    ) || extractPercents(text).length > 0;
  const govSuccess =
    /resultado de|gracias a|coordinaci[oó]n|tres [oó]rdenes|bienestar|tranquilidad del pueblo|tendencia a la baja|trabajamos|nuestro gobierno|la 4t|administraci[oó]n/i.test(
      t,
    );
  const moral = /deber[ií]as|inmoral|verg[uü]enza|pueblo bueno|traidor|fascist|nazi|odio/i.test(t);
  const personal = /t[uú] no|usted no|eres un|payaso|idiota|ignorante/i.test(t);
  const question = (text.match(/\?/g) || []).length > 0 && text.split(/\s+/).length < 40;

  if (hasStats && govSuccess)
    return { kind: "exito_gobierno", kindLabel: "Éxito de gobierno con cifras", label: "boletín de logros" };
  if (hasStats) return { kind: "estadistica", kindLabel: "Afirmación con estadísticas", label: "dato sin auditoría" };
  if (personal) return { kind: "ataque_personal", kindLabel: "Ataque a la persona", label: "golpe personal" };
  if (moral) return { kind: "moral", kindLabel: "Sermón moral / tribal", label: "sermón" };
  if (question) return { kind: "pregunta", kindLabel: "Pregunta / reto", label: "pregunta capciosa" };
  if (text.trim().split(/\s+/).length < 10)
    return { kind: "vacio", kindLabel: "Comentario vacío", label: "vacío" };
  return { kind: "opinion_general", kindLabel: "Opinión general", label: "opinión suelta" };
}

function buildClaimSummary(text: string, numbers: string[], percents: string[], dates: string[]): string {
  const sentences = splitSentences(text);
  // Preferir la oración con más números o la primera sustancial
  const scored = sentences.map((s) => {
    const score =
      (s.match(/\d/g) || []).length * 2 +
      (percents.some((p) => s.includes(p.replace(/\s/g, "")) || s.toLowerCase().includes("por ciento"))
        ? 3
        : 0) +
      (s.length > 40 ? 1 : 0);
    return { s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const main = scored[0]?.s || sentences[0] || text;
  const second = sentences.find((s) => s !== main && s.length > 30);
  let summary = main;
  if (second && summary.length < 180) summary = `${main} ${second}`;
  // Si hay cifras, mencionarlas en el resumen si no están
  const bits = [...percents.slice(0, 2), ...numbers.slice(0, 3), ...dates.slice(0, 2)];
  if (bits.length && !bits.some((b) => summary.includes(b.replace(/\s/g, "").slice(0, 4)))) {
    // ok if already in main
  }
  return summary.replace(/\s+/g, " ").trim();
}

function buildAttackQuestions(a: Omit<ContentAnalysis, "attackQuestions" | "dismantleAngles" | "amplifyLine">): string[] {
  const qs: string[] = [];
  const topic = a.topics[0] || "ese tema";

  if (a.kind === "estadistica" || a.kind === "exito_gobierno") {
    if (a.percents[0]) {
      qs.push(
        `¿De qué fuente exacta sale el ${a.percents[0]} y con qué definición de homicidio (doloso, total, con/sin desaparecidos)?`,
      );
    } else if (a.numbers[0]) {
      qs.push(`¿Quién midió el ${a.numbers[0]} y con qué metodología comparable año contra año?`);
    } else {
      qs.push(`¿Cuál es la fuente primaria del dato de ${topic}, no el boletín?`);
    }
    if (a.dates.length) {
      qs.push(
        `¿Por qué el recorte ${a.dates.slice(0, 2).join(" → ")} y no una serie larga comparable sin maquillaje de base?`,
      );
    }
    qs.push(
      `Si el indicador baja, ¿bajan también feminicidios, extorsión, desapariciones y percepción de inseguridad, o solo el número que conviene?`,
    );
    if (a.kind === "exito_gobierno") {
      qs.push(
        `¿Cómo demuestran causalidad (gobierno → baja) y no tendencia previa, subregistro o cambio de clasificación?`,
      );
    }
  } else if (a.kind === "moral") {
    qs.push(`¿Qué hecho concreto, no sermón, sostiene lo que afirmas sobre ${topic}?`);
    qs.push(`Si quitas los adjetivos morales, ¿qué proposición verificable queda?`);
  } else if (a.kind === "ataque_personal") {
    qs.push(`¿Cuál es el argumento de fondo, una vez que quitas el insulto?`);
  } else {
    qs.push(`¿Qué evidencia concreta sostiene tu afirmación sobre ${topic}?`);
    qs.push(`Si te equivocas, ¿quién paga el costo de creerte?`);
  }
  return qs.slice(0, 4);
}

function buildDismantleAngles(a: Omit<ContentAnalysis, "attackQuestions" | "dismantleAngles" | "amplifyLine">): string[] {
  const angles: string[] = [];
  if (a.kind === "estadistica" || a.kind === "exito_gobierno") {
    angles.push("Fuente y metodología: sin ellas el % es publicidad, no ciencia.");
    angles.push("Recorte temporal a conveniencia: elige el tramo que maquilla la foto.");
    angles.push("Indicador estrecho: un delito baja y venden 'tranquilidad del pueblo'.");
    if (a.kind === "exito_gobierno") {
      angles.push("Atribución mágica: correlacionan coordinación de gobiernos con la baja sin prueba causal.");
    }
    angles.push("Vida real vs boletín: si la calle no lo siente, el dato o está mal o está incompleto.");
  } else if (a.kind === "moral") {
    angles.push("Sustituye prueba por indignación.");
    angles.push("Falsa superioridad moral para callar matices.");
  } else {
    angles.push("Afirmación sin anclaje verificable.");
    angles.push("Marco emocional para que no pidas pruebas.");
  }
  return angles;
}

function buildAmplify(a: Omit<ContentAnalysis, "attackQuestions" | "dismantleAngles" | "amplifyLine">): string {
  if (a.kind === "exito_gobierno" || a.kind === "estadistica") {
    const p = a.percents[0] || "esa caída";
    return `Si estiramos tu lógica, con ${p} ya vivimos en un país resuelto y cualquiera que aún tema salir de noche es un ingrato que no lee el boletín.`;
  }
  if (a.kind === "moral") {
    return `Si estiramos tu lógica, quien no aplauda tu sermón es enemigo del bien y solo queda tu moral como ley.`;
  }
  return `Si estiramos tu lógica, tu frase deja de ser matiz y se vuelve mandamiento: o te creemos o somos el problema.`;
}

export function analyzeContent(raw: string): ContentAnalysis {
  const full = clean(raw);
  const sentences = splitSentences(full);
  const firstSentence = sentences[0] || full;
  const numbers = extractNumbers(full);
  const percents = extractPercents(full);
  const dates = extractDates(full);
  const topics = TOPIC_MAP.filter((x) => x.re.test(full)).map((x) => x.topic);
  if (!topics.length) {
    // keywords largas
    const words = full
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 5)
      .slice(0, 6);
    if (words.length) topics.push(words.slice(0, 3).join(", "));
  }
  const { kind, kindLabel, label } = detectKind(full);
  const claimSummary = buildClaimSummary(full, numbers, percents, dates);
  // safeQuote: preferir la oración del claim principal (con cifras si hay)
  let safeQuote = claimSummary.length <= 160 ? claimSummary : safeQuoteFrom(claimSummary, 150);
  // Nunca empezar por basura tipo "día." suelta: si la cita es < 25 chars o no tiene verbo/sustancia, usa firstSentence
  if (safeQuote.length < 25 || /^(día|noche|sí|no|ok)\b/i.test(safeQuote)) {
    safeQuote = safeQuoteFrom(firstSentence, 150);
  }
  // Evitar citas que empiezan a mitad (minúscula tras no ser continuación española normal rara)
  if (/^[a-záéíóúñ]/.test(safeQuote) && !/^(el|la|los|las|un|una|y|o|pero|si|cuando|este|esta|eso|que)\b/i.test(safeQuote)) {
    safeQuote = safeQuoteFrom(firstSentence, 150);
  }

  const base = {
    full,
    firstSentence,
    claimSummary,
    safeQuote,
    kind,
    kindLabel,
    numbers,
    dates,
    percents,
    topics: topics.slice(0, 4),
    label,
  };

  return {
    ...base,
    attackQuestions: buildAttackQuestions(base),
    dismantleAngles: buildDismantleAngles(base),
    amplifyLine: buildAmplify(base),
  };
}

/** Primera línea de respuesta anclada al claim real */
export function groundedOpener(
  a: ContentAnalysis,
  focus: "datos" | "publico" | "filosofico",
  variantIndex: number,
): string {
  const quote = a.safeQuote;
  const p = a.percents[0];
  const topic = a.topics[0] || "lo que vendes";

  if (a.kind === "estadistica" || a.kind === "exito_gobierno") {
    const opts = [
      `Bonito boletín: "${quote}". Ahora la parte que falta: fuente primaria, definición del delito y por qué el recorte de fechas te favorece.`,
      p
        ? `Dices que bajó ${p}. Perfecto. ¿Quién contó, con qué reglas, y por qué eso equivaldría a "tranquilidad del pueblo" y no a un indicador aislado?`
        : `Traes cifras y te las crees solas. El claim es claro —${a.claimSummary.slice(0, 120)}—; lo que no es claro es la auditoría independiente.`,
      `El post celebra ${topic} con números de comunicado. Eso no es debate: es marketing con estadística.`,
    ];
    return opts[variantIndex % opts.length];
  }

  if (focus === "filosofico") {
    const opts = [
      `Cuando alguien publica "${quote.slice(0, 100)}", no está solo informando: está pidiendo fe en su marco.`,
      `Hay una diferencia entre medir la realidad y usarla de escaparate. Este texto huele a lo segundo.`,
      `El orgullo de tener el dato "correcto" no es lo mismo que haber demostrado el relato completo.`,
    ];
    return opts[variantIndex % opts.length];
  }

  if (focus === "publico") {
    const opts = [
      `A ver, para el que llega al hilo: el post dice, en corto, que ${a.claimSummary.slice(0, 130)}.`,
      `Léanlo otra vez: "${quote.slice(0, 110)}". Suena a logro cerrado. La pregunta es si la calle compra el cuento.`,
      `Seamos claros: esto no es una conversación técnica. Es un anuncio disfrazado de dato.`,
    ];
    return opts[variantIndex % opts.length];
  }

  // datos
  const opts = [
    `El claim es este: ${a.claimSummary.slice(0, 140)}. Sin metodología y fuente, es un eslogan con dígitos.`,
    p
      ? `${p} no se discute con fe: se discute con tabla, definición y serie comparable.`
      : `Pones números sobre la mesa. Bien. Ahora pon la fuente y el método, o son adorno.`,
    `Dato sin auditoría es publicidad. Tu texto afirma ${a.claimSummary.slice(0, 100)}.`,
  ];
  return opts[variantIndex % opts.length];
}

export function groundedBody(
  a: ContentAnalysis,
  stance: string,
  narrative: string,
  variantIndex: number,
): string[] {
  const parts: string[] = [];
  const st = stance.trim();
  const narr = narrative.trim() || st;

  parts.push(a.amplifyLine);

  // Preguntas ancladas (1–2 según variante)
  if (a.attackQuestions[0]) {
    parts.push(a.attackQuestions[variantIndex % a.attackQuestions.length]);
  }
  if (variantIndex !== 0 && a.attackQuestions[1]) {
    parts.push(a.attackQuestions[(variantIndex + 1) % a.attackQuestions.length]);
  }

  // Ángulo de desmontaje
  if (a.dismantleAngles[0]) {
    parts.push(a.dismantleAngles[variantIndex % a.dismantleAngles.length]);
  }

  if (a.kind === "exito_gobierno") {
    parts.push(
      variantIndex === 0
        ? `Pasar de "bajó un indicador" a "coordinación de los tres órdenes y tranquilidad del pueblo" es un salto de fe: correlación vendida como milagro de gestión.`
        : `Si la baja fuera tan limpia y tan atribuible, no haría falta el lenguaje de boletín patriótico: bastaría el tablero crudo y comparable.`,
    );
  }

  if (st) {
    parts.push(
      variantIndex === 2
        ? `Mientras el comunicado celebra, la postura que sí mira el cuadro completo es otra: ${st.slice(0, 160)}.`
        : `Eso no cierra el debate. Lo que sostiene mejor la realidad del hilo es: ${st.slice(0, 160)}.`,
    );
  } else if (narr) {
    parts.push(`La narrativa que no entra en el comunicado es esta: ${narr.slice(0, 160)}.`);
  }

  return parts;
}

export function groundedCloser(a: ContentAnalysis, stance: string, variantIndex: number): string {
  const st = stance.trim();
  if (a.kind === "estadistica" || a.kind === "exito_gobierno") {
    const opts = [
      `Fuente, definición y serie larga. Sin eso, tu porcentaje es un cartel, no un argumento.`,
      `Cuando el dato sobreviva a una contraparte independiente —no al copypaste del boletín— hablamos en serio.`,
      st
        ? `Hasta entonces, el feed puede aplaudir el comunicado; nosotros nos quedamos con ${st.slice(0, 80)}.`
        : `Hasta entonces, esto es victoria narrativa con calculadora de campaña.`,
    ];
    return opts[variantIndex % opts.length];
  }
  const opts = [
    `Prueba concreta o baja el sermón. La audiencia ya distingue humo de sustancia.`,
    st
      ? `El marco que no se cae es este: ${st.slice(0, 100)}.`
      : `Sin anclaje verificable, solo queda el volumen.`,
    `No hace falta gritar: hace falta que tu claim sobreviva una pregunta incómoda.`,
  ];
  return opts[variantIndex % opts.length];
}
