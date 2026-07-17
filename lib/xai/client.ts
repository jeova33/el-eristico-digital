/**
 * Cliente xAI / Grok (OpenAI-compatible).
 * Clave SOLO en servidor: process.env.XAI_API_KEY
 */

export const XAI_BASE_URL = "https://api.x.ai/v1";
export const XAI_DEFAULT_MODEL = process.env.XAI_MODEL || "grok-4.5";

export function getXaiApiKey(): string | null {
  const k = process.env.XAI_API_KEY?.trim();
  return k || null;
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type XaiChatResult = {
  content: string;
  model: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
};

export async function xaiChatCompletions(opts: {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<XaiChatResult> {
  const apiKey = getXaiApiKey();
  if (!apiKey) {
    throw new Error("XAI_API_KEY no configurada. Crea .env.local con XAI_API_KEY=...");
  }

  const model = opts.model || XAI_DEFAULT_MODEL;
  const res = await fetch(`${XAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.75,
      max_tokens: opts.maxTokens ?? 4096,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    let detail = raw.slice(0, 400);
    try {
      const j = JSON.parse(raw) as { error?: { message?: string } };
      detail = j.error?.message || detail;
    } catch {
      /* keep */
    }
    throw new Error(`xAI ${res.status}: ${detail}`);
  }

  const data = JSON.parse(raw) as {
    model?: string;
    choices?: Array<{ message?: { content?: string } }>;
    usage?: XaiChatResult["usage"];
  };

  const content = data.choices?.[0]?.message?.content?.trim() || "";
  if (!content) throw new Error("xAI devolvió respuesta vacía");

  return {
    content,
    model: data.model || model,
    usage: data.usage,
  };
}
