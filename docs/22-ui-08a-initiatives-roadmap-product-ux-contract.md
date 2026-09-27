# UI-08A: Initiatives & Roadmap Product & UX Contract

- **Document Version:** `1.0.0`
- **Surface Identifier:** `INT-001` (Initiatives Directory / Portfolio Primary Page), `INT-002` (Initiative Resource Page & Roadmap)
- **Status:** **PHASE 1 PRODUCT ARCHITECTURE + UX CONTRACT — HUMAN REVIEW**
- **Base Git SHA:** `2368de3be1ee06cde2c9aae21362d43249354404`
- **Branch:** `design/ui-08a-initiatives-roadmap-product-ux`
- **Lineage:** `docs/06-complete-page-and-surface-registry.md` $\rightarrow$ `docs/10-ui-02a-application-shell-sidebar-contract.md` $\rightarrow$ `docs/12-ui-03a-my-work-product-ux-contract.md` $\rightarrow$ `docs/14-ui-04a-personal-inbox-product-ux-contract.md` $\rightarrow$ `docs/16-ui-05a-team-hub-product-ux-contract.md` $\rightarrow$ `docs/18-ui-06a-docs-knowledge-product-ux-contract.md` $\rightarrow$ `docs/20-ui-07a-projects-product-ux-contract.md` $\rightarrow$ `docs/22-ui-08a-initiatives-roadmap-product-ux-contract.md`

---

## 1. Executive Summary & Purpose

An **Initiative** in Orynqo is a first-class, workspace-scoped strategic coordination resource designed to align, monitor, and visualize multiple canonical Projects toward a significant, multi-quarter strategic outcome:

$$\text{Initiative} = \text{Strategic coordination umbrella over canonical Projects}$$

### 1.1 What an Initiative IS
- **A Strategic Coordination Umbrella:** Represents a major investment theme, multi-team business outcome, company-wide program, or multi-project product objective (e.g., *Self-Serve Enterprise Expansion*, *Mobile-First Transformation*, *Zero-Trust Security Architecture*).
- **A Portfolio Aggregator over Canonical Projects:** Coordinates $0..N$ canonical Projects (`PRJ-001`), synthesizing strategic progress, combined temporal timelines, and cross-project health signals without cloning or owning duplicate project execution state.
- **A Single Temporal Horizon:** Defines a high-level target window (e.g., *Q3 2026*, *H2 2026*, or explicit date range) against which underlying project schedules are calibrated and visualized.
- **An Asynchronous Strategic Alignment Vehicle:** Hosts its own historical narrative snapshots (**Initiative Updates**) authored by strategic leads for leadership and cross-functional stakeholders.
- **The Contextual Host for the Strategic Roadmap:** Drives the **Roadmap** projection, a high-density, multi-quarter temporal planning surface visualizing Initiative horizons, contributing Project delivery windows, milestone release gates, and blocking dependency lines.

### 1.2 What an Initiative IS NOT
- **NOT a folder or containment box containing duplicate Projects:** Projects remain autonomous workspace resources; removing a Project from an Initiative never mutates, archives, or deletes the Project.
- **NOT a new ownership hierarchy above Teams and WorkItems:** The canonical ownership hierarchy remains strictly:
  $$\text{Organization} \rightarrow \text{Workspace} \rightarrow \{\text{Teams, Initiatives, Projects, Cycles, Documents, WorkItems}\}$$
  Initiatives never own WorkItems or Teams.
- **NOT an arbitrary, black-box AI score generator:** Strategic health is explicitly human-curated by authorized initiative leads; supporting project signals (e.g., at-risk projects, overdue milestones) serve purely as visible context, never silently overriding human judgment.
- **NOT a Gantt auto-scheduling or critical-path calculator:** Orynqo's roadmap is a high-density, truthful human planning projection, not an algorithmic construction engine.
- **NOT a Document or Wiki:** Strategic charters and architecture living specs remain canonical `Document` entities (`DOC-002`); an Initiative coordinates operational outcomes.
- **NOT Goals or OKRs:** OKRs and high-level company goals (`INT-003`) sit above Initiatives and remain explicitly categorized as **FUTURE**.

---

## 2. Competitive Reference Pass & Synthesis

To design a world-class strategic portfolio and roadmap experience, we analyzed the public patterns, capabilities, and failure modes of mature systems (Linear, Jira Plans / Advanced Roadmaps, Asana Portfolios, ClickUp, Monday, and Notion):

```text
Observed Competitor Pattern
| Linear Initiatives & Roadmaps
| Jira Plans / Advanced Roadmaps
| Asana Portfolios
| ClickUp / Monday
| Orynqo Decision
| Rationale
```

| Observed Dimension | Competitor Patterns | Orynqo Decision | Rejected Pattern & Reason |
| :--- | :--- | :--- | :--- |
| **Initiative vs Project Semantics** | Linear: Initiatives group Projects; Roadmaps visualize them.<br>Jira: Initiatives sit as epics-of-epics in arbitrary issue-hierarchy schemes.<br>Asana: Portfolios aggregate Projects with status updates.<br>Monday: High-level boards mirror low-level boards via linked columns. | **Workspace Strategic Resource:** Initiative is a first-class workspace entity grouping $0..N$ canonical Projects. | *Rejected: Jira issue-type hierarchy (`Initiative -> Epic -> Story`).*<br>Treating Initiatives as giant tasks creates severe operational friction, forces arbitrary issue typing, and breaks team autonomy. |
| **Project Cardinality & Tenancy** | Linear: Project belongs to 0..1 Initiative.<br>Asana: Projects can be multi-homed into multiple Portfolios.<br>Monday: Projects can be mirrored across endless dashboards. | **Canonical Single Association:** $0..1$ Initiative per Project (`Project.initiativeId`). Initiative has $0..N$ Projects. | *Rejected: Multi-homing Projects across multiple Initiatives.*<br>Multi-homing creates ambiguous strategic ownership, double-counted portfolio progress, conflicting roadmaps, and fragmented executive reporting. |
| **Execution State Ownership** | Jira: Advanced Roadmaps frequently clones or re-indexes issue fields, creating desynchronization with Jira Software boards.<br>ClickUp: Mirroring items creates duplicate sync latency. | **Zero Duplicated Execution Data:** Initiatives reference canonical Project identities. Project state, health, dates, teams, and progress are queried directly. | *Rejected: InitiativeProject clone entity.*<br>Cloning project execution attributes into an initiative schema causes stale data, dual-write bugs, and conflicting truths between engineers and leadership. |
| **Roadmap Visualization** | Linear: Clean horizontal timeline of Initiatives and nested Project bars.<br>Jira: Complex Gantt timeline with auto-scheduler and resource leveling.<br>Asana: Visual portfolio timeline with milestone flags. | **Projection, Not Domain Entity:** Roadmap is a high-density, multi-quarter temporal projection over canonical Initiatives and Projects. | *Rejected: Independent `RoadmapItem` or algorithmic auto-scheduler.*<br>Auto-scheduling silently mutates underlying project dates, destroying engineering commitments. Roadmap is a visual reflection of explicit human commitments. |
| **Progress Rollup** | Linear: Scope completion % across projects or manual project count.<br>Asana: % of milestones or tasks completed across portfolio.<br>Jira: Story point rollups or issue count progress bars. | **Dual Transparent Progress Metric:**<br>1. *Shipped Projects Ratio:* $P_{\text{completed}} / P_{\text{total}}$ projects.<br>2. *Aggregate WorkItem Ratio:* $\sum M / \sum N$ items ($X\%$).<br>Zero-leakage filtered per viewer. | *Rejected: Black-box weighted point formulas or opaque percentages.*<br>Averaging percentages across projects produces deceptive mathematical precision (e.g., a 2-item project weighted equally to a 200-item project). Numerator and denominator must always be exposed. |
| **Strategic Health** | Asana: Portfolio status updates with On Track, At Risk, Off Track.<br>Linear: Project updates rollup to Initiative updates.<br>Jira: Status categories derived from workflow states. | **Human-Curated Health + Transparent Supporting Signals:** Initiative lead curates health (`unset`, `on_track`, `at_risk`, `off_track`); UI displays objective risk signals (e.g., overdue projects). | *Rejected: Automated algorithmic health calculation.*<br>Algorithmic health scores generate false positives, mask nuance, and disincentivize transparent risk disclosure by teams. |
| **Cross-Team Coordination** | Jira: Team field or board assignment.<br>Linear: Projects retain participating teams; Initiative rolls them up.<br>Monday: People/team columns with automations. | **Purely Derived Team Participation:** Initiative participating teams are the unique union of participating teams across associated Projects. | *Rejected: Independent Initiative-Team assignment.*<br>Creating a separate team assignment on Initiatives dissociates strategic planning from actual project execution commitments. |
| **Initiative Dependencies** | Jira: Cross-project and cross-plan dependency lines with warning flags.<br>Asana: Dependency links between projects.<br>Linear: Project-level dependencies. | **Deferred to POST-CORE:** Core relies on canonical Project-level dependencies (`PRJ-006`); cross-Initiative dependencies deferred. | *Rejected: Forcing Initiative dependencies into CORE.*<br>95% of strategic blockers occur at the deliverable (Project/Milestone) level. Adding high-level initiative dependencies in CORE adds graph complexity without operational clarity. |
| **Updates & Narrative** | Linear: Initiative Updates with narrative, health, and Slack notification.<br>Asana: Portfolio Status Updates with progress snapshots. | **Canonical Initiative Updates:** Historical, immutable narrative snapshots with health, target window, and highlights/blockers. | *Rejected: Ephemeral comment threads or unstructured wiki notes.*<br>Strategic stakeholders require an authoritative, chronological audit trail of executive updates. |
| **Scalability & Large Portfolios** | Jira: Advanced Roadmaps notoriously suffers from browser slowdowns with >500 issues.<br>Linear: Fast virtualized roadmaps and grouped table views. | **High-Density Virtualized Surfaces:** Server-compatible cursor pagination, windowed timeline rendering, bounded date ranges, lazy-loaded sub-projects. | *Rejected: Client-side mega-context loading all workspace projects.*<br>Large enterprise workspaces have thousands of projects; directory and roadmap must operate on bounded, authorization-filtered queries. |

---

## 3. Orynqo Domain Boundary & Integrity Laws

### 3.1 Workspace Containment Law
Initiatives exist strictly as peer resources within a Workspace:

```text
Organization
└── Workspace
    ├── Teams          (Permanent functional execution units)
    ├── Initiatives    (Strategic coordination umbrellas)
    ├── Projects       (Bounded cross-functional delivery units)
    ├── Cycles         (Team-owned iterative execution timeboxes)
    ├── Documents      (Canonical Living Specs, RFCs, Runbooks)
    └── WorkItems      (Canonical atomic execution deliverables)
```

> **CRITICAL DOMAIN INVARIANT:** Initiatives DO NOT contain Projects as a private child hierarchy.
> Projects are autonomous workspace entities that associate with $0..1$ Initiative.

```text
False Hierarchy (STRICTLY PROHIBITED):
Initiative ──owns──> Project ──owns──> Team ──owns──> WorkItem

Canonical Invariant (ENFORCED):
Initiative ──coordinates (0..N)──> Project (0..1 Initiative)
                                      ├── participating Teams: 0..N
                                      ├── WorkItems: 0..N (each owned by exactly 1 Team)
                                      ├── Milestones: 0..N (owned by Project)
                                      └── Documents: 0..N (canonical association)
```

### 3.2 Immutability of Underlying Project & Team State
Associating or dissociating a Project to/from an Initiative:
1. **Never mutates** `Project.participatingTeamIds` or `Project.leadTeamId`.
2. **Never mutates** `WorkItem.teamId` or `WorkItem.projectId`.
3. **Never mutates** Project Milestones (`PRJ-004`) or Project Updates (`PRJ-001`).
4. **Never alters** Project operational state (`planned`, `in_progress`, etc.) or archive state (`active`, `archived`).
5. **Never deletes or archives** the Project.

---

## 4. Canonical Initiative Model (Storage-Neutral)

An Initiative is defined as a semantic workspace resource. The canonical model is intentionally storage-neutral and does not freeze database schemas, column names, or network envelopes:

```text
Initiative
├── identity (immutable, unique resource handle)
├── workspace tenancy (authoritative workspace scope)
├── human-readable reference / identifier (stable reference, e.g. INT-001, for search, mentions, URLs)
├── name (required string, strategic outcome title)
├── optional summary / strategic narrative (markdown charter outlining strategic intent and success criteria)
├── optional owner (single accountable user handle)
├── operational state ('planned' | 'active' | 'paused' | 'completed' | 'cancelled')
├── archive state ('active' | 'archived')
├── health assessment ('unset' | 'on_track' | 'at_risk' | 'off_track')
├── temporal horizon (structured planning window: target date, quarter, half, or date range)
├── associated Projects (canonical query projection of Projects where project.initiativeId == initiative.id)
├── derived participating Teams (unique set of participating teams across associated Projects)
├── Initiative Updates (chronological log of published strategic narrative updates)
├── access policy (workspace-visible vs restricted access grants)
└── derived activity (chronological stream of meaningful Initiative domain events)
```

### Invariants:
1. **Workspace Tenancy:** Every Initiative belongs to exactly one Workspace. Cross-workspace initiatives are strictly prohibited in CORE.
2. **Stable Reference:** Every Initiative possesses a unique, stable human-readable reference (e.g., `INT-12`) used for quick-switcher search, entity mentions (`@[initiative:ref:title]`), and URL routing.
3. **Optimistic Concurrency:** All Initiative metadata mutations require optimistic revision validation (e.g., version token or integer) to prevent silent overwrite of concurrent edits.
4. **Zero Duplicate Storage:** Associated projects are resolved via canonical Project foreign key (`project.initiativeId`) or relation table, never stored as cloned JSON blobs inside the Initiative record.

---

## 5. Initiative ↔ Project Relationship & Cardinality

### 5.1 The 0..1 Invariant
As frozen in UI-07A section 10.1:
$$\text{Project} \rightarrow \text{Initiative} = 0..1$$
$$\text{Initiative} \rightarrow \text{Projects} = 0..N$$

- A Project may exist without an Initiative (`project.initiativeId = null`).
- A Project may belong to at most one Initiative at any time.
- Attempting to associate a Project that already belongs to another Initiative requires an explicit confirmation from the user to reassign it:
  *"Project 'Mobile Checkout V2' is currently aligned with Initiative 'Q2 Mobile Polish'. Reassign it to 'Enterprise Expansion'?"*

### 5.2 Association & Dissociation Lifecycle
- **Association:** Sets `project.initiativeId = initiative.id`. This operation is an authorized Project mutation delegating to the Project domain boundary.
- **Dissociation:** Sets `project.initiativeId = null`. The Project becomes a standalone workspace project.
- **Project Archive / Completion:** If an associated Project is archived or completed, it remains associated with the Initiative for historical fidelity, but is visually distinguished in the portfolio and roadmap.
- **Initiative Archive:** Archiving an Initiative does **NOT** archive or alter associated Projects; they remain active in the workspace and retain their association link for historical audits.

---

## 6. State, Health & Progress

Orynqo enforces a strict orthogonal separation between execution lifecycle, retention/visibility, subjective strategic confidence, and empirical progress:

```text
┌──────────────────┬──────────────────────────────────────────┬─────────────────────────────────────┐
│ Dimension        │ Allowed Values                           │ Operational Meaning                 │
├──────────────────┼──────────────────────────────────────────┼─────────────────────────────────────┤
│ 1. Operational   │ planned | active | paused |              │ Strategic delivery lifecycle phase  │
│    State         │ completed | cancelled                    │                                     │
│ 2. Archive State │ active | archived                        │ Visibility / retention state        │
│ 3. Health        │ unset | on_track | at_risk | off_track   │ Human-curated strategic confidence  │
│ 4. Progress      │ 1. Shipped Projects: P_comp / P_tot      │ Empirical dual completion metrics   │
│                  │ 2. Aggregate Work: M / N items (X%)      │ (never an ungrounded single score)  │
└──────────────────┴──────────────────────────────────────────┴─────────────────────────────────────┘
```

### 6.1 Strategic Operational State
Unlike low-level tasks or projects that use `in_progress`, Initiatives represent high-level strategic programs. We define standard strategic operational vocabulary:
- `planned`: Strategic charter defined, outcomes scoped, projects being aligned; execution has not begun.
- `active`: Coordinated execution is underway across contributing projects.
- `paused`: Temporarily halted pending executive review, funding, or organizational reprioritization.
- `completed`: All intended strategic outcomes delivered.
- `cancelled`: Program terminated or abandoned without delivering full outcome.

### 6.2 Archive State
- `active`: Normal initiative visible in default portfolio directory, roadmaps, and pickers.
- `archived`: Historical or abandoned initiative removed from active discovery. Read-only, fully reversible.

### 6.3 Strategic Health Assessment
- **Human-Curated:** Health (`unset`, `on_track`, `at_risk`, `off_track`) is set deliberately by the Initiative Owner or authorized lead, typically when publishing an **Initiative Update**.
- **Defaults:**
  - New/planned initiatives default to `unset`.
  - Health is primarily relevant for `active` initiatives.
- **Supporting Risk Signals (Non-Overriding):**
  The UI surfaces objective project-level signals alongside the curated health:
  - Count of associated Projects marked `at_risk` or `off_track`.
  - Count of associated Projects with overdue target dates.
  - Count of associated Projects with active blocker dependencies.
  - Presence of stale Project Updates (>30 days since last update).
  > **INVARIANT:** Supporting signals inform the human lead; they NEVER automatically mutate or override the curated Initiative health.

### 6.4 Progress Semantics & Zero-Leakage Policy
Initiative progress must avoid false mathematical certainty. Averaging arbitrary percentages across disparate projects is misleading. Orynqo exposes a **dual empirical metric**:

1. **Project Completion Ratio (Primary Milestone Metric):**
   $$\text{Project Progress} = \frac{\text{Completed Accessible Projects}}{\text{Total Active + Completed Accessible Projects}}$$
   - Excludes `cancelled` and `archived` projects from the denominator.
   - Formatted as: `3 of 7 projects completed (43%)`.

2. **Aggregate WorkItem Ratio (Secondary Execution Depth Metric):**
   $$\text{WorkItem Progress} = \frac{\sum \text{Completed Accessible WorkItems}}{\sum \text{Total Included Accessible WorkItems}}$$
   - Aggregates canonical WorkItems across all associated accessible projects.
   - Excludes cancelled/archived work items.
   - Formatted as: `142 / 210 items (68%)`.

#### Zero-Leakage Invariants:
- If a viewing user lacks permission to access Project X within an Initiative:
  1. Project X is completely excluded from the project count numerator and denominator.
  2. Project X's WorkItems are completely excluded from the aggregate item ratio.
  3. No metadata (title, dates, health) of Project X is exposed.
- If an Initiative has zero accessible projects, progress displays: `No projects aligned` (never `0%` or `NaN`).

---

## 7. Temporal Planning Model & Horizons

Initiatives coordinate long-range outcomes that often span multiple quarters. High-level planning requires flexible yet structured temporal horizons.

### 7.1 Temporal Horizon Semantics
An Initiative's temporal horizon can be expressed in one of four structured formats:
1. **Quarter Horizon:** (e.g., `Q3 2026`, `Q4 2026`) — Standard strategic planning cadence.
2. **Half-Year Horizon:** (e.g., `H1 2026`, `H2 2026`) — Long-range executive themes.
3. **Explicit Date Range:** (`startDate` to `targetDate`, e.g., `2026-07-01` to `2026-11-30`) — Precise program timelines.
4. **Target Only:** (e.g., Target: `2026-12-15`) — Deadline-driven initiative.
5. **Unscheduled:** (Horizon unset) — Discovery or backlog initiatives without a committed delivery window.

### 7.2 Relationship Between Initiative Horizon & Project Dates
- **Alignment Context, Not Hard Constraint:** An Initiative horizon does not physically clip or force project start/target dates.
- **Visual Calibration on Roadmap:** The Roadmap projection visually plots the Initiative horizon bar alongside the individual bars of its contributing Projects.
- **Mismatch Warnings:** If an associated Project's target date extends beyond the Initiative's target horizon, the UI surfaces a non-blocking alignment indicator:
  *"Project target (Dec 2026) exceeds Initiative horizon (Q3 2026)"*.

---

## 8. Canonical Initiative Updates

Asynchronous strategic alignment is driven by historical, published narrative updates.

### 8.1 Semantic Model
```text
Initiative Update
├── identity (immutable unique handle)
├── initiativeId (authoritative parent initiative)
├── author (user handle of updater)
├── publishedAt (ISO timestamp)
├── narrative (rich text markdown: achievements, focus, strategic context)
├── healthSnapshot ('on_track' | 'at_risk' | 'off_track')
├── horizonSnapshot (temporal horizon at time of update)
├── structuredHighlights (optional key milestones achieved)
├── structuredBlockers (optional major program-level risks)
└── relationship to activity (emits an ActivityEvent)
```

### 8.2 Operational & Mutation Rules
- **Health Synchronization:** Publishing an Initiative Update sets the parent Initiative's `health` to the update's `healthSnapshot`.
- **Target Horizon Preservation:** Publishing an update snapshots the horizon for historical record, but does **NOT** silently mutate the Initiative's authoritative horizon. Changing the horizon remains an explicit mutation.
- **Immutable History:** Published updates are historical records. Authors may edit typos within an implementation-tunable grace period (e.g., 30 minutes); thereafter, updates are permanently read-only.
- **Zero Leakage in Updates:** Mentions of restricted projects or documents in update text must be sanitized or masked for unauthorized viewers.

---

## 9. INT-001: Initiatives Directory / Portfolio Primary Page

`INT-001` is the primary workspace discovery and portfolio cockpit for browsing and filtering all strategic initiatives.

### 9.1 High-Density Portfolio Table Columns
1. **Reference & Title:** Human-readable reference (`INT-14`), title, and quick link.
2. **Owner:** Avatar and display name of the single accountable owner.
3. **Operational State:** Semantic badge (`Planned`, `Active`, `Paused`, `Completed`, `Cancelled`).
4. **Health:** Semantic health badge with non-color-only icons (`On Track`, `At Risk`, `Off Track`, `Unset`).
5. **Horizon:** Planned window (e.g., `Q3 2026`, `Jul - Nov 2026`, `Unscheduled`).
6. **Projects Summary:** Transparent count badge: `X projects` (with mini completion indicator).
7. **Participating Teams:** Avatars/badges of contributing squads derived from associated projects.
8. **Empirical Progress:** Ratio and bar: `3/7 projects • 43%`.
9. **Latest Update:** Date of last published update and author.

### 9.2 Portfolio Facet & Filter Controls
- **State Filter:** `All`, `Active` (default), `Planned`, `Paused`, `Completed`, `Cancelled`, `Archived`.
- **Health Filter:** `All`, `On Track`, `At Risk`, `Off Track`, `Unset`.
- **Owner Filter:** Multi-select user picker or `Owned by Me`.
- **Team Involvement Filter:** Filter initiatives where Team X is a contributing squad.
- **Horizon Filter:** `Current Quarter`, `Next Quarter`, `This Year`, `Unscheduled`.
- **Search:** Instant fuzzy search matching Reference, Title, and Strategic Summary.

### 9.3 Portfolio Views
- **Table / List View (Default):** High-density, sortable table for operational portfolio reviews.
- **Roadmap View:** Direct toggle to switch from directory table to the global workspace Roadmap projection.

---

## 10. INT-002: Initiative Resource Page & Contextual Sub-Surfaces

`INT-002` is the dedicated resource page for managing a single strategic initiative. It follows the standard Orynqo resource layout:
$$\text{Sidebar (WHERE)} \rightarrow \text{Initiative Header (Identity \& Core State)} \rightarrow \text{Resource Tabs (WHAT)}$$

### 10.1 Initiative Header Region
- Stable reference badge (`INT-14`) + Title (inline editable with optimistic concurrency).
- Owner selector (with quick-assign to self).
- Operational State dropdown (`Planned`, `Active`, `Paused`, `Completed`, `Cancelled`).
- Health dropdown (`On Track`, `At Risk`, `Off Track`, `Unset`).
- Horizon picker (Quarter, Half, Date Range, Unscheduled).
- Primary actions: `Post Update`, `Add Project`, `Favorite (★)`, `Settings / More (...)`.

### 10.2 Resource Sub-Surfaces (Tabs)
To prevent navigation fragmentation while maintaining clear information hierarchy, `INT-002` freezes exactly **five** dedicated tabs:

```text
┌───────────────┬──────────────────────────────────────────────────────────────────┐
│ Tab           │ Architectural Purpose & Information Scope                        │
├───────────────┼──────────────────────────────────────────────────────────────────┤
│ 1. Overview   │ Strategic cockpit: charter narrative, key metrics, latest update,│
│               │ project health matrix, contributing squads, blocker summary.     │
│ 2. Projects   │ High-density list of canonical associated Projects with progress,│
│               │ lead teams, milestones rollup, and quick association trigger.   │
│ 3. Roadmap    │ Temporal Gantt-style planning projection showing Initiative      │
│               │ horizon and expandable Project timelines with milestone gates.   │
│ 4. Updates    │ Chronological historical feed of all published strategic updates │
│               │ with narrative, health snapshots, and author stamps.            │
│ 5. Activity   │ Audit stream of canonical ActivityEvents (state changes, project │
│               │ additions/removals, horizon adjustments).                        │
└───────────────┴──────────────────────────────────────────────────────────────────┘
```

> **TAB JUSTIFICATION & EXCLUSIONS:**
> - *Why no Docs tab?* Strategic docs associate with contributing Projects or exist in Docs Hub (`DOC-001`). Relevant charter documents link directly in the Overview narrative.
> - *Why no Work tab?* WorkItems belong to Teams and Projects. An Initiative is not an execution backlog; drilling into work occurs through the Projects tab.
> - *Settings tab merged into progressive disclosure:* Archive, rename, and dissociation actions live in header action menus and Project tab rows, eliminating an empty settings tab.

---

## 11. Roadmap Projection Architecture

The **Roadmap** is a **projection**, not a standalone domain entity. It synthesizes canonical Initiatives, canonical Projects, and their temporal attributes into an interactive multi-quarter visual timeline.

### 11.1 Projection Synthesis
$$\text{Roadmap} = \mathcal{P}(\text{Initiatives}, \text{Projects}, \text{Dependencies}, \text{Temporal Horizons}, \text{Viewer Permissions})$$

```text
2026                       Q2 2026                    Q3 2026                    Q4 2026
---------------------------------------------------------------------------------------------------
▼ [INT-01] Enterprise Auth ═══════════════════════════════════════════════════════════════════►
  ├─ [PRJ-01] SAML 2.0 Engine      [====== M1 ====== M2 ======]
  ├─ [PRJ-02] SCIM Provisioning               [======= M1 =======]
  └─ [PRJ-03] Audit Log V2                                   [=============]
---------------------------------------------------------------------------------------------------
► [INT-02] Mobile Optimization                               [═══════════════════════════════►]
---------------------------------------------------------------------------------------------------
▼ Unaligned Projects (Filterable)
  ├─ [PRJ-08] Internal CI Tooling  [============]
---------------------------------------------------------------------------------------------------
```

### 11.2 Hierarchy & Expansion
- **Initiative Row (Parent):** Displays the Initiative horizon bar, overall health badge, and progress ratio. Clicking expands/collapses contributing Projects.
- **Project Row (Child):** Displays the canonical Project timeline bar (`startDate` to `targetDate`), Project Lead Team badge, operational state, and Milestone markers.
- **Milestone Markers:** Small milestone flags/dots positioned along the Project bar at their respective `targetDate`.
- **Dependency Curves:** Visual connector lines between Projects indicating canonical `blocks` relationships (`Project A -> blocks -> Project B`).
- **Unaligned Projects Section:** An optional, collapsible bottom bucket for workspace projects not currently associated with any Initiative, facilitating drag-to-align planning.

### 11.3 Temporal Modes & Zoom Levels
- **Quarter View (Default):** Shows 4 to 6 quarters (Months labeled within quarters).
- **Month View:** Shows 6 to 12 months with bi-weekly grid lines.
- **Year View:** High-level 2-to-3 year strategic horizon.
- **Current Day Marker:** Prominent vertical indicator showing today's position across all timelines.

### 11.4 Truthful Unscheduled Handling
- **Unscheduled Initiative:** Appears in an expandable "Unscheduled Initiatives" drawer/section at the top or bottom of the roadmap with clear badge: `No horizon set`.
- **Unscheduled Project:** If an associated Project lacks start/target dates, it renders in an "Unscheduled Projects" tray under its parent Initiative:
  *"2 projects have no target dates [Schedule on Roadmap]"*.
- **No Fabricated Timeline Placement:** Orynqo **NEVER** places unscheduled items at today's date or an arbitrary default date on the timeline.

---

## 12. Roadmap Interaction & Mutation Delegation Model

The Roadmap is an interactive planning surface. However, to maintain architectural integrity, the Roadmap **never owns local date state or bypasses domain boundaries**:

```text
Roadmap User Action
        │
        ▼
[Action Classifier]
        │
        ├─ Adjust Initiative Horizon ──► Authoritative Initiative Mutation Boundary (validate optimistic lock)
        │
        ├─ Adjust Project Dates      ──► Authoritative Project Mutation Boundary (validate permissions & version)
        │
        ├─ Associate Project to Init ──► Authoritative Project Mutation Boundary (set project.initiativeId)
        │
        └─ Create Project Dependency ──► Authoritative Project Dependency Boundary (validate cycle & permissions)
        │
        ▼
Canonical State Updated & Re-projected to Roadmap View
```

### Invariants:
1. **Delegated Project Mutation:** Dragging a Project bar's edge to change its target date directly calls `projectService.updateProject(projectId, { targetDate, version })`. If the user lacks `canEditProject`, the drag action is disabled.
2. **Optimistic Concurrency & Rollback:** If a concurrent user modified the project remotely, the roadmap rejects the edit, reverts the visual bar to canonical position, and surfaces a conflict notification.
3. **No Unintentional Cascades:** Rescheduling a Project does NOT automatically reschedule dependent projects; dependency violation badges are displayed instead, preserving intentional human scheduling.

---

## 13. Risk & Health Supporting Signals

Initiatives aggregate and surface objective risk signals derived from underlying projects to assist leadership during strategic reviews:

```text
┌──────────────────────────┬─────────────────────────────────────────────────────────────┐
│ Risk Signal              │ Trigger Condition & Presentation                            │
├──────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 1. At-Risk Projects      │ Count of associated Projects with health == 'at_risk'.      │
│ 2. Off-Track Projects    │ Count of associated Projects with health == 'off_track'.    │
│ 3. Target Mismatch       │ Associated Project targetDate > Initiative horizon end.     │
│ 4. Blocked Projects      │ Project has unresolved incoming dependency ('isBlockedBy'). │
│ 5. Overdue Deliverables  │ Project has active milestones with targetDate < today.      │
│ 6. Stale Project Updates │ Associated Project has had no update published in >30 days. │
└──────────────────────────┴─────────────────────────────────────────────────────────────┘
```

These signals are displayed in the `Overview` tab and summarized in header risk indicators, empowering leads to address blockers proactively.

---

## 14. Activity Integration

Initiatives integrate natively with the canonical `ActivityEvent` stream:
- `initiative.created`: Initiative initialized with title and horizon.
- `initiative.owner_changed`: Accountability transferred to new owner.
- `initiative.state_changed`: Transition between `planned`, `active`, `paused`, `completed`, `cancelled`.
- `initiative.health_changed`: Health updated manually or via update publication.
- `initiative.horizon_changed`: Planning window shifted or rescheduled.
- `initiative.project_associated`: Project linked to this initiative.
- `initiative.project_dissociated`: Project unlinked from this initiative.
- `initiative.update_published`: New strategic narrative update published.
- `initiative.archived` / `initiative.restored`: Visibility state toggled.

Activity events are query-projected inside `INT-002: Activity` and bubble up to global audit queries where authorized.

---

## 15. Authorization & Zero-Leakage Invariants

Initiative security adheres to strict multi-tenant workspace authorization and pre-render filtering.

### 15.1 Semantic Capabilities
- `canViewInitiative`: Read access to initiative metadata, overview, updates, and roadmap.
- `canCreateInitiative`: Permission to initialize a new initiative in the workspace.
- `canEditInitiative`: Permission to update name, narrative, owner, horizon, and state.
- `canManageInitiativeProjects`: Permission to link or unlink projects to/from this initiative.
- `canPostInitiativeUpdate`: Permission to publish an authoritative Initiative Update.
- `canCompleteInitiative`: Permission to mark the initiative `completed` or `cancelled`.
- `canArchiveInitiative`: Permission to archive or restore the initiative.

### 15.2 Zero-Leakage Rules Across Projections
1. **Restricted Projects Exclusion:** If a user lacks `canViewProject` for Project P:
   - Project P is completely omitted from the Initiative's Projects tab.
   - Project P does not render on the Roadmap timeline.
   - Project P's WorkItems are omitted from the aggregate progress metric.
   - Project P's health is omitted from risk signal tallies.
   - Project P's participating teams are omitted from derived team rollups.
2. **Restricted Initiative Exclusion:** If an Initiative is marked restricted, it is completely invisible in `INT-001` directory, global roadmaps, search results, and pickers for unauthorized workspace members.

---

## 16. Completion & Archive Semantics

### 16.1 Completing an Initiative
- **Outcome Achieved:** Marking an Initiative `completed` transitions its operational state to `completed`.
- **Non-Cascading Law:** Completing an Initiative **DOES NOT**:
  - Silently complete associated Projects.
  - Silently complete or archive WorkItems.
  - Silently complete Milestones.
  - Silently mutate Cycle contents.
- **Incomplete Projects Warning:** If incomplete projects remain, the user is presented with a non-blocking confirmation dialog:
  *"Initiative 'Enterprise Expansion' has 3 incomplete projects. Completing the Initiative will mark the strategic program as finished while leaving underlying projects active for contributing teams. Proceed?"*
- **Reopening:** A completed initiative can be reopened to `active` at any time with full preservation of history.

### 16.2 Archiving an Initiative
- Transitions `archiveState` to `archived`.
- Removes the initiative from default directory lists, active roadmap timelines, and association pickers.
- Preserves all historical updates, activity events, and project links.
- Does **NOT** archive associated Projects.
- Fully reversible via `Restore Initiative`.

---

## 17. Favorites, Command Palette & Global Search

### 17.1 Favorites Integration
- Reuses the canonical `useFavorites` architecture (`FAV-001`).
- Star button in `INT-002` header toggles favorite state for `entityType = 'initiative'`.
- Favorited initiatives appear in the global Sidebar under Favorites (`WHERE`).

### 17.2 Command Palette & Global Search (`CMD-001`)
- **Semantic Commands:**
  - `Initiatives: Open Directory` (Navigates to `INT-001`)
  - `Initiatives: Open Roadmap` (Navigates to global Roadmap)
  - `Initiatives: Create Initiative` (Opens Quick Create modal)
  - `Initiatives: Post Update` (When viewing `INT-002`)
- **Searchable Attributes:**
  - Stable Reference (`INT-14`)
  - Title & Description
  - Owner name
- Search queries execute pre-render permission filtering.

---

## 18. Responsive, Keyboard & Accessibility Semantics

### 18.1 Responsive Viewport Adaptations
- **Wide (>1280px):** Full dual-pane roadmap planning environment with sidebar and high-density timeline controls.
- **Medium (768px - 1279px):** Overview switches to single-column card stack; roadmap enables horizontal scrolling with frozen initiative title column.
- **Compact / Mobile (<768px):** Directory and Projects switch to mobile card list; Roadmap provides a simplified list-by-quarter view instead of an overflowing horizontal canvas.

### 18.2 Keyboard Interaction Model
- `j` / `k` or `Up` / `Down`: Move selection through directory rows or roadmap bars.
- `Enter`: Open focused Initiative or Project.
- `c`: Trigger Quick Create (when in global or directory scope).
- `[` / `]`: Collapse / Expand focused Initiative row on Roadmap.
- `1` - `5`: Direct tab switching on `INT-002` (`1: Overview`, `2: Projects`, `3: Roadmap`, etc.).
- Input Isolation: When typing inside inputs or search boxes, single-key navigation is strictly suppressed.

### 18.3 Accessibility & WCAG 2.2 AA Compliance
- **Non-Color Indicators:** Health badges combine distinct shapes/icons with text labels (e.g., green check for on-track, amber triangle for at-risk, red octagon for off-track).
- **Roadmap Screen-Reader Alternative:** The Roadmap table provides an accessible, hidden data table alternative detailing start dates, target quarters, and completion ratios.
- **Focus Management:** Modal closes and drawer dismissals deterministically return focus to the invoking DOM trigger element.

---

## 19. Technology-Neutral Query Contracts

To ensure scalable backend integration, UI-08 defines seven technology-neutral query capabilities:

```text
1. queryInitiatives(workspaceId, filters, sort, cursor, limit)
   -> Returns paginated list of Initiatives with owner, state, health, horizon, and pre-computed project counts.

2. getInitiativeDetail(initiativeId)
   -> Returns canonical Initiative record with charter narrative and permission flags.

3. queryInitiativeProjects(initiativeId, filters, sort)
   -> Returns canonical Projects where project.initiativeId == initiativeId with lead team and progress.

4. queryRoadmapProjection(workspaceId, horizonRange, filters)
   -> Returns streaming/paginated Initiative and Project temporal intervals with dependency edges.

5. queryInitiativeUpdates(initiativeId, limit)
   -> Returns chronological list of published InitiativeUpdates.

6. queryInitiativeActivity(initiativeId, cursor, limit)
   -> Returns paginated ActivityEvents for the initiative.

7. queryInitiativeRiskSignals(initiativeId)
   -> Returns counts of at-risk, overdue, and blocked associated projects.
```

---

## 20. Mutation Ownership & Domain Delegation

To prevent boundary corruption, mutation responsibilities are strictly partitioned:

```text
┌───────────────────────────────────────────────┬────────────────────────────────────────────┐
│ Mutation Operation                            │ Authoritative Owning Domain                │
├───────────────────────────────────────────────┼────────────────────────────────────────────┤
│ Create / Edit / Archive Initiative            │ Initiative Domain (`initiativeService`)    │
│ Publish Initiative Update                     │ Initiative Domain (`initiativeService`)    │
│ Set / Change Initiative Health                │ Initiative Domain (`initiativeService`)    │
│ Set / Change Initiative Horizon               │ Initiative Domain (`initiativeService`)    │
│ Associate / Dissociate Project to Initiative  │ Project Domain (`project.initiativeId`)    │
│ Update Project Dates / Health / State         │ Project Domain (`projectService`)          │
│ Create / Delete Project Dependency            │ Project Domain (`projectDependencyService`)│
│ Mutate WorkItem Attributes                    │ WorkItem Domain (`workItemService`)        │
│ Star / Favorite Initiative                    │ Favorite Domain (`favoriteService`)        │
└───────────────────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 21. Failure, Empty & Concurrency States

### 21.1 Failure States
- **Initiative Not Found / Permission Revoked:** Surfaces zero-leakage error view: *"Initiative not found or you lack permission to view it."* with CTA to return to directory.
- **Optimistic Concurrency Conflict:** Stale write on initiative metadata or horizon raises non-destructive conflict banner: *"This initiative was updated remotely. Your changes have been preserved in draft. [Reload / Review]"*.
- **Project Association Rejection:** Attempting to associate a restricted or nonexistent project fails cleanly without altering local initiative state.

### 21.2 Empty States
- **Zero Initiatives in Workspace:** Welcoming empty state explaining Initiatives with a prominent `+ New Initiative` CTA.
- **Initiative with Zero Projects:** Projects tab and Roadmap show clean empty states: *"No projects aligned to this initiative yet. [Align Existing Project] [Create Project]"*.
- **Zero Published Updates:** Updates tab shows: *"No updates published yet. Post the first update to share strategic progress."*.

---

## 22. Component Responsibilities (Conceptual)

```text
src/features/initiatives/
├── components/
│   ├── InitiativesDirectory.jsx     # INT-001 Portfolio table with filters & state facets
│   ├── InitiativeWorkspace.jsx      # INT-002 Resource shell, header, tabs router
│   ├── InitiativeOverviewTab.jsx    # Tab 1: Charter, health snapshot, risk signals, squad rollup
│   ├── InitiativeProjectsTab.jsx    # Tab 2: High-density canonical project list & align action
│   ├── InitiativeRoadmapTab.jsx     # Tab 3: Embedded multi-quarter roadmap projection
│   ├── InitiativeUpdatesTab.jsx     # Tab 4: Historical narrative updates feed
│   ├── InitiativeActivityTab.jsx    # Tab 5: Canonical ActivityEvent stream
│   ├── InitiativeUpdateModal.jsx    # Modal for composing and publishing narrative updates
│   ├── InitiativeHealthBadge.jsx    # Semantic accessible health badge
│   ├── InitiativeProgressBar.jsx    # Transparent dual-metric progress component
│   └── Roadmap/
│       ├── RoadmapTimeline.jsx      # Multi-quarter virtualized canvas & header
│       ├── RoadmapInitiativeRow.jsx # Expandable initiative bar
│       ├── RoadmapProjectRow.jsx    # Nested project bar with milestones & lead team
│       └── RoadmapDependencyLines.jsx # SVG connector curves for project blockers
├── hooks/
│   ├── useInitiative.js             # Single initiative query, draft preservation, optimistic lock
│   ├── useInitiativesDirectoryQuery.js # Paginated, filtered directory query
│   ├── useInitiativeProjectsQuery.js   # Associated projects query
│   ├── useInitiativeUpdates.js      # Updates query and publish mutation
│   └── useRoadmapQuery.js           # High-density temporal projection query
└── model/
    ├── initiativeModel.js           # Canonical invariants, state validation, progress rollups
    └── initiativeUpdates.js         # Update snapshot normalization
```

---

## 23. Scalability & Large Portfolio Architecture

Enterprise workspaces contain hundreds of initiatives and thousands of projects spanning multiple years. The architecture guarantees high performance via:
1. **Windowed / Virtualized Roadmap Rendering:** Only timeline rows and quarter intervals currently visible within the viewport are mounted into the DOM.
2. **Bounded Temporal Queries:** Roadmap queries specify explicit time ranges (e.g. `2026-Q1` through `2027-Q2`), preventing queries from loading decades of historical data.
3. **Pre-Render Authorization Pruning:** Inaccessible entities are excluded at the query/filter boundary, eliminating client-side DOM layout re-flows.
4. **No Giant React Context:** Project execution updates do not trigger re-rendering of unrelated initiatives or roadmap rows.

---

## 24. CORE vs POST-CORE vs FUTURE Classification

```text
┌─────────────────────────────────────────────────────────────┬───────────────────────────┐
│ Feature / Capability                                        │ Classification            │
├─────────────────────────────────────────────────────────────┼───────────────────────────┤
│ INT-001 Initiatives Directory & Portfolio Table             │ CORE (UI-08B)             │
│ INT-002 Initiative Resource Page (Overview, Projects,       │ CORE (UI-08B)             │
│   Roadmap, Updates, Activity)                               │                           │
│ Canonical Initiative Model & CRUD Lifecycle                 │ CORE (UI-08B)             │
│ Initiative ↔ Project Association (0..1 Project Invariant)   │ CORE (UI-08B)             │
│ Human-Curated Health & Supporting Risk Signals              │ CORE (UI-08B)             │
│ Dual Empirical Progress (Projects Ratio + WorkItems Ratio)  │ CORE (UI-08B)             │
│ Structured Temporal Horizons (Quarters, Halves, Ranges)     │ CORE (UI-08B)             │
│ High-Density Roadmap Projection (Expandable Rows, Zoom)     │ CORE (UI-08B)             │
│ Interactive Roadmap Date Dragging (Delegated to Project)    │ CORE (UI-08B)             │
│ Canonical Initiative Updates (Historical Snapshots)         │ CORE (UI-08B)             │
│ Pre-Render Zero-Leakage Authorization                       │ CORE (UI-08B)             │
│ Non-Cascading Completion & Archive Lifecycle                │ CORE (UI-08B)             │
│ Generic Favorites & Command Palette / Search Integration    │ CORE (UI-08B)             │
│ ─────────────────────────────────────────────────────────── │ ───────────────────────── │
│ Cross-Initiative Direct Dependencies (`Init A blocks B`)    │ POST-CORE                 │
│ Custom Initiative Metadata / Field Designer                 │ POST-CORE                 │
│ Initiative Budgeting & Financial Burn-Rate Tracking         │ POST-CORE                 │
│ Team Capacity / Workload Heatmaps                           │ POST-CORE                 │
│ What-If Scenario Planning & Roadmap Branching               │ POST-CORE                 │
│ Permanent Hard Deletion / Trash Recovery                    │ POST-CORE                 │
│ Cross-Workspace Initiatives                                 │ POST-CORE                 │
│ Public / Embeddable Status Roadmaps                         │ POST-CORE                 │
│ ─────────────────────────────────────────────────────────── │ ───────────────────────── │
│ INT-003 Strategic Goals & OKR Hierarchy                     │ FUTURE                    │
│ AI Strategic Risk Prediction & Charter Auto-Generation      │ FUTURE                    │
│ Automated Critical-Path Algorithmic Scheduling              │ FUTURE                    │
└─────────────────────────────────────────────────────────────┴───────────────────────────┘
```

---

## 25. Frozen vs Tunable Specifications

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          FROZEN ARCHITECTURE                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Workspace-scoped Initiative coordinates 0..N canonical Projects.    │
│ 2. Project belongs to 0..1 Initiative (`project.initiativeId`).        │
│ 3. Association never clones, mutates, or owns Project execution data.  │
│ 4. Team participation is derived from associated Projects.             │
│ 5. Orthogonal state model: Operational State, Archive State, Health.   │
│ 6. Dual transparent progress metrics (no ungrounded single score).     │
│ 7. Human-curated health with non-overriding objective risk signals.    │
│ 8. Roadmap is a projection over canonical Initiatives and Projects.    │
│ 9. Roadmap date adjustments delegate to Project mutation boundary.     │
│ 10. Unscheduled items are never plotted at fabricated dates.           │
│ 11. Canonical Initiative Updates are historical, immutable snapshots.  │
│ 12. Pre-render zero-leakage security across all queries and views.     │
│ 13. Completion and archive are strictly non-cascading.                 │
│ 14. INT-001 and INT-002 (exactly 5 tabs) surface definitions.          │
│ 15. Deferral of Goals, OKRs, AI, and Auto-Scheduling to FUTURE.        │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                        TUNABLE IMPLEMENTATION                          │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Exact CSS styling, layout spacing tokens, and color shades.         │
│ 2. Exact pixel viewport breakpoints for responsive layouts.            │
│ 3. Physical keyboard shortcut bindings in Command Palette.             │
│ 4. Backend database schema, relation tables, and SQL indexes.          │
│ 5. API transport shapes, REST/GraphQL endpoints, and pagination limits.│
│ 6. Optimistic concurrency token format (revision integer, ETag, etc.). │
│ 7. Virtualization row height and horizontal timeline column widths.    │
│ 8. Client-side caching and state store implementations.                │
│ 9. Exact SVG bezier curves for roadmap dependency connector lines.     │
│ 10. Filenames, folder structure, and helper function naming.           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 26. Consistency Audit with Frozen Phases (UI-01 through UI-07)

- **UI-01 Execution Core:** WorkItems remain the sole canonical execution primitive owned by Teams. Initiatives never own or clone WorkItems; work rollups query canonical items through associated projects.
- **UI-02 Application Shell:** Initiatives integrates cleanly into the global Sidebar (`WHERE`) under Workspace Navigation, and uses standard resource header and tabs (`WHAT`).
- **UI-03 My Work:** Personal assignments in projects roll up into My Work normally; Initiatives do not create personal task silos.
- **UI-04 Personal Inbox:** Initiative mentions and published updates emit `NotificationEvent` items to the recipient's Inbox without creating a separate initiative inbox.
- **UI-05 Team Hub & Core Cycles:** Teams maintain complete execution autonomy. Multi-team projects aligned to Initiatives execute under their respective team cycles without interference.
- **UI-06 Docs & Knowledge:** Strategic living specs and RFCs remain canonical `Document` entities (`DOC-002`) and link naturally into Initiative overview charters.
- **UI-07 Projects:**
  - Preserves `Project -> 0..1 Initiative` association.
  - Reuses canonical Project states, health, lead team, milestones, and updates.
  - Project dependencies (`PRJ-006`) are visually projected on the Roadmap without creating a duplicate dependency store.
  - Project progress rollups remain authoritative.
- **Result:** Complete semantic alignment; zero architectural contradictions with frozen phases.

---

## 27. Acceptance Criteria for UI-08B Implementation

When UI-08B is authorized, implementation must strictly prove:
1. **Canonical Association:** Associating a Project sets `project.initiativeId`; the Initiative accesses canonical project state without cloning records.
2. **0..1 Invariant:** A Project cannot belong to multiple Initiatives; reassigning requires explicit confirmation.
3. **Non-Mutating Association:** Adding or removing a Project leaves Project teams, milestones, work items, and documents 100% intact.
4. **Derived Teams:** Initiative participating squads are derived dynamically as the unique union of participating teams across associated projects.
5. **Human Health + Risk Signals:** Changing project risks updates supporting signal badges but does not silently mutate Initiative health.
6. **Dual Progress Metrics:** Displays both Shipped Projects ratio and Aggregate WorkItem ratio with explicit numerators and denominators.
7. **Zero-Leakage Security:** Inaccessible projects and work items are completely excluded from counts, progress denominators, roadmap rows, and risk tallies.
8. **Roadmap Projection:** Renders hierarchical timeline of Initiatives and Projects with correct quarter intervals, current-day indicator, and dependency lines.
9. **Delegated Roadmap Mutation:** Rescheduling a Project on the roadmap invokes the Project domain mutation boundary and handles optimistic concurrency conflicts cleanly.
10. **Truthful Unscheduled States:** Unscheduled initiatives and projects render in dedicated trays, never placed at fabricated timeline dates.
11. **Historical Updates:** Published Initiative Updates persist as immutable historical snapshots with author, timestamp, narrative, and health snapshot.
12. **Non-Cascading Lifecycle:** Completing or archiving an Initiative preserves underlying Projects in their active states.
13. **Generic Integration:** Favorites use `useFavorites`; activity events use `ActivityEvent`; global search finds initiatives by reference and title.
14. **Test Suite Integrity:** All existing 299 tests across 14 test suites remain 100% green; comprehensive new tests cover INT-001, INT-002, and Roadmap invariants.
15. **Scope Boundary:** POST-CORE capabilities (custom fields, budget, auto-scheduling) and FUTURE Goals (`INT-003`) remain completely absent.

---

# HUMAN REVIEW — UI-08A INITIATIVES & ROADMAP CONTRACT
