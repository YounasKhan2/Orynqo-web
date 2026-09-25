# Orynqo Platform — Application Shell & Production Sidebar Contract (Phase UI-02A)

**Status:** UI-02A — FINAL DESIGN & PRODUCT CONTRACT (Ready for Human Review)  
**Governing Methodology:** `antigravity-enterprise-product-design`  
**Preceding Milestones:**  
- `Architecture & Design-System Stabilization (APPROVED)`  
- `Phase IA-01 Competitive Navigation Research (APPROVED)`  
- `Phase IA-02 Sidebar Architecture & Navigation Contract (APPROVED & FROZEN)`  
- `Phase IA-03 Complete Page & Surface Registry (APPROVED & FROZEN)`  
- `UI-01 Execution Core Milestone (UI-01A → UI-01B → UI-01C → UI-01D) (APPROVED & FROZEN ON MAIN at commit 7856067)`  
**Current Phase:** `UI-02A Application Shell & Production Sidebar Contract`  
**Subsequent Phase:** `UI-02B Application Shell & Production Sidebar Implementation (Awaiting Human Review)`  
**Implementation Freeze:** STRICTLY ENFORCED (Design & Contract phase only; zero production UI code modified; zero changes to frozen UI-01 Execution Core)  

---

## 1. Phase Status & Scope

Phase `UI-02A` establishes the authoritative interaction and engineering contract for the **Orynqo Application Shell** and **Production Sidebar**. 

The goal of UI-02 is to construct the persistent, responsive, keyboard-first workspace frame that hosts the frozen UI-01 Execution Core today, and scales cleanly to host all 50 canonical surfaces defined in `docs/06-complete-page-and-surface-registry.md` without requiring architectural refactoring.

### Phase Boundaries
- **IN SCOPE:**
  - Defining the complete spatial mental model, layout regions, and z-index strata.
  - Formulating the Production Sidebar architecture, hierarchy, and progressive disclosure model.
  - Designing the Organization/Workspace Switcher contract for multi-tenant and multi-workspace scale.
  - Defining the Generic Favorites pointer model and lifecycle.
  - Establishing Team scale architecture (supporting 3 to 300+ squads without sidebar bloat).
  - Unifying the Context/Action Strip, Breadcrumbs, and reusable Resource Navigation tabs.
  - Establishing the Projection Control integration contract (Grid, Board, Timeline, Workload).
  - Specifying the integration boundaries for the frozen UI-01 Inspector, Quick Create, and Command Palette.
  - Defining state ownership (URL vs. User Preference vs. Domain State vs. Ephemeral UI).
  - Specifying routing semantics, permission/capability gating, keyboard scopes, accessibility (WCAG 2.2 AA), and responsive adaptations.
  - Formulating the component architecture, visual specifications, interaction matrix, and prototype migration plan.
- **OUT OF SCOPE / FORBIDDEN:**
  - Modifying any frozen UI-01 Execution Core code or test suites.
  - Writing or modifying React layout/sidebar components in this phase.
  - Designing full page contents for future surfaces (e.g., Roadmaps, Living Spec Editor, Settings).
  - Merging changes to `main`.

---

## 2. Frozen Inputs & Governing Precedents

This contract builds strictly upon the approved decisions of preceding phases and treats them as immutable architectural ground truth:

1. **`docs/03-architecture-and-design-system-stabilization.md`:**
   - Design system dependency rule: `Design System (primitives/overlays)` → `Global Product Components` → `Domain Features` → `Page Components` → `Layouts / Shell`.
   - Semantic token contracts for colors, typography, elevations, radiuses, and density tokens.
2. **`docs/04-ia-competitive-navigation-research.md`:**
   - Elimination of competitive navigation anti-patterns (no unbounded flat project trees, no projection conflation in sidebar, no un-scoped search bars).
3. **`docs/05-sidebar-navigation-contract.md` (IA-02):**
   - The Spatial Mental Model:
     - **`SIDEBAR = WHERE`** (Scope, Workspace, Team, or Resource Container).
     - **`RESOURCE NAVIGATION = WHAT`** (Contextual tabs: Overview, Work, Cycles, Projects, Docs, Triage, Members).
     - **`PROJECTION CONTROLS = HOW`** (Visual presentation lenses: Grid, Board, Timeline, Workload).
     - **`INSPECTOR = DETAIL WITHOUT CONTEXT LOSS`** (Slide-over properties, specs, comments).
     - **`COMMAND PALETTE = LONG-TAIL DISCOVERY & FAST ACCESS`** (`⌘K` instant keyboard action).
   - Universal Document model under the canonical label **`Docs`** (PRDs, RFCs, Runbooks).
   - Generic polymorphic Favorites model.
   - Capability-aware Team model (Cycles/Triage toggled per squad).
4. **`docs/06-complete-page-and-surface-registry.md` (IA-03):**
   - The 50 canonical surfaces mathematically reconciled across 10 surface types.
   - Multi-tenant boundary: Organization = legal/billing/security boundary; Workspace = collaborative execution boundary.
   - Projects can belong to multiple Teams (Projects are not strictly single-parented under Teams).
   - Cycles are Team-owned; Milestones are Project-owned; neither is a WorkItem subtype.
5. **UI-01 Execution Core (`UI-01A → UI-01D`):**
   - WorkItem Inspector drawer architecture, zero-leakage placeholders, optimistic rollback invariants, high-density DataGrid projection, Universal Property Pickers, and Quick Create dialog.

---

## 3. Shell Responsibility & Spatial Geometry Model

The Orynqo Desktop Application Shell operates as a coordinated 4-region spatial grid with an independent overlay layer:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. SIDEBAR   │ 2. CONTEXT / ACTION STRIP                                               │
│ (WHERE)      │    - Breadcrumb Scope & Entity Identity                                 │
│              │    - Resource Navigation Tabs (WHAT)                                    │
│              │    - Projection Switcher & View Actions (HOW)                           │
│              ├─────────────────────────────────────────────────────────────────────────┤
│              │ 3. MAIN WORKSPACE CANVAS           │ 4. CONTEXTUAL INSPECTOR            │
│              │    - Primary Resource Content       │    (DETAIL WITHOUT CONTEXT LOSS)   │
│              │    - Active Projection Projection   │    - Canonical WorkItem detail     │
│              │      (DataGrid, Board, Timeline)    │    - Activity & relationships      │
│              │                                     │    - Collapsible split or drawer   │
└──────────────┴─────────────────────────────────────┴───────────────────────────────────┘
│ 5. FLOATING OVERLAYS & SHEETS (Z-INDEX 1000+)                                          │
│    - Command Palette (⌘K) | Quick Create (C) | Shortcuts Modal (?) | Popovers           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1. Clear Division of Responsibilities

| Region | Primary Mental Role | Strict Inclusions | Strict Exclusions |
| :--- | :--- | :--- | :--- |
| **1. Sidebar** | **WHERE** (Location & Context) | Org/Workspace switcher, Search/Command trigger, Personal queues (`Inbox`, `My Work`), Favorites shortcuts, Workspace resource hubs (`Initiatives`, `Docs`, `Views`), Joined/Pinned Teams, Bottom utility rail (`Profile`, `Help`, `Settings`). | **NO** view projections (`Table`, `Board`), **NO** unbounded lists of all workspace projects, **NO** giant search inputs, **NO** inline property editors. |
| **2. Context / Action Strip** | **WHAT & HOW** (Resource Context & Tools) | Contextual Breadcrumbs, Resource identity & title, Resource Navigation tabs (`Overview`, `Work`, `Cycles`, `Projects`, etc.), View Projection controls (`Grid`, `Board`, `Timeline`), Contextual Filters & Search, Primary Context Action (`+ New Item`). | **NO** global navigation links, **NO** permanent workspace-level switching, **NO** nested sub-item property inspectors. |
| **3. Main Canvas** | **EXECUTION CANVAS** (Primary Content) | Current active resource content, projection canvas (`DataGrid`, `KanbanBoard`, `TimelineView`, `WorkloadView`, `LivingSpecEditor`, `TriageInbox`), bulk action bar when rows selected. | **NO** persistent navigation sidebars, **NO** duplicating breadcrumb bars. |
| **4. Inspector** | **DETAIL** (Context-Preserving) | Canonical entity properties (`WorkItemInspector`), discussion threads, sub-items, linked living specs, revision history, rollback status. | **NO** full page takeovers, **NO** altering sidebar navigation state when opened. |
| **5. Overlay Layer** | **FOCUS INTERRUPT** (Transient) | Command Palette (`CMD-001`), Quick Create Dialog (`CMD-002`), Property Picker popovers, Keyboard Shortcuts modal (`CMD-003`). | **NO** persistent layout reservation; must restore focus to invocation control on dismiss. |

### 3.2. Coordinate & Layout Strata
- **Root Container:** `100vw` × `100vh`, `overflow: hidden`, CSS Grid or Flex layout.
- **Sidebar Rail:** Left-aligned, fixed height `100%`, semantic width `--sidebar-width` (default `240px`) or `--sidebar-collapsed-width` (`52px`).
- **Context Column:** Right of sidebar, flex `1 1 auto`, `min-width: 0`, column flex:
  - Top: `ContextBar` (`var(--header-height)` = `44px`).
  - Optional sub-strip: `ResourceNavStrip` (height `36px` when resource tabs active).
  - Center: `main` content canvas (`flex: 1`, `overflow: hidden`).
- **Inspector Placement:**
  - On viewports $\ge 1200\text{px}$: Horizontal split inside main workspace column, occupying semantic width `--inspector-width` (default `440px`, resizable `380px`–`640px`). Main canvas shrinks cleanly without horizontal scrollbars.
  - On viewports $< 1200\text{px}$: Slide-over overlay drawer anchored right (`z-index: 50`) with backdrop.

---

## 4. Production Sidebar Architecture & Structural Hierarchy

The Production Sidebar strictly realizes the approved IA-02 conceptual hierarchy:

```text
ORYNQO SIDEBAR
├── [1. Organization / Workspace Switcher]          (Header: Current Org, Active Workspace, Switcher Popover)
├── [2. Quick Search & Command Trigger]             (Compact ⌘K launcher)
│
├── 3. PERSONAL                                     (Collapsible Section)
│   ├── Inbox                                      (PER-001: Actionable triage queue + unread badge)
│   └── My Work                                    (PER-002: Assigned work items & pull reviews)
│
├── 4. FAVORITES                                    (Collapsible Section — User-managed pointer shortcuts)
│   └── [Pinned Resources: Project, Doc, View, Team]
│
├── 5. WORKSPACE                                    (Collapsible Section — Shared Strategic Assets)
│   ├── Initiatives                                (INT-001: Strategic roadmaps & portfolio rollups)
│   ├── Docs                                       (DOC-001: Canonical document hub: Specs, RFCs, Runbooks)
│   └── Views                                      (VEW-001: Saved cross-team query & filter hub)
│
├── 6. TEAMS                                        (Collapsible Section — Joined Squads & Discovery)
│   ├── [Team A]                                   (Active/Pinned team: direct navigation to Team Hub)
│   │   └── Current Cycle                          (Conditional: visible only if active cycle exists)
│   ├── [Team B]                                   (Continuous delivery team: direct navigation)
│   └── [+ Browse all teams...]                    (TEM-001: Directory modal/view for workspace teams)
│
└── 7. BOTTOM UTILITY RAIL
    ├── User Profile & Presence                     (Avatar, Name, Status, Switch accounts)
    ├── Help & Keyboard Shortcuts                   (Shortcut cheat-sheet trigger: ?)
    └── Settings                                    (Role-aware menu: Personal, Workspace, Org Admin)
```

---

## 5. Organization / Workspace Switcher Contract

### 5.1. Tenant Architecture Boundary
- **Organization (Tenant):** The legal entity, SSO/SAML identity provider, data residency, billing subscription, and compliance boundary.
- **Workspace (Collaborative Environment):** The shared operational container containing Teams, Projects, Docs, and WorkItems. A user may have access to multiple Workspaces within an Organization, or across multiple Organizations.

### 5.2. Component Interaction & UI Presentation
- **Collapsed Sidebar (`52px`):** Renders the Workspace Logo/Monogram (`24px` × `24px`, `border-radius: var(--radius-xs)`). Clicking triggers the Workspace Switcher popover anchored to the right of the rail.
- **Expanded Sidebar (`240px`):** Renders a compact, interactive switcher trigger:
  - Line 1: Organization Name (e.g. `Acme Global`, `11px`, `color: var(--text-muted)`).
  - Line 2: Workspace Name (e.g. `Product & Engineering`, `12px`, `font-weight: 600`, `color: var(--text-primary)`).
  - Right: Subtle `ChevronsUpDown` icon (`12px`, `color: var(--text-muted)`).

### 5.3. Switcher Popover Specification
Clicking the trigger or pressing `Ctrl+Alt+W` opens the `WorkspaceSwitcherPopover`:
1. **Search Input (when $> 5$ workspaces available):** Filter input (`placeholder="Find workspace..."`) with immediate keystroke filtering.
2. **Current Workspace Section:** Marked with a checkmark and current user role (`Workspace Owner`, `Member`, `Guest`).
3. **Recent / Switch Workspaces:** Alphabetized list of authorized workspaces within the active Organization.
4. **Switch Organization (if user belongs to $> 1$ Org):** Sub-menu or partitioned section listing alternate Organizations.
5. **Actions (Role-gated):**
   - `+ Create Workspace` (Visible only if Org allows member workspace creation).
   - `Workspace Settings` (Deep link to `WKS-001`).
6. **Scale & Performance:**
   - If user has $> 20$ accessible workspaces, the popover utilizes a virtualized list with keyboard navigation (`ArrowUp`/`ArrowDown`/`Enter`).
7. **Failure & Disconnection:**
   - If switching workspaces fails (e.g., token expired or access revoked), present a clear banner and maintain current workspace context; do not crash the shell into a blank screen.

---

## 6. Quick Search & Command Entry

The Sidebar search trigger is an **explicit entry point** into the global Command & Omnisearch system (`CMD-001`), **not** an embedded text input.

### 6.1. Visual Specification
- **Expanded (`240px`):**
  - Height: `28px` (`var(--sidebar-item-height)`).
  - Background: `var(--bg-surface)` with `1px solid var(--border-subtle)`.
  - Icon: `Search` (`13px`, `color: var(--text-muted)`).
  - Label: `Search & Commands` (`12px`, `color: var(--text-secondary)`).
  - Right Shortcut Pill: `<Kbd>⌘K</Kbd>` (Mac) or `<Kbd>Ctrl+K</Kbd>` (Windows/Linux).
- **Collapsed (`52px`):**
  - Square button (`32px` × `32px`), centered `Search` icon. Accessible tooltip announces: `Search & Commands (⌘K)`.

### 6.2. Interaction Contract
- Clicking the trigger or pressing `⌘K` / `Ctrl+K` immediately opens `CommandPalette.jsx` in the overlay stratum (`z-index: 1000`).
- Focus is trapped within the palette search input.
- On dismissal (`Escape`), focus deterministically returns to the Sidebar search trigger (or the prior DOM focus target if invoked via keyboard).

---

## 7. Personal Section (`PER-001` & `PER-002`)

The `PERSONAL` section isolates the individual operator's high-frequency work queues from shared team noise.

### 7.1. Inbox (`PER-001: Personal Triage Inbox`)
- **Purpose:** Personal actionable notification and triage queue (mentions, assignments, review requests, thread replies).
- **Navigation Item:**
  - Icon: `Inbox` (`14px`).
  - Label: `Inbox`.
  - Actionable Badge: Renders unread actionable count (e.g. `3`).
    - Color: High-contrast accent (`var(--primary-base)`, text `#ffffff`).
    - Count semantics: Represents **strictly actionable unread items**, not noisy passive audit events.
    - If count is `0`, the badge is omitted to maintain a calm visual baseline.
- **Active Route Intent:** `/inbox` or `?surface=inbox`.

### 7.2. My Work (`PER-002: My Work Cockpit`)
- **Purpose:** Universal aggregator of work items where the current user is directly accountable:
  - `Assigned to Me` (active tasks/issues across all teams and projects).
  - `Created by Me`.
  - `Subscribed / Following`.
- **Navigation Item:**
  - Icon: `CheckCircle2` (`14px`).
  - Label: `My Work`.
  - Optional Badge: Counter for items due today or overdue (semantic warning color if overdue items exist).
- **Active Route Intent:** `/my-work` or `?surface=my-work`.

---

## 8. Generic Favorites Pointer Model & Section

Favorites provide instant access to user-curated shortcuts across any platform entity.

### 8.1. Canonical Pointer Entity Model
Favorites are **not** hardcoded sidebar links. They conform to a generic polymorphic pointer schema:

```typescript
interface FavoritePointer {
  id: string;               // Unique favorite record ID
  userId: string;           // Owner
  workspaceId: string;       // Bounded workspace
  targetType: 'project' | 'initiative' | 'doc' | 'saved_view' | 'team' | 'work_item';
  targetId: string;         // Canonical ID of target resource
  title: string;            // Cached title for optimistic display
  icon?: string;            // Custom or entity-default icon
  color?: string;           // Optional accent color
  position: number;         // Lexicographical or integer sort order
}
```

### 8.2. Lifecycle, Reordering & Overflows
- **Capacity & Scaling:**
  - Recommended visible threshold: Up to 10 favorites displayed directly.
  - If $> 10$ favorites exist, the list renders the first 10, followed by a subtle `More (N)...` link that opens a quick picker or displays an expandable sub-list.
- **Drag & Drop / Reordering:** Users can reorder favorites via drag-handle (desktop) or via `Move Up` / `Move Down` actions in the context menu. Ordering updates are persisted to user preferences.
- **Add / Remove Affordance:**
  - Any favoritable resource page features a Star toggle icon (`Star` / `StarOff`) in its Context Bar header.
  - Right-clicking any Favorite in the Sidebar exposes: `Remove from Favorites`, `Copy Link`, `Open in New Tab`.
- **Inaccessible / Deleted Target Behavior (Zero Leakage):**
  - If a favorited resource is deleted: Automatically soft-removed or flagged with a tombstone prompt (`Resource unavailable - Remove favorite?`).
  - If the user's permissions are revoked on a favorited resource: **Zero Leakage Rule** applies. The favorite item renders as a generic placeholder (`Restricted Item`) without revealing the title, project name, or metadata, or is silently hidden from the sidebar until access is restored.

---

## 9. Workspace Section (`Initiatives`, `Docs`, `Views`)

The `WORKSPACE` section provides top-level access to cross-team strategic entities and reusable assets:

### 9.1. Initiatives (`INT-001: Strategic Planning Hub`)
- **Icon:** `Compass` or `Target` (`14px`).
- **Label:** `Initiatives`.
- **Responsibility:** Strategic roadmaps, multi-team themes, and portfolio rollups.
- **Rule:** Roadmaps and Portfolio tables live as projections and views *inside* Initiatives, never as competing top-level sidebar items.
- **Active Route Intent:** `/initiatives`.

### 9.2. Docs (`DOC-001: Canonical Document Hub`)
- **Icon:** `FileText` (`14px`).
- **Label:** `Docs`.
- **Responsibility:** Organization and team knowledge, Living Specs (PRDs with embedded live execution grids), Architecture RFCs, and Engineering Runbooks.
- **Navigation State:** Opening any canonical doc keeps `Docs` active in the Sidebar while the Context Bar displays document breadcrumbs.
- **Active Route Intent:** `/docs`.

### 9.3. Views (`VEW-001: Saved Views Directory & Hub`)
- **Icon:** `Bookmark` or `LayoutGrid` (`14px`).
- **Label:** `Views`.
- **Responsibility:** Directory of reusable cross-team queries, filters, and projections (Personal Views, Team Views, Workspace Views).
- **Rule:** Saved Views are query definitions over domain entities, not separate siloed database tables.
- **Active Route Intent:** `/views`.

---

## 10. Teams Architecture: 3 to 300+ Squad Scaling

Scaling from a seed-stage 3-team workspace to an enterprise 300-team organization without sidebar degradation is a core mandate of UI-02.

```text
┌────────────────────────────────────────────────────────┐
│ TEAMS (Joined Squads)                                  │
│   ● Core Platform (ENG)                                │
│       ↳ Active Cycle: Cycle 42 (Ends in 3d)            │
│   ● Mobile Studio                                      │
│   ● Design Systems                                     │
│   ● Cloud Infrastructure                               │
│   ● Security Operations                                │
│   ────────────────────────────────────────             │
│   [+ Browse all 48 teams...]  (TEM-001 Directory)      │
└────────────────────────────────────────────────────────┘
```

### 10.1. Progressive Disclosure Strategy
1. **Joined / Pinned Teams Only:**
   - The Sidebar does **NOT** query or render all 300+ workspace teams into the DOM.
   - It renders strictly the teams where the user is an **active member** or that the user has **pinned**, up to a default limit of **7 teams**.
2. **Recent / Overflow Disclosure:**
   - If a user is a member of $> 7$ teams, the top 5 most frequently active teams are displayed, followed by a collapsible `More teams (N) ▼` toggle.
3. **Browse All Teams (`TEM-001`):**
   - The permanent footer item under the Teams section is `Browse all teams...` with shortcut support.
   - Clicking routes to the Teams Directory (`TEM-001`), where users can search, filter by department, inspect public rosters, or request membership.
4. **Archived / Inactive Teams:**
   - Archived teams are hidden by default from the sidebar. If an active URL references an archived team, the shell renders a persistent warning banner (`This team is archived. Read-only mode.`).

### 10.2. Team Sub-Links Contract (Maximum 1–2 per Team)
To prevent vertical sidebar explosion, team sub-links are strictly constrained:
- **Default State:** Clicking the Team Name routes directly to the **Team Hub** (`TEM-002: Team Overview`).
- **Optional Sub-link (Cycles):** If `team.capabilities.cycles === true` and an active cycle exists, render **at most one** indented sub-link:
  - `Cycle 42 (Ends Friday)` → deep-links directly to `CYC-001: Active Cycle Board`.
- **All other team facets** (`Work`, `Cycles Directory`, `Projects`, `Docs`, `Triage`, `Members`, `Settings`) belong strictly to the **Resource Navigation Tabs** in the Context Bar, **never** as nested tree nodes in the sidebar.

---

## 11. Contextual Resource Navigation (The "WHAT" Boundary)

When a user selects a container resource (Team, Project, or Initiative), the Sidebar establishes **WHERE** the user is, while the Context Bar renders the standardized **Resource Navigation Tabs**:

### 11.1. Standardized Resource Tab Configurations

```text
Team Resource Tabs:
[ Overview ] [ Work ] [ Cycles* ] [ Projects ] [ Docs ] [ Triage* ] [ Members ]

Project Resource Tabs:
[ Overview ] [ Work ] [ Docs ] [ Milestones ] [ Activity ]

Initiative Resource Tabs:
[ Overview ] [ Projects ] [ Roadmap ] [ Work Items ]
```
*\*Cycles and Triage tabs render conditionally based on team capabilities.*

### 11.2. Reusable Tab Interaction Rules
1. **Unified Component:** Powered by a single generic `ResourceNavBar` component across all resource types.
2. **Keyboard Traversal:** Left/Right arrow keys navigate tabs roving-focus style; pressing `Enter` or `Space` activates the tab.
3. **Overflow Handling:** If screen width causes tab clipping, secondary tabs (e.g. `Triage`, `Members`) automatically collapse into a `More (•••) ▼` dropdown.
4. **URL Synchronization:** Tab changes cleanly update the resource sub-route or query param (e.g. `/teams/core/work` vs `/teams/core/cycles`).

---

## 12. Project Discovery & Resource Integration

### 12.1. The Multi-Team Project Discovery Law
- In Orynqo, **a Project can be owned by or collaborated on by multiple Teams**.
- Therefore, Projects cannot be architecturally nested as strict single-parent children in the sidebar.
- Projects are discovered through:
  1. **Team Projects Tab (`TEM-004`):** Lists all projects associated with the active team.
  2. **Projects Directory (`PRJ-007`):** Workspace-wide searchable, filterable catalog of all projects.
  3. **Initiatives (`INT-002`):** Strategic roadmaps grouping linked projects.
  4. **Favorites:** Direct user shortcuts to high-priority active projects.
  5. **Command Palette (`⌘K`):** Instant fuzzy search (`> Projects: Mobile Redesign`).

### 12.2. Project Working Environment (`PRJ-001`)
When a Project is selected:
- Sidebar indicates active context (or highlights the Project in Favorites if favorited).
- Context Bar displays: `[Workspace] / [Project Name]`.
- Resource Navigation renders: `Overview` | `Work` | `Docs` | `Milestones` | `Activity`.
- The `Work` tab instantly activates the frozen DataGrid or Kanban projection over the project's work items.

---

## 13. Context / Action Strip Specification

The current prototype `ActionStrip.jsx` is refactored into a clean, hierarchical two-tier Context & Control Bar:

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TIER 1: IDENTITY, BREADCRUMBS & GLOBAL ACTIONS                                    [Height: 44px] │
│ 🏠 Workspace  ›  ⚡ Core Platform  ›  🎯 Cycle 42          [Density: 28px]  [+ New Item (C)]    │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TIER 2: RESOURCE TABS & PROJECTION CONTROLS                                       [Height: 36px] │
│ [Overview] [Work •] [Cycles] [Projects] [Docs]    │   [Grid | Board | Timeline]  [Filters] [🔍]  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 13.1. Tier 1: Identity & Action Bar (`44px`)
- **Left:** Contextual Breadcrumbs (compact, truncated, navigable links).
- **Middle / Right:**
  - View Count Metric (e.g. `42 items`).
  - View Density Switcher (toggles between `28px Compact` and `34px Default` table row heights).
  - Primary Action Button: `+ New Item` (invokes Quick Create modal, bound to `C` key).

### 13.2. Tier 2: Resource Navigation & Projection Bar (`36px`)
- **Left:** Contextual Resource Navigation Tabs (`ResourceNavBar`).
- **Right:**
  - **Projection Switcher:** Segmented control for Work-capable tabs (`Table / Grid`, `Kanban Board`, `Timeline`, `Workload`).
  - **Filter Trigger:** Filter summary badge (`3 active`) opening `FilterBuilder`.
  - **In-View Search:** Quick keyword filter over currently loaded collection.

---

## 14. Breadcrumb & Context Model

Breadcrumbs must provide rapid spatial orientation without visual clutter:

```text
Workspace Name  ›  Container (Team or Initiative)  ›  Resource (Project or Doc)  ›  Facet / Item
```

### 14.1. Real-World Breadcrumb Patterns
1. **Team Work Context:** `Orynqo` › `Core Platform` › `Work`
2. **Cycle Context:** `Orynqo` › `Core Platform` › `Cycle 42`
3. **Multi-Team Project:** `Orynqo` › `Projects` › `Auth Migration V2` › `Work`
4. **Strategic Initiative:** `Orynqo` › `Initiatives` › `Q3 Enterprise Readiness` › `Roadmap`
5. **Document Canvas:** `Orynqo` › `Docs` › `Specs` › `PRD: Offline Sync Protocol`

### 14.2. Truncation & Dropdown Navigation
- If viewport width is constrained, intermediary breadcrumbs collapse into an ellipsis `› ... ›`.
- Clicking any breadcrumb ancestor opens a quick sibling dropdown (e.g., clicking `Core Platform` allows instant switching to `Mobile Studio` or `Web Studio`).

---

## 15. View Projection Controls (The "HOW" Boundary)

View Projections belong strictly to the **Resource Action Bar**, never to the Sidebar:

### 15.1. Projection Switcher Matrix

| Projection Type | Canonical ID | Visual Metaphor | Optimal Work Context |
| :--- | :--- | :--- | :--- |
| **DataGrid (Table)** | `WRK-001` | High-density tabular grid | Bulk triage, rapid keyboard editing, sorting, multi-column analysis |
| **Kanban Board** | `WRK-002` | Columnar state lanes | Sprint flow, status progression, drag-and-drop workflow |
| **Timeline (Gantt)** | `WRK-003` | Chronological bar chart | Dependency sequencing, date roadmaps, cycle milestones |
| **Workload** | `WRK-004` | Capacity bar chart | Team member capacity, point allocation, burnout balancing |

### 15.2. Projection State Persistence
- Active projection choice is persisted per-resource in user local storage:
  - Example: `orynqo:projection:team-core:work = "kanban"`
  - When returning to `Core Platform Work`, the user's last chosen projection is automatically restored.

---

## 16. Inspector Integration (UI-01A Frozen Baseline)

The Application Shell accommodates the frozen UI-01A WorkItem Inspector without layout corruption:

```text
┌────────────────────────────────────────────────────────┐
│ Main Viewport Canvas (Grid/Board) │ Inspector Drawer   │
│                                   │ (Width: 440px)     │
│ [Row 1] Canonical Issue Title    │ ID: ENG-104        │
│ [Row 2] Active Selection ========│ Status: In Progress│
│ [Row 3]                          │ Priority: Urgent   │
│ [Row 4]                          │ Discussion & Specs │
└───────────────────────────────────┴────────────────────┘
```

### 16.1. Inspector Invariants
1. **Initial Arrival:** Inspector is **closed by default** on clean application load (`isInspectorOpen: false`).
2. **Explicit Open:** Triggered by selecting a work item and pressing `Enter`, clicking the row detail affordance, or `Quick Create & Open`.
3. **Canvas Adaptation:** On desktop ($\ge 1200\text{px}$), the Inspector reserves horizontal layout width (`440px`), compressing the DataGrid canvas smoothly without breaking column alignments.
4. **Reclaim Canvas:** Closing the Inspector (`Escape` or close button) immediately reclaims full width for the canvas and restores focus to the originating row.
5. **No Navigation Collision:** Opening, closing, or navigating within the Inspector has **zero side-effects** on Sidebar selection or active breadcrumb routes.

---

## 17. Quick Create Integration (UI-01C Frozen Baseline)

The global Quick Create modal (`CMD-002`) integrates into the shell as a high-speed creation overlay:

### 17.1. Invocation Points
- Pressing `C` anywhere in the application (outside of active text inputs or overlays).
- Clicking `+ New Item` in the Context Bar.
- Command Palette action: `> Create New Work Item`.

### 17.2. Contextual Pre-Population Matrix
The Shell injects its current spatial context into `useQuickCreate`:

| Active Shell Location | Injected Context Parameters | Quick Create Behavior |
| :--- | :--- | :--- |
| **Global (Inbox / My Work / Docs)** | `{}` (Empty) | User must explicitly select Team from `TeamPicker`; Project and Cycle pickers remain disabled until Team is chosen. |
| **Team Hub (`/teams/core`)** | `{ teamId: "team-core" }` | Team is pre-selected; default workflow status pre-populated; project picker filtered to team projects. |
| **Active Cycle (`/teams/core/cycles/42`)** | `{ teamId: "team-core", cycleId: "cycle-42" }` | Team and Cycle pre-selected; work item is automatically committed to the active cycle. |
| **Project Canvas (`/projects/auth-v2`)** | `{ projectId: "proj-auth", teamId: "team-core" }` | Project pre-selected; team resolved from project primary squad. |

---

## 18. Command Palette Integration (`CMD-001`)

The shell coordinates directly with `CommandPalette.jsx` (`⌘K` / `Ctrl+K`):

### 18.1. Shell Command Contributions
The shell registers global navigation commands into the command registry:
- **Navigation:**
  - `Go to Inbox` (`G then I`)
  - `Go to My Work` (`G then M`)
  - `Go to Initiatives`
  - `Go to Docs`
  - `Go to Saved Views`
  - `Browse Teams` (`G then T`)
- **Recent Resources:** Top 5 recently visited Teams, Projects, and Docs.
- **Actions:**
  - `Create Work Item...` (`C`)
  - `Toggle Sidebar` (`⌘[` or `Ctrl+[`)
  - `Switch Workspace...` (`Ctrl+Alt+W`)
  - `Toggle Theme` (`Dark` / `Light`)
  - `Open Keyboard Shortcuts` (`?`)

---

## 19. Routing Semantics & Deep-Link Architecture

While exact URI syntax remains adaptable to framework routers (React Router, Next.js, or browser History API), the **routing semantics** are formally frozen:

### 19.1. Canonical Route Matrix

| Surface Intent | Semantic URI Pattern | Scope & Gating |
| :--- | :--- | :--- |
| **Personal Inbox** | `/inbox` | Authenticated user |
| **My Work Cockpit** | `/my-work` | Authenticated user |
| **Initiatives Hub** | `/initiatives` | Workspace members |
| **Initiative Detail** | `/initiatives/:initiativeId` | Workspace members |
| **Docs Hub** | `/docs` | Workspace members |
| **Canonical Document** | `/docs/:documentId` | Read / edit permission |
| **Saved Views Hub** | `/views` | Workspace members |
| **Saved View Execution** | `/views/:viewId` | View access level |
| **Teams Directory** | `/teams` | Workspace members |
| **Team Overview** | `/teams/:teamId` | Team visibility |
| **Team Work Projection** | `/teams/:teamId/work?view=grid\|board` | Team visibility |
| **Team Active Cycle** | `/teams/:teamId/cycles/current` | Cycle capability enabled |
| **Team Cycle Detail** | `/teams/:teamId/cycles/:cycleId` | Cycle capability enabled |
| **Projects Directory** | `/projects` | Workspace members |
| **Project Overview** | `/projects/:projectId` | Project visibility |
| **Project Work** | `/projects/:projectId/work` | Project visibility |
| **Personal Settings** | `/settings/profile` | Self only |
| **Workspace Settings** | `/settings/workspace` | Workspace Admin |
| **Enterprise Admin** | `/admin/security` | Organization Admin |

### 19.2. Query Parameters for Transient State
- **Active WorkItem Inspector:** `?item=ENG-104` (Enables deep-linking directly into open item details while preserving background grid context).
- **Active Projection:** `?view=board` or `?view=grid`.
- **Search Query & Filters:** `?q=auth&status=in_progress`.

---

## 20. Bottom Utility Area

The Bottom Utility Area anchors personal identity, support, and administrative settings:

```text
┌────────────────────────────────────────────────────────┐
│ [Avatar] Younas Khan (Lead)           [Theme] [Help ?] │
│ Settings: [ Personal  |  Workspace ⚙️  |  Admin 🛡️ ]    │
└────────────────────────────────────────────────────────┘
```

### 20.1. User Profile & Account Trigger
- Renders `UserAvatar`, full name, and online status badge.
- Clicking opens the User Profile Menu:
  - Edit Profile & Status.
  - Notification Preferences.
  - Sign Out.

### 20.2. Role-Partitioned Settings Entry
Settings are explicitly separated by administrative authority:
1. **Personal Settings (`PER-003`):** Available to all users (theme, account details, keybindings, notifications).
2. **Workspace Settings (`WKS-001` to `WKS-004`):** Visible only to `Workspace Admins` (team creation rules, member management, workflow states, integrations).
3. **Organization Administration (`ADM-001` to `ADM-003`):** Visible only to `Org Admins` (SSO/SAML, audit logs, billing, legal policies).

---

## 21. Navigation State Model & Ownership Boundaries

To eliminate the anti-pattern of a monolithic React context, state is strictly partitioned across four distinct tiers:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. URL / NAVIGATION STATE (Address Bar)                                │
│    - Active Workspace, Active Container, Resource ID, Sub-Tab,         │
│      Inspector Deep Link (?item=ID), Active Projection (?view=grid)    │
├────────────────────────────────────────────────────────────────────────┤
│ 2. PERSISTENT USER PREFERENCES (localStorage / User Profile)          │
│    - isSidebarCollapsed, sidebarWidth, lastSelectedProjectionPerView,   │
│      densityMode, favoritesOrder, expandedSidebarSections              │
├────────────────────────────────────────────────────────────────────────┤
│ 3. SERVER / DOMAIN STATE (Cache & Entity Store)                        │
│    - WorkItems, Teams, Projects, Docs, Cycles, Workspace Membership    │
├────────────────────────────────────────────────────────────────────────┤
│ 4. EPHEMERAL UI STATE (React Local State / Overlay Context)            │
│    - isCommandPaletteOpen, isQuickCreateOpen, isShortcutsOpen,         │
│      activePickerOpenId, quickSearchDraft, dragOverActive              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 22. Sidebar Expansion & Collapsed Modes

### 22.1. Dimension Tokens
- **Expanded Width:** `var(--sidebar-width)` (default `240px`).
- **Collapsed Rail Width:** `var(--sidebar-collapsed-width)` (default `52px`).
- **Mobile Drawer Width:** `min(85vw, 320px)`.

### 22.2. Collapsed Rail Interaction
When collapsed (`isSidebarCollapsed: true`):
- Sidebar collapses into a high-density icon rail.
- Navigation links render strictly centered icons (`16px`).
- Hovering any icon displays a floating tooltip with label and keyboard shortcut after a `150ms` delay.
- Section headers collapse into subtle divider lines (`1px solid var(--border-subtle)`).
- Clicking the Workspace Monogram opens the Workspace Switcher popover to the right.
- Pressing `⌘[` or clicking `PanelLeftOpen` expands the sidebar back to `240px`.

### 22.3. Sidebar Resizing Evaluation & Decision
- **Evaluation:** Arbitrary pixel dragging adds excessive drag-event overhead, layout thrashing, and fragile breakpoint states for minimal utility in a structured design system.
- **Frozen Decision:** **Fixed Semantic Modes with Double-Click Reset.**
  - Standard Mode: `240px` (optimized for readability and high-density labels).
  - Compact Mode: `52px` (icon rail for maximum canvas focus).
  - Optional user-drag border is constrained strictly between `200px` (min) and `320px` (max). Double-clicking the border automatically snaps back to the semantic baseline (`240px`).

---

## 23. Permission & Capability Behavioral Engine

### 23.1. Zero-Leakage Permission Architecture
- **Inaccessible Resources:** If a user does not have permission to view a Team, Project, or Document, the sidebar **never** displays the item name, icon, or metadata.
- **Direct Link Gating:** Navigating to an unauthorized URL renders `SYS-001: Access Denied / Request Access` without confirming the existence of sensitive entity names.
- **Guest Limitations:** External guest accounts do not see administrative settings, internal directories, or billing consoles.

### 23.2. Dynamic Capability Composition
Teams declare active capabilities (`cycles`, `triage`, `projects`, `docs`, `automations`):
- If `team.capabilities.cycles === false`:
  - The `Current Cycle` sub-link is excluded from the Sidebar.
  - The `Cycles` tab is excluded from Team Resource Navigation.
  - Work item pickers for this team hide cycle options.
- If `team.capabilities.triage === false`:
  - The `Triage` tab is excluded from Team Resource Navigation.

---

## 24. Loading, Empty, and Error States

1. **Workspace Loading:**
   - Sidebar renders structural pulsing skeleton bars for Workspace switcher, Personal items, and Teams.
   - Prevents layout shift or navigation jumping upon data arrival.
2. **No Teams Joined:**
   - Teams section renders a compact empty affordance: `No teams yet. [Explore Teams]`.
3. **No Favorites:**
   - Favorites section displays a subtle one-line helper: `Pin projects & docs here for quick access`.
4. **Network Disconnection:**
   - Shell renders a persistent, non-intrusive offline indicator strip at top: `Network offline — Changes queued locally`.
   - Navigation continues operating across cached resources.
5. **Resource Deleted / Tombstone:**
   - If an active resource is deleted in the background, the shell replaces the main canvas with a clean tombstone: `This project was deleted. [Return to Projects Directory]`.

---

## 25. Keyboard Navigation & Focus Engine

Navigation adheres strictly to the approved **Global Keyboard Scope Hierarchy**:

```text
GLOBAL (⌘K, C, ⌘[, ?)
   ↓
PAGE / VIEW (Arrow keys, J/K, Enter, Space)
   ↓
OVERLAY (Dialogs, Quick Create, Command Palette)
   ↓
EDITABLE CONTROL (Input, Textarea, Search field)
```

### 25.1. Shell Keyboard Shortcut Map

| Shortcut Intent | Primary Binding | Secondary Binding | Behavior |
| :--- | :--- | :--- | :--- |
| **Command Palette** | `⌘K` | `Ctrl+K` | Opens global command launcher overlay. |
| **Quick Create** | `C` | — | Opens Quick Create modal with current context. |
| **Toggle Sidebar** | `⌘[` | `Ctrl+[` | Toggles between expanded (`240px`) and collapsed (`52px`). |
| **Go to Inbox** | `G then I` | — | Immediate navigation to `PER-001`. |
| **Go to My Work** | `G then M` | — | Immediate navigation to `PER-002`. |
| **Go to Teams** | `G then T` | — | Immediate navigation to `TEM-001`. |
| **Switch Workspace** | `Ctrl+Alt+W` | — | Opens Workspace Switcher popover. |
| **Keyboard Cheat-sheet** | `?` | `Shift+/` | Opens Shortcuts cheat-sheet modal. |
| **Focus Sidebar** | `Alt+1` | — | Moves DOM focus to active sidebar item. |
| **Focus Main Canvas** | `Alt+2` | — | Moves DOM focus to top of main workspace canvas. |
| **Focus Inspector** | `Alt+3` | — | Moves DOM focus to open Inspector drawer. |

---

## 26. Accessibility Contract (WCAG 2.2 AA Target)

1. **Landmark Semantics:**
   - Sidebar wrapped in `<aside role="navigation" aria-label="Workspace navigation">`.
   - Context Bar wrapped in `<header role="banner" aria-label="Resource context">`.
   - Main Canvas wrapped in `<main role="main" aria-label="Primary content">`.
   - Inspector wrapped in `<section role="region" aria-label="Work item details">`.
2. **Current Location Semantics:**
   - Active navigation item explicitly flagged with `aria-current="page"` or `aria-current="location"`.
   - Collapsible sections use `aria-expanded="true|false"` and `aria-controls="section-id"`.
3. **Keyboard Focus Ring:**
   - Every interactive control features high-visibility outline: `2px solid var(--primary-base)` with `2px offset`. Focus is never hidden.
4. **Screen Reader Live Announcements:**
   - Unread inbox updates and workspace switches announce state via `<div aria-live="polite" class="sr-only">`.

---

## 27. Responsive Architecture & Mobile Adaptation

```text
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│ WIDE DESKTOP            │ COMPACT DESKTOP / TABLET│ MOBILE VIEWPORT         │
│ (≥ 1200px)              │ (768px – 1199px)        │ (< 768px)               │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ Persistent 240px        │ Collapsed 52px icon     │ Sidebar hidden off-     │
│ Sidebar.                │ rail by default.        │ canvas; slides in as a  │
│ Split-pane Inspector.   │ Slide-over Inspector    │ full overlay drawer.    │
│ Both visible.           │ overlay.                │ Resource tabs scroll    │
│                         │                         │ horizontally.           │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

### 27.1. Viewport Adaptation Breakpoints
- **$\ge 1200\text{px}$ (Wide Desktop):** Full experience. Sidebar expanded (`240px`), canvas full, Inspector opens as split panel.
- **$768\text{px}$–$1199\text{px}$ (Compact Desktop / Tablet):** Sidebar defaults to collapsed (`52px`); can be temporarily expanded. Inspector slides over canvas as a drawer (`z-index: 50`).
- **$< 768\text{px}$ (Mobile Viewport):**
  - Desktop sidebar is removed from static document flow and renders as a slide-in sheet (`z-index: 100`) triggered via a hamburger menu in the mobile header.
  - Resource Navigation tabs render as a horizontally swipeable rail with subtle gradient fade on scroll edges.
  - Inspector opens full-screen (`100vw` × `100vh`).

---

## 28. Density & Motion Design

### 28.1. High-Density Layout Metrics
- **Sidebar Items:** Height `28px`, padding `0 8px`, border-radius `var(--radius-xs)` (`4px`), font size `var(--text-xs)` (`12px`).
- **Context Bar:** Height `44px`, breadcrumbs font size `12px`, action buttons size `sm` (`28px`).
- **Resource Tab Strip:** Height `34px`, tab font size `12px`, padding `0 10px`.
- **Canvas Gaps:** Zero extraneous margin; maximum density for tabular data presentation.

### 28.2. Functional Motion Principles
- Restrained CSS transitions only:
  - Sidebar width transition: `width 200ms cubic-bezier(0.16, 1, 0.3, 1)`.
  - Drawer slide-in: `transform 220ms cubic-bezier(0.16, 1, 0.3, 1)`.
  - Overlay fade: `opacity 150ms ease-out`.
- **Reduced Motion:** If `prefers-reduced-motion: reduce` is active, all durations collapse to `0ms` (instant toggle).

---

## 29. Reusable Component Architecture & Decomposition

The production shell is cleanly decomposed according to established architectural tiers:

```text
src/
├── layouts/
│   ├── AppShell/
│   │   ├── AppShell.jsx                   # Master layout grid & region coordinator
│   │   └── AppShell.module.css            # Grid & flex container layout rules
│   ├── Sidebar/
│   │   ├── Sidebar.jsx                    # Production sidebar container
│   │   ├── SidebarHeader.jsx              # Workspace switcher anchor & collapse button
│   │   ├── SidebarSection.jsx             # Collapsible section with heading & count
│   │   ├── SidebarItem.jsx                # High-density item with icon, label, badge, kbd
│   │   └── SidebarFooter.jsx              # User avatar, status, theme, help, settings
│   └── ContextBar/
│       ├── ContextBar.jsx                 # Top-tier context & action coordinator
│       ├── ContextBreadcrumbs.jsx         # Navigable breadcrumb trail
│       └── ResourceNavBar.jsx             # Reusable contextual resource tabs
│
├── components/navigation/
│   ├── WorkspaceSwitcher/
│   │   ├── WorkspaceSwitcherPopover.jsx   # Searchable multi-workspace selector
│   │   └── WorkspaceItem.jsx              # Individual workspace row
│   ├── Favorites/
│   │   ├── FavoritesList.jsx              # Reorderable list of favorite pointers
│   │   └── FavoriteItem.jsx               # Polymorphic favorite target link
│   ├── Teams/
│   │   ├── TeamSidebarGroup.jsx           # Joined team item with cycle quick-link
│   │   └── BrowseTeamsModal.jsx           # Team discovery & search modal
│   └── Projections/
│       └── ProjectionSwitcher.jsx         # Segmented control for Grid/Board/Timeline
│
└── hooks/
    ├── useNavigationState.js              # URL & active destination resolver
    └── useSidebarPreferences.js           # Collapsed state, widths, section toggles
```

---

## 30. Component Classification Matrix

| Component Name | Layer Classification | Reusability Scope | Domain Logic Ownership |
| :--- | :--- | :--- | :--- |
| `AppShell` | Shell Layout | Global Layout | Zero domain logic; pure spatial coordinator |
| `Sidebar` | Shell Layout | Global Navigation | Receives items/routes; renders navigation hierarchy |
| `SidebarItem` | Design System Composite | Global Navigation | Presentational (icon, label, badge, active state) |
| `SidebarSection` | Design System Composite | Global Navigation | Presentational (collapsible header, chevron, title) |
| `ContextBar` | Shell Layout | Global Header | Coordinates breadcrumbs, tabs, and primary action |
| `ResourceNavBar` | Global Product Navigation | Reusable across Resources | Renders tabs for Team, Project, Initiative; zero hardcoded entities |
| `WorkspaceSwitcherPopover` | Global Product Navigation | Multi-Tenant Navigation | Connects to WorkspaceContext; handles workspace switching |
| `FavoritesList` | Domain Adapter | Workspace Favorites | Maps generic Favorite pointers to clickable routes |
| `ProjectionSwitcher` | Global Product Navigation | Work Execution Views | Switches active visual lens (Grid, Board, Timeline) |

---

## 31. Interaction Matrix

| User Trigger | State Transition | Navigation / Shell Effect | Focus / Accessibility Effect | Persistence Effect |
| :--- | :--- | :--- | :--- | :--- |
| **Click Sidebar Item** | `activeDestination` updates | Routes to target URL / surface | Focus remains on clicked item | None (URL state) |
| **Press ⌘[ or Toggle Button** | `isSidebarCollapsed` toggled | Width animates `240px` $\leftrightarrow$ `52px` | Focus remains on toggle button | Saved to `localStorage` |
| **Click Workspace Switcher** | `isWorkspacePopoverOpen: true` | Popover opens anchored to rail | Focus traps inside popover search | None |
| **Select New Workspace** | `workspaceId` updates | Shell re-initializes with new tenant data | Focus resets to top of Sidebar | Saved as last active workspace |
| **Click Favorite Item** | Routes to target entity | Opens Project, Doc, or View | Focus on destination container | None |
| **Star Resource Page** | New Favorite pointer created | Instant optimistic item in Favorites | Focus remains on star button | API mutate + cached state |
| **Press `C` (Global)** | `isQuickCreateOpen: true` | Quick Create modal opens | Focus traps to `Title` input | None |
| **Press `⌘K` (Global)** | `isCommandPaletteOpen: true` | Command Palette overlay opens | Focus traps to search input | None |
| **Click Resource Tab (e.g. Work)** | `activeSubTab` updates | Main canvas mounts tab content | Active tab receives `aria-selected="true"` | Synced to URL sub-route |
| **Click Projection (Board)** | `activeProjection: "board"` | Canvas switches from Grid to Board | Active button receives focus | Saved per-resource in `localStorage` |
| **Select WorkItem in Grid** | `selectedItemId: ID` | Inspector opens (`isInspectorOpen: true`) | Focus preserved in Grid or moves to Inspector | Synced to query `?item=ID` |
| **Press `Escape` in Inspector** | `isInspectorOpen: false` | Inspector closes; canvas reclaims width | Focus restored to originating Grid row | Query param removed |
| **Click Mobile Hamburger** | `isMobileNavOpen: true` | Drawer slides in over content | Focus moves to first navigation item | None |

---

## 32. State Ownership Matrix

| State Property | Primary State Owner | Storage Mechanism | Consumer Components | Invalidation / Rollback Rule |
| :--- | :--- | :--- | :--- | :--- |
| **`organizationId`** | URL / Tenant Context | Session Token / URL | Entire Shell | Changing Org clears all workspace caches |
| **`workspaceId`** | URL / WorkspaceContext | URL path / `localStorage` | Entire Shell | Changing Workspace re-fetches teams/views |
| **`currentResource`** | URL Router | URL path | `ContextBar`, `MainCanvas` | 404 routes to `SYS-001` or directory |
| **`activeResourceTab`** | URL Router | URL sub-path / query | `ResourceNavBar`, `MainCanvas` | Invalid tab defaults to `Overview` |
| **`activeProjection`** | Preference + URL | `localStorage` + `?view=` | `ProjectionSwitcher`, `MainView` | Default is `grid` if unset |
| **`isSidebarCollapsed`** | User Preference | `localStorage` | `Sidebar`, `AppShell` | Persisted across browser sessions |
| **`expandedSections`** | User Preference | `localStorage` | `SidebarSection` | Persisted across browser sessions |
| **`favoritePointers`** | Server Cache | SWR / React Query cache | `FavoritesList` | Optimistic reorder with server rollback |
| **`recentTeams`** | User Preference | `localStorage` | `TeamSidebarGroup` | Capped at 10 most recent IDs |
| **`isInspectorOpen`** | UI State + URL | Query `?item=ID` | `AppShell`, `WorkItemInspector` | Cleared on item deselection or Escape |
| **`isQuickCreateOpen`** | Ephemeral UI State | React State | `QuickCreateDialog` | Cleared on Submit, Cancel, or Escape |
| **`isCommandPaletteOpen`**| Ephemeral UI State | React State | `CommandPalette` | Cleared on action execute or Escape |

---

## 33. IA-03 Surface Mapping & Shell Reachability

The Application Shell provides deterministic reachability for all 50 canonical surfaces defined in `docs/06-complete-page-and-surface-registry.md`:

```text
┌─────────────────────────┬──────────────┬────────────────────────────────────────────────────────┐
│ IA-03 Surface Group     │ Surface IDs  │ Shell Reachability Path                                │
├─────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ Personal Surfaces       │ PER-001..003 │ Sidebar > Personal (Inbox, My Work, Profile Settings)  │
│ Work Projections        │ WRK-001..006 │ ContextBar Projection Controls (Grid, Board, Timeline) │
│ Team Surfaces           │ TEM-001..008 │ Sidebar > Teams > Resource Tabs (Work, Docs, Triage)   │
│ Cycle Surfaces          │ CYC-001..003 │ Sidebar Team Sub-link OR Team Resource Tabs > Cycles   │
│ Project Surfaces        │ PRJ-001..007 │ Team Projects Tab, Initiatives, Favorites, Projects Dir│
│ Strategic Initiatives   │ INT-001..004 │ Sidebar > Workspace > Initiatives (Roadmap & Rollups)  │
│ Canonical Documents     │ DOC-001..003 │ Sidebar > Workspace > Docs OR Team/Project Docs Tabs   │
│ Saved Views             │ VEW-001..002 │ Sidebar > Workspace > Views OR Favorites shortcuts    │
│ Overlays & Commands     │ CMD-001..003 │ Global Hotkeys: ⌘K (Palette), C (Create), ? (Help)     │
│ Workspace Settings      │ WKS-001..004 │ Sidebar Footer > Settings > Workspace Administration   │
│ Enterprise Admin        │ ADM-001..003 │ Sidebar Footer > Settings > Enterprise Admin Console   │
│ Global System Surfaces  │ SYS-001..003 │ Ambient shell error boundary & offline status banner   │
└─────────────────────────┴──────────────┴────────────────────────────────────────────────────────┘
```

---

## 34. Migration From Current Prototype

Detailed classification of current prototype files in `src/`:

| Prototype File / State | Classification | Architectural Action & Technical Justification |
| :--- | :--- | :--- |
| `src/layouts/AppShell.jsx` | **REFACTOR** | **Keep** overall 4-region spatial grid; **refactor** layout styles to support semantic width tokens (`--sidebar-width`, `--sidebar-collapsed-width`), responsive breakpoints, and mobile drawer overlay mode. |
| `src/layouts/Sidebar/Sidebar.jsx` | **REPLACE** | **Replace** the monolithic 403-line prototype with modular components (`SidebarHeader`, `SidebarSection`, `SidebarItem`, `SidebarFooter`). De-couple hardcoded teams and mock data; bind to dynamic joined teams and Favorites pointer model. |
| `src/layouts/ActionStrip/ActionStrip.jsx` | **REPLACE** | **Replace** with two modular tiers: `ContextBar` (Identity, Breadcrumbs, Density, Primary Action) and `ResourceNavBar` (Reusable contextual tabs) + `ProjectionSwitcher`. Remove embedded hardcoded tabs. |
| `src/App.jsx` | **REFACTOR** | **Refactor** to consume new modular shell and resource router. Remove inline layout switch statements; integrate clean route/context binding. |
| `src/app/providers/UIContext.jsx` | **REFACTOR** | **Refactor** to separate ephemeral UI state (`isCommandPaletteOpen`, `isCreateModalOpen`) from navigation state and persistent preferences (`isSidebarCollapsed`, `density`). |

---

## 35. Implementation Plan for Phase UI-02B

Upon Human Review approval of this UI-02A contract, implementation will proceed systematically in UI-02B:

1. **Step 1: Navigation State & Hook Infrastructure:**
   - Implement `useNavigationState.js` and `useSidebarPreferences.js` (with `localStorage` persistence).
2. **Step 2: Shell Frame & Responsive Layout Grid:**
   - Refactor `AppShell.jsx` with semantic CSS variables, responsive container queries, and mobile drawer wrapper.
3. **Step 3: Modular Sidebar Primitives:**
   - Build `SidebarSection.jsx`, `SidebarItem.jsx`, and `SidebarFooter.jsx`.
4. **Step 4: Workspace Switcher:**
   - Build `WorkspaceSwitcherPopover.jsx` supporting active workspace display, search, and switching.
5. **Step 5: Dynamic Favorites System:**
   - Implement `FavoritesList.jsx` and `FavoriteItem.jsx` consuming generic pointer data.
6. **Step 6: Scalable Team Navigation:**
   - Implement `TeamSidebarGroup.jsx` with joined-squad filtering, cycle sub-link, and `Browse all teams...` trigger.
7. **Step 7: ContextBar & ResourceNavBar:**
   - Construct Tier 1 `ContextBar.jsx` (breadcrumbs, density, `+ New Item`) and Tier 2 `ResourceNavBar.jsx`.
8. **Step 8: Projection Controls Integration:**
   - Construct `ProjectionSwitcher.jsx` and wire seamlessly into frozen UI-01 DataGrid, Board, and Timeline.
9. **Step 9: Overlays & Inspector Verification:**
   - Verify zero-regression integration with frozen UI-01 WorkItem Inspector, Quick Create, and Command Palette.
10. **Step 10: Keyboard Scopes & Accessibility Polish:**
    - Wire `Alt+1`, `Alt+2`, `Alt+3`, `⌘[`, and roving tabindex. Verify WCAG 2.2 AA focus rings and ARIA attributes.
11. **Step 11: Regression Test Suite:**
    - Implement comprehensive test suite covering all interaction matrix rows, responsive states, and navigation transitions.

---

## 36. Explicit Frozen Decisions

The following architectural decisions are **FROZEN** and must **NOT** be reopened during UI-02B:
1. **The Spatial Mental Model:** `SIDEBAR = WHERE`, `RESOURCE NAVIGATION = WHAT`, `PROJECTION CONTROLS = HOW`, `INSPECTOR = DETAIL`, `COMMAND PALETTE = LONG-TAIL`.
2. **No Projections in Sidebar:** DataGrid, Kanban, Timeline, and Workload never appear as top-level sidebar items.
3. **Docs as Global Knowledge Label:** Houses all knowledge artifacts under a single canonical document entity model.
4. **Generic Favorites Pointer Model:** Polymorphic pointer (`userId`, `workspaceId`, `targetType`, `targetId`, `position`).
5. **Team Progressive Disclosure:** Sidebar shows only joined/pinned teams (max 7 default); never renders all 300+ teams. At most 1 sub-link per team (active cycle).
6. **Projects are Multi-Team:** Projects are never forced into a single-parent tree under Teams in the sidebar.
7. **Fixed Semantic Density Modes:** Sidebar width is `240px` (expanded) or `52px` (collapsed icon rail). No arbitrary unbounded pixel resizing.
8. **Inspector Non-Interference:** Opening/closing Inspector does not mutate sidebar navigation or breadcrumb location.
9. **Zero-Leakage Invariants:** Inaccessible resources are hidden or rendered as generic placeholders without metadata leakage.

---

## 37. Unresolved Questions for Human Review

1. **Team Quick-Link Default:**
   - *Current Contract:* Shows **at most one** sub-link under a team: `Current Cycle` (if active cycle exists).
   - *Alternative for Consideration:* Provide a user preference to also pin `Team Work` directly as a second sub-link in the sidebar.
   - *Recommendation:* Keep the current contract (1 sub-link maximum) to protect vertical density across multi-team users.
2. **Breadcrumb Sibling Switching:**
   - *Current Contract:* Clicking an intermediary breadcrumb opens a sibling dropdown menu (e.g. switch between sibling teams).
   - *Alternative for Consideration:* Standard clickable link that navigates to the container page without dropdown.
   - *Recommendation:* Support both: clicking the text navigates; clicking a tiny chevron icon opens the sibling dropdown.
