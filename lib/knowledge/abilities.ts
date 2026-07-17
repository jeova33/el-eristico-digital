/**
 * Catálogo de habilidades del Erístico Digital.
 * Fuentes: Schopenhauer (38 estratagemas), PDFs Telegram (persuasión, 52 leyes,
 * ciencia de la influencia, manipulación), Gamma (manipulación mental/masas,
 * 7 técnicas prohibidas, manipulación emocional digital, emociones colectivas,
 * psicología oscura).
 *
 * IMPORTANTE: se usan en analysis / consejo / selección táctica.
 * NUNCA nombrarlas en el texto publicable (variants[].text).
 */

export type Ability = {
  id: string;
  name: string;
  source: string;
  rule: string;
  /** Cómo se aplica en un comentario/post (ghostwriter: sin meta) */
  use: string;
  tags: string[];
};

export const ABILITIES: Ability[] = [
  // ═══ SCHOPENHAUER / ERÍSTICA ═══
  {
    id: "amplify",
    name: "Amplificación absurda",
    source: "Schopenhauer E1 · PDF estratagemas",
    rule: "Estira el punto del rival hasta que suene extremo o ridículo.",
    use: "Si pide X moderado, píntalo como caos total — en voz de persona del grupo.",
    tags: ["schopenhauer", "ataque", "core"],
  },
  {
    id: "ambiguity",
    name: "Ambigüedad de palabras",
    source: "Schopenhauer E2",
    rule: "Explotar doble sentido de términos para fingir contradicción.",
    use: "Toma 'libertad', 'talento', 'dinero real' y fija un sentido que lo deje mal parado.",
    tags: ["schopenhauer", "ataque"],
  },
  {
    id: "relabel-refuted",
    name: "Etiqueta ya derrotada",
    source: "Schopenhauer E3",
    rule: "Presentar su idea como versión ya refutada de algo conocido.",
    use: "'Eso ya se intentó y ya sabemos cómo termina'.",
    tags: ["schopenhauer", "marco"],
  },
  {
    id: "avalanche",
    name: "Avalancha cognitiva",
    source: "Schopenhauer E4",
    rule: "Varias preguntas o golpes a la vez.",
    use: "2–4 preguntas en un comentario; que no pueda contestar todo.",
    tags: ["schopenhauer", "presion", "core"],
  },
  {
    id: "adhom",
    name: "Misil a la persona",
    source: "Schopenhauer E5",
    rule: "Si el argumento es bueno, ataca credibilidad, oficio o moral.",
    use: "Sin decir 'oponente': duda del recorrido, no del PDF.",
    tags: ["schopenhauer", "ataque", "core"],
  },
  {
    id: "smoke",
    name: "Cortina de humo",
    source: "Schopenhauer E6",
    rule: "Mueve el foco a un tema polémico donde tú ganas.",
    use: "Cambia el marco sin parecer que huyes.",
    tags: ["schopenhauer", "marco", "core"],
  },
  {
    id: "trap-yes",
    name: "Trampa del sí",
    source: "Schopenhauer E7 · Cialdini pie en la puerta",
    rule: "Haz admitir un punto inocuo y úsalo de palanca.",
    use: "Preguntas a las que el público ya asiente; luego el golpe.",
    tags: ["schopenhauer", "influencia"],
  },
  {
    id: "consequences",
    name: "Catástrofe hipotética",
    source: "Schopenhauer E8",
    rule: "No refutes la premisa: aterroriza con si fuera verdad.",
    use: "Miedo futuro > lógica presente en el feed.",
    tags: ["schopenhauer", "emocion"],
  },
  {
    id: "indignation",
    name: "Indignación performativa",
    source: "Schopenhauer E9",
    rule: "Oféndete a propósito para ganar al público.",
    use: "Primera línea emocional; luego el golpe. Voz humana.",
    tags: ["schopenhauer", "emocion", "core"],
  },
  {
    id: "authority",
    name: "Autoridad percibida",
    source: "Schopenhauer E10 · Cialdini · Ciencia de la influencia",
    rule: "El tono de quien ya sabe vence al de quien duda.",
    use: "Habla con seguridad; no pidas permiso para opinar.",
    tags: ["influencia", "schopenhauer", "core"],
  },
  {
    id: "capciosa",
    name: "Pregunta capciosa",
    source: "Schopenhauer E11",
    rule: "Devuelve la carga con una pregunta que lo ponga a la defensiva.",
    use: "¿Por qué te molesta tanto que digamos lo obvio?",
    tags: ["schopenhauer", "defensa"],
  },
  {
    id: "dichotomy",
    name: "Falsa dicotomía",
    source: "Schopenhauer E12",
    rule: "Solo dos caminos: contigo o con el absurdo.",
    use: "Elimina grises ante la audiencia del grupo.",
    tags: ["schopenhauer", "marco", "core"],
  },
  {
    id: "trojan",
    name: "Caballo de Troya",
    source: "Schopenhauer E13",
    rule: "Concede un punto menor para usarlo después a favor.",
    use: "'En algo tienes razón… y justo por eso tu conclusión se cae'.",
    tags: ["schopenhauer", "marco"],
  },
  {
    id: "burden",
    name: "Carga de la prueba invertida",
    source: "Schopenhauer E15",
    rule: "Él demuestra lo imposible; tú no demuestras nada.",
    use: "Cierra con un reto de evidencia ridículo pero creíble en el hilo.",
    tags: ["schopenhauer", "defensa", "core"],
  },
  {
    id: "decontext",
    name: "Descontextualización",
    source: "Schopenhauer E16 · manipulación emocional digital",
    rule: "Aísla una frase y dale el sentido que te conviene.",
    use: "Cita corta del post + reinterpretación que invierte el significado.",
    tags: ["schopenhauer", "ataque", "core", "digital"],
  },

  // ═══ INFLUENCIA / CIALDINI / 52 LEYES / CIENCIA DE LA INFLUENCIA ═══
  {
    id: "social-proof",
    name: "Prueba social",
    source: "Cialdini · 52 leyes · Ciencia de la influencia (Tracy)",
    rule: "La gente copia lo que cree que hace la mayoría.",
    use: "Habla como portavoz del sentido común del grupo/feed.",
    tags: ["influencia", "publico", "core"],
  },
  {
    id: "liking",
    name: "Afiliación tribal",
    source: "Cialdini · persuasión",
    rule: "Incluye a la audiencia en el nosotros.",
    use: "Nosotros (gente del grupo) vs el postureo de afuera.",
    tags: ["influencia", "publico", "core"],
  },
  {
    id: "commitment",
    name: "Compromiso y coherencia",
    source: "Cialdini · pie en la puerta (7 técnicas)",
    rule: "Señala inconsistencias públicas del rival.",
    use: "Si ayer dijo A y hoy B, úsalo sin sonar a manual.",
    tags: ["influencia", "ataque", "core"],
  },
  {
    id: "scarcity",
    name: "Escasez y FOMO",
    source: "Cialdini · 7 técnicas prohibidas · 52 leyes",
    rule: "Lo escaso o que se acaba mueve más que lo abundante.",
    use: "Urgencia de atención: 'si no lo ves ahora…' sin sonar a telemarketing.",
    tags: ["influencia", "emocion", "digital"],
  },
  {
    id: "reciprocity",
    name: "Reciprocidad / deuda",
    source: "Cialdini · 7 técnicas · persuasión→influencia",
    rule: "Un 'regalo' crea obligación de devolver.",
    use: "Concede un punto y exige coherencia a cambio.",
    tags: ["influencia", "psicologia"],
  },
  {
    id: "anchor",
    name: "Anclaje cognitivo",
    source: "Kahneman/Tversky · 7 técnicas prohibidas",
    rule: "El primer número o marco fija toda la evaluación posterior.",
    use: "Lanza primero la cifra o el absurdo que te conviene como referencia.",
    tags: ["psicologia", "influencia", "datos"],
  },
  {
    id: "foot-door",
    name: "Pie en la puerta",
    source: "7 técnicas · Freedman & Fraser",
    rule: "Un sí pequeño abre el sí grande.",
    use: "Empuja al público a asentir en algo obvio; luego el veredicto.",
    tags: ["influencia", "psicologia"],
  },
  {
    id: "bandwagon",
    name: "Efecto bandwagon",
    source: "Asch · validación social algorítmica (7 técnicas)",
    rule: "Conformidad: la verdad del grupo vence a la del individuo.",
    use: "'Aquí casi nadie compra ese cuento' / 'la gente del grupo ya lo vio'.",
    tags: ["influencia", "masas", "digital"],
  },
  {
    id: "unity",
    name: "Unidad / tribu",
    source: "Cialdini (unidad) · ciencia de la influencia",
    rule: "La gente se mueve por 'somos de los mismos'.",
    use: "Habla como miembro del grupo, no como forastero moralista.",
    tags: ["influencia", "publico", "narrativa"],
  },
  {
    id: "liking-flattery",
    name: "Simpatía y espejo",
    source: "Ciencia de la influencia · Carnegie vía Tracy",
    rule: "Caemos bien a quienes nos recuerdan o nos validan.",
    use: "Valida al público del grupo antes de clavar al post.",
    tags: ["influencia", "publico"],
  },

  // ═══ PSICOLOGÍA / 7 TÉCNICAS / NEURO ═══
  {
    id: "emotion-first",
    name: "Emoción antes que lógica",
    source: "Psicología del debate · emociones colectivas",
    rule: "La gente decide con el pecho y justifica con la cabeza.",
    use: "Primero el golpe emocional, después el dato simple.",
    tags: ["psicologia", "emocion", "core"],
  },
  {
    id: "zeigarnik",
    name: "Efecto Zeigarnik (incompleto)",
    source: "7 técnicas psicológicas prohibidas",
    rule: "El cerebro odia lo inconcluso; mantiene atención.",
    use: "Deja una pregunta abierta que pique; cierra con un gancho al final.",
    tags: ["psicologia", "digital", "copy"],
  },
  {
    id: "priming",
    name: "Priming emocional",
    source: "7 técnicas · Bargh",
    rule: "Pre-carga el estado mental antes del mensaje real.",
    use: "Primera línea: imagen o emoción; luego la tesis.",
    tags: ["psicologia", "emocion", "digital"],
  },
  {
    id: "loss-aversion",
    name: "Aversión a la pérdida",
    source: "Kahneman · escasez (7 técnicas)",
    rule: "Perder duele más que ganar el doble.",
    use: "Enmarca lo que el público 'pierde' si cree el post rival.",
    tags: ["psicologia", "influencia"],
  },
  {
    id: "cognitive-dissonance",
    name: "Disonancia cognitiva",
    source: "Psicología · manipulación mental",
    rule: "La gente defiende lo que ya dijo para no verse incoherente.",
    use: "Empuja al rival (o al público) a sostener un sí previo.",
    tags: ["psicologia", "influencia"],
  },
  {
    id: "amygdala-hijack",
    name: "Secuestro amigdalino",
    source: "Neuro · 7 técnicas · dominio emocional",
    rule: "Bajo amenaza al ego, se piensa peor.",
    use: "Presión emocional controlada en el feed; no sermón clínico.",
    tags: ["psicologia", "emocion", "presion"],
  },
  {
    id: "status-threat",
    name: "Amenaza de estatus",
    source: "Psicología social · Greene (Maestría/48)",
    rule: "El estatus en el grupo mueve más que los datos.",
    use: "Que el público sienta que el post rival baja de nivel al grupo.",
    tags: ["psicologia", "masas", "ataque"],
  },

  // ═══ MANIPULACIÓN MENTAL / MASAS / DIGITAL ═══
  {
    id: "enemy",
    name: "Enemigo abstracto",
    source: "Manipulación de masas (Gamma)",
    rule: "Un 'ellos' vago une al público contigo.",
    use: "Pinta arquetipos: el moralista, el vendido, el que nunca montó nada.",
    tags: ["masas", "marco", "core"],
  },
  {
    id: "false-consensus",
    name: "Ilusión de consenso",
    source: "Manipulación mental · masas",
    rule: "Presenta tu idea como lo que 'todos ya saben'.",
    use: "La gente normal del grupo ya lo vio. Tú decides si te unes.",
    tags: ["masas", "influencia", "core"],
  },
  {
    id: "divide",
    name: "Divide y enmarca",
    source: "Manipulación de masas",
    rule: "Sepáralo de la gente ordinaria del grupo.",
    use: "Él no habla por el grupo; habla por su ego o su frustración.",
    tags: ["masas", "ataque"],
  },
  {
    id: "label",
    name: "Etiqueta que pega",
    source: "Persuasión / manipulación",
    rule: "Una etiqueta corta se vuelve verdad en el hilo.",
    use: "'Sermón', 'bluff', 'cosplay de experto', 'boletín'.",
    tags: ["copy", "ataque", "core"],
  },
  {
    id: "sunk-cost",
    name: "Costo hundido ajeno",
    source: "Manipulación mental",
    rule: "Si se comprometió en público, empuja a defender lo indefendible.",
    use: "Recuerda su pose anterior sin sonar a psicólogo de TikTok.",
    tags: ["psicologia", "ataque"],
  },
  {
    id: "seed-idea",
    name: "Inoculación de idea",
    source: "Arte de la manipulación mental (Gamma)",
    rule: "Sembrar idea sutilmente para que parezca del grupo.",
    use: "Haz que la conclusión 'surja' del sentido común del hilo.",
    tags: ["manipulacion", "masas"],
  },
  {
    id: "emotional-contagion",
    name: "Contagio emocional",
    source: "Emociones colectivas · psicología de masas (Le Bon)",
    rule: "Las emociones se propagan más rápido que los argumentos.",
    use: "Ira o ironía compartida del grupo > silogismo.",
    tags: ["masas", "emocion", "digital", "core"],
  },
  {
    id: "suggestion",
    name: "Sugestión de masa",
    source: "Psicología de masas · emociones colectivas",
    rule: "La masa es más sugestionable que el individuo aislado.",
    use: "Frases cortas, repetibles, con ritmo de eslogan natural.",
    tags: ["masas", "copy"],
  },
  {
    id: "echo-chamber",
    name: "Cámara de eco / polarización",
    source: "Emociones colectivas · era digital",
    rule: "Los algoritmos premian nosotros vs ellos.",
    use: "Ancla al 'nosotros del grupo' frente al discurso externo.",
    tags: ["masas", "digital"],
  },
  {
    id: "public-trap",
    name: "Escenificación pública",
    source: "Manipulación emocional digital (Gamma)",
    rule: "Forzar respuesta ante testigos para que cualquier reacción pierda.",
    use: "Escribe para los que leen el hilo, no para convertirlo en privado.",
    tags: ["manipulacion", "digital", "publico"],
  },
  {
    id: "exposure-frag",
    name: "Fragmento viral / descontexto",
    source: "Manipulación emocional digital",
    rule: "Un fragmento emocional descontextualizado se vuelve el argumento.",
    use: "Elige la frase más débil del post y hazla el centro del hilo.",
    tags: ["digital", "ataque", "schopenhauer"],
  },
  {
    id: "love-bomb-invert",
    name: "Falsa benevolencia invertida",
    source: "Manipulación emocional · 7 técnicas",
    rule: "Tras el golpe, postura de 'preocupación' que humilla más.",
    use: "Tono de 'te lo digo por el bien del grupo' con cuchillo dentro.",
    tags: ["manipulacion", "emocion"],
  },
  {
    id: "gaslight-light",
    name: "Reencuadre de realidad (suave)",
    source: "Psicología oscura · manipulación",
    rule: "Redefine lo que 'realmente' dijo hasta que suene absurdo.",
    use: "Sin decir gaslight: 'lo que en el fondo estás vendiendo es…'.",
    tags: ["manipulacion", "marco"],
  },
  {
    id: "projection",
    name: "Proyección",
    source: "Psicología oscura",
    rule: "Acusa al otro de lo que él hace o teme.",
    use: "'Eso suena a frustración disfrazada de lección'.",
    tags: ["psicologia", "ataque"],
  },
  {
    id: "tribal-shame",
    name: "Vergüenza tribal",
    source: "Psicología de masas · manipulación",
    rule: "La exclusión del grupo duele más que perder un argumento.",
    use: "Implica que el post baja el nivel del grupo, no solo 'está mal'.",
    tags: ["masas", "emocion"],
  },

  // ═══ NARRATIVA / VOZ HUMANA ═══
  {
    id: "narrative-kernel",
    name: "Núcleo narrativo",
    source: "Estratega narrativo",
    rule: "Qué duele, qué cambia, por qué importa al humano.",
    use: "Escena de orgullo herido o verdad dicha; no informe.",
    tags: ["narrativa", "copy", "core"],
  },
  {
    id: "hook",
    name: "Gancho de atención",
    source: "Narrativa · Zeigarnik",
    rule: "La primera frase detiene el dedo.",
    use: "Choque, ironía o verdad incómoda. Nunca 'En un mundo…'.",
    tags: ["narrativa", "copy", "core"],
  },
  {
    id: "anti-slop",
    name: "Voz humana (anti-IA)",
    source: "Anti-AI-slop / escritor",
    rule: "Frases de largo mixto, sin tripletes, sin brochure.",
    use: "Contracciones, concreto, a veces feo. Parece persona del grupo.",
    tags: ["estilo", "copy", "core"],
  },
  {
    id: "storytime",
    name: "Mini historia",
    source: "Blog/Substack · persuasión",
    rule: "Una anécdota corta vende más que una tesis.",
    use: "'Llevo tiempo leyendo el grupo…' estilo humano real.",
    tags: ["narrativa", "copy"],
  },
  {
    id: "punchline",
    name: "Cierre punchline",
    source: "Copy redes · influencia",
    rule: "La última línea es la que se recuerda y se likea.",
    use: "Cierra con veredicto o pregunta que deje el hilo a tu favor.",
    tags: ["copy", "core"],
  },
];

export type AbilityCategory = {
  id: string;
  label: string;
  description: string;
};

export const ABILITY_CATEGORIES: AbilityCategory[] = [
  {
    id: "schopenhauer",
    label: "Erística (Schopenhauer)",
    description: "38 estratagemas · combate verbal clásico adaptado a redes",
  },
  {
    id: "influencia",
    label: "Influencia y persuasión",
    description: "Cialdini, 52 leyes, ciencia de la influencia, pie en la puerta",
  },
  {
    id: "psicologia",
    label: "Psicología y neuro",
    description: "Emoción, anclaje, disonancia, FOMO, Zeigarnik, priming",
  },
  {
    id: "masas",
    label: "Masas y digital",
    description: "Contagio, polarización, enemigo abstracto, algoritmos",
  },
  {
    id: "manipulacion",
    label: "Manipulación (táctica)",
    description: "Mental, emocional digital, proyección, reencuadre",
  },
  {
    id: "narrativa",
    label: "Narrativa y voz",
    description: "Gancho, historia, anti-IA, punchline",
  },
];

export function abilitiesByTag(tag: string): Ability[] {
  return ABILITIES.filter((a) => a.tags.includes(tag));
}

export function pickAbilities(ids: string[]): Ability[] {
  return ids
    .map((id) => ABILITIES.find((a) => a.id === id))
    .filter((a): a is Ability => Boolean(a));
}

export function coreAbilities(): Ability[] {
  return ABILITIES.filter((a) => a.tags.includes("core"));
}

/** Resumen compacto para el prompt del LLM (ahorra tokens, no lista las 50+) */
export function abilitiesDigestForPrompt(max = 18): string {
  const core = coreAbilities();
  const extra = ABILITIES.filter((a) => !a.tags.includes("core")).slice(0, Math.max(0, max - core.length));
  const list = [...core, ...extra].slice(0, max);
  return list
    .map((a) => `- ${a.id}: ${a.name} — ${a.use}`)
    .join("\n");
}

/** Elige habilidades según el texto del post (heurística) */
export function selectAbilitiesForText(text: string, count = 8): Ability[] {
  const t = text.toLowerCase();
  const scored = ABILITIES.map((a) => {
    let score = a.tags.includes("core") ? 2 : 0;
    if (/\d|%|por ciento|dato|estudio|fuente/.test(t) && a.tags.includes("datos")) score += 2;
    if (/pueblo|gobierno|todos|nadie|siempre/.test(t) && a.tags.includes("masas")) score += 2;
    if (/moral|deber|vergüenza|odio/.test(t) && a.tags.includes("emocion")) score += 2;
    if (/ia|inteligencia|prompt|chatgpt|midjourney/.test(t) && a.tags.includes("digital")) score += 1;
    if (a.tags.includes("influencia")) score += 0.5;
    score += Math.random() * 0.3;
    return { a, score };
  }).sort((x, y) => y.score - x.score);
  const picked: Ability[] = [];
  const seen = new Set<string>();
  for (const { a } of scored) {
    if (picked.length >= count) break;
    if (seen.has(a.id)) continue;
    picked.push(a);
    seen.add(a.id);
  }
  return picked;
}

export function formatAbilitiesForAnalysis(abilities: Ability[]): string {
  return abilities.map((a) => `${a.name} (${a.source})`).join(" · ");
}
