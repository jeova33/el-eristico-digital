/**
 * Reexport del multi-proveedor (compat con imports antiguos).
 * Preferir: lib/llm/providers.ts
 */
export {
  xaiChatCompletions,
  getXaiApiKey,
  llmChat,
  type ChatMessage,
  type LlmChatResult as XaiChatResult,
} from "../llm/providers";

export const XAI_BASE_URL = "https://api.x.ai/v1";
export const XAI_DEFAULT_MODEL = process.env.XAI_MODEL || "grok-4.5";
