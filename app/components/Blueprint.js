'use client';

import { useState, useRef, useEffect, Component } from "react";
import { JIRAS, CODEBASE, DOCS, DRAFTS_SEED, KCHIPS } from './data';

class Boundary extends Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  render() {
    if (this.state.err) return (
      <div className="err">This sheet hit a snag: {String((this.state.err && this.state.err.message) || this.state.err)}. Switch tabs to recover — your progress is kept.</div>
    );
    return this.props.children;
  }
}

//asdfasdf

export default function Blueprint() {
  const [tab, setTab] = useState("chat");
  const [err, setErr] = useState(null);
  const [kMsgs, setKMsgs] = useState([]);
  const [kIn, setKIn] = useState("");
  const [kBusy, setKBusy] = useState(false);
  const [jp, setJp] = useState("ALL");
  const [jq, setJq] = useState("");
  const [doc, setDoc] = useState(null);
  const [docQ, setDocQ] = useState("");
  const [drafts, setDrafts] = useState(DRAFTS_SEED);
  const [draft, setDraft] = useState(null);
  const [sMsgs, setSMsgs] = useState([]);
  const [sIn, setSIn] = useState("");
  const [sBusy, setSBusy] = useState(false);
  const [brd, setBrd] = useState(null);
  const [brdBusy, setBrdBusy] = useState(false);
  const [stories, setStories] = useState([]);
  const [stBusy, setStBusy] = useState(false);
  const [jiraBusy, setJiraBusy] = useState(false);
  const [shipStory, setShipStory] = useState(null);
  const [ship, setShip] = useState(null);
  const [shipBusy, setShipBusy] = useState(false);

  const kEnd = useRef(null), sEnd = useRef(null);
  
  useEffect(() => { 
    try { 
      if (kEnd.current && typeof kEnd.current.scrollIntoView === "function") 
        kEnd.current.scrollIntoView({ block: "end" }); 
    } catch (e) {} 
  }, [kMsgs.length, kBusy]);
  
  useEffect(() => { 
    try { 
      if (sEnd.current && typeof sEnd.current.scrollIntoView === "function") 
        sEnd.current.scrollIntoView({ block: "end" }); 
    } catch (e) {} 
  }, [sMsgs.length, sBusy]);


  async function callOnce(messages, system) {
    const body = { model: "claude-sonnet-4-20250514", max_tokens: 1000, messages };
    if (system) body.system = system;
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    let d = null;
    try { if (r && typeof r.json === "function") d = await r.json(); } catch (e) { d = null; }
    if (!d && r && typeof r.text === "function") { try { d = JSON.parse(await r.text()); } catch (e) { d = null; } }
    if (!d) throw new Error("Couldn't read the model response.");
    if (d.error) throw new Error((d.error && d.error.message) || "API error");
    return d;
  }

  async function callClaude(messages, system) {
    let lastErr = null;
    for (let a = 0; a < 3; a++) {
      try { return await callOnce(messages, system); }
      catch (e) {
        lastErr = e;
        const m = String((e && e.message) || e).toLowerCase();
        const retriable = m.indexOf("internal") >= 0 || m.indexOf("overload") >= 0 || m.indexOf("busy") >= 0 || m.indexOf("rate") >= 0 || m.indexOf("read the model") >= 0 || m.indexOf("500") >= 0 || m.indexOf("529") >= 0 || m.indexOf("server") >= 0;
        if (retriable && a < 2) { await new Promise(r => setTimeout(r, 900 * (a + 1))); continue; }
        throw e;
      }
    }
    throw lastErr;
  }

  const textOf = d => {
    const c = (d && d.content) || [];
    if (typeof c === "string") return c;
    return c.filter(b => b && b.type === "text").map(b => b.text || "").join("\n").trim();
  };
  
  const stripJson = t => { const m = String(t).match(/\[[\s\S]*\]|\{[\s\S]*\}/); return m ? m[0] : t; };

  async function askK(q) {
    const question = String(q != null ? q : kIn).trim(); if (!question || kBusy) return;
    setErr(null); setKIn("");
    const next = [...kMsgs, { role: "user", content: question }];
    setKMsgs(next); setKBusy(true);
    try {
      const d = await callClaude(next.slice(-8).map(m => ({ role: m.role, content: m.content })),
        "You are Blueprint, Policybazaar's internal knowledge layer. Answer ONLY from the indexed sources below, including the live JIRA index. Be concrete and brief (under 120 words). Cite JIRA keys / repo / doc names you draw from. If something is not indexed, say so plainly.\n" + CODEBASE);
      setKMsgs(m => [...m, { role: "assistant", content: textOf(d) || "(empty response — try again)" }]);
    } catch (e) { setErr(e.message); setKMsgs(m => m.slice(0, -1)); }
    setKBusy(false);
  }


  function startSolutioning(dr) {
    setDraft(dr); setSMsgs([]); setBrd(null); setStories([]); setShip(null); setShipStory(null);
    setDrafts(ds => ds.map(x => x.id === dr.id ? { ...x, status: "solutioning" } : x));
    setTab("solution"); kickoff(dr);
  }

  async function kickoff(dr) {
    setSBusy(true); setErr(null);
    try {
      const d = await callClaude(
        [{ role: "user", content: "New requirement from " + dr.who + " in " + dr.ch + ': "' + dr.text + '"\nValidate it against what is already built and the live JIRA index — call out any existing or overlapping tickets by key. Name the exact services touched and ask me the 2-3 sharpest open questions. Under 140 words.' }],
        "You are Blueprint's solutioning engine for Policybazaar. Ground every claim in the indexed sources and live JIRA index. Crisp, no fluff.\n" + CODEBASE);
      setSMsgs([{ role: "assistant", content: textOf(d) || "(empty response — try again)" }]);
    } catch (e) { setErr(e.message); }
    setSBusy(false);
  }

  async function askS() {
    const t = sIn.trim(); if (!t || sBusy || !draft) return;
    setErr(null); setSIn("");
    const next = [...sMsgs, { role: "user", content: t }];
    setSMsgs(next); setSBusy(true);
    try {
      const d = await callClaude(next.slice(-8).map(m => ({ role: m.role, content: m.content })),
        'You are Blueprint\'s solutioning engine. Requirement under discussion: "' + draft.text + '". Ground answers in the indexed sources and live JIRA index; converge toward a closed solution. Under 120 words.\n' + CODEBASE);
      setSMsgs(m => [...m, { role: "assistant", content: textOf(d) || "(empty response — try again)" }]);
    } catch (e) { setErr(e.message); setSMsgs(m => m.slice(0, -1)); }
    setSBusy(false);
  }

  async function genBrd() {
    if (brdBusy || !draft) return; setBrdBusy(true); setErr(null);
    try {
      const transcript = sMsgs.map(m => (m.role === "user" ? "PM: " : "Blueprint: ") + m.content).join("\n");
      const d = await callClaude(
        [{ role: "user", content: 'Solutioning is closed for: "' + draft.text + '"\nTranscript:\n' + transcript + "\n\nWrite the BRD now." }],
        "Write a concise BRD in markdown for Policybazaar's Phoenix/POSP stack. Sections exactly: ## Objective, ## Background, ## Scope, ## User Stories (bullets, As a...), ## Acceptance Criteria (bullets), ## Out of Scope, ## Dependencies (reference related JIRA keys where relevant), ## Success Metrics. Ground in:\n" + CODEBASE);
      const out = textOf(d);
      if (!out) throw new Error("Empty BRD — try again.");
      setBrd(out);
      setDrafts(ds => ds.map(x => x.id === draft.id ? { ...x, status: "brd" } : x));
      setTab("brd");
    } catch (e) { setErr(e.message); }
    setBrdBusy(false);
  }


  async function genStories() {
    if (stBusy || !brd) return; setStBusy(true); setErr(null);
    try {
      const d = await callClaude(
        [{ role: "user", content: "BRD:\n" + brd + '\n\nBreak into 2-4 dev stories. Respond with ONLY a JSON array: [{"title":"...","description":"one line","ac":"key acceptance criterion","size":"S|M"}] — no prose, no fences.' }],
        "You split BRDs into small, shippable JIRA stories. JSON only.");
      const arr = JSON.parse(stripJson(textOf(d)));
      if (!Array.isArray(arr) || !arr.length) throw new Error("No stories parsed.");
      setStories(arr.map((s, i) => ({ title: s.title || "Story", description: s.description || "", ac: s.ac || "", size: s.size === "M" ? "M" : "S", id: i, key: null, state: "ready" })));
      setTab("jira");
    } catch (e) { setErr("Couldn't parse stories — try again. " + e.message); }
    setStBusy(false);
  }

  async function pushJira() {
    if (jiraBusy || !stories.length) return; setJiraBusy(true); setErr(null);
    for (let i = 0; i < stories.length; i++) {
      await new Promise(r => setTimeout(r, 650));
      setStories(st => st.map(s => s.id === i ? { ...s, key: "POSP-" + (1041 + i), state: "created" } : s));
    }
    setDrafts(ds => ds.map(x => draft && x.id === draft.id ? { ...x, status: "jira" } : x));
    setJiraBusy(false);
  }

  async function selfShip(story) {
    if (shipBusy) return;
    setShipStory(story); setShip(null); setShipBusy(true); setErr(null); setTab("ship");
    try {
      const d = await callClaude(
        [{ role: "user", content: "Story: " + story.title + " — " + story.description + " (AC: " + story.ac + "). Stack context:\n" + CODEBASE.slice(0, 2400) + '\nGenerate the minimal change. Respond ONLY with JSON, no fences: {"summary":"one line","files":[{"path":"repo/path/File.ext","diff":["- old line","+ new line"]}],"tests":[{"name":"test name","pass":true}],"frontend":true,"preview":{"screen":"Phoenix · Active Call","kind":"banner|modal|list","title":"short heading","text":"banner text if kind=banner","items":["item 1","item 2"],"highlight":"the new or changed item text"}} . Rules: 1-2 files, 4-8 diff lines each, 3 tests. Set frontend=false and omit preview if the change touches no UI. For kind=modal or list give 3-5 short items where one is the new/changed one, repeated exactly in highlight.' }],
        "You are Blueprint's cloud coding agent. Plausible, minimal, production-shaped diffs for the Phoenix stack. JSON only.");
      const obj = JSON.parse(stripJson(textOf(d)));
      setShip({
        summary: obj.summary || "Change generated",
        files: Array.isArray(obj.files) ? obj.files : [],
        tests: Array.isArray(obj.tests) ? obj.tests : [],
        frontend: !!obj.frontend,
        preview: obj.preview && typeof obj.preview === "object" ? obj.preview : null,
        pr: 847 + (story.id || 0),
      });
      setDrafts(ds => ds.map(x => draft && x.id === draft.id ? { ...x, status: "shipped" } : x));
    } catch (e) { setErr("Generation failed — try again. " + e.message); }
    setShipBusy(false);
  }


  function Md({ text }) {
    const bold = s => String(s).split(/\*\*(.+?)\*\*/g).map((p, j) => j % 2 ? <strong key={j}>{p}</strong> : p);
    return <div>{String(text).split("\n").map((ln, i) => {
      if (ln.indexOf("## ") === 0) return <h3 key={i} className="md-h">{ln.slice(3)}</h3>;
      if (ln.indexOf("# ") === 0) return <h3 key={i} className="md-h">{ln.slice(2)}</h3>;
      if (/^\s*[-*] /.test(ln)) return <div key={i} className="md-li"><span className="md-tick">—</span><span>{bold(ln.replace(/^\s*[-*] /, ""))}</span></div>;
      if (!ln.trim()) return <div key={i} style={{ height: 8 }} />;
      return <p key={i} className="md-p">{bold(ln)}</p>;
    })}</div>;
  }

  function Preview({ p }) {
    if (!p) return null;
    const items = Array.isArray(p.items) ? p.items : [];
    const hl = p.highlight || "";
    const kind = p.kind === "modal" || p.kind === "list" ? p.kind : "banner";
    return (
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "#9FB4E6", marginBottom: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span className="pill" style={{ color: "#60D6A8" }}>sample preview</span>
          Generated from the diff — not deployed.
        </div>
        <div className="mock">
          <div className="mock-top">
            <span className="mdot" /><span className="mdot" /><span className="mdot" />
            <span style={{ marginLeft: 8 }}>{p.screen || "Phoenix"}</span>
          </div>
          <div className="mock-body">
            {kind === "banner" && <>
              <div className="mock-banner">⚠ {p.text || p.title || hl || "Alert"}</div>
              <div className="mock-row"><div><div className="mock-name">Rakesh Traders · POSP</div><div className="mock-sub">Active call · 12:02</div></div><span className="mock-chip">on call</span></div>
              <div className="mock-row dim"><div><div className="mock-name">Next: Sharma Insurance</div><div className="mock-sub">Bucket B2 · queued</div></div></div>
            </>}
            {kind !== "banner" && <>
              {p.title && <div className="mock-name" style={{ marginBottom: 8 }}>{p.title}</div>}
              <div className={kind === "modal" ? "mock-modal" : ""}>
                {items.map((it, i) => {
                  const isNew = hl && String(it).indexOf(hl) >= 0;
                  return (
                    <div key={i} className={"mock-opt" + (isNew ? " new" : "")}>
                      <span className="mock-radio" />{it}
                      {isNew && <span className="mock-new">NEW</span>}
                    </div>
                  );
                })}
                {kind === "modal" && <div className="mock-cta">Submit disposition</div>}
              </div>
            </>}
          </div>
        </div>
      </div>
    );
  }


  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatIn, setChatIn] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [showRepoPopup, setShowRepoPopup] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [chatSessions, setChatSessions] = useState([
    { id: 1, title: "Next.js Setup Help", date: "2026-06-17", msgCount: 8, lastMsg: "Great! That worked perfectly." },
    { id: 2, title: "React Hooks Question", date: "2026-06-16", msgCount: 12, lastMsg: "Thanks for the explanation!" },
    { id: 3, title: "API Integration", date: "2026-06-15", msgCount: 5, lastMsg: "How do I handle errors?" },
  ]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const chatEnd = useRef(null);

  const REPOSITORIES = [
    { id: 'posp_api_node', name: 'posp_api_node', color: '#3B82F6' },
    { id: 'posp', name: 'posp', color: '#10B981' },
    { id: 'pbp_admin', name: 'pbp_admin', color: '#F59E0B' },
    { id: 'phoenix_web', name: 'phoenix_web', color: '#8B5CF6' },
    { id: 'pbpmitra_app', name: 'pbpmitra_app', color: '#EC4899' },
    { id: 'amigo_core', name: 'amigo_core', color: '#14B8A6' },
  ];

  useEffect(() => { 
    try { 
      if (chatEnd.current && typeof chatEnd.current.scrollIntoView === "function") 
        chatEnd.current.scrollIntoView({ block: "end" }); 
    } catch (e) {} 
  }, [chatMsgs.length, chatBusy]);

  async function sendChat() {
    const question = chatIn.trim(); 
    if (!question || chatBusy) return;
    setErr(null); 
    setChatIn("");
    
    let contextText = question;
    if (selectedRepos.length > 0) {
      const repoNames = selectedRepos.map(r => r.name).join(', ');
      contextText = `[Context: ${repoNames}]\n\n${question}`;
    }
    
    const next = [...chatMsgs, { role: "user", content: question, repos: [...selectedRepos] }];
    setChatMsgs(next); 
    setChatBusy(true);
    try {
      const d = await callClaude(
        next.slice(-10).map(m => ({ role: m.role, content: m.repos && m.repos.length > 0 ? `[Context: ${m.repos.map(r => r.name).join(', ')}]\n\n${m.content}` : m.content })),
        "You are a helpful AI assistant. Provide clear, concise, and accurate responses. Be conversational and friendly."
      );
      const assistantMsg = { role: "assistant", content: textOf(d) || "(empty response)" };
      setChatMsgs(m => [...m, assistantMsg]);
      
      // Update chat session if we have messages
      if (next.length === 1 && !currentSessionId) {
        // New chat session
        const newSession = {
          id: Date.now(),
          title: question.slice(0, 40) + (question.length > 40 ? "..." : ""),
          date: new Date().toISOString().split('T')[0],
          msgCount: 2,
          lastMsg: (textOf(d) || "(empty response)").slice(0, 50)
        };
        setChatSessions(s => [newSession, ...s]);
        setCurrentSessionId(newSession.id);
      } else if (currentSessionId) {
        // Update existing session
        setChatSessions(s => s.map(sess => 
          sess.id === currentSessionId 
            ? { ...sess, msgCount: next.length + 1, lastMsg: (textOf(d) || "(empty response)").slice(0, 50) }
            : sess
        ));
      }
    } catch (e) { 
      setErr(e.message); 
      setChatMsgs(m => m.slice(0, -1)); 
    }
    setChatBusy(false);
  }

  const startNewChat = () => {
    setChatMsgs([]);
    setCurrentSessionId(null);
    setSelectedRepos([]);
    setChatIn("");
  };

  const loadChatSession = (sessionId) => {
    // In a real app, you'd load the actual messages from storage/API
    setCurrentSessionId(sessionId);
    // For demo, just clear the current chat
    setChatMsgs([]);
    setSelectedRepos([]);
  };

  const deleteChatSession = (sessionId) => {
    setChatSessions(s => s.filter(sess => sess.id !== sessionId));
    if (currentSessionId === sessionId) {
      startNewChat();
    }
  };

  const toggleRepo = (repo) => {
    setSelectedRepos(prev => {
      const exists = prev.find(r => r.id === repo.id);
      if (exists) {
        return prev.filter(r => r.id !== repo.id);
      } else {
        return [...prev, repo];
      }
    });
  };

  const removeRepo = (repoId) => {
    setSelectedRepos(prev => prev.filter(r => r.id !== repoId));
  };

  const stages = [
    { id: "chat", n: "01", label: "Chat", done: chatMsgs.length > 0 },
    { id: "knowledge", n: "02", label: "Knowledge", done: kMsgs.length > 0 },
    { id: "docs", n: "03", label: "Docs", done: !!doc },
    { id: "drafts", n: "04", label: "Drafts", done: drafts.some(d => d.status !== "new") },
    { id: "solution", n: "05", label: "Solutioning", done: sMsgs.length > 0, lock: !draft },
    { id: "brd", n: "06", label: "BRD", done: !!brd, lock: !brd && !sMsgs.length },
    { id: "jira", n: "07", label: "JIRA", done: stories.some(s => s.state === "created"), lock: !stories.length && !brd },
    { id: "ship", n: "08", label: "Ship", done: !!ship, lock: !stories.length },
  ];
  
  const statusTint = { new: "#7FA3FF", solutioning: "#FBBF24", brd: "#C4B5FD", jira: "#60D6A8", shipped: "#4ADE80" };
  const statusWord = { new: "new", solutioning: "in solutioning", brd: "BRD ready", jira: "in JIRA", shipped: "shipped" };
  const cur = stages.find(s => s.id === tab) || stages[0];
  const docList = DOCS.filter(d => !docQ.trim() || (d.title + " " + d.one + " " + d.tag).toLowerCase().indexOf(docQ.toLowerCase()) >= 0);

  const jTint = s => {
    const x = String(s).toLowerCase();
    if (/done|closed|release/.test(x)) return "#4ADE80";
    if (/block/.test(x)) return "#F87171";
    if (/await|draft|backlog|to-do|todo|requirement/.test(x)) return "#7FA3FF";
    if (/progress|review|testing|qa|dev|design|html/.test(x)) return "#FBBF24";
    return "#7FA3FF";
  };
  
  const PROJ = ["ALL", "PHOEN", "POSP", "PBPAR", "PD"];
  const jiraList = JIRAS.filter(j => (jp === "ALL" || j.p === jp) && (!jq.trim() || (j.k + " " + j.t + " " + j.s + " " + j.a).toLowerCase().indexOf(jq.toLowerCase()) >= 0));
  const projCount = p => JIRAS.filter(j => j.p === p).length;

  const Dots = () => <span className="dots"><i /><i /><i /></span>;


  return (
    <div className="bp-root">
      <header className="tb">
        <div className="brand">
          <svg width="34" height="34" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="29" fill="#1268FB" />
            <text x="30" y="40" textAnchor="middle" fontFamily="Georgia,serif" fontSize="30" fill="#fff">bp</text>
          </svg>
          <h1>Blueprint</h1>
        </div>
        <div className="tb-cell"><span className="tb-k">Project</span><span className="tb-v">Phoenix · POSP</span></div>
        <div className="tb-cell hide"><span className="tb-k">Team</span><span className="tb-v">Push to Production</span></div>
        <div className="tb-cell hide"><span className="tb-k">Sheet</span><span className="tb-v">{cur.n} — {cur.label}</span></div>
        <div className="tb-cell" style={{ marginLeft: "auto", borderRight: 0, borderLeft: "1px solid #233763" }}>
          <span className="tb-k">Rev</span><span className="tb-v">C · Hackathon</span>
        </div>
      </header>

      <div className="body">
        <nav className="rail">
          {stages.map(s => (
            <button key={s.id} className={"stage " + (tab === s.id ? "on " : "") + (s.lock ? "lock" : "")}
              onClick={() => { if (!s.lock) setTab(s.id); }}>
              <span className="n">{s.n}</span>{s.label}{s.done && <span className="tick">✓</span>}
            </button>
          ))}
        </nav>

        <main className="main">
          <Boundary>
            {err && <div className="err">{err}</div>}

            {/* 01 CHAT */}
            {tab === "chat" && <>
              <div className="chat-layout">
                <div className="chat-container">
                  <div className="chat-header">
                    <h2 className="chat-title">AI Assistant</h2>
                    <p className="chat-subtitle">Your intelligent companion for any task</p>
                  </div>

                  {chatMsgs.length === 0 ? (
                    <div className="chat-welcome">
                      <div className="welcome-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                      <h3 className="welcome-heading">How can I help you today?</h3>
                      <div className="chat-suggestions">
                        <button className="suggestion-card" onClick={() => { setChatIn("Explain how Next.js works"); }}>
                          <div className="suggestion-icon">💡</div>
                          <div className="suggestion-text">Explain how Next.js works</div>
                        </button>
                        <button className="suggestion-card" onClick={() => { setChatIn("Write a function to sort an array"); }}>
                          <div className="suggestion-icon">⚡</div>
                          <div className="suggestion-text">Write a function to sort an array</div>
                        </button>
                        <button className="suggestion-card" onClick={() => { setChatIn("Help me debug this code"); }}>
                          <div className="suggestion-icon">🔍</div>
                          <div className="suggestion-text">Help me debug this code</div>
                        </button>
                        <button className="suggestion-card" onClick={() => { setChatIn("Best practices for React"); }}>
                          <div className="suggestion-icon">📚</div>
                          <div className="suggestion-text">Best practices for React</div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="chat-feed">
                      {chatMsgs.map((m, i) => (
                        <div key={i} className={`chat-message ${m.role === "user" ? "user-message" : "assistant-message"}`}>
                          <div className="message-avatar">
                            {m.role === "user" ? (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                              </svg>
                            ) : (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 12H7v-2h10v2zm0-3H7V9h10v2zm0-3H7V6h10v2z"/>
                              </svg>
                            )}
                          </div>
                          <div className="message-content">
                            <div className="message-text">{m.content}</div>
                          </div>
                        </div>
                      ))}
                      {chatBusy && (
                        <div className="chat-message assistant-message">
                          <div className="message-avatar">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 12H7v-2h10v2zm0-3H7V9h10v2zm0-3H7V6h10v2z"/>
                            </svg>
                          </div>
                          <div className="message-content">
                            <Dots />
                          </div>
                        </div>
                      )}
                      <div ref={chatEnd} />
                    </div>
                  )}

                  <div className="chat-input-container">
                    {selectedRepos.length > 0 && (
                      <div className="selected-repos">
                        {selectedRepos.map(repo => (
                          <div key={repo.id} className="repo-chip" style={{ borderColor: repo.color }}>
                            <span className="repo-chip-dot" style={{ backgroundColor: repo.color }}></span>
                            <span className="repo-chip-name">{repo.name}</span>
                            <button 
                              className="repo-chip-remove" 
                              onClick={() => removeRepo(repo.id)}
                              type="button"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="chat-input-wrapper">
                      <button
                        className="chat-plus-btn"
                        onClick={() => setShowRepoPopup(!showRepoPopup)}
                        type="button"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                      
                      <textarea
                        value={chatIn}
                        onChange={e => setChatIn(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendChat();
                          }
                        }}
                        placeholder="Message AI Assistant..."
                        className="chat-input"
                        rows="1"
                      />
                      <button
                        onClick={sendChat}
                        disabled={chatBusy || !chatIn.trim()}
                        className="chat-send-btn"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      </button>
                    </div>

                    {showRepoPopup && (
                      <>
                        <div className="repo-popup-overlay" onClick={() => setShowRepoPopup(false)}></div>
                        <div className="repo-popup">
                          <div className="repo-popup-header">
                            <h4>Select Repositories</h4>
                            <button className="repo-popup-close" onClick={() => setShowRepoPopup(false)}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                          <div className="repo-popup-list">
                            {REPOSITORIES.map(repo => (
                              <div
                                key={repo.id}
                                className={`repo-item ${selectedRepos.find(r => r.id === repo.id) ? 'selected' : ''}`}
                                onClick={() => toggleRepo(repo)}
                              >
                                <div className="repo-item-icon" style={{ backgroundColor: repo.color }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                  </svg>
                                </div>
                                <span className="repo-item-name">{repo.name}</span>
                                {selectedRepos.find(r => r.id === repo.id) && (
                                  <svg className="repo-item-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="chat-sidebar">
                  <div className="chat-sidebar-header">
                    <h3 className="chat-sidebar-title">Chat History</h3>
                    <button className="new-chat-btn" onClick={startNewChat} title="New Chat">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </button>
                  </div>

                  <div className="chat-history-list">
                    {chatSessions.map(session => (
                      <div 
                        key={session.id} 
                        className={`chat-history-item ${currentSessionId === session.id ? 'active' : ''}`}
                        onClick={() => loadChatSession(session.id)}
                      >
                        <div className="chat-history-header">
                          <div className="chat-history-title">{session.title}</div>
                          <button 
                            className="chat-history-delete" 
                            onClick={(e) => { e.stopPropagation(); deleteChatSession(session.id); }}
                            title="Delete chat"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                        <div className="chat-history-meta">
                          <span className="chat-history-date">{session.date}</span>
                          <span className="chat-history-count">{session.msgCount} messages</span>
                        </div>
                        <div className="chat-history-preview">{session.lastMsg}</div>
                      </div>
                    ))}
                  </div>

                  <div className="chat-stats">
                    <div className="chat-stat-item">
                      <div className="chat-stat-label">Total Chats</div>
                      <div className="chat-stat-value">{chatSessions.length}</div>
                    </div>
                    <div className="chat-stat-item">
                      <div className="chat-stat-label">Today</div>
                      <div className="chat-stat-value">{chatSessions.filter(s => s.date === new Date().toISOString().split('T')[0]).length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>}

            {/* 02 KNOWLEDGE */}
            {tab === "knowledge" && <>
              <div className="sheet-t">Ask the codebase</div>
              <div className="sheet-s">Everything indexed — repos, services, Slack, and a live JIRA index of {JIRAS.length} issues synced via Rovo MCP across PHOEN · POSP · PBPAR · PD.</div>
              <div className="src">
                <span><b>●</b>phoenix-web</span><span><b>●</b>phoenix-api</span><span><b>●</b>pbpmitra-app</span>
                <span><b>●</b>amigo-core</span><span><b>●</b>voicebot</span><span><b>●</b>dialer-bridge</span>
                <span><b>●</b>Slack ×3</span><span><b>●</b>JIRA ×{JIRAS.length}</span>
              </div>

              <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <span style={{ fontFamily: "Georgia,serif", fontSize: 15 }}>Live JIRA index</span>
                  <span className="pill" style={{ color: "#60D6A8" }}>synced · Rovo MCP</span>
                  <span style={{ fontSize: 11, color: "#5E72A8", marginLeft: "auto" }}>{jiraList.length} shown</span>
                </div>
                <div className="chips" style={{ marginBottom: 8 }}>
                  {PROJ.map(p => (
                    <button key={p} className={"chip " + (jp === p ? "on" : "")} onClick={() => setJp(p)}>
                      {p}{p !== "ALL" ? " · " + projCount(p) : " · " + JIRAS.length}
                    </button>
                  ))}
                </div>
                <div className="ask" style={{ marginTop: 0 }}>
                  <input value={jq} onChange={e => setJq(e.target.value)} placeholder="Filter issues — try renewal, blocked, partner 360…" />
                </div>
                <div className="jlist">
                  {jiraList.slice(0, 60).map(j => (
                    <div key={j.k} className="jrow">
                      <span className="jkey">{j.k}</span>
                      <span className="jtitle">{j.t}</span>
                      <span className="jass">{j.a !== "—" ? j.a : ""}</span>
                      <span className="pill" style={{ color: jTint(j.s) }}>{j.s}</span>
                    </div>
                  ))}
                  {jiraList.length > 60 && <div style={{ fontSize: 11, color: "#5E72A8", padding: "8px 0" }}>+ {jiraList.length - 60} more — refine the filter, or just ask below.</div>}
                  {jiraList.length === 0 && <div style={{ fontSize: 12, color: "#5E72A8", padding: "8px 0" }}>No issues match.</div>}
                </div>
              </div>

              {kMsgs.length === 0 && <div className="chips">{KCHIPS.map(c => <button key={c} className="chip" onClick={() => askK(c)}>{c}</button>)}</div>}
              <div className="feed">
                {kMsgs.map((m, i) => <div key={i} className={"msg " + (m.role === "user" ? "u" : "a")}>{m.content}</div>)}
                {kBusy && <div className="msg a"><Dots /></div>}
                <div ref={kEnd} />
              </div>
              <div className="ask">
                <input value={kIn} onChange={e => setKIn(e.target.value)} onKeyDown={e => { if (e.key === "Enter") askK(); }} placeholder="e.g. which PD tickets are awaiting QA?" />
                <button className="btn" onClick={() => askK()} disabled={kBusy || !kIn.trim()}>Ask</button>
              </div>
            </>}


            {/* 03 DOCS */}
            {tab === "docs" && <>
              {!doc ? <>
                <div className="sheet-t">Living documentation</div>
                <div className="sheet-s">Auto-generated from every connected repo and kept current on each push. {DOCS.length} documents across the PBPartners portfolio.</div>
                <div className="ask" style={{ marginTop: 0, marginBottom: 16 }}>
                  <input value={docQ} onChange={e => setDocQ(e.target.value)} placeholder="Filter docs — try renewal, dialer, amigo…" />
                </div>
                {docList.map(d => (
                  <div key={d.id} className="card doc" onClick={() => setDoc(d)}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                      <div>
                        <div className="doc-tag">{d.tag}</div>
                        <div className="doc-t">{d.title}</div>
                      </div>
                      <span className="fresh">{d.fresh}</span>
                    </div>
                    <div className="doc-one">{d.one}</div>
                  </div>
                ))}
                {docList.length === 0 && <div className="sheet-s">No docs match that filter.</div>}
              </> : <>
                <button className="btn ghost" style={{ alignSelf: "flex-start", marginBottom: 14 }} onClick={() => setDoc(null)}>← All docs</button>
                <div className="doc-tag">{doc.tag} · <span style={{ color: "#4ADE80" }}>{doc.fresh}</span></div>
                <div className="sheet-t" style={{ marginTop: 2 }}>{doc.title}</div>
                <div className="card" style={{ marginTop: 8 }}><Md text={doc.body} /></div>
              </>}
            </>}

            {/* 04 DRAFTS */}
            {tab === "drafts" && <>
              <div className="sheet-t">Requirement drafts from Slack</div>
              <div className="sheet-s">Messages captured from indexed channels, waiting to be solutioned. Slack is the note-taking surface; Blueprint is where they become real.</div>
              {drafts.map(d => (
                <div key={d.id} className="card draft">
                  <div className="d-meta">
                    <span>{d.ch}</span><span>{d.who}</span><span>{d.when}</span>
                    <span className="pill" style={{ color: d.size === "S" ? "#4ADE80" : "#FBBF24" }}>{d.size === "S" ? "small" : "medium"}</span>
                    <span className="pill" style={{ color: statusTint[d.status], marginLeft: "auto" }}>{statusWord[d.status]}</span>
                  </div>
                  <div className="d-text">{d.text}</div>
                  <button className="btn ghost" onClick={() => startSolutioning(d)}>Start solutioning →</button>
                </div>
              ))}
            </>}


            {/* 05 SOLUTIONING */}
            {tab === "solution" && <>
              <div className="sheet-t">Solutioning</div>
              {!draft ? <div className="sheet-s">Pick a draft from sheet 03 to begin.</div> : <>
                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="d-meta"><span>{draft.ch}</span><span>{draft.who}</span></div>
                  <div className="d-text" style={{ marginBottom: 0 }}>{draft.text}</div>
                </div>
                <div className="feed">
                  {sMsgs.map((m, i) => <div key={i} className={"msg " + (m.role === "user" ? "u" : "a")}>{m.content}</div>)}
                  {sBusy && <div className="msg a"><Dots /></div>}
                  <div ref={sEnd} />
                </div>
                <div className="ask">
                  <input value={sIn} onChange={e => setSIn(e.target.value)} onKeyDown={e => { if (e.key === "Enter") askS(); }} placeholder="Answer the open questions, refine the approach…" />
                  <button className="btn ghost" onClick={askS} disabled={sBusy || !sIn.trim()}>Send</button>
                  <button className="btn" onClick={genBrd} disabled={brdBusy || sMsgs.length === 0}>{brdBusy ? "Writing…" : "Close → BRD"}</button>
                </div>
              </>}
            </>}

            {/* 06 BRD */}
            {tab === "brd" && <>
              <div className="sheet-t">Business Requirement Document</div>
              {!brd ? <div className="sheet-s">No BRD yet — close solutioning on sheet 04 first.</div> : <>
                <div className="sheet-s">Generated from the closed solutioning thread, grounded in the indexed codebase and live JIRA index.</div>
                <div className="card" style={{ marginBottom: 16 }}><Md text={brd} /></div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn" onClick={genStories} disabled={stBusy}>{stBusy ? "Splitting…" : "Break into JIRA stories →"}</button>
                </div>
              </>}
            </>}


            {/* 07 JIRA */}
            {tab === "jira" && <>
              <div className="sheet-t">Stories → JIRA</div>
              {!stories.length ? <div className="sheet-s">Generate stories from the BRD on sheet 05.</div> : <>
                <div className="sheet-s">Project POSP · type Task · <strong style={{ color: "#FBBF24" }}>demo build — keys are simulated, nothing is ever written to your JIRA.</strong></div>
                <div className="card">
                  {stories.map(s => (
                    <div key={s.id} className="story">
                      <span className={"key " + (s.state === "created" ? "" : "wait")}>{s.key || (jiraBusy ? "…" : "ready")}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {s.title} <span className="pill" style={{ color: s.size === "S" ? "#4ADE80" : "#FBBF24", marginLeft: 6 }}>{s.size}</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: "#9FB4E6", marginTop: 3 }}>{s.description} · <em>AC: {s.ac}</em></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
                  <button className="btn" onClick={pushJira} disabled={jiraBusy || stories.every(s => s.state === "created")}>
                    {jiraBusy ? "Creating…" : stories.every(s => s.state === "created") ? "Created ✓" : "Create in JIRA"}
                  </button>
                  {stories.every(s => s.state === "created") && <span className="pill" style={{ color: "#FBBF24" }}>simulated</span>}
                  {stories.some(s => s.state === "created" && s.size === "S") &&
                    <button className="btn ghost" onClick={() => setTab("ship")}>Self-ship the small one →</button>}
                </div>
              </>}
            </>}


            {/* 08 SHIP */}
            {tab === "ship" && <>
              <div className="sheet-t">Self-ship</div>
              <div className="sheet-s">PM-triggered cloud coding for small stories. Blueprint generates the change with full context, runs tests, raises the PR. Frontend changes come with a sample UI preview. A developer reviews before anything merges.</div>
              {!stories.length ? <div className="sheet-s">Create stories first (sheet 06).</div> : <>
                <div className="chips">
                  {stories.filter(s => s.size === "S").map(s => (
                    <button key={s.id} className="chip" style={shipStory && shipStory.id === s.id ? { borderColor: "#1268FB" } : undefined}
                      onClick={() => selfShip(s)} disabled={shipBusy}>
                      ⚡ {s.key || "story"} — {s.title}
                    </button>
                  ))}
                  {stories.filter(s => s.size === "S").length === 0 && <span style={{ fontSize: 12.5, color: "#8593B8" }}>No small stories — self-ship is gated to size S.</span>}
                </div>
                {shipBusy && <div className="card"><Dots /> <span style={{ fontSize: 13, color: "#9FB4E6", marginLeft: 8 }}>Generating change with repo + BRD + story context…</span></div>}
                {ship && <>
                  <div className="card" style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{ship.summary}</div>
                    {ship.files.map((f, i) => (
                      <div key={i} className="diff">
                        <div className="pathline">{f.path}</div>
                        {(Array.isArray(f.diff) ? f.diff : []).map((ln, j) => (
                          <div key={j} className={String(ln).indexOf("+") === 0 ? "add" : String(ln).indexOf("-") === 0 ? "del" : ""}>{ln}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                  {ship.frontend && ship.preview && <Preview p={ship.preview} />}
                  <div className="card" style={{ marginBottom: 14 }}>
                    {ship.tests.map((t, i) => (
                      <div key={i} className="test">
                        <span style={{ color: t.pass ? "#4ADE80" : "#F87171" }}>{t.pass ? "✓" : "✗"}</span>{t.name}
                      </div>
                    ))}
                  </div>
                  <div className="card" style={{ borderColor: "#1268FB", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <span className="key">PR #{ship.pr}</span>
                    <div style={{ flex: 1, fontSize: 13.5, minWidth: 200 }}>
                      Raised against <span style={{ fontFamily: "ui-monospace,monospace", color: "#AFC9FF" }}>phoenix-web</span> → <strong>awaiting dev review</strong>. Nothing merges without a human approval.
                    </div>
                    <span className="pill" style={{ color: "#FBBF24" }}>review pending</span>
                  </div>
                </>}
              </>}
            </>}

          </Boundary>
        </main>
      </div>
    </div>
  );
}
