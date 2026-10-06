import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const defaultVaultCandidates = [
  path.join(os.homedir(), "Desktop", "Obsidian Vault", "Main"),
  path.join(os.homedir(), "Documents", "Obsidian Vault", "Main"),
  path.join(os.homedir(), "Obsidian Vault", "Main"),
];

function vaultRoot() {
  const configured = process.env.OBSIDIAN_VAULT_PATH?.trim();
  const candidates = configured ? [configured, ...defaultVaultCandidates] : defaultVaultCandidates;
  const root = candidates.map((candidate) => path.resolve(candidate)).find((candidate) => existsSync(candidate));
  if (!root) {
    throw new Error(`Obsidian vault not found. Set OBSIDIAN_VAULT_PATH in .env.local or place the vault in ${defaultVaultCandidates[0]}.`);
  }
  return root;
}

export function vaultConnection() {
  try {
    const root = vaultRoot();
    return { connected: true, path: root, root: path.basename(root), source: process.env.OBSIDIAN_VAULT_PATH?.trim() ? "configured" : "auto-discovered" as const };
  } catch (error) {
    return { connected: false, path: null, root: null, source: "missing" as const, error: error instanceof Error ? error.message : "Obsidian vault could not be found." };
  }
}

export async function scanVault() {
  const root = vaultRoot();
  const files: string[] = [];
  async function walk(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile() && entry.name.endsWith(".md")) files.push(absolute);
    }
  }
  await walk(root);
  const nodes = files.map((file) => ({ id: path.relative(root, file), label: path.basename(file, ".md") }));
  const edges: { source: string; target: string }[] = [];
  for (const file of files) {
    const source = path.relative(root, file);
    const content = await readFile(file, "utf8");
    for (const link of content.matchAll(/\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g)) {
      const targetName = link[1].trim().replace(/\.md$/i, "");
      const target = nodes.find((node) => node.label.toLowerCase() === targetName.toLowerCase());
      if (target && target.id !== source) edges.push({ source, target: target.id });
    }
  }
  return { nodes, edges, scannedAt: new Date().toISOString(), root: path.basename(root) };
}

export async function saveConversation(input: { title: string; provider: string; prompt: string; response: string }) {
  const root = vaultRoot();
  const folder = path.join(root, "Lumina", "Conversations");
  await mkdir(folder, { recursive: true });
  const safeTitle = input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "conversation";
  const filename = `${new Date().toISOString().replace(/[:.]/g, "-")}-${safeTitle}.md`;
  const markdown = `---
created: ${new Date().toISOString()}
provider: ${input.provider}
source: lumina-os
---

# ${input.title}

## Prompt

${input.prompt}

## ${input.provider}

${input.response}
`;
  await writeFile(path.join(folder, filename), markdown, { encoding: "utf8", flag: "wx" });
  return path.relative(root, path.join(folder, filename));
}

export type ProjectRecord = { name: string; description: string; path: string; source: "lumina" | "vault"; updatedAt: string };

export async function listProjects(): Promise<ProjectRecord[]> {
  const root = vaultRoot();
  const files: string[] = [];
  async function walk(directory: string) {
    let entries;
    try { entries = await readdir(directory, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile() && entry.name.endsWith(".md")) files.push(absolute);
    }
  }
  await walk(root);
  const projects: ProjectRecord[] = [];
  for (const absolute of files) {
    const content = await readFile(absolute, "utf8");
    const isLuminaProject = absolute.startsWith(path.join(root, "Lumina", "Projects"));
    const isImportedProject = /^project:\s*(true|yes)\b/im.test(content) || /^#\s+project\b/im.test(content);
    if (!isLuminaProject && !isImportedProject) continue;
    const heading = content.match(/^#\s+(.+)$/m)?.[1] ?? path.basename(absolute, ".md");
    const description = content.replace(/^---[\s\S]*?---/, "").replace(/^#.*$/m, "").trim().split("\n").find(Boolean) ?? "No project description yet.";
    projects.push({ name: heading, description: description.slice(0, 140), path: path.relative(root, absolute), source: isLuminaProject ? "lumina" : "vault", updatedAt: (await stat(absolute)).mtime.toISOString() });
  }
  return projects;
}

export async function createProject(input: { name: string; description: string }) {
  const root = vaultRoot();
  const folder = path.join(root, "Lumina", "Projects");
  await mkdir(folder, { recursive: true });
  const safeName = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "project";
  const file = path.join(folder, `${safeName}.md`);
  const markdown = `---
type: project
created: ${new Date().toISOString()}
source: lumina-os
status: active
---

# ${input.name}

${input.description || "Project workspace created in Lumina."}

## Notes

- 
`;
  await writeFile(file, markdown, { encoding: "utf8", flag: "wx" });
  return path.relative(root, file);
}

export type PlanRecord = { id: string; title: string; date: string; platform: string; status: string; path: string };

export async function listPlans(): Promise<PlanRecord[]> {
  const root = vaultRoot();
  const folder = path.join(root, "Lumina", "Planning");
  try { await mkdir(folder, { recursive: true }); } catch { return []; }
  const entries = await readdir(folder, { withFileTypes: true });
  const plans: PlanRecord[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const absolute = path.join(folder, entry.name);
    const content = await readFile(absolute, "utf8");
    const read = (key: string) => content.match(new RegExp(`^${key}:\\s*(.+)$`, "mi"))?.[1]?.trim() ?? "";
    plans.push({ id: entry.name, title: read("title") || path.basename(entry.name, ".md"), date: read("date"), platform: read("platform") || "All channels", status: read("status") || "planned", path: path.relative(root, absolute) });
  }
  return plans.sort((a, b) => a.date.localeCompare(b.date));
}

export async function createPlan(input: { title: string; date: string; platform: string }) {
  const root = vaultRoot();
  const folder = path.join(root, "Lumina", "Planning");
  await mkdir(folder, { recursive: true });
  const safe = input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "content-plan";
  const file = path.join(folder, `${input.date}-${safe}.md`);
  const markdown = `---
type: content-plan
title: ${input.title}
date: ${input.date}
platform: ${input.platform}
status: planned
created: ${new Date().toISOString()}
---

# ${input.title}

## Brief

## Assets

## Publishing notes
`;
  await writeFile(file, markdown, { encoding: "utf8", flag: "wx" });
  return { id: path.basename(file), title: input.title, date: input.date, platform: input.platform, status: "planned", path: path.relative(root, file) };
}

export type AssetRecord = { name: string; path: string; type: string; size: number; updatedAt: string };

export async function listAssets(): Promise<AssetRecord[]> {
  const root = vaultRoot();
  const folder = path.join(root, "Lumina", "Assets");
  await mkdir(folder, { recursive: true });
  const entries = await readdir(folder, { withFileTypes: true });
  const assets: AssetRecord[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith(".")) continue;
    const absolute = path.join(folder, entry.name);
    const info = await stat(absolute);
    assets.push({ name: entry.name, path: path.relative(root, absolute), type: path.extname(entry.name).slice(1).toUpperCase() || "FILE", size: info.size, updatedAt: info.mtime.toISOString() });
  }
  return assets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
