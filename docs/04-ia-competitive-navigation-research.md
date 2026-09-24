# Orynqo Platform — Competitive Navigation & Information Architecture Research (Phase IA-01)

**Status:** Research Complete — Proposed Baseline for Human Review  
**Phase:** `IA-01 — Competitive Navigation & Sidebar Deep Research`  
**Governing Methodology:** `antigravity-enterprise-product-design`  
**Preceding Phase:** `Architecture & Design-System Stabilization (Pass 01 & 01A — APPROVED)`  
**Current Milestone:** Information Architecture Discovery & Domain Taxonomy  
**Freeze Status:** NOT FROZEN (Requires Human Review Sign-Off before IA-02)  
**Implementation Status:** Strictly Non-Implementation (No UI/code changes permitted)  

---

## 1. Executive Summary & Purpose

Orynqo is designed as an enterprise-grade, high-density, keyboard-first productivity platform uniting **living specifications (product documents)** with a **high-throughput work item execution graph (issues, cycles, initiatives)**. 

### Why This Research Is Mandatory
In complex SaaS platforms, the sidebar is not merely a collection of links—it is the **spatial manifestation of the user's mental model**. When platforms build screens independently before establishing an information architecture (IA), they inevitably encounter catastrophic structural failure:
1. **Navigation Sprawl:** Every new feature claims a top-level sidebar slot, resulting in 20+ cluttered icons that overwhelm users.
2. **Category Ambiguity:** Users cannot predict whether an item lives under "My Work", "Projects", "Teams", "Views", or "Settings".
3. **Contextual Inversion:** Views and projections (such as Table, Board, Timeline, or Workload) are mistakenly treated as top-level destinations rather than polymorphic lenses over underlying resources.
4. **Enterprise Scale Breakdown:** An IA designed for 5 users in 1 team collapses when scaled to 500 users across 80 teams, thousands of projects, and dozens of third-party integrations.

This research phase investigates the navigation architectures of mature, world-class products (including Linear, Jira Cloud, Notion, Asana, ClickUp 3.0, Monday.com, Plane, and peers) to establish a principled, scalable, and durable information architecture for Orynqo before any individual page is designed or implemented.

---

## 2. Research Methodology & Evidentiary Standard

To maintain analytical rigor and prevent subjective bias, all findings in this document strictly enforce a three-tier evidentiary taxonomy:

- **[FACT / OBSERVATION]:** An empirical, verifiable capability, navigation placement, or behavioral rule documented in official product documentation, changelogs, public software releases, or verified product testing.
- **[INTERPRETATION]:** The architectural rationale, trade-off analysis, or user mental model deduction explaining *why* the product chose this specific structure.
- **[ORYNQO DESIGN IMPLICATION]:** The architectural conclusion, constraint, or concrete guidance directly applicable to Orynqo's navigation system.

*All dates referenced reflect platform architectures verified in Q1 2026 / recent major releases.*

---

## 3. Mature-Platform Deep Dive & Navigation Analysis

### 3.1. Linear
- **Product Archetype:** High-velocity, keyboard-first issue tracker and cycle execution engine for technical teams.
- **Top-Level Navigation Structure (Verified Q1 2026):**
  ```
  Workspace Header (Workspace Switcher / Organization Settings)
  ├── Search & Command System (⌘K)
  ├── Inbox (Notifications, triage, mentions, subscribed issues)
  ├── My Issues (Assigned to Me, Created by Me, Subscribed, Activity)
  ├── Initiatives (Cross-project strategic roadmaps & rollups — formerly "Roadmaps")
  ├── Views (Workspace-level and personal custom filtered views)
  ├── Favorites (Starred projects, views, documents, issues, cycles)
  ├── Teams Section
  │   └── [Team Name] (e.g. Core Engine, Mobile, Web)
  │       ├── Issues (All active team work items)
  │       ├── Active Cycle (Current sprint cadence)
  │       ├── Cycles (Upcoming, current, previous)
  │       ├── Projects (Projects owned by this team)
  │       ├── Views (Team-specific saved views)
  │       ├── Triage (External bug ingestion queue)
  │       └── Backlog (Unscheduled issues)
  └── Bottom Rail: Workspace Settings, Personal Profile, Help & Shortcuts (?)
  ```

#### Evidentiary Breakdown
- **[FACT / OBSERVATION]:** Linear completely replaced the term "Roadmaps" with "Initiatives" in recent releases. Initiatives are the top-level container for multi-project strategic objectives. Linear’s sidebar is user-customizable: sections can be collapsed, reordered, or hidden behind a "More" overflow. Individual views like Board, List, and Timeline are **not** sidebar destinations; they are view toggles in the header strip of a project, team, or cycle view.
- **[INTERPRETATION]:** Linear's mental model is strictly **Team-Centric at the execution layer** and **Personal-Centric at the top layer**. Teams own workflows, cycles, and backlogs. Projects can be cross-team, but execution lives in teams. The sidebar stays short because projects are not dumped as flat lists; they are grouped under their respective teams or accessed through Initiatives or Favorites.
- **[ORYNQO DESIGN IMPLICATION]:** Orynqo must adopt Linear's discipline of keeping views (Board/Grid/Timeline) as contextual projections rather than sidebar items. Furthermore, high-frequency personal workflows (`Inbox`, `My Work`) must sit at the absolute top of the hierarchy.

---

### 3.2. Jira Cloud (Atlassian)
- **Product Archetype:** Highly configurable enterprise issue tracker and project management platform.
- **Navigation Model Evolution:**
  Jira Cloud evolved from a top horizontal menu bar to a dual-tier navigation system (recently overhauled into an unified left sidebar with product vs. project contextual switching):
  ```
  Global Shell (Product Context — "Blue" Header/Sidebar)
  ├── Organization / Product Switcher (Atlassian App Switcher)
  ├── Your Work (Assigned to me, Recent boards/projects, Starred items)
  ├── Projects (Directory of all projects: Recent, Starred, All)
  ├── Filters (Search issues, Starred filters, Custom JQL queries)
  ├── Dashboards (Reporting widgets, Custom executive dashboards)
  ├── Teams (Directory of teams, Member profiles, Team assignments)
  ├── Plans / Advanced Roadmaps (Enterprise cross-project portfolio planning)
  └── Settings (Jira Settings, User Management, System Administration)
  
  Project Shell (Contextual — "Gray" Scope)
  ├── Project Name & Avatar
  ├── Summary (Project dashboard & health metrics)
  ├── Board / Kanban (Active sprint or continuous flow)
  ├── Backlog (Sprint planning backlog & epics panel)
  ├── Timeline / Roadmap (Gantt chart of epics & releases)
  ├── Pages (Direct Confluence integration link)
  ├── Code / Deployments (GitHub / GitLab / Bitbucket git links)
  ├── Releases / Versions (Deployment milestones)
  └── Project Settings (Components, Workflows, Permissions)
  ```

#### Evidentiary Breakdown
- **[FACT / OBSERVATION]:** Jira uses an explicit **contextual navigation swap**: when a user enters a Project, the sidebar transforms from the global application view into the specific Project's navigation menu. Jira distinguishes "Product level" (blue accent) from "Project level" (gray accent) to signal context.
- **[INTERPRETATION]:** Jira’s model reflects its enterprise history: projects are heavy administrative containers with distinct permission schemes, custom field schemas, and workflows. Dumping all projects into a single flat sidebar is impossible for enterprise customers who have 10,000+ Jira projects.
- **[ORYNQO DESIGN IMPLICATION]:** While Jira's full sidebar swap causes disorienting context-loss for fast users, its fundamental scaling lesson is undeniable: **Enterprise navigation must have a project directory/picker rather than listing all projects directly in the sidebar**. Orynqo must use a hybrid: keep the global sidebar stable, and open projects into a focused workspace with breadcrumb context.

---

### 3.3. Notion
- **Product Archetype:** Unstructured block-based knowledge canvas and relational document databases.
- **Top-Level Navigation Structure (Verified Q1 2026):**
  ```
  Workspace Header (Workspace Switcher & Settings)
  ├── Search (Quick Find / ⌘K / AI Search)
  ├── Home (Recent pages, assigned tasks, recommended reading)
  ├── Inbox (Mentions, updates, page comments)
  ├── Favorites (User-curated starred pages and databases)
  ├── Teamspaces (Scoped departmental hubs: Engineering, Product, Marketing)
  │   └── [Teamspace Name]
  │       ├── Open / Default Teamspace Pages
  │       └── Nested Document Trees
  ├── Shared (Pages explicitly shared with specific individuals outside teamspaces)
  ├── Private (Personal draft pages visible strictly to the current user)
  ├── Templates / Trash
  └── Settings & Members
  ```

#### Evidentiary Breakdown
- **[FACT / OBSERVATION]:** Notion structures its entire sidebar around **Access and Privacy boundaries**: `Favorites` → `Teamspaces` (Organization/Team) → `Shared` (Cross-functional collaboration) → `Private` (Personal sandbox). Every item in the sidebar is fundamentally a **Page** (which can be a document or a database). Pages can be infinitely nested inside other pages.
- **[INTERPRETATION]:** Notion's model gives maximum freedom, but without strong conventions, large enterprises suffer from "sidebar chaos"—deeply nested trees that users cannot discover or manage. Teamspaces were introduced specifically to arrest this collapse by introducing boundary walls for enterprise departments.
- **[ORYNQO DESIGN IMPLICATION]:** For Orynqo's **Living Specs and Knowledge Architecture**, documents must not exist in a disconnected silo (like an iframe or Confluence link). They should support privacy tiers (`Private Drafts` → `Team Specs` → `Workspace Specs`), but maintain a canonical link to the work items they define.

---

### 3.4. Asana
- **Product Archetype:** Cross-functional project coordination and executive portfolio management.
- **Sidebar Navigation Structure:**
  ```
  Workspace / Org Header
  ├── Home (Configurable personal dashboard, task widgets)
  ├── My Tasks (List, Board, Calendar, Files of assigned work items)
  ├── Inbox (Activity updates, notifications, @mentions)
  ├── Starred / Favorites (Starred projects, portfolios, saved searches)
  ├── Insights / Reporting
  │   ├── Portfolios (Executive rollups of project health & status)
  │   ├── Goals (Company and team OKRs / strategic milestones)
  │   └── Dashboards (Cross-project visual metric charts)
  ├── Projects Section (Recent & starred projects, categorized by Team)
  │   └── [Team / Workspace Category]
  │       └── Project Link
  └── Team Directory & Invitations
  ```

#### Evidentiary Breakdown
- **[FACT / OBSERVATION]:** Asana separates strategic alignment (`Portfolios` and `Goals`) into a dedicated top-level tier distinct from daily execution (`My Tasks`, `Projects`). Inside any Project, views are tabs across the top: `Overview`, `List`, `Board`, `Timeline`, `Calendar`, `Workflow`, `Dashboard`, `Messages`, `Files`.
- **[INTERPRETATION]:** Asana understands that executives and program managers do not care about individual task boards; they navigate via Portfolios (progress bars, status lights, risk levels) and Goals (metric targets). Conversely, individual contributors spend 90% of their day in `My Tasks` and project `List` views.
- **[ORYNQO DESIGN IMPLICATION]:** Orynqo must provide a clean **Strategic Planning tier (Initiatives & Milestones)** that bridges executive rollups to team-level execution, without forcing individual developers to wade through high-level portfolio screens to find their daily sprint tasks.

---

### 3.5. ClickUp 3.0
- **Product Archetype:** Feature-dense "everything app" covering tasks, docs, chat, whiteboards, dashboards, and time tracking.
- **Hierarchy & Navigation Structure:**
  ```
  Global App Rail (Leftmost utility strip: Home, Inbox, Docs Hub, Dashboards Hub, More)
  Sidebar Drawer (The "Hierarchy" Tree)
  ├── Favorites
  ├── Spaces (Top departmental containers: Engineering, Sales, Ops)
  │   └── [Space Name]
  │       ├── Space-level Views & Docs
  │       ├── Folders (Grouping layer for related projects)
  │       │   └── Lists (The actual task containers)
  │       └── Standalone Lists
  └── Everything View (Cross-workspace rollup of all tasks)
  ```

#### Evidentiary Breakdown
- **[FACT / OBSERVATION]:** ClickUp enforces a strict 5-layer hierarchy: `Workspace` → `Space` → `Folder` → `List` → `Task`. Because this deep tree causes extreme sidebar vertical scrolling, ClickUp 3.0 introduced "Hubs" (`Docs Hub`, `Dashboards Hub`, `Whiteboards Hub`) as centralized directory surfaces accessible from global navigation.
- **[INTERPRETATION]:** ClickUp's hierarchy demonstrates the limit of nested navigation. When users must expand Space > Folder > Subfolder > List > Task, the sidebar becomes completely unnavigable. The introduction of Hubs was an architectural concession: users could no longer find documents or dashboards inside the tree, so flat search hubs had to be retrofitted.
- **[ORYNQO DESIGN IMPLICATION]:** **Avoid excessive vertical nesting in the sidebar.** Orynqo should limit persistent sidebar hierarchy to **2 levels** (e.g., `Team` → `Project` or `Team` → `Active Cycle`). Any deeper structure (Milestones, Specs, Work Items) belongs inside the primary page canvas or contextual tabs, never in the persistent sidebar.

---

### 3.6. Monday.com
- **Product Archetype:** Tabular workflow automation platform and visual team management.
- **Sidebar Navigation Structure:**
  ```
  Global Top/Left Rail
  ├── Workspace Switcher Dropdown (Switches the entire active sidebar context)
  ├── Search Everything
  ├── My Work (Personal cross-board assigned task aggregator)
  ├── Favorites
  ├── Active Workspace Content
  │   ├── Boards (Table/Kanban/Gantt work containers)
  │   ├── Dashboards (Visual widget aggregations)
  │   └── Docs (WorkDocs)
  └── Bottom: Invite Members, Help, Administration
  ```

#### Evidentiary Breakdown
- **[FACT / OBSERVATION]:** Monday.com isolates departmental content using a **Workspace Switcher Dropdown** at the top of the sidebar. Selecting "Marketing" reloads the sidebar list to show only Marketing boards and dashboards; selecting "Product" completely swaps the boards list.
- **[INTERPRETATION]:** This dropdown approach prevents an infinitely long sidebar in large accounts with 500 boards, but creates a high-friction context switch: users working across multiple teams cannot see their work simultaneously in one view, forcing constant dropdown toggling.
- **[ORYNQO DESIGN IMPLICATION]:** The dropdown-workspace swap is too rigid for cross-functional power users. Orynqo must allow users to view their active joined teams in a collapsible section, while relying on Omnisearch (`⌘K`) and personal hubs (`My Work`) to effortlessly bridge boundaries.

---

### 3.7. Secondary Competitor Observations (Plane, Height, Shortcut, GitHub Projects)

| Platform | Key Navigation Pattern | Trade-Off / Lesson for Orynqo |
| :--- | :--- | :--- |
| **Plane (Open Source)** | Dual project navigation: **Accordion mode** (nested under project in sidebar) vs. **Horizontal mode** (tabs at top of page). Global Search and Notifications moved to top header bar. | Confirms that horizontal tabs are superior for dense desktop screens; nested accordion navigation in sidebars wastes vertical space. |
| **Height.app** | Continuous unified spreadsheet with custom spreadsheets. Heavy reliance on `⌘K` for navigation. No rigid "team" containers. | Powerful for small agile startups, but lacks the organizational governance and cycle cadences required by 500+ seat enterprises. |
| **Shortcut (Clubhouse)** | Clear separation between Stories (Issues), Epics (Projects), Milestones (Strategic Goals), and Iterations (Cycles). | Proves the necessity of separating the **Strategic Layer** (Milestones/Epics) from the **Cadence Layer** (Iterations/Sprints). |
| **GitHub Projects** | Projects exist as relational views over repository issues. Navigation is URL-centric and tab-driven. | Demonstrates that views should be treated as saved SQL-like queries over an issue graph rather than permanent physical containers. |

---

## 4. Cross-Product Comparison Matrix

| Architectural Dimension | Linear | Jira Cloud | Notion | Asana | ClickUp 3.0 | Monday.com |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Organizing Unit** | Team | Project | Page / Teamspace | Project | Space / Folder / List | Workspace / Board |
| **Sidebar Hierarchy Depth** | 2 levels (Team > Resource) | 1 level (Contextual swap) | N levels (Infinite tree) | 2 levels (Team > Project) | 4 levels (Space > Folder > List > Doc) | 2 levels (Workspace > Board) |
| **Personal Work Placement** | Top of sidebar (`Inbox`, `My Issues`) | Top of sidebar (`For you`, `Your work`) | Top of sidebar (`Home`, `Inbox`) | Top of sidebar (`Home`, `My Tasks`) | Global rail (`Home`, `Inbox`) | Top of sidebar (`My Work`) |
| **View Placement (Board/Table/Gantt)** | Contextual tabs in header strip | Contextual sidebar items inside project | Header view tabs inside database | Contextual header tabs inside project | Contextual header tabs inside List/Space | Contextual header tabs inside board |
| **Strategic Planning Placement** | `Initiatives` in main sidebar | `Plans / Advanced Roadmaps` in global nav | Dedicated Database page | `Portfolios` & `Goals` in main sidebar | `Goals` in global hub | Dedicated Portfolio Boards |
| **Knowledge / Specs Placement** | Project documents & embedded specs | Confluence (separate product link) | Core primitive (Everything is a page) | Project overview / attachments | `Docs Hub` & nested List docs | WorkDocs inside boards |
| **Scaling Mechanism (for 100+ entities)** | Collapsible teams, favorites, `⌘K` | Project directory & search | Teamspaces, favorites, search | Pinned projects, search | Hubs, collapsible spaces, search | Workspace dropdown switch |
| **Keyboard Nav Integration** | First-class (`G then ...`, `⌘K`) | Secondary (`/` search, shortcuts) | Moderate (`⌘P`, `⌘\`) | Moderate (`Tab+...`, `⌘K`) | Moderate (`⌘K`) | Low (Mouse-driven visual UI) |

---

## 5. Navigation Scope Taxonomy

From this empirical research, a definitive **8-tier scope model** emerges for enterprise productivity platforms. Every capability in Orynqo must map to exactly one primary scope:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      ENTERPRISE NAVIGATION SCOPES                      │
├───────────────────────┬────────────────────────────────────────────────┤
│ Scope Level           │ Definition & Responsibilities                  │
├───────────────────────┼────────────────────────────────────────────────┤
│ 1. GLOBAL / PRODUCT   │ Universal utilities accessible from any surface│
│    SCOPE              │ (Omnisearch ⌘K, Quick Create 'c', User Profile,│
│                       │ Organization Switcher, Keyboard Help '?').     │
├───────────────────────┼────────────────────────────────────────────────┤
│ 2. PERSONAL WORK      │ The user's individual cockpit: triage queues,  │
│    SCOPE              │ assigned tasks, draft documents, personal saved│
│                       │ views, starred favorites, and activity alerts. │
├───────────────────────┼────────────────────────────────────────────────┤
│ 3. STRATEGIC PLANNING │ Cross-team, multi-quarter strategic alignment: │
│    SCOPE              │ Initiatives, company roadmaps, portfolio       │
│                       │ health rollups, high-level milestone dates.    │
├───────────────────────┼────────────────────────────────────────────────┤
│ 4. TEAM SCOPE         │ The collaborative execution squad: team cycles,│
│    (Primary Anchor)   │ team backlog, triage stream, team metrics,     │
│                       │ and team-owned projects.                       │
├───────────────────────┼────────────────────────────────────────────────┤
│ 5. PROJECT SCOPE      │ Bounded initiatives with a defined deliverable,│
│    (Work Container)   │ lifecycle status, milestones, associated specs,│
│                       │ and cross-functional contributors.             │
├───────────────────────┼────────────────────────────────────────────────┤
│ 6. KNOWLEDGE SCOPE    │ Structured living documents, PRDs, technical   │
│    (Living Specs)     │ specifications, RFCs, engineering playbooks,   │
│                       │ and bi-directionally linked spec tables.       │
├───────────────────────┼────────────────────────────────────────────────┤
│ 7. SAVED VIEWS &      │ Multi-dimensional filter queries projecting    │
│    QUERY SCOPE        │ work items across teams/projects for custom    │
│                       │ workflows (e.g. "Release 4.2 Blockers").      │
├───────────────────────┼────────────────────────────────────────────────┤
│ 8. ADMINISTRATIVE /   │ Governance, security, identity (SSO/SCIM),     │
│    GOVERNANCE SCOPE   │ RBAC permissions, audit logs, billing, and     │
│                       │ tenant-wide integrations.                      │
└───────────────────────┴────────────────────────────────────────────────┘
```

---

## 6. Global vs. Contextual Navigation (The Sidebar Contract)

A fatal flaw in many SaaS prototypes is treating **view projections** (like Table, Kanban, Timeline, Workload) as global sidebar links. 

### The Foundational Rule: Resource vs. View Projection
- **A Resource** is a persistent domain entity that has identity, lifecycle, members, and state (e.g., an `Organization`, a `Team`, a `Project`, a `Cycle`, a `Living Spec Document`).
- **A View / Projection** is a mathematical transformation or presentation lens over a set of resources (e.g., `Table View`, `Kanban Board`, `Timeline/Gantt`, `Workload Meter`, `Calendar`).

#### Analytical Finding:
Across Linear, Asana, ClickUp, and GitHub Projects:
- **Views DO NOT belong in the persistent sidebar** as static destinations.
- When "Board" or "Timeline" is placed in the sidebar, users become confused: *"Whose board is this? Is it my team's board? All teams? A specific project?"*
- **The Correct Pattern:** The sidebar navigates to the **Resource** (e.g., `Core Platform > Cycle 42` or `Project > Mobile App v2`). The **Content Header** provides horizontal segmented controls or tabs to toggle the projection (`List` | `Board` | `Timeline` | `Workload`).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THE NAVIGATION CONTRACT                         │
├────────────────────────────────────────────────────────────────────────┤
│ SIDEBAR (Spatial / Resource Destination)                               │
│  ├── Where am I? (Team: Core Platform / Project: Offline Sync)         │
│  └── What resource am I inspecting? (Active Cycle 42)                  │
│                                                                        │
│ HEADER ACTION STRIP (Projection & Query Configuration)                 │
│  ├── How do I want to visualize it? [ Grid | Board | Timeline | Spec ] │
│  ├── How is it filtered? [ Status: Active ▼ ] [ Assignee: Me ▼ ]      │
│  └── What is the display density? [ Compact (28px) | Default (34px) ]  │
│                                                                        │
│ CANVAS (Execution Surface)                                             │
│  └── High-throughput data grid, drag-and-drop board, or living spec    │
│                                                                        │
│ INSPECTOR DRAWER (Contextual Entity Detail)                            │
│  └── Zero-navigation peek at selected work item properties & comments │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Scaling the Sidebar (From 5 to 5,000 Users)

The architecture must scale gracefully across four orders of magnitude:

| Organizational Scale | Entity Volume | Failure Mode of Flat Sidebar | Orynqo Scalable Solution |
| :--- | :--- | :--- | :--- |
| **Small Startup** (5–20 users) | 1–3 Teams, 10 Projects, 500 Issues | Sidebar feels empty if too compartmentalized. | Display active teams directly; compact default layout. |
| **Growth Company** (50–200 users) | 8–15 Teams, 50 Projects, 5,000 Issues | Vertical scrolling required; sidebar exceeds screen height. | Section collapsing (`Teams (12)`), user-curated `Favorites`, team auto-pinning for joined teams. |
| **Mid-Market Enterprise** (500–1,500 users) | 30–60 Teams, 300 Projects, 50,000 Issues | Unnavigable chaos; team list pushes settings off-screen. | **Team Membership Filter:** Users only see teams they have joined; other teams accessible via "Browse All Teams" directory modal or `⌘K`. |
| **Global Enterprise** (5,000+ users) | 200+ Teams, 2,000+ Projects, 500,000 Issues | Complete UI lockup if rendered into DOM; search latency. | Virtualized directory search; strict team joining; workspace-level RBAC partitioning; recent resources cache. |

### Scalability Principles for Orynqo:
1. **Never render all organizational projects in the sidebar.** Projects belong under their respective Teams or inside the `Initiatives` portfolio directory.
2. **Joined Teams vs. Workspace Directory:** In an organization with 150 teams, a user typically works closely with 1 to 4 teams. The sidebar must only show **"My Teams" (Joined Teams)** by default, with a fast switcher or browse dialog to discover others.
3. **Favorites as Primary Shortcut:** Power users navigate 80% of their day through 5–7 favorited items (their active cycle, 2 priority projects, 1 PRD spec, 1 triage queue). `Favorites` must be prominent and easily reordered.
4. **Search-Driven Escape Hatch:** Any project, spec, team, or work item not visible in the sidebar must be reachable in less than 3 keystrokes via `⌘K` Omnisearch.

---

## 8. Personal Work Architecture (The User's Daily Cockpit)

In enterprise platforms, users often feel lost amidst thousands of organization-wide issues. They need an uncluttered personal cockpit.

### Deconstructing Overlapping Personal Concepts:
- **Inbox:** A chronological, triageable stream of updates where the user was mentioned, assigned, assigned review, or explicitly subscribed. **Requires state transition:** Unread → Read → Archived.
- **My Issues / My Work:** A state-based task aggregator showing all open work items assigned to the current user across all teams and projects. Sub-segmented into:
  - *Assigned to Me* (Actionable tasks)
  - *Created by Me* (Issues authored by user needing follow-up)
  - *Subscribed / Following* (Issues user is observing)
  - *Recently Activity* (Items user touched recently)
- **Home / Dashboard:** A high-level overview widget surface. Often redundant for technical power users who prefer jumping straight to `Inbox` or `My Issues`.
- **Drafts:** Unsaved Living Specs or work items created by the user before publishing to the team.

#### Recommendation for Orynqo:
Provide two dedicated, non-overlapping top-level personal items:
1. `Inbox` (with real-time unread badge count) — Triage-focused feed.
2. `My Work` — State-focused issue table with quick tabs (`Assigned` | `Created` | `Subscribed` | `Drafts`).
*Eliminate a generic "Home" card page to maximize information throughput.*

---

## 9. Team Architecture & Organizational Scaling

Teams are the fundamental execution unit in Orynqo.

### Team Navigation Contract
When a team is selected in the sidebar, what does it expand to?
- **Option 1: Deep Accordion Tree** (e.g. expanding Team exposes Backlog, Cycles, Projects, Specs, Triage, Settings in the sidebar).  
  *Failure Mode:* If a user is on 4 teams, 4 expanded accordions occupy 28 sidebar rows, creating severe vertical scrolling.
- **Option 2: Contextual Main Surface Header** (Sidebar shows only the Team name; clicking the team opens the Team Hub with tabs: `Active Cycle` | `Backlog` | `Projects` | `Living Specs` | `Triage` | `Members`).
- **Option 3: Hybrid Compact Flyout / Sub-list** (Sidebar shows Team with 2 primary high-frequency sub-links: `Active Cycle` and `Issues`; other resources live inside the Team page).

#### Recommendation for Orynqo:
Adopt the **Hybrid Compact Model (Option 3)**:
- In the sidebar, each joined team displays its name and, when expanded, reveals only its two core active cadences:
  - `Active Cycle` (Current 2-week sprint)
  - `All Issues` (Full team issue backlog & board)
- All secondary team resources (`Projects`, `Specs`, `Triage`, `Team Settings`) are accessible via tabs within the Team page header, keeping the sidebar lean.

---

## 10. Project Architecture & Navigation Lifecycle

Projects represent bounded, time-scoped goals with a specific deliverable (e.g., "SOC2 Compliance", "Dark Mode Migration", "iOS Offline Sync").

### Project Ownership & Placement:
- Projects can be owned by a single team (e.g. "Mobile Client") or be cross-functional across multiple teams.
- **Where Projects Live in Navigation:**
  1. Inside **Initiatives** (the strategic rollup view).
  2. Inside **Team Hubs** (projects owned by that team).
  3. Inside **Favorites** (for active projects pinned by the user).
  4. Via **⌘K Omnisearch** (instant search by project name or identifier).
- **Project Internal Surfaces (Contextual Tabs, NOT Sidebar Items):**
  - `Overview` (Description, owner, target date, milestone progress)
  - `Work Items` (The work grid/board projection for this project)
  - `Living Specs` (The PRDs and technical architecture documents binding to this project)
  - `Timeline` (Gantt chart of project milestones and dependencies)
  - `Activity` (Audit trail of changes, deployments, commits)

---

## 11. Strategic Planning & Portfolio Architecture

Enterprises fail when executive roadmaps are disconnected from daily engineering tickets.

### The Planning Hierarchy:
```
Initiatives (Strategic Multi-Month Themes, e.g. "Enterprise Scale 2026")
  └── Projects (Discrete Deliverables, e.g. "Single Sign-On SAML Integration")
        └── Milestones (Key check-points, e.g. "IdP Metadata Validation Complete")
              └── Work Items (Atomic issues, bugs, tasks)
```

#### Recommendation for Orynqo:
- Place a single top-level destination in the sidebar: **`Initiatives`**.
- Inside `Initiatives`, users can switch between:
  - **Roadmap Projection:** Timeline view of all company initiatives and constituent projects.
  - **Health / Portfolio Table:** Status rollups (On Track, At Risk, Delayed, Completed) with progress bars computed directly from completed work item points.
- This avoids fracturing the planning space into three separate confusing destinations ("Roadmaps", "Portfolios", "Goals").

---

## 12. Knowledge & Living Documentation Architecture

Orynqo's unique product differentiator is the **Living Spec**: technical product requirement documents directly bound to execution work items.

### Analyzing Competitor Knowledge Architectures:
- **Jira + Confluence:** Complete platform fracture. Confluence is a separate app with distinct navigation, permissions, and slow page loading. Specs drift from tickets immediately.
- **Linear Documents:** Lightweight markdown docs embedded within projects. Clean and fast, but lacks wiki hierarchy, enterprise knowledge bases, or rich bi-directional table sync.
- **Notion:** Documents are everything, but project lifecycle logic is shallow.
- **ClickUp Docs:** Centralized in "Docs Hub" or nested inside Lists. Powerful, but interface feels cluttered and disconnected from sprint velocity.

### Orynqo's Unified Document Model:
Documents in Orynqo must operate under a **Single Canonical Document Model** accessible from multiple spatial contexts:
1. **Global Knowledge (`Docs` in Sidebar):** Central repository for all organizational knowledge, architecture RFCs, engineering guidelines, and company handbooks.
2. **Project Specs (Contextual Tab in Project):** Living specs authored for a specific project.
3. **Team Specs (Contextual Tab in Team):** Team-specific documentation and onboarding runbooks.
4. **Personal Drafts (Under `My Work > Drafts`):** Unfinished specs visible only to the author.

*Regardless of where a doc is created, it supports living bi-directional table blocks linked to canonical work items.*

---

## 13. Inbox, Notifications & Triage Architecture

A major source of user frustration in Jira and ClickUp is notification spam. In contrast, Linear's Inbox is widely regarded as industry-leading.

### Deconstructing the Communication Architecture:
```
┌────────────────────────────────────────────────────────────────────────┐
│                   COMMUNICATION & TRIAGE TAXONOMY                      │
├────────────────────┬──────────────────┬────────────────────────────────┤
│ Stream             │ Audience         │ Workflow & Actionability       │
├────────────────────┼──────────────────┼────────────────────────────────┤
│ 1. INBOX           │ Personal         │ Action-required queue. Mentions,│
│                    │                  │ assignments, review requests.  │
│                    │                  │ Keyboard triage: Archive ('e'),│
│                    │                  │ Snooze ('z'), Open ('Enter').  │
├────────────────────┼──────────────────┼────────────────────────────────┤
│ 2. TRIAGE STREAM   │ Team-wide        │ Inbound unvetted issues from   │
│    (Team Queue)    │ (Team Leads/Eng) │ external users, Zendesk, Slack,│
│                    │                  │ or bug reports. Actions: Accept│
│                    │                  │ into backlog, Decline, Mark Dupe│
├────────────────────┼──────────────────┼────────────────────────────────┤
│ 3. ACTIVITY FEED   │ Contextual       │ Passive audit log on an issue, │
│    (Audit Log)     │ (Per Resource)   │ project, or spec. Shows history│
│                    │                  │ of property changes & commits. │
└────────────────────┴──────────────────┴────────────────────────────────┘
```

#### Recommendation for Orynqo:
- **`Inbox`** belongs permanently at the top of the sidebar with an unread badge counter.
- **`Team Triage`** belongs inside each respective Team as an operational intake queue.
- **`Activity`** is never a sidebar item; it lives in the Inspector drawer or project history tab.

---

## 14. Search & Command Architecture (`⌘K`)

In a keyboard-first system, the sidebar does not carry the burden of indexing every single entity.

### The Division of Labor Between Sidebar and Omnisearch:
- **The Sidebar** provides:
  - Spatial orientation (*"Where am I?"*).
  - Ambient awareness (unread inbox count, active cycle progress).
  - Rapid 1-click access to the top 10% most frequent daily contexts (My Work, Joined Teams, Starred Favorites).
- **Omnisearch (`⌘K`)** provides:
  - Instant navigation to the long tail of 10,000+ items (jumping directly to issue `OR-1082`, jumping to project "Billing V2", opening an archived PRD).
  - Executing system commands (*"Switch to Dark Theme"*, *"Create new team"*, *"Export data"*).
  - Switching views without touching the mouse.

---

## 15. Favorites, Recents & Pinning Taxonomy

### What Resource Types Can Be Favorited?
To prevent unstructured clutter, Orynqo should restrict favoriting to specific container resources:
-  **Supported for Favorites:**
  - Projects (e.g. `★ Mobile Client v2`)
  - Living Spec Documents (e.g. `★ PRD: Offline Sync Protocol`)
  - Saved Views (e.g. `★ P0 Urgent Blockers Across Org`)
  - Teams (e.g. `★ Core Platform`)
  - Cycles (e.g. `★ Cycle 42`)
- ❌ **Not Recommended for Favorites:**
  - Individual atomic work items (favoriting 50 single tickets turns the sidebar into an unmanageable mess; users should use `My Work` or custom `Saved Views` instead).

### Recents:
- Recents should **not** occupy permanent vertical space in the sidebar by default.
- Instead, recent resources should appear immediately inside the **`⌘K` Omnisearch modal** when opened with an empty query (Linear/Notion pattern).

---

## 16. Saved Views Architecture

Saved Views are custom, persistent query projections over the global work item graph.

### Saved View Scopes:
1. **Personal Views:** Created by a user for their private workflow (e.g. *"Issues I reviewed waiting for QA"*). Visible only to the user; can be pinned to their sidebar `Favorites`.
2. **Team Views:** Shared views standardizing team workflow (e.g. *"Core Platform Bugs"*, *"Cycle 42 Unestimated"*). Visible to all team members under the Team Hub.
3. **Workspace Views:** Cross-department views created by organization leads (e.g. *"Q4 Security Vulnerabilities"*). Accessible from the top-level `Views` directory.

---

## 17. Multi-Workspace & Multi-Organization Topology

Large enterprise customers (and agency consultants) operate across multiple isolated workspaces.

### Architectural Rules:
- The top of the sidebar features the **Active Organization Switcher**.
- Switching organizations completely re-scopes domain state, active teams, permissions, and caches.
- **Cross-Organization Leak Prevention:** Omnisearch, notifications, and keyboard navigation must be strictly partitioned to the active tenant domain for compliance (SOC2/HIPAA isolation).

---

## 18. Permission-Aware Navigation & RBAC Filtering

Enterprise users possess varying permission levels: `Guest`, `Member`, `Team Admin`, `Workspace Admin`, `Org Owner`.

### Navigation Rules:
- **No Dead Ends:** Never display a sidebar item that immediately displays a "Permission Denied (403)" error upon clicking. If a user has no access to a private project or team, that item must be omitted from their sidebar and search results.
- **Guest Experience:** Guests (e.g., external contractors or design partners) must have a sandboxed sidebar:
  - Personal tier: `Inbox` and `Assigned to Me`.
  - Content tier: Only the specific Projects or Living Specs explicitly shared with them.
  - Omitted: Team backlogs, Cycles, Initiatives, Administrative settings, and Member directories.

---

## 19. Enterprise Administration Architecture

A classic anti-pattern is crowding the standard sidebar with enterprise governance features.

### Navigation Partitioning:
- **Standard Sidebar:** Contains only daily productive workflows. The bottom features a compact gear icon: `Settings`.
- **Settings Environment:** Clicking `Settings` opens a dedicated full-page or split-pane settings workspace divided into:
  - **Account Settings:** Profile, Notifications, Personal API Tokens, Appearance.
  - **Workspace Settings:** Workspace Details, Teams, Members & Guests, Custom Fields, Workflows, Export.
  - **Enterprise Administration (Visible only to Org Admins):** SAML/SSO Authentication, SCIM Provisioning, Role & Permission Schemes, Forensic Audit Logs, Data Residency, Billing & Invoices.

---

## 20. Mobile & Small Screen Navigation Translation

Desktop is Orynqo's primary high-density productivity environment. However, the information architecture must gracefully adapt to smaller screens:

1. **Collapsible Left Drawer:** On mobile, the desktop sidebar transforms into an off-canvas drawer triggered by a top-left hamburger icon or edge swipe.
2. **Bottom Navigation Bar (The High-Frequency 4):**
   - `Inbox` (with badge counter)
   - `My Work` (Assigned issues)
   - `Search / ⌘K` (Global quick search)
   - `More` (Opens the full navigation drawer containing Teams, Initiatives, and Settings)
3. **Inspector Transformation:** The desktop right-hand Inspector drawer transforms into a full-screen stacked modal view on mobile.

---

## 21. Current Orynqo Sidebar Audit

We audit the current prototype sidebar in [`src/layouts/Sidebar/Sidebar.jsx`](file:///d:/Full_Stack_Apps/Orynqo-web/src/layouts/Sidebar/Sidebar.jsx) against this research:

| Current Prototype Item | Current Location | Research Finding & Evaluation | Recommended Action in IA-02 |
| :--- | :--- | :--- | :--- |
| **Workspace Header (Orynqo Corp)** | Top | Valid pattern. Needs dropdown trigger for future org switching & workspace settings. | **KEEP & ENHANCE** |
| **Collapse Button (⌘[)** | Top right of header | Essential for high-density focus mode. | **KEEP** |
| **Search & Commands (⌘K)** | Top link in nav | Universal access point. | **KEEP** |
| **Inbox (with unread badge)** | Global nav section | Critical personal cockpit item. | **KEEP** |
| **My Issues** | Global nav section | Fundamental personal execution hub. | **RENAME to `My Work`** (To accommodate tasks, specs, and reviews beyond simple issues) |
| **Teams Section (`Core Platform`, `Mobile Client`, `Web Studio`)** | Middle section | Valid core organizational unit. Currently renders flat without collapsible cycles/issues. | **REGROUP & ENHANCE** (Make collapsible with joined team filtering) |
| **Living Specs (`PRD: Offline Sync`)** | Bottom section | Hardcoded single document in sidebar. Does not scale when an org has 200 specs. | **REGROUP & RESTRUCTURE** (Replace with top-level `Docs` knowledge hub + team/project contextual specs) |
| **Current User Avatar & Name** | Bottom bar | Standard profile anchor. | **KEEP** |
| **Theme Toggle (Sun/Moon)** | Bottom bar | Useful prototype utility. In production, belongs in Profile / Command Palette to avoid visual clutter. | **MOVE TO SETTINGS / COMMAND PALETTE** |
| **Shortcuts Modal Trigger (?)** | Bottom bar | Useful desktop helper. | **KEEP (or integrate into Help menu)** |

---

## 22. Comprehensive Capability Inventory

Synthesizing all research findings, we establish the full capability taxonomy for Orynqo:

| Domain | Capability | Primary Entity | Primary User | Scope | Nav Requirement | Page / Surface Type |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Personal** | Triage Inbox | Notification | All Users | Personal | Persistent Sidebar | Primary Page |
| **Personal** | My Work (Assigned/Created) | Work Item | All Users | Personal | Persistent Sidebar | Primary Page |
| **Personal** | Personal Drafts | Spec / Item | All Users | Personal | Under My Work | View Projection |
| **Personal** | Favorites / Starred | Container Pointer | All Users | Personal | Persistent Sidebar Section | Dynamic List |
| **Strategic** | Initiatives & Roadmaps | Initiative | Leads, PMs, Execs | Workspace | Persistent Sidebar | Primary Page (Timeline / Rollup) |
| **Execution** | Joined Teams | Team | Team Members | Team | Persistent Sidebar Section | Collapsible Team Section |
| **Execution** | Team Active Cycle | Cycle (Sprint) | Team Members | Team | Under Active Team | Contextual Tab / Sub-link |
| **Execution** | Team Backlog & All Issues | Work Item Graph | Team Members | Team | Under Active Team | Contextual Tab / Sub-link |
| **Execution** | Team Triage Queue | Inbound Item | Team Leads/Engineers | Team | Inside Team Hub | Contextual Tab |
| **Execution** | Projects Directory | Project | All Users | Workspace / Team | Inside Team / Initiatives | Resource Directory |
| **Execution** | Project Execution Hub | Project | Contributors | Project | Via Team / Fav / ⌘K | Resource Page (Tabs: Grid/Board/Gantt) |
| **Knowledge** | Living Specs / PRD Editor | Living Document | Product, Eng, Design | Multi-scope (Team/Proj) | Persistent Sidebar (`Docs`) | Resource Page (Interactive Canvas) |
| **Knowledge** | Bi-directional Linked Tables | Spec-Item Binding | Product & Eng | Document | Inside Living Spec | Composite Component |
| **Queries** | Workspace Saved Views | Saved View Query | All Users | Workspace / Team | Persistent Sidebar (`Views`) | Dynamic Directory |
| **Utilities** | Omnisearch & Command Palette | System Action / Item | Power Users | Global | `⌘K` Keyboard Shortcut | Global Overlay Modal |
| **Utilities** | Quick Create Item | Work Item | All Users | Global | `c` Keyboard Shortcut | Floating Dialog |
| **Utilities** | Item Inspector Drawer | Work Item | All Users | Contextual | Click / `Enter` on row | Contextual Right Drawer |
| **Governance** | Workspace & Team Settings | Config Entity | Workspace Admins | Workspace | Bottom Sidebar Gear | Dedicated Settings Workspace |
| **Governance** | Enterprise Administration | Tenant Config | Org Admins | Organization | Settings > Administration | Dedicated Admin Console |

---

## 23. Sidebar Candidate Information Architecture Models

To explore the design space thoroughly, we formulate **three meaningfully distinct architectural candidates**.

---

### Candidate Model A: Team-Centric Architecture
*Inspired by: Linear, Plane (Accordion Mode)*

#### Mental Model:
*"Work belongs to teams. I navigate to my team to do my work, and use personal views for my cross-team responsibilities."*

#### Structural Hierarchy:
```
Organization: Orynqo Corp
├── [Search & Commands ⌘K]
├── Inbox (3)
├── My Work (12)
├── Favorites
│   ├── ★ Mobile App v2 (Project)
│   └── ★ Core Cycle 42 (Cycle)
├── Initiatives (Roadmaps)
├── Views (Saved queries)
└── Teams
    ├── Core Platform [Active]
    │   ├── Active Cycle 42
    │   ├── Issues (All)
    │   ├── Projects
    │   └── Living Specs
    ├── Mobile Client
    │   ├── Active Cycle 18
    │   └── Issues (All)
    └── Web Studio
        ├── Active Cycle 09
        └── Issues (All)
└── Settings
```

#### Evaluation:
- **Advantages:** Highly intuitive for functional engineering organizations where members belong primarily to one squad. Strong daily orientation around sprint/cycle cadences.
- **Disadvantages:** Vertical sidebar sprawl if a user joins 6+ teams. Cross-functional projects that touch multiple teams can feel artificially partitioned.
- **Scalability:** High, provided the sidebar only displays **Joined Teams** (with a "Browse all teams" button).

---

### Candidate Model B: Domain / Resource-Centric Architecture
*Inspired by: Jira Cloud, Asana, Monday.com*

#### Mental Model:
*"The product is organized by object types: Projects, Documents, Teams, Dashboards, and Reports."*

#### Structural Hierarchy:
```
Organization: Orynqo Corp
├── [Search & Commands ⌘K]
├── Home / Cockpit
├── Inbox (3)
├── My Work (12)
├── Favorites
├── Projects (All accessible projects across org)
├── Living Specs (All docs, PRDs, architecture RFCs)
├── Initiatives (High-level roadmaps & portfolios)
├── Teams (Team directories & workspaces)
├── Saved Views (Cross-project queries)
├── Analytics & Dashboards
└── Settings
```

#### Evaluation:
- **Advantages:** Very clear top-level categorization for new users. Easy for leadership to find "all documents" or "all projects" without knowing which team owns them.
- **Disadvantages:** Destroys team cohesion. To find their sprint board, an engineer must click "Projects" > search for their project > click "Sprint". Separates Living Specs from the team work that implements them.
- **Scalability:** Requires heavy search/filtering on every sub-page because top-level lists (e.g. `Projects`) contain hundreds of items.

---

### Candidate Model C: Hybrid Contextual Architecture (Recommended Baseline)
*Synthesized Best-of-Breed: Linear efficiency + Notion knowledge unity + Enterprise RBAC*

#### Mental Model:
*"My personal focus is at the top. My active teams anchor my daily execution. High-level strategy (Initiatives) and shared knowledge (Docs) sit as first-class workspace citizens. Deeper details live in contextual tabs, not sidebar trees."*

#### Structural Hierarchy:
```
Organization Header: Orynqo Corp [▼]
│
├── [ Quick Find & Commands ⌘K ]
│
├── PERSONAL
│   ├── Inbox [Badge: 2]
│   └── My Work [Badge: 14]
│
├── FAVORITES (Collapsible)
│   ├── ★ PRD: Offline Sync Protocol
│   ├── ★ Core Platform: Cycle 42
│   └── ★ Urgent Blockers (View)
│
├── WORKSPACE (Strategic & Shared)
│   ├── Initiatives (Roadmaps & Portfolio Health)
│   ├── Living Specs (Company Knowledge, RFCs, PRDs)
│   └── Views (Global & Team Saved Views)
│
├── TEAMS (Joined Squads — Collapsible)
│   ├── Core Platform [Selected]
│   │   ├── Active Cycle 42
│   │   └── All Work Items
│   ├── Mobile Client
│   │   ├── Active Cycle 18
│   │   └── All Work Items
│   └── [+ Join or Create Team...]
│
└── BOTTOM UTILITY RAIL
    ├── User Profile (Name, Status, Menu)
    ├── Help & Keyboard Shortcuts (?)
    └── Settings (Workspace & Org Administration)
```

#### Evaluation:
- **Advantages:**
  - Maximum day-to-day focus: `Inbox` and `My Work` are always top-left.
  - Clean separation: `Initiatives` and `Living Specs` have dedicated space without cluttering team sprint work.
  - Predictable sidebar height: Teams only show 2 high-frequency sub-links (`Active Cycle`, `All Work Items`); secondary team surfaces (`Projects`, `Specs`, `Triage`) are navigated via clean tabs within the page canvas.
  - Solves the Living Spec problem: Specs are accessible globally under `Living Specs`, but can also be opened directly within the context of a project or team.
- **Enterprise Scalability:** Seamlessly handles 10,000 users. In large deployments, users only join their 2–4 relevant teams; enterprise admins access full directories via the Workspace headers.

---

## 24. Proposed Orynqo Information Architecture Direction

> [!IMPORTANT]
> **PROPOSAL FOR HUMAN REVIEW:** The following architecture is submitted as the proposed baseline for review. It will NOT be implemented in code until approved.

```
┌────────────────────────────────────────────────────────────────────────┐
│             PROPOSED ORYNQO SIDEBAR INFORMATION ARCHITECTURE           │
├────────────────────────────────────────────────────────────────────────┤
│ [Org Switcher] Orynqo Technologies [▼]                   [Collapse ⌘[] │
├────────────────────────────────────────────────────────────────────────┤
│ 🔍 Search & Commands...                                            ⌘K  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ ▼ PERSONAL                                                             │
│   📥 Inbox                                                         [2] │
│   ✅ My Work                                                      [14] │
│                                                                        │
│ ▼ FAVORITES                                                            │
│   📄 PRD: Offline Sync Engine                                          │
│   ⚡ Core Platform: Cycle 42                                           │
│   🎯 Q4 Cloud Migration                                                │
│                                                                        │
│ ▼ WORKSPACE                                                            │
│   🗺️ Initiatives                                                       │
│   📚 Living Specs                                                      │
│   📊 Views                                                             │
│                                                                        │
│ ▼ TEAMS (3 Joined)                                                     │
│   ▼ 🌐 Core Platform                                                   │
│       • Active Cycle 42                                                │
│       • All Work Items                                                 │
│   ▶ 📱 Mobile Client                                                   │
│   ▶ 🎨 Web Studio                                                      │
│     + Browse all teams...                                              │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ [Avatar] Younas Khan (Lead Architect)               [?] [⚙️ Settings]  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 25. Sidebar Behavioral Specification

To ensure high-density usability without visual noise, the sidebar must adhere to these behavioral rules:

1. **Section Collapse Memory:**
   - Every uppercase section header (`PERSONAL`, `FAVORITES`, `WORKSPACE`, `TEAMS`) has a disclosure triangle.
   - Collapse states are persisted per user in client local storage.
2. **Joined Teams Display Threshold:**
   - The `TEAMS` section displays only teams where `team.isMember === true`.
   - If a user belongs to more than 6 teams, teams beyond the 5th most recently visited collapse under a `"More teams (X)..."` flyout.
   - A persistent `"+ Browse all teams..."` trigger allows discovery of public workspace teams.
3. **Active Link Indicator:**
   - The currently viewed resource highlights with `var(--bg-surface-selected)` and a subtle 2px accent indicator on the left border.
4. **Collapsed Rail Mode (`⌘[`):**
   - In collapsed mode (52px width), section text labels hide.
   - Top icons (`Search`, `Inbox`, `My Work`, `Initiatives`, `Docs`, `Teams`) remain centered.
   - Hovering over an icon in collapsed mode displays an instant tooltip / floating flyout menu preserving access without expanding the full bar.
5. **Badge Semantics:**
   - `Inbox` badge displays unread count with high-contrast accent (`var(--primary-base)`).
   - `My Work` badge displays overdue / urgent item count in subtle muted style.
6. **Keyboard Navigation:**
   - Arrow keys (`ArrowDown` / `ArrowUp`) navigate sidebar links when sidebar focus is active.
   - Quick jumps: `G then I` (Inbox), `G then M` (My Work), `G then S` (Living Specs), `G then T` (Teams).

---

## 26. Preliminary Page & Surface Registry

As input to Phase `IA-03 — Complete Page & Surface Registry`, we classify all required application surfaces:

| Surface Name | Classification | Primary Responsibility |
| :--- | :--- | :--- |
| **Inbox View** | PRIMARY PAGE | Two-pane triage feed: notification list on left, item preview on right. |
| **My Work View** | PRIMARY PAGE | Tabbed personal task cockpit (`Assigned`, `Created`, `Subscribed`, `Drafts`). |
| **Initiatives Portfolio** | PRIMARY PAGE | Multi-project strategic roadmap timeline and health rollups. |
| **Living Specs Hub** | RESOURCE PAGE | Workspace knowledge directory, RFC repository, document template library. |
| **Living Spec Canvas** | RESOURCE PAGE | Full-canvas rich editor with bi-directional work item embed blocks. |
| **Team Hub** | RESOURCE PAGE | Squad landing page with tabs: `Cycle`, `Backlog`, `Projects`, `Specs`, `Triage`. |
| **Project Workspace** | RESOURCE PAGE | Bounded project execution canvas with tabs: `Overview`, `Work Items`, `Specs`, `Timeline`. |
| **Data Grid Projection** | VIEW / PROJECTION | 28px/34px high-density virtualized table with inline edits. |
| **Kanban Projection** | VIEW / PROJECTION | Drag-and-drop workflow status columns. |
| **Timeline Projection** | VIEW / PROJECTION | Interactive Gantt dependency chart. |
| **Workload Projection** | VIEW / PROJECTION | Capacity allocation meter per team member per cycle. |
| **Account & Workspace Settings** | SETTINGS PAGE | User profile, preferences, notifications, workspace member directory. |
| **Enterprise Administration** | ADMIN PAGE | SAML/SCIM, RBAC permissions matrix, audit logs, billing. |
| **Command Palette (Omnisearch)** | OVERLAY | Global fuzzy finder and command execution modal (`⌘K`). |
| **Quick Create Modal** | OVERLAY | Fast single-work-item creation modal with keyboard submit (`⌘+Enter`). |
| **Item Inspector Drawer** | DRAWER / INSPECTOR | 400px–600px sliding right pane showing work item properties, specs, and comments. |

---

## 27. Feature Bloat Protection Guardrails

To prevent Orynqo from degenerating into a bloated, slow monolith like ClickUp or Jira, every future navigation addition must pass this **4-Question Gate**:

1. **Is it a true domain Resource or merely a View Projection?**  
   *If it is a projection (like a Calendar or Gantt view), it must NOT be granted a sidebar slot. It belongs in a header segmented control.*
2. **Does it solve a routine daily workflow or an occasional task?**  
   *If used less than once a day (e.g. Export, Audit Log, User Invitations), it belongs in Settings or Command Palette (`⌘K`), never in the primary sidebar.*
3. **Can it be reached in under 2 seconds via Omnisearch?**  
   *If search/command discovery is faster and less disruptive, omit it from visible persistent navigation.*
4. **Does it duplicate an existing concept?**  
   *We do not need separate destinations for "Roadmaps", "Portfolios", and "Goals". They unify under `Initiatives`.*

---

## 28. Evidence Log & Research Sources

| Platform | Official Source & Access Date | Verified Capabilities & Observations |
| :--- | :--- | :--- |
| **Linear** | [linear.app/docs](https://linear.app/docs) (Accessed: Q1 2026) | Verified Initiatives replacing Roadmaps; verified sidebar customization; verified `G then ...` keyboard shortcuts; verified team cycles and triage stream. |
| **Jira Cloud** | [support.atlassian.com/jira-software-cloud](https://support.atlassian.com) (Accessed: Q1 2026) | Verified dual-tier product vs. project navigation; verified contextual sidebar color coding (blue vs gray); verified Plans / Advanced Roadmaps. |
| **Notion** | [notion.com/help](https://notion.com/help) (Accessed: Q1 2026) | Verified Teamspaces architecture; verified Favorites, Shared, and Private access tiers; verified page-as-database model. |
| **Asana** | [asana.com/guide](https://asana.com/guide) (Accessed: Q1 2026) | Verified Portfolios and Goals separate from My Tasks; verified multi-homed project tasks; verified horizontal tab bar for views. |
| **ClickUp** | [help.clickup.com](https://help.clickup.com) (Accessed: Q1 2026) | Verified ClickUp 3.0 hierarchy (Workspace > Space > Folder > List > Task); verified Hubs (Docs Hub, Dashboards Hub) introduced to mitigate deep tree collapse. |
| **Plane** | [docs.plane.so](https://docs.plane.so) (Accessed: Q1 2026) | Verified accordion vs horizontal project tab navigation; verified limitation of visible projects on sidebar. |
| **Monday.com** | [support.monday.com](https://support.monday.com) (Accessed: Q1 2026) | Verified workspace switcher dropdown at top of sidebar; verified My Work centralized aggregation. |

---

## 29. Open Architectural Questions for Human Review

Before proceeding to Phase `IA-02 — Orynqo Sidebar Architecture & Navigation Contract`, the following architectural decisions require human alignment:

1. **Living Specs Placement:**
   - *Option A (Recommended):* Keep `Living Specs` as a top-level workspace destination in the sidebar (like Linear Initiatives or Notion Wiki), while allowing specs to also be linked inside projects.
   - *Option B:* Only allow specs to exist inside specific Projects or Teams (no global Docs link in the sidebar).
2. **Team Expansion Depth:**
   - *Option A (Recommended):* Expanding a team in the sidebar shows only `Active Cycle` and `All Work Items`. Other team resources (`Projects`, `Specs`, `Triage`) are tabs on the Team page.
   - *Option B:* Allow full accordion nesting in the sidebar (Team > Cycles, Backlog, Projects, Specs, Triage).
3. **Unified Planning Terminology:**
   - Confirm adopting **`Initiatives`** as the single term uniting roadmaps, strategic portfolios, and multi-project milestones.

---

## 30. Recommended Next Step: IA-02

Upon Human Review approval of this research report:
- **Proceed to Phase `IA-02 — Orynqo Sidebar Architecture & Navigation Contract`:**
  - Formalize the exact semantic token schema for navigation states.
  - Draft the explicit props interface and event contracts for `Sidebar.jsx`.
  - Specify the exact state machine for sidebar expansion, team switching, and keyboard focus.
  - Maintain the freeze on visual changes and Golden Flow 01 until IA-02 and IA-03 are completed.
