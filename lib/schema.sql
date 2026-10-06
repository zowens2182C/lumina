CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  vault_path TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vault_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  root_path TEXT NOT NULL,
  conversations_folder TEXT NOT NULL DEFAULT 'Lumina/Conversations',
  notes_folder TEXT NOT NULL DEFAULT 'Lumina/Notes',
  last_sync_at TEXT
);
