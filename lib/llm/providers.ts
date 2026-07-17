/**
 * Multi-proveedor LLM: Grok (xAI) · Gemini (Google) · NVIDIA NIM
 * Gemini usa API nativa por defecto (más estable que el bridge OpenAI).
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
  provider?: LlmProviderId;
  /** Pedir JSON (Gemini nativo lo soporta bien) */
  jsonMode?: boolean;
};

const PROVIDER_META: Record<
  LlmProviderId,
  {
    label: string;
    envKey: string;
    envModel: string;
    defaultModel: string;
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
    // Modelos estables en AI Studio / v1beta
    defaultModel: "gemini-2.0-flash",
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

/** Alternativas si el modelo default falla en Gemini */
const GEMINI_MODEL_FALLBACKS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro",
  "gemini-flash-latest",
];

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

const FALLBACK_ORDER: LlmProviderId[] = ["xai", "gemini", "nvidia"];

export function resolveProvider(forced?: LlmProviderId | string | null): LlmProviderId | null {
  if (forced && forced in PROVIDER_META) {
    const id = forced as LlmProviderId;
    // Si el usuario fuerza un proveedor sin key, devolvemos el id igual
    // (el caller debe chequear la key y dar error claro)
    return id;
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
    throw new Error(
      `${meta.envKey} no configurada. Añádela en Railway Variables o .env.local para usar ${meta.label}.`,
    );
  }

  const model = opts.model || defaultModel(id);
  const url = `${meta.baseUrl}/chat/completions`;

  const body: Record<string, unknown> = {
    model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.75,
    max_tokens: opts.maxTokens ?? 4096,
  };
  if (id === "nvidia") body.stream = false;

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
    let detail = raw.slice(0, 600);
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
    choices?: Array<{
      message?: { content?: string | Array<{ type?: string; text?: string }> };
    }>;
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

async function geminiNativeOnce(
  model: string,
  opts: LlmChatOpts,
  apiKey: string,
): Promise<LlmChatResult> {
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

  const maxOut = Math.min(Math.max(opts.maxTokens ?? 4096, 1024), 8192);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(systemParts
        ? { systemInstruction: { parts: [{ text: systemParts }] } }
        : {}),
      contents,
      generationConfig: {
        temperature: opts.temperature ?? 0.7,
        maxOutputTokens: maxOut,
        // JSON ayuda al parseo de variantes
        ...(opts.jsonMode !== false
          ? { responseMimeType: "application/json" }
          : {}),
      },
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    let detail = raw.slice(0, 600);
    try {
      const j = JSON.parse(raw) as { error?: { message?: string; status?: string } };
      detail = j.error?.message || detail;
    } catch {
      /* keep */
    }
    throw new Error(`Gemini ${res.status} (${model}): ${detail}`);
  }

  const data = JSON.parse(raw) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
    usageMetadata?: {
      promptTokenCount?: number;
      candidatesTokenCount?: number;
      totalTokenCount?: number;
    };
    error?: { message?: string };
  };

  if (data.error?.message) {
    throw new Error(`Gemini (${model}): ${data.error.message}`);
  }

  const content =
    data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim() || "";

  if (!content) {
    const reason = data.candidates?.[0]?.finishReason || "vacío";
    throw new Error(`Gemini (${model}) sin texto (finishReason=${reason})`);
  }

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

/** Gemini: nativo con fallback de modelos */
async function geminiChat(opts: LlmChatOpts): Promise<LlmChatResult> {
  const apiKey = getProviderApiKey("gemini");
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY no configurada. Crea una en https://aistudio.google.com/apikey y ponla en Railway.",
    );
  }

  const preferred = opts.model || defaultModel("gemini");
  const tryModels = [preferred, ...GEMINI_MODEL_FALLBACKS.filter((m) => m !== preferred)];

  let lastErr: Error | null = null;
  for (const model of tryModels) {
    try {
      return await geminiNativeOnce(model, opts, apiKey);
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      // Si es modelo no encontrado, prueba el siguiente; si es API key inválida, no sigas
      if (/API_KEY|PERMISSION|401|403|invalid/i.test(lastErr.message)) break;
    }
  }

  // Último intento: OpenAI-compat
  try {
    return await openAiCompatibleChat("gemini", opts);
  } catch (e) {
    const compat = e instanceof Error ? e.message : String(e);
    throw new Error(
      lastErr
        ? `${lastErr.message} | OpenAI-compat: ${compat}`
        : compat,
    );
  }
}

export async function llmChat(opts: LlmChatOpts): Promise<LlmChatResult> {
  const provider = resolveProvider(opts.provider);
  if (!provider) {
    throw new Error(
      "Ninguna API key. Define XAI_API_KEY y/o GEMINI_API_KEY y/o NVIDIA_API_KEY.",
    );
  }

  if (opts.provider && opts.provider in PROVIDER_META && !getProviderApiKey(opts.provider as LlmProviderId)) {
    const id = opts.provider as LlmProviderId;
    throw new Error(
      `${PROVIDER_META[id].envKey} no está en el servidor. Elige otro motor o configura la key en Railway.`,
    );
  }

  if (provider === "gemini") {
    return geminiChat(opts);
  }

  return openAiCompatibleChat(provider, opts);
}

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
  return listConfiguredProviders().length > 0;
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
