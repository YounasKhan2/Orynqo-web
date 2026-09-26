# UI-07A: Projects Product & UX Contract

- **Document Version:** `1.0.0`
- **Surface Identifier:** `PRJ-001` (Project Workspace Resource Page / Overview), `PRJ-002` (Project Work), `PRJ-003` (Project Docs), `PRJ-004` (Project Milestones), `PRJ-005` (Project Activity), `PRJ-006` (Project Settings & Access), `PRJ-007` (Projects Directory)
- **Status:** **PROPOSED PRODUCT & UX SPECIFICATION — AT HUMAN REVIEW**
- **Base Git SHA:** `7dcbfc6126e4d5afbf44b7e03fdbfef5ac643f5d`
- **Branch:** `design/ui-07a-projects-product-ux`
- **Lineage:** `docs/06-complete-page-and-surface-registry.md` $\rightarrow$ `docs/10-ui-02a-application-shell-sidebar-contract.md` $\rightarrow$ `docs/12-ui-03a-my-work-product-ux-contract.md` $\rightarrow$ `docs/14-ui-04a-personal-inbox-product-ux-contract.md` $\rightarrow$ `docs/16-ui-05a-team-hub-product-ux-contract.md` $\rightarrow$ `docs/18-ui-06a-docs-knowledge-product-ux-contract.md` $\rightarrow$ `docs/20-ui-07a-projects-product-ux-contract.md`

---

## 1. Executive Summary & Purpose

A **Project** in Orynqo is a first-class workspace resource for coordinating a **bounded, cross-functional outcome** across execution and knowledge entities:

$$\text{Project} = \text{Coordinated outcome context over canonical execution and knowledge entities}$$

### 1.1 What a Project IS
- A workspace-level resource coordinating WorkItems, Teams, Milestones, Documents, people, target dates, status, health, progress, dependencies, and activity toward a specific delivery objective.
- A cross-team coordination vehicle allowing multiple squads to collaborate without forking or cloning their work.
- The authoritative parent container of **Project Milestones** (`PRJ-004`).
- An outcome scope orthogonal to team-owned iteration cadences (**Cycles**).

### 1.2 What a Project IS NOT
- **NOT a folder containing duplicate WorkItems**: WorkItems belong canonically to their owning Team; Project association is a relationship, not a physical clone or container change.
- **NOT a Team substitute**: Teams are permanent functional squads with continuous cycles; Projects are time-bounded outcome scopes.
- **NOT a SavedView**: A SavedView is a reusable query lens; a Project has distinct lifecycle, lead, target dates, milestones, health, and activity history.
- **NOT a Cycle**: Cycles are single-team execution timeboxes; Projects span timeframes and multiple participating teams.
- **NOT an Initiative**: An Initiative is a portfolio-level strategic umbrella coordinating multiple Projects; Projects are bounded delivery units.
- **NOT a Document**: Living Specs and RFCs live in canonical Docs (`DOC-002`) and associate to Projects; a Project is an operational coordinator, not a text document.
- **NOT an arbitrary KPI dashboard**: No decorative vanity widgets, empty gauges, or superficial executive charts.
- **NOT a second task-management model**: Project Work (`PRJ-002`) is a projection directly over canonical WorkItems.

---

## 2. Competitive Reference Pass & Synthesis

To establish a world-class Project operating model, we evaluated the patterns of major modern work management systems:

```text
Pattern
| Linear
| Jira
| Asana
| ClickUp / Monday
| Orynqo Decision
| Rationale
```

| Pattern | Linear | Jira | Asana | ClickUp / Monday | Orynqo Decision | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Project Identity & Tenancy** | Workspace resource shared across teams; single Lead. | Heavy workspace container; often conflates team with project. | Workspace project containing tasks; flexible custom fields. | Deep nested hierarchy (Space > Folder > List > Task). | **Workspace Resource** with 1..N participating Teams and 1 Lead. | Prevents organizational silos; avoids ClickUp's folder sprawl; enables cross-team execution without duplicating items. |
| **Multi-Team Participation** | 1..N teams explicitly attached; issues retain single team. | Cross-team work requires complex board filters or Advanced Roadmaps. | Single team owner; tasks can be multi-homed across projects. | Custom relations or dashboards across lists. | **1 Lead Team + 1..N Contributing Teams**; WorkItems strictly retain exactly 1 owning Team. | Models realistic engineering delivery: one team leads the outcome, other squads contribute specific deliverables under their own team cadences. |
| **WorkItem Relationship** | `issue.projectId`; issue belongs to 1 team, 1 project. | Complex issue links or multi-project boards. | Task multi-homing into multiple projects. | Tasks duplicated or mirrored across lists. | **Canonical Single-Project Association** (`workitem.projectId`); WorkItem belongs to 1 Team. | Guarantees deterministic velocity, zero double-counting in rollups, and clean capacity accounting. Multi-project tasks create ambiguity. |
| **Milestones** | Project-owned checkpoints grouping issues; progress bar. | Releases/Versions or Epics; confusing agile taxonomy. | Zero-duration milestone tasks on timeline. | Milestone task type or Gantt markers. | **Project-Owned Milestone Entities** (`PRJ-004`); group WorkItems; discrete delivery checkpoints. | Milestones are checkpoints of a Project, not WorkItems themselves. Treats milestones as first-class delivery checkpoints with target dates. |
| **Status vs Lifecycle vs Health** | Status (Backlog, Planned, In Progress, Paused, Completed, Canceled) + Project Update health. | Workflow status on project; complex admin configuration. | Delivery status + Status Update health (On Track, At Risk, Off Track). | Highly customizable status columns; multiple dropdowns. | **Distinct 3-Vector Model**: Lifecycle (`active/completed/archived`), Delivery Status (`planned/in_progress/paused/completed/cancelled`), Health (`on_track/at_risk/off_track`). | Separates lifecycle storage state from operational execution state and subjective team health assessments. Eliminates semantic collision. |
| **Progress Calculation** | Scope-based % (completed issues or estimates). | Velocity charts, burndown, complex release progress. | Completed task count % or formula custom fields. | Custom formula rollups (points, sub-items, time). | **Hybrid Transparent Progress**: Primary = WorkItem completion % (with optional estimate weighting if used); Secondary = Milestone completion count. Distinct from Health. | No black-box mathematical formulas. Shows actual count ($M/N$ completed) alongside percentage, preventing false mathematical certainty. |
| **Project Updates & Narrative** | Dedicated async Project Updates with health + narrative + Slack sync. | Confluence status reports or third-party apps. | Status Updates with rich text, charts, and portfolio rollup. | Dashboard notes or discussion widgets. | **Canonical Project Updates (`PRJ-001`)**: Authoritative, immutable status updates authored by Lead/Contributors with health vector + narrative. | Asynchronous alignment is essential. Preserves historical log of how health and scope evolved over time without relying on Slack. |
| **Documentation & Specs** | Project Documents tab + external links. | Confluence Space linking; disconnected app jump. | Brief / Docs tab with rich text. | ClickUp Docs within lists. | **Project Docs (`PRJ-003`)**: Direct projection over canonical `Document` entities (`projectId === current`). | Reuses canonical DOC-001/002 architecture; zero `ProjectDocument` clones; living specs remain accessible across both Docs Hub and Project. |
| **Project Dependencies** | Project blocking relationships (`blocks` / `blocked_by`). | Issue links or Advanced Roadmaps dependency links. | Project dependencies in Portfolios / Timeline. | Task-level dependencies or Gantt board links. | **Project-Level Directional Dependency**: `dependsOnProjectId` / `blocksProjectId` with strict cycle rejection. | Project outcome blockers are strategic and distinct from low-level WorkItem blockers. High-level planning needs project-to-project coordination. |
| **Project Templates** | Standardized project templates with pre-seeded issues/docs. | Heavy enterprise project templates. | Task templates and project templates. | Extensive template marketplace. | **POST-CORE**: Core focuses on frictionless manual creation with progressive disclosure. | Templates introduce premature schema rigidity and administrative clutter before core project mechanics are battle-tested. |

---

## 3. Canonical Surfaces (PRJ-001 through PRJ-007)

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        PROJECTS CANONICAL SURFACES                     │
├─────────┬──────────────────────────┬─────────────────┬─────────────────┤
│ Surface │ Name                     │ Architectural   │ Core Purpose    │
│ ID      │                          │ Type            │                 │
├─────────┼──────────────────────────┼─────────────────┼─────────────────┤
│ PRJ-001 │ Project Overview         │ RESOURCE PAGE   │ Operational home: outcome scope, health, lead,  │
│         │                          │ / SUB-SURFACE   │ milestones snapshot, updates, key docs, teams. │
├─────────┼──────────────────────────┼─────────────────┼─────────────────┤
│ PRJ-002 │ Project Work             │ RESOURCE        │ Projection (Grid, Board, Timeline) over        │
│         │                          │ SUB-SURFACE     │ canonical WorkItems across contributing squads.│
├─────────┼──────────────────────────┼─────────────────┼─────────────────┤
│ PRJ-003 │ Project Docs             │ RESOURCE        │ Living specs, PRDs, and RFCs associated with   │
│         │                          │ SUB-SURFACE     │ this Project via canonical Document query.     │
├─────────┼──────────────────────────┼─────────────────┼─────────────────┤
│ PRJ-004 │ Project Milestones       │ RESOURCE        │ Structured sequence of delivery gates, dates,   │
│         │                          │ SUB-SURFACE     │ and associated WorkItem checkpoints.           │
├─────────┼──────────────────────────┼─────────────────┼─────────────────┤
│ PRJ-005 │ Project Activity         │ RESOURCE        │ Chronological, filtered stream of meaningful   │
│         │                          │ SUB-SURFACE     │ Project domain events (ActivityEvent reuse).   │
├─────────┼──────────────────────────┼─────────────────┼─────────────────┤
│ PRJ-006 │ Project Settings & Access│ RESOURCE        │ Project metadata, participating teams, lead,    │
│         │                          │ SUB-SURFACE     │ visibility, dependencies, archive/completion.  │
├─────────┼──────────────────────────┼─────────────────┼─────────────────┤
│ PRJ-007 │ Projects Directory       │ DIRECTORY       │ High-density workspace discovery catalogue for  │
│         │                          │                 │ searching, filtering, and organizing projects. │
└─────────┴──────────────────────────┴─────────────────┴─────────────────┘
```

---

## 4. Canonical Project Model

A Project is a single workspace resource defined by the following canonical semantic model:

```text
Project
├── identity: string (UUID, immutable)
├── identifier: string (e.g. "PRJ-42", human-readable, unique per workspace)
├── workspaceId: string (tenant boundary)
├── name: string (required, 1..120 chars)
├── summary: string (optional, 0..280 chars, plain text)
├── description: object | null (optional rich description / charter / outcome definition)
├── lifecycle: 'active' | 'completed' | 'archived'
├── status: 'planned' | 'in_progress' | 'paused' | 'completed' | 'cancelled'
├── health: 'on_track' | 'at_risk' | 'off_track'
├── priority: 'urgent' | 'high' | 'medium' | 'low' | 'none'
├── leadUserId: string | null (single primary owner accountable for outcome)
├── leadTeamId: string | null (primary squad accountable for coordination)
├── contributingTeamIds: Array<string> (squads with work committed to this project)
├── targetDate: string | null (ISO date or quarter target e.g. "2026-11-15" or "Q4 2026")
├── startDate: string | null (ISO date)
├── initiativeId: string | null (optional strategic umbrella alignment)
├── dependencies: Array<{
│     targetProjectId: string,
│     type: 'blocked_by' | 'blocks'
│   }>
├── access: {
│     visibility: 'workspace' | 'restricted',
│     memberUserIds: Array<string> (for restricted access grants)
│   }
├── progress: {
│     totalWorkItems: number,
│     completedWorkItems: number,
│     percent: number (computed, transparent, non-authoritative)
│   }
├── createdAt: string (ISO timestamp)
├── updatedAt: string (ISO timestamp)
└── version: number (optimistic concurrency token)
```

### Invariants:
1. **Workspace Tenancy**: Every Project belongs to exactly one Workspace. Cross-workspace projects are strictly forbidden.
2. **Deterministic Identifier**: Every Project receives a unique human-readable identifier (`PRJ-N`) for mention syntax and global search.
3. **No Duplicate WorkItems**: WorkItems are never cloned into Projects. A WorkItem references `workitem.projectId === project.id`.

---

## 5. Multi-Team Model & WorkItem Integrity

### 5.1 Non-Negotiable Multi-Team Participation
Modern product initiatives require multi-disciplinary engineering (e.g., Backend, Mobile, Frontend, Platform). Projects support multi-team coordination natively:

```text
Project
├── leadTeamId: "team-platform" (Primary squad driving the outcome)
└── contributingTeamIds: ["team-platform", "team-mobile", "team-core"]
```

### 5.2 The Primary/Lead Team Rule
- A Project may designate **one optional Lead Team** (`leadTeamId`). The Lead Team is responsible for primary ownership and roadmap communication.
- A Project maintains a set of **Contributing Teams** (`contributingTeamIds`). Whenever a WorkItem owned by a new team is assigned to the Project, that team is automatically added to `contributingTeamIds`.

### 5.3 WorkItem Owning Team Invariant
> **CRITICAL INVARIANT:** Project association NEVER alters or overrides a WorkItem's canonical owning Team (`workitem.teamId`).

```text
┌────────────────────────────────────────────────────────┐
│                      PROJECT X                         │
│                                                        │
│   ┌──────────────────────┐    ┌────────────────────┐   │
│   │   Team Core Work     │    │  Team Mobile Work  │   │
│   │  • WRK-101 (Auth)    │    │ • WRK-201 (Biomet) │   │
│   │  • WRK-102 (Session) │    │ • WRK-202 (Screen) │   │
│   │   Team: team-core    │    │  Team: team-mobile │   │
│   └──────────────────────┘    └────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

- In `PRJ-002: Project Work`, items can be grouped or filtered by `Team`, giving immediate visibility into cross-squad commitments.
- Removing a contributing team from a Project prompts for explicit reassignment or dissociation of that team's remaining active WorkItems; items are never silently deleted or orphaned.

---

## 6. Milestones (PRJ-004) & WorkItem Cardinality

### 6.1 Milestone Entity Model
Milestones represent sequential, measurable delivery checkpoints or release gates along a Project's journey (e.g., `M1: Technical RFC & Data Model`, `M2: Internal Alpha Dogfooding`, `M3: Public Beta Launch`).

```text
Milestone
├── id: string (UUID, immutable)
├── projectId: string (parent project owner)
├── name: string (required, e.g. "M1: Architecture Review")
├── description: string (optional plain text)
├── targetDate: string | null (ISO date e.g. "2026-10-15")
├── status: 'open' | 'completed' | 'archived'
├── sortOrder: number (deterministic sequence index)
├── createdAt: string (ISO timestamp)
└── updatedAt: string (ISO timestamp)
```

### 6.2 Milestone ↔ WorkItem Cardinality Decision
- **Cardinality Decision:** **Zero or One Milestone per WorkItem** (`workitem.milestoneId: string | null`).
- **Rationale:**
  - Allowing multiple milestones per WorkItem creates conflicting delivery dates, ambiguous progress calculations, and fractured visual timelines.
  - A single-milestone association establishes an unambiguous delivery checkpoint: *"Which release gate does this specific task unblock?"*
  - If work spans multiple phases, it should be broken down into discrete canonical WorkItems representing the deliverables for each milestone.
- **Milestone Assignment Semantics:**
  - A WorkItem can only be assigned to a Milestone belonging to its associated Project (`milestone.projectId === workitem.projectId`).
  - If a WorkItem's Project association is cleared, its `milestoneId` is automatically cleared.
  - Deleting or archiving a Milestone unlinks associated WorkItems (`milestoneId = null`); it never deletes the underlying WorkItems.

### 6.3 Milestone Completion Behavior
- Marking a Milestone `completed`:
  - Does NOT force incomplete WorkItems to complete.
  - Prompts the user with an explicit choice: *"3 items remain incomplete in M1. Move to next milestone (M2) or keep in Project without milestone?"*
  - Preserves completed items as part of the historical record of that milestone.

---

## 7. Status, Lifecycle, Health & Progress

To eliminate semantic confusion between lifecycle phase, operational state, subjective health, and mathematical progress, Orynqo enforces four distinct orthogonal vectors:

```text
┌─────────────────┬──────────────────────────────────────────┬─────────────────────────────┐
│ Dimension       │ Allowed Values                           │ Operational Meaning         │
├─────────────────┼──────────────────────────────────────────┼─────────────────────────────┤
│ 1. Lifecycle    │ active | completed | archived            │ State of project container  │
│ 2. Status       │ planned | in_progress | paused |         │ Phase of delivery execution │
│                 │ completed | cancelled                    │                             │
│ 3. Health       │ on_track | at_risk | off_track           │ Subjective outcome risk     │
│ 4. Progress     │ M / N items (X%)                         │ Empirical completion metric │
└─────────────────┴──────────────────────────────────────────┴─────────────────────────────┘
```

### 7.1 Status vs Lifecycle
- **Lifecycle** governs discoverability:
  - `active`: Normal working project visible in default directories, team hubs, and pickers.
  - `completed`: Successfully shipped project; read-only by default; visible under completed filters.
  - `archived`: Defunct or deferred project removed from primary views; accessible via explicit archive query.
- **Status** tracks the operational delivery lifecycle:
  - `planned`: Scope and charter defined; work not yet commenced.
  - `in_progress`: Active execution across contributing squads.
  - `paused`: Temporarily halted pending decisions or external dependencies.
  - `completed`: Outcome delivered.
  - `cancelled`: Outcome abandoned without delivery.

### 7.2 Health Vector & Narrative
- **Health** (`on_track`, `at_risk`, `off_track`) is a human-curated assessment set by the Project Lead or contributors during Project Updates.
- Health is NEVER computed solely by a formula. A project with 95% of tasks completed may still be `at_risk` if a critical security blocker arises; a project at 10% may be `on_track` if early foundational work is on schedule.
- Visual presentation:
  - `on_track`: Subtle emerald badge (`On Track`).
  - `at_risk`: Warning amber badge (`At Risk`) requiring a blocker note.
  - `off_track`: Critical rose badge (`Off Track`) requiring an escalation note.

### 7.3 Progress Semantics: Avoiding False Mathematical Certainty
- Computed progress displays empirical facts:
  $$\text{Progress} = \frac{\text{Completed WorkItems}}{\text{Total WorkItems}} \times 100\%$$
- The UI always renders the exact ratio alongside the percentage: `24 / 32 items (75%)`.
- Optional Estimate Weighting: If contributing teams utilize estimation points, the user can toggle between `Item count` and `Estimate points` without altering underlying canonical state.
- Milestone Progress: Each milestone displays its own discrete completion ratio (`M1: 8/8 items (100%)`).

---

## 8. Asynchronous Project Updates (PRJ-001)

Project Updates provide structured asynchronous alignment without endless status meetings.

### 8.1 Project Update Entity Contract
```text
ProjectUpdate
├── id: string (UUID, immutable)
├── projectId: string (parent project owner)
├── authorId: string (user ID of reporter)
├── health: 'on_track' | 'at_risk' | 'off_track'
├── targetDate: string | null (projected target date at time of update)
├── body: string (rich text / markdown narrative: accomplishments, next focus, blockers)
├── blockers: Array<string> (explicit blocker items/strings)
├── createdAt: string (ISO timestamp, immutable)
└── syncActivityEventId: string (cross-referenced to ActivityEvent)
```

### 8.2 Operational Rules
- Creating an update automatically updates the parent Project's current `health` and `targetDate`.
- Updates are immutable snapshots preserving the exact narrative and health history over the project's lifetime.
- Rendered on `PRJ-001: Project Overview` with the latest update pinned at the top and historical updates accessible in a chronological drawer or feed.

---

## 9. Project Dependencies & Blocking Semantics

Projects may have strategic delivery dependencies on other Projects within the same workspace.

### 9.1 Directional Dependency Contract
Dependencies are modeled strictly directionally:
$$\text{Project A} \xrightarrow{\text{blocks}} \text{Project B} \iff \text{Project B} \xrightarrow{\text{depends on}} \text{Project A}$$

```text
ProjectDependency
├── sourceProjectId: string
├── targetProjectId: string
├── type: 'blocks' | 'depends_on'
└── createdAt: string
```

### 9.2 Dependency Invariants
1. **Strict Cycle Rejection**: Before creating a dependency, an ancestry traversal verifies that `Target` does not already directly or transitively depend on `Source`. Any cycle attempt is rejected with an explicit error.
2. **Distinct from WorkItem Dependencies**: A Project dependency represents a strategic deliverable dependency (e.g. "Identity V2 must launch before Multi-Tenant Auth can ship"). It is never automatically inferred from individual WorkItem dependencies.
3. **Zero Cross-Workspace Dependencies**: Dependencies across workspace boundaries are strictly prohibited.
4. **Deleted / Archived Target Behavior**: If a blocking project is archived or completed, its blocking relationship transitions to a `resolved` or `archived reference` state without breaking the dependent project.

---

## 10. Cross-Domain Relationships & Orthogonality

```text
                            ┌─────────────────────┐
                            │     Initiative      │ (UI-08 Portfolio)
                            │   (Strategic Aim)   │
                            └──────────┬──────────┘
                                       │ 0..1
                                       ▼
 ┌──────────────────────┐   0..N   ┌─────────────────────┐   0..N   ┌─────────────────────┐
 │       Team Hub       ├─────────►│       Project       │◄─────────┤    Document Hub     │
 │  (Permanent Squad)   │  contrib │ (Bounded Outcome)   │  assoc   │  (Living Specs/RFC) │
 └──────────┬───────────┘          └──────────┬──────────┘          └─────────────────────┘
            │                                 │
       owns │ 1..N                            │ 1..N
            ▼                                 │ owns
 ┌──────────────────────┐                     ▼
 │        Cycle         │          ┌─────────────────────┐
 │ (Timeboxed Iteration)│          │      Milestone      │
 └──────────┬───────────┘          │ (Delivery Gate)     │
            │                      └──────────┬──────────┘
            │ schedules                       │ 0..1
            │ 0..1                            │ groups
            ▼                                 ▼
 ┌────────────────────────────────────────────────────────┐
 │                        WorkItem                        │
 │  • teamId: required (1 Team)                           │
 │  • projectId: optional (0..1 Project)                  │
 │  • milestoneId: optional (0..1 Milestone)              │
 │  • cycleId: optional (0..1 Cycle)                      │
 └────────────────────────────────────────────────────────┘
```

### 10.1 Project vs Initiative (Future UI-08)
- A Project may belong to **zero or one Initiative** (`project.initiativeId: string | null`).
- Removing or archiving an Initiative leaves its member Projects intact as standalone workspace projects.
- Projects are fully self-sufficient and operational without an Initiative.

### 10.2 Project vs Cycle
- Projects and Cycles are completely orthogonal.
- A WorkItem can simultaneously have:
  - `teamId: "team-platform"`
  - `projectId: "prj-auth-v2"`
  - `cycleId: "cyc-platform-14"`
- A single Project's work may span 10 different cycles across 3 different teams. Projects never own Cycles.

### 10.3 Project vs Document (UI-06)
- Reuses canonical `Document` entity. No `ProjectDocument` clones.
- `PRJ-003: Project Docs` runs a standard query:
  $$\text{Documents where } \text{projectIds} \text{ includes } \text{currentProjectId}$$
- Creating a document from Project Docs pre-fills `projectIds: [currentProjectId]`.
- Clicking a Document opens canonical `DOC-002: Document Canvas`.

---

## 11. PRJ-001: Project Overview (Operational Home)

`PRJ-001` is designed as a dense, distraction-free operational home that immediately answers:
- What outcome are we delivering?
- What is our current health, status, and target date?
- What milestone is active and when is it due?
- What work is blocked or requires attention?
- What was the latest narrative update?
- Which teams are collaborating?
- What living specs govern this project?

### 11.1 Layout Architecture (Top to Bottom)
1. **Project Header**:
   - Identity & Identifier (`PRJ-42`), Title (inline editable if permitted), Project Favorite toggle (`★`), and Actions menu (`Share`, `Archive`, `Settings`).
   - Meta pill bar: `Delivery Status`, `Health Badge`, `Target Date / Quarter`, `Project Lead` avatar/chip, `Lead Team` chip.
2. **Operational Overview Canvas (Two-Column Layout)**:
   - **Main Column (Left / 65%)**:
     - *Project Charter / Summary*: Crisp Markdown definition of scope and goals.
     - *Latest Project Update Card*: Recent status narrative, health, blockers, authored by Lead, with `Post Update` trigger.
     - *Active Milestones Checklist*: Dense list of milestones showing target dates, completion ratios ($M/N$), and status badges.
     - *Key Project Documents*: Pinned Living Specs and PRDs with live status indicators.
   - **Contextual Sidebar (Right / 35%)**:
     - *Delivery Progress Widget*: Empirical completion ratio ($M/N$ items, $X\%$) with breakdown by status category.
     - *Contributing Teams*: List of participating squads with item counts per team.
     - *Strategic Dependencies*: Inbound blockers (`Blocked by PRJ-12`) and outbound blockers (`Blocks PRJ-88`).
     - *Recent Project Activity*: Condensed mini-feed of latest status changes and milestone completions.

---

## 12. PRJ-002: Project Work Projection

`PRJ-002` provides a high-density, multi-projection lens over all canonical WorkItems associated with this Project across all contributing squads.

### 12.1 Projections Supported
1. **Data Grid (`WRK-001`)**: Default dense table view supporting sorting, multi-selection, inline property editing, and custom groupings.
2. **Kanban Board (`WRK-002`)**: Workflow column projection (Backlog, Todo, In Progress, Review, Done).
3. **Timeline / Roadmap (`WRK-003`)**: Date-oriented bar visualization plotting items against milestones and target dates.

### 12.2 Grouping & Filtering Dimensions
- **Supported Groupings**:
  - `By Team`: Groups rows by contributing team squad, making cross-team ownership instantly visible.
  - `By Milestone`: Groups rows by sequential milestone checkpoints (`M1`, `M2`, `Unassigned`).
  - `By Status`: Groups rows by workflow status category.
  - `By Assignee`: Groups rows by person.
  - `By Priority`: Groups rows by priority level.
- **Filtering**: Full filter algebra reuse (Status, Team, Assignee, Priority, Milestone, Cycle, Due Date, Labels).
- **Zero Duplication Law**: One canonical WorkItem appears in exactly one logical group for the selected grouping dimension.

---

## 13. PRJ-003: Project Docs Projection

`PRJ-003` surfaces living specifications, architecture decision records (ADRs), and research notes associated with this project.

### 13.1 Query & Operations
- Pure query over canonical documents:
  $$\text{Query: } \text{documents.filter}(d \implies d.\text{projectIds.includes}(project.id) \land d.\text{lifecycle} \neq \text{'archived'})$$
- Displays documents in high-density table/list showing title, creator, last updated date, and comment counts.
- **Contextual Creation**: `+ New Project Doc` invokes canonical creation pre-populating `projectIds: [project.id]`.
- Clicking any row navigates directly to canonical `DOC-002: Document Canvas`.

---

## 14. PRJ-005: Project Activity Stream

`PRJ-005` presents a filtered, chronological history of meaningful project-level domain events.

### 14.1 Logged Activity Events
- Project created, renamed, or charter updated.
- Status, health, or target date modified.
- Project Update published.
- Lead or Lead Team reassigned.
- Contributing Team added or removed.
- Milestone created, target date changed, or completed.
- Strategic dependency linked or unlinked.
- Project completed or archived.

*Keystrokes, continuous draft typing, and transient filter operations are NEVER logged to Activity.*

---

## 15. PRJ-006: Project Settings & Access

`PRJ-006` manages project-level configuration, authorization, and lifecycle transitions.

### 15.1 Configuration Sections
1. **General Details**: Project name, identifier, summary, target delivery dates.
2. **Leadership & Teams**: Lead user, Lead team, and management of contributing teams.
3. **Dependencies**: Manage inbound and outbound project-level dependencies with cycle validation.
4. **Access & Visibility**:
   - `Workspace Access`: Visible to all workspace members.
   - `Restricted Access`: Restricted to explicit member user IDs and contributing team members.
5. **Danger Zone**:
   - `Mark Completed`: Transitions lifecycle to `completed`; prompts for disposition of open WorkItems.
   - `Archive Project`: Removes from active directories; preserves all relations.
   - `Restore Project`: Restores an archived project to `active`.

---

## 16. PRJ-007: Projects Directory

`PRJ-007` is the workspace-wide discovery and governance catalogue for finding, filtering, and organizing projects across all teams and initiatives.

### 16.1 Capabilities
- **High-Density Table / List View**: Shows Project Name, Identifier, Lead, Contributing Teams, Status, Health badge, Target Date, and Progress bar.
- **Faceted Filters**:
  - `Status`: Active, Planned, In Progress, Paused, Completed, Cancelled.
  - `Health`: On Track, At Risk, Off Track.
  - `Team`: Filter by Lead or Contributing Team.
  - `Lead`: Filter by Project Lead user.
  - `Initiative`: Filter by parent strategic initiative.
  - `Lifecycle`: Toggle between Active, Completed, and Archived.
- **Quick Search**: Instant client-side substring matching across project name, identifier, and summary.
- **Sorting**: Multi-column sorting by Target Date, Name, Health, Progress %, or Last Updated.
- **Scalability**: Virtualized rows supporting thousands of workspace projects with zero lag.

---

## 17. Project Lifecycle: Completion & Archival Semantics

### 17.1 Completion Semantics
- Moving a Project to `status: 'completed'` / `lifecycle: 'completed'`:
  - Does NOT automatically mass-complete active WorkItems.
  - Prompts the user: *"This project has 4 open WorkItems. Do you want to leave them open in their respective teams, move them to Backlog, or mark them completed?"*
  - Does NOT archive associated Documents (Living Specs remain active living knowledge).
  - Completed projects remain searchable in the Projects Directory under the `Completed` facet.
  - Can be reopened at any time by authorized leads.

### 17.2 Archival Semantics
- Moving a Project to `lifecycle: 'archived'`:
  - Hides the project from default selectors, sidebar favorites, and active directories.
  - Retains all historical relations: WorkItems still know they were part of `PRJ-42`.
  - Retains all milestones, project updates, and activity logs.
  - Can be fully restored via `PRJ-006` or the Projects Directory archive view.
  - Permanent hard-delete is strictly deferred (POST-CORE).

---

## 18. Authorization & Zero-Leakage Policy

All Project queries and surfaces strictly adhere to Orynqo's zero-leakage security principles:

1. **Pre-Render Authorization**: If a user lacks access to a restricted project (`project.access.visibility === 'restricted'` and user not in `memberUserIds`), the project is completely omitted from:
   - Projects Directory (`PRJ-007`)
   - Omnisearch / Command Palette (`⌘K`)
   - Aggregated portfolio metrics and counts
   - WorkItem Inspector project badges (rendered as `Restricted Project`)
   - Activity streams and cross-project dependency links
2. **Action Capabilities**: Evaluated semantically via canonical permission resolver:
   - `canViewProject`: Access to read project overview, work, docs, milestones.
   - `canEditProject`: Permission to update summary, target date, milestones, and work items.
   - `canPostUpdate`: Permission to publish authoritative Project Updates (Lead, Lead Team members, Admins).
   - `canManageAccess`: Permission to modify visibility and member grants.
   - `canArchiveProject`: Permission to complete or archive the project.

---

## 19. Component Responsibility Model

To prevent bloated monolithic views, the Project domain is decomposed into focused, single-responsibility components:

```text
src/features/projects/
├── components/
│   ├── ProjectWorkspace.jsx         # PRJ-001 shell orchestrator & tab routing
│   ├── ProjectOverviewTab.jsx       # PRJ-001 overview content (charter, update, widgets)
│   ├── ProjectWorkTab.jsx           # PRJ-002 execution projection (Grid, Board, Timeline)
│   ├── ProjectDocsTab.jsx           # PRJ-003 living docs query and linking
│   ├── ProjectMilestonesTab.jsx     # PRJ-004 milestone sequence & checkpoints
│   ├── ProjectActivityTab.jsx       # PRJ-005 historical event stream
│   ├── ProjectSettingsTab.jsx       # PRJ-006 settings, teams, access, danger zone
│   ├── ProjectsDirectory.jsx        # PRJ-007 workspace catalogue & filters
│   ├── ProjectHeader.jsx            # Unified header with status/health badges & actions
│   ├── ProjectUpdateCard.jsx        # Presentation of latest narrative update
│   ├── ProjectUpdateModal.jsx       # Modal dialog for authoring project updates
│   ├── ProjectMilestoneRow.jsx      # Compact milestone item with progress bar
│   ├── ProjectHealthBadge.jsx       # Semantic color & icon badge (On Track, At Risk, Off Track)
│   └── ProjectDependencySection.jsx # Directional dependency list & blocker links
├── hooks/
│   ├── useProjectQuery.js           # Single project fetch with cache & authorization
│   ├── useProjectsDirectoryQuery.js # Directory filter, search, sort, and pagination
│   ├── useProjectWorkQuery.js       # Query canonical WorkItems by projectId
│   ├── useProjectMilestones.js      # Milestone CRUD & WorkItem assignment
│   ├── useProjectUpdates.js         # Project update publishing & history
│   └── useProjectMutations.js       # Metadata updates, team participation, lifecycle
└── model/
    ├── projectModel.js              # Factory, validation, and lifecycle invariants
    ├── projectStatus.js             # Status, health, and progress calculation logic
    └── projectDependencies.js       # Dependency cycle detection & validation
```

---

## 20. Required Core Decisions (Resolution Table)

| Decision Item | Chosen Architecture | Operational Rationale |
| :--- | :--- | :--- |
| **1. Canonical Project Identity** | Workspace-scoped entity with unique `PRJ-N` identifier. | Independent of specific team folders; enables cross-team alignment. |
| **2. Multi-Team Participation** | Native 1..N contributing teams (`contributingTeamIds`). | Reflects realistic multi-squad feature delivery. |
| **3. Primary / Lead Team** | Optional single `leadTeamId`. | Designates primary accountable squad without restricting participation. |
| **4. Project Lead** | Single primary `leadUserId`. | Unambiguous single individual accountable for delivery outcome. |
| **5. Initiative Cardinality** | 0..1 Initiative per Project. | Hierarchical rollup without multi-parent graph complexity. |
| **6. Project vs Cycle Boundary** | Strictly orthogonal. | Teams own Cycles; Projects own outcomes. Items have both. |
| **7. Milestone Model** | Project-owned entity with target date & sequence. | Clear checkpoints; distinct from tasks or cycles. |
| **8. Milestone ↔ WorkItem** | Zero or One Milestone per WorkItem (`milestoneId`). | Eliminates timeline ambiguity and double-counting in progress. |
| **9. Project Status Model** | `planned`, `in_progress`, `paused`, `completed`, `cancelled`. | Tracks operational execution phase distinctly from lifecycle. |
| **10. Project Lifecycle Model**| `active`, `completed`, `archived`. | Governs workspace visibility and read/write state. |
| **11. Project Health Model** | Explicit `on_track`, `at_risk`, `off_track`. | Human-curated assessment attached to Project Updates. |
| **12. Progress Semantics** | Empirical WorkItem completion ratio ($M/N$, $X\%$). | Zero false mathematical certainty; transparent ratio display. |
| **13. Project Updates** | **CORE**: Immutable narrative snapshots with health. | Eliminates status meetings; asynchronous team alignment. |
| **14. Project Dependencies** | **CORE**: Directional `blocks`/`depends_on` with cycle check.| Essential for cross-project coordination; simple link list. |
| **15. Individual Membership** | **Derived**: Contributing teams + WorkItem assignees + Lead. | Prevents redundant user roster management; optional restricted grants. |
| **16. Project Work Projections**| Data Grid (`WRK-001`), Kanban Board (`WRK-002`), Timeline. | Full execution power over canonical WorkItems. |
| **17. Project Docs** | Direct query over canonical `Document` entities. | Zero duplicate wiki systems; living specs remain unified. |
| **18. Project Activity** | Filtered stream of meaningful domain events. | Reuses `ActivityEvent`; no noise from keystrokes. |
| **19. Completion Semantics** | Explicit disposition prompt; items remain in owning teams. | Prevents accidental mass-closure or orphan work. |
| **20. Archive Semantics** | Soft lifecycle removal; relations preserved; reversible. | Zero data loss; reversible without hard deletion. |
| **21. Permission Model** | Semantic capabilities with pre-render zero leakage. | Unifies workspace vs restricted project security. |
| **22. Projects Directory** | High-density searchable, filterable directory (`PRJ-007`). | Scales to thousands of projects across the enterprise. |
| **23. Project Creation** | Progressive disclosure modal (Name, Teams, Lead, Date). | Frictionless creation in under 10 seconds. |
| **24. Project Templates** | **POST-CORE**: Evaluated and deferred. | Avoids premature schema rigidity; manual creation is fast. |
| **25. Responsive Modes** | Semantic `wide`, `compact`, `narrow`. | Mobile collapses sidebar widgets; desktop shows rich overview. |
| **26. Mutation Ownership** | Project domain owns project metadata; delegates WorkItems/Docs.| Clean domain isolation; zero cross-domain state leakage. |

---

## 21. CORE vs POST-CORE Boundaries

```text
┌──────────────────────────────────────────────┬──────────────────────────────────────────────┐
│ CORE (UI-07A / UI-07B)                       │ POST-CORE (Deferred)                         │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ • PRJ-001: Project Overview (Operational Hub)│ • Pre-configured Project Templates           │
│ • PRJ-002: Project Work (Grid, Board, T/line)│ • Automated Critical Path Gantt Calculations │
│ • PRJ-003: Project Docs (Canonical Docs query│ • Real-time Multi-User Collaborative Text in │
│ • PRJ-004: Project Milestones (Sequential)   │   Project Charters (CRDT)                    │
│ • PRJ-005: Project Activity (Domain events)  │ • Financial Budgeting, Burn-rate & Cost Calc │
│ • PRJ-006: Project Settings & Access Control │ • Resource Capacity & Workload Heatmaps      │
│ • PRJ-007: Projects Directory (High-density) │ • Cross-Workspace Shared Projects            │
│ • 1..N Contributing Teams + 1 Lead Team      │ • AI Project Charter / Risk Analysis Gen     │
│ • Multi-Vector Status, Health & Progress     │ • Permanent Hard-Delete / Project Trash      │
│ • Asynchronous Project Updates with History  │ • Custom Project Metadata Field Designer     │
│ • Directional Dependencies with Cycle Check  │ • External Public Project Status Portals     │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 22. Frozen vs Tunable Specifications

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FROZEN SPECIFICATIONS                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Canonical Project entity model and workspace tenancy.               │
│ 2. Non-negotiable multi-team participation (1 Lead Team + 1..N squads).│
│ 3. WorkItem owning team invariant (Project never alters item team).    │
│ 4. Single-milestone cardinality per WorkItem (0..1 milestoneId).       │
│ 5. Distinct 4-vector model: Lifecycle, Status, Health, Progress.       │
│ 6. Empirical, transparent progress ratio (M/N items, X%) without fake  │
│    black-box mathematical certainty formulas.                          │
│ 7. Canonical Project Updates as immutable narrative snapshots.         │
│ 8. Directional project dependencies with strict cycle rejection.       │
│ 9. Project Docs as direct query over canonical Document entities.      │
│ 10. PRJ-001 through PRJ-007 canonical surface boundaries.             │
│ 11. Pre-render zero-leakage security and authorization semantics.      │
│ 12. Deferral of Templates, Budgeting, Workload, and AI to POST-CORE.   │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                        TUNABLE IMPLEMENTATION                          │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Exact CSS tokens, layout padding, and color palette shades.         │
│ 2. Exact responsive viewport breakpoints (pixels).                     │
│ 3. Physical keyboard shortcut bindings in Command Palette.             │
│ 4. Database persistence schema, indexes, and SQL migration files.      │
│ 5. API endpoint routing shapes and payload envelopes.                  │
│ 6. Client-side caching and state management library choices.           │
│ 7. Exact virtualization row-height thresholds in directory view.       │
│ 8. Filenames, internal folder structure, and helper function naming.   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 23. Consistency Audit with Frozen Phases (UI-01 through UI-06)

- **UI-01 Execution Core**:
  - `WorkItem` remains the sole canonical execution primitive.
  - Project Work (`PRJ-002`) reuses the universal Data Grid (`WRK-001`) and Inspector (`WRK-005`) without duplicating item state.
  - Inline property pickers and keyboard navigation operate identically.
- **UI-02 Application Shell**:
  - Projects integrate seamlessly into the frozen sidebar (`WHERE`) under Favorites and Projects Directory.
  - Contextual tabs (`WHAT`) follow the established resource navigation pattern.
- **UI-03 My Work**:
  - Personal assignments within projects roll up cleanly into `My Work` (`WRK-010`) by filtering on `assigneeId === CURRENT_USER`.
  - Projects do not create competing personal task lists.
- **UI-04 Personal Inbox**:
  - Project mentions (`@[project:PRJ-42:Title]`) and updates route notifications to the canonical Personal Inbox (`INB-001`).
  - No redundant "Project Inbox" is introduced.
- **UI-05 Team Hub & Core Cycles**:
  - Teams remain the sole owner of WorkItems and Cycles.
  - Multi-team projects allow squads to collaborate while executing work inside their autonomous team cycles.
  - Team Projects tab (`TEM-004`) reuses the canonical Project query filtered by `contributingTeamIds.includes(teamId)`.
- **UI-06 Docs & Knowledge**:
  - `PRJ-003: Project Docs` is a query over canonical `Document` entities.
  - Zero `ProjectDocument` clones.
  - Mentioning a project in a document (`@[project:id:title]`) automatically derives a bidirectional backlink in the document canvas.

---

## 24. Failure & Recovery States

1. **Project Not Found / Inaccessible**:
   - Renders a clean zero-leakage error surface: *"Project not found or you lack permission to view it."* with a CTA to return to the Projects Directory.
2. **Access Revoked Mid-Session**:
   - Transition to read-only lock with banner: *"Your permissions for this project have changed. Refreshing view..."*
3. **Stale Write / Concurrency Conflict**:
   - Optimistic concurrency detects `version` mismatch during metadata update.
   - Raises non-destructive conflict banner: *"This project was updated remotely. Your local edits have been preserved. [Retry / Recheck]"*.
4. **Dependency Cycle Detected**:
   - User attempting to link Project A to Project B where B already depends on A receives an immediate inline validation error: *"Dependency cycle detected: Project B already depends on Project A"*.
5. **Contributing Team Removal Consequence**:
   - Removing a team containing active project work items displays a confirmation modal requiring explicit reassignment or dissociation of items before mutation executes.
