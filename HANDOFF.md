# Lumina OS Handoff

This file gives the next AI enough context to continue work on Lumina OS without
repeating setup or guessing at the current state.

## Product

Lumina OS is a local-first Next.js dashboard for:

- Obsidian vault knowledge/network visualization
- Projects stored as Markdown in Obsidian
- Content planning stored as Markdown in Obsidian
- Vault-backed asset indexing
- Media analytics setup for YouTube, Instagram, and TikTok
- Gmail-ready inbox workspace
- Optional server-side AI provider routes

The intended visual direction is a dark, futuristic command console with a
purple 3D-style Obsidian network orb.

## Run the app

From the project root:

```bash
cd /Users/zachowens/.copilot/chats/2026-10-06/special-potato-6827c565
npm run dev
```

Open the URL printed by Next.js. Port `3000` may already be occupied; in the
current environment the app is running at:

```text
http://localhost:3001
```

Do not start a second dev server if one is already running. Check the terminal
output or test the likely URL with `curl`.

## Obsidian connection

The configured vault is:

```text
/Users/zachowens/Desktop/Obsidian Vault/Main
```

The project `.env.local` contains:

```dotenv
OBSIDIAN_VAULT_PATH="/Users/zachowens/Desktop/Obsidian Vault/Main"
```

Never expose or print API key values. `.env.local` is gitignored.

Vault discovery is centralized in `lib/vault.ts`. It uses
`OBSIDIAN_VAULT_PATH` first and falls back to:

```text
~/Desktop/Obsidian Vault/Main
~/Documents/Obsidian Vault/Main
~/Obsidian Vault/Main
```

The UI polls `/api/vault` every 2.5 seconds. `/api/status` reports the resolved
vault path, connection state, and whether the path was configured or
auto-discovered.

Useful checks:

```bash
curl http://localhost:3001/api/status
curl http://localhost:3001/api/vault
```

## Current implementation

### Dashboard tabs

- Overview: live Obsidian network orb and vault telemetry
- Vault Network: compact network explorer
- Media Analytics: setup-ready cards for YouTube, Instagram, and TikTok
- Planning: create dated plans, save them to `Lumina/Planning`, and request
  browser notifications
- Projects: create projects and import project-marked Obsidian notes
- Asset Library: index files from `Lumina/Assets`
- Inbox: Gmail-ready connection/status surface

### API routes

```text
/api/status
/api/vault
/api/projects
/api/planning
/api/assets
/api/inbox
/api/chat
```

### Obsidian folders used by Lumina

```text
Lumina/Conversations
Lumina/Projects
Lumina/Planning
Lumina/Assets
```

Projects and plans are written as Markdown. Assets are currently read-only and
are indexed in place; Lumina does not copy the files.

## Gmail status

The Inbox tab is intentionally Gmail-ready but not falsely marked connected.
`/api/inbox` currently returns an empty message list and checks
`GMAIL_ACCESS_TOKEN`. Full Gmail OAuth is not implemented yet.

When implementing Gmail, keep OAuth/token handling server-side. Do not put
client secrets or access tokens in React code. The likely next pieces are:

1. Google OAuth start/callback routes.
2. Encrypted or local token persistence.
3. Gmail message-list endpoint with pagination.
4. Inbox UI for unread/focused messages.
5. Actions to save an email as an Obsidian note or create a plan/project.

## AI providers

The dashboard AI chat UI was removed intentionally, but server-side support
remains in `lib/ai.ts` and `/api/chat`.

Supported environment variables:

```dotenv
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
GITHUB_TOKEN=...
```

The GitHub Copilot consumer subscription does not provide a general-purpose
chat API; the existing Copilot adapter uses GitHub Models through
`GITHUB_TOKEN`.

## Validation

The latest validation completed successfully:

```bash
rm -rf .next
npm run build
```

The vault status and graph endpoints were also verified against the connected
vault. If a build reports a missing generated `.next` chunk such as
`Cannot find module './586.js'`, stop the dev server, remove `.next`, rebuild,
and restart `npm run dev`.

## Important files

```text
app/page.tsx              Main dashboard and tab UI
app/globals.css           Dashboard styling and responsive layout
lib/vault.ts              Vault discovery, scanning, and Markdown persistence
app/api/vault/route.ts    Live graph endpoint
app/api/status/route.ts   Local/provider/vault status
app/api/inbox/route.ts    Gmail-ready inbox status endpoint
README.md                 Setup and integration documentation
.env.example              Environment variable template
.env.local                Local vault configuration; keep private
```

## Recommended next task

Implement real Gmail OAuth and message sync for the Inbox tab. Preserve the
local-first architecture, keep credentials server-side, and save selected
messages as Markdown under an Obsidian folder such as
`Lumina/Inbox`.
