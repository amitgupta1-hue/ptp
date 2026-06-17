// JIRA data
export const JIRAS = [{"k": "PHOEN-57", "p": "PHOEN", "t": "Define API structure and Publish API", "s": "Awaiting QA", "a": "Aman", "y": "Story"}, {"k": "PHOEN-85", "p": "PHOEN", "t": "Calling Campaign Engine — v1.1 Release", "s": "Dev In Progress", "a": "—", "y": "Task"}, {"k": "PHOEN-70", "p": "PHOEN", "t": "Phoenix Partner List — PartnerCallback Label & Manual Callback Visibility", "s": "Dev In Progress", "a": "Aman", "y": "Story"}, {"k": "PHOEN-58", "p": "PHOEN", "t": "Data management and Assignment", "s": "Dev In Progress", "a": "Aman", "y": "Story"}, {"k": "PHOEN-81", "p": "PHOEN", "t": "Bottoms-Up Planning for VRMs — Replicate RM App Flow on Phoenix", "s": "Requirement Phase", "a": "—", "y": "Task"}, {"k": "PHOEN-73", "p": "PHOEN", "t": "Disposition Mandatory on Connected Calls — Motor", "s": "Requirement Phase", "a": "—", "y": "Story"}, {"k": "PHOEN-77", "p": "PHOEN", "t": "Limit on Onboarding Assignment for new Organic bucket tasks", "s": "Requirement Phase", "a": "Akash", "y": "Task"}, {"k": "PHOEN-84", "p": "PHOEN", "t": "Partner 360 for VRM/SVRMs on Phoenix Web", "s": "Requirement Phase", "a": "—", "y": "Task"}, {"k": "PHOEN-69", "p": "PHOEN", "t": "Disposition Popup – Unverified Number Verification CTA", "s": "Requirement Phase", "a": "Sandesh", "y": "Story"}, {"k": "PHOEN-68", "p": "PHOEN", "t": "Phoenix Integration – Number Management Panel CTA", "s": "Requirement Phase", "a": "Sandesh", "y": "Story"}, {"k": "PHOEN-22", "p": "PHOEN", "t": "Abandon Call visibility in Phoenix v2", "s": "Done", "a": "Akash", "y": "Task"}, {"k": "PHOEN-86", "p": "PHOEN", "t": "Phoenix - SLA Priority Bucket for 15-Min Call SLA Enforcement (Onboarding)", "s": "Awaiting Dev", "a": "Akash", "y": "Task"}, {"k": "PBPAR-751", "p": "PBPAR", "t": "SME/HOME- App-  Copy url option on the checkout page", "s": "In Backlog", "a": "Nishant", "y": "Task"}, {"k": "PD-735", "p": "PD", "t": "Express SAOD", "s": "In Progress Design", "a": "Tishika", "y": "Task"}, {"k": "PD-738", "p": "PD", "t": "Design Exploration – Comprehensive Policy Upsell on TP Quotes Page", "s": "TO-DO", "a": "Gaurav", "y": "Task"}, {"k": "PD-737", "p": "PD", "t": "Robots updation and phone number encryption logic change", "s": "TO-DO", "a": "Rajendra", "y": "Task"}, {"k": "PBPAR-737", "p": "PBPAR", "t": "Endorsement Ticket Status Sync Tasks", "s": "Awaiting Dev", "a": "Naman", "y": "Task"}, {"k": "PD-718", "p": "PD", "t": "DMS <> Rev Connect", "s": "In Review", "a": "Vikas", "y": "Task"}, {"k": "PD-734", "p": "PD", "t": "IP Renewal Page: Announcement Banner feature", "s": "In Review", "a": "shubhamparihar", "y": "Task"}, {"k": "POSP-2713", "p": "POSP", "t": "Offline to Online CJ Integration for CV", "s": "DRAFT", "a": "Abhishek", "y": "Story"}];

export const JIRA_CTX = JIRAS.map(j => j.k + "|" + j.s + "|" + String(j.t).slice(0, 60)).join("\n");

export const CODEBASE = `INDEXED SOURCES — Blueprint knowledge layer (Policybazaar / PBPartners)
[phoenix-web · React] [phoenix-api · Java] Phoenix CRM — VRM/SVRM workbench.
Modules + status: Partner 360 (PHOEN-84, in dev — profile APIs owner Tanuj; partner contact data via POSP tickets w/ Sandesh Singh, Ayush Batra), Calling Campaign Engine v1.1 (PHOEN-85 — bucket-based queues, 15-min call SLA tracked but NO proactive breach alert yet; 12-min warning is an open feature pending solution alignment), Renewal redirect Unify→Partner360 (PHOEN-83 — live for motor), Notification panel for quote lifecycle (PHOEN-82), Bottoms-up planning for VRMs (PHOEN-81), Disposition framework (L1/L2 taxonomy, mandatory unclosable post-call modal, write-once per call).
[pbpmitra-app · Flutter] Partner (POSP) app — ticketing (flow owner Asmit), endorsement status, commission view. VRM-chat web notifications: deferred, not specced.
[amigo-core · Python] Amigo Bot — partner assistant. Intents: policy info, commission, ticket status. Latency telemetry exists; calculation methodology undocumented.
[voicebot · transcript-analysis] Outbound voicebot + call transcript pipeline; both depend on dialer-bridge events (owner Santosh).
[dialer-bridge · Node] Connectivity & dialer — call events + transcripts producer. Known gap: pre-connect drops still trigger disposition modal.
[renewals] Life Renewal Solutioning v1 on Phoenix — OPEN: bucket definitions, disposition framework fit, listing-column UX, MIS-vs-API scope contradiction. BU sync pending.
[claims-endorsement] Endorsement/Claims/Ticketing — BMSTICKET queue (assignee Shiva Mehta).
[SLACK] #phoenix-dev #pbp-product #posp-escalations indexed. [JIRA] PHOEN, POSP, PBPAR, PD fully indexed (live list below).
TEAM: Rajiv (lead) — Deepanshu, Sachin, Akash, Aman, Amit, Abhishek, Ankush. PM: Vishal.
CONVENTIONS: dispositions mandatory; minimize per-row CTAs; single-submit flows; reusable copy over vertical-specific.
LIVE JIRA INDEX (200 most recently updated, synced via Rovo MCP):
` + JIRA_CTX;


export const DOCS = [
  { id: "phoenix", tag: "phoenix-web · phoenix-api", title: "Phoenix CRM", fresh: "indexed 2h ago · 0 commits behind",
    one: "VRM/SVRM workbench for the POSP ecosystem — the core surface most features land on.",
    body: `## Overview
Web CRM used by VRMs/SVRMs to manage partner (POSP) relationships: calling queues, profiles, renewals, notifications and dispositions.
## Modules & status
- **Partner 360** — PHOEN-84, in dev. Single partner view: profile, NOP/MIS trends, contact data.
- **Calling Campaign Engine v1.1** — PHOEN-85. Bucket-based queues; assigns partners to VRMs.
- **Renewal redirect (Unify → Partner360)** — PHOEN-83. Live for motor.
- **Notification panel** — PHOEN-82. Quote lifecycle events surfaced in-app.
- **Bottoms-up planning for VRMs** — PHOEN-81.
## Known gaps
- 15-min call SLA is tracked but there is **no proactive breach alert** — a 12-min warning is on the horizon, solution direction pending alignment.
- Pre-connect dialer drops still open the disposition modal (see dialer-bridge).
## Owners
Tech lead **Rajiv**; devs Deepanshu, Sachin, Akash, Aman, Amit, Abhishek, Ankush. PM **Vishal**.` },
  { id: "p360", tag: "partner-profile-service", title: "Partner 360", fresh: "indexed 2h ago",
    one: "Single-pane partner view inside Phoenix — profile, trends, contactability.",
    body: `## Overview
One screen per partner: identity, book of business, NOP/MIS trend, contact data and recent interactions.
## APIs
- partner-profile-service — owner **Tanuj**. Monthly aggregates exposed for trend rendering.
## Dependencies
- Partner contact data sourcing tracked in POSP JIRAs with **Sandesh Singh** and **Ayush Batra**.
## Conventions
- Minimize per-row CTAs; prefer single-submit flows on edits.
## Open items
- 6-month NOP sparkline next to the partner header is drafted but not solutioned.` },
];

export const DRAFTS_SEED = [
  { id: 1, ch: "#phoenix-dev", who: "Vishal", when: "Tue 11:42", size: "S",
    text: "VRMs need an SLA breach warning — banner on the active-call screen at the 12-minute mark (SLA is 15 min). Proactive, not post-facto MIS.", status: "new" },
  { id: 2, ch: "#pbp-product", who: "Rajiv", when: "Tue 09:15", size: "M",
    text: "Partner 360 should show a 6-month NOP trend sparkline next to the partner header. Tanuj's profile APIs may already return monthly aggregates.", status: "new" },
];

export const KCHIPS = [
  "What's in review right now across PBPAR?",
  "Which PHOEN tickets are blocked and why might that be?",
  "Is there any proactive SLA alerting on calls?",
  "What's blocking Life Renewal solutioning?",
];
