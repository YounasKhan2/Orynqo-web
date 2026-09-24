# Orynqo Platform — Sidebar Architecture & Navigation Contract (Phase IA-02)

**Status:** Proposed Architecture Contract (Phase IA-02 — Ready for Human Review)  
**Governing Methodology:** `antigravity-enterprise-product-design`  
**Preceding Phase:** `IA-01 Competitive Navigation Research (APPROVED with IA-02 Refinements)`  
**Current Phase:** `IA-02 Sidebar Architecture & Navigation Contract`  
**Subsequent Phase:** `IA-03 Complete Page & Surface Registry (Blocked until IA-02 Approval)`  
**Implementation Freeze:** STRICTLY ENFORCED (Documentation-only deliverable; no UI/page implementation)  

---

## 1. Executive Summary & Core Navigation Principle

Phase `IA-02` transitions the competitive research gathered in `IA-01` into Orynqo's official, formal navigation architecture and interaction contract.

### The Frozen Core Navigation Rule: Resource vs. View Projection
Orynqo explicitly and permanently decouples **Resources** from **View Projections**:

- **A RESOURCE** is a persistent domain entity that possesses canonical identity, lifecycle state, access permissions, members, and relational associations.  
  *Examples:* `Organization`, `Workspace`, `Team`, `Project`, `Cycle`, `Initiative`, `Document (Doc)`, `Saved View`, `Work Item`.
- **A VIEW / PROJECTION** is a mathematical transformation, filtering lens, or visual presentation over a collection of resources.  
  *Examples:* `List`, `Table / Data Grid`, `Kanban Board`, `Timeline / Gantt`, `Calendar`, `Workload Capacity Meter`.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ORYNQO SPATIAL MENTAL MODEL                     │
├────────────────────────────────────────────────────────────────────────┤
│ 1. SIDEBAR              = WHERE am I?                                  │
│                          (Scope, Organization, Team, or Container)     │
├────────────────────────────────────────────────────────────────────────┤
│ 2. RESOURCE NAVIGATION  = WHAT aspect of the resource am I viewing?    │
│                          (Contextual Tabs: Overview, Work, Docs, etc.) │
├────────────────────────────────────────────────────────────────────────┤
│ 3. PROJECTION CONTROLS  = HOW is the data visualized and arranged?     │
│                          (Segmented Switcher: Grid, Board, Timeline)   │
├────────────────────────────────────────────────────────────────────────┤
│ 4. INSPECTOR DRAWER     = DETAIL without losing execution context      │
│                          (Slide-over properties, specs, discussion)    │
├────────────────────────────────────────────────────────────────────────┤
│ 5. COMMAND PALETTE      = LONG-TAIL discovery, search & global actions │
│                          (Instant ⌘K keyboard navigation)              │
└────────────────────────────────────────────────────────────────────────┘
```

> **Formal Architectural Rule:** The persistent global sidebar **never** hosts view projections (e.g. static "Board" or "Timeline" sidebar items). The sidebar routes users strictly to **Scopes and Resources**. All projection switching is housed contextually inside the resource's header action strip.

---

## 2. Working Sidebar Model & Structural Hierarchy

```
ORYNQO SHELL
├── Organization / Workspace Switcher
├── [ 🔍 Search & Commands... ⌘K ]
│
├── PERSONAL
│   ├── Inbox                        # Personal actionable triage queue
│   └── My Work                      # Personal work aggregator (Assigned, Created, Subscribed)
│
├── FAVORITES (Collapsible)
│   └── [Dynamic User Shortcuts]    # Pinned Projects, Docs, Cycles, Views, Teams
│
├── WORKSPACE (Strategic & Shared)
│   ├── Initiatives                  # Strategic themes, roadmaps & portfolio rollups
│   ├── Docs                         # Canonical document system (Specs, RFCs, Runbooks)
│   └── Views                        # Cross-team & workspace saved queries
│
├── TEAMS (Joined Squads — Collapsible)
│   ├── Core Platform [Team A]
│   │   ├── Current Cycle            # Conditional: shown only if team has Cycles capability
│   │   └── Work                     # Canonical team work grid/board
│   ├── Mobile Client [Team B]
│   │   └── Work                     # Continuous workflow team (Cycles disabled)
│   └── [+ Browse all teams...]      # Discovery modal for unjoined workspace teams
│
└── BOTTOM UTILITY AREA
    ├── User Profile (Identity, Status, Account)
    ├── Help & Keyboard Shortcuts (?)
    └── Settings (Workspace Configuration & Enterprise Admin Console)
```

---

## 3. Global Knowledge Navigation: The `Docs` Terminology Decision

In `IA-01`, the working label was evaluated as `Living Specs`. For `IA-02`, we officially freeze **`Docs`** as the top-level global navigation label.

### Architectural Rationale:
1. **Scope Constriction Avoidance:** While the **Living Spec** (product specification bi-directionally bound to work item execution tables) is Orynqo's marquee innovation, an enterprise platform requires a comprehensive knowledge repository for many document types that are not formal specs.
2. **Canonical Document System:** All documents share the exact same underlying entity model, block editor, version history, comment threads, and permission infrastructure.

```
Docs (Global Navigation Hub)
 └── Canonical Document Entity System
      ├── Living Specs (PRDs with live, two-way linked Work Item tables)
      ├── Architecture RFCs (Technical design proposals)
      ├── Engineering Runbooks & Playbooks (Operational checklists)
      ├── Company & Department Knowledge (Handbooks, guidelines, wikis)
      └── Project Documentation & Briefs
```

*Living Spec functionality is an inherent, powerful document capability (activated via embedded Work Item blocks), not a separate siloed application.*

---

## 4. Capability-Aware Team Architecture

A critical flaw in rigid platforms (such as basic Jira configurations) is forcing every team to adopt sprint cycles. Engineering teams operate in sprints/cycles; design teams often work in continuous flow; operations teams manage intake queues.

### The Team Capability Contract
Teams declare their active capabilities via configuration. The sidebar and team page dynamically adapt:

```typescript
interface TeamCapabilities {
  cycles: boolean;       // Time-boxed sprint iterations (e.g. 2-week cadences)
  triage: boolean;       // Inbound intake queue for unvetted bugs/requests
  projects: boolean;     // Team-level project ownership
  docs: boolean;         // Team-specific living specs and runbooks
  automations: boolean;  // Workflow state machine transition rules
}
```

### Partitioning Team Surfaces:
To prevent sidebar vertical bloat, team navigation is partitioned into three distinct tiers:

1. **Sidebar Quick Destinations (Maximum 2 sub-links per team):**
   - `Current Cycle` (*Conditional*: Rendered only if `team.capabilities.cycles === true` and an active cycle exists).
   - `Work` (*Universal*: Direct access to all team work items).
2. **Team Resource Tabs (Contextual to the Team page canvas):**
   - `Overview` | `Work` | `Cycles` | `Projects` | `Docs` | `Triage` | `Members`.
3. **Team Settings / Capabilities (Administrative):**
   - Accessed via a gear icon within the Team header, allowing Team Admins to enable/disable capabilities.

---

## 5. Team Resource Navigation Specification

When a user selects a team, the primary page canvas renders the **Team Resource Hub**.

### Team Contextual Header & Tab Architecture:
```
[Team Avatar] Core Platform (ENG)        [Join/Leave] [Team Settings ⚙️]
Description: Core infrastructure, identity, and database synchronization engine.

Tabs: [ Overview ] [ Work ] [ Cycles* ] [ Projects ] [ Docs ] [ Triage* ] [ Members ]
```
*\*Cycles and Triage tabs appear conditionally based on team capabilities.*

### Tab Responsibility Matrix:

| Tab Name | Core / Optional | Visibility & Permissions | Responsibility |
| :--- | :--- | :--- | :--- |
| **Overview** | Core | All team viewers | Team mission, key metrics, lead assignees, active initiatives. |
| **Work** | Core | All team viewers | Canonical issue/task execution grid with projection toggles (Grid/Board). |
| **Cycles** | **Optional** (`capabilities.cycles`) | All team viewers | Active cycle, sprint burndown, backlog, cycle history. |
| **Projects** | Core | All team viewers | Directory of projects owned by or collaborated on by this team. |
| **Docs** | Core | All team viewers | Living specs, RFCs, and team runbooks. |
| **Triage** | **Optional** (`capabilities.triage`) | Members & Admins (Hidden for external Guests) | Intake inbox for unvetted tickets; fast Accept / Reject / Escalate triage. |
| **Members** | Core | Members & Admins (Read-only for Guests) | Team roster, roles (Lead, Contributor), capacity points. |

### Tab Overflow & Responsive Behavior:
- Tabs are ordered strictly as: `Overview` → `Work` → `Cycles` → `Projects` → `Docs` → `Triage` → `Members`.
- If viewport width constraints cause clipping, secondary tabs collapse into a contextual `More (•••) ▼` dropdown menu.

---

## 6. Project Resource Navigation Specification

Projects are bounded initiatives with a clear target outcome, status, owner, and date range.

### Project Contextual Header & Tab Architecture:
```
[Project Icon] Mobile Client v2.0 (Active)    [Owner: Sarah T.] [Target: Q4 2026]
Initiative: Mobile Transformation 2026

Tabs: [ Overview ] [ Work ] [ Docs ] [ Milestones ] [ Activity ]
Inside Work: [ List | Table | Board | Timeline* | Workload* ]
```

### Tab Responsibility Matrix:

| Tab Name | Purpose | Notes |
| :--- | :--- | :--- |
| **Overview** | Project brief, target date, completion percentage, key risks. | Features embedded status summary and live health metric. |
| **Work** | Primary work item execution surface. | Supports standard projections: `List`, `Table`, `Board`. `Timeline` is active if items have target dates; `Workload` is active if items have point estimates. |
| **Docs** | Project specifications, UX briefs, technical RFCs. | All project-linked Living Specs rendered in one place. |
| **Milestones** | Key checkpoint dates and release gates. | Progress bars automatically computed from child work items. |
| **Activity** | Forensic change history and audit trail. | Property mutations, branch links, commit references. |

### Project Lifecycle States & Navigation Degradation:
- **Active Projects:** Full write/edit permissions.
- **Completed Projects:** Labeled with a subtle badge; retained in history.
- **Archived Projects:** Removed from default directories; accessible via search or explicit "Include Archived" toggle; rendered in read-only banner mode.

---

## 7. Project Discovery Without Sidebar Sprawl

> [!IMPORTANT]
> **Anti-Pattern Prevention:** Projects must **never** be rendered as an unbounded, flat list in the global sidebar. In an enterprise with 2,000 projects, this produces navigation paralysis.

### The 4 Project Discovery Vectors:
1. **Contextual via Teams:** Browse projects owned by a specific team on the Team page (`Team > Projects`).
2. **Strategic via Initiatives:** Browse projects rolling up into strategic themes on the Initiatives page (`Initiatives > Project Rollup`).
3. **Personal via Favorites:** Pin active, high-priority projects directly to `FAVORITES` in the sidebar.
4. **Instant via Omnisearch (`⌘K`):** Type the project title or key to jump directly into its workspace in <100ms.

### Workspace-Level Projects Directory
- Orynqo provides a comprehensive **Projects Directory** surface (`/:workspace/projects`).
- **Navigation Placement:** Accessible via a subtle link in `Initiatives`, via `⌘K`, or through an explicit "Browse all projects" trigger—**not** a permanent default sidebar item.
- **Directory Facets:** Filters by `Status` (Active, Completed, Archived), `Lead`, `Team`, `Health` (On Track, At Risk), and `Target Quarter`.

---

## 8. Strategic Planning: Initiatives, Roadmaps, and Future Goals

### The Planning Hierarchy:
```
[FUTURE TIER] Goal / Objective (OKRs, e.g. "Expand Enterprise ARR by 40%")
     ↓ supported by
[CURRENT TIER] Initiative (Strategic Themes, e.g. "SOC2 Type II Certification")
     ↓ coordinates
[EXECUTION TIER] Projects (Deliverables, e.g. "Audit Log Engine", "SAML SSO")
     ↓ contains
Work Items (Issues, Tasks, PRDs, Milestones)
```

### The Role of `Initiatives`:
- `Initiatives` is frozen as the working strategic planning label in the global sidebar.
- Inside `Initiatives`, users toggle between:
  - **Portfolio List:** Table of all active initiatives with aggregate progress, owners, and risk status.
  - **Roadmap:** Multi-quarter Gantt projection displaying cross-project milestones and dependencies.
  - **Health View:** Grouped cards signaling initiative health (On Track, At Risk, Off Track).

### Future Goals Extensibility:
- We do **not** build a separate Goals page today.
- However, the domain model reserves an optional `goalId` foreign key on the `Initiative` entity schema. When OKRs/Goals are introduced in future enterprise tiers, they will cleanly sit above Initiatives without refactoring.

---

## 9. Generic Favorites Model

Favorites must not be hardcoded to specific entities. Orynqo defines a polymorphic **Generic Favorite Reference**:

```typescript
interface FavoriteReference {
  id: string;                     // Unique favorite entry ID
  userId: string;                 // Owning user identity
  workspaceId: string;            // Scoped workspace
  resourceType: FavoriteType;     // Polymorphic discriminator
  resourceId: string;             // Canonical entity ID
  customLabel?: string;           // Optional user override alias
  position: number;               // Lexicographical or integer sort order
  createdAt: string;              // ISO timestamp
}

type FavoriteType = 
  | 'team' 
  | 'project' 
  | 'cycle' 
  | 'doc' 
  | 'initiative' 
  | 'saved_view';
```

### Behavioral Rules for Favorites:
1. **Ordering & Drag-and-Drop:** Users can reorder favorites; order is stored in `position`.
2. **Duplicate Prevention:** Favoriting an already-favorited entity toggles removal.
3. **Archived / Deleted Entities:**
   - If an entity is deleted, the favorite link automatically purges on next fetch.
   - If an entity is archived, it displays a muted italic label with an archive icon; clicking offers to unpin.
4. **Permission Revocation:** If a user loses read access to a favorited resource, the item is silently excluded from their rendered list without throwing an error.
5. **Atomic Work Items:** Individual work items (issues) do **not** support favoriting in the sidebar; users track personal items via `My Work` or custom `Saved Views`.

---

## 10. Personal Execution Cockpit: `My Work` Specification

`My Work` is the user's cross-team, cross-project personal workstation.

### Semantic Boundaries:
- `My Work` is strictly for **executable work items, review duties, and assignments**.
- **Document Drafts:** Personal living specs and RFC drafts do **not** live in `My Work`. They live inside `Docs > Drafts` to maintain strict domain separation between execution items and knowledge documents.

### Contextual Sub-Segments in `My Work`:
1. **Assigned to Me:** Open work items where `assigneeId === currentUser.id`. (Ordered by Priority: Urgent → High → Medium → Low).
2. **Created by Me:** Open work items authored by the user needing follow-up or validation.
3. **Subscribed / Following:** Work items where the user is an active watcher or mentioned stakeholder.
4. **Review Queue (Future Extensibility):** PR review requests or spec sign-off approvals requested from this user.

---

## 11. Disambiguating Communication: Inbox vs. Triage vs. Activity

To prevent the common enterprise pitfall of merging disparate notification concepts into an incoherent feed, Orynqo establishes three distinct operational queues:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   COMMUNICATION QUEUE ARCHITECTURE                     │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ Attribute          │ Personal Inbox     │ Team Triage Queue            │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ Scope              │ Current User       │ Specific Team                │
│ Sidebar Placement  │ Top `PERSONAL`     │ Inside `Team > Triage` Tab   │
│ Ingestion Trigger  │ Mentions, assigns, │ Inbound external bugs,       │
│                    │ subscribed updates │ Zendesk/Slack bot tickets    │
│ State Machine      │ Unread → Read →    │ Inbound → Accepted →         │
│                    │ Archived (or Snooze│ Declined → Merged (Dupe)     │
│ Primary Keyboards  │ 'e' (Archive),     │ 'a' (Accept to backlog),     │
│                    │ 'z' (Snooze),      │ 'x' (Decline),               │
│                    │ 'Enter' (Open)     │ 'm' (Mark duplicate)         │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

- **ACTIVITY** is an immutable, contextual audit log attached to a specific issue, project, or spec (e.g. *"Sarah changed status to In Progress 2h ago"*). It is **never** a standalone sidebar destination.
- **NOTIFICATIONS** is the underlying real-time delivery mechanism (WebSockets/Push), not a separate navigation page.

---

## 12. Saved Views Architecture & Scoping

A **Saved View** is a persistent, named query comprising:
1. Filter algebra conditions (e.g. `Team = Mobile AND Priority = Urgent`).
2. Sort parameters.
3. Grouping rules (e.g. group by Assignee or Cycle).
4. Selected projection type (Grid, Board, Timeline).
5. Visible columns and column widths.

### The 3 Scopes of Saved Views:
1. **Personal Views:** Private to the creator. Accessible via `Views > Private` or pinned to `FAVORITES`.
2. **Team Views:** Shared across a squad. Rendered directly inside `Team > Work > Views`.
3. **Workspace Views:** Organization-wide standardized dashboards (e.g. *"All Q4 Security Audits"*). Housed in the global `Views` sidebar destination.

---

## 13. Tenant Topology: Organization vs. Workspace Decision

A major architectural ambiguity identified in `IA-01` was the interchangeable use of "Organization" and "Workspace".

### Evaluation of Topology Models:

| Model | Structural Hierarchy | Enterprise Suitability | Small Team Suitability | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Option A** | `Organization` → `Workspace` → `Team` | High | Over-engineered (unnecessary nesting) | Rejected |
| **Option B** | `Workspace` → `Team` | Weak for large conglomerates | Simple, but lacks enterprise multi-tenant boundary | Rejected |
| **Option C (Adopted)** | **Organization as Security/Billing Tenant, Workspace as Product Collaboration Boundary** | **Excellent** (Supports multiple workspaces under one billing/SSO umbrella) | **Seamless** (Single default workspace for small teams; zero friction) | **PROPOSED BASELINE** |

### Formal Topology Decision:
- **ORGANIZATION:** The legal and enterprise administrative entity. Owns the corporate domain, billing subscription, SAML SSO / SCIM identity mapping, and master audit logs.
- **WORKSPACE:** The collaborative product environment. Contains Teams, Projects, Docs, and Work Items.
- **Default Experience:** For standard companies, `1 Organization = 1 Workspace` (the switcher shows "Orynqo Corp"). For large enterprises or agencies, a user can toggle between distinct workspaces (e.g. "Core Engineering" vs. "Marketing & Ops") within the same parent Organization.

---

## 14. Sidebar Section Contracts & Behavioral Rules

Each section of the sidebar adheres to a strict contract:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               SIDEBAR SECTION CONTRACTS                                │
├───────────────┬─────────────────────────┬──────────────┬───────────────┬───────────────┤
│ Section       │ Purpose                 │ Visibility   │ Collapse Rule │ Badge Type    │
├───────────────┼─────────────────────────┼──────────────┼───────────────┼───────────────┤
│ **Header**    │ Org/Workspace Context   │ Always       │ Non-collapsible│ None         │
├───────────────┼─────────────────────────┼──────────────┼───────────────┼───────────────┤
│ **Search**    │ ⌘K Omnisearch Launcher  │ Always       │ Non-collapsible│ Shortcut Kbd  │
├───────────────┼─────────────────────────┼──────────────┼───────────────┼───────────────┤
│ **PERSONAL**  │ Individual Triage & Work│ Always       │ Collapsible   │ Unread Accent │
├───────────────┼─────────────────────────┼──────────────┼───────────────┼───────────────┤
│ **FAVORITES** │ Pinned Shortcuts        │ If count > 0 │ Collapsible   │ Muted counter │
├───────────────┼─────────────────────────┼──────────────┼───────────────┼───────────────┤
│ **WORKSPACE** │ Strategic Roadmaps/Docs │ Members/Admins│ Collapsible   │ None          │
├───────────────┼─────────────────────────┼──────────────┼───────────────┼───────────────┤
│ **TEAMS**     │ Joined Squad Execution  │ If teams > 0 │ Collapsible   │ Cycle Status  │
├───────────────┼─────────────────────────┼──────────────┼───────────────┼───────────────┤
│ **Utility**   │ Profile, Help, Settings │ Always       │ Non-collapsible│ Alert dot     │
└───────────────┴─────────────────────────┴──────────────┴───────────────┴───────────────┘
```

### Tunable UX Parameters *(Not Permanent Invariants)*:
- `MAX_SIDEBAR_JOINED_TEAMS_VISIBLE` = `5` (Teams beyond this collapse behind a *"More teams (X)..."* flyout). *(TUNABLE UX PARAMETER)*
- `SIDEBAR_COLLAPSED_WIDTH` = `52px`. *(TUNABLE UX PARAMETER)*
- `SIDEBAR_EXPANDED_WIDTH` = `230px` (Resizable up to `320px`). *(TUNABLE UX PARAMETER)*

---

## 15. Reusable Navigation Node Model

To ensure frontend components remain decoupled from ad-hoc domain objects, all sidebar and contextual navigation items consume a normalized **Navigation Node Contract**:

```typescript
interface NavigationNode {
  id: string;                               // Unique node identifier
  type: 'route' | 'resource' | 'action';   // Node category
  label: string;                            // Localized display title
  icon: string | React.ComponentType;       // Semantic icon
  route?: string;                           // Destination path
  resourceType?: string;                    // Entity type ('team', 'project', etc.)
  resourceId?: string;                      // Entity ID
  badge?: {
    count?: number;
    variant: 'accent' | 'muted' | 'alert';
  };
  isExpandable?: boolean;                   // Has children nodes
  isExpanded?: boolean;                     // Current disclosure state
  children?: NavigationNode[];              // Sub-navigation items
  capabilityRequirement?: string;           // Required team capability (e.g. 'cycles')
  permissionRequirement?: string;           // Required RBAC role
  keyboardShortcut?: string;                // e.g. 'G then I'
  isUnavailable?: boolean;                  // Entity archived or restricted
}
```

---

## 16. Route Taxonomy & URI Schema

The route architecture must guarantee permanent bookmarkability, deep linking, and predictable URL state:

```
/:orgSlug/:workspaceSlug/inbox
/:orgSlug/:workspaceSlug/my-work
/:orgSlug/:workspaceSlug/initiatives
/:orgSlug/:workspaceSlug/initiatives/:initiativeKey
/:orgSlug/:workspaceSlug/docs
/:orgSlug/:workspaceSlug/docs/:docSlug
/:orgSlug/:workspaceSlug/views
/:orgSlug/:workspaceSlug/views/:viewId

# Team Scope
/:orgSlug/:workspaceSlug/teams/:teamKey/work
/:orgSlug/:workspaceSlug/teams/:teamKey/cycles
/:orgSlug/:workspaceSlug/teams/:teamKey/cycles/:cycleNumber
/:orgSlug/:workspaceSlug/teams/:teamKey/projects
/:orgSlug/:workspaceSlug/teams/:teamKey/docs
/:orgSlug/:workspaceSlug/teams/:teamKey/triage
/:orgSlug/:workspaceSlug/teams/:teamKey/members

# Project Scope
/:orgSlug/:workspaceSlug/projects/:projectKey/overview
/:orgSlug/:workspaceSlug/projects/:projectKey/work
/:orgSlug/:workspaceSlug/projects/:projectKey/docs
/:orgSlug/:workspaceSlug/projects/:projectKey/milestones

# Direct Work Item Deep Link
/:orgSlug/:workspaceSlug/item/:itemIdentifier     # e.g. /orynqo/main/item/OR-1082
```

### URL Query State Schema:
- **Projection Lens:** `?view=grid` | `?view=board` | `?view=timeline` | `?view=workload`
- **Active Inspector Drawer:** `?inspect=OR-1082` (Preserves background page and scroll state)
- **Active Filter Compound:** `?filter=status%3Din_progress%26priority%3Dhigh`

---

## 17. Navigation State Ownership Matrix

Following the state isolation principles established in `Stabilization Pass 01A`, navigation state is partitioned across 5 distinct tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   NAVIGATION STATE TOPOLOGY MATRIX                     │
├─────────────────────────┬──────────────────────────────────────────────┤
│ State Dimension         │ State Ownership Category                     │
├─────────────────────────┼──────────────────────────────────────────────┤
│ Active Route & Slugs    │ URL STATE (React Router / Browser Location)  │
│ Active Inspector Item   │ URL STATE (`?inspect=OR-101`)                │
│ Active Projection Type  │ URL STATE (`?view=board`)                    │
│ Active Filter Criteria  │ URL STATE (`?status=active`)                 │
├─────────────────────────┼──────────────────────────────────────────────┤
│ Sidebar Width & Collapse│ PERSISTED USER PREFERENCE (localStorage)     │
│ Section Collapse States │ PERSISTED USER PREFERENCE (localStorage)     │
│ Favorite Nodes Ordering │ PERSISTED USER PREFERENCE (User Profile DB)  │
├─────────────────────────┼──────────────────────────────────────────────┤
│ Joined Teams Roster     │ SERVER STATE (Query Cache / Workspace DB)    │
│ Unread Inbox Count      │ SERVER STATE (WebSocket / Query Cache)       │
│ Team Capabilities Map   │ SERVER STATE (Team Configuration DB)         │
├─────────────────────────┼──────────────────────────────────────────────┤
│ Unsaved Living Spec Edit│ FEATURE WORKFLOW STATE (Spec Editor Store)   │
│ Omnisearch Query String │ TRANSIENT LOCAL UI STATE (Palette useState)  │
│ Hover / Focus Index     │ TRANSIENT LOCAL UI STATE (Component useState)│
└─────────────────────────┴──────────────────────────────────────────────┘
```

---

## 18. Sidebar Interaction & State Machine

```
               ┌──────────────────────┐
               │    COLLAPSED_RAIL    │ (52px width)
               └──────────┬───────────┘
                 ▲        │
        ⌘[ Toggle│        │ ⌘[ Toggle
                 │        ▼
               ┌──────────────────────┐
               │   EXPANDED_DEFAULT   │ (230px–320px width)
               └──────────┬───────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
   SECTION_TOGGLE    TEAM_EXPAND     KEYBOARD_FOCUS
  (Personal, Favs, (Active Cycle/   (j/k row focus,
   Workspace, Team) Work items)      Enter open)
```

### State Transition Rules:
1. `COLLAPSED_RAIL` to `EXPANDED_DEFAULT`:
   - Triggered by `⌘[` shortcut, clicking the header expand chevron, or clicking a navigation icon while collapsed.
   - Restores the exact section disclosure states stored in `localStorage`.
2. `EXPANDED_DEFAULT` to `COLLAPSED_RAIL`:
   - Triggered by `⌘[` shortcut or clicking the collapse toggle button.
   - Text labels hide immediately; active link indicator compresses into a centered icon badge.

---

## 19. Keyboard Navigation Contract

Orynqo's navigation is keyboard-first, strictly respecting the **4-tier Keyboard Scope Precedence** formalized in `Pass 01A`:

```
GLOBAL (App Shell)
  ↓
PAGE / VIEW (Active Projection)
  ↓
OVERLAY (Modals, Palettes, Drawers)
  ↓
EDITABLE CONTROL (Inputs, Textareas, Contenteditable)
```

### Sidebar Keyboard Interactions:
- **Activation:** Pressing `Alt + 1` (or `Ctrl + Shift + E`) focuses the sidebar rail.
- **Traversal:** `ArrowDown` / `ArrowUp` moves focus between visible navigation nodes.
- **Hierarchy:** `ArrowRight` expands a collapsed section/team; `ArrowLeft` collapses an expanded section/team.
- **Execution:** `Enter` navigates to the focused node and transfers focus to the primary canvas.
- **Two-Key Quick Sequences (Global Scope):**
  - `G then I` → Navigate to `Inbox`.
  - `G then M` → Navigate to `My Work`.
  - `G then D` → Navigate to `Docs`.
  - `G then N` → Navigate to `Initiatives`.
- **Scope Suppression:** When typing in any text input, spec canvas, or when an overlay modal is active, all single-key shortcuts and two-key navigation sequences are strictly suppressed.

---

## 20. Collapsed Sidebar (Rail Mode) Contract

When collapsed, the sidebar must remain completely functional:

1. **Visual Presentation:** Width transitions smoothly to `52px`. Text strings and disclosure triangles hide.
2. **Iconography:** Centered semantic icons:
   - `Search` (Magnifying glass)
   - `Inbox` (Inbox tray with unread dot indicator)
   - `My Work` (Checkmark circle)
   - `Initiatives` (Compass or roadmap icon)
   - `Docs` (Document sheet icon)
   - `Views` (Filter sliders or layers icon)
   - `Joined Teams` (Team avatar squares with initial letters)
3. **Tooltip / Flyout Menu:** Hovering over any icon in rail mode for >150ms opens an anchored popover flyout displaying the item title, badge count, and quick sub-links (e.g. hovering a Team icon reveals `Active Cycle` and `Work`).
4. **Accessibility:** The rail maintains full `aria-expanded="false"` landmark semantics and announces destination titles via `aria-label`.

---

## 21. Responsive Translation (Desktop to Mobile)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RESPONSIVE TRANSLATION                          │
├─────────────────────┬──────────────────────────────────────────────────┤
│ Screen Breakpoint   │ Navigation Representation                        │
├─────────────────────┼──────────────────────────────────────────────────┤
│ **Large Desktop**   │ Default Expanded Sidebar (230px–320px resizable) │
│ (> 1280px)          │ + Full Content Canvas + Optional 480px Inspector │
├─────────────────────┼──────────────────────────────────────────────────┤
│ **Standard Desktop**│ Expanded Sidebar or Collapsed Rail (user choice) │
│ (1024px – 1280px)   │ + Content Canvas + Overlay Inspector Drawer      │
├─────────────────────┼──────────────────────────────────────────────────┤
│ **Tablet / Compact**│ Default Collapsed Rail (52px)                    │
│ (768px – 1024px)    │ Sidebar expands over canvas on trigger           │
├─────────────────────┼──────────────────────────────────────────────────┤
│ **Mobile Device**   │ Off-Canvas Drawer (swipe from left)              │
│ (< 768px)           │ + Bottom High-Frequency Bar [Inbox, Work, Search]│
│                     │ + Full-screen modal inspector                    │
└─────────────────────┴──────────────────────────────────────────────────┘
```

---

## 22. Permission-Aware Navigation & RBAC Filtering

Enterprise navigation must accurately reflect user access without generating dead ends:

1. **INACCESSIBLE (Strictly Hidden):**
   - Private teams, confidential projects, and restricted Living Specs to which the user has zero read permissions are completely omitted from the sidebar, favorites, and search indices.
2. **GUEST SANDBOXING:**
   - External guests see a streamlined sidebar: `Inbox`, `My Work (Assigned)`, and explicit `Shared Projects/Docs`.
   - `Initiatives`, `Team Backlogs`, `Triage Queues`, and `Enterprise Settings` are hidden.
3. **DISCOVERABLE BUT LOCKED:**
   - In the "Browse all teams" directory, public/closed internal teams are visible with a *"Request to Join"* trigger, preventing shadow organizations while maintaining privacy.

---

## 23. Handling Archived, Deleted, and Moved Resources

When a favorited or bookmarked entity undergoes lifecycle changes:

- **Moved / Transferred:** If Project A moves from Team 1 to Team 2, its canonical UUID remains unchanged. The URL automatically redirects from old slug to new slug; the favorite reference updates transparently.
- **Renamed:** Slugs update, but UUID permalinks remain stable. Navigation nodes display updated titles on next cache revalidation.
- **Archived:** Entity is flagged with an archive icon. Favorited archived items show a subtle tooltip: *"This project is archived. Click to unpin."*
- **Deleted:** The navigation system gracefully catches 404s, purges the orphaned favorite reference, and displays an informative notification rather than a broken blank screen.

---

## 24. Context & Breadcrumb Contract

The navigation burden is shared across coordinated UI layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SPATIAL LAYER RESPONSIBILITY MATRIX                  │
├─────────────────────┬──────────────────────────────────────────────────┤
│ Layer               │ Exact Contextual Responsibility                  │
├─────────────────────┼──────────────────────────────────────────────────┤
│ **1. Sidebar**      │ Global Scope & Container anchor                  │
│                     │ (e.g. Team: Core Platform)                       │
├─────────────────────┼──────────────────────────────────────────────────┤
│ **2. Breadcrumbs**  │ Hierarchical Lineage                             │
│                     │ (Orynqo > Core Platform > Offline Sync > OR-1082)│
├─────────────────────┼──────────────────────────────────────────────────┤
│ **3. Resource Title│ Name, description, status badge, owner of the    │
│      & Metadata**   │ active container.                                │
├─────────────────────┼──────────────────────────────────────────────────┤
│ **4. Resource Tabs**│ Capability facets of the active container        │
│                     │ (Overview | Work | Docs | Milestones | Activity) │
├─────────────────────┼──────────────────────────────────────────────────┤
│ **5. Projection Bar │ Visual lens selector for the active work set     │
│                     │ (Grid [28px/34px] | Board | Timeline | Workload) │
├─────────────────────┼──────────────────────────────────────────────────┤
│ **6. Inspector Pane │ Deep atomic entity detail without leaving view   │
│                     │ (Work item properties, subtasks, live comments)  │
└─────────────────────┴──────────────────────────────────────────────────┘
```

---

## 25. Component Architecture & System Ownership

Navigation components conform to the frozen directory structure established during Architecture Stabilization:

```
src/
├── components/
│   └── navigation/
│       ├── Sidebar/
│       │   ├── Sidebar.jsx                  # Primary navigation rail orchestrator
│       │   ├── SidebarHeader.jsx            # Org/Workspace switcher trigger
│       │   ├── SidebarSection.jsx           # Collapsible disclosure container
│       │   ├── SidebarItem.jsx              # Normalized navigation row
│       │   ├── TeamNavGroup.jsx             # Capability-aware team node
│       │   ├── FavoritesNavGroup.jsx        # Drag-and-drop dynamic favorite nodes
│       │   └── SidebarRail.jsx              # Compressed 52px icon mode
│       └── breadcrumbs/
│           └── AppBreadcrumbs.jsx           # Global hierarchical lineage
```

*All visual primitives (`Button`, `Kbd`, `Avatar`, `Badge`, `Checkbox`, `Dialog`, `Drawer`, `Popover`) are imported exclusively from `src/design-system/` and remain 100% domain-neutral.*

---

## 26. Accessibility & Keyboard Specification

Target standard: **WCAG 2.2 AA Compliance**.

1. **Landmarks:** The sidebar is wrapped in `<aside role="navigation" aria-label="Primary Workspace Navigation">`.
2. **Disclosure Semantics:** Section toggles use `<button aria-expanded="true/false" aria-controls="section-id">`.
3. **Current Location:** The active destination carries `aria-current="page"`.
4. **Badge Announcements:** Unread badges include hidden screen-reader text: `<span className="sr-only">2 unread notifications</span>`.
5. **Focus Restoration:** Closing a flyout menu or command palette automatically restores keyboard focus to the triggering element.
6. **Reduced Motion:** When `prefers-reduced-motion: reduce` is detected, sidebar width transitions and disclosure animations are instantaneous (`0ms`).

---

## 27. Product Learning & Telemetry Hooks

Without embedding proprietary tracking vendors, Orynqo defines standard semantic telemetry event hooks for future observability:

- `nav_destination_selected { destinationId, source: 'sidebar' | 'command_palette' | 'breadcrumb' }`
- `sidebar_collapse_toggled { isCollapsed: boolean }`
- `favorite_added { resourceType, resourceId }`
- `team_expanded { teamId, hasCycles: boolean }`
- `browse_teams_opened { searchString?: string }`
- `projection_switched { from: 'grid', to: 'board', contextId }`

---

## 28. Human Review Decision Points

Before freezing `IA-02` and commencing `IA-03 (Complete Page & Surface Registry)`, the following structural decisions are submitted for human alignment:

1. **Organization vs. Workspace Topology:**
   - *Proposal:* Adopt **Option C** (Organization as legal/billing/security boundary; Workspace as the collaborative domain container). For small teams, 1 Org = 1 Workspace by default.
2. **`Docs` Navigation Label:**
   - *Proposal:* Freeze **`Docs`** as the top-level global sidebar destination (housing Living Specs, RFCs, Runbooks, and Knowledge).
3. **Team Capability Availability:**
   - *Proposal:* Make `Current Cycle` and `Triage` conditional upon team capabilities rather than mandatory for every squad.
4. **Projects Directory Discovery:**
   - *Proposal:* Keep Projects discoverable via Teams, Initiatives, Favorites, and `⌘K`; provide a workspace directory via Initiatives or dedicated route, avoiding a cluttered persistent sidebar item.
5. **My Work vs. Document Drafts:**
   - *Proposal:* Restrict `My Work` to executable work items (issues, tasks, reviews); isolate unedited document drafts under `Docs > Drafts`.

---

## 29. Readiness for IA-03

Upon approval of this architecture contract:
- The navigation mental model is **FROZEN**.
- Phase **`IA-03 — Complete Page & Surface Registry`** will systematically map every primary page, resource page, projection view, modal overlay, and inspector surface required across the entire platform.
- Page UI/UX and Golden Flow implementation remain strictly blocked until IA-03 completes review.
