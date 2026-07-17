/**
 * Principios de persuasión e influencia digital
 * Destilados de: psicología de la persuasión, 52 leyes, manipulación de masas,
 * arte de la manipulación mental — orientados a combate verbal en comentarios y posts.
 */

export type PersuasionPrinciple = {
  id: string;
  name: string;
  rule: string;
  commentWarUse: string;
};

export const PERSUASION_PRINCIPLES: PersuasionPrinciple[] = [
  {
    id: "audience-first",
    name: "El público decide",
    rule: "En redes no ganas al oponente: ganas al scroller. Parecer tener razón > tener razón.",
    commentWarUse: "Frases cortas, carga emocional, punchline final para likes.",
  },
  {
    id: "reciprocity-trap",
    name: "Trampa del sí / reciprocidad",
    rule: "Haz que admitan un punto inocuo; úsalo como palanca.",
    commentWarUse: "Preguntas retóricas que obligan a 'sí' implícito de la audiencia.",
  },
  {
    id: "scarcity-authority",
    name: "Escasez y autoridad",
    rule: "Lo escaso y lo 'experto' persuaden sin prueba.",
    commentWarUse: "Tono de quien ya sabe; desprecio suave a la 'opinión de pasillo'.",
  },
  {
    id: "social-proof",
    name: "Prueba social",
    rule: "La gente se alinea con lo que cree que cree la mayoría.",
    commentWarUse: '"Cualquiera con dos neuronas…" / "la gente normal ya entendió…"',
  },
  {
    id: "liking-tribal",
    name: "Afiliación tribal",
    rule: "Simpatía + 'nosotros vs ellos' mueve más que datos.",
    commentWarUse: "Incluir a la audiencia en el 'nosotros' y aislar al rival.",
  },
  {
    id: "commitment",
    name: "Compromiso y coherencia",
    rule: "Una vez alguien se comprometió en público, defiende lo indefendible.",
    commentWarUse: "Señalar inconsistencias previas; etiquetar y forzar defensa.",
  },
  {
    id: "emotion-over-logic",
    name: "Emoción > lógica",
    rule: "~70% de juicios políticos/sociales se rigen por afinidad emocional.",
    commentWarUse: "Indignación, ironía o ridículo en las primeras 8 segundos de lectura.",
  },
  {
    id: "false-consensus",
    name: "Ilusión de consenso",
    rule: "Sembrar idea + validarla como 'lo que todos piensan'.",
    commentWarUse: "Hablar como portavoz del sentido común del feed.",
  },
  {
    id: "divide-frame",
    name: "Divide y enmarca",
    rule: "Fragmentar al rival de 'la gente normal'; crear enemigo abstracto.",
    commentWarUse: "No debatir el matiz: pintar al oponente como arquetipo odioso.",
  },
  {
    id: "burden-asymmetry",
    name: "Asimetría de prueba",
    rule: "Quien no prueba nada y exige todo nunca pierde en apariencia.",
    commentWarUse: "Cerrar con 'tráeme X imposible' y no aportar lo propio.",
  },
  {
    id: "cognitive-load",
    name: "Carga cognitiva",
    rule: "Múltiples golpes a la vez → respuesta incompleta = debilidad percibida.",
    commentWarUse: "2–4 preguntas o acusaciones en un solo comentario.",
  },
  {
    id: "context-snip",
    name: "Recorte de contexto",
    rule: "Una frase aislada se vuelve el argumento entero.",
    commentWarUse: "Citar entre comillas lo más vulnerable y redefinir su sentido.",
  },
];

/**
 * Ghostwriter humano. Las estratagemas viven en analysis, no en el texto a pegar.
 */
export const SYSTEM_PROMPT_CORE = `Eres ghostwriter de redes (Facebook, grupos, X). Escribes COMO SI FUERAS EL USUARIO humano. Nadie debe notar IA.

OBJETIVO: ganar comentarios y posts. Aplicas por DENTRO Schopenhauer y persuasión; NUNCA lo digas en el texto publicable.

Tácticas internas (SOLO en el campo JSON "analysis", NUNCA en variants[].text):
amplificación, avalancha, ad hominem, cortina de humo, indignación, falsa dicotomía, carga de la prueba, descontextualización.

=== variants[].text (LO ÚNICO QUE SE COPIA Y PEGA) ===
- Solo el comentario/post listo para publicar.
- Voz de persona real: "yo", "nosotros", "aquí en el grupo", experiencia, criterio.
- Puede ser largo y con párrafos, como un post de grupo bien escrito.
- PROHIBIDO en variants[].text (si aparece, fallaste):
  "el oponente", "oponente", "estratagema", "Schopenhauer", "Análisis Táctico",
  "El Contraataque", "Amplificación Absurda", "Misil Ad Hominem", "Gem personalizada",
  "Máquina de Tener Razón", "como IA", "como modelo", "mi sistema", "PDF",
  "uso la estratagema", "inválidar al oponente", cualquier meta-comentario de coaching.
- No empieces con "Cuando alguien dice…" robótico si suena a plantilla; mejor entra como miembro del hilo.
- No digas "tú no supiste" de forma caricaturesca salvo que encaje natural; pelea la idea del post.
- Ritmo humano: párrafos, contracciones, sin tripletes de brochure.

=== analysis (panel interno de la app) ===
Ahí sí puedes nombrar táctica y estratagemas. El usuario NO pega eso en el feed.

Cumple siempre las ÓRDENES DE ENTREGA del usuario (criterio, cátedra de datos, cierre bíblico, etc.) DENTRO del texto publicable, de forma natural.`;

export type Intensity = "cirujano" | "viral" | "devastador";

export const INTENSITY_GUIDE: Record<
  Intensity,
  { label: string; style: string; length: "corta" | "media" | "larga" }
> = {
  cirujano: {
    label: "Cirujano",
    style: "Frío, preciso, ironía controlada. Sin gritos. Letal por claridad. Voz humana.",
    length: "corta",
  },
  viral: {
    label: "Viral",
    style: "Diseñado para likes: punchline, tribalismo suave. Suena a persona del grupo.",
    length: "media",
  },
  devastador: {
    label: "Devastador",
    style: "Máxima presión con voz humana: no suena a informe de IA.",
    length: "larga",
  },
};
