# Lumina OS

Lumina is a local-first command center for working with multiple AI providers
and turning conversations into durable Obsidian notes.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Next.js, normally `http://localhost:3000`. If port
3000 is already in use, Next.js will use the next available port, such as
`http://localhost:3001`.

Any local AI with terminal access can start the app with:

```bash
cd /Users/zachowens/.copilot/chats/2026-10-06/special-potato-6827c565
npm run dev
```

The AI should leave that command running and tell you the URL from its output.
If another process already owns the port, use the alternate URL reported by
Next.js instead of starting a second server.

The dashboard has a provider-neutral conversation model and a status endpoint
at `/api/status`. Provider credentials are intentionally read only from local
environment variables (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, and
`GITHUB_TOKEN`); the UI never bundles or transmits credentials. The SQLite
schema contract lives in `lib/schema.sql`, ready for the local persistence
adapter, and `OBSIDIAN_VAULT_PATH` is reserved for vault configuration.

## Connect the first working slice

1. Copy `.env.example` to `.env.local`.
2. Add one or more provider keys and set `OBSIDIAN_VAULT_PATH` to the absolute
   path of an existing vault.
3. Restart `npm run dev`.
4. Choose a provider in the right rail and send a command. The server calls the
   selected provider and writes the prompt/response to
   `Lumina/Conversations/*.md`.

The file is located at the project root, alongside `package.json`:

```dotenv
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
GITHUB_TOKEN=your-github-token
OBSIDIAN_VAULT_PATH=/absolute/path/to/your/vault
```

Restart `npm run dev` after changing `.env.local`. Keys are read only by the
local server and `.env.local` is gitignored.

The center orb polls `/api/vault` every 2.5 seconds. It scans Markdown files
and Obsidian `[[wikilinks]]`, then uses the current note/link counts and graph
nodes to update the 3D network field. The configured vault currently resolves
to `/Users/zachowens/Desktop/Obsidian Vault/Main` in this workspace.

Vault discovery is resilient when running from Terminal. `OBSIDIAN_VAULT_PATH`
is used first, and the app automatically falls back to these local locations
if that setting is missing or stale:

```text
~/Desktop/Obsidian Vault/Main
~/Documents/Obsidian Vault/Main
~/Obsidian Vault/Main
```

The app re-scans the vault continuously while it is running, so new notes and
wikilinks appear in the network without restarting the server. `/api/status`
reports the resolved vault path and whether it was configured or
auto-discovered.

Claude and ChatGPT use their official API endpoints. The Copilot button uses
GitHub Models with `GITHUB_TOKEN`; a GitHub Copilot consumer subscription does
not expose a general-purpose chat API, so desktop/browser session automation
is a separate adapter that still needs to be added. Keys remain server-side
and are never placed in browser code.

The Inbox tab is Gmail-ready but intentionally does not claim a connection
until Gmail OAuth is configured. It currently exposes local connection status
at `/api/inbox`; Gmail client credentials and token storage will be added when
you are ready to connect the account.
