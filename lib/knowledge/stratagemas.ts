/**
 * Las 38 estratagemas de Arthur Schopenhauer — Dialéctica Erística
 * Adaptadas a guerra de comentarios digital (era redes sociales).
 * Fuente: Las 38 Estratagemas de Schopenhauer: Persuasión Moderna...
 */

export type Stratagem = {
  id: number;
  name: string;
  digitalName: string;
  group: string;
  summary: string;
  digitalUse: string;
  triggerHints: string[];
};

export const STRATAGEMS: Stratagem[] = [
  {
    id: 1,
    name: "Extender la proposición",
    digitalName: "La Amplificación Absurda",
    group: "Manipulación inicial",
    summary:
      "Amplificar el argumento del oponente más allá de sus límites reales para que suene extremista o ridículo.",
    digitalUse:
      "Si piden algo moderado, acusarlos de querer el caos total. Memes, hashtags y reducciones virales.",
    triggerHints: ["moderado", "propuesta", "debería", "hay que", "apoyo", "en favor"],
  },
  {
    id: 2,
    name: "Ambigüedad de palabras",
    digitalName: "Juego de Significados",
    group: "Manipulación inicial",
    summary: "Explotar el doble significado de términos para fingir contradicción.",
    digitalUse: "Libertad, justicia, violencia, verdad: forzar un sentido y acusar de hipocresía.",
    triggerHints: ["libertad", "justicia", "derecho", "verdad", "respeto", "violencia"],
  },
  {
    id: 3,
    name: "Reinterpretar como refutado",
    digitalName: "Etiqueta Ya Derrotada",
    group: "Manipulación inicial",
    summary: "Presentar su argumento como versión ya refutada de algo conocido.",
    digitalUse: '"Eso es exactamente X y ya sabemos cómo terminó."',
    triggerHints: ["como", "igual que", "parecido", "sistema", "modelo"],
  },
  {
    id: 4,
    name: "Avalancha de puntos",
    digitalName: "Avalancha Cognitiva",
    group: "Manipulación inicial",
    summary: "Lanzar múltiples críticas/preguntas a la vez para saturar la respuesta.",
    digitalUse:
      "En redes, la presión de responder rápido hace colapsar o parecer débil a quien no contesta todo.",
    triggerHints: ["varios", "además", "también", "lista", "puntos"],
  },
  {
    id: 5,
    name: "Argumento ad hominem",
    digitalName: "El Misil Ad Hominem",
    group: "Manipulación inicial",
    summary: "Atacar a la persona, experiencia o autoridad moral en lugar del argumento.",
    digitalUse: '"¿Cómo puedes opinar de esto si tú no eres/tienes...?"',
    triggerHints: ["experto", "experiencia", "nunca", "tú no", "desde tu"],
  },
  {
    id: 6,
    name: "Plantear cuestiones ajenas",
    digitalName: "La Cortina de Humo",
    group: "Desviación y autoridad",
    summary: "Desviar la atención a temas irrelevantes pero polémicos.",
    digitalUse: "Mover el debate al terreno donde tú tienes ventaja emocional o narrativa.",
    triggerHints: ["pero y", "mientras", "hablando de", "y qué hay de"],
  },
  {
    id: 7,
    name: "Forzar admisiones comprometedoras",
    digitalName: "Trampa del Sí",
    group: "Desviación y autoridad",
    summary: "Hacer admitir puntos inocuos que luego se usan en contra.",
    digitalUse: "Preguntas a las que es imposible decir no → palanca.",
    triggerHints: ["estás de acuerdo", "no crees que", "admites"],
  },
  {
    id: 8,
    name: "Atacar las consecuencias",
    digitalName: "Catástrofe Hipotética",
    group: "Desviación y autoridad",
    summary: "No refutar la premisa: terrorizar con implicaciones si fuera verdad.",
    digitalUse: "Miedo futuro > lógica presente. Funciona en hilos y reels.",
    triggerHints: ["si", "entonces", "llevaría a", "terminaría", "consecuencia"],
  },
  {
    id: 9,
    name: "Simular indignación",
    digitalName: "Indignación Performativa",
    group: "Desviación y autoridad",
    summary: "Hacerse el ofendido para ganar simpatía e intimidar al rival.",
    digitalUse: "Victimización viral: el público se alinea con el 'ofendido'.",
    triggerHints: ["indignante", "ofensivo", "cómo te atreves", "falta de respeto"],
  },
  {
    id: 10,
    name: "Apelar a la autoridad u opinión general",
    digitalName: "Consenso Fabricado",
    group: "Desviación y autoridad",
    summary: "Sustituir lógica por 'expertos', 'todos saben' o influencers.",
    digitalUse: "Citar autoridad vaga o 'la gente normal' sin fuentes precisas.",
    triggerHints: ["todos", "científicos", "expertos", "obvio", "todo el mundo"],
  },
  {
    id: 11,
    name: "Respuesta evasiva con capciosas",
    digitalName: "Pregunta Capciosa",
    group: "Manipulación de la percepción",
    summary: "Responder con pregunta que devuelve la carga al interlocutor.",
    digitalUse: '"¿Por qué me preguntas eso? ¿Tienes algo que ocultar?"',
    triggerHints: ["por qué", "pregunta", "responde"],
  },
  {
    id: 12,
    name: "Falsa dicotomía",
    digitalName: "Falsa Dicotomía",
    group: "Manipulación de la percepción",
    summary: "O estás con nosotros o estás contra nosotros. Eliminar grises.",
    digitalUse: "Polarización algorítmica: dos extremos fabricados, likes garantizados.",
    triggerHints: ["o", "si no", "entonces eres", "solo hay dos"],
  },
  {
    id: 13,
    name: "Victoria fácil con intención oculta",
    digitalName: "Caballo de Troya",
    group: "Manipulación de la percepción",
    summary: "Aceptar un punto menor para usarlo después a favor propio.",
    digitalUse: "Conceder lo trivial; redefinir el marco del debate.",
    triggerHints: ["parcialmente", "tiene razón en", "acepto que"],
  },
  {
    id: 14,
    name: "Contradicción sistemática",
    digitalName: "Negación por Principio",
    group: "Manipulación de la percepción",
    summary: "Oponerse a todo lo que diga, independientemente de la validez.",
    digitalUse: "Matizar o negar hasta el absurdo; resistencia pasiva digital.",
    triggerHints: ["siempre", "nunca", "todo", "nada"],
  },
  {
    id: 15,
    name: "Inversión de la carga de la prueba",
    digitalName: "Inversión de la Carga de la Prueba",
    group: "Manipulación de la percepción",
    summary: "Exigir evidencia imposible al oponente y no aportar la propia.",
    digitalUse: "Mantenerlo a la defensiva eternamente en el hilo.",
    triggerHints: ["demuestra", "prueba", "fuente", "evidencia", "datos"],
  },
  {
    id: 16,
    name: "Descontextualización",
    digitalName: "Descontextualización",
    group: "Distorsión y confusión",
    summary: "Aislar una parte del argumento e invertir su significado.",
    digitalUse: "Screenshot de media frase + caption que la invierte.",
    triggerHints: ["dijiste", "literalmente", "frase", "cita"],
  },
  {
    id: 17,
    name: "Conexiones débiles",
    digitalName: "Cadena Artificial",
    group: "Distorsión y confusión",
    summary: "Conectar X→Y→Z con lógica frágil pero dicha con confianza.",
    digitalUse: "Velocidad y seguridad > validez lógica ante audiencia.",
    triggerHints: ["entonces", "por lo tanto", "lleva a", "implica"],
  },
  {
    id: 18,
    name: "Contraargumento sin invalidar",
    digitalName: "Ilusión de Refutación",
    group: "Distorsión y confusión",
    summary: "Responder con otro argumento sin invalidar el primero.",
    digitalUse: "El auditorio ve 'respuesta' y la confunde con victoria.",
    triggerHints: ["en realidad", "lo que pasa es", "mira"],
  },
  {
    id: 19,
    name: "Demanda de prueba repetida",
    digitalName: "Meta Móvil de Evidencia",
    group: "Distorsión y confusión",
    summary: "Repetir la exigencia de prueba aunque ya se haya respondido.",
    digitalUse: "Agotar al oponente; impresión de que nunca bastó.",
    triggerHints: ["otra vez", "aún no", "sigue sin", "todavía"],
  },
  {
    id: 20,
    name: "Ad hominem de emergencia",
    digitalName: "Ad Hominem de Emergencia",
    group: "Distorsión y confusión",
    summary: "Cuando se pierde el fondo, atacar a la persona como última defensa.",
    digitalUse: "Escalada emocional cuando el hilo se pone en contra.",
    triggerHints: ["ridículo", "patético", "no sabes", "alucinas"],
  },
  {
    id: 21,
    name: "Interrumpir para impedir",
    digitalName: "Interrupción Digital",
    group: "Interrupción y descalificación",
    summary: "Impedir que complete el argumento ganador.",
    digitalUse: "Responder solo a la primera frase; floodear el hilo.",
    triggerHints: ["espera", "para", "no", "antes"],
  },
  {
    id: 22,
    name: "Generalidades vacías",
    digitalName: "Frase Grandilocuente",
    group: "Interrupción y descalificación",
    summary: "Frases profundas sin sustancia que ocupan espacio.",
    digitalUse: '"Al final lo que importa es el bien de todos." Relleno viral.',
    triggerHints: ["al final", "lo importante", "todos queremos", "el bien"],
  },
  {
    id: 23,
    name: "Reinterpretación a favor propio",
    digitalName: "Reinterpretación Forzada",
    group: "Interrupción y descalificación",
    summary: "Presentar su argumento como si apoyara tu tesis.",
    digitalUse: '"En el fondo estás diciendo lo mismo que yo."',
    triggerHints: ["en el fondo", "lo que quieres decir", "traducido"],
  },
  {
    id: 24,
    name: "Crítica indirecta de fuentes",
    digitalName: "Desacreditar Fuentes",
    group: "Interrupción y descalificación",
    summary: "Atacar fuentes, consecuencias o carácter del respaldo.",
    digitalUse: '"Ese medio miente", "financiado por...", "agenda".',
    triggerHints: ["fuente", "estudio", "medio", "artículo", "link"],
  },
  {
    id: 25,
    name: "Demanda repetida de prueba",
    digitalName: "Nunca Suficiente",
    group: "Interrupción y descalificación",
    summary: "Elevar el estándar de evidencia sin intención de convencerse.",
    digitalUse: "La meta no es la verdad: es que el otro nunca gane.",
    triggerHints: ["más pruebas", "no convence", "insuficiente"],
  },
  {
    id: 26,
    name: "Ad hominem de último recurso",
    digitalName: "Insulto Directo Envuelto",
    group: "Desesperación",
    summary: "Ataque personal sin pretensión de sofisticación.",
    digitalUse: "En tono devastador: descalificación moral ante la audiencia.",
    triggerHints: ["idiota", "ignorante", "payaso", "tonto"],
  },
  {
    id: 27,
    name: "Contraargumento vacío",
    digitalName: "Ruido Argumental",
    group: "Desesperación",
    summary: "Cantidad de contraargumentos irrelevantes para forzar empate percibido.",
    digitalUse: "Wall of text sin coherencia; caos = empate en la mente del scroller.",
    triggerHints: ["blah", "ruido", "spam"],
  },
  {
    id: 28,
    name: "Inversión de prueba agresiva",
    digitalName: "Demuéstralo o Cállate",
    group: "Desesperación",
    summary: "Exigencia imperativa de prueba imposible + hostilidad.",
    digitalUse: "Tono de comentarios tóxicos de alta viralidad.",
    triggerHints: ["cállate", "demuéstralo", "pruébalo ya"],
  },
  {
    id: 29,
    name: "Crítica de fuentes extrema",
    digitalName: "Descarte Automático",
    group: "Desesperación",
    summary: "Descartar cualquier fuente que apoye al oponente.",
    digitalUse: "Toda evidencia contraria = propaganda del enemigo.",
    triggerHints: ["miente", "vendido", "agenda", "fake"],
  },
  {
    id: 30,
    name: "Bucle repetitivo",
    digitalName: "Bucle de Repetición",
    group: "Desesperación",
    summary: "Volver al mismo punto refutado como si nunca se hubiera respondido.",
    digitalUse: "La repetición hace 'verdad' lo falso ante el público distraído.",
    triggerHints: ["como dije", "repito", "otra vez lo mismo"],
  },
  {
    id: 31,
    name: "Colapso de coherencia",
    digitalName: "Caos Final",
    group: "Arsenal final",
    summary: "Reacciones sin estructura: reflejos del ego, no argumentos.",
    digitalUse: "Cuando el hilo ya es guerra: supervivencia de imagen.",
    triggerHints: ["da igual", "como sea", "no me importa"],
  },
  {
    id: 32,
    name: "Desgaste deliberado",
    digitalName: "Guerra de Desgaste",
    group: "Arsenal final",
    summary: "Cansar a todos hasta que el debate se disuelva.",
    digitalUse: "Comentarios largos, off-topic, pings constantes.",
    triggerHints: ["cansado", "aburrido", "siguiente"],
  },
  {
    id: 33,
    name: "Aislamiento y defensa",
    digitalName: "Atrincheramiento",
    group: "Arsenal final",
    summary: "Posiciones cada vez más irracionales detrás de un muro de negación.",
    digitalUse: "Bloqueo mental público disfrazado de 'principios'.",
    triggerHints: ["no voy a", "punto final", "cierro el tema"],
  },
  {
    id: 34,
    name: "Guerra de confusión",
    digitalName: "Confusión Total",
    group: "Arsenal final",
    summary: "Disolver señal en ruido argumentativo puro.",
    digitalUse: "Mezclar temas, acusaciones y memes sin hilo lógico.",
    triggerHints: ["confuso", "no se entiende", "mezcla"],
  },
  {
    id: 35,
    name: "Escalada sin retorno",
    digitalName: "Escalada Sin Retorno",
    group: "Arsenal final",
    summary: "Una vez en ad hominem agresivo, no se vuelve a la razón.",
    digitalUse: "Diseñar el comentario para que el oponente solo pueda insultar o callar.",
    triggerHints: ["ya no", "basta", "fuera"],
  },
  {
    id: 36,
    name: "Rendición encubierta",
    digitalName: "Rendición Encubierta (ajena)",
    group: "Arsenal final",
    summary: "El oponente sigue 'argumentando' sin contenido real.",
    digitalUse: "Forzar ese estado: que se quede en repetición vacía.",
    triggerHints: ["ya dije", "es lo que hay"],
  },
  {
    id: 37,
    name: "Contraargumento repetido terminal",
    digitalName: "Eco Terminal",
    group: "Arsenal final",
    summary: "Repetir el mismo golpe retórico hasta agotar el hilo.",
    digitalUse: "Una línea memorable, copy-paste emocional, likes.",
    triggerHints: ["igual", "mismo"],
  },
  {
    id: 38,
    name: "Inversión de prueba final",
    digitalName: "Cierre Imposible",
    group: "Arsenal final",
    summary: "Última exigencia de prueba irrazonable como mic drop falso.",
    digitalUse: "Cerrar con un reto que no se puede cumplir en un comentario.",
    triggerHints: ["cuando demuestres", "hasta que"],
  },
];

export const PRIMARY_ARSENAL = [1, 4, 5, 6, 9, 12, 15, 16] as const;

export function getStratagem(id: number): Stratagem {
  return STRATAGEMS.find((s) => s.id === id) ?? STRATAGEMS[0];
}

export function pickStratagemsForText(text: string, count = 3): Stratagem[] {
  const lower = text.toLowerCase();
  const scored = STRATAGEMS.map((s) => {
    const hits = s.triggerHints.filter((h) => lower.includes(h.toLowerCase())).length;
    const primaryBoost = (PRIMARY_ARSENAL as readonly number[]).includes(s.id) ? 0.5 : 0;
    return { s, score: hits + primaryBoost + Math.random() * 0.3 };
  }).sort((a, b) => b.score - a.score);

  const picked: Stratagem[] = [];
  const usedGroups = new Set<string>();
  for (const { s } of scored) {
    if (picked.length >= count) break;
    if (usedGroups.has(s.digitalName) && picked.length < count - 1) continue;
    picked.push(s);
    usedGroups.add(s.digitalName);
  }
  // Garantizar core digital del system prompt
  const coreIds = [1, 6, 9, 12, 15, 4, 16, 5];
  for (const id of coreIds) {
    if (picked.length >= count) break;
    if (!picked.some((p) => p.id === id)) picked.push(getStratagem(id));
  }
  return picked.slice(0, count);
}
