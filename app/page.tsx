"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, BarChart3, CalendarDays, Check, ChevronDown, CircleHelp,
  ExternalLink, FileText, FolderOpen, Gauge, Inbox, Library, PanelLeft,
  Plus, Settings2, Sparkles, TrendingUp, Video, Zap, X, Bell, Image,
  Mail, RefreshCw, ShieldCheck,
} from "lucide-react";

type Tab = "Overview" | "Vault Network" | "Media Analytics" | "Planning" | "Projects" | "Asset Library" | "Inbox";
type VaultGraph = { nodes: { id: string; label: string }[]; edges: { source: string; target: string }[]; scannedAt: string; root: string };
type Project = { name: string; description: string; path: string; source: "lumina" | "vault"; updatedAt: string };
type Plan = { id: string; title: string; date: string; platform: string; status: string; path: string };
type Asset = { name: string; path: string; type: string; size: number; updatedAt: string };

const navItems: { label: Tab; icon: typeof Gauge }[] = [
  { label: "Overview", icon: Gauge },
  { label: "Vault Network", icon: Library },
  { label: "Media Analytics", icon: BarChart3 },
  { label: "Planning", icon: CalendarDays },
];

const networkNodes = [[50, 9], [42, 14], [61, 15], [34, 24], [70, 25], [27, 37], [77, 38], [20, 51], [82, 50], [27, 65], [76, 64], [37, 76], [65, 77], [48, 86], [57, 31], [45, 34], [64, 40], [38, 47], [56, 51], [69, 57], [44, 62], [56, 68], [33, 55], [72, 44], [29, 29], [78, 27], [38, 17], [65, 22]].map(([left, top], index) => ({ left: `${left}%`, top: `${top}%`, delay: `${index * 0.12}s`, size: index % 5 === 0 ? 4 : 2 }));

const platforms = [
  { name: "YouTube", mark: "▶", tone: "youtube", detail: "Views, retention, subscribers, revenue" },
  { name: "Instagram", mark: "◎", tone: "instagram", detail: "Reach, saves, shares, follower growth" },
  { name: "TikTok", mark: "♪", tone: "tiktok", detail: "Views, watch time, engagement, trends" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [vaultGraph, setVaultGraph] = useState<VaultGraph | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [connected, setConnected] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectError, setProjectError] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planTitle, setPlanTitle] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [planPlatform, setPlanPlatform] = useState("All channels");
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [inboxStatus, setInboxStatus] = useState<"loading" | "ready" | "not-configured">("loading");

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeTab !== "Projects") return;
    fetch("/api/projects", { cache: "no-store" }).then((response) => response.json()).then((body) => setProjects(body.projects ?? [])).catch(() => setProjectError("Could not read projects from the vault."));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "Planning") fetch("/api/planning", { cache: "no-store" }).then((r) => r.json()).then((body) => setPlans(body.plans ?? []));
    if (activeTab === "Asset Library") fetch("/api/assets", { cache: "no-store" }).then((r) => r.json()).then((body) => setAssets(body.assets ?? []));
    if (activeTab === "Inbox") fetch("/api/inbox", { cache: "no-store" }).then((r) => r.json()).then((body) => setInboxStatus(body.connected ? "ready" : "not-configured")).catch(() => setInboxStatus("not-configured"));
  }, [activeTab]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/vault", { cache: "no-store" });
        if (!response.ok) return;
        const graph = await response.json() as VaultGraph;
        if (active) setVaultGraph(graph);
      } catch { /* The dashboard remains usable while the vault is unavailable. */ }
    };
    refresh();
    const timer = window.setInterval(refresh, 2500);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const liveNodes = useMemo(() => {
    if (!vaultGraph?.nodes.length) return networkNodes;
    return vaultGraph.nodes.slice(0, 140).map((node, index) => {
      const angle = (index / Math.max(vaultGraph.nodes.length, 1)) * Math.PI * 8;
      const radius = 12 + ((index * 17) % 34);
      return { ...node, left: `${50 + Math.cos(angle) * radius}%`, top: `${50 + Math.sin(angle) * radius * .78}%`, delay: `${(index % 20) * .08}s`, size: index % 9 === 0 ? 4 : 2 };
    });
  }, [vaultGraph]);

  function toggleConnection(platform: string) {
    setConnected((items) => items.includes(platform) ? items.filter((item) => item !== platform) : [...items, platform]);
  }

  return (
    <main className="console-shell">
      <aside className={`console-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="console-brand"><div className="brand-glyph"><Sparkles size={14} /></div>{sidebarOpen && <span>LUMINA<span className="brand-sub">/ LOCAL OPERATING SYSTEM</span></span>}</div>
        <div className="console-workspace"><span className="workspace-avatar">Z</span>{sidebarOpen && <><span><b>Personal OS</b><small>LOCAL WORKSPACE</small></span><ChevronDown size={13} /></>}</div>
        <nav className="console-nav">
          {navItems.map(({ label, icon: Icon }) => <button key={label} className={activeTab === label ? "active" : ""} onClick={() => setActiveTab(label)}><Icon size={15} />{sidebarOpen && <span>{label}</span>}</button>)}
        </nav>
        {sidebarOpen && <span className="console-label">WORKSPACE</span>}
        <nav className="console-nav secondary">
          <button className={activeTab === "Projects" ? "active" : ""} onClick={() => setActiveTab("Projects")}><FolderOpen size={15} />{sidebarOpen && <span>Projects</span>}</button>
          <button className={activeTab === "Asset Library" ? "active" : ""} onClick={() => setActiveTab("Asset Library")}><Image size={15} />{sidebarOpen && <span>Asset Library</span>}</button>
          <button className={activeTab === "Inbox" ? "active" : ""} onClick={() => setActiveTab("Inbox")}><Inbox size={15} />{sidebarOpen && <span>Inbox <i>—</i></span>}</button>
        </nav>
        <div className="console-sidebar-bottom">
          <button><Settings2 size={15} />{sidebarOpen && <span>Settings</span>}</button>
          <button><CircleHelp size={15} />{sidebarOpen && <span>Help</span>}</button>
          {sidebarOpen && <div className="sidebar-vault"><span className="online-dot" /><span><b>VAULT ONLINE</b><small>{vaultGraph?.root ?? "CONNECTING..."}</small></span></div>}
        </div>
      </aside>

      <section className="console-main">
        <header className="console-topbar">
          <button className="console-icon" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle navigation"><PanelLeft size={16} /></button>
          <div className="console-crumb"><span>PERSONAL OS</span><b>/</b><strong>{activeTab.toUpperCase()}</strong></div>
          <div className="console-top-actions"><span className="connection-state"><span className="online-dot" /> LOCAL</span><span className="user-chip">ZO</span></div>
        </header>

        <div className="console-stage">
          <div className="stage-topline"><div><p>{currentTime.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "2-digit", year: "numeric", timeZone: "America/New_York" }).toUpperCase()} · EST</p><h1>{activeTab === "Overview" ? "Command center" : activeTab}</h1></div><div className="stage-clock">{currentTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "America/New_York" })}<small>EASTERN TIME</small></div></div>

          {activeTab === "Media Analytics" ? <MediaAnalytics connected={connected} onToggle={toggleConnection} /> : activeTab === "Planning" ? <Planning plans={plans} showForm={showPlanForm} setShowForm={setShowPlanForm} title={planTitle} setTitle={setPlanTitle} date={planDate} setDate={setPlanDate} platform={planPlatform} setPlatform={setPlanPlatform} onCreated={(plan) => setPlans((items) => [...items, plan].sort((a, b) => a.date.localeCompare(b.date)))} notificationEnabled={notificationEnabled} setNotificationEnabled={setNotificationEnabled} /> : activeTab === "Projects" ? <Projects projects={projects} showForm={showProjectForm} setShowForm={setShowProjectForm} name={projectName} setName={setProjectName} description={projectDescription} setDescription={setProjectDescription} error={projectError} setError={setProjectError} onCreated={(project) => setProjects((items) => [project, ...items])} /> : activeTab === "Asset Library" ? <AssetLibrary assets={assets} /> : activeTab === "Inbox" ? <InboxPanel status={inboxStatus} onRefresh={() => { setInboxStatus("loading"); fetch("/api/inbox", { cache: "no-store" }).then((r) => r.json()).then((body) => setInboxStatus(body.connected ? "ready" : "not-configured")).catch(() => setInboxStatus("not-configured")); }} /> : <NetworkView graph={vaultGraph} liveNodes={liveNodes} compact={activeTab === "Vault Network"} />}
        </div>
      </section>
    </main>
  );
}

function NetworkView({ graph, liveNodes, compact }: { graph: VaultGraph | null; liveNodes: { left: string; top: string; delay: string; size: number; label?: string }[]; compact: boolean }) {
  return <div className="network-layout">
    <div className="left-readout"><span className="readout-label">SYSTEM STATUS</span><div className="readout-value"><span className="online-dot" /> OPERATIONAL</div><div className="readout-rule" /><span className="readout-label">ACTIVE MEMORY</span><strong className="readout-number">{graph?.nodes.length.toLocaleString() ?? "—"}</strong><small>indexed notes</small><div className="mini-bars"><span /><span /><span /><span /><span /><span /><span /></div><span className="readout-label">LAST SYNC</span><div className="readout-small">{graph ? new Date(graph.scannedAt).toLocaleTimeString() : "WAITING"} <Check size={12} /></div><div className="readout-card"><span>VAULT</span><strong>{compact ? "Network explorer" : "Memory is alive"}</strong><small>Markdown + wikilinks.</small></div></div>
    <section className="network-stage"><div className="network-header"><span>OBSIDIAN NETWORK</span><span><Activity size={12} /> LIVE GRAPH</span></div><div className="network-orb" aria-label="Obsidian knowledge network visualization"><div className="orb-aura" /><div className="orb-core" /><div className="orb-ring ring-one" /><div className="orb-ring ring-two" />{liveNodes.map((node, index) => <span className="network-node" title={node.label} key={`${node.label ?? "seed"}-${index}`} style={{ left: node.left, top: node.top, animationDelay: node.delay, width: node.size, height: node.size }} />)}<div className="network-branches">{graph?.edges.slice(0, 30).map((edge, index) => <i key={`${edge.source}-${edge.target}-${index}`} style={{ transform: `rotate(${(index * 47) % 360}deg) scaleX(${.45 + (index % 5) * .12})` }} />)}</div><div className="network-center-label"><span>{graph?.nodes.length.toLocaleString() ?? "—"}</span><small>{graph ? `${graph.edges.length} LINKS · LIVE` : "CONNECT A VAULT"}</small></div></div><div className="network-caption"><span>{graph ? `LIVE · ${graph.root.toUpperCase()}` : "YOUR KNOWLEDGE, ALIVE"}</span><small>{graph ? `UPDATED ${new Date(graph.scannedAt).toLocaleTimeString()}` : "SET OBSIDIAN_VAULT_PATH TO CONNECT"}</small></div></section>
    <aside className="right-readout"><span className="readout-label">VAULT SIGNALS</span><div className="signal-stat"><b>{graph?.nodes.length ?? 0}</b><small>NOTES</small></div><div className="signal-stat"><b>{graph?.edges.length ?? 0}</b><small>LINKS</small></div><div className="right-divider" /><span className="readout-label">NEXT SIGNAL</span><strong className="signal-text">{compact ? "Explore your connected notes." : "Your memory is the center of the system."}</strong></aside>
  </div>;
}

function MediaAnalytics({ connected, onToggle }: { connected: string[]; onToggle: (platform: string) => void }) {
  return <section className="analytics-panel"><div className="analytics-intro"><div><span className="readout-label">MEDIA COMMAND CENTER</span><h2>Connect your channels.</h2><p>Bring performance, publishing, and content planning into one local workspace. Your credentials stay on this machine.</p></div><button className="setup-all" onClick={() => platforms.forEach((platform) => !connected.includes(platform.name) && onToggle(platform.name))}><Plus size={14} /> SET UP ALL</button></div><div className="platform-grid">{platforms.map((platform) => { const isConnected = connected.includes(platform.name); return <article className={`platform-card ${platform.tone}`} key={platform.name}><div className="platform-head"><span className="platform-mark">{platform.mark}</span><span className={`setup-status ${isConnected ? "ready" : ""}`}><span />{isConnected ? "READY" : "NOT CONNECTED"}</span></div><h3>{platform.name}</h3><p>{platform.detail}</p><div className="platform-preview"><BarChart3 size={18} /><span>Analytics will appear here<br /><small>after account connection</small></span></div><button className="platform-action" onClick={() => onToggle(platform.name)}>{isConnected ? <><Check size={14} /> CONNECTED</> : <><Plus size={14} /> CONNECT ACCOUNT</>}<ExternalLink size={12} /></button></article>; })}</div><div className="analytics-note"><TrendingUp size={15} /><span><b>Ready for setup.</b> OAuth connections, scheduled sync, cross-platform comparisons, and content performance reports are staged for the next integration step.</span></div></section>;
}

function Planning({ plans, showForm, setShowForm, title, setTitle, date, setDate, platform, setPlatform, onCreated, notificationEnabled, setNotificationEnabled }: { plans: Plan[]; showForm: boolean; setShowForm: (v: boolean) => void; title: string; setTitle: (v: string) => void; date: string; setDate: (v: string) => void; platform: string; setPlatform: (v: string) => void; onCreated: (p: Plan) => void; notificationEnabled: boolean; setNotificationEnabled: (v: boolean) => void }) {
  async function create() {
    const response = await fetch("/api/planning", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, date, platform }) });
    const body = await response.json();
    if (!response.ok) return;
    onCreated(body.plan); setTitle(""); setDate(""); setShowForm(false);
  }
  async function enableNotifications() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationEnabled(permission === "granted");
  }
  return <section className="planning-panel"><div className="projects-header"><div><span className="readout-label">CONTENT OPERATIONS</span><h2>Plan once. Publish everywhere.</h2><p>Plans are saved as Markdown in Obsidian and stay visible here.</p></div><div className="planning-actions"><button className="setup-all" onClick={() => setShowForm(true)}><Plus size={14} /> NEW PLAN</button><button className={`notify-button ${notificationEnabled ? "enabled" : ""}`} onClick={enableNotifications}><Bell size={14} /> {notificationEnabled ? "NOTIFICATIONS ON" : "ENABLE NOTIFICATIONS"}</button></div></div>{showForm && <div className="project-form"><div className="project-form-top"><span className="readout-label">NEW CONTENT PLAN</span><button className="close-form" onClick={() => setShowForm(false)}><X size={15} /></button></div><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Plan title" /><div className="plan-fields"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /><select value={platform} onChange={(e) => setPlatform(e.target.value)}><option>All channels</option><option>YouTube</option><option>Instagram</option><option>TikTok</option></select></div><div className="form-actions"><button className="setup-all" onClick={create}>SAVE TO OBSIDIAN</button></div></div>}<div className="plan-list">{plans.length ? plans.map((plan) => <article className="plan-row" key={plan.id}><CalendarDays size={16} /><span><b>{plan.title}</b><small>{plan.date} · {plan.platform}</small></span><em>{plan.status}</em></article>) : <div className="projects-empty"><CalendarDays size={23} /><b>No plans yet.</b><span>Create your first content plan and it will be saved to `Lumina/Planning`.</span></div>}</div></section>;
}

function AssetLibrary({ assets }: { assets: Asset[] }) {
  return <section className="planning-panel"><div className="projects-header"><div><span className="readout-label">OBSIDIAN / LUMINA / ASSETS</span><h2>Asset library.</h2><p>Files placed in your vault&apos;s `Lumina/Assets` folder appear here automatically.</p></div><button className="setup-all" onClick={() => window.open("file:///Users/zachowens/Desktop/Obsidian%20Vault/Main/Lumina/Assets")}><FolderOpen size={14} /> OPEN ASSET FOLDER</button></div>{assets.length ? <div className="assets-grid">{assets.map((asset) => <article className="asset-card" key={asset.path}><div className="asset-preview"><FileText size={25} /></div><b>{asset.name}</b><small>{asset.type} · {(asset.size / 1024).toFixed(1)} KB</small></article>)}</div> : <div className="projects-empty"><Image size={23} /><b>No assets yet.</b><span>Drop images, videos, audio, or documents into `Lumina/Assets` inside your Obsidian vault, then return here.</span></div>}<div className="import-note"><Library size={15} /><span><b>Vault-backed.</b> Lumina does not duplicate your media; it indexes the files where Obsidian can use them.</span></div></section>;
}

function InboxPanel({ status, onRefresh }: { status: "loading" | "ready" | "not-configured"; onRefresh: () => void }) {
  const configured = status === "ready";
  return <section className="inbox-panel"><div className="projects-header"><div><span className="readout-label">COMMUNICATIONS / GMAIL</span><h2>Your inbox, locally organized.</h2><p>Connect Gmail when you are ready. Lumina will keep the integration server-side and make email available for triage, planning, and vault capture.</p></div><button className="setup-all" onClick={onRefresh}><RefreshCw size={14} /> REFRESH CONNECTION</button></div><div className="inbox-connect-card"><div className="inbox-icon"><Mail size={23} /></div><div><span className={`setup-status ${configured ? "ready" : ""}`}><span />{status === "loading" ? "CHECKING" : configured ? "CONNECTED" : "NOT CONNECTED"}</span><h3>{configured ? "Gmail connection ready" : "Connect Gmail when ready"}</h3><p>{configured ? "Your inbox is ready to sync into Lumina." : "This tab is ready for Gmail OAuth, but no Gmail credentials or connection are configured yet."}</p></div><button className="platform-action" disabled={!configured}>{configured ? <><Mail size={14} /> OPEN INBOX</> : <><ShieldCheck size={14} /> GMAIL SETUP COMING NEXT</>}<ExternalLink size={12} /></button></div><div className="inbox-grid"><div><Mail size={17} /><b>Focused triage</b><small>Turn important messages into projects, plans, or vault notes.</small></div><div><CalendarDays size={17} /><b>Planning handoff</b><small>Convert deadlines and requests into your Obsidian planning calendar.</small></div><div><ShieldCheck size={17} /><b>Private by default</b><small>OAuth tokens stay local and are never placed in client-side code.</small></div></div></section>;
}

function Projects({ projects, showForm, setShowForm, name, setName, description, setDescription, error, setError, onCreated }: { projects: Project[]; showForm: boolean; setShowForm: (value: boolean) => void; name: string; setName: (value: string) => void; description: string; setDescription: (value: string) => void; error: string; setError: (value: string) => void; onCreated: (project: Project) => void }) {
  async function create() {
    if (!name.trim()) { setError("Give the project a name first."); return; }
    const response = await fetch("/api/projects", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, description }) });
    const body = await response.json();
    if (!response.ok) { setError(body.error ?? "Could not create project."); return; }
    onCreated({ name, description: description || "Project workspace created in Lumina.", path: body.path, source: "lumina", updatedAt: new Date().toISOString() });
    setName(""); setDescription(""); setError(""); setShowForm(false);
  }
  return <section className="projects-panel">
    <div className="projects-header"><div><span className="readout-label">WORKSPACE ORGANIZATION</span><h2>Your projects.</h2><p>Create focused workspaces or import project notes already living in Obsidian.</p></div><button className="setup-all" onClick={() => setShowForm(true)}><Plus size={14} /> NEW PROJECT</button></div>
    {showForm && <div className="project-form"><div className="project-form-top"><span className="readout-label">CREATE IN LUMINA / PROJECTS</span><button className="close-form" onClick={() => setShowForm(false)} aria-label="Close"><X size={15} /></button></div><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Project name" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What are you building?" /><div className="form-actions"><span>{error}</span><button className="setup-all" onClick={create}>CREATE PROJECT</button></div></div>}
    {!projects.length && !showForm ? <div className="projects-empty"><FolderOpen size={23} /><b>No projects yet.</b><span>Create one here, or add a Markdown note to your vault with a `project: true` property or a `# Project` heading.</span><div><button className="setup-all" onClick={() => setShowForm(true)}><Plus size={14} /> CREATE PROJECT</button></div></div> : <div className="projects-grid">{projects.map((project) => <article className="project-card" key={project.path}><div className="project-card-head"><span className={`project-source ${project.source}`}>{project.source === "vault" ? "IMPORTED" : "LUMINA"}</span><FileText size={15} /></div><h3>{project.name}</h3><p>{project.description}</p><small>{project.path}</small><button>OPEN PROJECT <ExternalLink size={12} /></button></article>)}</div>}
    <div className="import-note"><Library size={15} /><span><b>Obsidian import is automatic.</b> Project notes at the vault root are imported when they use `project: true` or a “Project” heading. Notes created here are saved under <code>Lumina/Projects</code>.</span></div>
  </section>;
}
