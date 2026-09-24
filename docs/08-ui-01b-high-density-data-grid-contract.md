# ORYNQO — UI-01B PRODUCT CONTRACT & DESIGN SPECIFICATION

## Universal High-Density Data Grid / Work Execution Projection (Correction Pass 01A)

```text
Document Reference: docs/08-ui-01b-high-density-data-grid-contract.md
Phase: UI-01B (Design Correction Pass 01A)
Status: IN HUMAN REVIEW — CORRECTION PASS 01A
Target Surface: Universal Data Grid / Table Projection (WRK-001)
Upstream Dependencies:
  - docs/04-ia-competitive-navigation-research.md (FROZEN)
  - docs/05-sidebar-navigation-contract.md (FROZEN)
  - docs/06-complete-page-and-surface-registry.md (FROZEN)
  - docs/07-ui-01a-work-item-inspector-contract.md (FROZEN - Baseline Commit af9178a)
Governing Skill: antigravity-enterprise-product-design
Working Branch: design/ui-01b-high-density-grid
```

---

## 1. Executive Summary & Product Objective

The **Universal High-Density Data Grid** (`WRK-001`) is Orynqo's primary work-execution projection. It is **not** a generic HTML table, a read-only reporting dashboard, or an ad-hoc page view. It is an enterprise-grade keyboard-navigable grid designed for repeated daily execution by software engineers, product managers, designers, and engineering leadership.

### The Core Architectural Principle

> **One Canonical WorkItem Query/Projection Pipeline $\rightarrow$ Multiple Configured Execution Surfaces.**

The Data Grid is a **projection (HOW)** over canonical WorkItems, not a resource (WHAT) or a navigation tier (WHERE). Different product surfaces—such as **My Work**, **Team Work**, **Project Delivery**, **Active Cycle**, **Backlog**, and **Triage Feed**—configure this universal grid rather than implementing distinct grid components.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          UNIVERSAL GRID PROJECTION                          │
│                                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  │
│  │   My Work    │   │  Active Cycle│   │   Project    │   │   Backlog    │  │
│  │ (Assigned Me)│   │ (Sprint Goal)│   │ (Milestone)  │   │  (Unplanned) │  │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘  │
│         │                  │                  │                  │          │
│         ▼                  ▼                  ▼                  ▼          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │         CANONICAL WORKITEM QUERY PIPELINE (Filter Expression & Sort)  │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │              UNIVERSAL HIGH-DENSITY DATA GRID ENGINE (UI-01B)         │  │
│  │  • 28px/34px Density Rhythm    • Roving TabIndex Navigation           │  │
│  │  • Multi-Column Sort           • Hierarchical Grouping Dimensions     │  │
│  │  • Column Registry             • Multi-Row Selection & Bulk Action Bar│  │
│  │  • Context Preservation        • Inline Property Trigger Contracts    │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │          CANONICAL WORKITEM INSPECTOR DRAWER (FROZEN UI-01A)          │  │
│  │             (Preserves Grid Focus, Row Position, & Scroll)            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frozen Product Laws & Boundary Invariants

1. **Navigation Law:**
   - **Sidebar = WHERE** (Tenant Workspace, Squad Context, Root Resource).
   - **Resource Navigation = WHAT** (Active Cycle, Project, Initiative).
   - **Projection = HOW** (Data Grid, Kanban Board, Timeline, Living Spec).
   - **Inspector = DETAIL WITHOUT LOSING CONTEXT** (Side drawer preserving list anchor).
   - **Command Palette = LONG-TAIL ACTIONS** (Global launcher).
2. **WorkItem Law (Single Source of Truth):**
   - The grid renders canonical WorkItems (`task`, `issue`, `bug`) established in `UI-01A`.
   - **No grid-specific WorkItem types:** Milestones remain checkpoint planning resources; Documents remain living knowledge resources.
   - **No parallel item models:** Relationships (`relations`), living specs (`documentLinks`), and sub-items (`parentId`) are read from the canonical entity.
   - **No independent row state:** Cell edits dispatch mutations directly to the authoritative domain mutation boundary.
3. **UI-01A Inspector Boundary:**
   - UI-01A Inspector architecture is **frozen** at `af9178a`.
   - UI-01B does **not** redesign, fork, or re-architect the Inspector. The grid integrates `WorkItemInspector` and `WorkItemDetailContainer` as-is.
   - Any visual representations of the Inspector in UI-01B design artifacts are illustrative of side-by-side integration only.
4. **Visual Style Law (No Glassmorphism):**
   - Orynqo strictly avoids glassmorphism, decorative backdrop blurs, transparency overlays, and glow effects.
   - All surfaces (including floating bulk actions and popovers) use **opaque semantic elevated surfaces** (`var(--bg-modal)`, `var(--bg-surface-raised)`) with restrained 1px borders and subtle elevation shadows.

---

## 3. Existing Grid Audit

An audit of [`src/views/DataGrid/DataGrid.jsx`](file:///d:/Full_Stack_Apps/Orynqo-web/src/views/DataGrid/DataGrid.jsx) and surrounding components established the architectural disposition:

```text
┌───────────────────────────────────────┬─────────────┬────────────────────────────────────────────────────────┐
│ Prototype Subsystem                   │ Disposition │ Architectural Direction                                │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Monolithic `DataGrid.jsx` (370 lines) │ REPLACE     │ Split into modular toolbar, header, row, cell modules. │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Hardcoded CSS Grid template string    │ REPLACE     │ Govern columns via extensible `ColumnRegistry`.        │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Inline styles on table rows           │ REFACTOR    │ Standardize to design tokens and semantic CSS vars.    │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Multi-selection state & checkboxes    │ KEEP & EXT  │ Add Shift-click contiguous range select & Space/X.     │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Sticky Header layout                  │ REFACTOR    │ Keep sticky layout; add sort triggers & column menus.  │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ `j` / `k` vertical keyboard navigation│ KEEP & ENH  │ Upgrade to full WCAG 2.2 AA roving tabindex model.     │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ `Enter` / double-click -> Inspector   │ KEEP        │ Canonical workflow; preserve scroll and row focus.     │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Cycle-on-click badge mutations (`s`,`p`) REPLACE   │ Replace with UI-01C property trigger popovers.         │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ `ActionStrip.jsx` integration         │ REFACTOR    │ Separate generic layout header from dedicated          │
│                                       │             │ `DataGridToolbar` (search, compound filter, density).  │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ `BulkActionBar.jsx` floating dock     │ KEEP & EXT  │ Retain opaque dock; extend with priority, assignment.  │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Sub-item parentId exclusion           │ KEEP        │ Retain clean separation: sub-items render in parent.   │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Full in-memory rendering              │ REFACTOR    │ Establish virtualization boundary for large sets.      │
└───────────────────────────────────────┴─────────────┴────────────────────────────────────────────────────────┘
```

---

## 4. Grid Product Contract & State Architecture

The Data Grid state is strictly partitioned into **three orthogonal state spaces** to prevent re-render cascades and state coupling:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               DATA GRID STATE PARTITIONING                              │
├───────────────────────────────┬───────────────────────────────┬─────────────────────────┤
│ 1. DATA STATE                 │ 2. PRESENTATION STATE         │ 3. SELECTION STATE      │
│ (Domain & Server-Synchronized)│ (Local UI & View Projection)  │ (Transient Interaction) │
├───────────────────────────────┼───────────────────────────────┼─────────────────────────┤
│ • `items: WorkItem[]`         │ • `columnOrder: ColumnId[]`   │ • `focusedRowId: ID`    │
│ • `totalCount: number`        │ • `columnWidths: Map<Id, px>` │ • `selectedId: ID`      │
│ • `filterExpression: FilterGrp│ • `hiddenColumns: Set<Id>`    │ • `multiSelectedIds: Set│
│ • `sort: { field, direction }`│ • `density: 'compact'|'comf'` │ • `selectionAnchorId: ID│
│ • `cursor: string | null`     │ • `groupBy: FieldId | null`   │ • `activeCellCoord: {r,c│
│ • `isLoading: boolean`        │ • `expandedGroups: Set<string>│                         │
│ • `isFetchingMore: boolean`   │ • `activePopover: PopoverId`  │                         │
│ • `mutationQueue: Optimistic[]│ • `scrollAnchorIndex: number` │                         │
└───────────────────────────────┴───────────────────────────────┴─────────────────────────┘
```

### Component Input Contract (`DataGridProps`)

```typescript
interface DataGridProps {
  // 1. Data Contract
  items: WorkItem[];
  totalCount: number;
  isLoading?: boolean;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;

  // 2. Query / Projection Controls
  sort: SortCriteria;
  onSortChange: (sort: SortCriteria) => void;
  filterExpression: FilterGroup;
  onFilterChange: (filters: FilterGroup) => void;
  groupBy?: GroupField | null;
  onGroupByChange?: (field: GroupField | null) => void;

  // 3. Presentation State
  density?: "compact" | "comfortable";
  onDensityChange?: (density: "compact" | "comfortable") => void;
  columnConfig?: ColumnConfigMap;
  onColumnConfigChange?: (config: ColumnConfigMap) => void;

  // 4. Selection & Focus
  selectedItemId?: string | null;
  onSelectItem?: (item: WorkItem) => void;
  multiSelectedIds?: string[];
  onMultiSelectChange?: (selectedIds: string[]) => void;
  onOpenInspector?: (item: WorkItem) => void;

  // 5. Authoritative Domain Mutations
  onUpdateItem?: (id: string, patch: Partial<WorkItem>) => Promise<void>;
  onBulkUpdate?: (
    ids: string[],
    patch: Partial<WorkItem>,
  ) => Promise<BulkMutationResult>;
  onDeleteItem?: (id: string) => Promise<void>;
  onBulkDelete?: (ids: string[]) => Promise<BulkMutationResult>;

  // 6. Permissions & Context
  isReadOnly?: boolean;
  workspacePermissions?: WorkspacePermissions;
}
```

---

## 5. Three Distinct Row States

To prevent user confusion, the visual design and DOM attributes strictly distinguish three separate row states:

```text
┌───────────────────────┬───────────────────────────────┬──────────────────────────────────────────┐
│ Row State             │ Functional Meaning            │ Visual Treatment                         │
├───────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ **1. Focused Row**    │ Active keyboard cursor        │ 1px visible focus ring / outline         │
│                       │ (`tabIndex={0}`)              │ (`var(--border-focus, #3b82f6)`).        │
├───────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ **2. Inspector Active │ WorkItem currently loaded in  │ Solid highlight background               │
│    / Selected**       │ the open Inspector drawer     │ (`var(--bg-surface-selected)`).          │
├───────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ **3. Multi-Selected** │ WorkItem checked for bulk     │ Blue checkbox mark with subtle active    │
│                       │ action operations             │ background tint (`var(--bg-surface-active│
└───────────────────────┴───────────────────────────────┴──────────────────────────────────────────┘
```

### State Combinations

- **Focused + Inspector Active:** Row has both the selected background highlight AND the active keyboard focus outline.
- **Focused + Multi-Selected:** Checkbox is checked; row displays the active focus outline.
- **Inspector Active + Multi-Selected:** Row displays selected background highlight; checkbox is checked.

---

## 6. Grid Anatomy & Layout Rhythm

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. PROJECTION TOOLBAR (Height: 36px)                                                        │
│  [Views: Table|Board|Timeline]  [Filter: Status(2)]  [Sort: Due Date ↓]  [Group: None]      │
│  [Search: "auth..."]               [Columns: 9/12]  [Density: 28px]  [Total: 42 WorkItems]  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. STICKY COLUMN HEADER (Height: 28px Compact / 32px Comfortable)                           │
│  [ ] | ID      | P | Title                      | Status     | Est | Assignee   | Due Date  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. GROUP HEADER (Optional, Height: 30px)                                                    │
│  ▼ In Progress (4 items • 18 pts)                                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. WORKITEM ROWS (Height: 28px Compact / 34px Comfortable)                                  │
│  [✓] | ENG-1041| 🔴| Implement Tarjan algorithm...| ⏳In Prog  |  5  | Marcus V.  | Sep 25    │
│  [ ] | ENG-1044| 🟠| Persistent IndexedDB engine...| ⭕ Todo    |  8  | Marcus V.  | Oct 02    │
│  [ ] | WEB-402 | 🟠| Build 28px compact row data...| ⏳In Prog  |  8  | David K.   | Sep 28    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. OPAQUE ELEVATED BULK ACTION BAR (Conditional, floats 16px from viewport bottom)          │
│  [3 items selected]  │  [Change Status]  [Assign To]  [Add Tags]  [Archive]  [✕ Clear]      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Density System & Predictable Geometry

Density is driven by tokens and design targets:

```text
┌────────────────────────┬──────────────────────┬──────────────────────┐
│ Attribute              │ Compact (Default)    │ Comfortable          │
├────────────────────────┼──────────────────────┼──────────────────────┤
│ Target Row Height      │ 28px                 │ 34px                 │
│ Header Height          │ 28px                 │ 32px                 │
│ Horizontal Cell Pad    │ 8px                  │ 12px                 │
│ Vertical Cell Pad      │ 0px (Centered flex)  │ 0px (Centered flex)  │
│ Typography: Data Text  │ 12px (text-xs)       │ 13px                 │
│ Typography: Monospace  │ 11px (font-mono)     │ 12px (font-mono)     │
│ Badge Scale            │ 18px compact badge   │ 22px regular badge   │
│ Avatar Scale           │ 16px (micro)         │ 20px (xs)            │
│ Checkbox Scale         │ 14px                 │ 16px                 │
│ Primary Target User    │ Engineers, Power Ops │ PMs, Broad Review    │
└────────────────────────┴──────────────────────┴──────────────────────┘
```

_Geometric Invariant:_ WorkItem rows use predictable density tokens. Implementations should preserve stable row geometry wherever practical to support efficient rendering, keyboard navigation, and optional windowing.

---

## 8. Column Architecture & Reusable Column Registry

Columns are schema-driven configurations:

```text
┌──────────────┬──────────────────┬───────┬──────┬─────────┬─────────┬──────────┬──────────────┐
│ Column ID    │ Domain Accessor  │ Width │ Min  │ Pinned  │ Sortable│ Editable │ Alignment    │
├──────────────┼──────────────────┼───────┼──────┼─────────┼─────────┼──────────┼──────────────┤
│ `select`     │ (row selection)  │ 32px  │ 32px │ Left    │ No      │ Direct   │ Center       │
│ `identifier` │ item.identifier  │ 85px  │ 70px │ Left    │ Asc/Desc│ ReadOnly │ Left (Mono)  │
│ `type`       │ item.type        │ 32px  │ 32px │ No      │ Asc/Desc│ Trigger  │ Center       │
│ `priority`   │ item.priority    │ 36px  │ 36px │ No      │ Value   │ Trigger  │ Center       │
│ `title`      │ item.title       │ 1fr   │ 200px│ No      │ Alpha   │ Hybrid   │ Left         │
│ `status`     │ item.status      │ 115px │ 95px │ No      │ Category│ Trigger  │ Left         │
│ `estimate`   │ item.estimate    │ 60px  │ 45px │ No      │ Number  │ Inline   │ Right (Mono) │
│ `assignee`   │ item.assigneeId  │ 130px │ 100px│ No      │ Alpha   │ Trigger  │ Left         │
│ `project`    │ item.projectId   │ 120px │ 90px │ No      │ Alpha   │ Trigger  │ Left         │
│ `cycle`      │ item.cycleId     │ 100px │ 80px │ No      │ Alpha   │ Trigger  │ Left         │
│ `dueDate`    │ item.dueDate     │ 85px  │ 75px │ No      │ Date    │ Trigger  │ Right (Mono) │
│ `relations`  │ item.relations   │ 80px  │ 60px │ No      │ Count   │ ViewOnly │ Left         │
│ `spec`       │ item.documentLink│ 60px  │ 50px │ No      │ Boolean │ ViewOnly │ Center       │
│ `createdAt`  │ item.createdAt   │ 90px  │ 75px │ No      │ Date    │ ReadOnly │ Right (Mono) │
│ `updatedAt`  │ item.updatedAt   │ 90px  │ 75px │ No      │ Date    │ ReadOnly │ Right (Mono) │
└──────────────┴──────────────────┴───────┴──────┴─────────┴─────────┴──────────┴──────────────┘
```

### Initial Pinning Rules

- **Default Pinned Columns:** `select` and `identifier` are pinned left by default.
- `title` may remain sticky only if horizontal-scroll usability warrants it on specific viewports.
- `status` is **not** pinned by default.

---

## 9. Inline Editing Contract & Property Triggers

The repository audit strictly forbade prototype cycle-on-click mutations. In UI-01B, editing behavior is explicitly defined:

```text
┌────────────────────┬─────────────────────────┬──────────────────────────────────────────┐
│ Property           │ Inline Editing Contract │ Visual Trigger Affordance                │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────┤
│ **Status**         │ Property Trigger Menu   │ Clicking Status badge opens lightweight  │
│                    │                         │ option list; commits explicit selection. │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────┤
│ **Priority**       │ Property Trigger Menu   │ Clicking Priority icon opens 5-level     │
│                    │                         │ menu (Urgent, High, Med, Low, None).     │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────┤
│ **Assignee**       │ User Dropdown Trigger   │ Clicking Avatar opens member menu        │
│                    │                         │ with search & "Unassigned" option.       │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────┤
│ **Estimate**       │ Direct Numeric Input    │ Click or focus + type replaces number;   │
│                    │                         │ Enter commits, Esc cancels.              │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────┤
│ **Due Date**       │ Date Popover Trigger    │ Clicking date pill opens calendar picker;│
│                    │                         │ Clear date option available.             │
├────────────────────┼─────────────────────────┼──────────────────────────────────────────┤
│ **Title**          │ **HYBRID DECISION**     │ • Single click selects row.              │
│                    │                         │ • Enter / double-click opens Inspector.  │
│                    │                         │ • F2 activates inline text rename        │
│                    │                         │   ('e' provisional pending conflict QA). │
└────────────────────┴─────────────────────────┴──────────────────────────────────────────┘
```

### Approved Hybrid Title Editing Model

- **Primary Single-Pointer Action:** Single-click selects the row without activating input focus.
- **Authoritative Detail:** `Enter` or double-click opens the frozen UI-01A Inspector drawer. (Double-click is strictly a pointer accelerator; keyboard and button alternatives always exist).
- **In-Place Fast Rename:** Pressing `F2` (primary convention) activates in-place title editing. `Enter` commits the mutation; `Escape` reverts. `e` remains a provisional keyboard shortcut candidate subject to shortcut conflict testing.

---

## 10. Row $\rightarrow$ Inspector Interaction & Responsive Drawer Contract

Opening the Inspector drawer must **never destroy grid context**:

```text
User on Row 342
      │
      ▼  (Press Enter or Double-Click)
Grid captures:
  - activeRowIndex: 342
  - focusedElement: Row DOM Node
  - scrollOffset: 8,420px
      │
      ▼
WorkItemInspector Opens (Right Drawer)
  - Preferred Desktop Range: 400px – 480px (Implementation tunable)
  - Minimum Usable Width: 360px
  - Expanded Detail Mode: 640px – 800px (or up to 60% viewport width)
  - Mobile (<768px): Full-screen modal overlay
  - Row 342 remains visually highlighted (`--bg-surface-selected`)
      │
      ▼  (Press Escape or Click Close 'X')
WorkItemInspector Closes
  - Focus returns immediately to Row 342 DOM node
  - Grid scroll position remains exactly at 8,420px
  - Zero lost scroll, zero jumpy layout shifts
```

---

## 11. Keyboard-First Interaction & Scoped Roving Focus

The grid implements an accessible **Roving TabIndex** focus model:

```text
┌───────────────────────────┬─────────────────────────────────────────────────────────────┐
│ Key Binding               │ Grid Action & Scope Semantics                               │
├───────────────────────────┼─────────────────────────────────────────────────────────────┤
│ `↓` or `j`                │ Move focus to next row. Auto-scrolls into viewport.        │
│ `↑` or `k`                │ Move focus to previous row. Auto-scrolls into viewport.    │
│ `Shift + ↓` / `Shift + ↑` │ Extend multi-selection range from selection anchor.         │
│ `Space` or `x`            │ Toggle checkbox selection of focused row.                   │
│ `Enter`                   │ Open Inspector Drawer for focused WorkItem.                 │
│ `F2`                      │ Activate inline title rename editor on focused row.         │
│ `s`                       │ Open Status property selector dropdown on focused row.      │
│ `p`                       │ Open Priority property selector dropdown on focused row.    │
│ `a`                       │ Open Assignee property selector dropdown on focused row.    │
│ `Cmd/Ctrl + A`            │ Select all visible rows in active grid projection.          │
│ `Escape`                  │ 1. Cancel inline edit $\rightarrow$ 2. Dismiss dropdown     │
│                           │ $\rightarrow$ 3. Clear multi-selection $\rightarrow$ 4. Close Drawer.│
│ `c` (Global)              │ Open Quick Create modal (suppressed inside editable input). │
│ `Cmd/Ctrl + K` (Global)   │ Open Command Palette (always available).                    │
└───────────────────────────┴─────────────────────────────────────────────────────────────┘
```

### Focus Model Distinction:

- **Row-Level Focus (Default):** Navigation between rows occurs at the `role="row"` level using roving `tabIndex` (`tabIndex={0}` on active row only, `tabIndex={-1}` on other rows).
- **Cell-Level Entry:** Pressing `s`, `p`, `a`, or clicking a cell transfers focus into that cell's interactive property trigger or popover.
- **Exit to Row:** Pressing `Escape` or completing a selection returns focus to the parent row container.

---

## 12. Selection Semantics Across Projections & Query Changes

### Default Selection Scope Invariant

> **Bulk selection belongs strictly to the current projection query context.**

```text
┌───────────────────────────────────────┬──────────────────────────────────────────────────────┐
│ Trigger Event                         │ Multi-Selection Behavior                             │
├───────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ **Filter Change**                     │ CLEAR selection automatically. Closes BulkActionBar. │
│ **Saved View Switch**                 │ CLEAR selection automatically. Closes BulkActionBar. │
│ **Team / Project Context Change**     │ CLEAR selection automatically. Closes BulkActionBar. │
│ **Sort Reordering**                   │ PRESERVE selection (same result set, reordered).     │
│ **Group Collapse / Expand**           │ PRESERVE selection. Hidden items remain selected.    │
│ **Pagination / Incremental Fetch**    │ PRESERVE existing selection across loaded pages.     │
│ **Item Deletion**                     │ REMOVE deleted ID from selection set.                │
│ **Permission Revoked on Item**        │ PRESERVE in selection; handle at bulk mutation.      │
└───────────────────────────────────────┴──────────────────────────────────────────────────────┘
```

### Elimination of Ambiguous `isAllSelected`

- The system supports selection of **visible / loaded rows** only (`multiSelectedIds: string[]`).
- The grid header checkbox reflects:
  - Unchecked: `multiSelectedIds.length === 0`.
  - Indeterminate: `0 < multiSelectedIds.length < visibleItems.length`.
  - Checked: `multiSelectedIds.length === visibleItems.length`.
- Cross-database "Select all 50,000 items matching query" is deferred to later server-query selection phases.

---

## 13. Bulk Operations & BulkActionBar Integration

When `multiSelectedIds.length > 0`, the **opaque elevated BulkActionBar** mounts at the bottom center:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  [3 items selected]  │  [Change Status]  [Assign To]  [Add Tags]  [Archive]  [✕ Clear]      │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Bulk Mutation UX Contract

- Calls `onBulkUpdate(ids, patch)`.
- **Outcome Reporting:** Bulk mutation returns a normalized result: `{ succeeded: string[], skipped: string[], failed: string[] }`.
- **Partial Permission Outcome:**
  - Permitted items commit immediately.
  - Restricted items are skipped without failing the entire batch.
  - Non-blocking notification informs user: `"Updated 2 items. ENG-1042 was skipped due to restricted permissions."`
  - Successful items remain updated; selection clears upon batch completion.

---

## 14. Forward-Compatible Filter Architecture

To avoid contradictions between flat mock objects and enterprise requirements, the grid consumes a **FilterGroup** expression model:

```typescript
type FilterOperator = "eq" | "neq" | "in" | "nin" | "contains" | "gt" | "lt";

interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

interface FilterGroup {
  operator: "AND" | "OR";
  conditions: Array<FilterCondition | FilterGroup>;
}
```

- Simple flat filter objects used by prototype views are adapted into a root `AND` group.
- **Mutation + Filter Transition:** When an item is edited such that it no longer matches active filters:
  1. The canonical WorkItem mutates immediately in the domain cache.
  2. The projection flags the row as `"Modified"` and retains it temporarily in-place while focused.
  3. Once focus transitions away or the user refreshes, the item cleanly leaves the projection without creating a duplicate cache.

---

## 15. Sorting Contract

1. **Deterministic Ordering:** Pipeline sorts by active column criteria (Ascending $\uparrow$ / Descending $\downarrow$).
2. **Stable Tie-Breaking:** All client projections enforce a secondary tie-breaker (`id: asc`).
3. **Cursor-Compatible:** Sort attributes map to indexed domain fields (`updatedAt`, `priority`, `dueDate`, `identifier`). The UI does not dictate database indexing internals.

---

## 16. Grouping Architecture

Supported grouping dimensions: `status`, `priority`, `assignee`, `project`, `cycle`.

### UX Contract:

- **Group Headers:** Display group title, item count, and point sum.
- **Collapse/Expand:** Toggleable via chevron or keyboard `Space`/`Enter` on header. Collapsed group state is preserved in local presentation state (`expandedGroups: Set<string>`).
- **Keyboard Traversal:** `j`/`k` skips children of collapsed groups.
- **Mutation Relocation:** Mutating an item's grouping property (e.g. changing Status from Todo to Done) immediately relocates the row to the target group container and updates summary counters.
- _Drag-between-groups interaction is deferred to a future interaction pass._

---

## 17. Column Management & Persistence Boundaries

1. **Resizing:** Interactive drag dividers between header cells with visual guides (min width: 40px; max: 600px).
2. **Visibility & Reordering:** Configurable via "Columns" popover on the projection toolbar.
3. **Persistence Hierarchy:**
   - **Session / Local Presentation:** Transient adjustments (reset on page reload).
   - **Saved View:** Persisted view definitions stored in workspace settings upon clicking "Save View".
   - **User Preference:** Personal ergonomics (e.g. default density) stored in user profile. Column adjustments are **not** automatically written to Workspace-level configuration.

---

## 18. Large Datasets & Virtualization Contract

### Performance Invariants

- **Adaptive Activation:** The Data Grid architecture must support windowed/virtualized rendering when dataset size, rendered complexity, device capability, or measured performance warrants it.
- **Profiling-Driven Threshold:** Implementation may determine the initial activation threshold through profiling rather than an arbitrary hardcoded constant.
- **Predictable Geometry:** WorkItem rows use stable density tokens ($28\text{px}$ compact, $34\text{px}$ comfortable) to enable $O(1)$ offset calculation when virtualization is active.
- **Incremental Prefetching:** The grid architecture supports proactive incremental fetching and configurable overscan to prevent blank loading gaps during fast keyboard or wheel scrolling.

---

## 19. Optimistic Mutation & Error Handling

- **Immediate Perceived Feedback:** Row updates instantly reflect in the UI upon action.
- **Non-Blocking Dispatch:** Changes dispatch asynchronously to the domain mutation boundary.
- **Rollback on Error:** If the server rejects a mutation, the cell flashes a subtle warning border, reverts to the previous canonical value, and raises an accessible toast notification. The grid's vertical scroll position and row focus remain stable.

---

## 20. Required States Matrix

```text
┌───────────────────────────┬──────────────────────────────────────────────────────────────────┐
│ State                     │ UX Presentation & Visual Indicator                              │
├───────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 1. Default Populated      │ High-density grid rows, alternating hover, active focus ring.   │
│ 2. Empty Workspace        │ Graphic container: "No work items yet. Press 'C' to create."     │
│ 3. No Filter Results      │ Centered message: "No items match current filters. [Reset]"     │
│ 4. Initial Loading        │ Skeleton rows with pulsating bone rects matching 28px rhythm.    │
│ 5. Incremental Loading    │ Micro-spinner in bottom status strip while scrolling.           │
│ 6. Query Error            │ Tombstone error banner with retry button.                        │
│ 7. Stale / Reconnecting   │ Muted yellow banner: "Reconnecting... Showing cached snapshot." │
│ 8. Read-Only Item         │ Padlock icon; cell hover shows no edit trigger chevrons.        │
│ 9. Partially Restricted   │ Relation cells show zero-leakage "Restricted" badges.            │
│ 10. Bulk Selection Active │ Floating opaque `BulkActionBar` displaying selected count.       │
│ 11. Active Inline Edit    │ Cell highlights with primary focus ring and active text cursor.  │
│ 12. Optimistic Mutation   │ Row updates instantly; subtle indicator until server confirms.   │
│ 13. Failed Mutation       │ Flash red border $\rightarrow$ rollback to previous value.       │
│ 14. Grouped View          │ Section headers with caret, title, item counter, and point sum.  │
│ 15. Collapsed Group       │ Single header row with collapsed caret and summary metrics.      │
└───────────────────────────┴──────────────────────────────────────────────────────────────────┘
```

---

## 21. Accessibility (WCAG 2.2 AA)

1. **Semantic HTML & ARIA:**
   - Container: `role="grid"` with `aria-rowcount={totalCount}` and `aria-colcount={columns.length}`.
   - Headers: `role="columnheader"` with `aria-sort="ascending" | "descending" | "none"`.
   - Rows: `role="row"` with `aria-rowindex={index + 1}`.
   - Cells: `role="gridcell"`.
2. **Keyboard Roving TabIndex:**
   - Focus is managed at the row level (`tabIndex={0}` on focused row only).
   - Screen-reader users navigate with arrow keys without tabbing through every single cell.
3. **Live Announcements:**
   - Filter resets and sort changes announce results via an `aria-live="polite"` region.

---

## 22. Responsive Adaptation

Desktop is Orynqo's primary dense execution environment:

```text
┌───────────────────────────┬──────────────────────────────────────────────────────────────────┐
│ Viewport Tier             │ Layout & Projection Adaptation                                   │
├───────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ **Wide Desktop (>1280px)**│ Full data grid with all configured columns visible.              │
│ **Compact Desktop/Tablet**│ Primary columns (`select`, `id`, `title`, `status`, `assignee`)  │
│ **(768px – 1279px)**      │ remain fixed; secondary columns scroll horizontally via sticky. │
│ **Mobile Client (<768px)**│ Grid automatically projects as a **Compact WorkItem List**:      │
│                           │ Scannable list (ID, title, status, priority). Tapping opens      │
│                           │ full-screen canonical `WorkItemDetailContainer`. No tiny tables. │
└───────────────────────────┴──────────────────────────────────────────────────────────────────┘
```

---

## 23. Modular Component Architecture

The implementation will structure `src/views/DataGrid/` into clean, single-responsibility modules:

```text
src/views/DataGrid/
├── DataGrid.jsx                # Universal grid orchestrator & layout wrapper
├── DataGridToolbar.jsx         # Compact projection toolbar (filters, sort, group, cols)
├── DataGridHeader.jsx          # Sticky header container
├── DataGridHeaderCell.jsx      # Sortable, resizable header cell with menu trigger
├── DataGridBody.jsx            # Body container supporting standard & virtualized modes
├── DataGridRow.jsx             # High-density row component
├── DataGridCell.jsx            # Polymorphic cell renderer (badges, mono text, avatars)
├── DataGridGroupHeader.jsx     # Collapsible section header for grouped projections
├── DataGridColumnManager.jsx   # Column visibility & reorder popover
├── columnRegistry.js           # Authoritative column registry & definitions
├── useGridKeyboard.js          # Roving tabindex and grid keyboard navigation hook
├── useGridSelection.js         # Multi-selection, range select, and bulk action hook
└── useGridVirtualizer.js       # Windowing buffer calculator (activated when warranted)
```

_Architectural Invariant:_ The row/cell architecture must support granular rendering and avoid whole-grid re-renders for isolated WorkItem changes.

---

## 24. Design Validation Scenarios

### Scenario 1: Open WorkItem $\rightarrow$ Edit in Inspector $\rightarrow$ Close

- **Flow:** User selects row 42 (`ENG-1044`) and presses `Enter`.
- **Result:** Frozen UI-01A Inspector drawer opens. User changes status to `in_review`. Upon pressing `Escape`, Inspector closes; grid scroll position remains pinned at row 42, focus is restored to row 42, and status reflects `in_review`.

### Scenario 2: Keyboard Traversal of 20+ Rows $\rightarrow$ Open $\rightarrow$ Close

- **Flow:** User presses `j` 25 times to navigate from row 1 to row 26, then presses `Enter`.
- **Result:** Viewport smoothly auto-scrolls. Inspector opens for row 26. When closed, focus returns to row 26 without scrolling back to row 1.

### Scenario 3: Filter + Sort $\rightarrow$ Mutation Disqualifies Item

- **Flow:** Grid filtered to `status: 'todo'`. User uses inline status trigger on row 3 to change status to `done`.
- **Result:** Item transitions visually to `done`, remains in place with an inline `"Modified"` indicator while focused, and gracefully leaves the view once focus moves away, preventing layout shifts under the cursor.

### Scenario 4: Multi-Selection $\rightarrow$ Bulk Status Change with Partial Permission Failure

- **Flow:** User selects 3 items (2 editable, 1 read-only) and clicks "Change Status" in `BulkActionBar`.
- **Result:** The 2 editable items update to `done`. The read-only item is skipped. A non-blocking toast informs user that 1 item was skipped due to permissions.

### Scenario 5: Column Customization Persistence

- **Flow:** User hides "Due Date" and widens "Title" to 400px.
- **Result:** Configuration persists in local presentation state during the session and attaches to the Saved View when saved.

### Scenario 6: Group Transition

- **Flow:** Grid grouped by `status`. User changes item from `Todo` to `In Progress`.
- **Result:** Item smoothly relocates from the `Todo` group container to the `In Progress` group container; group header counters update instantly.

### Scenario 7: Large Result Set Incremental Fetching

- **Flow:** User scrolls past item 100 in a 500-item query.
- **Result:** Grid triggers `onLoadMore()`, loads next page, appends to the body, and preserves existing multi-selection without re-sorting or jumping.

### Scenario 8: Inline Edit Rollback on Network Failure

- **Flow:** User changes estimate from 5 to 8 pts. Network fails.
- **Result:** Input flashes subtle warning border; value reverts to 5 pts. Focus is preserved.

### Scenario 9: Read-Only WorkItem in Grid

- **Flow:** A SOC2-locked work item appears in the list.
- **Result:** Renders padlock icon, muted text, disabled triggers. Double-clicking still opens the read-only Inspector archive.

### Scenario 10: Mobile Responsive Projection

- **Flow:** Viewport resizes to 390px (mobile).
- **Result:** Grid transforms into compact WorkItem list projection. Tapping opens full-screen `WorkItemDetailContainer`.

### Scenario 11: Projection Query Changes During Bulk Selection

- **Flow:** User selects multiple WorkItems and changes an active filter or switches saved views.
- **Result:** Bulk selection automatically clears, `BulkActionBar` closes, new query renders, and focus deterministically resets to the first visible row. No invisible selected IDs remain.
