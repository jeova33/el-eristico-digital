import { NextResponse } from "next/server";
import {
  anyLlmConfigured,
  llmChat,
  providerLabel,
  providersStatus,
  resolveProvider,
  type LlmProviderId,
} from "../../../lib/llm/providers";
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
export const maxDuration = 90;

type BodyWithProvider = GenerateRequestBody & {
  /** xai | gemini | nvidia — opcional; si no, LLM_PROVIDER o primer key disponible */
  provider?: LlmProviderId | string;
};

export async function GET() {
  const active = resolveProvider();
  return NextResponse.json({
    ok: true,
    activeProvider: active,
    activeLabel: active ? providerLabel(active) : null,
    providers: providersStatus(),
  });
}

export async function POST(req: Request) {
  let body: BodyWithProvider;
  try {
    body = (await req.json()) as BodyWithProvider;
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

  const provider = resolveProvider(body.provider);
  const hasLlm = anyLlmConfigured() && Boolean(provider);

  // —— LLM (Grok / Gemini / NVIDIA) ——
  if (hasLlm && provider) {
    try {
      const result = await llmChat({
        provider,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(body) },
        ],
        temperature:
          body.intensity === "cirujano" ? 0.5 : body.intensity === "devastador" ? 0.85 : 0.7,
        maxTokens: body.length === "larga" ? 2800 : body.length === "corta" ? 1200 : 2000,
      });

      const parsed = parseGrokJson(result.content);
      if (parsed) {
        parsed.model = result.model;
        return NextResponse.json({
          ok: true,
          source: provider,
          provider,
          providerLabel: providerLabel(provider),
          model: result.model,
          usage: result.usage,
          data: parsed,
        });
      }

      // Reintento barato: solo JSON
      const retry = await llmChat({
        provider,
        messages: [
          {
            role: "system",
            content:
              "Devuelve ÚNICAMENTE JSON válido del esquema (analysis, variants[3], etc.). Sin markdown. Sin explicación.",
          },
          {
            role: "user",
            content: `Convierte a JSON del esquema de variantes. Contenido previo:\n${result.content.slice(0, 4000)}`,
          },
        ],
        temperature: 0.15,
        maxTokens: 1800,
      });
      const parsed2 = parseGrokJson(retry.content);
      if (parsed2) {
        parsed2.model = retry.model;
        return NextResponse.json({
          ok: true,
          source: provider,
          provider,
          providerLabel: providerLabel(provider),
          model: retry.model,
          usage: retry.usage,
          data: parsed2,
        });
      }

      return NextResponse.json(
        {
          ok: false,
          error: `${providerLabel(provider)} respondió pero no en JSON usable. Reintenta o cambia de proveedor.`,
          provider,
          rawPreview: result.content.slice(0, 400),
        },
        { status: 502 },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "error_llm";
      const fallback = localFallback(body);
      return NextResponse.json({
        ok: true,
        source: "local_fallback" as const,
        provider: "local",
        warning: message,
        data: fallback,
      });
    }
  }

  // —— Sin ninguna API key ——
  const fallback = localFallback(body);
  return NextResponse.json({
    ok: true,
    source: "local" as const,
    provider: "local",
    warning:
      "Sin API keys. Configura XAI_API_KEY y/o GEMINI_API_KEY y/o NVIDIA_API_KEY (y opcional LLM_PROVIDER=xai|gemini|nvidia).",
    providers: providersStatus(),
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
      attackProfile: "Modo local (sin LLM cloud)",
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

  const localMode =
    body.mode === "desmontar" || body.mode === "arsenal"
      ? body.mode
      : "contraataque";

  const out = generateEristic({
    mode: localMode,
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
