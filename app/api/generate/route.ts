import { NextResponse } from "next/server";
import {
  anyLlmConfigured,
  getProviderApiKey,
  llmChat,
  providerLabel,
  providersStatus,
  resolveProvider,
  type LlmProviderId,
} from "../../../lib/llm/providers";
import {
  buildSystemPrompt,
  buildUserPrompt,
  lengthBudget,
  parseGrokJson,
  type GenerateRequestBody,
} from "../../../lib/xai/prompts";
import { generateEristic } from "../../../lib/eristico-engine";
import { generatePro } from "../../../lib/pro-engine";
import type { ResearchPack } from "../../../lib/research/person-research";

export const runtime = "nodejs";
export const maxDuration = 120;

type BodyWithProvider = GenerateRequestBody & {
  provider?: LlmProviderId | string;
};

export async function GET() {
  const active = resolveProvider();
  const configured = anyLlmConfigured();
  return NextResponse.json({
    ok: true,
    activeProvider: configured ? active : null,
    activeLabel: configured && active ? providerLabel(active) : null,
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

  const forced =
    body.provider && body.provider !== "auto" && body.provider in { xai: 1, gemini: 1, nvidia: 1 }
      ? (body.provider as LlmProviderId)
      : undefined;

  // Usuario eligió un motor sin key → error claro, NO local silencioso
  if (forced && !getProviderApiKey(forced)) {
    return NextResponse.json(
      {
        ok: false,
        error: `${providerLabel(forced)} no tiene API key en el servidor. Configura la variable en Railway o elige Auto/otro motor.`,
        provider: forced,
        providers: providersStatus(),
      },
      { status: 400 },
    );
  }

  const provider = resolveProvider(forced);
  const hasLlm = Boolean(provider && getProviderApiKey(provider));
  const budget = lengthBudget(body.length || "media");

  if (hasLlm && provider) {
    try {
      const result = await llmChat({
        provider,
        jsonMode: true,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: buildUserPrompt(body) },
        ],
        temperature:
          body.intensity === "cirujano" ? 0.45 : body.intensity === "devastador" ? 0.8 : 0.65,
        maxTokens: budget.maxTokens,
      });

      let parsed = parseGrokJson(result.content);

      // Si es "larga" y salió corto, un refuerzo pidiendo ampliar (1 sola vez)
      if (
        parsed &&
        body.length === "larga" &&
        parsed.variants.some((v) => v.text.length < budget.minChars)
      ) {
        const shortOnes = parsed.variants
          .map((v, i) => `${i + 1}: ${v.text.length} chars`)
          .join(", ");
        const expand = await llmChat({
          provider,
          jsonMode: true,
          messages: [
            {
              role: "system",
              content:
                "Amplía cada variants[].text al mínimo pedido. Cumple las ÓRDENES DEL USUARIO. Solo JSON.",
            },
            {
              role: "user",
              content: `Las variantes salieron cortas (${shortOnes}). Mínimo ${budget.minChars} caracteres y ${budget.minSentences} oraciones CADA una.
Órdenes del usuario (obligatorias): ${(body.stanceText || "").trim() || "n/a"}
JSON previo a ampliar:\n${JSON.stringify(parsed).slice(0, 12000)}`,
            },
          ],
          temperature: 0.5,
          maxTokens: budget.maxTokens,
        });
        const expanded = parseGrokJson(expand.content);
        if (expanded) parsed = expanded;
      }

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

      const retry = await llmChat({
        provider,
        jsonMode: true,
        messages: [
          {
            role: "system",
            content:
              "Devuelve ÚNICAMENTE JSON válido (analysis, variants con 3 text largos, etc.). Sin markdown.",
          },
          {
            role: "user",
            content: `Convierte a JSON del esquema. Cumple órdenes: ${(body.stanceText || "").slice(0, 400)}
Largo: ${body.length}. Contenido previo:\n${result.content.slice(0, 8000)}`,
          },
        ],
        temperature: 0.15,
        maxTokens: budget.retryMaxTokens,
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
          error: `${providerLabel(provider)} respondió pero no en JSON usable. Reintenta o cambia de motor.`,
          provider,
          rawPreview: result.content.slice(0, 500),
        },
        { status: 502 },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "error_llm";
      // Si el usuario forzó un proveedor, NO enmascarar con local
      if (forced) {
        return NextResponse.json(
          {
            ok: false,
            error: message,
            provider: forced,
            providers: providersStatus(),
          },
          { status: 502 },
        );
      }
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

  const fallback = localFallback(body);
  return NextResponse.json({
    ok: true,
    source: "local" as const,
    provider: "local",
    warning:
      "Sin API keys. Configura XAI_API_KEY y/o GEMINI_API_KEY y/o NVIDIA_API_KEY en Railway.",
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
      writeStyleCustom: body.writeStyleCustom,
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
