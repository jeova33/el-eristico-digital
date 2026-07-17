/**
 * Estilos de escritura (skills: anti-slop, narrativa, erística, calle, filosófía cruda).
 * Regla dura: frases COMPLETAS. Nunca cortar con "…" a mitad de idea.
 */

export type WriteStyle = {
  id: string;
  label: string;
  hint: string;
  /** Instrucciones internas del motor */
  rules: string[];
};

export const WRITE_STYLES: WriteStyle[] = [
  {
    id: "calle",
    label: "Calle",
    hint: "Directo, seco, sin permiso",
    rules: [
      "Habla como en un hilo de verdad, no como un manual.",
      "Puedes ser duro, irónico o cruel con el argumento y la pose del rival.",
      "Sin eufemismos blandos. Di lo que hay que decir.",
      "Frases completas. Nada de cortar a mitad.",
    ],
  },
  {
    id: "anti-slop",
    label: "Humano",
    hint: "Anti plantilla IA",
    rules: [
      "Mezcla frases cortas y largas. Nada de tres oraciones gemelas seguidas.",
      "Sin 'en un mundo', 'es importante destacar', 'en conclusión'.",
      "Concreto. Un ejemplo de la vida real vale más que un abstracto.",
      "Máximo un guion largo por respuesta. Contracciones naturales.",
    ],
  },
  {
    id: "narrativo",
    label: "Narrativo",
    hint: "Escena + gancho",
    rules: [
      "Primera línea = gancho que detiene el scroll.",
      "Hay un 'nosotros' y un 'ellos' claros.",
      "El núcleo humano: orgullo, miedo, hipocresía o poder.",
      "Cierra con imagen o veredicto, no con resumen de brochure.",
    ],
  },
  {
    id: "eristico",
    label: "Erístico",
    hint: "Schopenhauer puro",
    rules: [
      "Objetivo: parecer tener razón, no buscar la verdad.",
      "Usa amplificación, carga de prueba, dicotomía, ad hominem si hace falta.",
      "Sin disculpas. Sin 'con todo respeto' vacío.",
      "Cada frase es un golpe o una trampa. Completa.",
    ],
  },
  {
    id: "filosofico-crudo",
    label: "Filosófico crudo",
    hint: "Profundo sin pedantería",
    rules: [
      "Preguntas que duelen. Cero latinajos de adorno.",
      "Habla de orgullo, voluntad, máscara y poder.",
      "Suena a sabio de bar, no a catedrático.",
      "Sin truncar ideas a mitad de camino.",
    ],
  },
  {
    id: "datos-duros",
    label: "Datos duros",
    hint: "Hechos, sin jerga",
    rules: [
      "Pide prueba concreta: número, fecha, caso, nombre.",
      "No inventes estudios falsos. Si no hay dato, exige el del rival.",
      "Lenguaje simple: bolsillo, tiempo, resultado.",
      "Frases enteras. Nunca 'c…' cortado.",
    ],
  },
];

export type WriteStyleId = (typeof WRITE_STYLES)[number]["id"];

/** Limpia salidas: sin ellipsis de truncado, sin cortes feos, sin censura blanda */
export function polishComplete(text: string): string {
  let t = text.replace(/\s+/g, " ").trim();
  // Quitar truncados tipo "inversión, c…" o "palabra…"
  t = t.replace(/,\s*[\p{L}\p{N}]{1,3}\u2026/gu, ".");
  t = t.replace(/[\p{L}\p{N}]{1,2}\u2026/gu, "");
  t = t.replace(/\u2026/g, ".");
  t = t.replace(/\.{2,}/g, ".");
  t = t.replace(/\s+([.,;:!?])/g, "$1");
  t = t.replace(/\s{2,}/g, " ").trim();
  // Asegurar cierre de frase
  if (t && !/[.!?…»"]$/.test(t)) t = `${t}.`;
  // Capitalizar inicio
  if (t.length > 1) t = t[0].toUpperCase() + t.slice(1);
  return t;
}

/** Nunca cortar a mitad de palabra: solo en límite de palabra y con frase completa preferida */
export function softClipComplete(text: string, maxChars: number): string {
  const clean = polishComplete(text);
  if (clean.length <= maxChars) return clean;
  const slice = clean.slice(0, maxChars);
  const lastStop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  if (lastStop > maxChars * 0.45) {
    return polishComplete(slice.slice(0, lastStop + 1));
  }
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > 40 ? slice.slice(0, lastSpace) : slice;
  return polishComplete(base);
}
