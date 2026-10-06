import type { ChatMessage, ProviderConnection, ProviderId } from "./types";

export interface ChatRequest {
  providerId: ProviderId;
  model: string;
  messages: Pick<ChatMessage, "role" | "content">[];
}

export interface ProviderAdapter {
  connection: ProviderConnection;
  send(request: ChatRequest): Promise<AsyncIterable<string>>;
}

/**
 * The UI talks to this contract, not directly to a vendor SDK. Real API
 * adapters can be registered here without changing the conversation surface.
 */
export function configuredConnections(): ProviderConnection[] {
  return [
    { id: "claude", label: "Claude", model: "Sonnet 4", status: process.env.ANTHROPIC_API_KEY ? "connected" : "needs_credentials" },
    { id: "chatgpt", label: "ChatGPT", model: "GPT-5", status: process.env.OPENAI_API_KEY ? "connected" : "needs_credentials" },
    { id: "copilot", label: "GitHub Copilot", model: "Claude Sonnet", status: process.env.GITHUB_TOKEN ? "connected" : "local_session" },
  ];
}
