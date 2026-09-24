# Orynqo Platform — Complete Page & Surface Registry (Phase IA-03)

**Status:** Completed Master Specification (Phase IA-03 — Ready for Human Review)  
**Governing Methodology:** `antigravity-enterprise-product-design`  
**Preceding Phases:**  
- `Architecture & Design-System Stabilization (Pass 01 & 01A — APPROVED)`  
- `IA-01 Competitive Navigation Research (APPROVED)`  
- `IA-02 Sidebar Architecture & Navigation Contract (APPROVED & FROZEN)`  
**Current Phase:** `IA-03 Complete Page & Surface Registry (MASTER BLUEPRINT)`  
**Subsequent Phase:** `UI-01 Foundation & High-Density Core Screens (Awaiting IA-03 Approval)`  
**Implementation Freeze:** STRICTLY ENFORCED (Documentation-only deliverable; no UI code, mockups, or route changes)  

---

## 1. Executive Summary & Purpose

Phase `IA-03` establishes the **complete master surface registry** of the Orynqo platform. It answers:
- **WHAT** surfaces exist across the entire platform.
- **WHY** each surface exists and what user problem it solves.
- **WHO** uses it (personas, roles, and access boundaries).
- **WHERE** it lives in the information architecture and spatial hierarchy.
- **WHAT** entities it reads and mutates.
- **HOW** users reach it (entry points, deep links, keyboard shortcuts).
- **WHAT** other surfaces, inspectors, overlays, and components it depends upon.
- **IN WHAT SEQUENCE** surfaces should subsequently be designed and built.

This document serves as the permanent master blueprint for all subsequent UI/UX design phases (`UI-01`, `UI-02`, etc.) and future Golden Flows.

---

## 2. Frozen IA-02 Architecture Baseline

All surface registrations in this document strictly conform to the frozen navigation laws established in `IA-02`:

1. **The Spatial Mental Model:**
   - `SIDEBAR = WHERE` (Scope, Organization, Team, or Container selection)
   - `RESOURCE NAVIGATION = WHAT` (Contextual facets: Overview, Work, Cycles, Projects, Docs, Triage, Members)
   - `PROJECTION CONTROLS = HOW` (Visual lenses: Grid, Board, Timeline, Calendar, Workload)
   - `INSPECTOR = DETAIL WITHOUT CONTEXT LOSS` (Slide-over properties, specs, comments)
   - `COMMAND PALETTE = LONG-TAIL DISCOVERY + ACTIONS` (`⌘K` instant navigation)
2. **Resource vs. Projection Law:** Projections (`Table Grid`, `Kanban Board`, `Timeline/Gantt`, `Workload`) are never top-level sidebar destinations. They are contextual presentation lenses over underlying resources.
3. **Canonical Planning & Execution Hierarchy:**
   ```
   Goal / Objective [future tier]
        ↓ supports
   Initiative [strategic planning resource]
        ↓ coordinates
   Project [bounded deliverable]
        ├── Milestones (Planning & release checkpoint entities)
        ├── Documents (Canonical Document model: Living Specs/PRDs, RFCs, Runbooks)
        └── Work Items (Executable work units: Tasks, Issues, Bugs)
   ```
4. **Docs as Global Knowledge Label:** Houses all knowledge artifacts under a single canonical document entity model.
5. **Capability-Aware Teams:** Teams dynamically declare capabilities (`cycles`, `triage`, `projects`, `docs`, `automations`). Sprints/cycles are not mandatory for all squads.
6. **Project Discovery Law:** Projects are discoverable through Teams, Initiatives, Favorites, Omnisearch, and an on-demand Projects Directory—never an unbounded flat global sidebar list.
7. **Organization vs. Workspace Topology:** Organization is the enterprise/billing/security boundary; Workspace is the collaborative product execution boundary.

---

## 3. Surface Taxonomy & Classification Scheme

To prevent the architectural trap of treating every interface as a traditional "web page", every Orynqo surface is classified into one of ten formal architectural surface types:

```
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
│                         │ parent Resource Page (Team Triage, Milestones│
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
│     SURFACE             │ boundaries, offline banners, pickers).       │
└─────────────────────────┴──────────────────────────────────────────────┘
```

---

## 4. Master Registry Identifier Convention

Every surface carries a permanent, collision-safe documentation registry ID:

- `PER-xxx` : Personal Work Surfaces
- `WRK-xxx` : Work Management Execution Surfaces & Projections
- `TEM-xxx` : Team Surfaces
- `PRJ-xxx` : Project Surfaces
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

## 5. Complete Master Surface Registry

### 5.1. Personal Domain (`PER`)

#### `PER-001`: Personal Triage Inbox
- **Name:** Personal Triage Inbox
- **Surface Type:** PRIMARY PAGE
- **Domain:** Personal Work
- **Parent Resource:** Workspace Root
- **Purpose:** Centralized, high-velocity clearinghouse for all actionable events directed at the user (mentions, assignments, review requests, thread replies). Solves notification fragmentation and email overflow.
- **Why Standalone:** Requires dedicated zero-mouse triage keyboard workflows (`e` archive, `z` snooze) and split-pane item inspection. Cannot be reduced to a popover.
- **Actors:** All Authenticated Users.
- **Scope:** Personal.
- **Entities Read:** `NotificationEvent`, `WorkItem`, `Document`, `CommentThread`, `User`.
- **Entities Mutated:** `NotificationEvent` (status: unread → read → archived/snoozed).
- **Entry Points:** Global Sidebar `Inbox` link; Shortcut `G then I`; Command Palette `⌘K`; System Toast clicks.
- **Navigation Lineage:** Root → Inbox.
- **Core Jobs:** Rapid triage of daily events; clearing unread backlog to reach "Inbox Zero"; opening context on assigned tasks.
- **Contextual Projections:** Filter segments (`Unread`, `All`, `Snoozed`, `Archived`).
- **Dependencies:** Work Item Inspector (`WRK-005`), Document Inspector (`DOC-003`).
- **Permissions:** Available to all roles including Guests.
- **Lifecycle & States:** Loading skeleton, Populated, Empty (Illustrated "Inbox Zero" achievement state), Error boundary.
- **Keyboard Rules:** `j`/`k` list navigation, `e` archive, `z` snooze popover, `Enter` expand/inspect, `Shift+e` archive all.
- **Responsive Translation:** On mobile, becomes full-screen list; tapping notification slides in detail view.
- **MVP Classification:** **CORE**

#### `PER-002`: My Work Cockpit
- **Name:** My Work Cockpit
- **Surface Type:** PRIMARY PAGE
- **Domain:** Personal Work
- **Parent Resource:** Workspace Root
- **Purpose:** Cross-team, multi-project aggregator of all executable work assigned to or authored by the user. Solves the *"What do I need to work on today?"* problem.
- **Why Standalone:** Aggregates work across 10+ teams and projects without forcing the user to visit individual team boards.
- **Actors:** All Authenticated Users.
- **Scope:** Personal.
- **Entities Read:** `WorkItem`, `Project`, `Team`, `Cycle`.
- **Entities Mutated:** `WorkItem` (status, priority, estimates, due dates).
- **Entry Points:** Global Sidebar `My Work` link; Shortcut `G then M`; Command Palette `⌘K`.
- **Navigation Lineage:** Root → My Work.
- **Core Jobs:** Daily task prioritization; status updating; tracking assigned vs created issues.
- **Contextual Sub-Segments:** Internal tabs: `Assigned to Me` | `Created by Me` | `Subscribed` | `Review Requests`.
- **Projections:** Data Grid (`WRK-001`), Kanban Board (`WRK-002`), Timeline (`WRK-003`).
- **Dependencies:** Work Item Inspector (`WRK-005`), Quick Create (`CMD-002`).
- **Permissions:** All authenticated users.
- **Lifecycle & States:** Loading skeleton, Populated, Filtered Empty, Stale/Offline sync banner.
- **Keyboard Rules:** Full Data Grid navigation (`j`/`k`, `x` select, `s` status, `p` priority, `Enter` inspect).
- **MVP Classification:** **CORE**

---

### 5.2. Work Management & Execution Projections (`WRK`)

#### `WRK-001`: High-Density Data Grid Projection
- **Name:** High-Density Data Grid Projection
- **Surface Type:** PROJECTION
- **Domain:** Work Management
- **Parent Resource:** Rendered inside any Work container (`Team Work`, `Project Work`, `My Work`, `Cycle`).
- **Purpose:** 28px/34px tabular projection optimized for extreme information throughput, rapid scanning, keyboard inline edits, and bulk actions.
- **Why Projection:** Not a page; it is a presentation mode dynamically applied to any work item query.
- **Actors:** Engineers, Product Managers, Leads, Operations.
- **Scope:** Contextual (inherits parent scope).
- **Entities Read:** `WorkItem[]`, `User[]`, `Project[]`, `Cycle[]`.
- **Entities Mutated:** `WorkItem` inline property mutations.
- **Core Jobs:** Scanning 50+ rows without paging; inline editing assignee, priority, status; multi-selection bulk operations.
- **Inspector Dependencies:** Work Item Inspector (`WRK-005`).
- **Keyboard Rules:** `Arrow` / `j`/`k` movement, `Enter` inspect, `x` multi-select, `s` status picker, `p` priority picker, `Space` open property cell.
- **Accessibility:** Full `role="grid"`, `aria-rowindex`, accessible column header sorting announcements.
- **MVP Classification:** **CORE**

#### `WRK-002`: Workflow Kanban Board Projection
- **Name:** Workflow Kanban Board Projection
- **Surface Type:** PROJECTION
- **Domain:** Work Management
- **Parent Resource:** Rendered inside any Work container.
- **Purpose:** Visual stage-gate drag-and-drop projection grouped by workflow status (`Backlog`, `Todo`, `In Progress`, `Review`, `Done`).
- **Why Projection:** Lenses the exact same work items as the Data Grid in spatial column format.
- **Actors:** Team Members, Scrum Leads, Designers.
- **Scope:** Contextual.
- **Entities Mutated:** `WorkItem.status`, `WorkItem.columnOrder`.
- **Core Jobs:** Visualizing sprint flow; dragging items across status gates; identifying bottlenecks.
- **Keyboard Rules:** Arrow navigation between cards and columns; `Enter` inspect; shortcut status move.
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
- **Parent Resource:** Global Context (slides over any view).
- **Purpose:** Context-preserving detail editor for a selected work item. Displays full description, linked Living Specs, subtasks, activity log, and discussion comments without navigating away from the active list.
- **Width:** 480px–640px resizable drawer.
- **URL Backing:** `?inspect=OR-1082` (Deep linkable while preserving list background).
- **Keyboard Rules:** `Escape` closes drawer and restores focus to triggering list row.
- **MVP Classification:** **CORE**

---

### 5.3. Team Domain (`TEM`)

#### `TEM-001`: Team Hub Resource Page
- **Name:** Team Hub Resource Page
- **Surface Type:** RESOURCE PAGE
- **Domain:** Teams
- **Parent Resource:** Workspace Root
- **Purpose:** The canonical collaborative home for a functional squad (e.g. Core Platform, Mobile, Design).
- **Why Standalone:** Represents an organizational unit with distinct membership, permissions, workflows, and capabilities.
- **Actors:** Team Members, Leads, Cross-team Collaborators.
- **Scope:** Team.
- **Contextual Tabs:** `Overview` | `Work` | `Cycles`* | `Projects` | `Docs` | `Triage`* | `Members`.
- **Entry Points:** Sidebar Joined Teams list; Browse Teams Directory; Omnisearch `⌘K`.
- **MVP Classification:** **CORE**

#### `TEM-002`: Team Work Sub-Surface
- **Name:** Team Work Sub-Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Teams
- **Parent Resource:** Team Hub (`TEM-001`)
- **Purpose:** Primary execution lens rendering all active work items owned by the team across all cycles and backlogs.
- **Projections Available:** Data Grid (`WRK-001`), Kanban Board (`WRK-002`).
- **MVP Classification:** **CORE**

#### `TEM-003`: Team Triage Stream Sub-Surface
- **Name:** Team Triage Stream Sub-Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Teams
- **Parent Resource:** Team Hub (`TEM-001`)
- **Purpose:** Dedicated inbound queue for unvetted tickets, external bug reports, and customer requests requiring squad triage before entering the backlog.
- **Capability Requirement:** `team.capabilities.triage === true`.
- **Actions:** Accept (move to backlog/cycle), Decline (close with reason), Mark Duplicate, Snooze.
- **MVP Classification:** **POST-CORE**

#### `TEM-004`: Team Members & Capacity Sub-Surface
- **Name:** Team Members & Capacity Sub-Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Teams
- **Parent Resource:** Team Hub (`TEM-001`)
- **Purpose:** Displays squad roster, roles (Team Lead, Contributor, Guest), historical velocity, and capacity settings.
- **MVP Classification:** **CORE**

#### `TEM-005`: Teams Directory
- **Name:** Teams Directory
- **Surface Type:** DIRECTORY
- **Domain:** Teams
- **Parent Resource:** Workspace Root
- **Purpose:** Modal or browse page allowing users to discover, search, and join open teams across the organization without cluttering the persistent sidebar.
- **Entry Points:** Sidebar `+ Browse all teams...` link; Omnisearch `⌘K`.
- **MVP Classification:** **CORE**

---

### 5.4. Project Domain (`PRJ`)

#### `PRJ-001`: Project Workspace Resource Page
- **Name:** Project Workspace Resource Page
- **Surface Type:** RESOURCE PAGE
- **Domain:** Projects
- **Parent Resource:** Workspace / Owning Team
- **Purpose:** Canonical environment for bounded, time-scoped initiatives (e.g. "Offline Sync Protocol v2").
- **Contextual Tabs:** `Overview` | `Work` | `Docs` | `Milestones` | `Activity`.
- **Entry Points:** Team Projects tab; Initiatives rollup; Sidebar Favorites; Omnisearch `⌘K`.
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
- **Purpose:** Checkpoint dates and release gates (e.g. "Alpha Internal Dogfooding", "Public Beta"). Not work items—milestones aggregate work items to compute automated readiness percentages.
- **MVP Classification:** **CORE**

#### `PRJ-005`: Projects Directory
- **Name:** Projects Directory
- **Surface Type:** DIRECTORY
- **Domain:** Projects
- **Parent Resource:** Workspace Root
- **Purpose:** Searchable, filterable catalogue of all active, completed, and archived projects across the entire workspace.
- **Entry Points:** Subtle link in `Initiatives`; Command Palette `⌘K`; Route `/projects`.
- **MVP Classification:** **CORE**

---

### 5.5. Cycle & Iteration Domain (`CYC`)

#### `CYC-001`: Active Cycle Surface
- **Name:** Active Cycle Surface
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Cycles
- **Parent Resource:** Team Hub (`TEM-001`)
- **Purpose:** High-intensity 2-week execution cockpit. Displays active sprint burndown, cycle dates, commitment scope, and active work grid.
- **Capability Requirement:** `team.capabilities.cycles === true`.
- **Sidebar Integration:** Appears as `Current Cycle` sub-link under joined teams in the sidebar.
- **MVP Classification:** **CORE**

#### `CYC-002`: Cycle Planning & Backlog Management
- **Name:** Cycle Planning & Backlog Management
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Cycles
- **Parent Resource:** Team Hub (`TEM-001`)
- **Purpose:** Sprint planning workspace: left pane shows unprioritized team backlog; right pane shows upcoming cycle candidate list. Supports drag-and-drop commitment planning.
- **MVP Classification:** **CORE**

#### `CYC-003`: Cycle History & Retrospective Directory
- **Name:** Cycle History & Retrospective Directory
- **Surface Type:** DIRECTORY
- **Domain:** Cycles
- **Parent Resource:** Team Hub (`TEM-001`)
- **Purpose:** Archive of past completed cycles with velocity metrics, completion ratios, and rollover summaries.
- **MVP Classification:** **POST-CORE**

---

### 5.6. Strategic Planning & Initiatives Domain (`INT`)

#### `INT-001`: Initiatives Portfolio Primary Page
- **Name:** Initiatives Portfolio Primary Page
- **Surface Type:** PRIMARY PAGE
- **Domain:** Strategic Planning
- **Parent Resource:** Workspace Root
- **Purpose:** Top-level executive and cross-functional roadmap dashboard. Displays high-level strategic initiatives and health rollups across all engineering and product teams.
- **Projections Available:**
  - **Portfolio Table:** High-density status table with progress bars, owners, target quarters.
  - **Roadmap:** Multi-quarter interactive Gantt bar view.
  - **Health Matrix:** Grouped risk cards (On Track, At Risk, Delayed).
- **Entry Points:** Global Sidebar `Initiatives` link; Shortcut `G then N`.
- **MVP Classification:** **CORE**

#### `INT-002`: Initiative Detail Resource Page
- **Name:** Initiative Detail Resource Page
- **Surface Type:** RESOURCE PAGE
- **Domain:** Strategic Planning
- **Parent Resource:** Initiatives Hub (`INT-001`)
- **Purpose:** Deep dive into a specific multi-month strategic initiative (e.g. "Enterprise Scale 2026"). Displays connected projects, cross-project blockers, and executive status updates.
- **MVP Classification:** **CORE**

#### `INT-003`: Future Goals / OKRs Extension
- **Name:** Future Goals / OKRs Extension
- **Surface Type:** RESOURCE PAGE
- **Domain:** Strategic Planning
- **Parent Resource:** Organization Root
- **Purpose:** Strategic objective tracking sitting above Initiatives.
- **Status:** **FUTURE** (Schema placeholder only; no UI built in MVP).

---

### 5.7. Docs & Knowledge Domain (`DOC`)

#### `DOC-001`: Docs Hub Primary Page
- **Name:** Docs Hub Primary Page
- **Surface Type:** PRIMARY PAGE
- **Domain:** Knowledge
- **Parent Resource:** Workspace Root
- **Purpose:** The centralized knowledge portal for the entire organization. Hosts Living Specs, RFCs, Engineering Runbooks, and general wiki pages under a unified document model.
- **Entry Points:** Global Sidebar `Docs` link; Shortcut `G then D`.
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

### 5.8. Saved Views Domain (`VEW`)

#### `VEW-001`: Saved Views Directory
- **Name:** Saved Views Directory
- **Surface Type:** PRIMARY PAGE
- **Domain:** Saved Views
- **Parent Resource:** Workspace Root
- **Purpose:** Hub for discovering and managing multi-dimensional saved queries across Personal, Team, and Workspace scopes.
- **Entry Points:** Global Sidebar `Views` link.
- **MVP Classification:** **CORE**

#### `VEW-002`: View Execution Canvas
- **Name:** View Execution Canvas
- **Surface Type:** RESOURCE SUB-SURFACE
- **Domain:** Saved Views
- **Parent Resource:** Views Hub (`VEW-001`)
- **Purpose:** Renders the persisted query in the saved projection format (Data Grid, Kanban, or Timeline) with real-time reactive filtering.
- **MVP Classification:** **CORE**

---

### 5.9. Collaboration & Notifications Domain (`COL`)

#### `COL-001`: Threaded Discussion Inspector Panel
- **Name:** Threaded Discussion Inspector Panel
- **Surface Type:** INSPECTOR / DRAWER
- **Domain:** Collaboration
- **Parent Resource:** Embedded in Work Item Inspector (`WRK-005`) and Doc Inspector (`DOC-003`).
- **Purpose:** Real-time conversational comments, @mentions, rich attachments, and emoji reactions attached to canonical entities.
- **MVP Classification:** **CORE**

#### `COL-002`: Activity & Audit Trail Panel
- **Name:** Activity & Audit Trail Panel
- **Surface Type:** INSPECTOR / DRAWER
- **Domain:** Collaboration
- **Parent Resource:** Contextual tab/panel in Project, Team, or Work Item.
- **Purpose:** Immutable chronological history of property mutations, branch links, pull requests, and status transitions.
- **MVP Classification:** **CORE**

---

### 5.10. Search, Command Palette & Pickers (`CMD`)

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
- **Purpose:** Rapid work item creation dialog accessible from anywhere via single key `c`.
- **Submit Shortcut:** `⌘+Enter` to submit and stay open; `Enter` to create and inspect.
- **MVP Classification:** **CORE**

#### `CMD-003`: Entity Context Pickers (Status, Priority, User, Team, Project)
- **Name:** Entity Context Pickers
- **Surface Type:** OVERLAY (Anchored Popover)
- **Domain:** Search & Commands
- **Parent Resource:** Contextual (anchored to grid cells, inspectors, or forms).
- **Purpose:** High-density, keyboard-searchable dropdown pickers for rapid attribute assignment without mouse hunting.
- **MVP Classification:** **CORE**

---

### 5.11. Workspace Administration Domain (`WKS`)

#### `WKS-001`: Workspace General Settings
- **Name:** Workspace General Settings
- **Surface Type:** SETTINGS PAGE
- **Domain:** Workspace Administration
- **Parent Resource:** Workspace Root
- **Purpose:** Workspace name, URL slug, default workflow statuses, priority definitions, and icon.
- **Entry Points:** Bottom utility gear `Settings > Workspace`.
- **MVP Classification:** **CORE**

#### `WKS-002`: Workspace Members & Guest Directory
- **Name:** Workspace Members & Guest Directory
- **Surface Type:** SETTINGS PAGE
- **Domain:** Workspace Administration
- **Parent Resource:** Workspace Root
- **Purpose:** Managing workspace member invitations, role assignments (Member vs Guest), and team assignments.
- **MVP Classification:** **CORE**

#### `WKS-003`: Workflow Status & Custom Fields Editor
- **Name:** Workflow Status & Custom Fields Editor
- **Surface Type:** SETTINGS PAGE
- **Domain:** Workspace Administration
- **Parent Resource:** Workspace Root
- **Purpose:** Configuring team workflow state machines, transition validations, and custom metadata fields.
- **MVP Classification:** **POST-CORE**

#### `WKS-004`: Third-Party Integrations Hub
- **Name:** Third-Party Integrations Hub
- **Surface Type:** SETTINGS PAGE
- **Domain:** Workspace Administration
- **Parent Resource:** Workspace Root
- **Purpose:** Managing bi-directional Git sync (GitHub, GitLab), Slack/Zendesk webhooks, and Figma embeds.
- **MVP Classification:** **POST-CORE**

---

### 5.12. Enterprise & Organization Administration Domain (`ADM`)

#### `ADM-001`: Organization Identity & SSO/SCIM
- **Name:** Organization Identity & SSO/SCIM
- **Surface Type:** ADMIN PAGE
- **Domain:** Enterprise Administration
- **Parent Resource:** Organization Root
- **Purpose:** Enterprise authentication governance: SAML 2.0 / OIDC configuration, SCIM user auto-provisioning, enforced 2FA, session timeouts.
- **Permissions:** Organization Owner & Enterprise Security Admins strictly.
- **MVP Classification:** **ENTERPRISE**

#### `ADM-002`: Enterprise Forensic Audit Log
- **Name:** Enterprise Forensic Audit Log
- **Surface Type:** ADMIN PAGE
- **Domain:** Enterprise Administration
- **Parent Resource:** Organization Root
- **Purpose:** Immutable, searchable security audit log recording every user authentication, permission change, data export, and document access with IP, timestamp, and actor diffs.
- **MVP Classification:** **ENTERPRISE**

#### `ADM-003`: Organization Billing & Subscription Console
- **Name:** Organization Billing & Subscription Console
- **Surface Type:** ADMIN PAGE
- **Domain:** Enterprise Administration
- **Parent Resource:** Organization Root
- **Purpose:** Enterprise tier management, seat licensing, invoice downloads, usage quotas.
- **MVP Classification:** **ENTERPRISE**

---

### 5.13. Global System Surfaces (`SYS`)

#### `SYS-001`: Global 404 Not Found & Resource Tombstone
- **Name:** Global 404 Not Found & Resource Tombstone
- **Surface Type:** GLOBAL SYSTEM SURFACE
- **Domain:** Global System
- **Purpose:** Informs user when a resource has been deleted, archived, or transferred, offering recovery links and search suggestions.
- **MVP Classification:** **CORE**

#### `SYS-002`: Permission Denied & Access Request Gateway
- **Name:** Permission Denied & Access Request Gateway
- **Surface Type:** GLOBAL SYSTEM SURFACE
- **Domain:** Global System
- **Purpose:** Replaces jarring 403 errors with a clean, branded surface explaining required access and providing a 1-click "Request Access from Admin" flow.
- **MVP Classification:** **CORE**

#### `SYS-003`: Offline Sync & Disconnection Banner
- **Name:** Offline Sync & Disconnection Banner
- **Surface Type:** GLOBAL SYSTEM SURFACE
- **Domain:** Global System
- **Purpose:** Ambient non-blocking indicator signaling network disconnection, optimistic offline caching, and real-time reconciliation status.
- **MVP Classification:** **CORE**

---

## 6. Duplicate & Redundant Surface Consolidation Decisions

To prevent the common architectural failure of "page explosion" (seen in Jira and ClickUp), we enforce strict consolidation rules:

| Candidate Separate Surface | Architectural Decision | Consolidation Rationale |
| :--- | :--- | :--- |
| **"Assigned to Me" Page**<br>**"Created by Me" Page**<br>**"Subscribed Issues" Page** | **CONSOLIDATED into `PER-002 (My Work)`** | Users should not context-switch across three separate pages to understand their personal responsibilities. They are internal segmented tabs over one personal query model. |
| **"Roadmap" Page**<br>**"Portfolio" Page**<br>**"Initiative Health" Page** | **CONSOLIDATED into `INT-001 (Initiatives)`** | Roadmaps and Portfolios are not separate resources; they are projection lenses over the exact same Strategic Initiative entities. |
| **"Living Spec" Page**<br>**"RFC" Page**<br>**"Runbook" Page** | **CONSOLIDATED into `DOC-002 (Document Editor)`** | All document types share the same editor, block canvas, and bi-directional table sync. Differentiated via a `docType` template metadata attribute. |
| **"Calendar View" Page**<br>**"Gantt View" Page** | **CONSOLIDATED into Contextual Projections (`WRK-003`)** | Projections are mathematical lenses over work items, never permanent sidebar pages. |
| **"Notifications Page" vs "Inbox"** | **CONSOLIDATED into `PER-001 (Inbox)`** | Having both an "Inbox" and a "Notification Center" creates confusing split-attention. The Inbox is the single user-facing actionable notification surface. |

---

## 7. Canonical Resource Relationship Maps

```
Organization (Legal & Billing Tenant)
  └── Workspace (Collaboration Environment)
        ├── Initiatives (Strategic Themes)
        │     └── Projects (Bounded Deliverables)
        │           ├── Milestones (Planning Checkpoints)
        │           ├── Documents (Living Specs, RFCs)
        │           │     └── [Bi-directional embed blocks] ──┐
        │           └── Work Items ◄─────────────────────────┘
        │
        ├── Teams (Functional Execution Squads)
        │     ├── Cycles (Sprint Cadences)
        │     │     └── Work Items (Committed Sprint Scope)
        │     ├── Team Backlog (Unscheduled Work Items)
        │     └── Team Docs (Runbooks, Specs)
        │
        └── Users / Members
              ├── Personal Inbox (Triage Events)
              ├── My Work (Personal Issue Rollup)
              └── Favorites (Dynamic Pointers)
```

---

## 8. Master Cross-Surface User Flows

These 6 canonical cross-surface journeys define how Orynqo operates end-to-end and will dictate the sequence of our future Golden Flows:

### Journey 1: The Daily Triage & Execution Flow
`Global Sidebar` → **Inbox (`PER-001`)** → Press `j`/`k` to select mention → **Inspector Drawer (`WRK-005`)** opens → Press `e` to archive → Press `G then M` to jump to **My Work (`PER-002`)** → Update status to `In Progress` in **Data Grid (`WRK-001`)**.

### Journey 2: The Living Spec to Ticket Generation Flow
`Global Sidebar` → **Docs Hub (`DOC-001`)** → Open **PRD: Offline Sync (`DOC-002`)** → Highlight architecture paragraph → Click "Convert to Work Item" → New canonical **Work Item** created → Live bi-directional status pill embeds into the document table.

### Journey 3: The Sprint Cycle Execution Flow
`Global Sidebar` → **Team Hub: Core Platform (`TEM-001`)** → Click **Active Cycle 42 (`CYC-001`)** → Toggle projection to **Kanban Board (`WRK-002`)** → Drag blocker to `In Review` → Open **Inspector (`WRK-005`)** to tag reviewer.

### Journey 4: The Strategic Planning & Milestone Review Flow
`Global Sidebar` → **Initiatives (`INT-001`)** → Toggle to **Roadmap Timeline** → Inspect cross-project dependency → Drill down into **Project Workspace (`PRJ-001`)** → Review **Project Milestones (`PRJ-004`)**.

### Journey 5: Rapid Zero-Mouse Omnisearch Navigation
Anywhere in app → Press `⌘K` → **Command Palette (`CMD-001`)** opens → Type `"Atlas"` → ArrowDown to select Project → Press `Enter` → Instantly arrive at **Project Work (`PRJ-003`)**.

### Journey 6: Unvetted Issue Ingestion & Triage
External bug webhook fires → Lands in **Team Triage Queue (`TEM-003`)** → Lead engineer reviews ticket → Press `a` (Accept) → Item moves into **Team Backlog / Next Cycle (`CYC-002`)**.

---

## 9. Comprehensive Settings Taxonomy

Settings are isolated into four disciplined architectural tiers, keeping the primary execution sidebar clean:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      SETTINGS INFORMATION ARCHITECTURE                 │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ Tier               │ Settings Surfaces  │ Access Boundary              │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ 1. Personal        │ • Profile & Avatar │ All Users                    │
│    Settings        │ • Notifications    │                              │
│                    │ • Keyboard & Theme │                              │
│                    │ • Personal Tokens  │                              │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ 2. Team            │ • Team Details     │ Team Admins & Leads          │
│    Settings        │ • Capability Flags │                              │
│                    │ • Squad Membership │                              │
│                    │ • Team Workflows   │                              │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ 3. Workspace       │ • General Config   │ Workspace Administrators     │
│    Settings        │ • Member Directory │                              │
│                    │ • Custom Fields    │                              │
│                    │ • Integrations Hub │                              │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ 4. Enterprise Org  │ • SAML SSO / SCIM  │ Organization Owners &        │
│    Administration  │ • Forensic Audit   │ Enterprise Security Officers │
│                    │ • Data Retention   │                              │
│                    │ • Billing & Seats  │                              │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

---

## 10. Reusable Component Forecast

From our master surface registry, we forecast the recurring component patterns required for future implementation phases:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      REUSABLE COMPONENT FORECAST                       │
├─────────────────────────┬───────────────────┬──────────────────────────┤
│ Component Name          │ Architectural Tier│ Surfaces Utilizing It    │
├─────────────────────────┼───────────────────┼──────────────────────────┤
│ `ResourceHeader`        │ Global Product    │ Team Hub, Project, Init  │
│ `ResourceTabBar`        │ Global Product    │ Team Hub, Project, Docs  │
│ `ProjectionSegmentedBar`│ Global Product    │ My Work, Team, Project   │
│ `InspectorShell`        │ Global Product    │ Work Items, Docs, Activity│
│ `PropertyEditorRow`     │ Design System     │ Inspector, Quick Create  │
│ `UniversalDataGrid`     │ Domain Execution  │ My Work, Team, Project   │
│ `WorkflowKanbanBoard`   │ Domain Execution  │ My Work, Team, Project   │
│ `TemporalGanttChart`    │ Domain Execution  │ Project, Initiatives     │
│ `LivingDocBlockEditor`  │ Domain Knowledge  │ Docs Hub, Project Specs  │
│ `CommandPaletteModal`   │ Application Shell │ Global Overlay           │
│ `DirectoryCatalogue`    │ Global Product    │ Projects Dir, Teams Dir  │
│ `SettingsLayoutShell`   │ Global Product    │ User, Team, Org Settings │
└─────────────────────────┴───────────────────┴──────────────────────────┘
```

---

## 11. Scale Review (From 5 to 5,000+ Users)

We validate this surface registry against extreme organizational scale:

1. **Directories Prevent Collapse:** In a 5,000-user enterprise with 2,000 projects and 150 teams, the global sidebar remains compact because projects are discovered via `PRJ-005 (Projects Directory)` and teams via `TEM-005 (Teams Directory)`.
2. **Contextual Tabs Prevent Mega-Menus:** Rather than creating 10 sidebar items per team, a team uses contextual sub-tabs (`Overview | Work | Cycles | Projects | Docs | Triage | Members`).
3. **Enterprise Governance Isolation:** Dedicated `ADM-xxx` surfaces prevent security, SCIM, and audit logs from polluting the day-to-day productivity chrome.

---

## 12. Registry Statistics & MVP Classification Breakdown

### Total Registered Surfaces: **33 Surfaces**

#### Breakdown by Surface Type:
- **Primary Pages:** 5 (`PER-001`, `PER-002`, `INT-001`, `DOC-001`, `VEW-001`)
- **Resource Pages:** 4 (`TEM-001`, `PRJ-001`, `INT-002`, `DOC-002`)
- **Resource Sub-Surfaces:** 8 (`TEM-002`, `TEM-003`, `TEM-004`, `PRJ-002`, `PRJ-003`, `PRJ-004`, `CYC-001`, `CYC-002`)
- **Projections:** 4 (`WRK-001`, `WRK-002`, `WRK-003`, `WRK-004`)
- **Directories:** 4 (`TEM-005`, `PRJ-005`, `CYC-003`, `VEW-002`)
- **Inspectors & Drawers:** 3 (`WRK-005`, `DOC-003`, `COL-001`)
- **Overlays & Pickers:** 3 (`CMD-001`, `CMD-002`, `CMD-003`)
- **Settings & Administration Pages:** 7 (`WKS-001`, `WKS-002`, `WKS-003`, `WKS-004`, `ADM-001`, `ADM-002`, `ADM-003`)
- **Global System Surfaces:** 3 (`SYS-001`, `SYS-002`, `SYS-003`)

#### Breakdown by MVP Classification:
- **CORE (Foundational Orynqo Platform):** **22 Surfaces** (67%)
- **POST-CORE (Fast Follow-Up Enhancements):** **6 Surfaces** (18%)
- **ENTERPRISE (Advanced Security & Governance):** **4 Surfaces** (12%)
- **FUTURE (Long-term Extensibility):** **1 Surface** (3% — Goals/OKRs)

---

## 13. Recommended UI/UX Design Sequence

Based on domain dependencies, reusability leverage, and risk mitigation, we establish the mandatory sequence for subsequent UI/UX design phases:

```
┌────────────────────────────────────────────────────────────────────────┐
│                  RECOMMENDED UI/UX DESIGN SEQUENCE                     │
├───────────────┬────────────────────────────────────────────────────────┤
│ Phase         │ Target Scope & Rationale                               │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-01**     │ **High-Density Execution Core (The Work Foundation)**  │
│               │ - Universal Data Grid (`WRK-001`)                      │
│               │ - Work Item Inspector Drawer (`WRK-005`)               │
│               │ - Quick Create Modal (`CMD-002`)                       │
│               │ *Rationale:* Work Items are the atomic currency of the │
│               │ entire platform. All subsequent pages render them.     │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-02**     │ **Personal Productivity Cockpit**                      │
│               │ - Personal Triage Inbox (`PER-001`)                    │
│               │ - My Work Hub (`PER-002`)                              │
│               │ *Rationale:* The user's primary daily landing home.    │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-03**     │ **Team Hub & Capability Execution**                    │
│               │ - Team Hub Resource Page (`TEM-001`)                   │
│               │ - Active Cycle Surface (`CYC-001`)                     │
│               │ - Kanban Board Projection (`WRK-002`)                  │
│               │ *Rationale:* Establishes functional squad workflows.   │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-04**     │ **Living Specs & Document Canvas**                     │
│               │ - Docs Hub (`DOC-001`)                                 │
│               │ - Canonical Document Editor with Work Item blocks      │
│               │   (`DOC-002`)                                          │
│               │ *Rationale:* Unlocks Orynqo's core product innovation. │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-05**     │ **Project Workspace & Strategic Planning**             │
│               │ - Project Workspace (`PRJ-001`)                        │
│               │ - Initiatives & Roadmap Projection (`INT-001`)         │
│               │ - Temporal Timeline (`WRK-003`)                        │
│               │ *Rationale:* Cross-project coordination and rollups.   │
├───────────────┼────────────────────────────────────────────────────────┤
│ **UI-06**     │ **Workspace & Enterprise Governance**                  │
│               │ - Settings Suite (`WKS-xxx`)                           │
│               │ - Enterprise Administration Console (`ADM-xxx`)        │
│               │ *Rationale:* Final enterprise governance layer.        │
└───────────────┴────────────────────────────────────────────────────────┘
```

---

## 14. Open Decisions for Human Review

Before proceeding to `UI-01`, we flag the following design decisions for human alignment:

1. **Cycle Backlog Rollover Model:** In `CYC-002`, when an active cycle finishes, should uncompleted work items automatically roll over into the next cycle by default, or require explicit triage into the backlog?
2. **Document Link Permissions:** In `DOC-002`, if a Living Spec embeds work items from a private team that the reader cannot access, should the table hide the rows entirely or display a *"Restricted Item"* placeholder pill?
3. **Design Sequence Endorsement:** Confirm approval of the proposed `UI-01` through `UI-06` progression sequence.

---

> [!IMPORTANT]
> **STOPPED AT HUMAN REVIEW — IA-03**  
> Complete master surface registry is recorded in [`docs/06-complete-page-and-surface-registry.md`](file:///d:/Full_Stack_Apps/Orynqo-web/docs/06-complete-page-and-surface-registry.md).  
> In accordance with instructions, work has stopped here.  
> - No application code, UI screens, mockups, or routes were created or modified.  
> - Awaiting Human Review to officially freeze IA-03 before commencing `UI-01`.
