/**
 * Multi-proveedor LLM: Grok (xAI) · Gemini (Google) · NVIDIA NIM
 * Claves solo en servidor. OpenAI-compatible donde aplica.
 */

export type LlmProviderId = "xai" | "gemini" | "nvidia";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmChatResult = {
  content: string;
  model: string;
  provider: LlmProviderId;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

export type LlmChatOpts = {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Fuerza un proveedor; si no, usa LLM_PROVIDER o el primero con clave */
  provider?: LlmProviderId;
};

const PROVIDER_META: Record<
  LlmProviderId,
  {
    label: string;
    envKey: string;
    envModel: string;
    defaultModel: string;
    /** Base OpenAI-compatible; vacío = API nativa Gemini */
    baseUrl: string;
  }
> = {
  xai: {
    label: "Grok (xAI)",
    envKey: "XAI_API_KEY",
    envModel: "XAI_MODEL",
    defaultModel: "grok-4.5",
    baseUrl: "https://api.x.ai/v1",
  },
  gemini: {
    label: "Gemini (Google)",
    envKey: "GEMINI_API_KEY",
    envModel: "GEMINI_MODEL",
    // OpenAI-compatible endpoint de Google AI
    defaultModel: "gemini-2.5-flash",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
  },
  nvidia: {
    label: "NVIDIA NIM",
    envKey: "NVIDIA_API_KEY",
    envModel: "NVIDIA_MODEL",
    defaultModel: "meta/llama-3.1-70b-instruct",
    baseUrl: "https://integrate.api.nvidia.com/v1",
  },
};

function env(name: string): string | null {
  const v = process.env[name]?.trim();
  return v || null;
}

export function getProviderApiKey(id: LlmProviderId): string | null {
  return env(PROVIDER_META[id].envKey);
}

export function listConfiguredProviders(): LlmProviderId[] {
  return (Object.keys(PROVIDER_META) as LlmProviderId[]).filter((id) =>
    Boolean(getProviderApiKey(id)),
  );
}

/** Orden de preferencia si no hay LLM_PROVIDER */
const FALLBACK_ORDER: LlmProviderId[] = ["xai", "gemini", "nvidia"];

export function resolveProvider(forced?: LlmProviderId | string | null): LlmProviderId | null {
  if (forced && forced in PROVIDER_META) {
    const id = forced as LlmProviderId;
    if (getProviderApiKey(id)) return id;
  }
  const preferred = (process.env.LLM_PROVIDER || "").trim().toLowerCase() as LlmProviderId;
  if (preferred && preferred in PROVIDER_META && getProviderApiKey(preferred)) {
    return preferred;
  }
  for (const id of FALLBACK_ORDER) {
    if (getProviderApiKey(id)) return id;
  }
  return null;
}

export function providerLabel(id: LlmProviderId): string {
  return PROVIDER_META[id].label;
}

function defaultModel(id: LlmProviderId): string {
  return env(PROVIDER_META[id].envModel) || PROVIDER_META[id].defaultModel;
}

async function openAiCompatibleChat(
  id: LlmProviderId,
  opts: LlmChatOpts,
): Promise<LlmChatResult> {
  const meta = PROVIDER_META[id];
  const apiKey = getProviderApiKey(id);
  if (!apiKey) {
    throw new Error(`${meta.envKey} no configurada. Añádela en .env.local o Railway Variables.`);
  }

  const model = opts.model || defaultModel(id);
  const url = `${meta.baseUrl}/chat/completions`;

  const body: Record<string, unknown> = {
    model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.75,
    max_tokens: opts.maxTokens ?? 2048,
  };

  // NVIDIA a veces prefiere stream:false explícito
  if (id === "nvidia") {
    body.stream = false;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  if (!res.ok) {
    let detail = raw.slice(0, 500);
    try {
      const j = JSON.parse(raw) as {
        error?: { message?: string } | string;
        message?: string;
      };
      if (typeof j.error === "string") detail = j.error;
      else if (j.error && typeof j.error === "object" && j.error.message) detail = j.error.message;
      else if (j.message) detail = j.message;
    } catch {
      /* keep */
    }
    throw new Error(`${meta.label} ${res.status}: ${detail}`);
  }

  const data = JSON.parse(raw) as {
    model?: string;
    choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>;
    usage?: LlmChatResult["usage"];
  };

  const rawContent = data.choices?.[0]?.message?.content;
  let content = "";
  if (typeof rawContent === "string") content = rawContent.trim();
  else if (Array.isArray(rawContent)) {
    content = rawContent
      .map((p) => (typeof p === "object" && p && "text" in p ? String(p.text || "") : ""))
      .join("")
      .trim();
  }

  if (!content) throw new Error(`${meta.label} devolvió respuesta vacía`);

  return {
    content,
    model: data.model || model,
    provider: id,
    usage: data.usage,
  };
}

/**
 * Gemini nativo (fallback si el endpoint OpenAI-compatible falla).
 * https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 */
async function geminiNativeChat(opts: LlmChatOpts): Promise<LlmChatResult> {
  const apiKey = getProviderApiKey("gemini");
  if (!apiKey) throw new Error("GEMINI_API_KEY no configurada.");

  const model = opts.model || defaultModel("gemini");
  const systemParts = opts.messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const contents = opts.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: systemParts
        ? { parts: [{ text: systemParts }] }
        : undefined,
      contents,
      generationConfig: {
        temperature: opts.temperature ?? 0.75,
        maxOutputTokens: opts.maxTokens ?? 2048,
        responseMimeType: "application/json",
      },
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    let detail = raw.slice(0, 500);
    try {
      const j = JSON.parse(raw) as { error?: { message?: string } };
      detail = j.error?.message || detail;
    } catch {
      /* keep */
    }
    throw new Error(`Gemini native ${res.status}: ${detail}`);
  }

  const data = JSON.parse(raw) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    usageMetadata?: {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
    };
  };

  const content =
    data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim() || "";

  if (!content) throw new Error("Gemini nativo devolvió respuesta vacía");

  return {
    content,
    model,
    provider: "gemini",
    usage: {
      prompt_tokens: data.usageMetadata?.promptTokenCount,
      completion_tokens: data.usageMetadata?.candidatesTokenCount,
      total_tokens: data.usageMetadata?.totalTokenCount,
    },
  };
}

/** Chat unificado: resuelve proveedor y llama */
export async function llmChat(opts: LlmChatOpts): Promise<LlmChatResult> {
  const provider = resolveProvider(opts.provider);
  if (!provider) {
    throw new Error(
      "Ninguna API key configurada. Define al menos una: XAI_API_KEY, GEMINI_API_KEY o NVIDIA_API_KEY.",
    );
  }

  if (provider === "gemini") {
    try {
      return await openAiCompatibleChat("gemini", opts);
    } catch (err) {
      // Fallback a API nativa de Gemini
      const msg = err instanceof Error ? err.message : String(err);
      if (/404|401|403|not found|unsupported/i.test(msg)) {
        return geminiNativeChat(opts);
      }
      // Si el OpenAI-compat falla por otra razón, aún intentamos nativo
      try {
        return await geminiNativeChat(opts);
      } catch {
        throw err;
      }
    }
  }

  return openAiCompatibleChat(provider, opts);
}

/** Compat: alias histórico */
export async function xaiChatCompletions(opts: {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<LlmChatResult> {
  return llmChat({ ...opts, provider: "xai" });
}

export function getXaiApiKey(): string | null {
  return getProviderApiKey("xai");
}

export function anyLlmConfigured(): boolean {
  return resolveProvider() !== null;
}

export function providersStatus(): Array<{
  id: LlmProviderId;
  label: string;
  configured: boolean;
  model: string;
}> {
  return (Object.keys(PROVIDER_META) as LlmProviderId[]).map((id) => ({
    id,
    label: PROVIDER_META[id].label,
    configured: Boolean(getProviderApiKey(id)),
    model: defaultModel(id),
  }));
}
