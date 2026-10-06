import type { ChatTurn, ProviderId } from "./types";

type ChatConfig = { providerId: ProviderId; model: string; messages: ChatTurn[] };

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured. Add it to .env.local and restart the app.`);
  return value;
}

function openAiMessages(messages: ChatTurn[]) {
  return messages.map(({ role, content }) => ({ role, content }));
}

export async function completeChat({ providerId, model, messages }: ChatConfig) {
  if (!messages.some((message) => message.role === "user" && message.content.trim())) {
    throw new Error("A non-empty user message is required.");
  }

  if (providerId === "claude") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": required("ANTHROPIC_API_KEY"),
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: providerId === "claude" && model.toLowerCase().includes("sonnet 4") ? "claude-sonnet-4-20250514" : model || "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: messages.filter((message) => message.role !== "system").map((message) => ({
          role: message.role === "assistant" ? "assistant" : "user",
          content: message.content,
        })),
        system: messages.find((message) => message.role === "system")?.content,
      }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message ?? "Claude request failed.");
    return body.content?.map((part: { type: string; text?: string }) => part.type === "text" ? part.text : "").join("") ?? "";
  }

  const tokenName = providerId === "chatgpt" ? "OPENAI_API_KEY" : "GITHUB_TOKEN";
  const endpoint = providerId === "chatgpt"
    ? "https://api.openai.com/v1/chat/completions"
    : "https://models.inference.ai.azure.com/chat/completions";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${required(tokenName)}` },
    body: JSON.stringify({
      model: model === "GPT-5" || model === "Claude Sonnet" ? "gpt-4o" : model || "gpt-4o-mini",
      messages: openAiMessages(messages),
      max_tokens: 2048,
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message ?? "Provider request failed.");
  return body.choices?.[0]?.message?.content ?? "";
}
