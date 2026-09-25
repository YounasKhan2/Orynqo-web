# UI-03A — My Work Product & UX Contract

- **Document Version:** `1.0.0`
- **Surface Identifier:** `PER-002` (My Work Cockpit)
- **Status:** **APPROVED PRODUCT & UX SPECIFICATION — FROZEN AT HUMAN REVIEW**
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
4. **Decoupled from Inbox (`PER-001`):** My Work is for **executable work items** (assigned, blocking, authored). Inbox is for **notifications, mentions, status pings, and triage chatter**. They do not duplicate each other.
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
| **Linear** | *My Issues* (`Assigned`, `Created`, `Subscribed`, `Activity`). Instant filtering, grouped by cycle/status. Ultra-fast list and board. | Eliminates clutter. Focuses purely on execution without unnecessary metric widgets. Grouping by Cycle or Project provides strong mental anchors. | **ADAPT:** Adopt the clean `Assigned` / `Created` / `Subscribed` partition. Adapt to include an actionable `Overview` tab with an urgent `Needs Attention` section. |
| **Asana** | *My Tasks* (`Recently Assigned`, `Do Today`, `Do Next Week`, `Later`). Manual/auto triage sections. | Highlights personal triage workflows where users categorize inbound assignments before committing. | **ADAPT:** Adopt deterministic time-based buckets (`Overdue`, `Due Today`, `Due Soon`, `Unscheduled`). Reject manual multi-section dragging that desynchronizes team planning. |
| **Jira** | *Your Work* (`Assigned to Me`, `Worked On`, `Starred`). Tabular query views. | Tabular scanning across multi-project environments is familiar to enterprise teams. | **REJECT:** Jira’s fragmented dashboards, slow page loads, disjointed custom query screens, and disconnected detail modals. |
| **ClickUp** | *Home / My Work* (LineUp, Trending, Assigned, Overdue cards). | Card-based summary metrics at the top of the personal home page. | **REJECT:** Giant KPI card clutter ("Card Dashboard Syndrome"). Orynqo replaces giant cards with a 28px dense operational metric strip in the ContextBar. |
| **Notion** | *My Tasks* (Linked database views, custom timeline/board). | Polymorphic projection switching over personal queries. | **ADAPT:** Adopt projection switching (`Grid`, `Board`, `Timeline`) over personal work queries, reusing canonical UI-01 projections. |

---

## 3. Scope & Inclusion/Exclusion Rules

### 3.1. Responsibility Scopes

My Work partitions personal responsibility across four distinct tabs:

```text
My Work (PER-002)
├── Overview      (Cockpit: Needs Attention, In Progress, Upcoming, Unscheduled)
├── Assigned      (Primary execution set: assigneeId === currentUser.id)
├── Created       (Authored items: creatorId === currentUser.id && assigneeId !== currentUser.id)
└── Subscribed    (Followed items: subscriberIds.includes(currentUser.id))
```

### 3.2. Detailed Inclusion Rules
- **Assigned to Me (`assigneeId === currentUser.id`):** The primary execution set. Every uncompleted or recently completed work item assigned to the user appears here.
- **Blocked Work:** Any assigned work item whose upstream dependencies (`relations` with `type: 'blocked_by'`) are unresolved.
- **Review / Verification Responsibility:** If an assigned item has status category `review` or the user is listed in `reviewerIds`, it is elevated to `Needs Attention`.
- **Created by Me (`creatorId === currentUser.id`):** Items authored by the user but assigned to others, allowing authors to track status without polluting their personal execution list.
- **Subscribed / Following (`subscriberIds.includes(currentUser.id)`):** High-importance items followed by the user for visibility.

### 3.3. Exclusion Rules
- **Unassigned Items:** Excluded from My Work unless the user is an explicit reviewer or creator (unassigned backlog items belong in `Team Work` or `Triage Inbox`).
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
   - `Assigned` (with total active badge): Full execution set.
   - `Created`: Items authored by the user.
   - `Subscribed`: Items followed by the user.
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

When the `Overview` tab is active, My Work presents an actionable operational cockpit consisting of four high-density sections.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔴 NEEDS ATTENTION (3)                                                      [Resolve All]       │
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

### 5.1. Overview Section Definitions

#### A. Needs Attention
- **Predicate:**
  $$\text{assigneeId} = \text{currentUser} \land \text{statusCategory} \notin \{\text{'completed'}, \text{'canceled'}\} \land (\text{isOverdue} \lor \text{isBlocked} \lor \text{isDueToday} \lor \text{isReviewRequested})$$
- **Visual Signal:** Urgent red/amber accent line; prominent warning badge indicating exact blocker or overdue duration.
- **Purpose:** Immediate triage. Zero items in this section = peace of mind.

#### B. In Progress
- **Predicate:**
  $$\text{assigneeId} = \text{currentUser} \land \text{statusCategory} = \text{'started'} \land \neg(\text{isOverdue} \lor \text{isBlocked})$$
- **Purpose:** Active work the user is currently writing code, designing, or executing for today.

#### C. Upcoming
- **Predicate:**
  $$\text{assigneeId} = \text{currentUser} \land \text{statusCategory} \in \{\text{'unstarted'}, \text{'backlog'}\} \land \text{dueDate} > \text{today} \land \text{dueDate} \le \text{today} + 7\text{d}$$
- **Purpose:** Prepares user for upcoming commitments within the active cycle or week.

#### D. Unscheduled
- **Predicate:**
  $$\text{assigneeId} = \text{currentUser} \land \text{statusCategory} \in \{\text{'unstarted'}, \text{'started'}\} \land \text{dueDate} = \text{null} \land \text{cycleId} = \text{null}$$
- **Purpose:** Exposes commitments lacking temporal targets, preventing tasks from falling into black holes.

#### E. Recently Completed
- **Predicate:**
  $$\text{assigneeId} = \text{currentUser} \land \text{statusCategory} \in \{\text{'completed'}, \text{'canceled'}\} \land \text{completedAt} \ge \text{today} - 7\text{d}$$
- **Default State:** Collapsed accordion. Shows completed items count; expanding provides quick reference for standup notes.

---

## 6. Personal Work Buckets & Time Semantics

### 6.1. Deterministic Overlap Resolution
A work item may qualify for multiple criteria (e.g., both `Blocked` and `Overdue`). To prevent duplicate visual instances within Overview, the following **mutually exclusive priority waterfall** is enforced:

$$\text{Blocked} \succ \text{Overdue} \succ \text{Due Today} \succ \text{In Review} \succ \text{In Progress} \succ \text{Upcoming} \succ \text{Unscheduled}$$

*Example:* A task that is both `In Progress` and `Overdue` is sorted into `Needs Attention (Overdue)`. A task that is both `Blocked` and `Overdue` is prioritized as `Needs Attention (Blocked & Overdue)`.

### 6.2. Precise Time Semantics
All date comparisons are computed in the user’s configured local timezone (`PER-003: user.timezone`):
- **Overdue:** $\text{dueDate} < \text{startOfDay(today)}$.
- **Due Today:** $\text{startOfDay(today)} \le \text{dueDate} \le \text{endOfDay(today)}$.
- **Due Soon (This Week):** $\text{endOfDay(today)} < \text{dueDate} \le \text{endOfWeek(today + 7d)}$.
- **Upcoming:** $\text{dueDate} > \text{endOfWeek(today + 7d)}$.
- **No Due Date:** $\text{dueDate} = \text{null}$.
- **Completed Items:** Completed date takes precedence; due date color turns neutral muted gray once an item enters `completed` status.

---

## 7. Work Projections Contract (`HOW`)

When the user navigates to `Assigned`, `Created`, or `Subscribed`, the canonical work management projections are engaged:

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
- **Default Grouping:** Group by `Due Date Bucket` (Overdue, Due Today, This Week, Later, No Due Date).
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

### 7.3. Timeline Projection (`WRK-003`)
Reuses the frozen UI-01 Timeline.
- **Scope:** Renders assigned work items that have either:
  1. explicit `startDate` and `dueDate`, or
  2. belong to an active `Cycle` with defined cycle dates.
- **Unscheduled Drawer:** Items missing temporal data appear in a collapsible bottom drawer: `Unscheduled Items (N)`.

### 7.4. Rejection of Calendar Projection for CORE
- **Evaluation:** Calendar was considered during visual research.
- **Decision:** **REJECTED FOR CORE (POST-CORE CANDIDATE).** A month-grid calendar provides low execution density for engineers compared to DataGrid and Timeline. Timeline already handles multi-day gantt execution cleanly. Calendar is deferred to a future scheduling milestone.

### 7.5. Rejection of Workload Projection in My Work
- **Evaluation:** Workload projection exists in `TEM-002: Team Workload`.
- **Decision:** **REJECTED IN MY WORK.** Personal workload is redundant with My Work itself (the entire page is the user's workload). Capacity leveling across users is a Team Lead / Management job, not an individual cockpit job.

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
- **Problem:** Users frequently want to flag items as "My Priority Today" without altering the team-wide canonical `priority` field (`urgent`, `high`, `medium`, `low`).
- **Decision:**
  - Do **NOT** overload canonical `priority`.
  - For UI-03B Core, sorting defaults strictly to canonical Urgency + Due Date + Priority.
  - A dedicated `personalOrder` lexicographical floating index is approved as a **POST-CORE** extension. It will allow drag-reordering within My Work without mutating team backlog priorities.

### 9.2. Multi-Team Status Category Normalization
- Because My Work aggregates issues from different teams (e.g., Core Platform, Web Client, Mobile App), individual workflow statuses may differ:
  - Team Core: `In Development`, `Under Peer Review`, `Deployed to Staging`.
  - Team Web: `In Progress`, `PR Open`, `QA Verification`.
- **Normalization Rule:** My Work grouping and summary metrics resolve through standard `statusCategory`:
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
- **UI Treatment:**
  - DataGrid title column displays a prominent purple `Blocked by [ID]` pill.
  - Clicking the pill opens the blocking item directly in the Inspector or shows a popover with title, assignee, and status.
  - If the blocking item is in a restricted workspace/team without read permissions, it displays `Blocked by private issue (SYS-002)` with zero metadata leakage.

---

## 10. System States, Scale & Error Handling

| State | Visual Treatment | Operational Behavior |
| :--- | :--- | :--- |
| **Initial Loading** | High-density skeleton row placeholders across ContextBar metrics and DataGrid rows. | No full-page blocking spinners. Canvas layout remains stable during hydration. |
| **All Caught Up** | Clean empty state graphic: *"You have no assigned tasks. Enjoy the clear plate or browse team backlogs."* | Displays CTA button: `Browse Teams` (`TEM-001`). |
| **Filtered Empty** | *"No tasks match the active filters."* | Displays CTA button: `Reset Filters`. |
| **Overdue Clear** | Small green badge in metric strip: `0 Overdue`. | No fireworks or giant celebration UI. Maintains serious professional tone. |
| **Network Disconnection (`SYS-003`)** | Persistent compact banner below ContextBar: *"Offline — Reading cached work items. Mutations paused."* | Allows read-only navigation of cached items. Disables mutation pickers. Reconciles on reconnect. |
| **Permission Revocation (`SYS-002`)** | If an assigned item moves to a private project where user loses access, item gracefully fades out with notification: *"Item moved to private container."* | Inspector closes cleanly if viewing that item. No sensitive title/metadata leaked. |
| **Large Scale (1,000+ Items)** | Virtualized DOM rendering via `DataGrid` engine; default active query limits non-completed items to active cycle/window. Completed items paginated via cursor. | Memory footprint capped under 50MB; 60fps scrolling preserved. |

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

### 11.3. Persistent Local Preferences (Isolated in `useSidebarPreferences`)
- Last active tab on My Work (`overview` vs `assigned`).
- Density (`compact` vs `default`).
- Collapsed states of Overview sections (e.g., `Recently Completed: true`).
- Preferred projection for `Assigned` tab (`data-grid` vs `kanban`).

---

## 12. Component Architecture & Reusability

To guarantee maintainability, My Work reuses existing design system components and defines only domain-specific cockpit primitives:

```text
src/
├── features/my-work/
│   ├── components/
│   │   ├── MyWorkCockpit.jsx          # Master controller coordinating tabs and projections
│   │   ├── MyWorkOverview.jsx         # Overview cockpit renderer
│   │   ├── AttentionSection.jsx       # Urgent triage card list (Needs Attention)
│   │   ├── WorkBucketSection.jsx      # Generic collapsible section (Active, Upcoming, Unscheduled)
│   │   ├── RecentlyCompletedList.jsx  # Compact 7-day completion accordion
│   │   ├── MyWorkSummaryStrip.jsx     # 28px operational metric counters
│   │   └── EmptyWorkState.jsx         # Clean empty states (all caught up vs filtered empty)
│   ├── hooks/
│   │   ├── useMyWorkQuery.js          # Authoritative query over canonical WorkItem store
│   │   └── useMyWorkBuckets.js        # Deterministic bucket resolution & overlap sorting
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
| **Click Sidebar `My Work` or `G M`** | Shell navigates to `PER-002`. Tab defaults to `Overview` or saved preference. | Queries canonical WorkItems matching `assigneeId = currentUser`. | Focus defaults to primary canvas; arrow keys navigate list items. |
| **Click ContextBar Tab `Assigned`** | Switches from Overview cockpit to full DataGrid projection. | Re-queries with responsibility scope `assigned`. | Focus remains on selected tab; Tab key traverses into DataGrid row 0. |
| **Click Projection Switcher `Board`** | Switches canvas from DataGrid to Kanban Board. URL appends `&view=kanban`. | Same canonical items passed to `KanbanBoard`. | Arrow keys traverse Kanban columns and cards. |
| **Click Blocker Pill `🔴 Blocked`** | Opens popover or slides open Inspector to the blocking WorkItem. | Reads blocking WorkItem from canonical store. | Focus transfers to Inspector; `Escape` restores focus to originating row. |
| **Inline Status Change to `Done`** | Item status updates; checkmark animation; row moves to `Recently Completed`. | Emits `updateItem(id, { status: 'done', completedAt: now })`. | Focus moves to next row in DataGrid. |
| **Press `C` or Click `+ New Item`** | `QuickCreateDialog` opens. Assignee prefilled to Current User; Team unresolved. | Draft state in modal only (zero phantom items created). | Focus locks to Title input. Escape restores focus to invocation CTA. |
| **Double Click Row in DataGrid** | Inspector opens on right side. DataGrid contracts smoothly without layout break. | `selectedItemId` set in workspace context; deep-link `?item=id`. | Focus moves to Inspector header title input. |
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

| Section / Surface | Canonical Entity Source | Filter Predicate | Key Attributes Displayed | Supported Operations |
| :--- | :--- | :--- | :--- | :--- |
| **Summary Metric Strip** | `WorkItem[]` | `assigneeId == currentUser && statusCategory != completed` | Overdue count, Today count, Blocked count, Total active | Click count chip to apply instant filter to canvas. |
| **Needs Attention** | `WorkItem[]` | `isOverdue || isBlocked || isDueToday || isReviewRequested` | ID, Title, Status, Priority, Due Date, Blocker Pill, Team | Inline status change, open Inspector, resolve blocker. |
| **Active Work** | `WorkItem[]` | `statusCategory == started && !isBlocked && !isOverdue` | ID, Title, Priority, Team, Project, Cycle, Due Date | Inline edit, reassign, drag status, open detail. |
| **Upcoming Work** | `WorkItem[]` | `statusCategory in [unstarted, backlog] && dueDate <= today + 7d` | ID, Title, Priority, Due Date, Cycle, Team | Reschedule date, assign cycle, prioritize. |
| **Unscheduled Work** | `WorkItem[]` | `dueDate == null && cycleId == null && !completed` | ID, Title, Priority, Project, Team | Assign due date, assign cycle, reorder. |
| **Recently Completed** | `WorkItem[]` | `statusCategory in [completed, canceled] && completedAt >= today - 7d` | ID, Title, Completed date, Team, Estimate | Reopen item, copy identifier, view resolution notes. |
| **Assigned Grid** | `WorkItem[]` | `assigneeId == currentUser` (respecting active filters) | Full 9 DataGrid columns | Full keyboard navigation, inline property pickers, multi-select bulk actions. |
| **Assigned Board** | `WorkItem[]` | `assigneeId == currentUser` (respecting active filters) | Kanban card layout grouped by Status Category | Drag-and-drop column transition, Quick Create in column. |
| **Assigned Timeline** | `WorkItem[]` | `assigneeId == currentUser && (hasDates || hasCycle)` | Gantt bars on chronological scale | Bar resizing, dependency linking, inspect detail. |

---

## 16. Explicit Non-Goals

1. **NO Inbox Product Design:** Threaded conversations, mention notifications, and triage feeds belong to `PER-001 Inbox` and are not implemented here.
2. **NO Analytics / KPI Dashboards:** No velocity charts, burndown graphs, or executive scorecards.
3. **NO Personal Calendar Engine:** Month-grid calendars with hourly meeting blocks are rejected.
4. **NO Team Capacity Leveling:** Cross-member workload balancing belongs in `TEM-002: Team Workload`.
5. **NO Cloned WorkItem Database:** No local personal task schema. All tasks are canonical workspace work items.
6. **NO Cross-Workspace Tenant Aggregation in Core:** My Work operates within the active tenant boundary.

---

## 17. Frozen Product Decisions Summary

| Decision Area | Approved Architectural Resolution | Rationale |
| :--- | :--- | :--- |
| **Primary IA Partition** | Resource Tabs: `Overview`, `Assigned`, `Created`, `Subscribed`. | Separates personal execution triage from authorship tracking without forcing complex ad-hoc filtering. |
| **Projections Architecture** | Projections (`Grid`, `Board`, `Timeline`) apply to `Assigned`, `Created`, `Subscribed`. Overview has a fixed cockpit layout. | Reinforces `WHAT` (Resource Tabs) vs `HOW` (Projection Controls). |
| **Summary Metrics** | 28px operational text chips in ContextBar. No giant boxes. | Prevents Card Dashboard Syndrome; displays executable tasks immediately above the fold. |
| **Bucket Overlap Resolution** | Deterministic priority waterfall (`Blocked` $\succ$ `Overdue` $\succ$ `Due Today` $\succ \dots$). | Prevents cognitive noise and duplicate rows across Overview sections. |
| **Quick Create Defaults** | `assigneeId: currentUser`, `teamId: null` (unresolved). | Strict adherence to UI-01C: never invent a lead team in multi-team surfaces. User must explicitly choose team. |
| **Calendar & Workload** | Calendar is POST-CORE; Personal Workload is REJECTED. | Timeline handles temporal work; capacity leveling belongs to Team Lead views. |
| **Personal Prioritization** | Canonical priority remains pristine. Custom personal order approved as POST-CORE lexicographical index. | Preserves team-wide sprint prioritization integrity while planning future personal customization. |

---

## 18. UI-03B Implementation Plan

Following Human Review approval of this specification, UI-03B will execute the implementation:

1. **Domain Hook Layer:**
   - Create `src/features/my-work/hooks/useMyWorkQuery.js` filtering canonical items from `WorkspaceContext`.
   - Create `src/features/my-work/hooks/useMyWorkBuckets.js` resolving mutually exclusive attention buckets.
2. **Cockpit Components:**
   - Implement `MyWorkCockpit`, `MyWorkOverview`, `AttentionSection`, `WorkBucketSection`, and `RecentlyCompletedList`.
   - Implement `MyWorkSummaryStrip` integrated directly into ContextBar Tier 1.
3. **Shell & Router Integration:**
   - Wire `PER-002` route in `App.jsx` to mount `MyWorkCockpit` when `activeScope === 'my-work'`.
   - Connect ContextBar tabs (`Overview`, `Assigned`, `Created`, `Subscribed`) and projection switchers.
4. **Execution Core Verification:**
   - Verify bidirectional synchronization between My Work inline edits and Inspector.
   - Verify Quick Create invocation rules with unresolved team prompt.
5. **Test Suite:**
   - Write comprehensive unit & integration tests (`src/__tests__/ui-03b-my-work.test.jsx`) validating all bucket algorithms, filtering, sorting, and keyboard workflows.
