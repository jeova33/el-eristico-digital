/**
 * Investigación ligera de persona / tema (Wikipedia API + búsquedas sugeridas).
 * Se usa en modo Pro para armar contexto del atacante o del post.
 */

export type ResearchHit = {
  title: string;
  summary: string;
  url: string;
  source: "wikipedia" | "query";
};

export type ResearchPack = {
  query: string;
  hits: ResearchHit[];
  /** Texto compacto para el consejo de agentes */
  notes: string;
  searchLinks: { label: string; url: string }[];
  /** Señales tácticas derivadas del texto hallado */
  angles: string[];
};

function cleanQuery(parts: string[]): string {
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

/** Cliente: arma queries; el fetch real va por /api/research */
export function buildResearchQueries(input: {
  personName?: string;
  personRole?: string;
  personContext?: string;
  opponentText?: string;
  narrativeIntent?: string;
}): string[] {
  const name = input.personName?.trim();
  const role = input.personRole?.trim();
  const ctx = input.personContext?.trim();
  const topic = (input.opponentText || "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 8)
    .join(" ");

  const qs: string[] = [];
  if (name) {
    qs.push(cleanQuery([name, role || ""]));
    qs.push(cleanQuery([name, "controversia OR críticas OR polémica"]));
    qs.push(cleanQuery([name, topic]));
  }
  if (role && topic) qs.push(cleanQuery([role, topic]));
  if (ctx) qs.push(cleanQuery([name || "", ctx]).slice(0, 100));
  if (topic) qs.push(cleanQuery([topic, "argumentos en contra"]));
  if (input.narrativeIntent) qs.push(cleanQuery([input.narrativeIntent, "debate"]));
  return [...new Set(qs.filter((q) => q.length > 2))].slice(0, 6);
}

export function buildSearchLinks(queries: string[]): { label: string; url: string }[] {
  return queries.map((q) => ({
    label: q.length > 72 ? `${q.slice(0, 72)}…` : q,
    url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  }));
}

export function deriveAngles(notes: string, personName?: string): string[] {
  const t = notes.toLowerCase();
  const angles: string[] = [];
  if (!notes.trim()) {
    angles.push("Sin ficha pública clara: golpea el vacío de credenciales y la falta de prueba.");
    angles.push("Exige un solo hecho verificable ligado a su cargo o trayectoria.");
    return angles;
  }
  if (/polític|senador|diput|ministro|alcalde|partido/.test(t)) {
    angles.push("Es figura política: contrasta promesa vs resultado; pide métrica de gestión.");
  }
  if (/empres|ceo|fundador|negocio|inversión|comercio/.test(t)) {
    angles.push("Habla desde el dinero o el negocio: pregunta quién gana y quién paga el costo.");
  }
  if (/periodist|influencer|youtub|tiktok|comunicador/.test(t)) {
    angles.push("Es voz de media/redes: ataca el engagement disfrazado de verdad.");
  }
  if (/académ|profesor|doctor|investig/.test(t)) {
    angles.push("Se pinta de autoridad: pide paper, año y hallazgo exacto, no el título.");
  }
  if (personName) {
    angles.push(`Usa el nombre ${personName} para anclar hipocresía o historial, no para doxxing ilegal.`);
  }
  angles.push("Si el resumen es blando o de prensa amiga, dilo: 'biografía de brochure'.");
  return angles.slice(0, 5);
}

export async function fetchWikipediaSummary(query: string): Promise<ResearchHit | null> {
  const q = query.trim();
  if (!q) return null;
  try {
    const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.replace(/\s+/g, "_"))}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      // search API
      const searchUrl = `https://es.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=1&namespace=0&format=json&origin=*`;
      const sres = await fetch(searchUrl);
      if (!sres.ok) return null;
      const data = (await sres.json()) as [string, string[], string[], string[]];
      const title = data[1]?.[0];
      const link = data[3]?.[0];
      if (!title) return null;
      const sumUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/\s+/g, "_"))}`;
      const sumRes = await fetch(sumUrl);
      if (!sumRes.ok) {
        return {
          title,
          summary: data[2]?.[0] || title,
          url: link || `https://es.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          source: "wikipedia",
        };
      }
      const sum = (await sumRes.json()) as { extract?: string; content_urls?: { desktop?: { page?: string } } };
      return {
        title,
        summary: (sum.extract || data[2]?.[0] || title).slice(0, 600),
        url: sum.content_urls?.desktop?.page || link || "",
        source: "wikipedia",
      };
    }
    const json = (await res.json()) as {
      title?: string;
      extract?: string;
      content_urls?: { desktop?: { page?: string } };
      type?: string;
    };
    if (json.type === "disambiguation") return null;
    return {
      title: json.title || q,
      summary: (json.extract || "").slice(0, 600),
      url: json.content_urls?.desktop?.page || "",
      source: "wikipedia",
    };
  } catch {
    return null;
  }
}

export async function researchPerson(input: {
  personName?: string;
  personRole?: string;
  personContext?: string;
  opponentText?: string;
  narrativeIntent?: string;
}): Promise<ResearchPack> {
  const queries = buildResearchQueries(input);
  const primary = queries[0] || input.personName || "debate";
  const hits: ResearchHit[] = [];

  if (input.personName) {
    const hit = await fetchWikipediaSummary(input.personName);
    if (hit) hits.push(hit);
    if (input.personRole) {
      const hit2 = await fetchWikipediaSummary(`${input.personName} ${input.personRole}`);
      if (hit2 && hit2.title !== hit?.title) hits.push(hit2);
    }
  }

  const notes = hits
    .map((h) => `${h.title}: ${h.summary}`)
    .join(" | ")
    .slice(0, 900);

  return {
    query: primary,
    hits,
    notes:
      notes ||
      [
        input.personName ? `Sin ficha Wikipedia clara para ${input.personName}.` : "Sin nombre de persona.",
        input.personRole ? `Rol declarado: ${input.personRole}.` : "",
        input.personContext ? `Contexto del usuario: ${input.personContext}` : "",
      ]
        .filter(Boolean)
        .join(" "),
    searchLinks: buildSearchLinks(queries),
    angles: deriveAngles(notes, input.personName),
  };
}
