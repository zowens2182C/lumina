export type ProviderId = "claude" | "chatgpt" | "copilot";

export type ProviderStatus = "connected" | "needs_credentials" | "local_session";

export interface ProviderConnection {
  id: ProviderId;
  label: string;
  model: string;
  status: ProviderStatus;
  lastCheckedAt?: string;
}

export interface Conversation {
  id: string;
  title: string;
  providerId: ProviderId;
  createdAt: string;
  updatedAt: string;
  vaultPath?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface VaultSettings {
  rootPath: string;
  conversationsFolder: string;
  notesFolder: string;
  lastSyncAt?: string;
}

export interface ChatTurn {
  role: "user" | "assistant" | "system";
  content: string;
}
