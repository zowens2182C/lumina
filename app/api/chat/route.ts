import { NextResponse } from "next/server";
import { completeChat } from "@/lib/ai";
import { saveConversation } from "@/lib/vault";
import type { ChatTurn, ProviderId } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { providerId: ProviderId; model?: string; messages: ChatTurn[]; title?: string; saveToVault?: boolean };
    if (!["claude", "chatgpt", "copilot"].includes(body.providerId)) {
      return NextResponse.json({ error: "Unsupported provider." }, { status: 400 });
    }
    const response = await completeChat({ providerId: body.providerId, model: body.model ?? "", messages: body.messages });
    const userPrompt = [...body.messages].reverse().find((message) => message.role === "user")?.content ?? "";
    let vaultPath: string | undefined;
    if (body.saveToVault !== false) {
      vaultPath = await saveConversation({
        title: body.title ?? "Lumina conversation",
        provider: body.providerId,
        prompt: userPrompt,
        response,
      });
    }
    return NextResponse.json({ response, vaultPath });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
