# Orynqo Platform — Application Shell & Production Sidebar Contract (Phase UI-02A)

**Status:** UI-02A — FINAL DESIGN & PRODUCT CONTRACT (Pass 01A Corrections Applied — Ready for Final Human Review)  
**Governing Methodology:** `antigravity-enterprise-product-design`  
**Preceding Milestones:**  
- `Architecture & Design-System Stabilization (APPROVED)`  
- `Phase IA-01 Competitive Navigation Research (APPROVED)`  
- `Phase IA-02 Sidebar Architecture & Navigation Contract (APPROVED & FROZEN)`  
- `Phase IA-03 Complete Page & Surface Registry (APPROVED & FROZEN)`  
- `UI-01 Execution Core Milestone (UI-01A → UI-01B → UI-01C → UI-01D) (APPROVED & FROZEN ON MAIN at commit 7856067)`  
**Current Phase:** `UI-02A Application Shell & Production Sidebar Contract (Correction Pass 01A)`  
**Subsequent Phase:** `UI-02B Application Shell & Production Sidebar Implementation (Awaiting Human Review)`  
**Implementation Freeze:** STRICTLY ENFORCED (Design & Contract phase only; zero production UI code modified; zero changes to frozen UI-01 Execution Core)  

---

## 1. Phase Status & Scope

Phase `UI-02A` establishes the authoritative interaction and engineering contract for the **Orynqo Application Shell** and **Production Sidebar**. 

The goal of UI-02 is to construct the persistent, responsive, keyboard-first workspace frame that hosts the frozen UI-01 Execution Core today, and scales cleanly to host all 50 canonical surfaces defined in `docs/06-complete-page-and-surface-registry.md` without requiring architectural refactoring.

### Phase Boundaries
- **IN SCOPE:**
  - Defining the complete spatial mental model, layout regions, and semantic z-index strata.
  - Formulating the Production Sidebar architecture, hierarchy, and progressive disclosure model.
  - Designing the Organization/Workspace Switcher contract for multi-tenant and multi-workspace scale.
  - Defining the Generic Favorites pointer model, lifecycle, and server/domain state ownership.
  - Establishing Team scale architecture (supporting 3 to 300+ squads without sidebar bloat).
  - Unifying the Context/Action Strip, Breadcrumbs, and reusable Resource Navigation tabs.
  - Establishing the Projection Control integration contract (Grid, Board, Timeline, Workload) with deterministic URL/preference precedence.
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
   - System state registry: `SYS-001` (404/Tombstone), `SYS-002` (Permission Denied/Access Request), `SYS-003` (Network Disconnection/Sync Status).
5. **UI-01 Execution Core (`UI-01A → UI-01D`):**
   - WorkItem Inspector drawer architecture, zero-leakage placeholders, optimistic rollback invariants, high-density DataGrid projection, Universal Property Pickers, and Quick Create dialog.

---

## 3. Shell Responsibility & Spatial Geometry Model

The Orynqo Desktop Application Shell operates as a coordinated 4-region spatial grid with an independent semantic overlay layer:

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
│ 5. SEMANTIC OVERLAY STRATA                                                             │
│    - Floating Popovers (Property Pickers) > Dialogs/Modals > Drawers > Base Shell      │
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
- **Sidebar Rail:** Left-aligned, fixed height `100%`, semantic width `--sidebar-width` (default visual baseline `240px`) or `--sidebar-collapsed-width` (`52px`).
- **Context Column:** Right of sidebar, flex `1 1 auto`, `min-width: 0`, column flex:
  - Top: `ContextBar` (`var(--header-height)` = current default `44px`).
  - Optional sub-strip: `ResourceNavStrip` (current default height `36px` when resource tabs active).
  - Center: `main` content canvas (`flex: 1`, `overflow: hidden`).
- **Inspector Placement:**
  - On wide desktop viewports: Horizontal split inside main workspace column, occupying semantic width `--inspector-width` (current default `440px`). Main canvas shrinks cleanly without horizontal scrollbars.
  - On constrained viewports: Slide-over overlay drawer anchored right with backdrop.
- **Semantic Overlay Strata (Z-Index Architecture):**
  Arbitrary local z-index escalation is prohibited. The shell enforces semantic strata:
  - `Base Shell`: Default stacking context (`z-index: 0`).
  - `Sticky Navigation / Headers`: Local elevated context (`z-index: 10–20`).
  - `Inspector / Slide-over Drawer`: Contextual drawer overlay (`z-index: 50`).
  - `Modal / Dialog Surface`: Standard focused overlays e.g. Quick Create, Shortcuts (`z-index: 100`).
  - `Floating Popover / Picker Surface`: Property pickers and dropdown menus (`z-index: 200`). *As established in UI-01D, pickers rendered inside modals portal above the modal surface.*
  - `Critical Confirmation / Alert`: High-priority interruptions e.g. Team Change Confirmation (`z-index: 300`).

---

## 4. Architectural Behaviors vs. Tunable Parameters

To prevent over-freezing implementation details while establishing strict architectural invariants, the system differentiates:

```text
┌───────────────────────────────────────────────┬───────────────────────────────────────────────┐
│ ARCHITECTURAL BEHAVIORS (FROZEN)              │ TUNABLE DESIGN TOKENS & POLICIES (TUNABLE)    │
├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ • Expanded vs Collapsed vs Mobile Sidebar     │ • Current baseline widths (240px, 52px)       │
│ • Desktop split Inspector vs Viewport overlay │ • Current baseline header heights (44px, 36px)│
│ • Progressive disclosure for Teams & Favorites│ • Current baseline row heights (28px, 34px)   │
│ • Canonical Teams Directory (TEM-001)         │ • Inspector baseline width (440px)            │
│ • Canonical Projects Directory (PRJ-007)      │ • Responsive adaptation thresholds (1200, 768)│
│ • Searchable Workspace Switcher               │ • Initial visible counts (7 Teams, 10 Favs)   │
│ • Windowing/virtualization when scale requires│ • Transition animation timings (200ms, 150ms) │
└───────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

1. **Architectural Behaviors (Frozen):** Core structural rules, lifecycle contracts, precedence rules, and spatial divisions that cannot be altered without platform redesign.
2. **Design-Token Defaults (Tunable):** Exact pixel measurements, transition durations, and font sizes that are managed via semantic CSS custom properties and may be adjusted during visual polish.
3. **Scale-Policy Defaults (Tunable):** Numerical thresholds for when search inputs become visible, when sub-lists truncate, and when data windowing is mounted based on collection size and profiling.

---

## 5. Production Sidebar Architecture & Structural Hierarchy

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
├── 6. TEAMS                                        (Collapsible Section — Joined Squads & Progressive Discovery)
│   ├── [Team A]                                   (Active/Pinned team: direct navigation to Team Hub)
│   │   └── Current Cycle                          (Conditional: visible only if active cycle exists)
│   ├── [Team B]                                   (Continuous delivery team: direct navigation)
│   └── [+ Browse all teams...]                    (TEM-001: Canonical Teams Directory navigation)
│
└── 7. BOTTOM UTILITY RAIL
    ├── User Profile & Presence                     (Avatar, Name, Status, Switch accounts)
    ├── Help & Keyboard Shortcuts                   (Shortcut cheat-sheet trigger: ?)
    └── Settings                                    (Role-aware menu: Personal, Workspace, Org Admin)
```

---

## 6. Organization / Workspace Switcher Contract

### 6.1. Tenant Architecture Boundary
- **Organization (Tenant):** The legal entity, SSO/SAML identity provider, data residency, billing subscription, and compliance boundary.
- **Workspace (Collaborative Environment):** The shared operational container containing Teams, Projects, Docs, and WorkItems. A user may have access to multiple Workspaces within an Organization, or across multiple Organizations.

### 6.2. Component Interaction & UI Presentation
- **Collapsed Sidebar:** Renders the Workspace Logo/Monogram. Clicking triggers the Workspace Switcher popover anchored to the right of the rail.
- **Expanded Sidebar:** Renders a compact, interactive switcher trigger:
  - Line 1: Organization Name (e.g. `Acme Global`, `11px`, `color: var(--text-muted)`).
  - Line 2: Workspace Name (e.g. `Product & Engineering`, `12px`, `font-weight: 600`, `color: var(--text-primary)`).
  - Right: Subtle `ChevronsUpDown` icon (`12px`, `color: var(--text-muted)`).

### 6.3. Switcher Popover & Switching Semantics
Clicking the trigger or pressing `Ctrl+Alt+W` opens the `WorkspaceSwitcherPopover`:
1. **Search Input:** Filter input (`placeholder="Find workspace..."`) displayed when the workspace count warrants filtering.
2. **Current Workspace Section:** Marked with a checkmark and current user role (`Workspace Owner`, `Member`, `Guest`).
3. **Recent / Switch Workspaces:** List of authorized workspaces within the active Organization.
4. **Switch Organization (if user belongs to $> 1$ Org):** Sub-menu or partitioned section listing alternate Organizations.
5. **Actions (Role-gated):**
   - `+ Create Workspace` (Visible only if Org policy allows member workspace creation).
   - `Workspace Settings` (Deep link to `WKS-001`).
6. **Scale & Virtualization:** List uses windowing/virtualization when data scale demands it.
7. **Disentangled Switching Semantics:**
   - **Workspace Switch:** Changes active Workspace context; invalidates or scopes Workspace-bound resource queries appropriately; preserves Organization context when switching inside the same Organization; clears invalid active resource/Inspector state; navigates to a valid destination in the target Workspace.
   - **Organization Switch:** Changes tenant/security context; invalidates Organization/Workspace-scoped authorization and resource state.
8. **Failure & Disconnection:**
   - If switching fails, present a clear error notification and maintain current context; do not crash the shell into a blank screen.

---

## 7. Quick Search & Command Entry

The Sidebar search trigger is an **explicit entry point** into the global Command & Omnisearch system (`CMD-001`), **not** an embedded text input.

### 7.1. Visual Specification
- **Expanded Sidebar:**
  - Height: `var(--sidebar-item-height)` (current default `28px`).
  - Background: `var(--bg-surface)` with `1px solid var(--border-subtle)`.
  - Icon: `Search` (`13px`, `color: var(--text-muted)`).
  - Label: `Search & Commands` (`12px`, `color: var(--text-secondary)`).
  - Right Shortcut Pill: `<Kbd>⌘K</Kbd>` (Mac) or `<Kbd>Ctrl+K</Kbd>` (Windows/Linux).
- **Collapsed Sidebar:**
  - Square button, centered `Search` icon. Accessible tooltip announces: `Search & Commands (⌘K)`.

### 7.2. Interaction Contract
- Clicking the trigger or pressing `⌘K` / `Ctrl+K` opens `CommandPalette.jsx` in the overlay stratum.
- Focus is trapped within the palette search input.
- On dismissal (`Escape`), focus deterministically returns to the Sidebar search trigger (or the prior DOM focus target if invoked via keyboard).

---

## 8. Personal Section (`PER-001` & `PER-002`)

The `PERSONAL` section isolates the individual operator's high-frequency work queues from shared team noise.

### 8.1. Inbox (`PER-001: Personal Triage Inbox`)
- **Purpose:** Personal actionable notification and triage queue (mentions, assignments, review requests, thread replies).
- **Navigation Item:**
  - Icon: `Inbox` (`14px`).
  - Label: `Inbox`.
  - Actionable Badge: Renders unread actionable count.
    - Color: High-contrast accent (`var(--primary-base)`, text `#ffffff`).
    - Count semantics: Represents **strictly actionable unread items**, not noisy passive audit events.
    - If count is `0`, the badge is omitted to maintain a calm visual baseline.
- **Active Route Intent:** `/inbox` or `?surface=inbox`.

### 8.2. My Work (`PER-002: My Work Cockpit`)
- **Purpose:** Universal aggregator of work items where the current user is directly accountable (`Assigned to Me`, `Created by Me`, `Subscribed / Following`).
- **Navigation Item:**
  - Icon: `CheckCircle2` (`14px`).
  - Label: `My Work`.
  - Optional Badge: Counter for items due today or overdue (semantic warning color if overdue items exist).
- **Active Route Intent:** `/my-work` or `?surface=my-work`.

---

## 9. Generic Favorites Pointer Model & Authoritative Ownership

Favorites provide instant access to user-curated shortcuts across any platform entity.

### 9.1. Canonical Pointer Entity Model
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

### 9.2. Authoritative State Ownership & Lifecycle
- **Authoritative Ownership:** Favorites records are **server/domain state**, not browser preferences. The canonical ordering and record collection are stored authoritatively on the server.
- **Optimistic Reordering:** User reordering updates the client domain cache immediately for responsiveness. If server mutation fails, the order automatically rolls back to the authoritative state with an error announcement.
- **Role of `localStorage`:** May optionally cache presentation state for fast initial paint before network reconciliation, but must **never** become the authoritative source of truth.
- **Capacity & Scaling:** Display renders initial visible items up to a tunable scale-policy default (e.g. ~10), followed by an expandable sub-list or picker.
- **Add / Remove Affordance:**
  - Any favoritable resource page features a Star toggle icon (`Star` / `StarOff`) in its Context Bar header.
  - Context menu exposes: `Remove from Favorites`, `Copy Link`, `Open in New Tab`.
- **Inaccessible / Deleted Target Behavior (Zero Leakage):**
  - If a favorited resource is deleted: Flagged with a tombstone prompt (`Resource unavailable - Remove favorite?`) adhering to `SYS-001`.
  - If permissions are revoked: Enforces **Zero Leakage Rule**. Renders as generic placeholder (`Restricted Item`) or is silently excluded, adhering to `SYS-002` access control.

---

## 10. Workspace Section (`Initiatives`, `Docs`, `Views`)

The `WORKSPACE` section provides top-level access to cross-team strategic entities and reusable assets:

### 10.1. Initiatives (`INT-001: Strategic Planning Hub`)
- **Icon:** `Compass` or `Target` (`14px`).
- **Label:** `Initiatives`.
- **Responsibility:** Strategic roadmaps, multi-team themes, and portfolio rollups.
- **Rule:** Roadmaps and Portfolio tables live as projections and views *inside* Initiatives, never as competing top-level sidebar items.
- **Active Route Intent:** `/initiatives`.

### 10.2. Docs (`DOC-001: Canonical Document Hub`)
- **Icon:** `FileText` (`14px`).
- **Label:** `Docs`.
- **Responsibility:** Organization and team knowledge, Living Specs (PRDs with embedded live execution grids), Architecture RFCs, and Engineering Runbooks.
- **Navigation State:** Opening any canonical doc keeps `Docs` active in the Sidebar while the Context Bar displays document breadcrumbs.
- **Active Route Intent:** `/docs`.

### 10.3. Views (`VEW-001: Saved Views Directory & Hub`)
- **Icon:** `Bookmark` or `LayoutGrid` (`14px`).
- **Label:** `Views`.
- **Responsibility:** Directory of reusable cross-team queries, filters, and projections (Personal Views, Team Views, Workspace Views).
- **Rule:** Saved Views are query definitions over domain entities, not separate siloed database tables.
- **Active Route Intent:** `/views`.

---

## 11. Teams Architecture: 3 to 300+ Squad Scaling

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
│   [+ Browse all teams...]  (TEM-001 Directory)         │
└────────────────────────────────────────────────────────┘
```

### 11.1. Progressive Disclosure Strategy
1. **Joined / Pinned Teams Only:**
   - The Sidebar does **NOT** query or render all 300+ workspace teams into the DOM.
   - It renders strictly the teams where the user is an **active member** or that the user has **pinned**, up to a tunable default limit (current design baseline: ~7 teams).
2. **Recent / Recency History:**
   - Defined conceptually as **user-scoped recency state**. May be cached locally during prototype iterations, but must remain migratable to server account preferences rather than locked to browser storage.
3. **Browse All Teams (`TEM-001` Canonical Surface):**
   - The permanent footer item under Teams is `Browse all teams...`.
   - Clicking navigates directly to the **Teams Directory** (`TEM-001`), where users search, filter, inspect rosters, and request membership. It is a full canonical surface, not a transient modal.
4. **Archived / Inactive Teams:**
   - Archived teams are hidden by default from the sidebar. If an active URL references an archived team, the shell renders a persistent warning banner (`This team is archived. Read-only mode.`).

### 11.2. Team Sub-Links Contract (Strictly At Most One)
To prevent vertical sidebar explosion, team sub-links are strictly constrained:
- **Default State:** Clicking the Team Name routes directly to the **Team Hub** (`TEM-002: Team Overview`).
- **Optional Sub-link (Cycles):** If `team.capabilities.cycles === true` and an active cycle exists, render **at most one** indented sub-link:
  - `Cycle 42 (Ends Friday)` → deep-links directly to `CYC-001: Active Cycle Board`.
- **No Second Sub-Link:** `Team Work` is **not** rendered as a permanent second nested sub-link in the sidebar. Team Work is accessed directly via the Team Hub resource tabs, Command Palette, or Favorites.
- **All other team facets** (`Work`, `Cycles Directory`, `Projects`, `Docs`, `Triage`, `Members`, `Settings`) belong strictly to the **Resource Navigation Tabs** in the Context Bar.

---

## 12. Contextual Resource Navigation (The "WHAT" Boundary)

When a user selects a container resource (Team, Project, or Initiative), the Sidebar establishes **WHERE** the user is, while the Context Bar renders the standardized **Resource Navigation Tabs**:

### 12.1. Standardized Resource Tab Configurations

```text
Team Resource Tabs:
[ Overview ] [ Work ] [ Cycles* ] [ Projects ] [ Docs ] [ Triage* ] [ Members ]

Project Resource Tabs:
[ Overview ] [ Work ] [ Docs ] [ Milestones ] [ Activity ]

Initiative Resource Tabs (Provisional Integration Example):
[ Overview ] [ Projects ] [ Roadmap ] [ Work Items ]
```
*\*Cycles and Triage tabs render conditionally based on team capabilities.*

> **Provisional Integration Note on Initiatives:** The exact tabs for Initiatives above are a provisional integration example. What is frozen is that Initiative is a Workspace strategic resource, Initiative detail uses the reusable `ResourceNavBar`, and Roadmaps/Portfolios are contextual projections/views rather than competing global Sidebar items. Final Initiative tabs will be specified in the Initiative product design phase.

### 12.2. Reusable Tab Interaction & Overflow Rules
1. **Unified Component:** Powered by a single generic `ResourceNavBar` component across all resource types.
2. **Keyboard Traversal:** Left/Right arrow keys navigate tabs roving-focus style; pressing `Enter` or `Space` activates the tab.
3. **Dynamic Overflow Handling:**
   - Active tab always remains discoverable and visible.
   - High-priority tabs remain visible where viewport permits.
   - Lower-priority destinations collapse into a `More (•••) ▼` dropdown based on resource adapter configuration.
   - Hidden tabs remain fully accessible via keyboard navigation.
   - Capability and permission filtering is applied **before** overflow calculations.
4. **URL Synchronization:** Tab changes cleanly update the resource sub-route or query param.

---

## 13. Project Discovery & Resource Integration

### 13.1. The Multi-Team Project Discovery Law & PRJ-007 Reachability
- In Orynqo, **a Project can be owned by or collaborated on by multiple Teams**.
- Therefore, Projects cannot be architecturally nested as strict single-parent children in the sidebar.
- Projects are discovered through:
  1. **Canonical Projects Directory (`PRJ-007`):** Workspace-wide searchable, filterable catalog reachable via direct route `/projects` or Command Palette (`Browse Projects`).
  2. **Team Projects Tab (`TEM-004`):** Lists all projects associated with the active team.
  3. **Initiatives (`INT-002`):** Strategic roadmaps grouping linked projects.
  4. **Favorites:** Direct user shortcuts to high-priority active projects.
  5. **Command Palette (`⌘K`):** Instant fuzzy search (`> Projects: Mobile Redesign`).

### 13.2. Project Working Environment (`PRJ-001`)
When a Project is selected:
- Sidebar indicates active context (or highlights the Project in Favorites if favorited).
- Context Bar displays: `[Workspace] / [Project Name]`.
- Resource Navigation renders: `Overview` | `Work` | `Docs` | `Milestones` | `Activity`.
- The `Work` tab instantly activates the frozen DataGrid or Kanban projection over the project's work items.

---

## 14. Context / Action Strip Specification

The Action Strip provides a clean, hierarchical two-tier Context & Control Bar:

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TIER 1: IDENTITY, BREADCRUMBS & GLOBAL ACTIONS                              [Token Default: 44px]│
│ 🏠 Workspace  ›  ⚡ Core Platform  ›  🎯 Cycle 42          [Density: 28px]  [+ New Item (C)]    │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TIER 2: RESOURCE TABS & PROJECTION CONTROLS                                 [Token Default: 36px]│
│ [Overview] [Work •] [Cycles] [Projects] [Docs]    │   [Grid | Board | Timeline]  [Filters] [🔍]  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 14.1. Tier 1: Identity & Action Bar
- **Left:** Contextual Breadcrumbs (compact, truncated, navigable links).
- **Middle / Right:**
  - View Count Metric (e.g. `42 items`).
  - View Density Switcher (toggles between compact and default row height tokens).
  - Primary Action Button: `+ New Item` (invokes Quick Create modal, bound to `C` key).

### 14.2. Tier 2: Resource Navigation & Projection Bar
- **Left:** Contextual Resource Navigation Tabs (`ResourceNavBar`).
- **Right:**
  - **Projection Switcher:** Segmented control for Work-capable tabs (`Table / Grid`, `Kanban Board`, `Timeline`, `Workload`).
  - **Filter Trigger:** Filter summary badge opening `FilterBuilder`.
  - **In-View Search:** Quick keyword filter over currently loaded collection.

---

## 15. Breadcrumb & Context Model

Breadcrumbs provide rapid spatial orientation without visual clutter:

```text
Workspace Name  ›  Container (Team or Initiative)  ›  Resource (Project or Doc)  ›  Facet / Item
```

### 15.1. Real-World Breadcrumb Patterns
1. **Team Work Context:** `Orynqo` › `Core Platform` › `Work`
2. **Cycle Context:** `Orynqo` › `Core Platform` › `Cycle 42`
3. **Multi-Team Project:** `Orynqo` › `Projects` › `Auth Migration V2` › `Work`
4. **Strategic Initiative:** `Orynqo` › `Initiatives` › `Q3 Enterprise Readiness` › `Roadmap`
5. **Document Canvas:** `Orynqo` › `Docs` › `Specs` › `PRD: Offline Sync Protocol`

### 15.2. Interaction Semantics: Label vs. Chevron
- **Breadcrumb Label:** Clicking the label text performs standard, direct navigation to that ancestor surface.
- **Breadcrumb Chevron:** Clicking the adjacent chevron icon opens the sibling context-switcher popover (e.g. switch between sibling teams or projects).
- The label itself does **not** unexpectedly open a menu, preserving predictable web navigation semantics.
- Sibling switching remains strictly permission-filtered, searchable for large collections, and enforces zero metadata leakage.

---

## 16. View Projection Controls & Precedence

View Projections belong strictly to the **Resource Action Bar**, never to the Sidebar:

### 16.1. Projection Switcher Matrix

| Projection Type | Canonical ID | Visual Metaphor | Optimal Work Context |
| :--- | :--- | :--- | :--- |
| **DataGrid (Table)** | `WRK-001` | High-density tabular grid | Bulk triage, rapid keyboard editing, sorting, multi-column analysis |
| **Kanban Board** | `WRK-002` | Columnar state lanes | Sprint flow, status progression, drag-and-drop workflow |
| **Timeline (Gantt)** | `WRK-003` | Chronological bar chart | Dependency sequencing, date roadmaps, cycle milestones |
| **Workload** | `WRK-004` | Capacity bar chart | Team member capacity, point allocation, burnout balancing |

### 16.2. Deterministic Projection Precedence Rule
To eliminate race conditions between URL parameters and stored preferences:

$$\text{Explicit URL Projection} \gg \text{Valid Saved User Preference} \gg \text{Resource Default}$$

1. If an explicit URL parameter is present (e.g. `?view=board`), it takes immediate precedence for deep links.
2. If no URL parameter is provided, the shell restores the user's valid preference saved for that resource in `localStorage`.
3. If the selected projection is unsupported for the current resource, it safely falls back to the resource's valid default.

---

## 17. Inspector Integration (UI-01A Frozen Baseline)

The Application Shell accommodates the frozen UI-01A WorkItem Inspector without layout corruption:

```text
┌────────────────────────────────────────────────────────┐
│ Main Viewport Canvas (Grid/Board) │ Inspector Drawer   │
│                                   │                    │
│ [Row 1] Canonical Issue Title    │ ID: <ref>          │
│ [Row 2] Active Selection ========│ Status: In Progress│
│ [Row 3]                          │ Priority: Urgent   │
│ [Row 4]                          │ Discussion & Specs │
└───────────────────────────────────┴────────────────────┘
```

### 17.1. Inspector Invariants & URL Semantics
1. **Initial Arrival:** Inspector is **closed by default** on clean application load (`isInspectorOpen: false`).
2. **Explicit Open:** Triggered by selecting a work item and pressing `Enter`, clicking the row detail affordance, or `Quick Create & Open`.
3. **URL Parameter Semantics:**
   `?item=<canonical-or-route-safe-work-item-reference>`
   - Deep-links directly to the work item detail while preserving background resource context.
   - Does not depend on specific human-readable prefixes (e.g. `ENG-104`) as an architectural lock; uses route-safe entity references.
4. **Canvas Adaptation:** On desktop, the Inspector docks as a split panel occupying semantic width `--inspector-width`, compressing the canvas smoothly.
5. **Reclaim Canvas & Focus:** Closing the Inspector (`Escape` or close button) removes the `?item=` parameter, reclaims full canvas width, and restores DOM focus to the originating row.
6. **No Navigation Collision:** Opening, closing, or navigating within the Inspector has **zero side-effects** on Sidebar selection or active breadcrumb routes.

---

## 18. Quick Create Integration (UI-01C Frozen Baseline)

The global Quick Create modal (`CMD-002`) integrates into the shell as a high-speed creation overlay:

### 18.1. Invocation Points
- Pressing `C` anywhere in the application (outside of active text inputs or overlays).
- Clicking `+ New Item` in the Context Bar.
- Command Palette action: `> Create New Work Item`.

### 18.2. Contextual Pre-Population & Ambiguity Rules
The Shell injects its current spatial context into `useQuickCreate` following the frozen precedence:

$$\text{Explicit User Choice} > \text{Invocation Context} > \text{Valid Session Context} > \text{Team / Workspace Defaults}$$

| Active Shell Location | Injected Context Parameters | Quick Create Pre-Population Contract |
| :--- | :--- | :--- |
| **Global (Inbox / My Work / Docs)** | `{}` (Empty) | User must explicitly select Team from `TeamPicker`; Project and Cycle pickers remain disabled until Team is chosen. |
| **Team Hub (`/teams/core`)** | `{ teamId: "team-core" }` | Team is pre-selected; default workflow status pre-populated; project picker filtered to team projects. |
| **Active Cycle (`/teams/core/cycles/42`)** | `{ teamId: "team-core", cycleId: "cycle-42" }` | Team and Cycle pre-selected; work item is automatically committed to the active cycle. |
| **Project Canvas (`/projects/auth-v2`)** | `{ projectId: "proj-auth" }` | **1.** Always provide `projectId`.<br>**2.** If invocation context already contains a valid execution `teamId`, retain it.<br>**3.** If the Project has exactly one valid execution Team, that Team may be prefilled.<br>**4.** If the Project has multiple valid Teams and no invocation Team, Team remains unresolved.<br>**5.** Requires explicit Team selection before creation.<br>**6.** Never invent or assume a "primary squad", "lead team", or first Team. |

---

## 19. Command Palette Integration (`CMD-001`)

The shell coordinates directly with `CommandPalette.jsx` (`⌘K` / `Ctrl+K`):

### 19.1. Shell Command Contributions
The shell registers global navigation commands into the command registry:
- **Navigation:**
  - `Go to Inbox` (`G then I`)
  - `Go to My Work` (`G then M`)
  - `Go to Initiatives`
  - `Go to Docs`
  - `Go to Saved Views`
  - `Browse Teams` (`G then T` → navigates to `TEM-001`)
  - `Browse Projects` (navigates to `PRJ-007`)
- **Recent Resources:** Top recently visited Teams, Projects, and Docs from user-scoped recency state.
- **Actions:**
  - `Create Work Item...` (`C`)
  - `Toggle Sidebar` (`⌘[` or `Ctrl+[`)
  - `Switch Workspace...` (`Ctrl+Alt+W`)
  - `Toggle Theme` (`Dark` / `Light`)
  - `Open Keyboard Shortcuts` (`?`)

---

## 20. Routing Semantics & Deep-Link Architecture

While exact URI syntax remains adaptable to framework routers, the **routing semantics** are formally frozen:

### 20.1. Canonical Route Matrix

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
| **Teams Directory** | `/teams` | Workspace members (`TEM-001`) |
| **Team Overview** | `/teams/:teamId` | Team visibility |
| **Team Work Projection** | `/teams/:teamId/work?view=grid\|board` | Team visibility |
| **Team Active Cycle** | `/teams/:teamId/cycles/current` | Cycle capability enabled |
| **Team Cycle Detail** | `/teams/:teamId/cycles/:cycleId` | Cycle capability enabled |
| **Projects Directory** | `/projects` | Workspace members (`PRJ-007`) |
| **Project Overview** | `/projects/:projectId` | Project visibility |
| **Project Work** | `/projects/:projectId/work` | Project visibility |
| **Personal Settings** | `/settings/profile` | Self only (`PER-003`) |
| **Workspace Settings** | `/settings/workspace` | Workspace Admin (`WKS-001`) |
| **Enterprise Admin** | `/admin/security` | Organization Admin (`ADM-001`) |

### 20.2. Query Parameters for Transient State
- **Active WorkItem Inspector:** `?item=<canonical-ref>` (Enables deep-linking directly into open item details while preserving background grid context).
- **Active Projection:** `?view=board` or `?view=grid`.
- **Search Query & Filters:** `?q=auth&status=in_progress`.

---

## 21. Bottom Utility Area

The Bottom Utility Area anchors personal identity, support, and administrative settings:

```text
┌────────────────────────────────────────────────────────┐
│ [Avatar] User Profile & Presence      [Theme] [Help ?] │
│ Settings: [ Personal  |  Workspace ⚙️  |  Admin 🛡️ ]    │
└────────────────────────────────────────────────────────┘
```

### 21.1. User Profile & Account Trigger
- Renders `UserAvatar`, full name, and online status badge.
- Clicking opens the User Profile Menu (Edit Profile & Status, Notification Preferences, Sign Out).

### 21.2. Role-Partitioned Settings Entry
Settings are explicitly separated by administrative authority:
1. **Personal Settings (`PER-003`):** Available to all users (theme, account details, keybindings, notifications).
2. **Workspace Settings (`WKS-001` to `WKS-004`):** Visible only to `Workspace Admins` (team creation rules, member management, workflow states, integrations).
3. **Organization Administration (`ADM-001` to `ADM-003`):** Visible only to `Org Admins` (SSO/SAML, audit logs, billing, legal policies).

---

## 22. Navigation State Model & Ownership Boundaries

State is partitioned across four distinct tiers to eliminate monolithic context coupling:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. URL / NAVIGATION STATE (Address Bar)                                │
│    - Active Workspace, Active Container, Resource ID, Sub-Tab,         │
│      Inspector Deep Link (?item=ref), Active Projection (?view=grid)   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. PERSISTENT USER PREFERENCES (localStorage / User Profile)          │
│    - isSidebarCollapsed, sidebarWidth, lastSelectedProjectionPerView,   │
│      densityMode, expandedSidebarSections                              │
├────────────────────────────────────────────────────────────────────────┤
│ 3. SERVER / DOMAIN STATE (Authoritative Cache & Entity Store)          │
│    - FavoritePointer collection & order, WorkItems, Teams, Projects,   │
│      Docs, Cycles, Workspace Membership                                │
├────────────────────────────────────────────────────────────────────────┤
│ 4. EPHEMERAL UI STATE (React Local State / Overlay Context)            │
│    - isCommandPaletteOpen, isQuickCreateOpen, isShortcutsOpen,         │
│      activePickerOpenId, quickSearchDraft, dragOverActive              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 23. Sidebar Expansion & Collapsed Modes

### 23.1. Discrete Semantic Layout Modes
Orynqo rejects arbitrary, continuous user-drag border resizing in UI-02B in favor of predictable, high-density layout modes:
- **Expanded Mode:** Semantic width token `--sidebar-width` (current baseline: `240px`). Optimized for high-density labels, counts, and status indicators.
- **Collapsed Mode:** Semantic width token `--sidebar-collapsed-width` (current baseline: `52px`). Compact icon rail for maximum canvas focus.
- **Mobile Mode:** Off-canvas navigation sheet/overlay triggered via mobile hamburger.

### 23.2. Collapsed Rail Interaction
When collapsed (`isSidebarCollapsed: true`):
- Navigation links render strictly centered icons (`16px`).
- Hovering any icon displays a floating tooltip with label and keyboard shortcut after a brief delay.
- Section headers collapse into subtle divider lines.
- Clicking the Workspace Monogram opens the Workspace Switcher popover to the right.
- Pressing `⌘[` or clicking `PanelLeftOpen` expands the sidebar.

---

## 24. Permission & Capability Behavioral Engine

### 24.1. Zero-Leakage Permission Architecture
- **Inaccessible Resources:** If a user lacks permission to view a Team, Project, or Document, the sidebar **never** displays the item name, icon, or metadata.
- **Direct Link Gating:** Navigating to an unauthorized URL renders `SYS-002: Permission Denied / Access Request` without confirming the existence of sensitive entity names.
- **Guest Limitations:** External guest accounts do not see administrative settings, internal directories, or billing consoles.

### 24.2. Dynamic Capability Composition
Teams declare active capabilities (`cycles`, `triage`, `projects`, `docs`, `automations`):
- If `team.capabilities.cycles === false`:
  - The `Current Cycle` sub-link is excluded from the Sidebar.
  - The `Cycles` tab is excluded from Team Resource Navigation.
  - Work item pickers for this team hide cycle options.
- If `team.capabilities.triage === false`:
  - The `Triage` tab is excluded from Team Resource Navigation.

---

## 25. Loading, Empty, and Error States

1. **Workspace Loading:**
   - Sidebar renders structural pulsing skeleton bars for Workspace switcher, Personal items, and Teams, preventing layout shift upon data arrival.
2. **No Teams Joined:**
   - Teams section renders a compact empty affordance: `No teams yet. [Explore Teams]`.
3. **No Favorites:**
   - Favorites section displays a subtle one-line helper: `Pin projects & docs here for quick access`.
4. **Network Disconnection (`SYS-003`):**
   - Shell renders a persistent, non-intrusive offline indicator strip at top.
   - Cached/readable content already present in memory remains viewable.
   - Stale data is clearly communicated.
   - Unsafe or destructive mutations are blocked with explicit user feedback.
   - Reconnection triggers appropriate reconciliation.
   - *Note: Offline-first mutation queuing is NOT assumed or promised.*
5. **Resource Deleted / Missing (`SYS-001`):**
   - If an active resource is deleted or missing, the shell replaces the main canvas with a clean tombstone adhering to `SYS-001`: `This resource was deleted. [Return to Directory]`.
6. **Permission Denied (`SYS-002`):**
   - Inaccessible surfaces resolve to `SYS-002` with access request affordances.

---

## 26. Keyboard Navigation & Focus Engine

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

### 26.1. Shell Keyboard Shortcut Map

| Shortcut Intent | Primary Binding | Secondary Binding | Behavior |
| :--- | :--- | :--- | :--- |
| **Command Palette** | `⌘K` | `Ctrl+K` | Opens global command launcher overlay. |
| **Quick Create** | `C` | — | Opens Quick Create modal with current context. |
| **Toggle Sidebar** | `⌘[` | `Ctrl+[` | Toggles between expanded and collapsed rail modes. |
| **Go to Inbox** | `G then I` | — | Immediate navigation to `PER-001`. |
| **Go to My Work** | `G then M` | — | Immediate navigation to `PER-002`. |
| **Go to Teams** | `G then T` | — | Immediate navigation to `TEM-001`. |
| **Switch Workspace** | `Ctrl+Alt+W` | — | Opens Workspace Switcher popover. |
| **Keyboard Cheat-sheet** | `?` | `Shift+/` | Opens Shortcuts cheat-sheet modal. |
| **Focus Sidebar** | `Alt+1` | — | Moves DOM focus to active sidebar item. |
| **Focus Main Canvas** | `Alt+2` | — | Moves DOM focus to top of main workspace canvas. |
| **Focus Inspector** | `Alt+3` | — | Moves DOM focus to open Inspector drawer. |

---

## 27. Accessibility Contract (WCAG 2.2 AA Target)

1. **Semantic Landmark Elements:**
   - Sidebar wrapped in semantic `<nav aria-label="Workspace navigation">`.
   - Context Bar wrapped in semantic `<header aria-label="Resource context">`.
   - Main Canvas wrapped in semantic `<main aria-label="Primary content">`.
   - Inspector wrapped in semantic `<aside aria-label="Work item details">` or `<section>`.
2. **Current Location Semantics:**
   - Active navigation item explicitly flagged with `aria-current="page"` or `aria-current="location"`.
   - Collapsible sections use `aria-expanded="true|false"` and `aria-controls="section-id"`.
3. **Keyboard Focus Ring:**
   - Every interactive control features high-visibility outline: `2px solid var(--primary-base)` with `2px offset`. Focus is never hidden.
4. **Screen Reader Live Announcements:**
   - Unread inbox updates, network state changes, and workspace switches announce state via `<div aria-live="polite" class="sr-only">`.

---

## 28. Responsive Architecture & Viewport Adaptation

```text
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│ WIDE DESKTOP            │ COMPACT DESKTOP / TABLET│ MOBILE VIEWPORT         │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ Persistent expanded     │ Collapsed icon rail     │ Sidebar hidden off-     │
│ Sidebar.                │ by default.             │ canvas; slides in as a  │
│ Split-pane Inspector.   │ Slide-over Inspector    │ full overlay drawer.    │
│ Both visible.           │ overlay.                │ Resource tabs scroll    │
│                         │                         │ horizontally.           │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

### 28.1. High-Level Adaptation Model
- **Wide Desktop:** Full experience. Sidebar expanded, canvas full, Inspector opens as split panel.
- **Compact Desktop / Tablet:** Sidebar defaults to collapsed icon rail; can be temporarily expanded. Inspector slides over canvas as a drawer (`z-index: 50`).
- **Mobile Viewport:**
  - Desktop sidebar is removed from static document flow and renders as a slide-in sheet triggered via a hamburger menu.
  - Resource Navigation tabs render as a horizontally swipeable rail with subtle gradient fade on scroll edges.
  - Inspector opens full-screen.
- *Note: Exact breakpoint values (e.g. 1200px, 768px) represent current tunable design-token defaults.*

---

## 29. Density & Motion Design

### 29.1. High-Density Layout Metrics (Token Defaults)
- **Sidebar Items:** Height `var(--sidebar-item-height)` (current default: `28px`), padding `0 8px`, border-radius `var(--radius-xs)`, font size `var(--text-xs)` (`12px`).
- **Context Bar:** Height `var(--header-height)` (current default: `44px`), breadcrumbs font size `12px`, action buttons size `sm` (`28px`).
- **Resource Tab Strip:** Current default height `36px`, tab font size `12px`.
- **Canvas Gaps:** Zero extraneous margin; maximum density for tabular data presentation.

### 29.2. Functional Motion Principles
- Restrained CSS transitions only:
  - Sidebar width transition: `width var(--duration-normal) var(--ease-out)`.
  - Drawer slide-in: `transform var(--duration-normal) var(--ease-out)`.
  - Overlay fade: `opacity var(--duration-fast) ease-out`.
- **Reduced Motion:** If `prefers-reduced-motion: reduce` is active, all durations collapse to `0ms` (instant toggle).

---

## 30. Reusable Component Architecture & Decomposition

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
│   │   └── BrowseTeamsTrigger.jsx         # Direct navigation trigger to TEM-001
│   └── Projections/
│       └── ProjectionSwitcher.jsx         # Segmented control for Grid/Board/Timeline
│
└── hooks/
    ├── useNavigationState.js              # URL & active destination resolver
    └── useSidebarPreferences.js           # Collapsed state, widths, section toggles
```

---

## 31. Component Classification Matrix

| Component Name | Layer Classification | Reusability Scope | Domain Logic Ownership |
| :--- | :--- | :--- | :--- |
| `AppShell` | Shell Layout | Global Layout | Zero domain logic; pure spatial coordinator |
| `Sidebar` | Shell Layout | Global Navigation | Receives items/routes; renders navigation hierarchy |
| `SidebarItem` | Design System Composite | Global Navigation | Presentational (icon, label, badge, active state) |
| `SidebarSection` | Design System Composite | Global Navigation | Presentational (collapsible header, chevron, title) |
| `ContextBar` | Shell Layout | Global Header | Coordinates breadcrumbs, tabs, and primary action |
| `ResourceNavBar` | Global Product Navigation | Reusable across Resources | Renders tabs for Team, Project, Initiative; zero hardcoded entities |
| `WorkspaceSwitcherPopover` | Global Product Navigation | Multi-Tenant Navigation | Consumes the canonical workspace/tenant navigation boundary |
| `FavoritesList` | Domain Adapter | Workspace Favorites | Maps generic Favorite pointers from server domain cache to clickable routes |
| `ProjectionSwitcher` | Global Product Navigation | Work Execution Views | Switches active visual lens (Grid, Board, Timeline) based on precedence |

---

## 32. Interaction Matrix

| User Trigger | State Transition | Navigation / Shell Effect | Focus / Accessibility Effect | Persistence Effect |
| :--- | :--- | :--- | :--- | :--- |
| **Click Sidebar Item** | `activeDestination` updates | Routes to target URL / surface | Focus remains on clicked item | None (URL state) |
| **Press ⌘[ or Toggle Button** | `isSidebarCollapsed` toggled | Width animates expanded $\leftrightarrow$ collapsed | Focus remains on toggle button | Saved to `localStorage` |
| **Click Workspace Switcher** | `isWorkspacePopoverOpen: true` | Popover opens anchored to rail | Focus traps inside popover search | None |
| **Select New Workspace** | `workspaceId` updates | Shell scopes queries to new workspace | Focus resets to top of Sidebar | Saved as last active workspace |
| **Select New Organization** | `organizationId` updates | Shell re-authenticates tenant context | Focus resets to top of Sidebar | Tenant session update |
| **Click Favorite Item** | Routes to target entity | Opens Project, Doc, or View | Focus on destination container | None |
| **Star Resource Page** | New Favorite pointer created | Instant optimistic item in Favorites | Focus remains on star button | Optimistic cache update + server mutation with rollback |
| **Reorder Favorite Item** | Favorite position updated | Instant reordering in Favorites list | Focus maintained on drag/action | Optimistic cache update + server mutation with rollback |
| **Press `C` (Global)** | `isQuickCreateOpen: true` | Quick Create modal opens | Focus traps to `Title` input | None |
| **Press `⌘K` (Global)** | `isCommandPaletteOpen: true` | Command Palette overlay opens | Focus traps to search input | None |
| **Click Breadcrumb Label** | Ancestor route activated | Standard navigation to ancestor container | Focus moves to target container | None (URL state) |
| **Click Breadcrumb Chevron** | `isSiblingMenuOpen: true` | Sibling switcher popover opens | Focus traps inside sibling list | None |
| **Click Resource Tab (e.g. Work)** | `activeSubTab` updates | Main canvas mounts tab content | Active tab receives `aria-selected="true"` | Synced to URL sub-route |
| **Click Projection (Board)** | `activeProjection: "board"` | Canvas switches from Grid to Board | Active button receives focus | Saved per-resource in `localStorage` |
| **Select WorkItem in Grid** | `selectedItemId: ID` | Inspector opens (`isInspectorOpen: true`) | Focus preserved in Grid or moves to Inspector | Synced to query `?item=ref` |
| **Press `Escape` in Inspector** | `isInspectorOpen: false` | Inspector closes; canvas reclaims width | Focus restored to originating Grid row | `?item=` param removed |
| **Click Mobile Hamburger** | `isMobileNavOpen: true` | Drawer slides in over content | Focus moves to first navigation item | None |

---

## 33. State Ownership Matrix

| State Property | Primary State Owner | Storage Mechanism | Consumer Components | Invalidation / Rollback Rule |
| :--- | :--- | :--- | :--- | :--- |
| **`organizationId`** | URL / Tenant Context | Session Token / URL | Entire Shell | Changing Org invalidates Org/Workspace-scoped authorization and caches |
| **`workspaceId`** | URL / Tenant Boundary | URL path / `localStorage` | Entire Shell | Changing Workspace scopes queries, clears invalid active resource state |
| **`currentResource`** | URL Router | URL path | `ContextBar`, `MainCanvas` | Missing resource routes to `SYS-001`; unauthorized to `SYS-002` |
| **`activeResourceTab`** | URL Router | URL sub-path / query | `ResourceNavBar`, `MainCanvas` | Invalid tab defaults to `Overview` |
| **`activeProjection`** | Precedence Engine | URL `?view=` $\gg$ `localStorage` | `ProjectionSwitcher`, `MainView` | Fallback to resource default if unsupported |
| **`isSidebarCollapsed`** | User Preference | `localStorage` | `Sidebar`, `AppShell` | Persisted across browser sessions |
| **`expandedSections`** | User Preference | `localStorage` | `SidebarSection` | Persisted across browser sessions |
| **`favoritePointers`** | Server / Domain State | Server / Domain Query Cache | `FavoritesList` | Authoritative on server; optimistic client reorder with server rollback |
| **`recentTeams`** | User-Scoped Recency State | Recency Cache (localStorage / Server) | `TeamSidebarGroup` | Capped at recent threshold; migratable to server account preferences |
| **`isInspectorOpen`** | UI State + URL | Query `?item=ref` | `AppShell`, `WorkItemInspector` | Cleared on item deselection or Escape |
| **`isQuickCreateOpen`** | Ephemeral UI State | React State | `QuickCreateDialog` | Cleared on Submit, Cancel, or Escape |
| **`isCommandPaletteOpen`**| Ephemeral UI State | React State | `CommandPalette` | Cleared on action execute or Escape |

---

## 34. IA-03 Surface Mapping & Shell Reachability

The Application Shell provides deterministic reachability for all 50 canonical surfaces defined in `docs/06-complete-page-and-surface-registry.md`:

```text
┌─────────────────────────┬──────────────┬────────────────────────────────────────────────────────┐
│ IA-03 Surface Group     │ Surface IDs  │ Shell Reachability Path                                │
├─────────────────────────┼──────────────┼────────────────────────────────────────────────────────┤
│ Personal Surfaces       │ PER-001..003 │ Sidebar > Personal (Inbox, My Work, Profile Settings)  │
│ Work Projections        │ WRK-001..006 │ ContextBar Projection Controls (Grid, Board, Timeline) │
│ Team Surfaces           │ TEM-001..008 │ Sidebar > Teams > Resource Tabs; TEM-001 via Browse All│
│ Cycle Surfaces          │ CYC-001..003 │ Sidebar Team Sub-link OR Team Resource Tabs > Cycles   │
│ Project Surfaces        │ PRJ-001..007 │ PRJ-007 via /projects, Command Palette; Team Tabs; Fav│
│ Strategic Initiatives   │ INT-001..004 │ Sidebar > Workspace > Initiatives (Roadmap & Rollups)  │
│ Canonical Documents     │ DOC-001..003 │ Sidebar > Workspace > Docs OR Team/Project Docs Tabs   │
│ Saved Views             │ VEW-001..002 │ Sidebar > Workspace > Views OR Favorites shortcuts    │
│ Overlays & Commands     │ CMD-001..003 │ Global Hotkeys: ⌘K (Palette), C (Create), ? (Help)     │
│ Workspace Settings      │ WKS-001..004 │ Sidebar Footer > Settings > Workspace Administration   │
│ Enterprise Admin        │ ADM-001..003 │ Sidebar Footer > Settings > Enterprise Admin Console   │
│ Global System Surfaces  │ SYS-001..003 │ SYS-001 (404/Tombstone), SYS-002 (Auth), SYS-003 (Sync)│
└─────────────────────────┴──────────────┴────────────────────────────────────────────────────────┘
```

---

## 35. Migration From Current Prototype

Detailed classification of current prototype files in `src/`:

| Prototype File / State | Classification | Architectural Action & Technical Justification |
| :--- | :--- | :--- |
| `src/layouts/AppShell.jsx` | **REFACTOR** | **Keep** overall 4-region spatial grid; **refactor** layout styles to support semantic width tokens (`--sidebar-width`, `--sidebar-collapsed-width`), responsive breakpoints, and mobile drawer overlay mode. |
| `src/layouts/Sidebar/Sidebar.jsx` | **REPLACE** | **Replace** the monolithic 403-line prototype with modular components (`SidebarHeader`, `SidebarSection`, `SidebarItem`, `SidebarFooter`). De-couple hardcoded teams and mock data; bind to dynamic joined teams and server-authoritative Favorites pointer model. |
| `src/layouts/ActionStrip/ActionStrip.jsx` | **REPLACE** | **Replace** with two modular tiers: `ContextBar` (Identity, Breadcrumbs, Density, Primary Action) and `ResourceNavBar` (Reusable contextual tabs) + `ProjectionSwitcher`. Remove embedded hardcoded tabs. |
| `src/App.jsx` | **REFACTOR** | **Refactor** to consume new modular shell and resource router. Remove inline layout switch statements; integrate clean route/context binding. |
| `src/app/providers/UIContext.jsx` | **REFACTOR** | **Refactor** to separate ephemeral UI state (`isCommandPaletteOpen`, `isCreateModalOpen`) from navigation state and persistent preferences (`isSidebarCollapsed`, `density`). |

---

## 36. Implementation Plan for Phase UI-02B

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
   - Implement `FavoritesList.jsx` and `FavoriteItem.jsx` consuming generic pointer data with optimistic reordering and server rollback.
6. **Step 6: Scalable Team Navigation:**
   - Implement `TeamSidebarGroup.jsx` with joined-squad filtering, single cycle sub-link, and `Browse all teams...` trigger navigating to `TEM-001`.
7. **Step 7: ContextBar & ResourceNavBar:**
   - Construct Tier 1 `ContextBar.jsx` (breadcrumbs with label navigation & chevron switcher, density, `+ New Item`) and Tier 2 `ResourceNavBar.jsx`.
8. **Step 8: Projection Controls Integration:**
   - Construct `ProjectionSwitcher.jsx` and wire seamlessly into frozen UI-01 DataGrid, Board, and Timeline following deterministic precedence.
9. **Step 9: Overlays & Inspector Verification:**
   - Verify zero-regression integration with frozen UI-01 WorkItem Inspector (`?item=ref`), Quick Create (with multi-team Project ambiguity resolution), and Command Palette.
10. **Step 10: Keyboard Scopes & Accessibility Polish:**
    - Wire `Alt+1`, `Alt+2`, `Alt+3`, `⌘[`, and roving tabindex. Verify WCAG 2.2 AA focus rings and semantic landmark elements.
11. **Step 11: Regression Test Suite:**
    - Implement comprehensive test suite covering all interaction matrix rows, responsive states, and navigation transitions.

---

## 37. Explicit Frozen Decisions

The following 20 architectural decisions are **FROZEN** and must **NOT** be reinterpreted during UI-02B:
1. **The Spatial Mental Model:** `SIDEBAR = WHERE`, `RESOURCE NAVIGATION = WHAT`, `PROJECTION CONTROLS = HOW`, `INSPECTOR = DETAIL`, `COMMAND PALETTE = LONG-TAIL`.
2. **No Projections in Sidebar:** DataGrid, Kanban, Timeline, and Workload never appear as top-level sidebar items.
3. **Docs as Global Knowledge Label:** Houses all knowledge artifacts under a single canonical document entity model.
4. **Generic Favorites Pointer Model:** Polymorphic pointer (`userId`, `workspaceId`, `targetType`, `targetId`, `position`).
5. **Favorites are Authoritative Server/Domain State:** Canonical order lives on server; optimistic client reorder with server rollback; `localStorage` is not authoritative.
6. **Team Progressive Disclosure:** Sidebar shows only joined/pinned teams (tunable default ~7); never renders all 300+ teams.
7. **Maximum One Team Sub-Link:** At most one contextual sub-link (`Current Cycle`) only when Cycles capability is enabled and active. No second `Team Work` sub-link.
8. **Multi-Team Projects:** Projects are never forced into a single-parent tree under Teams.
9. **No Arbitrary Sidebar Resize in UI-02B:** No continuous drag resizing, no draggable border, no 200–320px range.
10. **Discrete Semantic Sidebar Modes:** Expanded (`--sidebar-width`), Collapsed (`--sidebar-collapsed-width`), and Mobile sheet.
11. **Inspector Navigation Non-Interference:** Opening/closing Inspector does not mutate sidebar navigation or breadcrumb location. Deep link uses `?item=<ref>`.
12. **Quick Create Contextual Ambiguity Rules:** When invoked in multi-team Project context without invocation Team, Team remains unresolved and requires explicit user selection; never assume a "primary squad", "lead team", or first Team.
13. **Zero-Leakage Navigation:** Inaccessible resources are hidden or rendered as generic placeholders without metadata leakage (`SYS-002`).
14. **Breadcrumb Interaction:** Clicking label navigates to ancestor; clicking chevron opens sibling/context switcher.
15. **Initiative Exact Tabs Deferred:** Initiative detail uses reusable `ResourceNavBar`; exact tab configuration will be finalized in Initiative product design.
16. **Projects Directory Reachability:** `PRJ-007` is deterministically reachable via `/projects`, Command Palette, Team tabs, and Favorites without becoming an unbounded sidebar tree.
17. **No Assumed Offline Mutation Queuing:** Offline state is communicated via `SYS-003`; changes are not assumed to be locally queued without dedicated engine.
18. **WorkspaceContext is Not Permanent Architecture:** Components consume the canonical workspace/tenant navigation boundary rather than locking to prototype context.
19. **Semantic Overlay Strata:** Popovers (Pickers) > Dialogs/Modals > Drawers > Base Shell. Pickers portal above containing dialogs per UI-01D.
20. **Tunable Defaults:** Numerical measurements, animation durations, visible item counts, and breakpoint thresholds represent current tunable defaults, not immutable architecture.

---

## 38. Resolved Human Review Questions

1. **Team Quick-Link Default (RESOLVED):**
   - **Decision:** Each Team may expose **at most one** contextual Sidebar sub-link (`Current Cycle`), rendered strictly when Cycles capability is enabled and an active cycle exists. `Team Work` is not rendered as a second nested link, protecting vertical density across multi-team users.
2. **Breadcrumb Sibling Switching (RESOLVED):**
   - **Decision:** Clicking the breadcrumb text performs standard, direct navigation to that ancestor. Clicking the adjacent chevron icon opens the sibling context-switcher popover. The entire label does not unexpectedly open a menu.
