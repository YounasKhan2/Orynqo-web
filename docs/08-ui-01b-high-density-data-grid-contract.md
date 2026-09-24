# ORYNQO — UI-01B PRODUCT CONTRACT & DESIGN SPECIFICATION
## Universal High-Density Data Grid / Work Execution Projection

```text
Document Reference: docs/08-ui-01b-high-density-data-grid-contract.md
Phase: UI-01B (Design & Product Contract)
Status: IN HUMAN REVIEW
Target Surface: Universal Data Grid / Table Projection (WRK-001)
Upstream Dependencies:
  - docs/04-ia-competitive-navigation-research.md (FROZEN)
  - docs/05-sidebar-navigation-contract.md (FROZEN)
  - docs/06-complete-page-and-surface-registry.md (FROZEN)
  - docs/07-ui-01a-work-item-inspector-contract.md (FROZEN - Commit af9178a)
Governing Skill: antigravity-enterprise-product-design
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
│  │                CANONICAL WORKITEM QUERY PIPELINE (Filter & Sort)      │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │              UNIVERSAL HIGH-DENSITY DATA GRID ENGINE (UI-01B)         │  │
│  │  • 28px/34px Density    • Roving TabIndex Keyboard Navigation         │  │
│  │  • Multi-Column Sort    • Hierarchical Grouping (Status/Priority/Team)│  │
│  │  • Column Registry      • Multi-Row Selection & Bulk Action Bar       │  │
│  │  • Context Preservation • Inline Property Edit Triggers (UI-01C Rdy)  │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │               CANONICAL WORKITEM INSPECTOR DRAWER (UI-01A)            │  │
│  │              (Preserves Grid Focus, Row Position, & Scroll)           │  │
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
   - **No grid-specific WorkItem types:** Milestones remain checkpoint resources; Documents remain knowledge resources.
   - **No parallel item models:** Relationships (`relations`), living specs (`documentLinks`), and sub-items (`parentId`) are read from the canonical entity.
   - **No independent row state:** Cell edits dispatch mutations directly to the authoritative domain mutation boundary.
3. **Dependency Direction:**
   $$\text{Design System Tokens} \rightarrow \text{Primitives} \rightarrow \text{Composites} \rightarrow \text{Domain Features} \rightarrow \text{Projections / Views} \rightarrow \text{Shell}$$

---

## 3. Existing Grid Audit

The codebase prototype contained an initial `DataGrid.jsx` (`src/views/DataGrid/DataGrid.jsx`). Below is the structured architectural audit:

```text
┌───────────────────────────────────────┬─────────────┬────────────────────────────────────────────────────────┐
│ Prototype Component / Subsystem       │ Disposition │ Architectural Rationale & Transition Plan              │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Monolithic `DataGrid.jsx` (370 lines) │ REPLACE     │ Split into modular `DataGridToolbar`, `DataGridHeader`,│
│                                       │             │ `DataGridBody`, `DataGridRow`, and `DataGridCell`.     │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Hardcoded CSS Grid template string    │ REPLACE     │ Grid columns (`32px 90px 100px 1fr ...`) must be       │
│                                       │             │ governed by a configurable `ColumnRegistry`.           │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Inline styles on table rows           │ REFACTOR    │ Standardize to semantic CSS variables and design tokens│
│                                       │             │ (`--space-*`, `--radius-*`, `--color-*`).              │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Multi-selection state & checkboxes    │ KEEP &      │ Preserve `multiSelectedIds` array; add Shift-click     │
│                                       │ EXTEND      │ contiguous range selection and Space/X shortcuts.      │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Sticky Header layout                  │ REFACTOR    │ Keep sticky behavior; add sort triggers, resize afford-│
│                                       │             │ ances, and column menu popovers.                       │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ `j` / `k` row navigation              │ KEEP &      │ Preserve fast vertical keyboard movement; upgrade to   │
│                                       │ ENHANCE     │ true WCAG roving `tabIndex` focus model.               │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ `Enter` / double-click $\rightarrow$ Inspector│ KEEP        │ Canonical workflow; preserve grid scroll & focus anchor│
│                                       │             │ upon closing Inspector drawer.                         │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Cycle-on-click badge mutations (`s`,`p`) REPLACE   │ Replace with UI-01C property trigger popovers;         │
│                                       │             │ eliminate unpredictable cycling interactions.          │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ `ActionStrip.jsx` integration         │ REFACTOR    │ Separate generic layout header from dedicated          │
│                                       │             │ `DataGridToolbar` (search, compound filter, density).  │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ `BulkActionBar.jsx` floating drawer   │ KEEP &      │ Floating bottom bar is clean and functional; extend to │
│                                       │ EXTEND      │ support priority, assignment, and cycle moves.         │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Sub-item parentId exclusion           │ KEEP        │ `useWorkItemsFilter` correctly excludes child items    │
│                                       │             │ from root grid rows, preserving hierarchy clarity.     │
├───────────────────────────────────────┼─────────────┼────────────────────────────────────────────────────────┤
│ Full in-memory rendering              │ REFACTOR    │ Add explicit virtualization boundary & cursor-based    │
│                                       │             │ pagination contract for enterprise scalability.        │
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
│ • `filters: CompoundFilter`   │ • `hiddenColumns: Set<Id>`    │ • `multiSelectedIds: Set│
│ • `sort: { field, direction }`│ • `density: 'compact'|'comf'` │ • `selectionAnchorId: ID│
│ • `cursor: string | null`     │ • `groupBy: FieldId | null`   │ • `activeCellCoord: {r,c│
│ • `isLoading: boolean`        │ • `expandedGroups: Set<string>│ • `isAllSelected: bool` │
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
  filters: FilterExpression;
  onFilterChange: (filters: FilterExpression) => void;
  groupBy?: GroupField | null;
  onGroupByChange?: (field: GroupField | null) => void;

  // 3. Presentation State
  density?: 'compact' | 'comfortable';
  onDensityChange?: (density: 'compact' | 'comfortable') => void;
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
  onBulkUpdate?: (ids: string[], patch: Partial<WorkItem>) => Promise<void>;
  onDeleteItem?: (id: string) => Promise<void>;
  onBulkDelete?: (ids: string[]) => Promise<void>;

  // 6. Permissions & Context
  isReadOnly?: boolean;
  workspacePermissions?: WorkspacePermissions;
}
```

---

## 5. Grid Anatomy & Layout Rhythm

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. PROJECTION TOOLBAR (Height: 36px)                                                        │
│  [Views: Table|Board|Timeline]  [Filter: Status(2), Assignee]  [Sort: Due Date ↓]  [Group]  │
│  [Search: "auth..."]               [Columns: 9/12]  [Density: 28px]  [Total: 42 WorkItems]  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. STICKY COLUMN HEADER (Height: 28px)                                                      │
│  [ ] | ID      | P | Title                      | Status     | Est | Assignee   | Due Date  │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. GROUP HEADER (Optional, Height: 32px)                                                    │
│  ▼ In Progress (4 items • 18 pts)                                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. WORKITEM ROWS (Height: 28px Compact / 34px Comfortable)                                  │
│  [✓] | ENG-1041| 🔴| Implement Tarjan algorithm...| ⏳In Prog  |  5  | Marcus V.  | Sep 25    │
│  [ ] | ENG-1044| 🟠| Persistent IndexedDB engine...| ⭕ Todo    |  8  | Marcus V.  | Oct 02    │
│  [ ] | WEB-402 | 🟠| Build 28px compact row data...| ⏳In Prog  |  8  | David K.   | Sep 28    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. FLOATING BULK ACTION BAR (Conditional, floats 16px from viewport bottom)                 │
│  [3 items selected]  |  [Mark Done]  [Change Priority]  [Move Cycle]  [Delete]  [X Clear]   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Density System & Token Foundation

High density is a core Orynqo differentiator. The grid implements an absolute mathematical 4px rhythm:

```text
┌────────────────────────┬──────────────────────┬──────────────────────┐
│ Attribute              │ Compact (Default)    │ Comfortable          │
├────────────────────────┼──────────────────────┼──────────────────────┤
│ Row Height             │ 28px                 │ 34px                 │
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

---

## 7. Column Architecture & Reusable Column Registry

Every column is declared as an extensible, schema-driven configuration entry:

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

### Column Classification
- **Fixed / Core Columns (Always Present):** `select`, `identifier`, `title`, `status`.
- **Standard Default Columns:** `priority`, `estimate`, `assignee`, `dueDate`.
- **Contextual Columns:** `project` (hidden when inside a project view), `cycle` (hidden when inside a cycle view), `relations` (shown when dependencies exist).
- **Optional / Extensible Columns:** `spec`, `createdAt`, `updatedAt`, `labels`, `customFields`.

---

## 8. Inline Editing Contract & Property Triggers

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
│                    │ (Detailed Below)        │ • Double click or Enter opens Inspector. │
│                    │                         │ • F2 or explicit rename button activates │
│                    │                         │   compact inline text edit.              │
└────────────────────┴─────────────────────────┴──────────────────────────────────────────┘
```

### Decision: Hybrid Title Editing
*Rationale:* Software engineers and managers scanning 50 rows must be able to click anywhere on a row or title to select/inspect without accidentally activating an inline text input. Therefore:
- **Default Action:** Single-click selects the row; double-click or `Enter` opens the Inspector drawer where the full multiline title editor resides.
- **Fast Keyboard Rename:** Pressing `F2` or `e` while a row is focused activates inline title editing in-place without opening the drawer. `Enter` commits the mutation, `Escape` reverts.

---

## 9. Row $\rightarrow$ Inspector Interaction & Focus Anchor Preservation

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
WorkItemInspector Opens (Right Drawer 440px / 720px)
  - Grid width contracts smoothly via CSS transition
  - Row 342 remains visually highlighted (`--bg-surface-selected`)
  - User mutates status / description / adds comments in Inspector
      │
      ▼  (Press Escape or Click Close 'X')
WorkItemInspector Closes
  - Focus returns immediately to Row 342 DOM node
  - Grid scroll position remains exactly at 8,420px
  - Zero lost scroll, zero jumpy layout shifts
```

---

## 10. Keyboard-First Interaction Contract

The grid implements a **WCAG-compliant Roving TabIndex** interaction model. The grid container has `role="grid"`, rows have `role="row"`, and cells have `role="gridcell"`.

```text
┌───────────────────────────┬─────────────────────────────────────────────────────────────┐
│ Key Binding               │ Grid Action & Scope Semantics                               │
├───────────────────────────┼─────────────────────────────────────────────────────────────┤
│ `↓` or `j`                │ Move focus to next row. Auto-scrolls into viewport.        │
│ `↑` or `k`                │ Move focus to previous row. Auto-scrolls into viewport.    │
│ `Shift + ↓` / `Shift + ↑` │ Extend multi-selection range from selection anchor.         │
│ `Space` or `x`            │ Toggle checkbox selection of focused row.                   │
│ `Enter`                   │ Open Inspector Drawer for focused WorkItem.                 │
│ `F2` or `e`               │ Activate inline title rename editor on focused row.         │
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

---

## 11. Selection Model & Range Algebra

To prevent server-state desynchronization, selection is split into three explicit concepts:

```text
┌───────────────────────┬─────────────────────────────────────────────────────────────────┐
│ Concept               │ Definition & Operational Boundary                               │
├───────────────────────┼─────────────────────────────────────────────────────────────────┤
│ **Focused Row**       │ The row holding the active keyboard cursor (`focusedRowIndex`). │
│                       │ Styled with a subtle focus ring or highlight. Exactly one.      │
├───────────────────────┼─────────────────────────────────────────────────────────────────┤
│ **Selected Item**     │ The primary WorkItem currently loaded in the Inspector drawer   │
│                       │ (`selectedItemId`). Styled with `--bg-surface-selected`.        │
├───────────────────────┼─────────────────────────────────────────────────────────────────┤
│ **Multi-Selected Set**│ An unordered Set of WorkItem IDs (`multiSelectedIds`) checked   │
│                       │ for batch operations. Triggers floating `BulkActionBar`.       │
└───────────────────────┴─────────────────────────────────────────────────────────────────┘
```

### Contiguous Range Selection Algorithm:
When `Shift + Click` or `Shift + ArrowDown` is triggered:
1. Identify `selectionAnchorId` (the initial clicked/selected row).
2. Compute index range $[ \min(\text{anchor}, \text{current}), \max(\text{anchor}, \text{current}) ]$.
3. Populate `multiSelectedIds` with all visible row IDs within that range.
4. If filters or sorting change, existing `multiSelectedIds` remain active until cleared, but the header checkbox reflects indeterminate state.

---

## 12. Bulk Operations & BulkActionBar Integration

When `multiSelectedIds.length > 0`, the floating `BulkActionBar` mounts at the bottom center:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  [3 items selected]  │  [Mark Done]  [Priority ▼]  [Assignee ▼]  [Cycle ▼]  [Delete]  [✕]│
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Bulk Mutation Boundary
- **Atomic Operations:** Bulk mutations call `onBulkUpdate(ids, patch)`.
- **Zero Forked Logic:** Bulk mutations pass through the same mutation pipeline and permission validation as individual updates.
- **Partial Permission Rejection:** If 3 items are selected and 1 is read-only, the server/domain boundary commits the 2 permitted items and raises a non-blocking toast warning identifying the skipped item (`"Updated 2 items. ENG-1042 was skipped due to restricted permissions."`).

---

## 13. Sorting Architecture

1. **Default Sorting:** Natural pipeline order (e.g. `dueDate: asc` then `priority: desc` then `identifier: asc`).
2. **Deterministic Tie-Breaking:** All client and server sorts enforce a stable secondary tie-breaker (`id: asc`).
3. **Cursor Pagination Safe:** Sorting fields must map to indexed database columns (e.g. `updatedAt`, `priority`, `dueDate`, `identifier`).
4. **Header Interaction:**
   - First click: Sort Ascending ($\uparrow$).
   - Second click: Sort Descending ($\downarrow$).
   - Third click: Reset to Default Sort.

---

## 14. Compound Filter Algebra Integration

The grid consumes the canonical filter algebra from `useWorkItemsFilter`:

```typescript
interface FilterExpression {
  status: 'all' | 'unstarted' | 'started' | 'completed' | string;
  priority: 'all' | 'urgent' | 'high' | 'medium' | 'low';
  assignee: 'all' | 'unassigned' | string;
  project?: 'all' | string;
  cycle?: 'all' | string;
  searchQuery?: string;
  hasBlockersOnly?: boolean;
}
```

- When an item is edited such that it no longer satisfies active filters, it remains visible with an inline "Modified" indicator until focus leaves the row or the user manually refreshes, preventing disruptive row disappearance under the user's cursor.

---

## 15. Grouping Architecture

Grouping partitions the flat query result into ordered, collapsible sections:

```text
▼ In Progress (3 items • 21 pts) ───────────────────────────────────────────────────────────
   [✓] ENG-1041  Implement Tarjan cycle detection...
   [ ] WEB-402   Build 28px compact row data grid...
   [ ] WEB-410   Bi-directional document block embedding...
▶ Todo (5 items • 24 pts) ──────────────────────────────────────────────────────────────────
▶ Done (2 items • 10 pts) ──────────────────────────────────────────────────────────────────
```

### Supported Grouping Fields
1. `groupBy: 'status'` (Workflow progression)
2. `groupBy: 'priority'` (Urgency matrix)
3. `groupBy: 'assignee'` (Capacity balance)
4. `groupBy: 'project'` (Deliverable mapping)
5. `groupBy: 'cycle'` (Sprint boundary)

### Grouping Rules:
- **Collapsed Memory:** Collapsed group IDs are stored in local presentation state (`expandedGroups: Set<string>`).
- **Keyboard Traversal:** When a group is collapsed, `j`/`k` skips the hidden children and navigates directly to the next group header or item.
- **Drag & Drop (Later):** Moving a row between group headers updates the grouping property automatically.

---

## 16. Column Management

Users can customize their working surface:
- **Resizing:** Dragging the border between header cells updates column pixel width with visual guidelines (minimum width: 40px; maximum: 600px).
- **Visibility Toggle:** Projection toolbar $\rightarrow$ "Columns" popover menu with toggles for every optional column.
- **Reordering:** Drag-and-drop column headers.
- **Persistence Boundary:**
  - *Ephemeral:* Transient filter/sort adjustments reset on full page reload.
  - *Saved View:* Stored in workspace configuration when user clicks "Save View".

---

## 17. Large Dataset & Virtualization Boundary

To deliver sub-50ms interaction fidelity without false performance claims:
- **DOM Threshold:** For datasets under 100 items, standard high-density DOM rendering is used (avoids virtualization overhead and focus jumps).
- **Virtualization Activation Boundary:** When `totalItems > 100`, the grid activates windowed rendering:
  - Fixed row height ($28\text{px}$ or $34\text{px}$) allows $O(1)$ calculation of row offsets ($\text{top} = \text{index} \times \text{rowHeight}$).
  - Overscan buffer of 10 rows above and below viewport prevents blank flashing during high-speed wheel or keyboard scrolling.
- **Incremental Cursor Fetching:** When scroll approaches $80\%$ of virtual height, `onLoadMore()` triggers the next cursor chunk.

---

## 18. Optimistic Mutation & Error Handling

```text
User changes Status to 'Done' on Row
                 │
                 ▼
1. OPTIMISTIC UPDATE:
   - Row immediately renders with 'Done' badge and strikethrough title
   - Property trigger closes instantly (<16ms)
   - Mutation pushed to background queue
                 │
                 ├──► SERVER SUCCEEDS:
                 │    - Optimistic flag cleared silently
                 │    - Item confirmed in local cache
                 │
                 └──► SERVER FAILS / REJECTED:
                      - Row automatically reverts to previous status
                      - Toast alert: "Failed to update ENG-1041. Changes reverted."
                      - Grid focus and scroll position remain 100% stable
```

---

## 19. Permission & Zero-Leakage Contract

1. **Read-Only Items:**
   - Display a subtle padlock icon in the identifier cell.
   - Interactive badge clicks are disabled (`cursor: default`).
   - Keyboard edit shortcuts (`s`, `p`, `F2`) are suppressed with an accessible screen-reader announcement.
2. **Restricted Related Items:**
   - In `relations` cell, restricted items display zero-leakage placeholder pills (`Restricted`) without disclosing private keys, titles, or assignees.

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
│ 10. Bulk Selection Active │ Floating bottom `BulkActionBar` displaying selected count.       │
│ 11. Active Inline Edit    │ Cell highlights with primary focus ring and active text cursor.  │
│ 12. Optimistic Mutation   │ Subtle pulse indicator until server confirms.                    │
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
   - Only the currently focused row has `tabIndex={0}`; all other rows have `tabIndex={-1}`.
   - Screen-reader users navigate with arrow keys without tabbing 500 times.
3. **Live Region Announcements:**
   - Sort toggles and filter resets announce updates via an invisible `aria-live="polite"` container.

---

## 22. Responsive Adaptation

Desktop is Orynqo's primary dense execution environment. However, responsive behavior is explicitly specified:

```text
┌───────────────────────────┬──────────────────────────────────────────────────────────────────┐
│ Viewport Tier             │ Layout & Projection Adaptation                                   │
├───────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ **Wide Desktop (>1280px)**│ Full data grid with all configured columns visible.              │
│ **Compact Desktop/Tablet**│ Primary columns (`select`, `id`, `title`, `status`, `assignee`)  │
│ **(768px – 1279px)**      │ remain fixed; secondary columns scroll horizontally via sticky. │
│ **Mobile Client (<768px)**│ Grid automatically projects as a **Compact Work List Card**:     │
│                           │ Tap opens full-screen WorkItemDetailContainer. No tiny tables.   │
└───────────────────────────┴──────────────────────────────────────────────────────────────────┘
```

---

## 23. Modular Component Architecture

The implementation will refactor `src/views/DataGrid/` into clean, single-responsibility modules:

```text
src/views/DataGrid/
├── DataGrid.jsx                # Universal grid orchestrator & layout wrapper
├── DataGridToolbar.jsx         # Compact projection toolbar (filters, sort, group, cols)
├── DataGridHeader.jsx          # Sticky header container
├── DataGridHeaderCell.jsx      # Sortable, resizable header cell with menu trigger
├── DataGridBody.jsx            # Body container supporting standard & virtualized modes
├── DataGridRow.jsx             # High-density row component (memoized)
├── DataGridCell.jsx            # Polymorphic cell renderer (badges, mono text, avatars)
├── DataGridGroupHeader.jsx     # Collapsible section header for grouped projections
├── DataGridColumnManager.jsx   # Column visibility & reorder popover
├── columnRegistry.js           # Authoritative column registry & definitions
├── useGridKeyboard.js          # Roving tabindex and grid keyboard navigation hook
├── useGridSelection.js         # Multi-selection, range select, and bulk action hook
└── useGridVirtualizer.js       # Windowing buffer calculator (activated when rows > 100)
```

---

## 24. Scalability Rules

1. **Granular Row Memoization:** `DataGridRow` must be wrapped in `React.memo` with custom comparator checking `item.updatedAt`, `isSelected`, `isFocused`, and `isMultiSelected`.
2. **No Monolithic Context Subscriptions:** Cells must not subscribe to root `WorkspaceContext`. Data is passed via props or selector hooks.
3. **Fixed Row Height:** Enforce strictly $28\text{px}$ or $34\text{px}$ to guarantee $O(1)$ offset calculation for virtualization.
4. **Stable Query References:** Sorting and filter objects must be memoized to prevent infinite query re-execution.

---

## 25. Design Validation Scenarios

The architecture has been verified against the 10 mandatory validation scenarios:

### Scenario 1: Open WorkItem $\rightarrow$ Edit in Inspector $\rightarrow$ Close
- **Flow:** User selects row 42 (`ENG-1044`) and presses `Enter`.
- **Result:** Inspector drawer opens. User changes status to `in_review`. Upon pressing `Escape`, Inspector closes; grid scroll position remains pinned at row 42, focus is restored to row 42, and status reflects `in_review`.

### Scenario 2: Keyboard Traversal of 20+ Rows $\rightarrow$ Open $\rightarrow$ Close
- **Flow:** User presses `j` 25 times to navigate from row 1 to row 26, then presses `Enter`.
- **Result:** Viewport smoothly auto-scrolls. Inspector opens for row 26. When closed, focus returns to row 26 without scrolling back to row 1.

### Scenario 3: Filter + Sort $\rightarrow$ Mutation Disqualifies Item
- **Flow:** Grid filtered to `status: 'todo'`. User uses inline status trigger on row 3 to change status to `done`.
- **Result:** Item transitions visually to `done`, remains in place with an inline indicator while focused, and gracefully leaves the view once focus moves away, preventing layout shifts under the cursor.

### Scenario 4: Multi-Selection $\rightarrow$ Bulk Status Change with Partial Permission Failure
- **Flow:** User selects 3 items (2 editable, 1 read-only) and clicks "Mark Done" in `BulkActionBar`.
- **Result:** The 2 editable items update to `done`. The read-only item remains unchanged. A non-blocking toast informs the user that 1 item was skipped due to permissions.

### Scenario 5: Column Customization Persistence
- **Flow:** User hides "Due Date" and widens "Title" to 400px.
- **Result:** Configuration persists in local presentation state during the session and attaches to the Saved View when saved.

### Scenario 6: Group Transition
- **Flow:** Grid grouped by `status`. User changes item from `Todo` to `In Progress`.
- **Result:** Item smoothly relocates from the `Todo` group container to the `In Progress` group container; group header counters update instantly.

### Scenario 7: Large Result Set Incremental Fetching
- **Flow:** User scrolls past item 100 in a 500-item query.
- **Result:** Grid triggers `onLoadMore()`, loads items 101–200, appends them to the virtualized body, and preserves existing multi-selection without re-sorting or jumping.

### Scenario 8: Inline Edit Rollback on Network Failure
- **Flow:** User changes estimate from 5 to 8 pts. Network fails.
- **Result:** Input flashes subtle warning border; value reverts to 5 pts. Focus is preserved.

### Scenario 9: Read-Only WorkItem in Grid
- **Flow:** A SOC2-locked work item appears in the list.
- **Result:** Renders padlock icon, muted text, disabled triggers. Double-clicking still opens the read-only Inspector archive.

### Scenario 10: Mobile Responsive Projection
- **Flow:** Viewport resizes to 390px (mobile).
- **Result:** Grid transforms into high-density card-list projection. Tapping opens full-screen `WorkItemDetailContainer`.

---

## 26. Open Decisions for Human Review

1. **Title Editing Default:** Proposed hybrid (Single-click selects row, double-click/Enter opens Inspector, `F2`/`e` activates inline text input). Confirm if direct single-click text editing is preferred by any specific persona.
2. **Column Pinning:** Proposed pinning `select`, `identifier`, and `title` on wide horizontal viewports. Confirm if pinning `status` as well is desired.
3. **Default Density Mode:** Proposed `compact` ($28\text{px}$) as the system default, with `comfortable` ($34\text{px}$) available via toolbar switch.
