# UI-03A — My Work Product & UX Contract

- **Document Version:** `1.1.0`
- **Surface Identifier:** `PER-002` (My Work Cockpit)
- **Status:** **APPROVED PRODUCT & UX SPECIFICATION — FROZEN AT HUMAN REVIEW (CORRECTION PASS 01A)**
- **Linage:** `docs/06-complete-page-and-surface-registry.md` $\rightarrow$ `docs/10-ui-02a-application-shell-sidebar-contract.md` $\rightarrow$ `docs/11-ui-02b-production-shell-sidebar-implementation.md` $\rightarrow$ `docs/12-ui-03a-my-work-product-ux-contract.md`

---

## 1. Executive Summary & Purpose

`PER-002: My Work` is the personal execution cockpit for every authenticated user in the Orynqo platform. It answers the fundamental daily engineering question:

> **"What work requires my immediate attention, what should I execute next, and where am I at risk?"**

My Work aggregates executable work across disparate Teams, Projects, and Cycles into a unified, high-density personal view.

### 1.1. Core Invariants
1. **Personal Cockpit, Not a Resource Container:** My Work is neither a Team, nor a Project, nor an Initiative. It owns no canonical WorkItems.
2. **Zero Cloned Data:** My Work is an authoritative query over the canonical WorkItem domain store. Never introduce `MyTask`, `PersonalIssue`, or copied records.
3. **No Decorative Dashboard Syndrome:** My Work is a high-density execution workbench. It rejects giant metric cards, decorative charts, and empty whitespace. Actual work items are visible above the fold on viewport arrival.
4. **Decoupled from Inbox (`PER-001`):** My Work is for **executable work items** (assigned, blocking, authored, subscribed). Inbox is for **notifications, mentions, status pings, and triage chatter**. They do not duplicate each other.
5. **Architectural Alignment:**
   - `SIDEBAR = WHERE` (Navigates to `My Work`)
   - `RESOURCE NAVIGATION = WHAT` (Tabs: `Overview`, `Assigned`, `Created`, `Subscribed`)
   - `PROJECTION CONTROLS = HOW` (Projections: `Grid`, `Board`, `Timeline`)
   - `INSPECTOR = DETAIL` (Contextual side-by-side split drawer)
   - `COMMAND PALETTE = LONG-TAIL` (`⌘K` fuzzy search & jump)

---

## 2. Competitive Reference Pass

| Product | Relevant Patterns | Why Useful for Orynqo | Adopt / Adapt / Reject |
| :--- | :--- | :--- | :--- |
| **Linear** | *My Issues* (`Assigned`, `Created`, `Subscribed`, `Activity`). Instant filtering, grouped by cycle/status. Ultra-fast list and board. | Eliminates clutter. Focuses purely on execution without unnecessary metric widgets. Grouping by Cycle or Project provides strong mental anchors. | **ADAPT:** Adopt the clean `Assigned` / `Created` / `Subscribed` query partition. Adapt to include an actionable `Overview` tab with an urgent `Needs Attention` section. |
| **Asana** | *My Tasks* (`Recently Assigned`, `Do Today`, `Do Next Week`, `Later`). Manual/auto triage sections. | Highlights personal triage workflows where users categorize inbound assignments before committing. | **ADAPT:** Adopt deterministic time-based buckets (`Overdue`, `Due Today`, `Due Soon`, `Later`, `No Due Date`). Reject manual multi-section dragging that desynchronizes team planning. |
| **Jira** | *Your Work* (`Assigned to Me`, `Worked On`, `Starred`). Tabular query views. | Tabular scanning across multi-project environments is familiar to enterprise teams. | **REJECT:** Jira’s fragmented dashboards, slow page loads, disjointed custom query screens, and disconnected detail modals. |
| **ClickUp** | *Home / My Work* (LineUp, Trending, Assigned, Overdue cards). | Card-based summary metrics at the top of the personal home page. | **REJECT:** Giant KPI card clutter ("Card Dashboard Syndrome"). Orynqo replaces giant cards with a 28px dense operational metric strip in the ContextBar. |
| **Notion** | *My Tasks* (Linked database views, custom timeline/board). | Polymorphic projection switching over personal queries. | **ADAPT:** Adopt projection switching (`Grid`, `Board`, `Timeline`) over personal work queries, reusing canonical UI-01 projections. |

---

## 3. Scope & Inclusion/Exclusion Rules

### 3.1. Responsibility Scopes & Query Partitions

My Work partitions personal queries across four distinct tabs. **Crucially, these tabs are query scopes, not mutually exclusive datasets:**

```text
My Work (PER-002)
├── Overview      (Cockpit: Needs Attention, In Progress, Upcoming, Unscheduled, Recently Completed)
├── Assigned      (Execution scope: assigneeId === currentUser.id)
├── Created       (Authorship scope: creatorId === currentUser.id)
└── Subscribed    (Subscription scope: subscriberIds.includes(currentUser.id))
```

### 3.2. Detailed Inclusion Rules & Overlap Semantics
- **Assigned to Me (`assigneeId === currentUser.id`):** The primary execution set. Every uncompleted or recently completed work item assigned to the user appears here.
- **Created by Me (`creatorId === currentUser.id`):** Normalized authorship scope. Items authored by the user appear here, **regardless of who is currently assigned**. If the user creates an item and assigns it to themselves, that item legitimately and intentionally appears in **both** `Assigned` and `Created`.
- **Subscribed / Following (`subscriberIds.includes(currentUser.id)`):** Followed items scope. Items subscribed to by the user appear here, **regardless of whether the user also created or is assigned to the item**.
- **Simultaneous Multi-Tab Overlap:** An item may legitimately appear in `Assigned`, `Created`, and `Subscribed` simultaneously if the user is the author, current assignee, and explicit subscriber.
- **Overview Focus:** The `Overview` cockpit remains focused strictly on actionable personal responsibility (`assigneeId === currentUser.id`) rather than unioning all three tabs.

### 3.3. Exclusion Rules
- **Unassigned Items:** Excluded from My Work execution scopes unless the user created or subscribed to them.
- **Notification Chatter / Mentions:** Excluded. Mentions, thread replies, and assignment notifications belong exclusively in `PER-001 Inbox`.
- **Completed Work Older than Retention Limit:** Completed or canceled items completed $> 7\text{ days}$ ago are excluded by default to prevent historical pollution (accessible via explicit filter).
- **Cross-Workspace Data:** Inaccessible tenant workspaces are excluded. My Work is strictly bounded to the **Active Workspace**.

---

## 4. Information Architecture & Navigation

My Work adheres strictly to the frozen shell layout:

```text
┌──────────────┬──────────────────────────────────────────────────────────────────────────────────┐
│              │ ContextBar                                                                       │
│              │ Identity: Orynqo Corp › Product & Engineering › My Work                          │
│   Sidebar    │ Tabs: [ Overview ] [ Assigned (14) ] [ Created (6) ] [ Subscribed (3) ]         │
│              │ Projections: [ Grid ] [ Board ] [ Timeline ]  | Filters | Search | + New Item    │
│   (WHERE)    ├──────────────────────────────────────────────────────────────────┬───────────────┤
│              │                                                                  │               │
│              │ Main Content Viewport                                            │ WorkItem      │
│              │ (Overview Cockpit OR Assigned Grid/Board/Timeline)               │ Inspector     │
│              │                                                                  │ (DETAIL)      │
│              │                                                                  │               │
└──────────────┴──────────────────────────────────────────────────────────────────┴───────────────┘
```

### 4.1. ContextBar Composition for My Work
1. **Breadcrumbs:** `[Workspace Name] › My Work › [Active Tab]`
   - `Workspace Name`: Navigates to workspace root (`teams`).
   - `My Work`: Navigates to `My Work Overview`.
   - Chevron: Sibling switcher between Personal destinations (`Inbox` vs `My Work`).
2. **Resource Tabs (WHAT):**
   - `Overview`: Unified actionable cockpit.
   - `Assigned` (with total active badge): Full execution query scope.
   - `Created`: Authored items query scope (`creatorId === currentUser.id`).
   - `Subscribed`: Followed items query scope (`subscriberIds.includes(currentUser.id)`).
3. **Projections Strip (HOW):**
   - Active on `Assigned`, `Created`, and `Subscribed` tabs:
     - `Grid / Table` (`WRK-001`) [Default]
     - `Board / Kanban` (`WRK-002`)
     - `Timeline` (`WRK-003`)
   - Disabled/hidden on `Overview` (Overview has a dedicated cockpit composition).
4. **Summary Metric Strip:**
   - 28px high-density operational counters:
     - `14 Active` • `3 Overdue` (red) • `2 Due Today` (amber) • `1 Blocked` (purple)
5. **Actions:**
   - Quick in-view search (`Filter my work...`).
   - `Filter` builder popover.
   - `+ New Item` CTA (invokes Quick Create with `teamId: null`, user selects team).

---

## 5. Overview Cockpit Contract

When the `Overview` tab is active, My Work presents an actionable operational cockpit consisting of **exactly five primary sections**:

1. `Needs Attention`
2. `In Progress`
3. `Upcoming`
4. `Unscheduled`
5. `Recently Completed`

> **Critical Semantics:** `Blocked`, `Overdue`, `Due Today`, and `In Review` are **NOT** separate Overview sections. They are **attention reasons / classification predicates** that route items into `Needs Attention`.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔴 NEEDS ATTENTION (3)                                                             [View all]   │
├──────────┬──────────────────────────────────────────┬──────────────┬────────────┬───────────────┤
│ ENG-104  │ Distributed Consensus Protocol Deadlock  │ In Progress  │ 🔴 Overdue │ Core Platform │
│ ENG-202  │ Raft Log Replication Lag under Partition │ Blocked      │ 🟣 Blocked │ Core Platform │
│ WEB-301  │ SCIM v2 User Provisioning Sync           │ In Review    │ 🟡 Today   │ Web Client    │
└──────────┴──────────────────────────────────────────┴──────────────┴────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚡ IN PROGRESS (4)                                                                              │
├──────────┬──────────────────────────────────────────┬──────────────┬────────────┬───────────────┤
│ ENG-112  │ WAL Compression and Segment Rotation     │ In Progress  │ Tomorrow   │ Core Platform │
│ ENG-115  │ gRPC Streaming Connection Keepalive      │ In Progress  │ Oct 12     │ Core Platform │
└──────────┴──────────────────────────────────────────┴──────────────┴────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📅 UPCOMING (5)                                                                                 │
├──────────┬──────────────────────────────────────────┬──────────────┬────────────┬───────────────┤
│ ENG-120  │ Snapshot Isolation Benchmark Suite       │ Todo         │ Oct 16     │ Core Platform │
│ WEB-310  │ Grid Cell Virtualization Memory Leak     │ Todo         │ Oct 18     │ Web Client    │
└──────────┴──────────────────────────────────────────┴──────────────┴────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⏳ UNSCHEDULED (2)                                                                              │
├──────────┬──────────────────────────────────────────┬──────────────┬────────────┬───────────────┤
│ ENG-145  │ Profile memory allocations in TLS pool   │ Todo         │ —          │ Core Platform │
└──────────┴──────────────────────────────────────────┴──────────────┴────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ▸ RECENTLY COMPLETED (Last 7 days) (8)                                             [Collapsed]  │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.1. Overview Section Definitions & Deterministic Assignment Waterfall

To avoid mixing sections with reason labels, Overview assignment operates via a two-stage process:

#### Stage 1: Section-Assignment Precedence Waterfall
Every item assigned to the user (`assigneeId === currentUser.id`) is evaluated through the following strictly ordered waterfall and appears **in exactly one section**:

$$\text{Needs Attention} \longrightarrow \text{In Progress} \longrightarrow \text{Upcoming} \longrightarrow \text{Unscheduled} \longrightarrow \text{Recently Completed}$$

1. **`Needs Attention`:** Any active item meeting at least one attention reason predicate (`isBlocked || isOverdue || isDueToday || isReviewRequested`).
2. **`In Progress`:** Eligible started work not requiring attention (`statusCategory === 'started'`).
3. **`Upcoming`:** Future scheduled work due within the configured near-term window (default: next 7 user-local days).
4. **`Unscheduled`:** Active unscheduled work (`dueDate === null && cycleId === null`).
5. **`Recently Completed`:** Completed or canceled work within the recent window (`completedAt >= today - 7d`).

#### Stage 2: Needs Attention Deterministic Reason Precedence
Within `Needs Attention`, an item may satisfy multiple predicates (e.g., both `Blocked` and `Overdue`). Its primary classification is resolved via deterministic reason precedence:

$$\text{Blocked} \succ \text{Overdue} \succ \text{Due Today} \succ \text{Review Requested}$$

- **Multi-Reason Visual Exposure:** An item visually exposes multiple applicable reasons (e.g., `Blocked · 2d overdue`), but appears **only once** in the list.
- **Section Action:** The section header provides a `View all` link (or no action). It strictly rejects any generic `[Resolve All]` action because blocked, overdue, due-today, and review-requested items cannot be resolved through a single universal mutation.

---

## 6. Personal Work Buckets & Canonical Time Model

### 6.1. Canonical Time Semantics
All date evaluations are computed in the user’s configured local timezone (`PER-003: user.timezone`). The platform uses one single canonical time model:

- **Overdue:** $\text{dueDate} < \text{startOfDay(today)}$.
- **Due Today:** $\text{startOfDay(today)} \le \text{dueDate} \le \text{endOfDay(today)}$.
- **Due Soon:** $\text{endOfDay(today)} < \text{dueDate} \le \text{today} + 7\text{ user-local days}$.
- **Later:** $\text{dueDate} > \text{today} + 7\text{ user-local days}$.
- **No Due Date:** $\text{dueDate} = \text{null}$.

### 6.2. Overview Near-Term Window vs Assigned Grid
- **Overview `Upcoming` Section:** Represents actionable future assigned work due within the configured near-term window, initially **7 days** ($\text{Due Soon}$). Items due later remain accessible through `Assigned` (Grid/Board) and filters rather than bloating the Overview cockpit. The 7-day window is a tunable product default, not immutable architecture.
- **Contradiction Resolution:** The canonical model eliminates any contradictory definitions where `Upcoming` simultaneously meant $\le 7\text{d}$ and $> 7\text{d}$.

### 6.3. Separation of Bucket Classification from Grid Grouping
Overview section assignment and DataGrid due-date grouping are related but structurally distinct concepts:
- **Overview Sections (5):**
  `Needs Attention` / `In Progress` / `Upcoming` / `Unscheduled` / `Recently Completed`
- **DataGrid Due-Date Grouping (5):**
  `Overdue` / `Due Today` / `This Week` / `Later` / `No Due Date`

These two concepts use separate enums and must never be conflated.

---

## 7. Work Projections Contract (`HOW`)

When the user navigates to `Assigned`, `Created`, or `Subscribed`, canonical work management projections are engaged:

### 7.1. DataGrid Projection (`WRK-001`) — Default
Reuses the frozen UI-01B High-Density Data Grid.
- **Default Columns:**
  1. `Identifier` (`key` + sequential number, e.g., `ENG-104`, pinned left, 90px).
  2. `Title` (flexible text with blocker indicator, min 240px).
  3. `Status` (explicit Universal Status Picker, 120px).
  4. `Priority` (explicit Universal Priority Picker, 100px).
  5. `Team` (Universal Team Picker, 120px).
  6. `Project` (Universal Project Picker, 140px).
  7. `Cycle` (Universal Cycle Picker, 100px).
  8. `Due Date` (Universal Date Picker with overdue semantic color, 100px).
  9. `Estimate` (points / hours badge, 70px).
- **Default Grouping:** Group by `Due Date Bucket` (`Overdue`, `Due Today`, `This Week`, `Later`, `No Due Date`).
- **Default Sorting:**
  1. Urgency Rank (Overdue first $\rightarrow$ Due Today $\rightarrow$ In Progress $\rightarrow$ Normal).
  2. Priority (`urgent` $\rightarrow$ `high` $\rightarrow$ `medium` $\rightarrow$ `low`).
  3. Due Date ascending.
  4. Stable tie-breaker: `id` ascending.

### 7.2. Kanban Board Projection (`WRK-002`)
Reuses the frozen UI-01 Kanban Board.
- **Default Column Grouping:** `Status Category` (`Backlog` $\rightarrow$ `Todo` $\rightarrow$ `In Progress` $\rightarrow$ `In Review` $\rightarrow$ `Done`).
- **Cards Display:** Title, identifier, priority icon, due date badge, team icon, blocker pill.
- **Drag-and-Drop:** Dragging across columns updates the canonical `status`. If moving to a status with team consequence, invokes the consequence resolver modal.
- **Board Quick Create Rule:** If the Board supports Quick Create from a status column:
  - It may prefill the applicable status or status category **only where the Team workflow can resolve that safely**.
  - It **MUST NOT infer Team**. From My Work, `teamId` remains unresolved (`null`) unless explicitly established by valid invocation context.
  - If status cannot be resolved without Team selection (e.g., custom team workflow statuses), **defer status resolution until Team is chosen**. UI-01C context precedence and consequence rules are strictly preserved.

### 7.3. Timeline Projection (`WRK-003`)
Reuses the frozen UI-01 Timeline capabilities.
- **Scope Protection:** UI-03B is a **consumer of the projection**, not the owner of Timeline architecture. UI-03B must reuse frozen Timeline capabilities and is **NOT** responsible for adding new platform-wide capabilities such as dependency creation, new resize semantics, or new scheduling engines unless they already exist in the frozen Timeline implementation.
- **Scope:** Renders work items that have explicit `startDate` and `dueDate` or belong to an active `Cycle`.
- **Unscheduled Drawer:** Items missing temporal data appear in a collapsible bottom drawer: `Unscheduled Items (N)`.

### 7.4. Rejection of Calendar Projection for CORE
- **Decision:** **REJECTED FOR CORE (POST-CORE CANDIDATE).** A month-grid calendar provides low execution density for engineers compared to DataGrid and Timeline. Timeline already handles multi-day gantt execution cleanly.

### 7.5. Rejection of Workload Projection in My Work
- **Decision:** **REJECTED IN MY WORK.** Personal workload is redundant with My Work itself. Capacity leveling across users is a Team Lead / Management job (`TEM-002`).

---

## 8. Execution Core Integration Invariants

### 8.1. WorkItem Inspector Integration (`UI-01A`)
- **Invocation:** Clicking any row or card opens the Inspector in the right split panel (`--inspector-width: 440px`).
- **Context Preservation:** Opening the Inspector does **not** alter the My Work sidebar selection, does not navigate away, and does not alter active filters.
- **Canvas Reclamation:** Closing the Inspector immediately expands the DataGrid/Canvas back to 100% available width. Focus restores to the originating row.
- **Deep-linking:** URL updates to `?item=<itemId>` without triggering full page reload.

### 8.2. Quick Create Integration (`UI-01C`)
- **Invocation:** Clicking `+ New Item` or pressing `C`.
- **Global Context Rule:** Because My Work is a personal, multi-team surface, **NO TEAM IS PRE-INVENTED**.
- **Context Prefill:**
  - `initialContext: { assigneeId: currentUser.id, teamId: null }`
  - The `Team` picker in Quick Create defaults to `Select Team *` (unresolved).
  - The `Assignee` picker defaults to `Current User` (since created from My Work).
  - The user must explicitly choose the Team. Never default to the user's "primary" or "first" team.

### 8.3. Universal Property Pickers & Mutation Consistency (`UI-01C/D`)
- Inline editing of Status, Priority, Assignee, Due Date, Project, Team, or Cycle within My Work emits standard canonical mutations.
- When an item is mutated in My Work, all other active views (`Team Work`, `Project Work`, `DataGrid`, `Inspector`) update immediately via shared canonical domain state.
- Rollback on failure displays an error toast and reverts the cell to its canonical state.

---

## 9. Advanced Personal Execution Mechanics

### 9.1. Personal Prioritization (Personal Queue Layer)
- Do **NOT** overload canonical `priority`.
- For UI-03B Core, sorting defaults strictly to canonical Urgency + Due Date + Priority.
- A dedicated `personalOrder` lexicographical floating index is approved as a **POST-CORE** extension.

### 9.2. Multi-Team Status Category Normalization
- My Work grouping and summary metrics resolve through standard `statusCategory`:
  - `backlog`
  - `unstarted` (Todo)
  - `started` (In Progress)
  - `review` (In Review / QA)
  - `completed` (Done / Closed)
  - `canceled` (Canceled / Wontfix)
- Cell rendering in DataGrid displays the team's concrete workflow label, but board columns and overview groupings use the unified `statusCategory`.

### 9.3. Blocked Work Mechanics
- **Canonical Dependency Check:**
  $$\text{isBlocked} \iff \exists\, r \in \text{item.relations} \mid r.\text{type} = \text{'blocked_by'} \land \text{resolveItem}(r.\text{targetId}).\text{statusCategory} \notin \{\text{'completed'}, \text{'canceled'}\}$$
- **UI Treatment:** DataGrid title column displays a prominent purple `Blocked by [ID]` pill. Clicking opens the blocking item in the Inspector.

---

## 10. System States, Measurable Scale & Accessibility

### 10.1. Operational State Transitions

| State | Visual Treatment | Operational Behavior |
| :--- | :--- | :--- |
| **Initial Loading** | High-density skeleton row placeholders across ContextBar metrics and DataGrid rows. | No full-page blocking spinners. Canvas layout remains stable during hydration. |
| **All Caught Up** | Neutral empty state graphic: *"No active work assigned to you."* | Optional secondary action button: `Browse Teams` (`TEM-001`). Does not pressure users into self-assignment. |
| **Filtered Empty** | *"No tasks match the active filters."* | Displays CTA button: `Reset Filters`. |
| **Overdue Clear** | Small green badge in metric strip: `0 Overdue`. | No fireworks or giant celebration UI. Maintains serious professional tone. |
| **Network Disconnection (`SYS-003`)** | Persistent compact banner below ContextBar: *"Offline — Reading cached work items. Mutations paused."* | Allows read-only navigation of cached items. Disables mutation pickers. Reconciles on reconnect. |
| **Permission Revocation (`SYS-002`)** | Item gracefully fades out with notification: *"Item moved to private container."* | Inspector closes cleanly if viewing that item. No sensitive title/metadata leaked. |

### 10.2. Measurable Performance Targets (No Unverified Hard Guarantees)
Rather than asserting unmeasured hard guarantees (such as `<50MB memory` or guaranteed `60fps`), the UI-03 implementation commits to measurable implementation targets:
- **Virtualized / Windowed Rendering:** Applied for large result sets via the DataGrid engine.
- **Bounded DOM Growth:** Viewport DOM node count remains constant regardless of dataset size (e.g. 1,000+ items).
- **Cursor Pagination:** Applied for completed and historical queries.
- **Profiling-Driven Overscan:** Dynamic scroll window tuning based on device telemetry.
- **Responsive Interaction:** Maintain fluid interactions and low input latency under representative enterprise datasets.
- **Empirical Benchmarks:** Numerical performance budgets will be benchmarked and profiled under realistic loads before freezing numerical guarantees.

### 10.3. Accessibility Contract (Target Standards)
> **Compliance Stance:** Target WCAG 2.2 AA behavior where applicable; implementation requires validation and does not constitute certification.

Concrete requirements preserved:
- **Keyboard Navigation:** Full keyboard operability (`j`/`k` vertical navigation, `Enter` to open Inspector, `Escape` to close/dismiss, `Space` to toggle selection).
- **Focus Restoration:** Deterministic focus return to originating triggers upon modal or drawer dismissal.
- **Semantic HTML & ARIA:** Proper `role="grid"`, `role="row"`, `aria-expanded`, and landmark structure.
- **Color Independence:** All statuses, blockers, and overdue alerts pair color with explicit icons or text labels (e.g. `Blocked`, `2d overdue`).

---

## 11. URL State & Saved Preferences

### 11.1. Shareable & Deep-Linkable URL Parameters
- `?surface=my-work`
- `&tab=overview | assigned | created | subscribed`
- `&view=data-grid | kanban | timeline`
- `&item=<workItemId>`
- `&filter=<encodedFilterString>`
- `&group=due_date | status | priority | project | team`

### 11.2. Precedence Law
$$\text{Explicit URL Parameter} \gg \text{Saved User View / Preference} \gg \text{System Default}$$

### 11.3. Scoped Preference Ownership
Preferences must be owned by appropriate domain boundaries. **Sidebar preferences must remain Sidebar-specific (`useSidebarPreferences`); My Work preferences are strictly removed from the Sidebar boundary.**

My Work presentation preferences conceptually belong to `useMyWorkPreferences` (or a generic scoped user/view-preferences boundary):
- Last active My Work tab (`overview`, `assigned`, `created`, `subscribed`).
- My Work projection per tab (`data-grid`, `kanban`, `timeline`).
- My Work grouping and sorting preferences.
- Collapsed states of Overview sections (e.g., `Recently Completed: true`).

*Note on Density:* Density (`compact` vs `default`) remains a broader user presentation preference owned globally by the shell. Avoid creating a giant monolithic preferences context.

---

## 12. Component Architecture & Reusability

```text
src/
├── features/my-work/
│   ├── components/
│   │   ├── MyWorkCockpit.jsx          # Master controller coordinating tabs and projections
│   │   ├── MyWorkOverview.jsx         # Overview cockpit renderer (5 primary sections)
│   │   ├── AttentionSection.jsx       # Needs Attention section (deterministic reason precedence)
│   │   ├── WorkBucketSection.jsx      # Generic collapsible section (In Progress, Upcoming, Unscheduled)
│   │   ├── RecentlyCompletedList.jsx  # Compact 7-day completion accordion
│   │   ├── MyWorkSummaryStrip.jsx     # 28px operational metric counters
│   │   └── EmptyWorkState.jsx         # Clean empty states (all caught up vs filtered empty)
│   ├── hooks/
│   │   ├── useMyWorkQuery.js          # Authoritative query boundary over canonical WorkItem store
│   │   ├── useMyWorkBuckets.js        # Deterministic bucket resolution & reason precedence
│   │   └── useMyWorkPreferences.js    # Scoped My Work preferences (tab, projection, collapsed states)
│   └── index.js
```

### 12.1. Reused Core Primitives
- `AppShell` (`src/layouts/AppShell.jsx`)
- `ContextBar` (`src/layouts/ContextBar/ContextBar.jsx`)
- `ContextBreadcrumbs` (`src/layouts/ContextBar/ContextBreadcrumbs.jsx`)
- `ResourceNavBar` (`src/layouts/ContextBar/ResourceNavBar.jsx`)
- `ProjectionSwitcher` (`src/components/navigation/Projections/ProjectionSwitcher.jsx`)
- `DataGrid` (`src/views/DataGrid/DataGrid.jsx`)
- `KanbanBoard` (`src/views/KanbanBoard/KanbanBoard.jsx`)
- `TimelineView` (`src/views/TimelineView/TimelineView.jsx`)
- `WorkItemInspector` (`src/features/work-items/WorkItemInspector.jsx`)
- `QuickCreateDialog` (`src/features/work-items/quick-create/QuickCreateDialog.jsx`)
- `FilterBuilder` (`src/components/filters/FilterBuilder.jsx`)
- `PropertyPickers` (`StatusPicker`, `PriorityPicker`, `AssigneePicker`, `TeamPicker`, `ProjectPicker`, `CyclePicker`, `DatePicker`)

---

## 13. Interaction Matrix

| User Trigger | UI State Transition | Canonical Data Action | Focus & Keyboard Lifecycle |
| :--- | :--- | :--- | :--- |
| **Click Sidebar `My Work` or `G M`** | Shell navigates to `PER-002`. Tab defaults to `Overview` or saved preference. | Queries canonical WorkItems matching scope. | Focus defaults to primary canvas; arrow keys navigate list items. |
| **Click ContextBar Tab `Assigned`** | Switches from Overview cockpit to full DataGrid projection. | Re-queries with responsibility scope `assigned`. | Focus remains on selected tab; Tab key traverses into DataGrid row 0. |
| **Click ContextBar Tab `Created`** | Switches to Created scope (`creatorId === currentUser.id`). | Re-queries with authorship scope `created`. | Focus remains on selected tab. |
| **Click ContextBar Tab `Subscribed`** | Switches to Subscribed scope (`subscriberIds.includes(currentUser.id)`). | Re-queries with subscription scope `subscribed`. | Focus remains on selected tab. |
| **Click Projection Switcher `Board`** | Switches canvas from DataGrid to Kanban Board. URL appends `&view=kanban`. | Same canonical items passed to `KanbanBoard`. | Arrow keys traverse Kanban columns and cards. |
| **Click Blocker Pill `🔴 Blocked`** | Opens popover or slides open Inspector to the blocking WorkItem. | Reads blocking WorkItem from canonical store. | Focus transfers to Inspector; `Escape` restores focus to originating row. |
| **Inline Status Change to `Done`** | Item status updates; checkmark animation; row moves to `Recently Completed`. | Emits `updateItem(id, { status: 'done', completedAt: now })`. | Focus moves to next row in DataGrid. |
| **Press `C` or Click `+ New Item`** | `QuickCreateDialog` opens. Assignee prefilled to Current User; Team unresolved. | Draft state in modal only (zero phantom items created). | Focus locks to Title input. Escape restores focus to invocation CTA. |
| **Double Click Row in DataGrid** | Inspector opens on right side. DataGrid contracts smoothly without layout break. | `selectedItemId` set; deep-link `?item=id`. | Focus moves to Inspector header title input. |
| **Click Inspector Close Button** | Inspector closes. DataGrid reclaims 100% canvas width. | Closes split drawer; removes `?item` from URL. | Focus deterministically restores to the originating row in DataGrid. |
| **Type in In-View Search Input** | DataGrid/Overview filters rows in real time. | Filters local query projection on title, ID, project, and team. | Focus remains in search input; ArrowDown jumps into first matching result. |
| **Network Disconnects** | ContextBar displays offline indicator; status pickers enter read-only mode. | Mutation queue disabled; reads from local cached state. | Screen-reader announces: *"Connection lost. Working offline."* |

---

## 14. Query & Data Contract

```typescript
export interface MyWorkQueryRequest {
  workspaceId: string;
  currentUserId: string;
  scope: 'overview' | 'assigned' | 'created' | 'subscribed';
  filters?: {
    teamIds?: string[];
    projectIds?: string[];
    cycleIds?: string[];
    statusCategories?: Array<'backlog' | 'unstarted' | 'started' | 'review' | 'completed' | 'canceled'>;
    priorities?: Array<'urgent' | 'high' | 'medium' | 'low'>;
    dueRange?: { start?: string; end?: string };
    searchQuery?: string;
  };
  sort?: {
    field: 'urgency' | 'dueDate' | 'priority' | 'status' | 'updatedAt';
    direction: 'asc' | 'desc';
  };
  pagination?: {
    cursor?: string;
    limit?: number;
  };
}

export interface MyWorkQueryResponse {
  items: WorkItem[];
  summaryMetrics: {
    totalActive: number;
    overdueCount: number;
    dueTodayCount: number;
    inProgressCount: number;
    blockedCount: number;
    completedPastWeekCount: number;
  };
  buckets?: {
    needsAttention: WorkItem[];
    inProgress: WorkItem[];
    upcoming: WorkItem[];
    unscheduled: WorkItem[];
    recentlyCompleted: WorkItem[];
  };
  pageInfo: {
    hasNextPage: boolean;
    endCursor?: string;
  };
}
```

---

## 15. Page Data Matrix

| Section / Surface | Canonical Entity Source | Scope / Filter Predicate | Key Attributes Displayed | Supported Operations |
| :--- | :--- | :--- | :--- | :--- |
| **Summary Metric Strip** | `WorkItem[]` | `assigneeId == currentUser && statusCategory != completed` | Overdue count, Today count, Blocked count, Total active | Click count chip to apply instant filter to canvas. |
| **Needs Attention** | `WorkItem[]` | `assigneeId == currentUser && (isBlocked || isOverdue || isDueToday || isReviewRequested)` | ID, Title, Status, Priority, Due Date, Blocker Pill, Team | Inline status change, open Inspector, resolve blocker, `View all`. |
| **In Progress** | `WorkItem[]` | `assigneeId == currentUser && statusCategory == started && !needsAttention` | ID, Title, Priority, Team, Project, Cycle, Due Date | Inline edit, reassign, drag status, open detail. |
| **Upcoming** | `WorkItem[]` | `assigneeId == currentUser && statusCategory in [unstarted, backlog] && dueDate <= today + 7d && !needsAttention` | ID, Title, Priority, Due Date, Cycle, Team | Reschedule date, assign cycle, prioritize. |
| **Unscheduled** | `WorkItem[]` | `assigneeId == currentUser && dueDate == null && cycleId == null && !needsAttention && !completed` | ID, Title, Priority, Project, Team | Assign due date, assign cycle, reorder. |
| **Recently Completed** | `WorkItem[]` | `assigneeId == currentUser && statusCategory in [completed, canceled] && completedAt >= today - 7d` | ID, Title, Completed date, Team, Estimate | Reopen item, copy identifier, view resolution notes. |
| **Assigned Grid** | `WorkItem[]` | `assigneeId == currentUser` (respecting active filters) | Full 9 DataGrid columns | Full keyboard navigation, inline property pickers, multi-select bulk actions, due-date grouping. |
| **Created Grid** | `WorkItem[]` | `creatorId == currentUser` (respecting active filters) | Full 9 DataGrid columns | Full keyboard navigation, inline property pickers, author monitoring. |
| **Subscribed Grid** | `WorkItem[]` | `subscriberIds.includes(currentUser.id)` (respecting active filters) | Full 9 DataGrid columns | Full keyboard navigation, inline property pickers, subscription tracking. |
| **Board Projection** | `WorkItem[]` | Current scope query (`assigned`, `created`, `subscribed`) | Kanban card layout grouped by Status Category | Drag-and-drop column transition. Quick Create in column prefilling status only if Team resolves safely (Team remains unresolved). |
| **Timeline Projection** | `WorkItem[]` | Current scope query & temporal bounds | Gantt bars on chronological scale | **Existing supported Timeline operations:** bar rendering, date visual inspection, inspector detail. *(Future Timeline capabilities: platform dependency linking, interactive resize engine, scheduling engine — deferred).* |

---

## 16. Explicit Non-Goals

1. **NO Inbox Product Design:** Threaded conversations, mention notifications, and triage feeds belong to `PER-001 Inbox` and are not implemented here.
2. **NO Analytics / KPI Dashboards:** No velocity charts, burndown graphs, or executive scorecards.
3. **NO Personal Calendar Engine:** Month-grid calendars with hourly meeting blocks are rejected for CORE.
4. **NO Team Capacity Leveling:** Cross-member workload balancing belongs in `TEM-002: Team Workload`.
5. **NO Cloned WorkItem Database:** No local personal task schema. All tasks are canonical workspace work items.
6. **NO Cross-Workspace Tenant Aggregation in Core:** My Work operates within the active tenant boundary.
7. **NO Timeline Platform Ownership:** UI-03B does not design or build new platform timeline/gantt engines.

---

## 17. Frozen Product Decisions Summary

| Decision Area | Approved Architectural Resolution | Rationale |
| :--- | :--- | :--- |
| **Scope Normalization** | `Created` = `creatorId === currentUser.id`. `Subscribed` = `subscriberIds.includes(currentUser.id)`. Multi-tab overlap is valid. | Query scopes, not mutually exclusive datasets. An item can exist in Assigned, Created, and Subscribed simultaneously. |
| **Overview Bucket Architecture** | Exactly 5 sections: `Needs Attention`, `In Progress`, `Upcoming`, `Unscheduled`, `Recently Completed`. | Prevents mixing attention predicates (`Blocked`, `Overdue`, etc.) with section containers. |
| **Needs Attention Precedence** | Deterministic reason precedence: `Blocked > Overdue > Due Today > Review Requested`. Item appears once. | Prevents duplicate card clutter while preserving multi-reason visual chips. |
| **Canonical Time Model** | Overdue (< today), Due Today (today), Due Soon ($\le 7\text{d}$), Later ($> 7\text{d}$), No Due Date. | Canonical time model across Overview and DataGrid without contradictory definitions. |
| **Grid vs Overview Grouping** | Overview uses the 5 sections; Grid uses 5 due-date buckets (`Overdue`, `Due Today`, `This Week`, `Later`, `No Due Date`). | Distinct enums tailored to cockpit execution vs tabular projection scanning. |
| **Preference Ownership** | Isolated in `useMyWorkPreferences` (or generic scoped user/view-preferences boundary). Removed from `useSidebarPreferences`. | Sidebar preferences remain Sidebar-specific; prevents monolithic preference sprawl. |
| **Board Quick Create** | May prefill status only if Team resolves safely; `teamId` remains unresolved. | Preserves UI-01C invariants; never invents team context. |
| **Timeline Scope Protection** | Reuse existing supported Timeline operations only. | Prevents UI-03B from owning platform-wide Gantt/scheduling engines. |
| **Data Architecture Boundary** | Explicitly state: `WorkspaceContext` is not the long-term My Work data architecture. | Keeps `useMyWorkQuery` behind a clean query boundary for future server-state/cache migration. |
| **Empty State Tone** | Neutral copy: *"No active work assigned to you."* Optional secondary action: `Browse Teams`. | Avoids pressuring users into self-assignment. |
| **Performance Stance** | Measurable implementation targets (virtualization, bounded DOM, cursor pagination, profiling) over unverified hard guarantees. | Honest engineering rigor; no numerical budget frozen without empirical measurement. |
| **Accessibility Stance** | Target WCAG 2.2 AA behavior where applicable; implementation requires validation and does not constitute certification. | Accurate legal and product compliance posture while maintaining concrete keyboard and semantic standards. |

---

## 18. UI-03B Implementation Plan

Following Human Review approval of this specification, UI-03B will execute the implementation:

1. **Data Architecture & Query Boundary:**
   - **Crucial Architecture Rule:** `WorkspaceContext is not the long-term My Work data architecture.`
   - In UI-03B, `WorkspaceContext` is utilized solely as an existing prototype/domain adapter.
   - Keep `useMyWorkQuery` encapsulated behind a clean query boundary so it can later migrate to server-state, React Query / SWR cache, or a paginated normalized entity store without refactoring My Work presentation components.
   - Implement `useMyWorkBuckets.js` enforcing the two-stage section assignment and reason precedence waterfall.
   - Implement `useMyWorkPreferences.js` for scoped presentation preferences (tab, projection, collapsed sections).
2. **Cockpit Components:**
   - Implement `MyWorkCockpit`, `MyWorkOverview`, `AttentionSection` (with `View all` / no bulk action), `WorkBucketSection`, and `RecentlyCompletedList`.
   - Implement `MyWorkSummaryStrip` integrated directly into ContextBar Tier 1.
   - Implement `EmptyWorkState` with neutral copy (*"No active work assigned to you."*) and optional `Browse Teams` CTA.
3. **Shell & Router Integration:**
   - Wire `PER-002` route in `App.jsx` to mount `MyWorkCockpit` when `activeScope === 'my-work'`.
   - Connect ContextBar tabs (`Overview`, `Assigned`, `Created`, `Subscribed`) and projection switchers.
4. **Execution Core Verification:**
   - Verify bidirectional synchronization between My Work inline edits and Inspector.
   - Verify Quick Create invocation rules with unresolved team prompt, including Board column Quick Create status deferral rules.
   - Reuse existing supported Timeline operations without expanding Timeline engine scope.
5. **Test Suite:**
   - Write comprehensive unit & integration tests (`src/__tests__/ui-03b-my-work.test.jsx`) validating all bucket algorithms, multi-tab query scopes, reason precedence, filtering, sorting, and keyboard workflows.
