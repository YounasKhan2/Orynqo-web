# UI-05A — Team Hub Product & UX Contract

- **Document Version:** `1.0.0`
- **Surface Identifier:** `TEM-001` (Team Hub Resource Page)
- **Status:** **PROPOSED PRODUCT & UX SPECIFICATION — PENDING HUMAN REVIEW**
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
4. **Team-Owned Cycles, Multi-Team Projects:** A `Cycle` is strictly owned by one Team. A `Project` is a workspace resource that may span multiple Teams (distinguishing Lead Team from Participating Teams).
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
  - **Adapt** with a high-density `Overview` (`TEM-002`) combining active cycle burndown/progress, multi-team project participation, pinned runbooks, and roster capacity into a unified operational canvas.

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
  - **Reject** low-density marketing-style landing layouts. Orynqo enforces dense 28px/34px rows, compact headers, and instant keyboard navigation.

### 2.4. ClickUp (Spaces, Folders & Sprint Lists)
- **Useful Behavior:**
  - Flexible capability toggles (ClickApps for Sprints, Points, Custom Fields).
- **Limitation / Problem:**
  - Deep, confusing spatial hierarchy (Workspace $\rightarrow$ Space $\rightarrow$ Folder $\rightarrow$ List $\rightarrow$ Task $\rightarrow$ Subtask) causing navigation disorientation.
  - "Card Dashboard Syndrome": Team dashboards are littered with disconnected widgets and vanity charts that distract from active execution.
- **Orynqo Decision:**
  - **Adopt** capability-aware team toggles (`cyclesEnabled`, `triageEnabled`, `estimatesEnabled`).
  - **Reject** arbitrary multi-level nested folders. Orynqo maintains a clean, flat domain hierarchy: Workspace $\rightarrow$ Team $\rightarrow$ WorkItems / Cycles / Projects.
  - **Reject** decorative KPI dashboards. Team Hub is an operational execution cockpit.

---

## 3. Team Domain Definition & Canonical Ownership

In Orynqo's architecture, the workspace is the sovereign tenancy boundary. A `Team` is a first-class resource within the workspace.

```text
Organization
  └─ Workspace
       ├─ Teams (TEM-001)
       │    ├─ Capabilities (cycles, triage, estimates)
       │    ├─ Team Roles (Lead, Contributor, Guest)
       │    └─ Cycles (CYC-001, CYC-002) [Team-Owned]
       ├─ Projects (PRJ-001) [Workspace Resource, Cross-Team]
       ├─ Initiatives (INT-001) [Strategic Strategic Portfolio]
       ├─ Documents (DOC-001) [Canonical Knowledge Base]
       └─ WorkItems (WRK-001) [Canonical Execution Units]
```

### 3.1. Entity Relationships
1. **WorkItem $\leftrightarrow$ Team:**
   - Every WorkItem has exactly one `owningTeamId`.
   - Work items belong canonically to the workspace and are partitioned by team ownership.
   - Team pages query `WorkItems WHERE owningTeamId = currentTeam.id`.
2. **Cycle $\leftrightarrow$ Team:**
   - A `Cycle` is **strictly team-owned** (`cycle.teamId = currentTeam.id`).
   - A Cycle cannot span multiple teams. Teams plan, execute, and calibrate velocity autonomously.
   - WorkItems participate in a Cycle via canonical scheduling attribute: `workItem.cycleId = currentCycle.id`.
3. **Project $\leftrightarrow$ Team:**
   - A `Project` is a **workspace-level resource**.
   - Projects may require cross-functional collaboration. Each project has:
     - `leadTeamId`: The team with primary delivery accountability.
     - `participatingTeamIds`: Teams contributing work items to the project.
   - `TEM-004 (Team Projects)` queries all projects where `leadTeamId === team.id || participatingTeamIds.includes(team.id)`.
4. **Document $\leftrightarrow$ Team:**
   - Documents are canonical workspace entities (`DOC-001`).
   - `TEM-005 (Team Docs)` queries documents contextually tagged or owned by the team (`document.teamId === team.id || document.associatedTeamIds.includes(team.id)`).
5. **Milestone $\leftrightarrow$ Project:**
   - A `Milestone` remains project-owned. It is never nested directly under a Team or Cycle.

---

## 4. Team Hub Purpose

Opening a Team Hub (`TEM-001`) delivers immediate operational clarity. It serves three distinct actor groups:

| Actor Group | Operational Question | Primary Surface |
| :--- | :--- | :--- |
| **Team Members (Engineers, Designers)** | *"What are we executing in this cycle, what is blocked, and what should I pick up next?"* | `Overview` (`TEM-002`), `Work` (`TEM-003`), `Active Cycle` (`CYC-001`) |
| **Team Leads & Product Managers** | *"How is our cycle tracking, what is our backlog health, and how are our projects progressing?"* | `Cycle Planning` (`CYC-002`), `Projects` (`TEM-004`), `Capacity` (`TEM-007`) |
| **Cross-Team Collaborators & Stakeholders** | *"What does this team do, who is the lead, what are their runbooks, and where do I submit inbound work?"* | `Overview` (`TEM-002`), `Team Docs` (`TEM-005`), `Triage` (`TEM-006`) |

---

## 5. Resource Navigation Contract

The Team Hub provides persistent top-level ResourceNav tabs located in the shell's sub-header strip (`ResourceNavStrip`, height `36px`).

```text
[ TEM-001 Team Hub ]
└── ResourceNav: [ Overview ] [ Work ] [ Cycles ] [ Projects ] [ Docs ] [ Triage ] [ Members ] ... [ ⚙ Settings ]
```

### 5.1. Tab Registry & Capability Matrix

| Tab Label | Registry ID | Scope / Purpose | Phase | Visibility Rule | Permission Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Overview** | `TEM-002` | Operational landing cockpit: active cycle snapshot, project rollups, pinned docs, roster preview | **CORE** | Always visible | Readable by all team viewers |
| **Work** | `TEM-003` | Complete team execution stream (Active, Backlog, Closed) with Grid/Board projections | **CORE** | Always visible | Readable by all team viewers |
| **Cycles** | `CYC-001` / `CYC-002` | Sprint/iteration execution (`CYC-001`) and backlog planning (`CYC-002`) | **CORE** | Visible if `team.capabilities.cyclesEnabled === true` | Readable by team viewers; planning requires Contributor+ |
| **Projects** | `TEM-004` | Curated catalogue of projects led by or involving this squad | **CORE** | Always visible | Readable by all team viewers |
| **Docs** | `TEM-005` | Team knowledge base: runbooks, architectural RFCs, meeting notes | **CORE** | Always visible | Readable by all team viewers |
| **Triage** | `TEM-006` | Inbound intake queue for unvetted tickets, bugs, and requests | **POST-CORE** | Visible if `team.capabilities.triageEnabled === true` | Contributor+ to triage; viewers see status |
| **Members** | `TEM-007` | Team roster, roles (Lead, Contributor, Guest), and capacity allocation | **CORE** | Always visible | Readable by all team viewers |

### 5.2. Team Settings Placement & Navigation Rule
- **Settings (`TEM-008`):** Team Settings is **not** a standard primary ResourceNav tab to prevent cluttering the operational workspace.
- **Entry Points:**
  1. Header action: A dedicated gear icon button `[ ⚙ Team Settings ]` on the right side of the Team Identity Header (visible only to Team Leads and Workspace Admins).
  2. Overflow menu `[ ... ]` in the Team Header.
  3. Omnisearch / Command Palette `⌘K`: Search `"Team Settings: <Team Name>"`.
- **Architectural Law:** The Sidebar joined teams list never duplicates resource tabs. Clicking a team in the sidebar always routes to the last active resource tab (or `Overview` by default).

---

## 6. Team Identity Header Contract

The Team Header is a compact, high-density component (`height: 48px`, padding `0 16px`) rendered persistently above the ResourceNav strip. It establishes team context without consuming valuable vertical workspace.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Icon]  Core Platform  [CORE]  •  Lead: @sarah  •  8 members   [Search Team...]  [+ New Item] [⚙]│
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.1. Header Properties & Information
1. **Team Icon / Avatar:** 24x24px visual team token with fallback initials or curated SVG glyph.
2. **Team Name:** Semi-bold primary typography (`var(--text-md)`).
3. **Team Key / Prefix:** Distinctive monospace badge (e.g. `CORE`, `MBL`, `DS`) used for ticket identifiers.
4. **Metadata Strip (Compact):**
   - **Lead:** Avatar + clickable handle (`@sarah`) linking to user profile.
   - **Membership Indicator:** Interactive badge (`8 members`) that jumps to the `Members` tab.
   - **Capability Indicators:** Subtle pill indicators only when non-standard capabilities are active (e.g. `Triage Active`).
5. **Purpose / Description:**
   - *Collapsed/Default:* Truncated single-line mission tooltip on hover.
   - *Full Description:* Rendered inside the `Overview` tab charter card, never occupying permanent header height.

### 6.2. Header Actions
- **Primary Action:** `[ + New Item ]` (Contextual Quick Create pre-filling `teamId = team.id`).
- **Contextual Search / Filter:** Search input trigger (`⌘F` or `/`) filtering within the active team scope.
- **Favorite Toggle:** Star button toggling personal sidebar favorite (`orynqo.favorites`).
- **Team Settings Trigger:** Gear icon `[ ⚙ ]` (permission-gated to Team Lead / Admin).
- **Overflow Menu `[ ... ]`:** Copy team link, manage notifications, export data.

---

## 7. Team Overview Boundary (`TEM-002`)

The `Overview` tab is the default landing surface for `TEM-001`. It provides an executive and operational synthesis without falling into "vanity card dashboard syndrome."

```text
┌───────────────────────────────────────────────────────────┬──────────────────────────────────────┐
│ ACTIVE CYCLE (Cycle 42: "Q3 Stability & Perf")             │ TEAM CHARTER & ROSTER                │
│ Dates: Sep 15 – Sep 29 (4 days remaining)                 │ Mission: Core engine reliability,    │
│ Progress: 18 / 24 completed (75%) • 2 Blocked             │ performance budgets, API contracts.  │
│ [ Burndown Mini-Graph ] [ View Active Cycle → ]           │ Lead: @sarah • 8 active contributors │
├───────────────────────────────────────────────────────────┼──────────────────────────────────────┤
│ ACTIVE PROJECTS (3)                                       │ PINNED RUNBOOKS & DOCS (4)           │
│ • API Gateway v2 [Lead] ────────── 82% (On Track)         │ 📄 Production Incident Playbook      │
│ • Workspace Auth Migration [Part] ─ 45% (At Risk)         │ 📄 Database Sharding RFC             │
│ • Design Tokens v2 [Part] ──────── 95% (Completed)        │ 📄 On-Call Escalation Matrix         │
├───────────────────────────────────────────────────────────┴──────────────────────────────────────┤
│ RECENT TEAM DISCUSSIONS & ACTIVITY (Compact 5-event operational stream)                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 7.1. Information Sections
1. **Active Cycle Execution Snapshot:**
   - Rendered only if `cyclesEnabled === true`.
   - Displays cycle name/number, target end date, business days remaining, progress percentage, and attention flags (count of `Blocked` or `Overdue` items).
   - Direct link: `[ View Active Cycle → ]` (switches to `CYC-001`).
2. **Team Charter & Roster Preview:**
   - Concise statement of team mission/responsibilities.
   - Team lead, on-call engineer (if integrated), and active contributor count.
3. **Active Projects Rollup:**
   - Lists projects where `teamId === leadTeamId` or `participatingTeamIds.includes(teamId)`.
   - Distinct badge: `[Lead Team]` vs `[Participant]`.
   - Visual progress bar and health status (`On Track`, `At Risk`, `Off Track`).
4. **Pinned Team Resources & Runbooks:**
   - Fast access to high-frequency team documents (on-call runbooks, architectural standards, sprint retrospectives).
5. **Operational Activity Stream (Compact):**
   - 5 most recent meaningful domain events (completed work items, project milestone achievements, RFC publications).
   - Strictly operational; never replicates personal notification triage (`Inbox`).

---

## 8. Team Work Boundary (`TEM-003`)

The `Work` tab is the complete, virtualized execution stream of all canonical work items owned by the team.

### 8.1. Query Semantics
```text
SELECT * FROM WorkItems
WHERE workspaceId = :workspaceId
  AND owningTeamId = :currentTeamId
  AND (status NOT IN ('archived', 'deleted'))
```

### 8.2. Projections & View Controls
- **Available Projections:**
  - `Grid` (`WRK-001`): Universal high-density data grid with multi-sort, column reordering, inline property pickers, and bulk actions.
  - `Board` (`WRK-002`): Kanban projection grouped by workflow status columns.
  - `Timeline` (`WRK-003`): Gantt/schedule projection plotted against start and due dates.
  - `Workload` (`WRK-004`): Capacity distribution per assignee (*POST-CORE*).
- **Default Projection:** `Grid` (or user's remembered local preference via `orynqo.teamWork.projection`).
- **Standard Filter Sub-bar:**
  - Status group tabs: `Active Work` (In Progress, Todo, In Review), `Backlog` (Unscheduled/Uncommitted), `Completed` (Done, Canceled), `All Items`.
  - Filters: Assignee, Priority, Project, Cycle, Label, Attention state.

### 8.3. Quick Create Context
Triggering Quick Create (`c` or header button) from Team Work pre-populates:
- `teamId = currentTeam.id` (Fixed/Immutable context)
- `status = currentTeam.workflow.defaultStatus`
- Leaves `assigneeId`, `projectId`, and `cycleId` unassigned unless explicitly filtered by those dimensions in the active view.

---

## 9. Backlog Semantics

A critical failure mode of legacy tools (e.g. Jira, Azure DevOps) is treating "Backlog" as a separate physical entity, separate database table, or disconnected page.

### 9.1. Orynqo Canonical Backlog Invariant
> **The Backlog is a canonical query and planning state over Team WorkItems, NEVER a separate container, duplicate record, or detached entity.**

### 9.2. Exact Backlog Query Definition
A WorkItem is classified as belonging to the **Team Backlog** if and only if it satisfies all of the following conditions:
1. `owningTeamId === currentTeam.id`
2. `status.category === 'unstarted' || status.name.toLowerCase() === 'backlog'`
3. `cycleId === null` (Not committed to any active or upcoming cycle)
4. `completedAt === null && canceledAt === null && archivedAt === null`

### 9.3. Backlog vs Active Execution
- **Active Execution Item:** An item committed to an execution container (`cycleId !== null`) OR an item actively underway (`status.category === 'started'`).
- **Backlog Item:** Potential future work that has been vetted and accepted into the team's scope but is not currently committed to a delivery timebox.
- **Triage Item (`TEM-006`):** Inbound, unvetted work arriving from external teams or users that has not yet been accepted into the Backlog.

---

## 10. Cycle Model Contract (`CYC`)

A `Cycle` (also known as Sprint or Iteration) is a timeboxed commitment period during which a team focuses on delivering a scoped set of work items.

### 10.1. Conceptual Domain Model
```typescript
interface Cycle {
  id: string;                      // Unique identifier (e.g. "cyc-core-42")
  workspaceId: string;             // Owning workspace boundary
  teamId: string;                  // Owning team (Strict 1:1 ownership)
  number: number;                  // Sequential cycle index (e.g. 42)
  name: string;                    // Optional thematic title (e.g. "Gateway Stabilization")
  status: 'upcoming' | 'active' | 'completed';
  startAt: string;                 // ISO-8601 UTC timestamp
  endAt: string;                   // ISO-8601 UTC timestamp
  goal?: string;                   // High-level thematic sprint objective
  capacityPoints?: number;         // Planned velocity / story point budget
  completedPoints?: number;        // Final burned story points upon completion
  createdAt: string;
  updatedAt: string;
}
```

### 10.2. Invariant Rules
1. **One Active Cycle Rule:** A Team may have at most **one** Cycle in `active` status at any point in time.
2. **Timezone Determinism:** Cycle start and end dates are stored in UTC and resolved to the user's localized working hours using the established `dateUtils` domain engine.
3. **No Cross-Team Cycles:** Cycles cannot be shared across multiple teams. Shared cross-team deliverables are coordinated via `Project` milestones, not shared Cycles.

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
   - Authorized: Team Lead or Workspace Admin.
   - Validates that no other cycle is currently `active` for this team.
   - Locks the initial commitment scope snapshot for burndown/velocity calculation.
2. **Active $\rightarrow$ Completed (`Complete Cycle`):**
   - Authorized: Team Lead or Workspace Admin.
   - Finalizes completion metrics (`completedPoints`, `uncompletedCount`).
   - Marks the cycle as `completed` (immutable historical archive).
   - **Triggers Rollover Review Workflow.**

### 11.2. The Frozen Rollover Invariant
> **CRITICAL LAW: Incomplete committed items do NOT silently auto-roll into the next cycle.**

- **Rationale:** Automatic rollover silently pollutes future sprint commitments, hides chronic over-scoping, and inflates velocity falsehoods.
- **Rollover Review Experience:**
  When a cycle is completed with uncompleted items, the user is presented with the explicit Rollover Dialog:
  - Option A: Move uncompleted items to **Backlog** (clears `cycleId = null`).
  - Option B: Move uncompleted items to the **Next Upcoming Cycle** (`cycleId = nextCycle.id`).
  - Option C: Granular selection (cherry-pick items to roll forward vs return to backlog).

---

## 12. Backlog ↔ Cycle Planning Boundary (`CYC-002`)

`CYC-002` provides a high-density, dual-pane planning workbench designed for rapid backlog refinement and sprint assembly.

```text
┌───────────────────────────────────────────────┬───────────────────────────────────────────────┐
│ TEAM BACKLOG (48 items • 124 pts)             │ UPCOMING CYCLE (Cycle 43 • Target: 40 pts)     │
│ [Search Backlog...] [Filter: Priority ▾]      │ Dates: Sep 30 – Oct 14 • Committed: 34 pts    │
├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ [::] CORE-108  API Rate Limiting     5 pts P1 │ [::] CORE-94   OAuth Token Revocation 3 pts P0│
│ [::] CORE-112  Optimize Query Plan   8 pts P2 │ [::] CORE-99   Audit Log Retention    5 pts P1│
│ [::] CORE-115  Redis Cluster Failover3 pts P2 │ [::] CORE-102  Session Invalidation   8 pts P1│
│ [::] CORE-120  Metrics Exporter      2 pts P3 │ [::] CORE-105  TLS Handshake Tuning   5 pts P2│
│ ... (virtualized scroll)                      │ ... (virtualized scroll)                      │
├───────────────────────────────────────────────┴───────────────────────────────────────────────┤
│ Keyboard: Space = Select • M = Move to Target Pane • J/K = Navigate • Enter = Open Inspector   │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 12.1. Planning Operations
1. **Move Item to Upcoming Cycle:** Updates `workItem.cycleId = upcomingCycle.id`.
2. **Remove Item from Cycle:** Updates `workItem.cycleId = null` (returns to backlog).
3. **Rank / Reorder:** Adjusts deterministic ordering within the backlog or cycle queue.
4. **Bulk Planning:** Multi-select items via checkboxes (`x`) and move as a batch (`m`).
5. **Universal Property Pickers:** Adjust priority, estimates, or assignees directly within the planning rows without opening full edit modals.

### 12.2. Interaction Modes
- **Pointer:** Drag-and-drop between panes.
- **Keyboard (Zero-Mouse Invariant):**
  - Space: Toggle multi-selection.
  - `m` or `Shift+RightArrow`: Move selected item(s) from Backlog to Upcoming Cycle.
  - `Shift+LeftArrow`: Move selected item(s) from Cycle back to Backlog.
  - `Enter`: Open canonical WorkItem Inspector.

---

## 13. Active Cycle Execution Boundary (`CYC-001`)

`CYC-001` is the operational cockpit during active sprint delivery. It focuses entirely on execution momentum and blocker remediation.

### 13.1. Surface Elements
1. **Sprint Header Strip:**
   - Cycle Number & Goal.
   - Date range with business days remaining badge (e.g. `3 days left`).
   - Story point velocity meter (`28 / 36 pts completed`).
   - Attention alerts (`2 items blocked`, `1 overdue`).
2. **Primary Execution Canvas:**
   - Visual projections: `Board` (Kanban columns: Todo, In Progress, In Review, Done) or `Grid` (Dense tabular list).
   - Projection switching preserves active filters and selection.
3. **Contextual Inspector:**
   - Selecting any row or card opens the canonical `WorkItemDetailContainer` in the right split-pane (desktop) or slide-over drawer (compact).

---

## 14. Project Relationship (`TEM-004`)

Projects are workspace-level initiatives that aggregate work towards major milestones. Teams interact with projects through distinct participation roles.

### 14.1. Lead Team vs Participating Team
```typescript
interface Project {
  id: string;
  name: string;
  leadTeamId: string;              // Primary team responsible for delivery
  participatingTeamIds: string[];  // Contributing teams
  status: 'planning' | 'in_progress' | 'paused' | 'completed';
}
```

### 14.2. Team Projects Query (`TEM-004`)
- **Query Definition:**
  ```text
  SELECT * FROM Projects
  WHERE workspaceId = :workspaceId
    AND (leadTeamId = :teamId OR :teamId = ANY(participatingTeamIds))
    AND status != 'archived'
  ```
- **UI Representation:**
  - Grouped or badged by role: `[Lead Team]` (High priority, primary ownership) vs `[Contributing Team]`.
  - Displays count of work items owned by this team within the project.
  - Clicking a project routes to `PRJ-001 (Project Hub)`, preserving context.

---

## 15. Team Docs (`TEM-005`)

Team Docs organizes canonical knowledge artifacts contextually relevant to the squad.

### 15.1. Categorization & Query
- **Query:** Canonical Documents where `document.teamId === currentTeam.id || document.associatedTeamIds.includes(currentTeam.id)`.
- **Standard Categories:**
  1. **Pinned Runbooks & Playbooks:** Critical incident procedures, on-call escalations.
  2. **Technical Specs & RFCs:** Living specifications and architecture decisions.
  3. **Meeting Notes & Retrospectives:** Cycle planning notes, post-mortems.
- **Living Spec Integration:** Living Specs remain a specialized Document capability (`DOC-001`), linking canonical WorkItems directly to requirements.

---

## 16. Team Members & Capacity (`TEM-007`)

`TEM-007` provides squad roster visibility and sprint capacity planning.

### 16.1. Roster Information
- **Member Identity:** Name, handle (`@username`), avatar, workspace role.
- **Team Role:**
  - `Team Lead`: Manages team settings, workflows, and cycle lifecycles.
  - `Contributor`: Plans cycles, creates and edits work items.
  - `Guest / Viewer`: Read-only access to team work.
- **Active Workload Rollup:**
  - Count of active items assigned to each member in the current cycle.
  - Total committed story points.
- **Target Capacity:**
  - Configurable target capacity per member (default story points per cycle).
  - Used by `CYC-002` planning to warn against sprint over-allocation.

---

## 17. Team Capabilities Model

Teams in Orynqo are modular and capability-aware. Different functional squads require different operational tools (e.g. an Engineering team uses Cycles and Estimates; a Legal/HR team uses simple Work lists and Triage).

### 17.1. Capability Flags
```typescript
interface TeamCapabilities {
  cyclesEnabled: boolean;          // Enables CYC-001, CYC-002, and Cycle pickers
  triageEnabled: boolean;          // Enables TEM-006 inbound triage queue
  estimatesEnabled: boolean;       // Enables story point estimations on WorkItems
  workloadEnabled: boolean;        // Enables capacity & workload projections
}
```

### 17.2. Capability Invariants
1. **Navigation Adaptability:** When a capability is disabled (e.g. `cyclesEnabled === false`), its corresponding ResourceNav tab (`Cycles`) is hidden.
2. **Graceful Historical Retention:** Disabling a capability does **not** delete historical data. If `cyclesEnabled` is toggled off:
   - Existing work items retain their historical `cycleId` attributes.
   - Completed cycle metrics remain preserved in the database.
   - The UI simply ceases offering active cycle scheduling or planning views.
3. **Quick Create Adaptability:** Quick Create hides irrelevant fields (e.g. Estimation Points, Cycle Picker) when their capabilities are disabled for the target team.

---

## 18. Permissions & Visibility

Team permissions strictly adhere to Orynqo's four-tier authorization hierarchy:

$$\text{Organization Role} \rightarrow \text{Workspace Role} \rightarrow \text{Team Role} \rightarrow \text{Entity Override}$$

### 18.1. Team Visibility Tiers
1. **Public Workspace Team:** Discoverable by all workspace members in `TEM-009 (Teams Directory)`. Any workspace member can join or view work.
2. **Private / Membership-Gated Team:** Discoverable only by invited members or workspace admins. Unauthorized users cannot see team names, work items, or documents in search.

### 18.2. Action Authorization Matrix

| Action | Workspace Admin | Team Lead | Team Contributor | Workspace Member / Guest |
| :--- | :---: | :---: | :---: | :---: |
| **View Team Hub & Work** | ✅ | ✅ | ✅ | ✅ (If public) |
| **Create WorkItem in Team** | ✅ | ✅ | ✅ | ❌ (Must submit via Triage) |
| **Edit Team Settings (`TEM-008`)**| ✅ | ✅ | ❌ | ❌ |
| **Manage Roster & Roles** | ✅ | ✅ | ❌ | ❌ |
| **Toggle Capabilities** | ✅ | ✅ | ❌ | ❌ |
| **Start / Complete Cycle** | ✅ | ✅ | ❌ | ❌ |
| **Plan Cycle / Rank Backlog** | ✅ | ✅ | ✅ | ❌ |
| **Triage Inbound Queue (`TEM-006`)**| ✅ | ✅ | ✅ | ❌ |

---

## 19. Query Boundaries & Contracts

To maintain complete technology neutrality (supporting future TanStack Query, SWR, or GraphQL without UI changes), we define abstract query contracts:

### 19.1. `useTeam(teamId)`
- **Input:** `{ workspaceId: string, teamId: string }`
- **Output:** `{ team: Team, capabilities: TeamCapabilities, userRole: TeamRole, isLoading: boolean, error: Error | null }`

### 19.2. `useTeamWorkQuery(params)`
- **Input:** `{ teamId: string, tab: 'active' | 'backlog' | 'completed' | 'all', filters: WorkFilterState, sort: SortCriteria, pagination: KeysetCursor }`
- **Output:** `{ items: WorkItem[], totalCount: number, pageInfo: PageInfo, isLoading: boolean }`

### 19.3. `useTeamCyclesQuery(teamId)`
- **Input:** `{ teamId: string, status?: 'active' | 'upcoming' | 'completed' }`
- **Output:** `{ activeCycle: Cycle | null, upcomingCycles: Cycle[], historicalCycles: Cycle[], isLoading: boolean }`

### 19.4. `useTeamProjectsQuery(teamId)`
- **Input:** `{ teamId: string, role?: 'lead' | 'participant' | 'all' }`
- **Output:** `{ ledProjects: Project[], participatingProjects: Project[], isLoading: boolean }`

### 19.5. `useTeamMembersQuery(teamId)`
- **Input:** `{ teamId: string }`
- **Output:** `{ members: TeamMember[], lead: TeamMember, capacitySummary: CapacitySummary, isLoading: boolean }`

---

## 20. Mutation Boundaries & Domain Ownership

Cross-domain boundaries must remain strictly decoupled:

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

1. **Team Feature:** Owns team metadata, capabilities, and membership. It **never** executes direct SQL/store writes against WorkItems.
2. **Cycle Feature:** Owns cycle scheduling and rollover workflows. Cycle assignments delegate to canonical `updateWorkItem({ id, cycleId })`.
3. **Execution Core:** Owns canonical WorkItem mutations, optimistic updates, and rollback logic.

---

## 21. Keyboard & Focus Engine

Team surfaces integrate seamlessly into the centralized keyboard architecture established in UI-04B:

$$\text{GLOBAL} \rightarrow \text{PAGE/VIEW (Team Hub Commands)} \rightarrow \text{OVERLAY} \rightarrow \text{EDITABLE CONTROL}$$

### 21.1. Semantic Key Bindings

| Key Combination | Semantic Action | Scope Precedence |
| :--- | :--- | :--- |
| `1` – `7` | Switch ResourceNav tabs (`1`: Overview, `2`: Work, `3`: Cycles, etc.) | PAGE/VIEW |
| `c` | Open Quick Create with active `teamId` pre-filled | GLOBAL (if not in editable) |
| `/` or `⌘F` | Focus contextual Team search bar | PAGE/VIEW |
| `j` / `k` / `ArrowDown` / `ArrowUp` | Navigate work item rows or planning cards | PAGE/VIEW |
| `Enter` | Open canonical Inspector for focused work item | PAGE/VIEW |
| `Escape` | Close Inspector, clear selection, or dismiss open picker | OVERLAY / TOPMOST |
| `m` (in Planning) | Move selected item between Backlog $\leftrightarrow$ Upcoming Cycle | PAGE/VIEW (`CYC-002`) |
| `x` | Toggle row/card selection for bulk triage | PAGE/VIEW |

---

## 22. URL & Deep-Link State Contract

URL routes represent authoritative navigation state. Reloading or sharing a URL reconstructs the exact workspace view:

```text
https://app.orynqo.com/:workspaceId/teams/:teamKey/:subResource?projection=:type&filter=:hash&selected=:itemId
```

### 22.1. Canonical URL Structure
- **Team Overview:** `/:workspaceId/teams/CORE` (Default sub-resource is `overview`)
- **Team Work:** `/:workspaceId/teams/CORE/work?projection=grid&status=active`
- **Active Cycle:** `/:workspaceId/teams/CORE/cycles/active?projection=board`
- **Cycle Planning:** `/:workspaceId/teams/CORE/cycles/planning`
- **Team Projects:** `/:workspaceId/teams/CORE/projects`
- **Team Docs:** `/:workspaceId/teams/CORE/docs`
- **Team Members:** `/:workspaceId/teams/CORE/members`
- **Team Settings:** `/:workspaceId/teams/CORE/settings` (Permission-gated)

---

## 23. Responsive Behavior & Breakpoints

Team Hub responds adaptively to viewport dimensions using Orynqo's standard breakpoint tokens:

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ WIDE DESKTOP (> 1200px): Full Sidebar + Header + ResourceNav + Dual Canvas / Split Inspector    │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ COMPACT LAPTOP / TABLET (900px – 1200px): Collapsed Sidebar + Stream Canvas + Overlay Inspector │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ MOBILE (< 900px): Hidden Sidebar (Drawer) + Horizontal Scroll ResourceNav + Full-width View     │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Wide Desktop (> 1200px):**
   - Inspector mounts as a horizontal split-pane (`--inspector-width: 440px`), reducing canvas width cleanly without horizontal scrollbars.
   - Cycle planning displays side-by-side dual panes (Backlog on left, Cycle on right).
2. **Compact Viewport (900px – 1200px):**
   - Inspector opens as a slide-over drawer anchored right with an elevated backdrop (`z-index: 50`).
3. **Mobile (< 900px):**
   - Sidebar moves to an off-canvas drawer.
   - ResourceNav tabs collapse into a touch-scrollable horizontal strip.
   - Dual-pane cycle planning stacks vertically (Backlog tab $\leftrightarrow$ Cycle tab switcher).

---

## 24. Loading, Empty, and Error States

Every sub-surface specifies explicit, high-polish operational states:

| Sub-Surface | Loading State | Empty State | Error / Forbidden State |
| :--- | :--- | :--- | :--- |
| **Team Hub Root** | Shell skeleton with header pulse | N/A (Redirects to Teams Directory if not found) | 404 Not Found or 403 Forbidden with "Request Access" action |
| **Overview (`TEM-002`)** | Skeleton cards for Cycle, Projects, and Roster | "New Team": Guides Lead to configure charter and create first cycle | Error banner with retry affordance |
| **Work (`TEM-003`)** | Virtualized row skeletons | "No work items found": Contextual trigger to create first task | Filter reset button if query yields 0 results |
| **Cycles (`CYC-001`)** | Burndown and board skeletons | "No active cycle": Call to action for Lead to `[ Start a Cycle ]` | Graceful notification if Cycles capability is disabled |
| **Planning (`CYC-002`)**| Dual-pane card skeletons | "Backlog empty": Prompt to create or ingest candidate work | Warning if target cycle exceeds capacity |
| **Projects (`TEM-004`)**| Project card skeletons | "No active projects": Call to action to create or join a project | Error boundary with retry |
| **Docs (`TEM-005`)** | Document list skeletons | "No team documents": Button to create team runbook or RFC | Permissions fallback |
| **Members (`TEM-007`)**| Roster row skeletons | Minimal squad state (1 lead) | Member invite restricted to Admins/Leads |

---

## 25. Performance & Scale Guidelines

Team Hub is engineered to perform smoothly in high-scale enterprise environments:

1. **Virtualization & Windowing:**
   - Both `Grid` and `Board` projections must virtualize rows/cards when rendering $> 100$ items.
   - Planning dual-pane lists (`CYC-002`) virtualize backlog and cycle queues independently.
2. **Cursor-Based Keyset Pagination:**
   - Client queries request data using keyset cursors (`(createdAt, id)`).
   - Infinite scroll or pagination handles teams with $> 10,000$ historical work items without memory exhaustion.
3. **Optimistic UI Updates:**
   - Status updates, cycle reassignments, and backlog reordering apply immediately to local cache with automatic rollback upon API failure.
4. **Normalized Entity Caching:**
   - Work items modified inside `Team Work` immediately reflect across `My Work`, `Inspector`, and `Command Palette` without redundant refetches.

---

## 26. Component Architecture

The recommended modular structure enforces strict boundaries within `src/features/teams` and `src/features/cycles`:

```text
src/
├── features/
│   ├── teams/
│   │   ├── components/
│   │   │   ├── TeamHub.jsx               # Master resource container (TEM-001)
│   │   │   ├── TeamHeader.jsx            # Compact identity header & actions
│   │   │   ├── TeamResourceNav.jsx       # 36px contextual tab bar
│   │   │   ├── TeamOverview.jsx          # Operational landing cockpit (TEM-002)
│   │   │   ├── TeamWork.jsx              # Universal execution canvas (TEM-003)
│   │   │   ├── TeamProjects.jsx          # Project rollup catalogue (TEM-004)
│   │   │   ├── TeamDocs.jsx              # Contextual knowledge collection (TEM-005)
│   │   │   ├── TeamMembers.jsx           # Squad roster & capacity (TEM-007)
│   │   │   ├── TeamSettingsModal.jsx     # Team admin drawer/modal (TEM-008)
│   │   │   └── index.js
│   │   ├── hooks/
│   │   │   ├── useTeam.js                # Core team metadata & permissions
│   │   │   ├── useTeamWorkQuery.js       # Query over team WorkItems
│   │   │   ├── useTeamCapabilities.js    # Dynamic capability flags
│   │   │   └── index.js
│   │   ├── model/
│   │   │   ├── teamModel.js              # Entity schemas & invariants
│   │   │   └── index.js
│   │   └── index.js
│   │
│   ├── cycles/
│   │   ├── components/
│   │   │   ├── ActiveCycleCockpit.jsx    # Execution cockpit (CYC-001)
│   │   │   ├── CyclePlanningWorkbench.jsx# Dual-pane planning (CYC-002)
│   │   │   ├── CycleBurndownMini.jsx     # Overview progress chart
│   │   │   ├── CycleRolloverDialog.jsx   # Explicit completion rollover review
│   │   │   └── index.js
│   │   ├── hooks/
│   │   │   ├── useActiveCycle.js
│   │   │   ├── useCyclePlanning.js
│   │   │   └── index.js
│   │   └── model/
│   │       ├── cycleModel.js
│   │       └── index.js
```

---

## 27. Accessibility (WCAG 2.2 AA Target)

1. **Landmarks & Roles:**
   - Header is marked `<header role="banner">` within the team container.
   - Resource navigation is marked `<nav aria-label="Team Resource Navigation">`.
   - Primary content is wrapped in `<main id="team-content">`.
2. **Keyboard Focus & Ring Invariants:**
   - Active tab carries `aria-selected="true"` and `tabIndex={0}`; inactive tabs have `tabIndex={-1}` with ArrowLeft/ArrowRight navigation.
   - Clear focus indicators (`outline: 2px solid var(--border-focus)`) on all interactive buttons, rows, and pickers.
3. **Screen Reader Announcements:**
   - Dynamic cycle progress announced via `aria-valuenow` and `aria-valuetext`.
   - Inbound triage arrival and rollover dialog updates announce via `aria-live="polite"`.

---

## 28. Non-Goals

To prevent scope creep and maintain strict milestone boundaries, the following are explicitly **NOT** part of UI-05A:
- Implementation of production React components or state hooks (deferred to `UI-05B`).
- Backend database schema or API route implementations.
- Real-time WebSocket subscriptions or event streaming.
- Implementation of `TEM-006 (Team Triage Queue)` (frozen as POST-CORE).
- Implementation of `CYC-003 (Cycle History Directory)` (frozen as POST-CORE).
- Custom multi-quarter portfolio roadmap engines (owned by `INT-001`).
- Redesign of the Application Shell, Sidebar, Inspector, or Design Tokens.

---

## 29. Frozen Decisions Summary

1. **Domain Model:** Team is a workspace-level resource. Cycles are team-owned. Projects are cross-team workspace resources.
2. **Backlog Definition:** Backlog is a query/planning state over canonical WorkItems (`owningTeamId === team.id && cycleId === null && status.category === 'unstarted'`). It is never a separate entity.
3. **Cycle Rollover:** Incomplete committed items never auto-roll silently; they require explicit review (Backlog vs Next Cycle).
4. **Single Active Cycle:** Teams have at most one active cycle at a time.
5. **Capability-Aware Navigation:** Tabs and quick create fields dynamically adapt to enabled capabilities (`cycles`, `triage`, `estimates`).
6. **Keyboard Integration:** Centralized PAGE/VIEW scope integration without rogue window listeners.

---

## 30. Open Questions & Tunable Decisions

| Area | Decision | Status | Rationale / Recommendation |
| :--- | :--- | :--- | :--- |
| **Capacity Estimation Units** | Points vs Hours | **Tunable** | Recommend default to Story Points (`1, 2, 3, 5, 8`) with option to toggle to Hours in Team Settings (`TEM-008`). |
| **Planning Drag-and-Drop** | HTML5 Drag & Drop vs Library | **Tunable** | Ensure keyboard assignment (`m` / Space) works first; add drag-and-drop as progressive enhancement in UI-05B. |
| **Default Team Work Tab** | Active Work vs Overview | **Tunable** | Currently defaulted to `Overview` (`TEM-002`) for orientation, with user preference remembered via localStorage. |
| **Historical Cycle Threshold** | Number of past cycles shown | **Tunable** | Keep 5 most recent completed cycles in local cache; paginate older cycles via `CYC-003` (POST-CORE). |

---

## 31. UI-05B Implementation Readiness Checklist

When authorized to implement `UI-05B`, the implementation must deliver:
- [ ] Team Hub container (`TEM-001`) with responsive layout.
- [ ] Compact Team Identity Header with metadata and Quick Create trigger.
- [ ] Capability-aware ResourceNav strip (`Overview`, `Work`, `Cycles`, `Projects`, `Docs`, `Members`).
- [ ] Team Overview cockpit (`TEM-002`) with active cycle burndown and project rollups.
- [ ] Team Work stream (`TEM-003`) reusing canonical `DataGrid` and `KanbanBoard`.
- [ ] Active Cycle cockpit (`CYC-001`) and Planning workbench (`CYC-002`).
- [ ] Centralized keyboard registration via `registerViewKeyboardHandler`.
- [ ] Automated Vitest suite validating queries, capability toggles, rollover logic, and keyboard scope.
