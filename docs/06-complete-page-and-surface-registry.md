# Orynqo Platform — Complete Page & Surface Registry (Phase IA-03 / IA-03A)

**Status:** Completed Master Specification (Phase IA-03A Final Integrity Pass — Ready for Final Freeze & Human Review)  
**Governing Methodology:** `antigravity-enterprise-product-design`  
**Preceding Phases:**  
- `Architecture & Design-System Stabilization (Pass 01 & 01A — APPROVED)`  
- `IA-01 Competitive Navigation Research (APPROVED)`  
- `IA-02 Sidebar Architecture & Navigation Contract (APPROVED & FROZEN)`  
**Current Phase:** `IA-03 / IA-03A Complete Page & Surface Registry (FINAL INTEGRITY PASS)`  
**Subsequent Phase:** `UI-01 Foundation & High-Density Core Screens (Awaiting IA-03A Approval)`  
**Implementation Freeze:** STRICTLY ENFORCED (Documentation-only deliverable; no UI code, mockups, or route changes)  

---

## 1. Executive Summary & Purpose

Phase `IA-03A` establishes the **internally audited, mathematically reconciled master surface registry** of the Orynqo platform. It answers:
- **WHAT** surfaces exist across the entire platform.
- **WHY** each surface exists and what user problem it solves.
- **WHO** uses it (personas, roles, and access boundaries).
- **WHERE** it lives in the information architecture and spatial hierarchy.
- **WHAT** entities it reads and mutates.
- **HOW** users reach it (entry points, deep links, keyboard shortcuts).
- **WHAT** other surfaces, inspectors, overlays, and components it depends upon.
- **IN WHAT SEQUENCE** surfaces should subsequently be designed and built.

This document serves as the permanent master blueprint for all subsequent UI/UX design phases (`UI-01`, `UI-02`, etc.) and future Golden Flows.

### IA-03A Final Integrity Pass Summary of Corrections
1. **Mathematical Accounting Reconciliation:** Reconciled every surface ID so that the canonical surface count equals the sum of mutually exclusive surface types and equals the sum of lifecycle classifications ($50 = \sum \text{Types} = \sum \text{Lifecycles}$).
2. **Settings Registry Gap Closed:** Replaced informal taxonomy mentions with explicit canonical registry entries for Personal Settings (`PER-003`), Team Settings (`TEM-008`), Workspace Settings (`WKS-001` through `WKS-004`), and Enterprise Administration (`ADM-001` through `ADM-003`).
3. **Full Team & Project Contract Representation:** Added canonical sub-surfaces for Team Overview (`TEM-002`), Team Projects (`TEM-004`), Team Docs (`TEM-005`), Project Docs (`PRJ-005`), and Project Activity (`PRJ-006`).
4. **Saved View Reclassification:** Reclassified `VEW-002` as a `RESOURCE PAGE` (the canonical execution canvas for a persisted query) and `VEW-001` as a `PRIMARY PAGE` (the Saved Views Hub).
5. **Cycle Resource Clarification:** Codified Cycle as a canonical domain resource scoped to Teams (`TEM` $\rightarrow$ `CYC`), with explicit lifecycle bounds, committed work, and non-automatic rollover semantics.
6. **Provisional Constraints:** Marked keyboard shortcuts as *Candidate Shortcut / Interaction Intent*, dimensions as *Semantic Design Intent*, and implementation technologies as *Candidate Architecture — Not Frozen*.
7. **Offline & Security Realism:** Scoped CORE offline behavior to Network Disconnection UX (safe state, banner, failure protection) rather than full offline multi-master sync; scoped Audit Log and SSO to realistic product requirements.
8. **Architectural Guardrails Added:** Added Domain Ownership Matrix, Projection Compatibility Matrix, Mutation Consistency Contract, Permission Consistency Contract, Large-Scale Implementation Guardrails, and the Implementation Readiness Contract.

---

## 2. Frozen IA-02 Architecture Baseline

All surface registrations in this document strictly conform to the frozen navigation laws established in `IA-02`:

1. **The Spatial Mental Model:**
   - `SIDEBAR = WHERE` (Scope, Organization, Team, or Container selection)
   - `RESOURCE NAVIGATION = WHAT` (Contextual facets: Overview, Work, Cycles, Projects, Docs, Triage, Members)
   - `PROJECTION CONTROLS = HOW` (Visual lenses: Grid, Board, Timeline, Calendar, Workload)
   - `INSPECTOR = DETAIL WITHOUT CONTEXT LOSS` (Context-preserving slide-over properties, specs, comments)
   - `COMMAND PALETTE = LONG-TAIL DISCOVERY + ACTIONS` (`⌘K` instant navigation and command execution)
2. **Resource vs. Projection Law:** Projections (`Table Grid`, `Kanban Board`, `Timeline/Gantt`, `Workload`) are never top-level sidebar destinations. They are contextual presentation lenses over underlying resources.
3. **Canonical Planning & Execution Hierarchy:**
   ```text
   Goal / Objective [future tier]
        ↓ supports
   Initiative [strategic planning resource]
        ↓ coordinates
   Project [bounded deliverable]
        ├── Milestones (Planning & release checkpoint entities — NOT a WorkItem subtype)
        ├── Documents (Canonical Document model: Living Specs/PRDs, RFCs, Runbooks — NOT a WorkItem subtype)
        └── Work Items (Atomic executable units: Tasks, Issues, Bugs)
   ```
4. **Docs as Global Knowledge Label:** Houses all knowledge artifacts under a single canonical document entity model.
5. **Capability-Aware Teams:** Teams dynamically declare capabilities (`cycles`, `triage`, `projects`, `docs`, `automations`). Sprints/cycles are not mandatory for all squads.
6. **Project Discovery Law:** Projects are discoverable through Teams, Initiatives, Favorites, Omnisearch, and an on-demand Projects Directory—never an unbounded flat global sidebar list.
7. **Organization vs. Workspace Topology:** Organization is the enterprise/billing/security boundary; Workspace is the collaborative product execution boundary.

---

## 3. Surface Completeness Rule & Domain Resource vs. UI Surface

### 3.1. Surface Completeness Rule
To prevent artificial "registry inflation", a surface is registered in this master specification **if and only if** it has a distinct combination of:
1. Primary user job.
2. Navigation context / container.
3. Interaction model.
4. Access or permission boundary.
5. Lifecycle and state requirements.

A distinct surface is **NOT** created merely because:
- A dataset has a different filter or sort applied.
- A different document template/type exists within the same editor.
- A different projection mode (Grid vs Board) is toggled over the same collection.
- The same component appears inside another parent resource.
- A settings page has a different sub-heading.

### 3.2. Domain Resource vs. UI Surface
A fundamental principle of Orynqo's scalable product architecture is that **a Domain Resource is not equivalent to a UI Surface**:

```text
DOMAIN RESOURCE (Data & Lifecycle Identity)
≠
UI SURFACE (Presentation, Context & Interaction)
```

Examples of this distinction:
- **`WorkItem` (Domain Resource):** Has canonical ID, title, status, relations. Rendered via:
  - `WRK-001` (Universal Data Grid Projection)
  - `WRK-002` (Kanban Board Projection)
  - `WRK-005` (Work Item Inspector Drawer)
  - `CMD-002` (Quick Create Modal)
  - `DOC-002` (Embedded Living Spec Execution Table)
- **`Document` (Domain Resource):** Has canonical ID, markdown/block tree, authors. Interacted with via:
  - `DOC-001` (Docs Hub Primary Page)
  - `DOC-002` (Canonical Document Canvas / Editor)
  - `DOC-003` (Document Metadata & Version Inspector)
- **`Project` (Domain Resource):** Has lifecycle bounds, leads, target quarter. Interacted with via:
  - `PRJ-001` (Project Workspace Resource Page)
  - `PRJ-002` (Project Overview Sub-Surface)
  - `PRJ-003` (Project Work Sub-Surface)
  - `PRJ-005` (Project Docs Sub-Surface)
  - `PRJ-007` (Projects Directory)

---

## 4. Surface Taxonomy & Classification Scheme

Every Orynqo surface is classified into one of ten mutually exclusive architectural surface types:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        SURFACE TYPE TAXONOMY                           │
├─────────────────────────┬──────────────────────────────────────────────┤
│ Surface Type            │ Architectural Definition & Role              │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 1. PRIMARY PAGE         │ Top-level destination anchored directly in   │
│                         │ global navigation (Inbox, My Work, etc.).    │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 2. DIRECTORY            │ Search, browse, and filter catalogue of      │
│                         │ containers (Projects Directory, Teams).      │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 3. RESOURCE PAGE        │ Dedicated canonical environment for a major  │
│                         │ container entity (Team Hub, Project, Doc).   │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 4. RESOURCE SUB-SURFACE │ Contextual tab or functional facet within a  │
│                         │ parent Resource Page (Team Work, Milestones).│
├─────────────────────────┼──────────────────────────────────────────────┤
│ 5. PROJECTION           │ Mathematical presentation lens over work item│
│                         │ collections (Grid, Board, Timeline, Workload)│
├─────────────────────────┼──────────────────────────────────────────────┤
│ 6. OVERLAY              │ High-focus modal, dialog, or popover         │
│                         │ interrupt (Command Palette, Quick Create).   │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 7. INSPECTOR / DRAWER   │ Resizable right-hand slide-over preserving   │
│                         │ background list context and scroll position. │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 8. SETTINGS PAGE        │ Standard configuration surface for user,     │
│                         │ team, or workspace preferences.              │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 9. ADMIN PAGE           │ Enterprise governance, security, RBAC,       │
│                         │ audit logs, and billing console.             │
├─────────────────────────┼──────────────────────────────────────────────┤
│ 10. GLOBAL SYSTEM       │ Ambient system-wide state surfaces (Error    │
│     SURFACE             │ boundaries, offline banners, tombstones).    │
└─────────────────────────┴──────────────────────────────────────────────┘
```

---

## 5. Master Registry Identifier Convention

Every surface carries a permanent, collision-safe documentation registry ID:

- `PER-xxx` : Personal Work & Settings Surfaces
- `WRK-xxx` : Work Management Execution Surfaces & Projections
- `TEM-xxx` : Team Surfaces, Capabilities & Settings
- `PRJ-xxx` : Project Surfaces, Sub-surfaces & Directory
- `CYC-xxx` : Cycle & Cadence Surfaces
- `INT-xxx` : Strategic Planning & Initiative Surfaces
- `DOC-xxx` : Docs & Knowledge Surfaces
- `VEW-xxx` : Saved View Surfaces
- `COL-xxx` : Collaboration & Notification Surfaces
- `CMD-xxx` : Search, Command Palette & Pickers
- `WKS-xxx` : Workspace Administration
- `ADM-xxx` : Enterprise Organization Governance
- `SYS-xxx` : Global System States

---

## 6. Complete Master Surface Registry (50 Canonical Surfaces)

### 6.1. Personal Domain (`PER`)

#### `PER-001`: Personal Triage Inbox
- **Name:** Personal Triage Inbox
- **Surface Type:** PRIMARY PAGE
- **Domain:** Personal Work
- **Parent Resource:** Workspace Root
- **Purpose:** Centralized clearinghouse for actionable events directed at the user (mentions, assignments, review requests, thread replies). Solves notification fragmentation.
- **Why Standalone:** Requires dedicated zero-mouse triage keyboard workflows (`e` archive, `z` snooze) and split-pane item inspection. Cannot be reduced to a popover.
- **Actors:** All Authenticated Users.
- **Scope:** Personal.
- **Entities Read:** `NotificationEvent`, `WorkItem`, `Document`, `CommentThread`, `User`.
- **Entities Mutated:** `NotificationEvent` (status: unread $\rightarrow$ read $\rightarrow$ archived/snoozed).
- **Entry Points:** Global Sidebar `Inbox` link; Shortcut `G then I` (candidate); Command Palette `⌘K`.
- **Navigation Lineage:** Root $\rightarrow$ Inbox.
- **Core Jobs:** Rapid triage of daily events; clearing unread backlog to reach "Inbox Zero"; opening context on assigned tasks.
- **Contextual Projections:** Filter segments (`Unread`, `All`, `Snoozed`, `Archived`).
- **Dependencies:** Work Item Inspector (`WRK-005`), Document Inspector (`DOC-003`).
- **Permissions:** All authenticated users, including external guests.
- **Lifecycle & States:** Loading skeleton, Populated, Empty (Illustrated "Inbox Zero"), Error boundary.
- **Keyboard Intent:** Rapid navigation (`j`/`k`), archive (`e`), snooze (`z`), expand/inspect (`Enter`), archive all (`Shift+e`).
- **Responsive Translation:** Converts to full-width stream; tapping item pushes detail screen.
- **MVP Classification:** **CORE**

#### `PER-002`: My Work Cockpit
- **Name:** My Work Cockpit
- **Surface Type:** PRIMARY PAGE
- **Domain:** Personal Work
- **Parent Resource:** Workspace Root
- **Purpose:** Cross-team, multi-project aggregator of all executable work assigned to or authored by the user. Answers: *"What do I need to execute today?"*
- **Why Standalone:** Aggregates work across dozens of teams and projects without forcing the user to visit individual team boards.
- **Actors:** All Authenticated Users.
- **Scope:** Personal.
- **Entities Read:** `WorkItem`, `Project`, `Team`, `Cycle`.
- **Entities Mutated:** `WorkItem` (status, priority, estimates, due dates).
- **Entry Points:** Global Sidebar `My Work` link; Shortcut `G then M` (candidate); Command Palette `⌘K`.
- **Navigation Lineage:** Root $\rightarrow$ My Work.
- **Core Jobs:** Daily task prioritization; status updating; tracking assigned vs created issues.
- **Contextual Sub-Segments:** Internal tabs: `Assigned to Me` | `Created by Me` | `Subscribed` | `Review Requests`.
- **Projections:** Data Grid (`WRK-001`), Kanban Board (`WRK-002`), Timeline (`WRK-003`).
- **Dependencies:** Work Item Inspector (`WRK-005`), Quick Create (`CMD-002`).
- **Permissions:** All authenticated users.
- **Lifecycle & States:** Loading skeleton, Populated, Filtered Empty, Stale/Reconnecting banner.
- **Keyboard Intent:** Full Data Grid navigation (`j`/`k`, selection, status change, priority change, inspect).
- **MVP Classification:** **CORE**

#### `PER-003`: Personal User Settings & Preferences
- **Name:** Personal User Settings & Preferences
- **Surface Type:** SETTINGS PAGE
- **Domain:** Personal Work
- **Parent Resource:** Workspace Root
- **Purpose:** Single consolidated surface for managing the user's personal identity, client preferences, and developer credentials.
- **Why Standalone:** Decouples user-level personal customization from collaborative workspace administration.
- **Actors:** Current Authenticated User.
- **Scope:** Personal.
- **Internal Sections:**
  - `Profile & Account:` Full name, avatar, email, password/credentials, bio.
  - `Preferences:` Theme (Dark/Light/System), Information Density (Compact/Default), Keyboard Shortcuts profile, Locale & Timezone.
  - `Notifications:` Email digest frequency, desktop notifications, mention alerts, auto-subscribe rules.
  - `Developer / Tokens:` Personal access tokens, authorized OAuth apps.
- **Entry Points:** Sidebar user profile menu `Preferences`; Command Palette `⌘K`.
- **Permissions:** Accessible strictly to the owning user.
- **Lifecycle & States:** Loaded, Mutated (dirty form state with discard/save confirmation).
- **MVP Classification:** **CORE**

---

### 6.2. Work Management & Execution Projections (`WRK`)

#### `WRK-001`: High-Density Data Grid Projection
- **Name:** High-Density Data Grid Projection
- **Surface Type:** PROJECTION
- **Domain:** Work Management
- **Parent Resource:** Rendered inside any Work container (`Team Work`, `Project Work`, `My Work`, `Cycle`, `Saved View`).
- **Purpose:** Tabular projection optimized for maximum information density, rapid scanning, keyboard inline edits, and bulk actions.
- **Why Projection:** Not an independent page; it is a presentation mode dynamically applied to any canonical work item query.
- **Actors:** Engineers, Product Managers, Leads, Operations.
- **Scope:** Contextual (inherits container scope).
- **Entities Read:** `WorkItem[]`, `User[]`, `Project[]`, `Cycle[]`.
- **Entities Mutated:** `WorkItem` inline property mutations.
- **Core Jobs:** Scanning 50+ rows without pagination lag; inline editing assignee, priority, status; multi-selection bulk operations.
- **Dependencies:** Work Item Inspector (`WRK-005`), Context Pickers (`CMD-003`).
- **Keyboard Intent:** Cell/row traversal (`Arrow` keys or `j`/`k`), row selection (`x`), open inspector (`Enter`), quick edit (`Space`).
- **Accessibility:** Accessible table grid structure, column header sort announcements, focus ring preservation.
- **MVP Classification:** **CORE**

#### `WRK-002`: Workflow Kanban Board Projection
- **Name:** Workflow Kanban Board Projection
- **Surface Type:** PROJECTION
- **Domain:** Work Management
- **Parent Resource:** Rendered inside any Work container (`Team Work`, `Project Work`, `My Work`, `Cycle`).
- **Purpose:** Visual stage-gate drag-and-drop projection grouped by workflow status (`Backlog`, `Todo`, `In Progress`, `Review`, `Done`).
- **Why Projection:** Lenses the exact same work items as the Data Grid in spatial column format without data bifurcation.
- **Actors:** Team Members, Scrum Leads, Designers.
- **Scope:** Contextual.
- **Entities Mutated:** `WorkItem.status`, `WorkItem.columnOrder`.
- **Core Jobs:** Visualizing sprint flow; dragging items across status gates; identifying bottlenecks.
- **Keyboard Intent:** Card-to-card navigation, column jumping, keyboard drag/move trigger.
- **MVP Classification:** **CORE**

#### `WRK-003`: Temporal Timeline / Gantt Projection
- **Name:** Temporal Timeline / Gantt Projection
- **Surface Type:** PROJECTION
- **Domain:** Work Management
- **Parent Resource:** Contextual to Project Work, Team Cycles, or Initiatives.
- **Purpose:** Visualizes scheduled work items along a calendar axis with dependency lines (`blocks` / `blocked_by`) and milestone markers.
- **Capability Requirements:** Requires work items to have target dates or cycle bounds.
- **MVP Classification:** **CORE**

#### `WRK-004`: Capacity & Workload Projection
- **Name:** Capacity & Workload Projection
- **Surface Type:** PROJECTION
- **Domain:** Work Management
- **Parent Resource:** Contextual to Team Cycles or Project Work.
- **Purpose:** Aggregates point estimates and task counts per team member to signal over-allocation and balance velocity.
- **Capability Requirements:** Requires team estimation points enabled.
- **MVP Classification:** **POST-CORE**

#### `WRK-005`: Work Item Inspector Drawer
- **Name:** Work Item Inspector Drawer
- **Surface Type:** INSPECTOR / DRAWER
- **Domain:** Work Management
- **Parent Resource:** Global App Shell (slides over any view).
- **Purpose:** Context-preserving detail editor for a selected work item. Displays full description, linked Living Specs, subtasks, activity log, and discussion comments without navigating away from the active list.
- **Dimensions:** Resizable drawer with responsive semantic intent (accommodates high-density property inspection without obscuring underlying context).
- **URL Backing:** Query param or contextual deep link (e.g. `?inspect=OR-1082` — proposed route taxonomy).
- **Keyboard Intent:** `Escape` closes drawer and restores focus to triggering list row.
- **MVP Classification:** **CORE**

---

### 6.3. Team Domain (`TEM`)

#### `TEM-001`: Team Hub Resource Page
- **Name:** Team Hub Resource Page
- **Surface Type:** RESOURCE PAGE
- **Domain:** Teams
- **Parent Resource:** Workspace Root
- **Purpose:** The canonical collaborative home for a functional squad (e.g. Core Platform, Mobile, Design).
- **Why Standalone:** Represents an organizational unit with distinct membership, permissions, workflows, and capabilities.
- **Actors:** Team Members, Leads, Cross-team Collaborators.
- **Scope:** Team.
- **Contextual Tabs:** `Overview` (`TEM-002`) | `Work` (`TEM-003`) | `Cycles` (`CYC-001`) | `Projects` (`TEM-004`) | `Docs` (`TEM-005`) | `Triage` (`TEM-006`) | `Members` (`TEM-007`).
- **Entry Points:** Sidebar Joined Teams list; Browse Teams Directory (`TEM-009`); Omnisearch `⌘K`.
- **MVP Classification:** **CORE**

#### `TEM-002`: Team Overview Sub-Surface
- **Name:** Team Overview Sub-Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Teams
- **Parent Resource:** Team Hub (`TEM-001`)
- **Purpose:** Executive landing dashboard for the squad. Displays mission statement, team leads, active cycle burndown preview, active project rollups, and pinned team runbooks.
- **MVP Classification:** **CORE**

#### `TEM-003`: Team Work Sub-Surface
- **Name:** Team Work Sub-Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Teams
- **Parent Resource:** Team Hub (`TEM-001`)
- **Purpose:** Primary execution lens rendering all active work items owned by the team across all cycles and backlogs.
- **Projections Available:** Data Grid (`WRK-001`), Kanban Board (`WRK-002`).
- **MVP Classification:** **CORE**

#### `TEM-004`: Team Projects Sub-Surface
- **Name:** Team Projects Sub-Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Teams
- **Parent Resource:** Team Hub (`TEM-001`)
- **Purpose:** Curated catalogue of projects owned by this team or where this team is a core contributor.
- **MVP Classification:** **CORE**

#### `TEM-005`: Team Docs Sub-Surface
- **Name:** Team Docs Sub-Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Teams
- **Parent Resource:** Team Hub (`TEM-001`)
- **Purpose:** Contextual document collection filtering canonical knowledge artifacts (runbooks, team RFCs, meeting notes) owned by this squad.
- **MVP Classification:** **CORE**

#### `TEM-006`: Team Triage Queue Sub-Surface
- **Name:** Team Triage Queue Sub-Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Teams
- **Parent Resource:** Team Hub (`TEM-001`)
- **Purpose:** Dedicated inbound queue for unvetted tickets, external bug reports, and customer requests requiring squad triage before entering the backlog.
- **Capability Requirement:** `team.capabilities.triage === true`.
- **Actions:** Accept (move to backlog/cycle), Decline (close with reason), Mark Duplicate, Snooze.
- **MVP Classification:** **POST-CORE**

#### `TEM-007`: Team Members & Capacity Sub-Surface
- **Name:** Team Members & Capacity Sub-Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Teams
- **Parent Resource:** Team Hub (`TEM-001`)
- **Purpose:** Displays squad roster, roles (Team Lead, Contributor, Guest), historical velocity, and capacity settings.
- **MVP Classification:** **CORE**

#### `TEM-008`: Team Settings & Capabilities
- **Name:** Team Settings & Capabilities
- **Surface Type:** SETTINGS PAGE
- **Domain:** Teams
- **Parent Resource:** Team Hub (`TEM-001`)
- **Purpose:** Dedicated administration surface for configuring squad parameters, capabilities, and workflows.
- **Why Standalone:** Isolates team-specific operational parameters without cluttering workspace-wide governance.
- **Actors:** Team Leads and Workspace Administrators.
- **Scope:** Team.
- **Internal Sections:**
  - `General:` Team name, icon, key/prefix (e.g. `CORE-`), team mission, owning lead.
  - `Membership & Roles:` Team member roster, assignment of Team Lead vs Contributor.
  - `Capabilities:` Dynamic toggle flags for `Cycles`, `Triage`, `Estimation Points`, `Automations`.
  - `Workflows & Statuses:` Custom team status mapping (if team-level workflow override is enabled).
  - `Automations:` Inbound issue routing rules, auto-close stale triage items.
- **Entry Points:** Team header gear icon; Command Palette `⌘K`.
- **Permissions:** Team Leads and Workspace Admins.
- **MVP Classification:** **CORE**

#### `TEM-009`: Teams Directory
- **Name:** Teams Directory
- **Surface Type:** DIRECTORY
- **Domain:** Teams
- **Parent Resource:** Workspace Root
- **Purpose:** Browse and discovery surface allowing users to search, inspect, and join open squads across the organization without cluttering the persistent sidebar.
- **Entry Points:** Sidebar `+ Browse all teams...` link; Omnisearch `⌘K`.
- **MVP Classification:** **CORE**

---

### 6.4. Project Domain (`PRJ`)

#### `PRJ-001`: Project Workspace Resource Page
- **Name:** Project Workspace Resource Page
- **Surface Type:** RESOURCE PAGE
- **Domain:** Projects
- **Parent Resource:** Workspace Root / Contributing Teams
- **Purpose:** Canonical environment for bounded, time-scoped initiatives (e.g. "Payment Gateway Migration").
- **Contextual Tabs:** `Overview` (`PRJ-002`) | `Work` (`PRJ-003`) | `Milestones` (`PRJ-004`) | `Docs` (`PRJ-005`) | `Activity` (`PRJ-006`).
- **Entry Points:** Team Projects tab; Initiatives rollup; Sidebar Favorites; Projects Directory (`PRJ-007`); Omnisearch `⌘K`.
- **MVP Classification:** **CORE**

#### `PRJ-002`: Project Overview Sub-Surface
- **Name:** Project Overview Sub-Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Projects
- **Parent Resource:** Project Workspace (`PRJ-001`)
- **Purpose:** Project brief, target delivery quarter, lead owner, health status (On Track, At Risk), and milestone summary progress bars.
- **MVP Classification:** **CORE**

#### `PRJ-003`: Project Work Sub-Surface
- **Name:** Project Work Sub-Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Projects
- **Parent Resource:** Project Workspace (`PRJ-001`)
- **Purpose:** Execution view of all work items assigned to this project across all contributing teams.
- **Projections Available:** Data Grid (`WRK-001`), Kanban Board (`WRK-002`), Timeline (`WRK-003`).
- **MVP Classification:** **CORE**

#### `PRJ-004`: Project Milestones Sub-Surface
- **Name:** Project Milestones Sub-Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Projects
- **Parent Resource:** Project Workspace (`PRJ-001`)
- **Purpose:** Checkpoint dates and release gates (e.g. "Alpha Internal Dogfooding", "Public Beta"). Milestones aggregate work items to compute automated readiness percentages.
- **MVP Classification:** **CORE**

#### `PRJ-005`: Project Docs Sub-Surface
- **Name:** Project Docs Sub-Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Projects
- **Parent Resource:** Project Workspace (`PRJ-001`)
- **Purpose:** Filtered collection of Living Specs, PRDs, and architecture RFCs attached to this project.
- **MVP Classification:** **CORE**

#### `PRJ-006`: Project Activity & History Sub-Surface
- **Name:** Project Activity & History Sub-Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Projects
- **Parent Resource:** Project Workspace (`PRJ-001`)
- **Purpose:** Contextual chronological stream of all status changes, milestone completions, work item linkings, and membership changes for this project.
- **MVP Classification:** **CORE**

#### `PRJ-007`: Projects Directory
- **Name:** Projects Directory
- **Surface Type:** DIRECTORY
- **Domain:** Projects
- **Parent Resource:** Workspace Root
- **Purpose:** Searchable, filterable catalogue of all active, completed, and archived projects across the entire workspace.
- **Entry Points:** Command Palette `⌘K`; link from Initiatives; URL route.
- **MVP Classification:** **CORE**

---

### 6.5. Cycle & Iteration Domain (`CYC`)

#### `CYC-001`: Active Cycle Execution Sub-Surface
- **Name:** Active Cycle Execution Sub-Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Cycles
- **Parent Resource:** Team Hub (`TEM-001`)
- **Purpose:** High-intensity timeboxed execution cockpit. Displays active sprint burndown, cycle dates, commitment scope, and active work grid.
- **Capability Requirement:** `team.capabilities.cycles === true`.
- **Sidebar Integration:** Appears as `Current Cycle` sub-link under joined teams in the sidebar.
- **MVP Classification:** **CORE**

#### `CYC-002`: Cycle Planning & Backlog Management Sub-Surface
- **Name:** Cycle Planning & Backlog Management Sub-Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Cycles
- **Parent Resource:** Team Hub (`TEM-001`)
- **Purpose:** Sprint planning workspace: left pane shows unprioritized team backlog; right pane shows upcoming cycle candidate list. Supports explicit rollover review of uncompleted work items.
- **MVP Classification:** **CORE**

#### `CYC-003`: Cycle History & Retrospective Directory
- **Name:** Cycle History & Retrospective Directory
- **Surface Type:** DIRECTORY
- **Domain:** Cycles
- **Parent Resource:** Team Hub (`TEM-001`)
- **Purpose:** Archive of past completed cycles with velocity metrics, completion ratios, and rollover summaries.
- **MVP Classification:** **POST-CORE**

---

### 6.6. Strategic Planning & Initiatives Domain (`INT`)

#### `INT-001`: Initiatives Portfolio Primary Page
- **Name:** Initiatives Portfolio Primary Page
- **Surface Type:** PRIMARY PAGE
- **Domain:** Strategic Planning
- **Parent Resource:** Workspace Root
- **Purpose:** Top-level executive and cross-functional roadmap dashboard. Displays high-level strategic initiatives and health rollups across all engineering and product teams.
- **Projections Available:** Portfolio Table, Multi-quarter Roadmap Gantt, Health Matrix.
- **Entry Points:** Global Sidebar `Initiatives` link; Shortcut `G then N` (candidate).
- **MVP Classification:** **CORE**

#### `INT-002`: Initiative Detail Resource Page
- **Name:** Initiative Detail Resource Page
- **Surface Type:** RESOURCE PAGE
- **Domain:** Strategic Planning
- **Parent Resource:** Initiatives Hub (`INT-001`)
- **Purpose:** Deep dive into a specific multi-month strategic initiative. Displays connected projects, cross-project blockers, and executive status updates.
- **MVP Classification:** **CORE**

#### `INT-003`: Strategic Goals & OKRs Extension
- **Name:** Strategic Goals & OKRs Extension
- **Surface Type:** RESOURCE PAGE
- **Domain:** Strategic Planning
- **Parent Resource:** Organization Root
- **Purpose:** Strategic objective tracking sitting above Initiatives.
- **Status:** **FUTURE** (Schema and hierarchy placeholder only; no UI built in MVP).

---

### 6.7. Docs & Knowledge Domain (`DOC`)

#### `DOC-001`: Docs Hub Primary Page
- **Name:** Docs Hub Primary Page
- **Surface Type:** PRIMARY PAGE
- **Domain:** Knowledge
- **Parent Resource:** Workspace Root
- **Purpose:** Centralized knowledge portal for the organization. Hosts Living Specs, RFCs, Engineering Runbooks, and wiki pages under a unified document model.
- **Entry Points:** Global Sidebar `Docs` link; Shortcut `G then D` (candidate).
- **Sections:** `Recent Docs`, `Living Specs Directory`, `Team Runbooks`, `My Drafts`, `Templates`.
- **MVP Classification:** **CORE**

#### `DOC-002`: Canonical Document Canvas / Editor
- **Name:** Canonical Document Canvas / Editor
- **Surface Type:** RESOURCE PAGE
- **Domain:** Knowledge
- **Parent Resource:** Docs Hub (`DOC-001`) or Project Workspace (`PRJ-001`)
- **Purpose:** Full-page rich block text editor. Supports markdown formatting, callouts, diagrams, version history, and **Living Spec Linked Tables** (bi-directional work item execution blocks).
- **MVP Classification:** **CORE**

#### `DOC-003`: Document Metadata & Version Inspector
- **Name:** Document Metadata & Version Inspector
- **Surface Type:** INSPECTOR / DRAWER
- **Domain:** Knowledge
- **Parent Resource:** Document Canvas (`DOC-002`)
- **Purpose:** Right slide-over pane displaying document authors, edit history, linked work items, and document sharing permissions.
- **MVP Classification:** **POST-CORE**

---

### 6.8. Saved Views Domain (`VEW`)

#### `VEW-001`: Saved Views Hub Primary Page
- **Name:** Saved Views Hub Primary Page
- **Surface Type:** PRIMARY PAGE
- **Domain:** Saved Views
- **Parent Resource:** Workspace Root
- **Purpose:** Hub for discovering, categorizing, and managing multi-dimensional saved queries across Personal, Team, and Workspace scopes.
- **Entry Points:** Global Sidebar `Views` link.
- **MVP Classification:** **CORE**

#### `VEW-002`: Saved View Execution Canvas
- **Name:** Saved View Execution Canvas
- **Surface Type:** RESOURCE PAGE
- **Domain:** Saved Views
- **Parent Resource:** Views Hub (`VEW-001`)
- **Purpose:** Dedicated execution environment rendering a specific persisted query in its configured projection (Data Grid, Kanban, or Timeline) with reactive filtering.
- **Why Resource Page:** Has a canonical URL, shareable identity, distinct query parameters, and independent presentation configuration.
- **MVP Classification:** **CORE**

---

### 6.9. Collaboration & Notifications Domain (`COL`)

#### `COL-001`: Threaded Discussion Inspector Panel
- **Name:** Threaded Discussion Inspector Panel
- **Surface Type:** INSPECTOR / DRAWER
- **Domain:** Collaboration
- **Parent Resource:** Embedded in Work Item Inspector (`WRK-005`) and Doc Inspector (`DOC-003`).
- **Purpose:** Conversational comments, @mentions, rich attachments, and emoji reactions attached to canonical entities.
- **MVP Classification:** **CORE**

#### `COL-002`: Activity & Audit Trail Panel
- **Name:** Activity & Audit Trail Panel
- **Surface Type:** INSPECTOR / DRAWER
- **Domain:** Collaboration
- **Parent Resource:** Contextual panel in Project, Team, or Work Item.
- **Purpose:** Chronological history of property mutations, branch links, pull requests, and status transitions.
- **MVP Classification:** **CORE**

---

### 6.10. Search, Command Palette & Pickers (`CMD`)

#### `CMD-001`: Command Palette & Omnisearch
- **Name:** Command Palette & Omnisearch
- **Surface Type:** OVERLAY
- **Domain:** Search & Commands
- **Parent Resource:** Global App Shell
- **Purpose:** Universal fuzzy finder and action execution palette. Searches work items, projects, docs, teams, and executes keyboard system commands.
- **Activation:** `⌘K` / `Ctrl+K`.
- **Keyboard Traversal:** `ArrowDown` / `ArrowUp`, `Enter` run/select, `Escape` close.
- **MVP Classification:** **CORE**

#### `CMD-002`: Quick Create Modal
- **Name:** Quick Create Modal
- **Surface Type:** OVERLAY
- **Domain:** Search & Commands
- **Parent Resource:** Global App Shell
- **Purpose:** Rapid work item creation dialog accessible from anywhere via single key `c` (candidate).
- **Submit Shortcut:** `⌘+Enter` to submit and stay open; `Enter` to create and inspect.
- **MVP Classification:** **CORE**

#### `CMD-003`: Entity Context Pickers
- **Name:** Entity Context Pickers (Status, Priority, User, Team, Project, Cycle)
- **Surface Type:** OVERLAY
- **Domain:** Search & Commands
- **Parent Resource:** Contextual (anchored to grid cells, inspectors, or forms).
- **Purpose:** High-density, keyboard-searchable dropdown pickers for rapid attribute assignment without mouse hunting.
- **MVP Classification:** **CORE**

---

### 6.11. Workspace Administration Domain (`WKS`)

#### `WKS-001`: Workspace General Settings
- **Name:** Workspace General Settings
- **Surface Type:** SETTINGS PAGE
- **Domain:** Workspace Administration
- **Parent Resource:** Workspace Root
- **Purpose:** Workspace name, URL slug, branding icon, default timezones, and base permissions.
- **Entry Points:** Settings menu `Settings > Workspace > General`.
- **MVP Classification:** **CORE**

#### `WKS-002`: Workspace Members & Guest Directory
- **Name:** Workspace Members & Guest Directory
- **Surface Type:** SETTINGS PAGE
- **Domain:** Workspace Administration
- **Parent Resource:** Workspace Root
- **Purpose:** Managing workspace member invitations, role assignments (Admin, Member, Guest), team assignments, and deactivations.
- **MVP Classification:** **CORE**

#### `WKS-003`: Workspace Work Configuration
- **Name:** Workspace Work Configuration
- **Surface Type:** SETTINGS PAGE
- **Domain:** Workspace Administration
- **Parent Resource:** Workspace Root
- **Purpose:** Configuring workspace-wide status taxonomies, priority schemas, custom fields, issue templates, and workflow transition validations.
- **MVP Classification:** **POST-CORE**

#### `WKS-004`: Workspace Integrations & Webhooks Hub
- **Name:** Workspace Integrations & Webhooks Hub
- **Surface Type:** SETTINGS PAGE
- **Domain:** Workspace Administration
- **Parent Resource:** Workspace Root
- **Purpose:** Managing bi-directional VCS integrations (GitHub, GitLab), Slack alerts, custom webhook endpoints, and API tokens.
- **MVP Classification:** **POST-CORE**

---

### 6.12. Enterprise & Organization Administration Domain (`ADM`)

#### `ADM-001`: Organization Identity & Access
- **Name:** Organization Identity & Access
- **Surface Type:** ADMIN PAGE
- **Domain:** Enterprise Administration
- **Parent Resource:** Organization Root
- **Purpose:** Enterprise identity governance: SAML 2.0 / OIDC configuration, SCIM user auto-provisioning, enforced 2FA, and session duration policies.
- **Permissions:** Organization Owner & Enterprise Security Admins strictly.
- **MVP Classification:** **ENTERPRISE**

#### `ADM-002`: Organization Security, Audit & Retention
- **Name:** Organization Security, Audit & Retention
- **Surface Type:** ADMIN PAGE
- **Domain:** Enterprise Administration
- **Parent Resource:** Organization Root
- **Purpose:** Enterprise security audit log recording administrative operations, authentication events, permission alterations, and data retention policies.
- **MVP Classification:** **ENTERPRISE**

#### `ADM-003`: Organization Billing & Quotas Console
- **Name:** Organization Billing & Quotas Console
- **Surface Type:** ADMIN PAGE
- **Domain:** Enterprise Administration
- **Parent Resource:** Organization Root
- **Purpose:** Subscription tier management, seat licensing, invoice downloads, and platform usage limits.
- **MVP Classification:** **ENTERPRISE**

---

### 6.13. Global System Surfaces (`SYS`)

#### `SYS-001`: Global 404 & Resource Tombstone
- **Name:** Global 404 & Resource Tombstone
- **Surface Type:** GLOBAL SYSTEM SURFACE
- **Domain:** Global System
- **Purpose:** Informs user when a resource has been deleted, archived, or transferred, offering recovery links and search suggestions.
- **MVP Classification:** **CORE**

#### `SYS-002`: Permission Denied & Access Request Gateway
- **Name:** Permission Denied & Access Request Gateway
- **Surface Type:** GLOBAL SYSTEM SURFACE
- **Domain:** Global System
- **Purpose:** Replaces jarring 403 errors with a clean surface explaining required access and providing a 1-click "Request Access" action.
- **MVP Classification:** **CORE**

#### `SYS-003`: Network Disconnection & Sync Status Banner
- **Name:** Network Disconnection & Sync Status Banner
- **Surface Type:** GLOBAL SYSTEM SURFACE
- **Domain:** Global System
- **Purpose:** Ambient non-blocking indicator signaling network disconnection, read-only/stale state safeguards, and retry/reconnect progress.
- **MVP Classification:** **CORE**

---

## 7. Canonical Domain Ownership Matrix

The following matrix defines the canonical domain ownership, routing capability, and rendering surfaces for every core product resource:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CANONICAL DOMAIN OWNERSHIP MATRIX                                    │
├───────────────┬──────────────┬──────────────────┬───────────────┬──────────────┬───────────────────────┤
│ Resource      │ Owning Scope │ Canonical ID     │ Routable?     │ Permissioned?│ Primary Surfaces      │
├───────────────┼──────────────┼──────────────────┼───────────────┼──────────────┼───────────────────────┤
│ Organization  │ Enterprise   │ `org_id`         │ Yes (admin)   │ Yes (Org RBAC│ `ADM-001/002/003`     │
│ Workspace     │ Organization │ `workspace_slug` │ Yes (context) │ Yes (Wks RBAC│ `WKS-001/002/003/004` │
│ User          │ Organization │ `user_id`        │ No (profile)  │ Yes (Auth)   │ `PER-003`, `WKS-002`  │
│ Team          │ Workspace    │ `team_key`       │ Yes (hub)     │ Yes (TeamRole│ `TEM-001` to `TEM-008`│
│ Project       │ Workspace    │ `project_id`     │ Yes (workspace│ Yes (Project)│ `PRJ-001` to `PRJ-006`│
│ Initiative    │ Workspace    │ `initiative_id`  │ Yes (detail)  │ Yes (WksRole)│ `INT-001`, `INT-002`  │
│ Cycle         │ Team         │ `cycle_id`       │ Yes (sub-path)│ Yes (Team)   │ `CYC-001`, `CYC-002`  │
│ Milestone     │ Project      │ `milestone_id`   │ Contextual    │ Inherits Prj │ `PRJ-004`             │
│ WorkItem      │ Workspace    │ `item_key`       │ Yes (inspect) │ Yes (Item/Prj│ `WRK-001/002/005`     │
│ Document      │ Workspace    │ `doc_id`         │ Yes (canvas)  │ Yes (Doc ACL)│ `DOC-001`, `DOC-002`  │
│ SavedView     │ Contextual   │ `view_id`        │ Yes (canvas)  │ Yes (ViewACL)│ `VEW-001`, `VEW-002`  │
│ Favorite      │ User         │ `favorite_id`    │ Pointer only  │ Inherits tgt │ Sidebar Favorites     │
│ NotifEvent    │ User         │ `event_id`       │ Pointer only  │ Private User │ `PER-001`             │
│ CommentThread │ Entity       │ `thread_id`      │ Contextual    │ Inherits host│ `COL-001`             │
│ ActivityEvent │ Entity       │ `activity_id`    │ Log stream    │ Inherits host│ `COL-002`, `PRJ-006`  │
└───────────────┴──────────────┴──────────────────┴───────────────┴──────────────┴───────────────────────┘
```

---

## 8. Projection Compatibility Matrix

To prevent individual pages from developing divergent, incompatible projection implementations, all projections must consume the **exact same canonical Work Item query model**:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PROJECTION COMPATIBILITY MATRIX                                      │
├─────────────────────┬───────────────────┬───────────────────┬───────────────────┬──────────────────────┤
│ Surface Destination │ Data Grid         │ Kanban Board      │ Timeline / Gantt  │ Capacity / Workload  │
│                     │ (`WRK-001`)       │ (`WRK-002`)       │ (`WRK-003`)       │ (`WRK-004`)          │
├─────────────────────┼───────────────────┼───────────────────┼───────────────────┼──────────────────────┤
│ **My Work**         │ Supported (CORE)  │ Supported (CORE)  │ Validation Req.   │ Incompatible         │
│ **Team Work**       │ Supported (CORE)  │ Supported (CORE)  │ Supported (POST)  │ Supported (POST)     │
│ **Active Cycle**    │ Supported (CORE)  │ Supported (CORE)  │ Validation Req.   │ Supported (POST)     │
│ **Project Work**    │ Supported (CORE)  │ Supported (CORE)  │ Supported (CORE)  │ Incompatible         │
│ **Initiatives**     │ Supported (CORE)  │ Validation Req.   │ Supported (CORE)  │ Incompatible         │
│ **Saved View**      │ Supported (CORE)  │ Supported (CORE)  │ Supported (POST)  │ Validation Req.      │
│ **Living Spec Doc** │ Supported (CORE)  │ Incompatible      │ Incompatible      │ Incompatible         │
└─────────────────────┴───────────────────┴───────────────────┴───────────────────┴──────────────────────┘
```

**Fundamental Invariant:** All projections receive items through a common projection pipeline:
$$\text{Canonical WorkItem Store} \longrightarrow \text{Query/Filter Pipeline} \longrightarrow \text{Projection Adapter (Grid / Board / Timeline)}$$
No projection maintains an independent or divergent WorkItem model.

---

## 9. Mutation & Permission Consistency Contracts

### 9.1. Mutation Consistency Contract
Whenever a property on a `WorkItem` is mutated (via inline cell edit, drag-and-drop column move, quick create, inspector update, or living spec table modification), the mutation targets the **single canonical WorkItem**:

```text
User Mutates Property (in Grid, Board, Inspector, My Work, Cycle, or Living Spec Table)
                                      │
                                      ▼
                        CANONICAL WORKITEM DOMAIN STORE
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           ▼                          ▼                          ▼
  Data Grid Updates          Kanban Board Updates       Living Spec Table Updates
 (Active selection preserved) (Card moves smoothly)     (Embedded pill reconciles)
```

**Behavioral Requirements:**
- View layers must not maintain detached local clones of domain state.
- A status transition made in `WRK-005` (Inspector) instantly reflects in the underlying `WRK-001` (Grid) without requiring a manual page refresh.
- Submitting an update optimistically updates the cache and rolls back cleanly on error with an ambient toast notification.

### 9.2. Permission Consistency Contract
Access control must be enforced symmetrically across all presentation surfaces:
1. **No Leakage via Search:** Omnisearch (`CMD-001`) must strictly filter results using the reader's permission envelope before rendering titles or snippets.
2. **No Leakage via Saved Views:** A public Saved View (`VEW-002`) executed by a restricted user must automatically omit work items belonging to private teams the user cannot view.
3. **No Leakage via Favorites:** If a user loses access to a project, the corresponding sidebar favorite renders as a disabled/restricted item.
4. **Living Spec Document Embeds (Baseline Rule):**
   When a Document (`DOC-002`) contains an embedded Work Item table and the viewer lacks permission to access an embedded item:
   ```text
   ┌────────────────────────────────────────────────────────────────────────┐
   │ [Restricted work item]                                                │
   │ You don't have access to this item.                    [Request Access]│
   └────────────────────────────────────────────────────────────────────────┘
   ```
   **Strict Privacy Rule:** The system displays a structural placeholder to preserve document layout, but **reveals no protected content** (no title, description, assignee, priority, status, or comment snippets).

---

## 10. Baseline Product Behaviors

### 10.1. Cycle Rollover Baseline Behavior
When a sprint cycle completes (`CYC-001`), unfinished committed work items are **not automatically rolled over into the next cycle**:
```text
Cycle Completes
      ↓
Incomplete Committed Items
      ↓
Return to Team Backlog / Rollover Review Queue (`CYC-002`)
      ↓
Squad Lead explicitly assigns items to next cycle during planning
```
*Rationale:* Silent automatic rollover conceals planning debt and causes unprioritized tasks to linger indefinitely. Explicit rollover preserves deliberate sprint commitment.

### 10.2. Network Disconnection & Offline Baseline Behavior
For the CORE platform, offline support is defined as **Network Disconnection UX**, not multi-master offline synchronization:
- The system detects offline status immediately and renders `SYS-003` (Non-blocking status banner).
- In-flight mutations that fail due to disconnection are halted with a safe warning; destructive actions are blocked.
- Cached read-only data is visually badged as *"Offline — Stale"* to prevent erroneous user conclusions.
- When network reconnects, data reconciles cleanly from the server.

---

## 11. Large-Scale Implementation Guardrails & Implementation Readiness Contract

### 11.1. Large-Scale Implementation Guardrails
To ensure Orynqo remains fast and scalable to 5,000+ users and millions of tickets:
1. **Canonical Entities:** There is exactly one domain model per resource type.
2. **Projection Reuse:** Projections (`WRK-001` to `WRK-004`) are shared presentation engines, not one-off implementations per page.
3. **Strict Component Boundaries:**
   $$\text{Design System Primitives} \longrightarrow \text{Global Product Components} \longrightarrow \text{Domain Features} \longrightarrow \text{Page Components} \longrightarrow \text{Routes}$$
4. **Page Composition:** Pages are lean orchestrators; they must not become monolithic files containing business logic.
5. **Data Scale Readiness:** All collections must be architecturally compatible with cursor-based pagination, windowed virtualization, stable sorting, and query deduplication.
6. **Lazy Boundaries:** Heavy capabilities (Document Editor, Timeline Gantt, Enterprise Admin) must be chunked for on-demand bundle loading.

### 11.2. Implementation Readiness Contract (The 15 "MUST NOT" Rules)
Future implementation agents and developers **MUST NOT**:
1. Build a duplicate `WorkItem` model for a specific page.
2. Create page-specific copies of the Data Grid or Kanban Board.
3. Place business logic or data fetching inside design system primitives.
4. Dump all platform state into a single global React context.
5. Mix server-side domain data and ephemeral UI state (e.g. dropdown open state) in the same store.
6. Build monolithic pages exceeding reasonable size or single-responsibility bounds.
7. Introduce undocumented routes or URLs outside this approved registry without architectural review.
8. Invent artificial domain entities simply to make a layout easier to build.
9. Bypass permission filters in Search, Saved Views, Inbox, or Document Embeds.
10. Hardcode surfaces to assumptions of small mock datasets (e.g. assume a team only ever has 5 items).
11. Declare every component as global; keep page-specific components colocated.
12. Build speculative abstractions for features that do not exist in this specification.
13. Create parallel or divergent mutation pipelines across different projections.
14. Silently change frozen IA or domain decisions during coding phases.
15. Rely on hardcoded visual dimensions instead of the design system foundation.

---

## 12. Complete Settings Information Architecture

Settings are strictly organized into four hierarchical scopes:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      SETTINGS INFORMATION ARCHITECTURE                 │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ Scope              │ Registered Surface │ Sections Included            │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ 1. Personal        │ `PER-003`          │ • Profile & Account          │
│                    │                    │ • Preferences (Theme, Keys)  │
│                    │                    │ • Notifications              │
│                    │                    │ • Developer Tokens           │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ 2. Team            │ `TEM-008`          │ • General & Team Key         │
│                    │                    │ • Member Roster & Roles      │
│                    │                    │ • Capabilities (Cycles, Tri.)│
│                    │                    │ • Workflow State Machines    │
│                    │                    │ • Automations & Routing      │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ 3. Workspace       │ `WKS-001` (General)│ • Name, URL, Icon            │
│                    │ `WKS-002` (Members)│ • Member Directory, Invites  │
│                    │ `WKS-003` (Work)   │ • Statuses, Labels, Fields   │
│                    │ `WKS-004` (Integr.)│ • VCS, Slack, Webhooks       │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ 4. Enterprise Org  │ `ADM-001` (Identity│ • SAML SSO, SCIM, Sessions   │
│                    │ `ADM-002` (Security│ • Audit Log, Data Retention  │
│                    │ `ADM-003` (Billing)│ • Subscriptions, Invoices    │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

---

## 13. Reconciled Registry Accounting & Validation Equation

### 13.1. Mathematical Reconciliation Validation

Every registered surface ID is unique and carries exactly one canonical surface type and lifecycle classification:

$$\text{TOTAL REGISTERED SURFACES} = 50$$

#### Mutual Exclusion by Surface Type:
- **Primary Pages:** 5 (`PER-001`, `PER-002`, `INT-001`, `DOC-001`, `VEW-001`)
- **Resource Pages:** 6 (`TEM-001`, `PRJ-001`, `INT-002`, `INT-003`, `DOC-002`, `VEW-002`)
- **Resource Sub-Surfaces:** 13 (`TEM-002`, `TEM-003`, `TEM-004`, `TEM-005`, `TEM-006`, `TEM-007`, `PRJ-002`, `PRJ-003`, `PRJ-004`, `PRJ-005`, `PRJ-006`, `CYC-001`, `CYC-002`)
- **Projections:** 4 (`WRK-001`, `WRK-002`, `WRK-003`, `WRK-004`)
- **Directories:** 3 (`TEM-009`, `PRJ-007`, `CYC-003`)
- **Inspectors & Drawers:** 4 (`WRK-005`, `DOC-003`, `COL-001`, `COL-002`)
- **Overlays & Pickers:** 3 (`CMD-001`, `CMD-002`, `CMD-003`)
- **Settings Pages:** 6 (`PER-003`, `TEM-008`, `WKS-001`, `WKS-002`, `WKS-003`, `WKS-004`)
- **Admin Pages:** 3 (`ADM-001`, `ADM-002`, `ADM-003`)
- **Global System Surfaces:** 3 (`SYS-001`, `SYS-002`, `SYS-003`)

$$\sum \text{Surface Types} = 5 + 6 + 13 + 4 + 3 + 4 + 3 + 6 + 3 + 3 = 50$$

#### Mutual Exclusion by Lifecycle Classification:
- **CORE (Foundational MVP Experience):** 40 Surfaces (80%)
- **POST-CORE (Fast-Follow Enhancements):** 6 Surfaces (12% — `WRK-004`, `TEM-006`, `CYC-003`, `DOC-003`, `WKS-003`, `WKS-004`)
- **ENTERPRISE (Advanced Governance):** 3 Surfaces (6% — `ADM-001`, `ADM-002`, `ADM-003`)
- **FUTURE (Long-term Extensibility):** 1 Surface (2% — `INT-003`)

$$\sum \text{Lifecycle Classifications} = 40 + 6 + 3 + 1 = 50$$

$$\mathbf{TOTAL\ (50) = \sum Surface\ Types\ (50) = \sum Lifecycles\ (50)}$$
*(Accounting identity holds unconditionally; verified zero discrepancy).*

---

## 14. Refined UI/UX Design & Implementation Sequence

To avoid unmanageably large implementation phases while ensuring logical domain dependencies are respected, future design work will proceed in disciplined sub-phases:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   REFINED UI/UX DESIGN PROGRESSION                     │
├───────────────┬────────────────────────────────────────────────────────┤
│ Slice         │ Target Surfaces & Deliverables                         │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-01A**    │ **Work Item Contract & Inspector**                     │
│               │ - Work Item Inspector Drawer (`WRK-005`)               │
│               │ - Activity & Discussion Panels (`COL-001`, `COL-002`)  │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-01B**    │ **High-Density Execution Grid**                        │
│               │ - Universal Data Grid (`WRK-001`)                      │
│               │ - Keyboard navigation & inline editing contracts       │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-01C**    │ **Creation & Attribute Pickers**                       │
│               │ - Quick Create Modal (`CMD-002`)                       │
│               │ - Entity Context Pickers (`CMD-003`)                   │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-02A**    │ **My Work Hub**                                        │
│               │ - My Work Cockpit (`PER-002`)                          │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-02B**    │ **Personal Triage Inbox**                              │
│               │ - Personal Inbox (`PER-001`) & Zero-mouse triage       │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-02C**    │ **User Settings**                                      │
│               │ - Personal Preferences & Tokens (`PER-003`)            │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-03A**    │ **Team Shell & Overview**                              │
│               │ - Team Hub (`TEM-001`), Overview (`TEM-002`), Dir (`09`)│
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-03B**    │ **Team Work & Kanban Board**                           │
│               │ - Team Work (`TEM-003`), Kanban Board (`WRK-002`)      │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-03C**    │ **Cycle Execution & Planning**                         │
│               │ - Active Cycle (`CYC-001`), Planning & Rollover (`02`) │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-03D**    │ **Team Facets & Settings**                             │
│               │ - Projects (`TEM-004`), Docs (`05`), Members (`07`),   │
│               │   Team Settings (`TEM-008`)                            │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-03E**    │ **Team Triage Queue (Post-Core)**                      │
│               │ - Squad Triage Queue (`TEM-006`)                       │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-04A**    │ **Docs Hub & Knowledge Navigation**                    │
│               │ - Docs Hub (`DOC-001`), Template directory             │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-04B**    │ **Document Canvas & Living Spec Embeds**               │
│               │ - Canonical Block Editor (`DOC-002`), Doc Drawer (`03`)│
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-05A**    │ **Project Workspace & Overview**                       │
│               │ - Project Workspace (`PRJ-001`), Overview (`02`),      │
│               │   Directory (`PRJ-007`)                                │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-05B**    │ **Project Work, Milestones, Docs & Activity**          │
│               │ - Work (`PRJ-003`), Milestones (`04`), Docs (`05`),    │
│               │   Activity (`PRJ-006`)                                 │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-05C**    │ **Strategic Initiatives & Temporal Timeline**          │
│               │ - Initiatives (`INT-001`, `002`), Timeline (`WRK-003`) │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-05D**    │ **Saved Views System**                                 │
│               │ - Saved Views Hub (`VEW-001`), View Canvas (`VEW-002`) │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-06A**    │ **Workspace Administration Suite**                     │
│               │ - Workspace Settings (`WKS-001` through `WKS-004`)     │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-06B**    │ **Enterprise Governance Console**                      │
│               │ - Org Admin (`ADM-001` through `ADM-003`)              │
└───────────────┴────────────────────────────────────────────────────────┘
```

---

## 15. Remaining Genuine Open Decisions for Human Review

With the domain contracts, rollover baselines, and embed behaviors resolved, only three strategic decisions remain for human alignment:

1. **VCS Branch Association Depth in `WRK-005` (Inspector):** For the initial `UI-01A` Inspector, should Git branch/commit metadata be purely informational (displaying linked branch name and PR status badge), or should it support in-line branch creation triggers? *(Recommendation: Purely informational in UI-01A; triggers deferred to POST-CORE)*.
2. **Team Member Capacity Units in `TEM-007`:** When calculating squad capacity, should Orynqo support both story points and hours, or standardize on a single metric? *(Recommendation: Standardize on story points / item counts for initial CORE)*.
3. **Formal Endorsement of UI-01A Scope:** Confirm approval to commence `UI-01A` (Work Item Domain Contract & Inspector Drawer) upon freeze of this document.

---

> [!IMPORTANT]
> **STOPPED AT HUMAN REVIEW — IA-03A**  
> Complete, mathematically reconciled master surface registry is finalized in [`docs/06-complete-page-and-surface-registry.md`](file:///d:/Full_Stack_Apps/Orynqo-web/docs/06-complete-page-and-surface-registry.md).  
> In accordance with instructions, work has stopped here.  
> - No application code, UI screens, mockups, or routes were modified.  
> - Awaiting Human Review to officially freeze IA-03/IA-03A before commencing `UI-01A`.
