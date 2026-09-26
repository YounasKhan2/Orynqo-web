# UI-05A — Team Hub Product & UX Contract

- **Document Version:** `1.1.0`
- **Surface Identifier:** `TEM-001` (Team Hub Resource Page)
- **Status:** **PROPOSED PRODUCT & UX SPECIFICATION — CORRECTION PASS 01A AT HUMAN REVIEW**
- **Base Git SHA:** `cba2e009b4c23e7a6890655bec6dd07d743b8320`
- **Branch:** `design/ui-05a-team-hub-product-ux`
- **Lineage:** `docs/06-complete-page-and-surface-registry.md` $\rightarrow$ `docs/10-ui-02a-application-shell-sidebar-contract.md` $\rightarrow$ `docs/12-ui-03a-my-work-product-ux-contract.md` $\rightarrow$ `docs/14-ui-04a-personal-inbox-product-ux-contract.md` $\rightarrow$ `docs/16-ui-05a-team-hub-product-ux-contract.md`

---

## 1. Executive Summary

`TEM-001: Team Hub Resource Page` establishes the canonical, collaborative home for a functional engineering or product squad (e.g. Core Platform, Mobile, Growth, Design System) within an Orynqo Workspace.

The Team Hub answers the central operational question:
> **"What is this team responsible for, what is it executing now, and where do I go for its work, planning, projects, knowledge, and people?"**

### 1.1. Core Invariants
1. **Resource Destination, Not a Projection:** A Team is a first-class workspace entity (`WHERE`). Projections (`Grid`, `Board`, `Timeline`, `Workload`) are viewing lenses (`HOW`), not sibling domain resources.
2. **Zero Cloned Data:** Team Hub is an authoritative query lens over canonical workspace entities (`WorkItem`, `Project`, `Document`, `Cycle`). It never introduces `TeamWorkItem`, `TeamTask`, `CycleItem`, or detached local backlog copies.
3. **Operational Home, Not an Executive KPI Dashboard:** Team Hub strictly avoids decorative "dashboard syndrome" (giant vanity charts, idle metric widgets, hollow cards). It presents executable work, active cycle health, and pinned resources with high visual density above the fold.
4. **Team-Owned Cycles, Cross-Team Projects:** A `Cycle` is strictly owned by one Team. A `Project` is a workspace resource that may span multiple Teams (distinguishing Lead Team from Participating Teams).
5. **Architectural Precedence:**
   - `SIDEBAR = WHERE` (Direct navigation to joined teams; Browse Teams Directory `TEM-009`)
   - `RESOURCE NAVIGATION = WHAT` (Contextual tabs: `Overview`, `Work`, `Cycles`, `Projects`, `Docs`, `Triage`, `Members`)
   - `PROJECTION CONTROLS = HOW` (Projections: `Grid`, `Board`, `Timeline`, `Workload`)
   - `INSPECTOR = DETAILS` (Split-pane or drawer context without leaving the team canvas)
   - `COMMAND PALETTE = LONG-TAIL` (`⌘K` fuzzy jump to team resources)

---

## 2. Competitive Pattern Findings

To ground Orynqo's Team Hub in proven industry ergonomics while avoiding common UX anti-patterns, we analyzed the team architectures of mature work-management tools.

```text
Reference Pattern
→ useful behavior
→ limitation/problem
→ Orynqo decision
```

### 2.1. Linear (Teams, Cycles, Backlog & Projects)
- **Useful Behavior:**
  - Fast, keyboard-driven navigation with minimal visual friction.
  - Clear separation between active Cycle, unstarted Backlog, and Projects.
  - Team-owned cycles keep planning scope focused and team-autonomous.
- **Limitation / Problem:**
  - Team Home is often just an issue list or an overview with limited contextual identity (poor team charter, documentation surfacing, or roster capacity context).
  - Cross-team project tracking requires jumping to workspace-level views.
- **Orynqo Decision:**
  - **Adopt** the team-owned Cycle model, keyboard-first triage navigation, and instant projection switching.
  - **Adapt** with a high-density `Overview` (`TEM-002`) combining active cycle operational snapshot, multi-team project participation, pinned runbooks, and roster capacity into a unified operational canvas.

### 2.2. Jira (Scrum/Kanban Boards, Backlogs & Team Spaces)
- **Useful Behavior:**
  - Split-pane sprint planning (Backlog on left/top vs Upcoming Sprint on right/bottom) allows rapid drag/drop and keyboard assignment.
  - Explicit board configurations per team.
- **Limitation / Problem:**
  - Severe navigation fragmentation: "Board vs Backlog vs Project Settings vs Team" are disjointed full-page reloads.
  - Slow page rendering with heavy visual noise, modal thrashing, and disconnected issue detail views.
  - Incomplete sprint rollover silently forces manual batch queries or clones items.
- **Orynqo Decision:**
  - **Adopt** the high-density dual-pane planning mental model for `CYC-002` (Backlog $\leftrightarrow$ Upcoming Cycle).
  - **Reject** fragmented board pages and slow navigation. Orynqo integrates all team capabilities under a single `TEM-001` resource shell with persistent ResourceNav tabs, URL state preservation, and zero full-page reloads.
  - **Enforce** the frozen rollover law: Incomplete committed items never auto-roll silently into the next cycle; they return to a dedicated rollover review queue.

### 2.3. Asana (Team Pages, Project Portfolios & Workload)
- **Useful Behavior:**
  - Clear team landing page showing member rosters, team purpose/messages, and organized project lists.
  - Clean distinction between public and private/membership-gated teams.
- **Limitation / Problem:**
  - Weak cycle/sprint support (often bolted on via custom date fields or manual sections).
  - Excessive vertical spacing and low data density; requires excessive scrolling to inspect actual team tasks.
- **Orynqo Decision:**
  - **Adopt** clear team charter identity, membership visibility, and explicit public vs membership-gated team boundaries.
  - **Reject** low-density marketing-style landing layouts. Orynqo enforces dense row tokens, compact headers, and instant keyboard navigation.

### 2.4. ClickUp (Spaces, Folders & Sprint Lists)
- **Useful Behavior:**
  - Flexible capability toggles (Sprints, Points, Custom Fields).
- **Limitation / Problem:**
  - Deep, confusing spatial hierarchy (Workspace $\rightarrow$ Space $\rightarrow$ Folder $\rightarrow$ List $\rightarrow$ Task $\rightarrow$ Subtask) causing navigation disorientation.
  - "Card Dashboard Syndrome": Team dashboards are littered with disconnected widgets and vanity charts that distract from active execution.
- **Orynqo Decision:**
  - **Adopt** capability-aware team toggles (`cyclesEnabled`, `triageEnabled`, `estimatesEnabled`).
  - **Reject** arbitrary multi-level nested folders. Orynqo maintains a clean, flat domain topology where Workspace contains Teams, Projects, Initiatives, Documents, and WorkItems as sibling resources.
  - **Reject** decorative KPI dashboards. Team Hub is an operational execution cockpit.

---

## 3. Team Domain Definition & Canonical Ownership

In Orynqo's architecture, the workspace is the sovereign tenancy boundary. A `Team` is a first-class resource within the workspace.

```text
Organization
  └─ Workspace
       ├── Teams (TEM-001)
       │    └── owns Cycles (CYC-001, CYC-002) [Team-Owned]
       ├── Projects (PRJ-001) [Workspace Resource, Cross-Team]
       ├── Initiatives (INT-001) [Strategic Portfolio]
       ├── Documents (DOC-001) [Canonical Knowledge Base]
       └── WorkItems (WRK-001) [Canonical Execution Units]
```

### 3.1. Entity Relationships & Containment Laws
1. **WorkItem $\leftrightarrow$ Team:**
   - Every WorkItem has exactly one owning Team according to the canonical model (`owningTeamId`).
   - Work items belong canonically to the workspace and are partitioned by team ownership.
   - Team pages query canonical `WorkItems WHERE owningTeamId = currentTeam.id`. Never introduce `TeamWorkItem` or local copies.
2. **Cycle $\leftrightarrow$ Team:**
   - A `Cycle` is **strictly team-owned** (`cycle.teamId = currentTeam.id`).
   - A Cycle cannot span multiple teams. Teams plan, execute, and calibrate velocity autonomously.
3. **Cycle $\leftrightarrow$ WorkItem Semantic Relationship:**
   - A canonical WorkItem may be scheduled or committed to a Cycle belonging to its owning Team.
   - Contract operations are storage-neutral:
     ```text
     assignWorkItemToCycle(workItemId, cycleId)
     removeWorkItemFromCycle(workItemId)
     ```
   - Physical representation (e.g. WorkItem attribute, scheduling relation, join entity, or normalized association) belongs to technical persistence architecture. The UI contract defines only the semantic scheduling relationship.
4. **Project $\leftrightarrow$ Team:**
   - A `Project` is a **workspace-level resource**, NOT a child of a Team.
   - Projects may require cross-functional collaboration. Each project distinguishes:
     - `leadTeam`: The team with primary delivery accountability.
     - `participatingTeams`: Teams contributing work items to the project.
   - `TEM-004 (Team Projects)` queries all workspace projects where the current team is either the lead team or a participating team.
5. **Document $\leftrightarrow$ Team:**
   - Documents are canonical workspace entities (`DOC-001`), NOT child entities of a Team.
   - `TEM-005 (Team Docs)` queries canonical documents contextually associated with or authored by the team.
6. **Milestone $\leftrightarrow$ Project:**
   - A `Milestone` remains project-owned. It is never placed into the Team or Cycle hierarchy.

---

## 4. Team Hub Purpose

Opening a Team Hub (`TEM-001`) delivers immediate operational clarity. It serves three distinct actor groups:

| Actor Group | Operational Question | Primary Surface |
| :--- | :--- | :--- |
| **Team Members (Engineers, Designers)** | *"What are we executing in this cycle, what is blocked, and what should I pick up next?"* | `Overview` (`TEM-002`), `Work` (`TEM-003`), `Active Cycle` (`CYC-001`) |
| **Team Leads & Product Managers** | *"How is our cycle tracking, what is our backlog health, and how are our projects progressing?"* | `Cycle Planning` (`CYC-002`), `Projects` (`TEM-004`), `Members` (`TEM-007`) |
| **Cross-Team Collaborators & Stakeholders** | *"What does this team do, who leads it, what are their runbooks, and where do I submit inbound work?"* | `Overview` (`TEM-002`), `Team Docs` (`TEM-005`), `Triage` (`TEM-006`) |

---

## 5. Resource Navigation Contract

The Team Hub provides persistent top-level ResourceNav tabs located in the shell's sub-header strip (`ResourceNavStrip`, height driven by semantic design-system tokens).

```text
[ TEM-001 Team Hub ]
└── ResourceNav: [ Overview ] [ Work ] [ Cycles ] [ Projects ] [ Docs ] [ Triage ] [ Members ] ... [ ⚙ Settings ]
```

### 5.1. Tab Registry & Capability Matrix

| Tab Label | Registry ID | Scope / Purpose | Phase | Visibility Rule | Permission Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Overview** | `TEM-002` | Operational landing cockpit: active cycle snapshot, project rollups, pinned docs, roster preview | **CORE** | Always visible | Readable by all team viewers |
| **Work** | `TEM-003` | Complete team execution stream (Active, Backlog, Closed) with Grid/Board projections | **CORE** | Always visible | Readable by all team viewers |
| **Cycles** | `CYC-001` / `CYC-002` | Sprint/iteration execution (`CYC-001`) and backlog planning (`CYC-002`) | **CORE** | Visible if `team.capabilities.cyclesEnabled === true` | Readable by team viewers; planning requires cycle planning permission |
| **Projects** | `TEM-004` | Curated catalogue of projects led by or involving this squad | **CORE** | Always visible | Readable by all team viewers |
| **Docs** | `TEM-005` | Team knowledge base: runbooks, architectural RFCs, meeting notes | **CORE** | Always visible | Readable by all team viewers |
| **Triage** | `TEM-006` | Inbound intake queue for unvetted tickets, bugs, and requests | **POST-CORE** | Visible if `team.capabilities.triageEnabled === true` | Triage management permission to action; viewers see status |
| **Members** | `TEM-007` | Team roster, team roles, and optional capacity planning | **CORE** | Always visible | Readable by all team viewers |

### 5.2. Team Settings Placement & Navigation Rule
- **Settings (`TEM-008`):** Team Settings is an administrative capability and configuration surface, **not** a primary operational ResourceNav tab.
- **Entry Points:**
  1. Header action: A dedicated gear icon button `[ ⚙ Team Settings ]` in the Team Identity Header (visible only to users authorized to manage team settings).
  2. Overflow menu `[ ... ]` in the Team Header.
  3. Omnisearch / Command Palette `⌘K`: Search `"Team Settings: <Team Name>"`.
- **Architectural Law:** The Sidebar joined teams list never duplicates resource tabs. Clicking a team in the sidebar always routes to the last active resource tab (or `Overview` by default).

---

## 6. Team Identity Header Contract

The Team Header is a compact, high-density component rendered persistently above the ResourceNav strip. It establishes team context without consuming valuable vertical workspace. Dimensions and padding inherit from design-system layout tokens.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Icon]  Core Platform  [CORE]  •  Lead: @sarah  •  8 members   [Search Team...]  [+ New Item] [⚙]│
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.1. Header Properties & Information
1. **Team Icon / Avatar:** Visual team token with fallback initials or curated glyph.
2. **Team Name:** Distinct primary typography token.
3. **Team Key / Prefix:** Distinctive monospace badge (e.g. `CORE`, `MBL`, `DS`) used for ticket identifiers.
4. **Metadata Strip (Compact):**
   - **Lead / Owner:** Displayed where supported by team metadata, with handle/avatar.
   - **Membership Indicator:** Count indicator that routes to the `Members` tab.
   - **Capability Indicators:** Subtle indicator only when non-standard capabilities are active (e.g. `Triage Active`).
5. **Purpose / Description:**
   - *Compact/Default:* Single-line mission summary or tooltip.
   - *Full Description:* Rendered inside the `Overview` tab charter card, never inflating header height.

### 6.2. Header Actions
- **Primary Action (CORE):** `[ + New Item ]` (Contextual Quick Create pre-filling `teamId = team.id`).
- **Contextual Search (CORE):** Search input trigger filtering within the active team scope.
- **Favorite Toggle (CORE):** Star button toggling user-scoped sidebar favorite.
- **Team Settings Trigger (CORE):** Settings button (permission-gated).
- **Overflow Menu `[ ... ]` (CORE):** Copy team link, secondary resource actions.
- *Integration-Dependent Actions (Non-Core / Deferred):* External notifications management or external on-call integrations are strictly integration-dependent and must not be assumed as core UI-05A deliverables.

---

## 7. Team Overview Boundary (`TEM-002`)

The `Overview` tab is the default landing surface for `TEM-001`. It provides an executive and operational synthesis without falling into "vanity card dashboard syndrome."

```text
┌───────────────────────────────────────────────────────────┬──────────────────────────────────────┐
│ ACTIVE CYCLE (Cycle 42: "Q3 Stability & Perf")             │ TEAM CHARTER & ROSTER                │
│ Dates: Sep 15 – Sep 29 (4 days remaining)                 │ Mission: Core engine reliability,    │
│ Progress: 18 / 24 completed (75%) • 2 Blocked             │ performance budgets, API contracts.  │
│ [ View Active Cycle → ]                                   │ Lead: @sarah • 8 active contributors │
├───────────────────────────────────────────────────────────┼──────────────────────────────────────┤
│ ACTIVE PROJECTS (3)                                       │ PINNED RUNBOOKS & DOCS (4)           │
│ • API Gateway v2 [Lead] ────────── 82% (On Track)         │ 📄 Production Incident Playbook      │
│ • Workspace Auth Migration [Part] ─ 45% (At Risk)         │ 📄 Database Sharding RFC             │
│ • Design Tokens v2 [Part] ──────── 95% (Completed)        │ 📄 Escalation Matrix                 │
├───────────────────────────────────────────────────────────┴──────────────────────────────────────┤
│ RECENT TEAM DISCUSSIONS & ACTIVITY (Compact operational stream)                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 7.1. Operational Information Sections
1. **Active Cycle Execution Snapshot:**
   - Rendered only if `cyclesEnabled === true` and an active cycle exists.
   - Displays cycle name/number, target end date, business days remaining, progress summary (counts or points if enabled), and attention flags (count of `Blocked` or `Overdue` items).
   - Charts (such as burndown mini-graphs) are **optional/tunable visualizations**; the overview must deliver complete operational clarity from numerical/status state alone.
   - Direct link: `[ View Active Cycle → ]` (switches to `CYC-001`).
2. **Team Charter & Roster Preview:**
   - Concise statement of team mission/responsibilities.
   - Team lead/owner where supported, and active member count.
3. **Active Projects Rollup:**
   - Lists projects where the team is Lead Team or Participating Team.
   - Distinct role badge: `[Lead Team]` vs `[Participant]`.
   - Visual progress bar and health status (`On Track`, `At Risk`, `Off Track`).
4. **Pinned Team Resources & Runbooks:**
   - Direct links to high-frequency canonical documents (runbooks, architectural standards, sprint retrospectives).
5. **Operational Activity Stream (Compact):**
   - Small contextual stream of recent meaningful domain events (completed work items, project milestone achievements, published RFCs).
   - Strictly operational; never replicates personal notification triage (`Inbox`).

---

## 8. Team Work Boundary (`TEM-003`)

The `Work` tab is the complete, virtualized execution stream of all canonical work items owned by the team.

### 8.1. Query Semantics
```text
SELECT * FROM WorkItems
WHERE workspaceId = :workspaceId
  AND owningTeamId = :currentTeamId
  AND (status.category != 'archived')
```

### 8.2. Projections & View Controls
- **Available Projections:**
  - `Grid` (`WRK-001`): Universal high-density data grid with multi-sort, column reordering, inline property pickers, and bulk actions.
  - `Board` (`WRK-002`): Kanban projection grouped by workflow status columns.
  - `Timeline` (`WRK-003`): Gantt/schedule projection plotted against start and due dates.
  - `Workload` (`WRK-004`): Capacity distribution per assignee (*POST-CORE*).
- **Default Projection:** `Grid` (or user-scoped, team-work-scoped preference).
- **Standard Filter Sub-bar:**
  - Status group tabs: `Active Work` (In Progress, Todo, In Review), `Backlog` (Unscheduled/Uncommitted), `Completed` (Done, Canceled), `All Items`.
  - Filters: Assignee, Priority, Project, Cycle, Label, Attention state.

### 8.3. Quick Create Context
Triggering Quick Create from Team Work pre-populates:
- `teamId = currentTeam.id` (Fixed/Immutable context)
- `status = currentTeam.workflow.defaultStatus`
- Leaves `assigneeId`, `projectId`, and cycle unassigned unless explicitly filtered by those dimensions in the active view.

---

## 9. Backlog Semantics

Backlog must be defined through deterministic semantic state rather than brittle presentation names.

### 9.1. Orynqo Canonical Backlog Invariant
> **The Backlog is a canonical query and planning state over Team WorkItems, NEVER a separate container, duplicate record, or detached entity.**

### 9.2. Deterministic Backlog Classification
A WorkItem is classified as belonging to the **Team Backlog** if and only if it satisfies all of the following conditions:
1. `owningTeamId === currentTeam.id`
2. **Not scheduled/committed to a Cycle:** The item has no active or upcoming cycle commitment.
3. **Workflow category is unstarted/eligible:** `status.category === 'unstarted'` (or team workflow category explicitly designated for uncommitted backlog work).
4. **Not finished:** `status.category !== 'completed' && status.category !== 'canceled'`.
5. **Not archived:** `archivedAt === null`.

### 9.3. Exhaustive Classification of Non-Backlog Work
To prevent items from falling into ambiguous classification, the contract establishes deterministic rules for all work states:
- **Started but cycle-less work:** An item whose `status.category === 'started'` but has no cycle commitment is classified as **Active Work (Out-of-Cycle)**. It appears in Team Work under `Active Work`, never in Backlog.
- **Future scheduled work:** An item committed to an upcoming cycle is classified as **Planned Commitment (Upcoming Cycle)**, appearing in `CYC-002`, not Backlog.
- **Completed work:** An item whose `status.category === 'completed'` appears exclusively in completed views and cycle historical archives.
- **Canceled work:** An item whose `status.category === 'canceled'` is retained for historical audit but excluded from Backlog and Active views.
- **Archived work:** Retained in cold storage/archive search; excluded from all operational tabs.
- **Unvetted Triage work (`TEM-006`):** Inbound tickets arriving from outside the team remain in the dedicated Triage queue until explicitly accepted into the Backlog or rejected.

---

## 10. Cycle Model Contract (`CYC`)

A `Cycle` (also known as Sprint or Iteration) is a timeboxed commitment period during which a team focuses on delivering a scoped set of work items.

### 10.1. Conceptual Domain Model
The Cycle model is storage-neutral and decoupled from mandatory estimation units:
```text
Cycle (Conceptual)
├── id: unique identifier
├── workspaceId: owning workspace
├── teamId: owning team (Strict 1:1 ownership)
├── sequence / number: integer or identifier
├── name: optional thematic title
├── status: 'upcoming' | 'active' | 'completed'
├── startAt: timestamp (UTC)
├── endAt: timestamp (UTC)
├── goal: optional string
├── planningMetadata: optional planning/capacity metadata (e.g. points, hours, item count)
├── createdAt: timestamp
└── updatedAt: timestamp
```

### 10.2. Invariant Rules
1. **One Active Cycle Rule:** A Team may have at most **one** Cycle in `active` status at any point in time.
2. **Timezone Determinism:** Cycle start and end dates are stored in UTC and resolved to the user's localized working hours using the established `dateUtils` domain engine.
3. **No Cross-Team Cycles:** Cycles cannot be shared across multiple teams. Shared cross-team deliverables are coordinated via `Project` milestones, not shared Cycles.
4. **Estimation Decoupling:** Cycles operate fully whether estimation is disabled, uses story points, uses hours, or uses simple issue counts. Estimation is optional capability metadata, not a required cycle identity attribute.

---

## 11. Cycle Lifecycle & Rollover Engine

The lifecycle of a cycle follows a deterministic progression:

```text
[ Upcoming ] ────( Start Cycle )────► [ Active ] ────( Complete Cycle )────► [ Completed ]
      ▲                                                                             │
      │                                                                             ▼
      └────────────────────────── Rollover Review ◄─────────────────────────────────┘
                           (Explicit Reassignment / Backlog Return)
```

### 11.1. Lifecycle Transitions
1. **Upcoming $\rightarrow$ Active (`Start Cycle`):**
   - Authorized by appropriate team cycle management permission.
   - Validates that no other cycle is currently `active` for this team.
   - Takes a commitment scope snapshot for progress comparison.
2. **Active $\rightarrow$ Completed (`Complete Cycle`):**
   - Authorized by appropriate team cycle management permission.
   - Records execution summary facts (completed vs uncompleted work).
   - Marks the cycle as `completed`.
   - **Triggers Explicit Rollover Review Workflow.**

### 11.2. The Frozen Rollover Invariant
> **CRITICAL LAW: Incomplete committed items do NOT silently auto-roll into the next cycle.**

- **Rationale:** Automatic rollover silently pollutes future sprint commitments, hides chronic over-scoping, and corrupts planning velocity.
- **Rollover Review Experience:**
  When a cycle is completed with uncompleted items, the user is guided through an explicit Rollover Review workflow:
  ```text
  Complete Cycle
  → identify incomplete committed WorkItems
  → explicit rollover review
  → user determines destination (Backlog vs eligible Upcoming Cycle)
  → canonical scheduling relationships mutate
  → Cycle completes
  ```
  The interaction container (modal, drawer, or inline view) is a presentation choice. What is frozen is that canonical scheduling relationships are atomically updated upon confirmation so no item is left in an invalid state.

### 11.3. Historical Execution Facts
When a Cycle completes, its historical execution facts (initial commitment snapshot, final completion summary) are preserved against silent rewriting. Administrative metadata corrections (e.g. fixing a typo in the cycle name or goal) remain permitted through authorized channels.

---

## 12. Backlog ↔ Cycle Planning Boundary (`CYC-002`)

`CYC-002` provides a high-density, dual-pane planning workbench designed for rapid backlog refinement and sprint assembly.

```text
┌───────────────────────────────────────────────┬───────────────────────────────────────────────┐
│ TEAM BACKLOG                                  │ UPCOMING CYCLE                                │
│ [Search Backlog...] [Filter: Priority ▾]      │ Target / Dates / Commitment Scope             │
├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ [::] CORE-108  API Rate Limiting              │ [::] CORE-94   OAuth Token Revocation         │
│ [::] CORE-112  Optimize Query Plan            │ [::] CORE-99   Audit Log Retention            │
│ [::] CORE-115  Redis Cluster Failover         │ [::] CORE-102  Session Invalidation           │
│ ... (virtualized scroll)                      │ ... (virtualized scroll)                      │
├───────────────────────────────────────────────┴───────────────────────────────────────────────┤
│ Actions: Schedule to Cycle • Return to Backlog • Rank • Inspect                               │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 12.1. Planning Operations
1. **Schedule Item to Upcoming Cycle:** `assignWorkItemToCycle(workItemId, upcomingCycle.id)`.
2. **Remove Item from Cycle:** `removeWorkItemFromCycle(workItemId)` (returns to backlog).
3. **Rank / Reorder:** Adjusts deterministic ordering within the backlog or cycle queue.
4. **Bulk Planning:** Multi-select items and schedule/unschedule as a batch.
5. **Universal Property Pickers:** Adjust priority, estimates, or assignees directly within the planning rows without opening full edit modals.

### 12.2. Interaction Modes
- **Pointer:** Drag-and-drop between panes (optional progressive enhancement).
- **Keyboard (Zero-Mouse Invariant):** Keyboard commands allow selecting items, navigating lists, scheduling to upcoming cycle, and returning to backlog without requiring a mouse.

---

## 13. Active Cycle Execution Boundary (`CYC-001`)

`CYC-001` is the operational cockpit during active sprint delivery. It focuses entirely on execution momentum and blocker remediation.

### 13.1. Surface Elements
1. **Sprint Header Strip:**
   - Cycle Number & Goal.
   - Date range with business days remaining badge.
   - Execution progress summary (e.g. ratio of completed vs total items/scope).
   - Attention alerts (count of `Blocked` or `Overdue` items).
2. **Primary Execution Canvas:**
   - Visual projections: `Board` (Kanban columns: Todo, In Progress, In Review, Done) or `Grid` (Dense tabular list).
   - Projection switching preserves active filters and selection.
3. **Contextual Inspector:**
   - Selecting any row or card opens the canonical `WorkItemDetailContainer` in the split-pane or drawer.

---

## 14. Project Relationship (`TEM-004`)

Projects are workspace-level initiatives that aggregate work towards major milestones. Teams interact with projects through distinct participation roles.

### 14.1. Lead Team vs Participating Team
```text
Project (Workspace Resource)
├── id: unique identifier
├── name: string
├── leadTeamId: team with primary delivery accountability
├── participatingTeamIds: contributing teams
└── status: project lifecycle status
```

### 14.2. Team Projects Query (`TEM-004`)
- **Query Definition:**
  Queries all workspace projects where `leadTeamId === teamId || participatingTeamIds.includes(teamId)`.
- **UI Representation:**
  - Grouped or badged by role: `[Lead Team]` (Primary delivery accountability) vs `[Contributing Team]`.
  - Displays count of work items owned by this team within the project.
  - Clicking a project routes to `PRJ-001 (Project Hub)`, preserving context.

---

## 15. Team Docs (`TEM-005`)

Team Docs organizes canonical knowledge artifacts contextually relevant to the squad.

### 15.1. Categorization & Query
- **Query:** Canonical Documents associated with or authored by the team.
- **Standard Categories:**
  1. **Pinned Runbooks & Playbooks:** Critical incident procedures, on-call escalations.
  2. **Technical Specs & RFCs:** Living specifications and architecture decisions.
  3. **Meeting Notes & Retrospectives:** Cycle planning notes, post-mortems.
- **Living Spec Integration:** Living Specs remain a specialized Document capability (`DOC-001`), linking canonical WorkItems directly to requirements.

---

## 16. Team Members (`TEM-007`)

`TEM-007` provides squad roster visibility and optional sprint capacity planning.

### 16.1. Roster Information
- **Member Identity:** Name, handle, avatar, workspace role.
- **Team Role:** Role within team context (Lead, Contributor, Guest/Viewer, or custom RBAC bundle).
- **Active Workload Rollup:** Count of active items assigned to each member in the current cycle.
- **Capacity Planning (Optional):** When capacity capabilities are enabled, allows configuring optional target bandwidth per member (e.g. points, hours, or item counts) to assist sprint planning. Not required for basic team operations.

---

## 17. Team Capabilities Model

Teams in Orynqo are modular and capability-aware. Different functional squads require different operational tools.

### 17.1. Capability Flags (Conceptual)
```text
TeamCapabilities
├── cyclesEnabled: boolean      # Enables CYC-001, CYC-002, and Cycle pickers
├── triageEnabled: boolean      # Enables TEM-006 inbound triage queue
├── estimatesEnabled: boolean   # Enables estimation properties on WorkItems
└── workloadEnabled: boolean    # Enables capacity & workload projections
```

### 17.2. Capability Invariants
1. **Navigation Adaptability:** When a capability is disabled (e.g. `cyclesEnabled === false`), its corresponding ResourceNav tab (`Cycles`) is hidden.
2. **Graceful Historical Retention:** Disabling a capability does **not** delete historical data. If `cyclesEnabled` is toggled off:
   - Existing work items retain their historical cycle associations.
   - Completed cycle metrics remain preserved in the database.
   - The UI simply ceases offering active cycle scheduling or planning views.
3. **Quick Create Adaptability:** Quick Create hides irrelevant fields (e.g. Estimates, Cycle) when their capabilities are disabled for the target team.

---

## 18. Permissions & Visibility (Semantic RBAC)

Team permissions strictly adhere to Orynqo's four-tier authorization hierarchy:

$$\text{Organization Role} \rightarrow \text{Workspace Role} \rightarrow \text{Team Role} \rightarrow \text{Entity Override}$$

### 18.1. Team Visibility & Membership Policy
The contract explicitly separates:
- **Discoverability:** Whether a team appears in the workspace Teams Directory (`TEM-009`) and global search.
- **Visibility:** Whether non-members can view team work items, cycles, and docs.
- **Membership:** The set of users associated with the team.
- **Join Policy:** How membership is granted (e.g. open self-join, request-to-join, or admin-invite-only). A team being discoverable does not imply open self-join.

Teams may be **Public** (discoverable and readable by workspace members) or **Restricted / Private** (discoverable and readable only by authorized members). Unauthorized users never receive leaked metadata (team names, tickets, docs) in search or API payloads.

### 18.2. Semantic Action Permissions

| Semantic Permission | Description | Standard Minimum Role Required |
| :--- | :--- | :--- |
| `team:view` | View Team Hub, team work, and public resources | Workspace Member (for public teams) |
| `team:create_work` | Create canonical WorkItems owned by the team | Team Contributor / Authorized Member |
| `team:manage_settings` | Edit team metadata, prefix, and capabilities | Team Lead / Workspace Admin |
| `team:manage_roster` | Add/remove members, update team roles | Team Lead / Workspace Admin |
| `team:manage_cycles` | Start, complete, and configure cycles | Team Lead / Authorized Planner |
| `team:plan_work` | Assign items to cycles, rank backlog | Team Contributor |
| `team:manage_triage` | Accept, decline, or snooze inbound triage items | Team Contributor |

---

## 19. Query Boundaries & Contracts

Technology-neutral query contracts define inputs, outputs, pagination, and error handling:

### 19.1. `useTeam(teamId)`
- **Input:** `{ workspaceId: string, teamId: string }`
- **Output:** `{ team: Team, capabilities: TeamCapabilities, userPermissions: TeamPermissionSet, isLoading: boolean, error: Error | null }`

### 19.2. `useTeamWorkQuery(params)`
- **Input:** `{ workspaceId: string, teamId: string, tab: 'active' | 'backlog' | 'completed' | 'all', filters: WorkFilterState, sort: SortCriteria, cursor?: StableCursor }`
- **Output:** `{ items: WorkItem[], totalCount: number, nextCursor: StableCursor | null, isLoading: boolean, error: Error | null }`

### 19.3. `useTeamCyclesQuery(teamId)`
- **Input:** `{ workspaceId: string, teamId: string, status?: 'active' | 'upcoming' | 'completed', cursor?: StableCursor }`
- **Output:** `{ activeCycle: Cycle | null, upcomingCycles: Cycle[], historicalCycles: Cycle[], nextCursor: StableCursor | null, isLoading: boolean, error: Error | null }`

### 19.4. `useTeamProjectsQuery(teamId)`
- **Input:** `{ workspaceId: string, teamId: string, role?: 'lead' | 'participant' | 'all' }`
- **Output:** `{ ledProjects: Project[], participatingProjects: Project[], isLoading: boolean, error: Error | null }`

### 19.5. `useTeamDocumentsQuery(teamId)`
- **Input:** `{ workspaceId: string, teamId: string, category?: string, cursor?: StableCursor }`
- **Output:** `{ documents: Document[], pinnedDocuments: Document[], nextCursor: StableCursor | null, isLoading: boolean, error: Error | null }`

### 19.6. `useTeamMembersQuery(teamId)`
- **Input:** `{ workspaceId: string, teamId: string }`
- **Output:** `{ members: TeamMember[], lead: TeamMember | null, capacitySummary?: CapacitySummary, isLoading: boolean, error: Error | null }`

---

## 20. Mutation Boundaries & Domain Ownership

Domain boundaries must remain strictly decoupled:

```text
┌──────────────────────────┐      ┌──────────────────────────┐
│ Team Domain Controller   │      │ WorkItem Core Controller │
├──────────────────────────┤      ├──────────────────────────┤
│ • updateTeamSettings()   │      │ • createWorkItem()       │
│ • addMember()            │      │ • updateWorkItem()       │
│ • toggleCapability()     │      │ • batchUpdateWorkItems() │
└──────────────────────────┘      └──────────────────────────┘
             │                                 │
             ▼                                 ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│ Cycle Domain Controller  │      │ Project Domain Controller│
├──────────────────────────┤      ├──────────────────────────┤
│ • startCycle()           │      │ • updateProject()        │
│ • completeCycle()        │      │ • changeProjectStatus()  │
│ • assignItemToCycle()    │      │                          │
└──────────────────────────┘      └──────────────────────────┘
```

1. **Team Feature:** Owns team metadata, capabilities, and membership. It **never** executes direct store writes against WorkItems.
2. **Cycle Feature:** Owns cycle scheduling and rollover workflows. Cycle assignments delegate to canonical execution core controllers.
3. **Execution Core:** Owns canonical WorkItem mutations, optimistic updates, and rollback logic.

---

## 21. Keyboard & Focus Engine

Team surfaces integrate into the centralized keyboard architecture established in UI-04B:

$$\text{GLOBAL} \rightarrow \text{PAGE/VIEW (Team Hub Commands)} \rightarrow \text{OVERLAY} \rightarrow \text{EDITABLE CONTROL}$$

### 21.1. Semantic Commands
The contract specifies semantic commands. Physical key bindings are provisional and must be reconciled with the centralized shortcut registry during implementation:
- `switch_resource_tab`: Switch active ResourceNav tab.
- `focus_team_search`: Move focus to contextual Team search bar.
- `create_work_item`: Open Quick Create with active `teamId` pre-filled.
- `navigate_work_list`: Move focus up/down through work item rows or planning cards.
- `inspect_work_item`: Open canonical Inspector for focused work item.
- `close_context`: Close Inspector, clear selection, or dismiss open picker.
- `schedule_to_cycle` / `unschedule_to_backlog`: Move focused or selected items between planning panes.
- `toggle_select`: Toggle selection for bulk actions.

No feature-owned global `window.addEventListener` calls are permitted; all handlers register via `registerViewKeyboardHandler`.

---

## 22. URL & Addressable State Contract

URL routes represent authoritative navigation state. Deep links must preserve:
- Workspace identifier
- Team identifier (key or slug)
- Sub-resource tab (Overview, Work, Cycles, Projects, Docs, Members)
- Projection mode (Grid, Board, Timeline)
- Filter/sort parameters where shareable
- Selected Inspector entity

Exact path templates and query parameter names are router implementation decisions and are not frozen in this contract.

---

## 23. Responsive Behavior (Semantic Modes)

Team Hub adapts across three semantic display modes. Exact breakpoint pixel values are managed via design-system tokens:

1. **Wide Desktop Mode:**
   - Full Sidebar + Team Header + ResourceNav.
   - Dual-pane canvas for planning; horizontal split-pane for Inspector.
2. **Compact Viewport Mode:**
   - Collapsed/reduced navigation.
   - Primary canvas occupies available width; Inspector mounts as a contextual overlay drawer.
3. **Narrow / Mobile Mode:**
   - Explicit spatial hierarchy: Team $\rightarrow$ Resource Tab $\rightarrow$ Item / Detail.
   - Sidebar moves to drawer; ResourceNav uses horizontal swipe/scroll.
   - Dual-pane planning stacks into distinct sub-views (Backlog vs Upcoming Cycle).

---

## 24. Loading, Empty, and Error States

Every sub-surface specifies explicit operational states:

| Sub-Surface | Loading State | Empty State | Error / Forbidden State |
| :--- | :--- | :--- | :--- |
| **Team Hub Root** | Shell skeleton with header pulse | Redirects to Teams Directory if not found | 404 Not Found or 403 Forbidden with request access action |
| **Overview (`TEM-002`)** | Skeleton cards for Cycle, Projects, and Roster | Guides Lead to configure charter and create first cycle | Error banner with retry affordance |
| **Work (`TEM-003`)** | Virtualized row skeletons | "No work items found": Contextual trigger to create first task | Filter reset button if query yields 0 results |
| **Cycles (`CYC-001`)** | Burndown/board skeletons | "No active cycle": Call to action for Lead to start a cycle | Graceful notice if Cycles capability is disabled |
| **Planning (`CYC-002`)**| Dual-pane card skeletons | "Backlog empty": Prompt to create candidate work | Warning if cycle exceeds planned capacity |
| **Projects (`TEM-004`)**| Project card skeletons | "No active projects": Call to action to create/link a project | Error boundary with retry |
| **Docs (`TEM-005`)** | Document list skeletons | "No team documents": Button to create team runbook or RFC | Permissions fallback |
| **Members (`TEM-007`)**| Roster row skeletons | Minimal squad state (1 lead) | Invite restricted to Admins/Leads |

---

## 25. Performance & Scale Guidelines

Team Hub is designed for large-scale enterprise repositories:
1. **Virtualization / Windowing:** Used when rendering large row or card lists in `Grid`, `Board`, or planning panes.
2. **Cursor-Based Keyset Pagination:** Queries must be compatible with cursor pagination. Cursor shapes correspond to the deterministic server sort and include a stable unique tie-breaker.
3. **Optimistic UI Updates:** Status changes, cycle assignments, and backlog reordering apply immediately to local cache with automatic rollback on rejection.
4. **Normalized Entity Caching:** Changes to WorkItems reflect across `My Work`, `Inspector`, and `Command Palette` without duplicate data fetching.

---

## 26. Component Architecture (Conceptual)

The feature architecture establishes clear domain boundaries:

```text
src/features/teams/
├── components/
│   ├── TeamHub               # Master resource container (TEM-001)
│   ├── TeamHeader            # Identity header & actions
│   ├── TeamResourceNav       # Contextual ResourceNav strip
│   ├── TeamOverview          # Operational landing cockpit (TEM-002)
│   ├── TeamWork              # Universal execution canvas (TEM-003)
│   ├── TeamProjects          # Project rollup catalogue (TEM-004)
│   ├── TeamDocs              # Contextual knowledge collection (TEM-005)
│   ├── TeamMembers           # Squad roster & capacity (TEM-007)
│   └── TeamSettings          # Settings & capabilities presentation (TEM-008)
├── hooks/
│   ├── useTeam
│   ├── useTeamWorkQuery
│   ├── useTeamDocumentsQuery
│   └── useTeamCapabilities
└── model/

src/features/cycles/
├── components/
│   ├── ActiveCycleCockpit    # Execution cockpit (CYC-001)
│   ├── CyclePlanning         # Dual-pane planning workbench (CYC-002)
│   └── CycleRolloverReview   # Explicit completion rollover review
├── hooks/
│   ├── useActiveCycle
│   └── useCyclePlanning
└── model/
```
Exact component filenames and presentation containers (modal, drawer, page) remain implementation choices. What is frozen are the component responsibilities and domain ownership boundaries.

---

## 27. Accessibility (WCAG 2.2 AA Target)

1. **Landmarks & Roles:**
   - Header is marked `<header role="banner">` within the team container.
   - Resource navigation is marked `<nav aria-label="Team Resource Navigation">`.
   - Primary content is wrapped in `<main id="team-content">`.
2. **Keyboard Focus & Ring Invariants:**
   - Active tab carries `aria-selected="true"` and `tabIndex={0}`; inactive tabs have `tabIndex={-1}` with ArrowLeft/ArrowRight navigation.
   - Clear focus indicators on all interactive buttons, rows, and pickers.
3. **Screen Reader Announcements:**
   - Cycle progress announced via accessible progress semantics.
   - Inbound triage arrival and rollover review updates announce via `aria-live="polite"`.

---

## 28. Non-Goals

The following are explicitly **NOT** part of UI-05A:
- Implementation of production React components or state hooks (deferred to `UI-05B`).
- Backend database schema or API route implementations.
- Real-time WebSocket subscriptions or event streaming.
- Implementation of `TEM-006 (Team Triage Queue)` (frozen as POST-CORE).
- Implementation of `CYC-003 (Cycle History Directory)` (frozen as POST-CORE).
- Custom multi-quarter portfolio roadmap engines (owned by `INT-001`).
- Redesign of the Application Shell, Sidebar, Inspector, or Design Tokens.

---

## 29. Frozen Decisions vs. Tunable Decisions

```text
┌───────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────┐
│ FROZEN PRODUCT DECISIONS (ARCHITECTURAL INVARIANTS)       │ TUNABLE / IMPLEMENTATION DECISIONS                        │
├───────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ • Team is a first-class Workspace resource               │ • Exact pixel dimensions (heights, widths, paddings)      │
│ • Canonical topology (Workspace contains Teams, Projects) │ • Exact responsive breakpoint numbers (e.g. 900, 1200)    │
│ • Team Hub purpose (Operational home, not vanity KPI)     │ • Exact URL route paths and query parameter strings       │
│ • ResourceNav semantic structure (Overview, Work, Cycles) │ • Physical shortcut key bindings (reconciled in registry) │
│ • WorkItem query model (Queries canonical WorkItems)      │ • Physical database persistence shape for Cycle ↔ Item    │
│ • Backlog semantic model (Query state, not an entity)     │ • Capacity estimation unit (Story Points, Hours, Counts)  │
│ • Team-owned Cycle (Strict 1:1 team ownership)            │ • Optional capacity model configuration                   │
│ • Single active Cycle invariant                           │ • Choice of optional charts/visualizations (Burndown mini)│
│ • Incomplete items never silently auto-roll               │ • Drag-and-drop library choice for planning               │
│ • Cross-team Project relationship (Lead vs Participating) │ • Virtualization item-count mounting thresholds           │
│ • Capability-aware navigation (Cycles, Triage, Estimates) │ • Server cursor encoding format                           │
│ • Semantic RBAC permission model                          │ • Preference persistence technology (user/resource scoped)│
│ • Strict query & mutation domain boundaries               │ • Exact component filenames and container presentations   │
│ • Centralized keyboard architecture (Zero rogue listeners)│ • Presentation container for Team Settings (Page, Drawer) │
└───────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 30. UI-05B Implementation Readiness Checklist

When authorized to implement `UI-05B`, the implementation must deliver:
- [ ] Team Hub container (`TEM-001`) with responsive layout.
- [ ] Compact Team Identity Header with metadata and Quick Create trigger.
- [ ] Capability-aware ResourceNav strip (`Overview`, `Work`, `Cycles`, `Projects`, `Docs`, `Members`).
- [ ] Team Overview cockpit (`TEM-002`) with active cycle operational snapshot and project rollups.
- [ ] Team Work stream (`TEM-003`) reusing canonical `DataGrid` and `KanbanBoard`.
- [ ] Active Cycle cockpit (`CYC-001`) and Planning workbench (`CYC-002`).
- [ ] Centralized keyboard registration via `registerViewKeyboardHandler`.
- [ ] Automated Vitest suite validating queries, capability toggles, rollover logic, and keyboard scope.
