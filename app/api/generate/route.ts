import { NextResponse } from "next/server";
import { getXaiApiKey, xaiChatCompletions } from "../../../lib/xai/client";
import {
  buildSystemPrompt,
  buildUserPrompt,
  parseGrokJson,
  type GenerateRequestBody,
} from "../../../lib/xai/prompts";
import { generateEristic } from "../../../lib/eristico-engine";
import { generatePro } from "../../../lib/pro-engine";
import type { ResearchPack } from "../../../lib/research/person-research";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let body: GenerateRequestBody;
  try {
    body = (await req.json()) as GenerateRequestBody;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const opponent = (body.opponentText || body.postText || "").trim();
  if (!opponent) {
    return NextResponse.json(
      { ok: false, error: "Falta opponentText o postText" },
      { status: 400 },
    );
  }

  const hasKey = Boolean(getXaiApiKey());

  // —— Preferir Grok ——
  if (hasKey) {
    try {
      const result = await xaiChatCompletions({
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(body) },
        ],
        temperature: body.intensity === "cirujano" ? 0.55 : body.intensity === "devastador" ? 0.9 : 0.75,
        maxTokens: body.length === "larga" ? 5000 : 3500,
      });

      const parsed = parseGrokJson(result.content);
      if (parsed) {
        parsed.model = result.model;
        return NextResponse.json({
          ok: true,
          source: "grok" as const,
          model: result.model,
          usage: result.usage,
          data: parsed,
        });
      }

      // Si el JSON falla, un reintento corto pidiendo solo el JSON
      const retry = await xaiChatCompletions({
        messages: [
          {
            role: "system",
            content:
              "Devuelve ÚNICAMENTE JSON válido según el esquema pedido. Sin markdown. Sin explicación.",
          },
          {
            role: "user",
            content: `Reescribe esto como el JSON del esquema de variantes (analysis, variants[3], etc.). Contenido previo:\n${result.content.slice(0, 6000)}`,
          },
        ],
        temperature: 0.2,
        maxTokens: 4000,
      });
      const parsed2 = parseGrokJson(retry.content);
      if (parsed2) {
        parsed2.model = retry.model;
        return NextResponse.json({
          ok: true,
          source: "grok" as const,
          model: retry.model,
          data: parsed2,
        });
      }

      return NextResponse.json(
        {
          ok: false,
          error: "Grok respondió pero no en JSON usable. Revisa el modelo o reintenta.",
          rawPreview: result.content.slice(0, 500),
        },
        { status: 502 },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "error_xai";
      // Fallback local solo si Grok falla
      const fallback = localFallback(body);
      return NextResponse.json({
        ok: true,
        source: "local_fallback" as const,
        warning: message,
        data: fallback,
      });
    }
  }

  // —— Sin API key: local + aviso ——
  const fallback = localFallback(body);
  return NextResponse.json({
    ok: true,
    source: "local" as const,
    warning:
      "Sin XAI_API_KEY: motor local (plantillas). Configura .env.local con XAI_API_KEY para Grok.",
    data: fallback,
  });
}

function localFallback(body: GenerateRequestBody) {
  if (body.mode === "pro") {
    const research: ResearchPack | null = body.researchNotes
      ? {
          query: body.personName || "debate",
          hits: [],
          notes: body.researchNotes,
          searchLinks: [],
          angles: [],
        }
      : null;
    const out = generatePro({
      postText: body.postText || body.opponentText,
      opponentComment: body.opponentText,
      stanceText: body.stanceText || "",
      personName: body.personName,
      personRole: body.personRole,
      personContext: body.personContext,
      narrativeIntent: body.narrativeIntent || body.stanceText || "",
      intensity: body.intensity,
      focus: body.focus,
      length: body.length,
      writeStyle: body.writeStyle,
      research,
      seed: body.seed,
    });
    return {
      analysis: out.analysis,
      attackProfile: "Modo local (sin Grok)",
      plainSummary: body.opponentText.slice(0, 200),
      weakPoints: [],
      winLevers: [],
      avoid: [],
      researchLeads: [],
      searchQueries: [],
      variants: out.variants,
      council: out.council
        ? {
            synthesis: out.council.synthesis,
            turns: out.council.turns.map((t) => ({
              agentId: t.agentId,
              agentName: t.agentName,
              color: t.color,
              read: t.read,
              move: t.move,
            })),
          }
        : null,
      source: "local" as const,
      model: "local-engine",
    };
  }

  const out = generateEristic({
    mode: body.mode === "pro" ? "contraataque" : body.mode,
    intensity: body.intensity,
    opponentText: body.opponentText || body.postText || "",
    stanceText: body.stanceText || "",
    focus: body.focus,
    length: body.length,
    seed: body.seed,
  });

  return {
    analysis: out.analysis,
    attackProfile: out.browser.attackProfile,
    plainSummary: out.browser.plainSummary,
    weakPoints: out.browser.weakPoints,
    winLevers: out.browser.winLevers,
    avoid: out.browser.avoid,
    researchLeads: out.browser.researchLeads,
    searchQueries: out.browser.searchQueries,
    variants: out.variants,
    council: null,
    source: "local" as const,
    model: "local-engine",
  };
}
