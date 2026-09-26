# UI-07A: Projects Product & UX Contract

- **Document Version:** `1.1.0`
- **Surface Identifier:** `PRJ-001` (Project Workspace Resource Page / Overview), `PRJ-002` (Project Work), `PRJ-003` (Project Docs), `PRJ-004` (Project Milestones), `PRJ-005` (Project Activity), `PRJ-006` (Project Settings & Access), `PRJ-007` (Projects Directory)
- **Status:** **CORRECTION PASS 01A — HUMAN REVIEW**
- **Base Git SHA:** `7dcbfc6126e4d5afbf44b7e03fdbfef5ac643f5d`
- **Branch:** `design/ui-07a-projects-product-ux`
- **Lineage:** `docs/06-complete-page-and-surface-registry.md` $\rightarrow$ `docs/10-ui-02a-application-shell-sidebar-contract.md` $\rightarrow$ `docs/12-ui-03a-my-work-product-ux-contract.md` $\rightarrow$ `docs/14-ui-04a-personal-inbox-product-ux-contract.md` $\rightarrow$ `docs/16-ui-05a-team-hub-product-ux-contract.md` $\rightarrow$ `docs/18-ui-06a-docs-knowledge-product-ux-contract.md` $\rightarrow$ `docs/20-ui-07a-projects-product-ux-contract.md`

---

## 1. Executive Summary & Purpose

A **Project** in Orynqo is a first-class workspace resource for coordinating a **bounded, cross-functional outcome** across execution and knowledge entities:

$$\text{Project} = \text{Coordinated outcome context over canonical execution and knowledge entities}$$

### 1.1 What a Project IS
- A workspace-level resource coordinating WorkItems, Teams, Milestones, Documents, people, target dates, state, health, progress, dependencies, and activity toward a specific delivery objective.
- A cross-team coordination vehicle allowing multiple squads to collaborate without forking or cloning their work.
- The authoritative parent container of **Project Milestones** (`PRJ-004`).
- An outcome scope orthogonal to team-owned iteration cadences (**Cycles**).

### 1.2 What a Project IS NOT
- **NOT a folder containing duplicate WorkItems**: WorkItems belong canonically to their owning Team; Project association is a relationship, not a physical clone or container change.
- **NOT a Team substitute**: Teams are permanent functional squads with continuous cycles; Projects are time-bounded outcome scopes.
- **NOT a SavedView**: A SavedView is a reusable query lens; a Project has distinct lifecycle/archive state, lead, target dates, milestones, health, and activity history.
- **NOT a Cycle**: Cycles are single-team execution timeboxes; Projects span timeframes and multiple participating teams.
- **NOT an Initiative**: An Initiative is a portfolio-level strategic umbrella coordinating multiple Projects; Projects are bounded delivery units.
- **NOT a Document**: Living Specs and RFCs live in canonical Docs (`DOC-002`) and associate to Projects; a Project is an operational coordinator, not a text document.
- **NOT an arbitrary KPI dashboard**: No decorative vanity widgets, empty gauges, or superficial executive charts.
- **NOT a second task-management model**: Project Work (`PRJ-002`) is a projection directly over canonical WorkItems.

---

## 2. Competitive Reference Pass & Synthesis

To establish a world-class Project operating model, we evaluated the patterns of major modern work management systems:

```text
Observed Pattern
| Linear
| Jira
| Asana
| ClickUp / Monday
| Orynqo Decision
| Rationale
```

| Observed Pattern | Linear | Jira | Asana | ClickUp / Monday | Orynqo Decision | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Project Identity & Tenancy** | Workspace resource shared across teams; single Lead. | Heavy workspace container; often conflates team with project. | Workspace project containing tasks; flexible custom fields. | Deep nested hierarchy (Space > Folder > List > Task). | **Workspace Resource** with 0..N participating Teams and optional Lead. | Prevents organizational silos; avoids folder sprawl; enables cross-team execution without duplicating items. |
| **Multi-Team Participation** | 1..N teams explicitly attached; issues retain single team. | Cross-team work requires complex board filters or Advanced Roadmaps. | Single team owner; tasks can be multi-homed across projects. | Custom relations or dashboards across lists. | **0..N Participating Teams + 0..1 Lead Team**; WorkItems strictly retain exactly 1 owning Team. | Models realistic engineering delivery: planning can precede team assignment, squads contribute deliverables under their own team cadences. |
| **WorkItem Relationship** | Single project association; issue belongs to 1 team, 1 project. | Complex issue links or multi-project boards. | Task multi-homing into multiple projects. | Tasks duplicated or mirrored across lists. | **Canonical Single-Project Association** (0..1 Project); WorkItem belongs to 1 Team. | Guarantees deterministic velocity, zero double-counting in rollups, and clean capacity accounting. Multi-project tasks create ambiguity. |
| **Milestones** | Project-owned checkpoints grouping issues; progress bar. | Releases/Versions or Epics; agile release machinery. | Zero-duration milestone tasks on timeline. | Milestone task type or Gantt markers. | **Project-Owned Milestone Entities** (`PRJ-004`); group WorkItems; discrete delivery checkpoints. | Milestones are checkpoints of a Project, not WorkItems themselves. Treats milestones as first-class delivery checkpoints with target dates. |
| **State & Health** | Status + Project Update health. | Workflow status on project; admin configuration. | Delivery status + Status Update health (On Track, At Risk, Off Track). | Highly customizable status columns; multiple dropdowns. | **Orthogonal Operational State + Archive State + Health**: Operational (`planned/in_progress/paused/completed/cancelled`), Archive (`active/archived`), Health (`unset/on_track/at_risk/off_track`). | Separates delivery progress from retention/visibility and subjective health assessments. Eliminates duplicate completion states. |
| **Progress Calculation** | Scope-based % (completed issues or estimates). | Velocity charts, burndown, release progress. | Completed task count % or formula custom fields. | Custom formula rollups (points, sub-items, time). | **Transparent Derived Progress**: Empirical completion ratio ($M/N$ items, $X\%$) with numerator and denominator exposed. Distinct from Health. | No black-box mathematical formulas. Shows actual count ($M/N$ completed) alongside percentage, preventing false mathematical certainty. |
| **Project Updates & Narrative** | Dedicated async Project Updates with health + narrative + Slack sync. | Confluence status reports or third-party apps. | Status Updates with rich text, charts, and portfolio rollup. | Dashboard notes or discussion widgets. | **Canonical Project Updates (`PRJ-001`)**: Authoritative, historical status updates authored by authorized contributors with health snapshot + narrative. | Asynchronous alignment is essential. Preserves historical log of how health and scope evolved over time without relying on ephemeral chat. |
| **Documentation & Specs** | Project Documents tab + external links. | Confluence Space linking; app jump. | Brief / Docs tab with rich text. | ClickUp Docs within lists. | **Project Docs (`PRJ-003`)**: Direct contextual projection over canonical `Document` entities associated with the project. | Reuses canonical DOC-001/002 architecture; zero `ProjectDocument` clones; living specs remain accessible across both Docs Hub and Project. |
| **Project Dependencies** | Project blocking relationships (`blocks` / `blocked_by`). | Issue links or Advanced Roadmaps dependency links. | Project dependencies in Portfolios / Timeline. | Task-level dependencies or Gantt board links. | **Canonical Directional Edge** (`A blocks B`); graph reachability cycle prevention. | Project outcome blockers are strategic and distinct from low-level WorkItem blockers. High-level planning needs project-to-project coordination. |
| **Project Templates** | Standardized project templates with pre-seeded issues/docs. | Heavy enterprise project templates. | Task templates and project templates. | Extensive template marketplace. | **POST-CORE**: Core focuses on frictionless manual creation with progressive disclosure. | Templates introduce premature schema rigidity before core project mechanics are battle-tested. |

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
│ PRJ-007 │ Projects Directory       │ DIRECTORY       │ Scalable workspace discovery catalogue for     │
│         │                          │                 │ searching, filtering, and organizing projects. │
└─────────┴──────────────────────────┴─────────────────┴─────────────────┘
```

---

## 4. Canonical Project Model (Storage-Neutral)

A Project is defined as a semantic workspace resource. The canonical model is intentionally storage-neutral and does not freeze database column schemas, JSON array keys, or transport envelopes:

```text
Project
├── identity (immutable, unique resource handle)
├── workspace tenancy (authoritative workspace scope)
├── human-readable reference / identifier (stable reference for search, mentions, and cross-navigation)
├── name (required string, human title)
├── optional summary / description (plain text summary and/or rich outcome charter)
├── operational state ('planned' | 'in_progress' | 'paused' | 'completed' | 'cancelled')
├── archive state ('active' | 'archived')
├── optional health assessment ('unset' | 'on_track' | 'at_risk' | 'off_track')
├── optional Project Lead (single accountable user handle)
├── participating Teams (0..N participating team handles)
├── optional Lead Team (0..1 team handle; must belong to participating Teams if set)
├── temporal target (target delivery date, release window, or quarter target)
├── optional temporal start (date or window when active execution commenced)
├── optional Initiative alignment (0..1 parent strategic initiative handle)
├── WorkItem associations (canonical WorkItems associated with this project)
├── Document associations (canonical Documents associated with this project)
├── owned Milestones (ordered sequence of delivery gates owned by this project)
├── Project dependencies (canonical blocker relationships linking to/from other projects)
├── access policy (workspace-visible vs restricted access grants)
├── Project Updates (chronological log of published narrative status updates)
└── activity (derived stream of meaningful project domain events)
```

### Invariants:
1. **Workspace Tenancy**: Every Project belongs to exactly one Workspace. Cross-workspace projects are strictly prohibited.
2. **Stable Reference**: Every Project possesses a stable human-readable reference suitable for fuzzy search, entity mentions (`@[project:ref:title]`), and URL routing. Exact prefix generation (`PRJ-N` or similar) remains implementation-tunable.
3. **No Duplicate WorkItems**: WorkItems are never cloned into Projects. A WorkItem associates to 0..1 Project.
4. **Optimistic Concurrency Support**: The mutation boundary supports optimistic concurrency precondition validation; the underlying revision token representation remains implementation-tunable.

---

## 5. Multi-Team Model & Team Participation Rules

### 5.1 Team Participation & Lead Team Cardinality
Engineering initiatives often involve cross-squad collaboration. The contract establishes the following cardinality rules:

```text
Participating Teams: 0..N
Lead Team: 0..1
Lead Team ∈ Participating Teams (when Lead Team exists)
```

- **Planning Precedes Execution**: A Project may be created and planned with `0` participating Teams initially.
- **Lead Team Designation**: A Project may optionally designate exactly one Lead Team accountable for coordination. If a Lead Team is set, it must be included among the participating Teams.
- **Contributing Teams**: Any other participating squads are contributing teams.

### 5.2 No Silent Team Addition Side Effect
- Associating a WorkItem from a non-participating Team does **NOT** silently add that Team to the Project.
- Invariant: A WorkItem may only be associated with a Project when its owning Team is permitted to participate in that Project.
- If an authorized user attempts to link a WorkItem from an unattached team, the application prompts the user with an explicit confirmation: *"Team X is not currently participating in this Project. Add Team X as a participating team?"*. Upon confirmation, team participation is explicitly mutated first.

### 5.3 WorkItem Owning Team Invariant
> **CRITICAL INVARIANT:** Project association NEVER alters or overrides a WorkItem's canonical owning Team.

- In `PRJ-002: Project Work`, items can be grouped or filtered by `Team`, providing clear visibility into cross-squad commitments.
- Removing a participating team from a Project prompts for explicit reassignment or dissociation of that team's remaining active WorkItems; items are never silently deleted or orphaned.

---

## 6. Milestones (PRJ-004) & WorkItem Cardinality

### 6.1 Milestone Semantic Model
Milestones represent sequential, measurable delivery checkpoints or release gates along a Project's journey (e.g., `M1: Technical RFC & Data Model`, `M2: Internal Alpha Dogfooding`, `M3: Public Beta Launch`).

```text
Milestone
├── identity (immutable, unique resource handle)
├── project owner (authoritative parent project handle)
├── name (required title)
├── optional description (summary of gate criteria)
├── temporal target (target delivery date or checkpoint window)
├── status ('open' | 'completed' | 'archived')
├── semantic ordering (deterministic position within the project's sequence of gates)
└── related WorkItems (canonical WorkItems associated with this milestone)
```

### 6.2 Milestone ↔ WorkItem Cardinality Decision
- **Cardinality Decision:** **Zero or One Milestone per WorkItem**.
- **Rationale:**
  - Allowing multiple milestones per WorkItem creates conflicting delivery dates, ambiguous progress calculations, and fractured visual timelines.
  - A single-milestone association establishes an unambiguous delivery checkpoint: *"Which release gate does this specific task unblock?"*
  - If work spans multiple phases, it should be broken down into discrete canonical WorkItems representing the deliverables for each milestone.
- **Milestone Association Semantics:**
  - A WorkItem can only be associated with a Milestone belonging to its associated Project.
  - If a WorkItem's Project association is cleared, its milestone association is automatically cleared.

### 6.3 Milestone Archive vs Delete
- **Archive Milestone (Non-Destructive)**:
  - Preserves historical WorkItem relationships. WorkItems previously completed or assigned to an archived milestone retain their historical milestone context.
  - Removes the milestone from active assignment dropdowns.
- **Delete Milestone**: Permanent deletion is not required in CORE. If deletion is supported, it requires explicit handling to unlink associated WorkItems. WorkItems themselves are never deleted.

### 6.4 Milestone Completion Semantics
- Completing a Milestone:
  - Does NOT automatically mutate WorkItem workflow states.
  - Invariant: Completing a Milestone with incomplete associated WorkItems requires explicit handling; Orynqo never silently completes, deletes, or reassigns those WorkItems.
  - The user explicitly chooses whether incomplete items move to the next milestone, remain in the project without milestone, or remain untouched.

---

## 7. State, Health & Progress

To eliminate semantic collision between container lifecycle, execution phase, subjective health, and mathematical progress, Orynqo enforces an orthogonal state model:

```text
┌─────────────────┬──────────────────────────────────────────┬─────────────────────────────┐
│ Dimension       │ Allowed Values                           │ Operational Meaning         │
├─────────────────┼──────────────────────────────────────────┼─────────────────────────────┤
│ 1. Operational  │ planned | in_progress | paused |         │ Phase of delivery execution │
│    State        │ completed | cancelled                    │                             │
│ 2. Archive State│ active | archived                        │ Visibility / retention state│
│ 3. Health       │ unset | on_track | at_risk | off_track   │ Human-curated outcome risk  │
│ 4. Progress     │ M / N items (X%)                         │ Empirical completion metric │
└─────────────────┴──────────────────────────────────────────┴─────────────────────────────┘
```

### 7.1 Operational State vs Archive State
- **Operational State** tracks execution delivery:
  - `planned`: Scope and charter defined; execution not yet commenced.
  - `in_progress`: Active execution across contributing squads.
  - `paused`: Temporarily halted pending decisions or external blockers.
  - `completed`: Outcome delivered.
  - `cancelled`: Outcome abandoned without delivery.
- **Archive State** governs visibility and retention:
  - `active`: Normal project visible in default directories, team hubs, and pickers.
  - `archived`: Defunct or completed project removed from primary active views; preserved for historical reference and reversible at any time.
- Valid combined examples:
  - `in_progress + active` (Normal execution)
  - `completed + active` (Recently shipped, visible in completed tabs)
  - `completed + archived` (Archived historical record of shipped work)
  - `cancelled + archived` (Archived abandoned initiative)

### 7.2 Health Assessment Semantics
- **Health** (`unset`, `on_track`, `at_risk`, `off_track`) is a human-curated assessment set during Project Updates or explicit health review.
- Health is meaningful primarily for active delivery:
  - For `planned` or newly created projects: health defaults to `unset` (no fabricated health value required).
  - For `paused`, `completed`, or `cancelled` projects: health may remain unchanged, transition to `unset`, or reflect historical closing health.
- Presentation styling (colors, badges, icons) remains implementation-tunable in UI-07B.

### 7.3 Progress Semantics & Security
- **Empirical Progress**:
  - Primary progress measure:
    $$\text{Progress} = \frac{\text{Completed Included WorkItems}}{\text{Total Included WorkItems}}$$
  - The UI always exposes numerator and denominator ($M/N$) alongside the percentage, preventing false mathematical certainty.
- **Inclusion Rules**:
  - Completed WorkItems count toward the numerator.
  - Active and completed items count toward the total denominator.
  - Cancelled WorkItems are excluded from both numerator and denominator by default.
  - Archived WorkItems are excluded from active progress calculation.
  - Zero-item state displays `0 items` (not a false `0%` or `100%`).
  - Estimate-weighted progress is deferred as a tunable/future capability; cross-team estimates cannot be assumed semantically comparable in CORE.
- **Progress Security & Zero-Leakage Policy**:
  - Invariant: A user must not learn of the existence or count of inaccessible WorkItems through Project progress.
  - Progress calculation is **permission-filtered per viewer**: the numerator and denominator reflect only the WorkItems the viewing user is authorized to discover. Alternatively, if a project is restricted, progress is rendered only to authorized project members.

---

## 8. Asynchronous Project Updates (PRJ-001)

Project Updates provide structured asynchronous alignment without endless status meetings.

### 8.1 Project Update Semantic Model
```text
Project Update
├── identity (immutable handle)
├── project (parent project handle)
├── author (user handle of updater)
├── timestamp (publication timestamp)
├── narrative (structured narrative text: accomplishments, focus, context)
├── health snapshot ('on_track' | 'at_risk' | 'off_track')
├── optional temporal target snapshot (projected target date at time of update)
├── optional structured highlights / blockers (explicitly identified blocker items)
└── relationship to activity (publishing may emit an ActivityEvent)
```

### 8.2 Operational & Mutation Rules
- **Health Update Side Effect**: Publishing an update intentionally updates the parent Project's current `health` to match the update's health snapshot.
- **No Hidden Target-Date Mutation**: The update may snapshot the target date for historical records, but publishing an update does **NOT** silently mutate the Project's authoritative target date. Changing target date remains an explicit Project mutation.
- **Historical Snapshot & Revision Policy**:
  - Published Project Updates are historical snapshots and do not silently mutate when current Project fields change.
  - Authors may correct minor typographical errors within an implementation-tunable grace period, or publish a superseding update.
  - Updates cannot be silently deleted if subsequent updates depend on their historical continuity.

---

## 9. Project Dependencies & Blocking Semantics

Projects may have strategic delivery dependencies on other Projects within the same workspace.

### 9.1 Single Canonical Edge Model
Dependencies are modeled directionally as a single canonical relationship:
$$\text{Project A} \xrightarrow{\text{blocks}} \text{Project B}$$
- Semantics: Project A blocks Project B; Project B depends on Project A.
- `depends on` is an inverse query projection over the same canonical edge, not an independent duplicate record.

### 9.2 Dependency Invariants
1. **Strict Cycle Rejection**: Adding a dependency must not create a directed cycle in the Project dependency graph. Before saving, graph reachability validation verifies that the proposed edge does not create a cycle; violations are rejected with an explicit error.
2. **Distinct from WorkItem Dependencies**: A Project dependency represents a strategic deliverable dependency (e.g. "Identity V2 must launch before Multi-Tenant Auth can ship"). It is never automatically inferred from individual WorkItem dependencies.
3. **Zero Cross-Workspace Dependencies**: Dependencies across workspace boundaries are strictly prohibited.
4. **Completion & Archive Behavior**:
   - Project completion does not automatically delete dependency history.
   - The UI derives whether a blocking project is completed or active.
   - Archiving a project preserves dependency relationships. Removing a dependency is always an explicit mutation.

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
 │  • Owning Team: exactly 1 (required)                   │
 │  • Project: 0..1                                       │
 │  • Milestone: 0..1                                     │
 │  • Cycle: 0..1                                         │
 └────────────────────────────────────────────────────────┘
```

### 10.1 Project vs Initiative (Future UI-08)
- A Project may belong to **zero or one Initiative** (`Project → 0..1 Initiative`).
- Removing or archiving an Initiative leaves member Projects intact as standalone workspace projects.
- Projects are fully self-sufficient and operational without an Initiative. Initiative implementation remains out of scope for UI-07.

### 10.2 Project vs Cycle
- Projects and Cycles are completely orthogonal:
  - Projects own outcomes across teams.
  - Cycles are execution timeboxes owned by single Teams.
- A WorkItem can simultaneously have an owning Team, a Project, an active Cycle, and a Milestone. Projects never own Cycles.

### 10.3 Project vs Document (UI-06)
- Reuses canonical `Document` entity. Zero `ProjectDocument` clones.
- `PRJ-003: Project Docs` queries canonical Documents associated with the current Project through the canonical Document association model.
- Contextual creation establishes Project association through Document domain mutation. Clicking a document resolves canonical `DOC-002: Document Canvas`.

---

## 11. PRJ-001: Project Overview (Operational Home)

`PRJ-001` serves as the operational home answering key delivery questions:
- What outcome are we delivering?
- What is our current operational state, health, and target date?
- What milestone is active and when is it due?
- What work is blocked or requires attention?
- What was the latest narrative update?
- Which teams are collaborating?
- What living specs govern this project?

### 11.1 Semantic Information Architecture
The Overview surfaces the following functional regions without freezing rigid column widths or layout coordinates:
1. **Header Region**: Identity, stable reference, title, operational state, health badge, target date, Project Lead, Lead Team, and Favorite toggle.
2. **Outcome & Scope**: Crisp narrative definition of goals and deliverables.
3. **Latest Project Update**: Pinned most recent status narrative, author, timestamp, health snapshot, and trigger to post a new update.
4. **Milestones Snapshot**: Ordered sequence of milestone gates with dates and completion ratios.
5. **Key Documents**: Associated living specs and PRDs with live status indicators.
6. **Delivery Progress**: Empirical completion ratio ($M/N$ items, $X\%$) broken down by status.
7. **Contributing Squads**: Participating teams with commitments.
8. **Dependencies**: Strategic inbound blockers and outbound dependencies.
9. **Recent Activity**: Derived feed of meaningful project domain events.

---

## 12. PRJ-002: Project Work Projection

`PRJ-002` provides a high-density, multi-projection lens over all canonical WorkItems associated with this Project across all contributing squads.

### 12.1 Projections Supported
1. **Data Grid (`WRK-001`)**: Default dense table view supporting sorting, multi-selection, inline property editing, and custom groupings.
2. **Kanban Board (`WRK-002`)**: Board projection where columns are derived from the applicable workflow configuration.
3. **Timeline / Roadmap (`WRK-003`)**: Date-oriented visualization plotting items against milestones and target dates.

### 12.2 Grouping & Filtering Dimensions
- **Supported Groupings**:
  - `By Team`: Groups rows by contributing squad, making cross-team ownership instantly visible.
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
- Queries canonical Documents associated with the current Project through the canonical Document association model.
- Contextual creation (`+ New Project Doc`) establishes Project association through Document domain mutation.
- Clicking any row navigates directly to canonical `DOC-002: Document Canvas`.

---

## 14. PRJ-005: Project Activity Stream

`PRJ-005` presents a filtered, chronological history of meaningful project-level domain events reusing canonical `ActivityEvent`.

### 14.1 Semantic Boundary
- **ActivityEvent $\neq$ Enterprise Audit**: Keystrokes, continuous draft typing, and transient filter interactions are never logged.
- Project Updates may emit ActivityEvents for timeline discovery, but the full immutable narrative remains housed in the Project Update domain.
- Events logged: Project created, operational state changed, health modified, update published, Lead/Teams updated, milestone created/completed, dependency linked/unlinked, project archived/restored.

---

## 15. PRJ-006: Project Settings & Access

`PRJ-006` manages project-level configuration, authorization, and lifecycle transitions.

### 15.1 Configuration Sections
1. **General Details**: Project name, stable reference, summary, target dates.
2. **Leadership & Teams**: Project Lead, Lead Team, and participating teams.
3. **Dependencies**: Manage inbound and outbound project-level dependencies with graph reachability validation.
4. **Access & Visibility**: Semantic workspace-visible vs restricted access policy.
5. **Danger Zone**:
   - `Mark Completed`: Transitions operational state to `completed`.
   - `Archive Project`: Sets archive state to `archived`.
   - `Restore Project`: Restores an archived project to `active`.

---

## 16. PRJ-007: Projects Directory

`PRJ-007` is the workspace-wide discovery catalogue for finding, filtering, and organizing projects.

### 16.1 Scalable Directory Capabilities
- **High-Density Table / List**: Project Reference, Name, Lead, Participating Teams, Operational State, Health, Target Date, Progress.
- **Faceted Filters**: Operational State, Health, Participating Team, Lead, Initiative, Archive State (`active` vs `archived`).
- **Scalable Search**: Search is scalable, authorization-aware, and compatible with server-side querying and indexing across large collections.
- **Stable Sorting**: Sort by Target Date, Name, Health, Progress, or Last Updated.
- **Virtualization Compatibility**: Designed for efficient rendering of large project collections without unbounded DOM creation.

---

## 17. Project Lifecycle: Completion & Archival Semantics

### 17.1 Completion Semantics
- Moving a Project to `operationalState: 'completed'`:
  - Invariant: Completing a Project never automatically mutates WorkItem workflow status.
  - If open WorkItems remain:
    - User may leave associations intact (items remain open in their respective teams).
    - User may explicitly invoke canonical WorkItem bulk operations separately where authorized.
  - Does NOT archive associated Documents (Living Specs remain active living knowledge).
  - Can be reopened (`in_progress`) at any time by authorized users.

### 17.2 Archival Semantics
- Moving a Project to `archiveState: 'archived'`:
  - Hides the project from default active directories, picker dropdowns, and sidebar favorites.
  - Invariant: Archiving a Project does not archive WorkItems, Documents, Teams, or Cycles, and does not destroy Milestone or Dependency history.
  - WorkItem association dropdowns exclude archived Projects by default.
  - Fully reversible via restore action. Permanent hard-delete is strictly deferred (POST-CORE).

---

## 18. Authorization & Zero-Leakage Policy

All Project queries and surfaces strictly adhere to zero-leakage security:

1. **Pre-Render Authorization**:
   - If a user lacks permission to discover a restricted project, it is completely omitted from directory listings, Omnisearch results, portfolio rollups, and activity feeds.
   - If a user is authorized to know a relationship exists but not project metadata, an opaque restricted representation is rendered. The existence of a restricted project is never automatically exposed.
2. **Semantic Capabilities**:
   - `canViewProject`: Access to read overview, work, docs, milestones.
   - `canEditProject`: Permission to update charter, target date, and metadata.
   - `canPostProjectUpdate`: Permission to publish authoritative Project Updates.
   - `canManageProjectTeams`: Permission to add/remove participating teams.
   - `canManageProjectMilestones`: Permission to create, edit, or complete milestones.
   - `canManageProjectDependencies`: Permission to create or remove dependencies.
   - `canManageProjectAccess`: Permission to modify access policy.
   - `canCompleteProject`: Permission to mark project completed.
   - `canArchiveProject`: Permission to archive or restore the project.

---

## 19. Conceptual Component Responsibilities

Component responsibilities are defined conceptually without freezing implementation file paths:

```text
Project Domain Conceptual Architecture
├── Project Resource Shell (routing, header, tab state, context preservation)
├── Project Overview (operational home, charter, latest update, progress widget)
├── Project Work Projection (Data Grid WRK-001, Kanban Board WRK-002, Timeline WRK-003)
├── Project Docs Projection (canonical document query and creation trigger)
├── Project Milestones (milestone sequence, delivery checkpoints, item grouping)
├── Project Activity (filtered ActivityEvent stream)
├── Project Settings (metadata, team participation, access, danger zone)
├── Projects Directory (scalable catalogue, facets, search, virtualization)
├── Project Update Experience (update presentation, publishing, history)
├── Project Health (health state assessment and indicator)
├── Project Progress (empirical item ratio calculation and rendering)
├── Project Team Participation (participating teams and lead team management)
├── Project Dependencies (directional dependency management and cycle validation)
└── Project Access (workspace-visible vs restricted grants)
```

---

## 20. Conceptual Query Contracts & Mutation Ownership

### 20.1 Conceptual Query Contracts
All query capabilities are workspace-scoped, authorization-aware, bounded, and large-collection compatible:
1. **Projects Collection Query**: Filtered directory query supporting pagination/cursors, search, and sorting.
2. **Project Detail Query**: Authoritative single-project retrieval.
3. **Project Work Query**: Bounded query over canonical WorkItems associated with the project.
4. **Project Documents Query**: Query over canonical Documents associated with the project.
5. **Project Milestones Query**: Ordered retrieval of project milestones and associated items.
6. **Project Updates Query**: Chronological retrieval of project update history.
7. **Project Activity Query**: Bounded chronological stream of project ActivityEvents.
8. **Project Dependencies Query**: Retrieval of immediate inbound and outbound project dependencies.

### 20.2 Mutation Ownership & Delegation Boundaries
- **Project Domain Owns**:
  - Project creation and metadata updates.
  - Operational state transitions and archive/restore.
  - Project Lead and Lead Team designation.
  - Team participation management.
  - Project access policy mutations.
  - Project dependency linking and unlinking.
  - Project Updates publishing.
  - Project-owned Milestone creation, ordering, and completion.
- **Project Domain Delegates**:
  - WorkItem status and attribute mutation $\rightarrow$ WorkItem domain.
  - Document content and association mutation $\rightarrow$ Document domain.
  - Team creation and lifecycle $\rightarrow$ Team domain.
  - Favorites and user preferences $\rightarrow$ Preferences/Favorite domain.
  - Comments and discussions $\rightarrow$ Collaboration domain.

---

## 21. Required Core Decisions (Resolution Table)

| Decision Item | Chosen Architecture | Operational Rationale |
| :--- | :--- | :--- |
| **1. Canonical Project Identity** | Workspace-scoped resource with stable human-readable reference. | Independent of team folders; enables cross-team alignment. |
| **2. Multi-Team Participation** | Native 0..N participating teams. | Projects may exist before team assignment; supports multi-squad delivery. |
| **3. Lead Team Cardinality** | Optional 0..1 Lead Team (must be in participating teams). | Designates primary squad without restricting participation. |
| **4. Project Lead** | Optional single primary lead user. | Unambiguous individual accountability for delivery outcome. |
| **5. Initiative Cardinality** | 0..1 Initiative per Project. | Strategic portfolio alignment without multi-parent graph complexity. |
| **6. Project vs Cycle Boundary** | Strictly orthogonal. | Teams own Cycles; Projects own outcomes. Items have both. |
| **7. Milestone Model** | Project-owned sequential gate with target date. | Clear checkpoints; distinct from tasks or cycles. |
| **8. Milestone ↔ WorkItem** | Zero or One Milestone per WorkItem. | Eliminates timeline ambiguity and double-counting in progress. |
| **9. Operational State Model** | `planned`, `in_progress`, `paused`, `completed`, `cancelled`. | Tracks delivery phase distinctly from archive state. |
| **10. Archive State Model** | `active`, `archived`. | Orthogonal visibility and retention state. |
| **11. Project Health Model** | `unset`, `on_track`, `at_risk`, `off_track`. | Human-curated assessment attached to Project Updates. |
| **12. Progress Semantics** | Transparent derived ratio ($M/N$, $X\%$), permission-filtered. | Zero false mathematical certainty; no hidden count leakage. |
| **13. Project Updates** | **CORE**: Historical narrative snapshots with health. | Eliminates status meetings; asynchronous team alignment. |
| **14. Project Dependencies** | **CORE**: Directional edge (`blocks`) with cycle detection. | Strategic project-to-project coordination; cycle prevention. |
| **15. Individual Membership** | **Derived**: Contributing teams + WorkItem assignees + Lead. | Prevents redundant user roster management; optional restricted grants. |
| **16. Project Work Projections**| Data Grid (`WRK-001`), Kanban Board (`WRK-002`), Timeline. | Full execution power over canonical WorkItems. |
| **17. Project Docs** | Direct query over canonical `Document` entities. | Zero duplicate wiki systems; living specs remain unified. |
| **18. Project Activity** | Filtered stream of meaningful domain events. | Reuses `ActivityEvent`; no noise from keystrokes. |
| **19. Completion Semantics** | Explicit handling; WorkItem workflow status never mutated. | Prevents accidental mass-closure or orphan work. |
| **20. Archive Semantics** | Reversible soft archival; relations preserved. | Zero data loss; reversible without hard deletion. |
| **21. Permission Model** | Semantic capabilities with pre-render zero leakage. | Unifies workspace vs restricted project security. |
| **22. Projects Directory** | Scalable, searchable, filterable directory (`PRJ-007`). | Scales to large workspaces with server-compatible search. |
| **23. Project Creation** | Progressive disclosure (Name minimum; optional Teams/Lead). | Allows planning scope to be defined before team assignment. |
| **24. Project Templates** | **POST-CORE**: Evaluated and deferred. | Avoids premature schema rigidity; manual creation is fast. |
| **25. Responsive Modes** | Semantic `wide`, `compact`, `narrow`. | Mobile collapses supporting widgets; desktop shows rich overview. |
| **26. Mutation Ownership** | Project domain owns project metadata; delegates WorkItems/Docs.| Clean domain isolation; zero cross-domain state leakage. |

---

## 22. CORE vs POST-CORE Boundaries

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
│ • PRJ-007: Projects Directory (Scalable)     │ • Cross-Workspace Shared Projects            │
│ • 0..N Contributing Teams + 0..1 Lead Team   │ • AI Project Charter / Risk Analysis Gen     │
│ • Multi-Vector Operational State & Health    │ • Permanent Hard-Delete / Project Trash      │
│ • Asynchronous Project Updates with History  │ • Custom Project Metadata Field Designer     │
│ • Directional Dependencies with Cycle Check  │ • External Public Project Status Portals     │
│ • Permission-Filtered Derived Progress Ratio │ • Cross-Team Estimate-Weighted Progress      │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 23. Frozen vs Tunable Specifications

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FROZEN SPECIFICATIONS                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Canonical Project entity boundary and workspace tenancy.            │
│ 2. Multi-team participation semantics (0..N teams, 0..1 Lead Team).    │
│ 3. WorkItem owning team invariant (Project never alters item team).    │
│ 4. Single-milestone cardinality per WorkItem (0..1 milestone).         │
│ 5. Distinct state model: Operational State, Archive State, Health.     │
│ 6. Transparent Progress (M/N items, X%) with zero-leakage security.    │
│ 7. Canonical Project Updates as historical narrative snapshots.        │
│ 8. Single canonical dependency direction with strict cycle rejection.  │
│ 9. Project Docs as contextual query over canonical Document entities.  │
│ 10. PRJ-001 through PRJ-007 canonical surface boundaries.             │
│ 11. Pre-render zero-leakage security and semantic action capabilities. │
│ 12. Non-destructive milestone archive and explicit completion rules.   │
│ 13. Project completion never mutates WorkItem workflow status.         │
│ 14. Mutation ownership and explicit domain delegation boundaries.      │
│ 15. Deferral of Templates, Budgeting, Workload, and AI to POST-CORE.   │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                        TUNABLE IMPLEMENTATION                          │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Exact CSS tokens, layout padding, and color palette shades.         │
│ 2. Exact responsive viewport breakpoints (pixels).                     │
│ 3. Physical keyboard shortcut bindings in Command Palette.             │
│ 4. Database persistence schema, join tables, and SQL migrations.       │
│ 5. API endpoint routing shapes, payload envelopes, and query params.   │
│ 6. Optimistic concurrency token format (version number, ETag, etc.).   │
│ 7. Exact human-readable identifier prefix and sequence generator.      │
│ 8. Client-side caching and state management library choices.           │
│ 9. Virtualization row-height thresholds in directory view.             │
│ 10. Graph reachability cycle detection algorithm implementation.       │
│ 11. Filenames, internal folder structure, and helper function naming.  │
│ 12. Exact progress bar visualization and animation curves.             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 24. Consistency Audit with Frozen Phases (UI-01 through UI-06)

- **UI-01 Execution Core**:
  - `WorkItem` remains the sole canonical execution primitive.
  - Project Work (`PRJ-002`) reuses the universal Data Grid (`WRK-001`) and Inspector (`WRK-005`) without duplicating item state.
  - Project association never alters WorkItem Team ownership.
  - No Project-specific WorkItem mutation bypass path.
- **UI-02 Application Shell**:
  - Projects integrate into the frozen sidebar (`WHERE`) under Favorites and Projects Directory (`PRJ-007`).
  - Contextual tabs (`WHAT`) follow the established resource navigation pattern.
- **UI-03 My Work (`PER-002`)**:
  - Personal project assignments roll up into My Work via standard `assigneeId` filter.
  - Projects do not create competing personal task lists.
- **UI-04 Personal Inbox (`PER-001`)**:
  - Project mentions (`@[project:ref:Title]`) and updates route notifications to Personal Inbox.
  - Notifications remain `NotificationEvent` projections; no redundant "Project Inbox" exists.
- **UI-05 Team Hub & Core Cycles**:
  - Teams remain the sole owner of WorkItems and Cycles.
  - Multi-team projects allow squads to collaborate while executing work inside their autonomous team cycles.
  - Team Projects tab (`TEM-004`) reuses the canonical Project query filtered by team participation.
- **UI-06 Docs & Knowledge**:
  - `PRJ-003: Project Docs` is a query over canonical `Document` entities.
  - Zero `ProjectDocument` clones.
  - Document association mutations remain Document-domain operations.
- **Result**: Zero contradictions detected across all frozen phases.

---

## 25. Failure & Recovery States

1. **Project Not Found / Inaccessible**:
   - Renders a clean zero-leakage error surface: *"Project not found or you lack permission to view it."* with a CTA to return to the Projects Directory.
2. **Access Revoked Mid-Session**:
   - Transition to read-only lock with banner: *"Your permissions for this project have changed. Refreshing view..."*
3. **Stale Write / Concurrency Conflict**:
   - Optimistic concurrency detects revision mismatch during metadata update.
   - Raises non-destructive conflict banner: *"This project was updated remotely. Your local edits have been preserved. [Retry / Recheck]"*.
4. **Dependency Cycle Detected**:
   - User attempting to link Project A to Project B where B already depends on A receives an immediate inline validation error: *"Dependency cycle detected: Project B already depends on Project A"*.
5. **Contributing Team Removal Consequence**:
   - Removing a team containing active project work items displays a confirmation dialog requiring explicit reassignment or dissociation of items before mutation executes.
