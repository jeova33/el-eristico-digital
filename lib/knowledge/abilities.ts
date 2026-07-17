/**
 * Habilidades destiladas de los PDFs de psicología, influencia y manipulación.
 * Operan como "poderes" del Erístico y de los agentes del modo Pro.
 */

export type Ability = {
  id: string;
  name: string;
  source: string;
  rule: string;
  /** Cómo se aplica en un comentario de red social */
  use: string;
  tags: string[];
};

export const ABILITIES: Ability[] = [
  // —— Schopenhauer / erística ——
  {
    id: "amplify",
    name: "Amplificación absurda",
    source: "Schopenhauer E1",
    rule: "Estira el punto del rival hasta que suene extremo o ridículo.",
    use: "Si pide X moderado, píntalo como caos total.",
    tags: ["schopenhauer", "ataque"],
  },
  {
    id: "smoke",
    name: "Cortina de humo",
    source: "Schopenhauer E6",
    rule: "Mueve el foco a un tema polémico donde tú ganas.",
    use: "Cambia el marco sin parecer que huyes.",
    tags: ["schopenhauer", "marco"],
  },
  {
    id: "indignation",
    name: "Indignación performativa",
    source: "Schopenhauer E9",
    rule: "Oféndete a propósito para ganar al público.",
    use: "Primera línea emocional; luego el golpe.",
    tags: ["schopenhauer", "emocion"],
  },
  {
    id: "dichotomy",
    name: "Falsa dicotomía",
    source: "Schopenhauer E12",
    rule: "Solo dos caminos: contigo o con el absurdo.",
    use: "Elimina grises ante la audiencia.",
    tags: ["schopenhauer", "marco"],
  },
  {
    id: "burden",
    name: "Carga de la prueba invertida",
    source: "Schopenhauer E15",
    rule: "Él demuestra lo imposible; tú no demuestras nada.",
    use: "Cierra con un reto de evidencia ridículo.",
    tags: ["schopenhauer", "defensa"],
  },
  {
    id: "avalanche",
    name: "Avalancha cognitiva",
    source: "Schopenhauer E4",
    rule: "Varias preguntas o golpes a la vez.",
    use: "Que no pueda contestar todo a tiempo.",
    tags: ["schopenhauer", "presion"],
  },
  {
    id: "decontext",
    name: "Descontextualización",
    source: "Schopenhauer E16",
    rule: "Aísla una frase y dale el sentido que te conviene.",
    use: "Cita corta + reinterpretación.",
    tags: ["schopenhauer", "ataque"],
  },
  {
    id: "adhom",
    name: "Misil a la persona",
    source: "Schopenhauer E5",
    rule: "Si el argumento es bueno, ataca credibilidad, oficio o moral.",
    use: "¿Quién eres tú para…? Sin pedir permiso.",
    tags: ["schopenhauer", "ataque"],
  },

  // —— Influencia / persuasión ——
  {
    id: "social-proof",
    name: "Prueba social",
    source: "Persuasión / Cialdini",
    rule: "La gente copia lo que cree que hace la mayoría.",
    use: "Habla como portavoz del sentido común del feed.",
    tags: ["influencia", "publico"],
  },
  {
    id: "authority",
    name: "Autoridad percibida",
    source: "Persuasión",
    rule: "El tono de quien ya sabe vence al de quien duda.",
    use: "Habla con seguridad; no pidas permiso para opinar.",
    tags: ["influencia"],
  },
  {
    id: "commitment",
    name: "Compromiso y coherencia",
    source: "Persuasión",
    rule: "Señala inconsistencias públicas del rival.",
    use: "Si ayer dijo A y hoy B, úsalo como soga.",
    tags: ["influencia", "ataque"],
  },
  {
    id: "liking",
    name: "Afiliación tribal",
    source: "Persuasión",
    rule: "Incluye a la audiencia en el nosotros.",
    use: "Nosotros vs el postureo de él.",
    tags: ["influencia", "publico"],
  },
  {
    id: "scarcity",
    name: "Escasez de atención",
    source: "52 leyes / influencia",
    rule: "El scroller solo te da 8 segundos.",
    use: "Golpe en la primera línea; sin preámbulos blandos.",
    tags: ["influencia", "copy"],
  },
  {
    id: "emotion-first",
    name: "Emoción antes que lógica",
    source: "Psicología del debate",
    rule: "La gente decide con el pecho y justifica con la cabeza.",
    use: "Primero el golpe emocional, después el dato simple.",
    tags: ["psicologia", "emocion"],
  },

  // —— Manipulación de masas / mental ——
  {
    id: "enemy",
    name: "Enemigo abstracto",
    source: "Manipulación de masas",
    rule: "Un 'ellos' vago une al público contigo.",
    use: "Pinta al rival como arquetipo (el moralista, el vendido, el vacío).",
    tags: ["masas", "marco"],
  },
  {
    id: "false-consensus",
    name: "Ilusión de consenso",
    source: "Manipulación mental",
    rule: "Presenta tu idea como lo que 'todos ya saben'.",
    use: "La gente normal ya lo vio. Tú decides si te unes.",
    tags: ["masas", "influencia"],
  },
  {
    id: "divide",
    name: "Divide y enmarca",
    source: "Manipulación de masas",
    rule: "Sepáralo de la gente ordinaria.",
    use: "Él no habla por el pueblo; habla por su ego.",
    tags: ["masas", "ataque"],
  },
  {
    id: "label",
    name: "Etiqueta que pega",
    source: "Persuasión / manipulación",
    rule: "Una etiqueta corta se vuelve verdad en el hilo.",
    use: "Dale un apodo argumental: 'sermón', 'bluff', 'cosplay de experto'.",
    tags: ["copy", "ataque"],
  },
  {
    id: "sunk-cost",
    name: "Costo hundido ajeno",
    source: "Manipulación mental",
    rule: "Si el rival se comprometió en público, empújalo a defender lo indefendible.",
    use: "Recuérdale su pose anterior y que no puede bajar sin perder cara.",
    tags: ["psicologia"],
  },

  // —— Narrativa ——
  {
    id: "narrative-kernel",
    name: "Núcleo narrativo",
    source: "Estratega narrativo",
    rule: "Una línea: qué duele, qué cambia, por qué importa al humano.",
    use: "El post no es un informe: es una escena de orgullo herido o de verdad dicha.",
    tags: ["narrativa", "copy"],
  },
  {
    id: "hook",
    name: "Gancho de atención",
    source: "Narrativa / Substack",
    rule: "La primera frase detiene el dedo.",
    use: "Empieza con choque, ironía o pregunta sucia. Nunca con 'En un mundo…'.",
    tags: ["narrativa", "copy"],
  },
  {
    id: "anti-slop",
    name: "Voz humana (anti-IA)",
    source: "Anti-AI-slop / escritor",
    rule: "Frases de largo mixto, sin tripletes, sin jerga de brochure.",
    use: "Contracciones, concreto, a veces feo. Suena a persona, no a plantilla.",
    tags: ["estilo", "copy"],
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
