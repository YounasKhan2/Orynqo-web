# UI-09A: Saved Views Product & UX Contract

- **Document Version:** `1.0.0`
- **Surface Identifiers:** `VEW-001` (Saved Views Directory / Management Surface), `VEW-002` (Saved View Detail / Execution Surface)
- **Status:** **FROZEN DESIGN SPECIFICATION — READY FOR HUMAN REVIEW**
- **Base Git SHA:** `6e77269b8c5f3a7a8cd7349f70ffe0e8180d6194`
- **Branch:** `design/ui-09a-saved-views-product-ux`
- **Lineage:** `docs/06-complete-page-and-surface-registry.md` $\rightarrow$ `docs/10-ui-02a-application-shell-sidebar-contract.md` $\rightarrow$ `docs/12-ui-03a-my-work-product-ux-contract.md` $\rightarrow$ `docs/14-ui-04a-personal-inbox-product-ux-contract.md` $\rightarrow$ `docs/16-ui-05a-team-hub-product-ux-contract.md` $\rightarrow$ `docs/18-ui-06a-docs-knowledge-product-ux-contract.md` $\rightarrow$ `docs/20-ui-07a-projects-product-ux-contract.md` $\rightarrow$ `docs/22-ui-08a-initiatives-roadmap-product-ux-contract.md` $\rightarrow$ `docs/24-ui-09a-saved-views-product-ux-contract.md`

---

## 1. Executive Summary & Purpose

In enterprise work management platforms, users repeatedly configure compound filters, multi-column sorting, grouping hierarchies, and projection lenses to answer strategic, operational, and tactical questions. Without a first-class view persistence model, users are forced to manually re-filter large datasets, share fragile ad-hoc URL queries, or worse—clone work items into redundant boards, creating fractured data ownership and stale copies.

In Orynqo, a **Saved View** (`SavedView`) is a first-class, workspace-scoped **stored projection definition**. It stores the parameters of a lens over canonical resources—filtering rules, sort criteria, grouping dimensions, visible column preferences, and projection mode—without cloning, containing, or mutating the underlying canonical entities:

$$\text{Saved View} = \text{Stored Projection Definition over Canonical Domain State}$$

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   CANONICAL PERSISTENCE VS PROJECTION                  │
├────────────────────────────────────────────────────────────────────────┤
│  CANONICAL RESOURCES (Authoritative Domain Data)                        │
│  [ WorkItems | Projects | Initiatives ]                                │
│       │                                                                │
│       ▼                                                                │
│  SECURITY & AUTHORIZATION BOUNDARY (Zero-Leakage Enforcement)          │
│  - Workspace Tenancy Isolation                                         │
│  - Restricted Resource Exclusion (Pre-Projection Filtering)            │
│       │                                                                │
│       ▼                                                                │
│  SAVED VIEW ENGINE (Stored Projection Configuration)                   │
│  - Compound Query Definition (AND / OR / NOT Algebra)                  │
│  - Multi-Criteria Sorting Rules                                        │
│  - Grouping Hierarchy Dimension                                        │
│  - Visible Fields & Column Sizing Configuration                        │
│  - Active Projection Lens (Grid | Board | Timeline)                    │
│       │                                                                │
│       ▼                                                                │
│  CANONICAL PROJECTION SURFACES (Reused, Unforked UI Layers)            │
│  [ WRK-001 Grid | WRK-002 Board | WRK-003 Timeline ]                  │
│       │                                                                │
│       ▼                                                                │
│  CANONICAL INSPECTION & MUTATION                                       │
│  [ WRK-005 Inspector ] ──(Delegates)──► Canonical Domain Boundaries    │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1 What a Saved View IS
1. **A Stored Projection Definition:** A lightweight configuration record storing query expressions, sorting criteria, grouping definitions, column visibility, and projection types.
2. **A Reusable Lens Across Contexts:** Can originate from Workspace, Team, Project, or Personal contexts to provide tailored operational visibility.
3. **Strictly Permission-Safe:** Acts strictly after canonical authorization checks. Matches against inaccessible entities are excluded before calculation, rendering, grouping, or counting.
4. **An Unforked Consumer of Existing Projections:** Directly drives the frozen execution core—`WRK-001` (High-Density Grid), `WRK-002` (Kanban Board), and `WRK-003` (Timeline)—without duplicating visual components or mutation logic.
5. **Collaboratively Governed with Explicit Mutation Semantics:** Clearly distinguishes temporary ad-hoc filter exploration from persisted view updates via explicit Save, Revert, and Save As workflows.

### 1.2 What a Saved View IS NOT
1. **NOT a Container or Folder of WorkItems:** A Saved View does not "contain" work items. It has no `workItems[]` array. Removing an item from a view's criteria does not delete or unassign the item; it simply ceases to match the view query.
2. **NOT a Project, Team, or Initiative:** It owns no lifecycle, has no members or delivery milestones, and cannot be assigned work items.
3. **NOT a Data Cache or Historical Snapshot:** A Saved View always queries live canonical state; it is not a point-in-time database snapshot.
4. **NOT an Authorization Bypass:** A user cannot view or discover restricted work items, projects, or initiatives simply because a shared view's query matches them.
5. **NOT an Independent Mutation Boundary:** Editing a work item within a view delegates directly to the canonical WorkItem mutation boundary (`updateWorkItem`).

---

## 2. Competitive Reference Pass & Industry Synthesis

To establish a standard that matches and exceeds modern enterprise products, we conducted an architectural inspection of public patterns across **Linear**, **Jira**, **Asana**, **ClickUp**, **Monday**, and **Notion**:

| Dimension | Observed Competitor Patterns | Orynqo Decision | Rationale & Rejected Patterns |
| :--- | :--- | :--- | :--- |
| **View Definition vs Entity Containment** | **Linear:** Views are pure search filters (`Custom Views`).<br>**Jira:** Filter queries (JQL) save views/boards.<br>**ClickUp/Monday:** Confusing mix where views sometimes act as folders containing tasks. | **Pure Stored Projection Definition:** Views store query parameters; entities are queried dynamically. | *Rejected: Containment model.* Treating views as item containers creates multi-homing bugs, circular hierarchies, and desynchronized records. |
| **Filter Composition & Algebra** | **Linear:** Multi-filter bar with implicit AND and limited OR.<br>**Jira:** JQL provides complete boolean algebra (AND, OR, NOT, nested parentheses).<br>**Notion:** Compound filter groups (Any / All) with nested rules. | **Visual Compound Filter Algebra:** Recursive filter trees supporting `AND`, `OR`, and nested rule groups with field-specific operators. | *Rejected: Flat single-level filter bars.* Enterprise teams require compound logic (e.g., `(Team = Platform OR Team = Infra) AND Status = In Progress`). Text-only JQL rejected for standard UI as non-visual. |
| **View Editing & Dirty State** | **Linear:** Automatically modifies view or prompts save banner.<br>**Asana:** Prompts "Save for everyone" button when view options change.<br>**Monday:** Auto-saves shared board views, leading to accidental team disruptions. | **Explicit Save / Revert / Save As with Visual Dirty Indicator:** Temporary adjustments remain local until explicitly saved or discarded. | *Rejected: Silent auto-save on shared views.* Auto-saving modifies shared organizational definitions without consent, breaking peer workflows. |
| **Personal vs Shared Discovery** | **Linear:** Personal custom views vs Workspace custom views.<br>**Jira:** Filter ownership with private, project, or group sharing.<br>**Asana:** Public to team vs private to creator. | **Three Semantic Scopes:**<br>1. *Personal:* Visible only to owner.<br>2. *Team Context:* Discoverable by authorized team members.<br>3. *Shared Workspace:* Discoverable across workspace. | *Rejected: Binary private/public.* Complex multi-team organizations need squad-scoped views that do not clutter the global workspace directory. |
| **Projection Coupling** | **ClickUp:** Each view type (List, Board, Gantt) is an independent tab with separate settings.<br>**Linear:** Switch view projection between List and Board seamlessly.<br>**Notion:** Switch layout while sharing the underlying database filter. | **Decoupled Projection Lens:** A Saved View stores a preferred projection (`grid`, `board`, `timeline`), but users can switch projection on-the-fly while retaining query state. | *Rejected: Siloed view engines per projection type.* Forces duplicate filter configuration across grid and board views. |
| **Stale Reference Degradation** | **Jira:** JQL fails catastrophically or breaks silently if a custom field or project key is deleted.<br>**Linear:** Gracefully flags missing labels or removed assignees. | **Graceful Visual Degradation:** Deleted/inaccessible entities render as non-broadening `[Unavailable Reference]` tokens. | *Rejected: Silent broadening.* Never reinterpret `Project = Apollo` as `All Projects` when Apollo is deleted or restricted. |
| **Access Control & Concurrency** | **Linear:** Workspace members can edit workspace views.<br>**Jira:** Granular edit permissions on shared filters.<br>**Monday:** Board owners vs board viewers. | **Capability-Driven Management + Optimistic Concurrency:** Versioned revisions (`N -> N+1`) block concurrent stale overwrites and preserve local drafts. | *Rejected: Last-write-wins.* Overwriting concurrent filter configurations destroys peer work silently. |

---

## 3. Orynqo Domain Boundary & Integrity Laws

### 3.1 The Projection Storage Law
A Saved View is immutable metadata specifying *how* to query and present data. It does not own, store, or cache the queried entities:
```text
SavedView := {
  id, workspaceId, name, queryDefinition,
  sortDefinition, groupDefinition, projectionConfig, accessPolicy
}
QueriedResults := Render(SavedView, Authorize(CanonicalStore))
```

### 3.2 The Zero-Leakage Authorization Law
A Saved View operates strictly downstream of the canonical authorization boundary. If a view contains a filter `Project = 'Alpha'` or `assigneeId = 'USR-99'`, and the current user lacks read permission to Project Alpha:
1. Canonical resources belonging to Project Alpha are filtered out before reaching projection or aggregation algorithms.
2. Result count badges and group headers reflect strictly authorized totals (e.g., displaying `0 items` or hiding the group, never hinting at hidden entity counts).
3. Filter selectors, autocomplete dropdowns, and group headers never leak restricted project or initiative names.

### 3.3 The Single Mutation Boundary Law
Interactions inside a Saved View that mutate entity state (e.g., changing a WorkItem status from the Grid, dragging a card on a Board, rescheduling a Project) must delegate directly to the authoritative domain mutation boundary (`updateWorkItem`, `applyProjectUpdate`, etc.). Saved Views have no internal entity mutation logic.

### 3.4 The Non-Broadening Degradation Law
If an entity referenced in a view's filter criteria becomes inaccessible, deleted, or archived:
- The filter condition remains structurally present but evaluates as a closed/empty match.
- The condition is visually marked as `[Unavailable Reference]`.
- The query never silently drops the predicate, preventing accidental data exposure or misleading global rollups.

---

## 4. Canonical Surfaces: VEW-001 & VEW-002

The Saved Views feature introduces exactly two canonical surfaces in CORE:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   SAVED VIEWS CANONICAL SURFACES                       │
├────────────────────────────────────────────────────────────────────────┤
│  VEW-001: SAVED VIEWS DIRECTORY                                        │
│  - Workspace Discovery & Management Primary Page                       │
│  - Facets: Favorites | My Views | Team Views | Workspace Views | All   │
│  - High-Density Metadata Table (Name, Context, Projection, Owner)      │
│  - Inline Actions: Open, Duplicate, Favorite, Share, Archive           │
│                                                                        │
│  VEW-002: SAVED VIEW DETAIL / EXECUTION SURFACE                        │
│  - Header: View Identity, Context Badge, Owner, Dirty State Controls   │
│  - Controls Bar: Filter Builder, Sort Selector, Grouping, Projection   │
│  - Execution Area: WRK-001 (Grid) | WRK-002 (Board) | WRK-003 (Timeline)│
│  - Slide-Over: WRK-005 WorkItem Inspector                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Canonical SavedView Domain Model

The `SavedView` entity is defined as a storage-neutral semantic model:

```typescript
interface SavedView {
  // Identity & Tenancy
  id: string;                          // Unique canonical ID (e.g., 'VEW-001')
  workspaceId: string;                 // Tenancy isolation root
  name: string;                        // Human-readable title (e.g., 'High Priority Bugs')
  description?: string;                // Optional operational summary or charter
  ownerUserId: string;                 // Creator / current owner ID

  // Target Domain
  resourceType: 'work_item' | 'project' | 'initiative'; // Target entity collection (CORE)

  // Context & Discovery Scope
  context: {
    type: 'workspace' | 'team' | 'project' | 'personal';
    contextId?: string;                // Specific teamId or projectId if contextual
  };

  // Projection Configuration
  projectionType: 'grid' | 'board' | 'timeline'; // Default / active projection lens
  queryDefinition: CompoundQuery;       // Semantic boolean query tree
  sortDefinition: SortCriterion[];     // Ordered sort rules
  groupDefinition?: GroupCriterion;    // Optional grouping dimension
  displayConfiguration: {
    visibleFields: string[];           // Field IDs displayed in columns/cards
    columnWidths?: Record<string, number>; // Custom column width overrides
    wrapText?: boolean;                // Text wrapping preference
    density?: 'compact' | 'comfortable'; // Row density preference
    boardColumnsField?: string;        // Field used for Board lanes (defaults to status)
  };

  // Access & Governance
  accessPolicy: 'private' | 'team' | 'workspace'; // Discoverability & execution scope
  isLocked?: boolean;                  // If true, only managers/owner can save changes

  // Lifecycle & Concurrency
  archiveState: 'active' | 'archived'; // Non-destructive lifecycle
  version: number;                     // Optimistic concurrency revision counter (N -> N+1)
  createdAt: string;                   // ISO 8601 creation timestamp
  updatedAt: string;                   // ISO 8601 last modified timestamp
  lastExecutedAt?: string;             // Optional audit timestamp for recency tracking
}
```

---

## 6. Context Model & Scope Semantics

Saved Views originate from different contexts across the platform, determining their discoverability and contextual defaults:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        SAVED VIEW CONTEXT MODEL                        │
├─────────────────┬──────────────────┬───────────────────────────────────┤
│ Context Type    │ Discoverability  │ Semantic Purpose                  │
├─────────────────┼──────────────────┼───────────────────────────────────┤
│ 1. Workspace    │ VEW-001 (Shared) │ Company-wide operational views    │
│                 │ Global Search    │ (e.g., 'All P0 Incidents',        │
│                 │ Command Palette  │ 'Q3 Strategic Roadmap')           │
├─────────────────┼──────────────────┼───────────────────────────────────┤
│ 2. Team         │ VEW-001 (Team)   │ Squad-level tactical workflows    │
│                 │ Team Hub Views   │ (e.g., 'Platform Backlog',        │
│                 │ Command Palette  │ 'Design Review Queue')            │
├─────────────────┼──────────────────┼───────────────────────────────────┤
│ 3. Project      │ VEW-001 (Project)│ Deliverable-specific tracking     │
│                 │ Project Views    │ (e.g., 'Apollo Launch Blocker',   │
│                 │ Command Palette  │ 'Security Audit Items')           │
├─────────────────┼──────────────────┼───────────────────────────────────┤
│ 4. Personal     │ VEW-001 (Mine)   │ Individual customized views       │
│                 │ My Work Nav      │ (e.g., 'My Overdue Review Items', │
│                 │ Command Palette  │ 'Needs My Input')                 │
└─────────────────┴──────────────────┴───────────────────────────────────┘
```

**Critical Distinction:** The `context` specifies *where the view is cataloged and governed*; the `queryDefinition` specifies *which resources are matched*. A Team-context view may match items across multiple projects, or an entire Workspace view may filter for a specific squad.

---

## 7. Supported Resource Types in CORE

In CORE (UI-09), `SavedView` supports three canonical resource types:

1. **`work_item` (Primary):**
   - Full support for `grid`, `board`, and `timeline` projections.
   - Comprehensive filter field registry covering status, priority, assignee, squad, cycle, project, initiative, milestone, tags, dates, and types.
2. **`project`:**
   - Supported projections: `grid` (Directory-style high-density list) and `timeline` (Roadmap multi-project bar view).
   - Filter registry covering status, health, lead team, target window/dates, initiative alignment, and progress.
3. **`initiative`:**
   - Supported projections: `grid` (Portfolio high-density table) and `timeline` (Multi-quarter roadmap projection).
   - Filter registry covering operational state, curated health, horizon, and owner.

*Document Note:* Documents (`DOC-001`, `DOC-002`) remain managed via the Docs Hub search presets and collection tags. Unifying documents into the generic SavedView engine is evaluated as **POST-CORE** to maintain architectural simplicity.

---

## 8. Compound Query Algebra & Filter Tree

To satisfy enterprise requirements without cryptic text queries, Saved Views implement a visual, technology-neutral boolean filter tree:

```typescript
type LogicalOperator = 'AND' | 'OR';

interface FilterCondition {
  id: string;                          // Unique node identifier
  field: string;                       // Field ID from Registry (e.g., 'priority')
  operator: FilterOperator;            // Validated operator for field type
  value: any;                          // Value or array of values
}

interface FilterGroup {
  id: string;                          // Unique group identifier
  conjunction: LogicalOperator;        // Conjunction between children
  conditions: Array<FilterCondition | FilterGroup>; // Nested tree
}

type CompoundQuery = FilterGroup;
```

### 8.1 Example Compound Query Structure
```json
{
  "id": "root-group",
  "conjunction": "AND",
  "conditions": [
    {
      "id": "c1",
      "field": "teamId",
      "operator": "equals",
      "value": "team-core-platform"
    },
    {
      "id": "nested-group-1",
      "conjunction": "OR",
      "conditions": [
        { "id": "c2", "field": "priority", "operator": "equals", "value": "urgent" },
        { "id": "c3", "field": "priority", "operator": "equals", "value": "high" }
      ]
    },
    {
      "id": "c4",
      "field": "status",
      "operator": "not_in",
      "value": ["completed", "canceled"]
    }
  ]
}
```

---

## 9. Filter Field Registry

To avoid hardcoded filter logic, Orynqo defines a canonical, extensible **Filter Field Registry**:

```typescript
interface FilterFieldDefinition {
  id: string;                          // Canonical field identifier
  label: string;                       // Display name
  type: 'string' | 'enum' | 'user' | 'team' | 'project' | 'initiative' | 'cycle' | 'date' | 'number' | 'boolean';
  resourceTypes: Array<'work_item' | 'project' | 'initiative'>;
  allowedOperators: FilterOperator[];
  optionsLoader?: (context: QueryContext) => Promise<Array<{ id: string; label: string }>>;
  supportsMultiple: boolean;
}
```

### 9.1 Operators by Field Type
| Data Type | Allowed Operators |
| :--- | :--- |
| **Enum / Entity Reference** (`status`, `priority`, `assigneeId`, `teamId`, `projectId`, `initiativeId`) | `equals`, `not_equals`, `in`, `not_in`, `is_empty`, `is_not_empty` |
| **Date** (`dueDate`, `targetDate`, `createdAt`, `updatedAt`) | `equals`, `before`, `after`, `between`, `is_empty`, `is_not_empty`, `in_current_period` (e.g., current cycle/quarter) |
| **String** (`title`, `description`) | `contains`, `not_contains`, `starts_with`, `is_empty`, `is_not_empty` |
| **Number** (`estimatePoints`, `version`) | `equals`, `not_equals`, `greater_than`, `less_than`, `between`, `is_empty` |
| **Boolean** (`isBlocked`, `hasDocuments`) | `equals` (`true` / `false`) |

---

## 10. Multi-Criteria Sorting & Grouping

A SavedView stores deterministic sorting and grouping definitions:

```typescript
interface SortCriterion {
  field: string;
  direction: 'asc' | 'desc';
}

interface GroupCriterion {
  field: string;                       // Grouping field (status, priority, assignee, team, project)
  direction?: 'asc' | 'desc';
  collapsedGroupIds?: string[];        // Persisted collapsed group states
}
```

- **Stable Multi-Sort:** Allows primary, secondary, and tertiary sort criteria (e.g., `Priority (desc)` $\rightarrow$ `Due Date (asc)` $\rightarrow$ `Created (asc)`).
- **Projection Compatibility:** Grouping automatically configures lanes in `WRK-002` (Board) and group sections in `WRK-001` (Grid).

---

## 11. Security, Tenancy & Zero-Leakage Enforcement

The security model of Saved Views is absolute:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   ZERO-LEAKAGE QUERY PIPELINE                          │
├────────────────────────────────────────────────────────────────────────┤
│  1. Incoming Request: User executes SavedView (VEW-002)                │
│  2. Workspace Tenancy Check: Verify view belongs to user's workspace   │
│  3. View Access Check: Verify user has canViewSavedView capability     │
│  4. Canonical Resource Query: Fetch live records matching criteria     │
│  5. Pre-Projection Authorization Filter:                               │
│     - Eliminate restricted Projects (and their WorkItems)              │
│     - Eliminate restricted Initiatives                                 │
│     - Eliminate WorkItems where user lacks team/project visibility     │
│  6. Derive Aggregates & Groupings: Compute counts ONLY on auth set     │
│  7. Project onto Viewport: Render Grid / Board / Timeline              │
└────────────────────────────────────────────────────────────────────────┘
```

### Invariant Rules
- **No Inferred Grants:** Having link or access to a Saved View **never** grants permission to read the underlying items.
- **Zero-Leakage Counts:** Summary headers, group row badges, and tab counters report strictly the authorized count ($N_{\text{authorized}}$). If a restricted item matches the query, it is completely invisible and omitted from totals.
- **Picker & Autocomplete Scrubbing:** When editing view filters, autocomplete candidate lists for Projects, Teams, or Assignees strictly exclude entities the user cannot see.

---

## 12. Personal, Team & Shared Workspace Semantics

```text
┌────────────────────────────────────────────────────────────────────────┐
│                     VIEW DISCOVERY & ACCESS SCOPES                     │
├───────────────────┬────────────────────────────────────────────────────┤
│ Policy            │ Discovery & Access Rules                           │
├───────────────────┼────────────────────────────────────────────────────┤
│ 1. Private        │ - Visible ONLY to the owner.                       │
│    (Personal)     │ - Labeled with personal lock icon.                 │
│                   │ - Never returned in peer search or directory.      │
│                   │ - Default for user-created views.                  │
├───────────────────┼────────────────────────────────────────────────────┤
│ 2. Team           │ - Discoverable by members of the assigned team.    │
│                   │ - Appears in Team Hub Views facet.                 │
│                   │ - Non-team members cannot see or execute the view. │
├───────────────────┼────────────────────────────────────────────────────┤
│ 3. Workspace      │ - Discoverable by all members of the workspace.    │
│    (Shared)       │ - Listed in VEW-001 Workspace tab.                 │
│                   │ - Indexed in global search and Command Palette.    │
└───────────────────┴────────────────────────────────────────────────────┘
```

---

## 13. Ownership, Governance & Semantic Capabilities

Access and mutation privileges are governed by granular, semantic capabilities:

```typescript
interface SavedViewCapabilities {
  canViewSavedView: boolean;           // Can execute view and view projected items
  canCreateSavedView: boolean;         // Can create new views in current context
  canEditSavedView: boolean;           // Can update name, description, query, layout
  canDuplicateSavedView: boolean;      // Can clone view definition to personal view
  canShareSavedView: boolean;          // Can elevate private view to team or workspace
  canArchiveSavedView: boolean;        // Can non-destructively archive view
  canManageSavedViewAccess: boolean;   // Can reassign owner or toggle locked state
}
```

### Governance Rules
1. **Owner Permissions:** The view creator is the initial owner and has full edit/share/archive capabilities.
2. **Locked Views:** A shared view marked `isLocked = true` can only be modified by its owner or a workspace administrator, protecting critical organizational dashboards from accidental edits.
3. **Owner Departure:** If an owner leaves the workspace, ownership defaults to the Workspace Admin without deleting or invalidating the view.
4. **Non-Destructive Deletion:** Deletion in CORE is strictly non-destructive via `archiveState = 'archived'`. Archived views can be restored from the directory archive tab.

---

## 14. View Editing Model & Dirty-State Management

To avoid accidental mutation of shared team views while providing instantaneous ad-hoc exploration, Orynqo enforces a strict **Dual-State View Model**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        VIEW DIRTY-STATE FLOW                           │
├────────────────────────────────────────────────────────────────────────┤
│  PERSISTED SAVEDVIEW DEFINITION (Canonical)                            │
│  [ Revision N | Filter: Priority = High ]                              │
│       │                                                                │
│       ▼ (User changes filter to Priority = Urgent)                     │
│  LOCAL WORKING STATE (Modified / Dirty)                                │
│  - Active Projection reflects 'Priority = Urgent' immediately          │
│  - Dirty Indicator displayed: "● Modified" badge in header             │
│  - Action Controls revealed: [ Revert ]  [ Save ]  [ Save As... ]      │
│       │                                                                │
│       ├──► [ Revert ]: Discards working state, restores Revision N     │
│       │                                                                │
│       ├──► [ Save ]: Persists changes to canonical view (Requires      │
│       │              canEditSavedView and valid version N)             │
│       │                                                                │
│       └──► [ Save As... ]: Opens modal to save as new personal/shared   │
│                            SavedView (Original view untouched)         │
└────────────────────────────────────────────────────────────────────────┘
```

### Dirty State Indicators
- **`Saved` (Clean):** Active projection matches persisted definition. Header displays standard view title.
- **`Modified` (Dirty):** Active projection has uncommitted filter, sort, group, or column adjustments. Title displays `● Modified` indicator; `Revert`, `Save`, and `Save As` buttons become active.
- **`Saving`:** Network commit in progress.
- **`Conflict`:** Concurrent modification detected during save.

---

## 15. Optimistic Concurrency & Conflict Recovery

Saved Views utilize version-checked optimistic concurrency control (`version: N`):

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   OPTIMISTIC CONCURRENCY SCENARIO                      │
├────────────────────────────────────────────────────────────────────────┤
│  1. User A and User B open Shared View 'Bugs' at Revision 4.           │
│  2. User B updates filter and clicks Save -> Succeeded (Revision 5).  │
│  3. User A adjusts columns and clicks Save with expectedVersion = 4.   │
│  4. Authoritative Boundary detects conflict (Current 5 != Expected 4). │
│  5. System Action:                                                     │
│     - Save rejected with CONFLICT error.                               │
│     - User A's working adjustments are PRESERVED locally in memory.    │
│     - UI surfaces Conflict Banner:                                     │
│       "View was updated by another user. Choose an action:"            │
│       [ Overwrite (Rev 6) ]  [ Discard & Load Rev 5 ]  [ Save As New ] │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 16. Surface Specification: VEW-001 (Saved Views Directory)

`VEW-001` provides workspace-level discovery and administration of saved projections:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ VIEWS DIRECTORY                                                        [ 🔍 Search views... ] [+ New]│
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ Favorites (3) ]  [ My Views (5) ]  [ Team Views (8) ]  [ Workspace (12) ]  [ Archived (2) ]       │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Star │ Name                       │ Context   │ Projection │ Target      │ Owner     │ Updated     │
├──────┼────────────────────────────┼───────────┼────────────┼─────────────┼───────────┼─────────────┤
│  ★   │ High Priority Bugs         │ Workspace │ Grid       │ WorkItems   │ @younas   │ 2 hours ago │
│  ★   │ Platform Q3 Roadmap        │ Team-Core │ Timeline   │ Projects    │ @sarah    │ Yesterday   │
│  ☆   │ Security Triage Queue      │ Workspace │ Board      │ WorkItems   │ @alex     │ 3 days ago  │
│  ☆   │ My Open Review Items       │ Personal  │ Grid       │ WorkItems   │ You       │ Just now    │
│  ☆   │ Mobile Sprint Backlog      │ Team-Mob  │ Board      │ WorkItems   │ @elena    │ Sep 24      │
├──────┴────────────────────────────┴───────────┴────────────┴─────────────┴───────────┴─────────────┤
│ Inline Hover Actions: [ Open ↗ ]  [ Duplicate ⎘ ]  [ Share ⇗ ]  [ Archive 🗄 ]                       │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Layout & Information Hierarchy
- **Header:** Title, search input with instant debounced filtering, and primary `[ + New View ]` button.
- **Facet Navigation:** Clean pill tabs (`Favorites`, `My Views`, `Team Views`, `Workspace`, `Archived`).
- **High-Density Table:** Standard Orynqo grid rows with favorite star, title, context badge, default projection icon, resource type, owner avatar, and relative timestamp.
- **Inline Actions:** Hovering over a row exposes quick actions (`Open`, `Duplicate`, `Share`, `Archive`).

---

## 17. Surface Specification: VEW-002 (Saved View Detail / Execution Surface)

`VEW-002` is the active execution surface rendering live canonical data through the stored projection lens:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [★] High Priority Bugs   [ Workspace ]  [ ● Modified ]               [ Revert ] [ Save ] [ Save As ]│
│ Stored lens for urgent production issues across all teams                 [ Edit Info ] [ Share ]  │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ ⊞ Filter (3) ] [ ⇅ Sort: Priority (desc) ] [ ☷ Group: Status ]   │   [ Grid | Board | Timeline ] │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                    │
│  CANONICAL PROJECTION SURFACE (WRK-001 / WRK-002 / WRK-003)                                        │
│  - Renders live canonical items matching query                                                     │
│  - Fully interactive: inline editing, selection, reordering                                        │
│  - Clicking any item opens WRK-005 WorkItem Inspector without navigation                           │
│                                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Controls & Header Architecture
- **Identity Bar:** Title, favorite toggle, visibility badge (`Personal`, `Team`, `Workspace`), description, and dirty-state status indicator (`Saved` / `Modified`).
- **Control Bar:**
  - **Filter Builder Trigger:** Displays count of active rules (e.g., `Filter (3)`); opens visual Compound Filter Popover.
  - **Sort Trigger:** Configures multi-column sort criteria.
  - **Group Trigger:** Selects grouping field (Status, Priority, Assignee, Team, Project).
  - **Projection Switcher:** Seamlessly toggles view between `Grid`, `Board`, and `Timeline`.
  - **Dirty State Actions:** Visible when modified (`Revert`, `Save`, `Save As`).

---

## 18. Sidebar & Global Application Integration

Saved Views integrate natively into the frozen application shell:

```text
ORYNQO SHELL
├── Organization / Workspace Switcher
├── [ 🔍 Search & Commands... ⌘K ]
│
├── PERSONAL
│   ├── Inbox
│   └── My Work
│
├── FAVORITES (Collapsible)
│   ├── High Priority Bugs           # Pinned SavedView shortcut
│   └── Platform Q3 Roadmap          # Pinned SavedView shortcut
│
├── WORKSPACE (Strategic & Shared)
│   ├── Initiatives
│   ├── Docs
│   └── Views                        # Routes directly to VEW-001 Views Directory
│
└── TEAMS ...
```

### Sidebar Rules
1. **`Views` Route:** Clicking `Views` under `WORKSPACE` navigates directly to `VEW-001` (Views Directory).
2. **No Navigation Flooding:** Individual Saved Views are **not** listed in the sidebar by default.
3. **Generic Favorites Integration:** Starring a Saved View in `VEW-001` or `VEW-002` dynamically surfaces it in the user's `FAVORITES` section via the canonical `useFavorites` hook (`targetType = 'saved_view'`, `targetId = view.id`).

---

## 19. Duplication & Lifecycle Workflows

### 19.1 Duplication Contract
Invoking **Duplicate View** creates a clone of the view definition:
- **Cloned:** Name (`Copy of ...`), description, queryDefinition, sortDefinition, groupDefinition, displayConfiguration, projectionType.
- **Reset:** `id` (new unique ID), `version = 1`, `createdAt = now`, `updatedAt = now`.
- **Default Ownership:** Assigned to the current actor (`ownerUserId = currentUserId`).
- **Default Access Policy:** Set to `private` (Personal), ensuring duplicated shared views start safely in the user's private workspace.
- **Zero Entity Duplication:** Does **not** clone or duplicate any underlying work items or projects.

### 19.2 Non-Destructive Archive & Restore
- **Archive:** Transitions `archiveState = 'archived'`. The view is hidden from standard directory tabs, global search, and Command Palette.
- **Restore:** Reverts `archiveState = 'active'`. Available to authorized users from the `Archived` tab in `VEW-001`.

---

## 20. Stale & Inaccessible Reference Degradation

When an entity referenced in a view filter becomes deleted, archived, or inaccessible to a viewing user:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                    STALE REFERENCE DEGRADATION TABLE                   │
├──────────────────────┬─────────────────────────────────────────────────┤
│ Condition            │ Evaluated Behavior                              │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 1. Project Archived  │ - Filter condition remains `projectId = 'PRJ'`. │
│    or Deleted        │ - Token renders as `[Archived Project]`.        │
│                      │ - Evaluates to matches strictly if items exist. │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 2. Project or Team   │ - Filter condition preserved in definition.     │
│    Restricted (RBAC) │ - Token renders as `[Unavailable Reference]`.   │
│                      │ - Evaluates to empty set (0 matches).           │
│                      │ - Name of restricted entity is NEVER displayed. │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 3. User Removed /    │ - Token renders as `[Former Member]`.           │
│    Deactivated       │ - Matches historical items assigned to user.    │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 4. Custom Field or   │ - Condition marked with visual warning icon.    │
│    Enum Removed      │ - Evaluated as inactive/no-op rule.             │
│                      │ - User prompted to repair filter.               │
└──────────────────────┴─────────────────────────────────────────────────┘
```

**Golden Rule:** Under no circumstances does a query silently discard an invalid condition and broaden its scope to all records.

---

## 21. Centralized Keyboard Architecture Integration

Saved Views register semantic commands within the centralized keyboard manager:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                    SEMANTIC KEYBOARD COMMANDS                          │
├──────────────────────┬──────────────────────────┬──────────────────────┤
│ Command ID           │ Semantic Purpose         │ Context / Scope      │
├──────────────────────┼──────────────────────────┼──────────────────────┤
│ views.open_directory │ Route to VEW-001         │ Global (g v)         │
│ views.create_new     │ Open Create View Modal   │ Directory / Detail   │
│ views.save_changes   │ Commit dirty state       │ VEW-002 (Mod+S)      │
│ views.revert_changes │ Revert dirty state       │ VEW-002 (Escape)     │
│ views.save_as_new    │ Fork active projection   │ VEW-002 (Mod+Shift+S)│
│ views.toggle_filter  │ Focus Filter Builder     │ VEW-002 (f)          │
│ views.switch_grid    │ Switch to Grid Lens      │ VEW-002 (v 1)        │
│ views.switch_board   │ Switch to Board Lens     │ VEW-002 (v 2)        │
│ views.switch_timeline│ Switch to Timeline Lens  │ VEW-002 (v 3)        │
│ views.toggle_favorite│ Star/Unstar active view  │ VEW-001 / VEW-002 (m)│
└──────────────────────┴──────────────────────────┴──────────────────────┘
```

*Typing Isolation:* All single-key commands are strictly disabled when focus is inside text inputs, filter fields, or editable cells.

---

## 22. URL & Deep-Linking Contract

Saved Views maintain clean, stable URL representations:

```text
/workspace/views                    -> VEW-001 Views Directory
/workspace/views/:viewId            -> VEW-002 Saved View Detail (Default lens)
/workspace/views/:viewId?lens=board -> VEW-002 Saved View with Board lens override
/workspace/views/:viewId?item=W-12  -> VEW-002 with WRK-005 Inspector open on item
```

- **Clean Identity:** URL references the canonical `viewId`. Sensitive query expressions are **not** encoded in query strings for saved views.
- **Transient Exploration:** Temporary filter overrides may optionally serialize to ephemeral URL query parameters (`?filter=...`) to allow sharing draft exploration links without saving.

---

## 23. Scalability, Virtualization & Server Query Compatibility

To guarantee performance on enterprise repositories with $100,000+$ items, the Saved View contract requires:

1. **Server-Side Query Translation:** `CompoundQuery`, `SortCriterion[]`, and `GroupCriterion` compile directly into SQL/NoSQL indexing structures.
2. **Cursor-Based Pagination:** Projection surfaces consume paginated cursors, never requiring full client-side array hydration.
3. **Windowed Virtualization:** Reuses the high-density virtualized row engine established in `UI-01B` (`WRK-001`) and lane virtualization in `UI-01D` (`WRK-002`).
4. **Bounded Aggregate Computation:** Server returns computed group totals and count badges without sending unrendered item payloads.

---

## 24. Component Architecture & Responsibility Separation

```text
src/features/views/
├── components/
│   ├── ViewsDirectory.jsx             # VEW-001 Directory root component
│   ├── ViewsDirectoryTable.jsx        # VEW-001 High-density table
│   ├── SavedViewDetail.jsx            # VEW-002 Execution surface container
│   ├── SavedViewHeader.jsx            # VEW-002 Identity, badges, dirty controls
│   ├── SavedViewControlsBar.jsx       # Filter/Sort/Group/Lens triggers
│   ├── FilterBuilder/                 # Compound visual filter builder
│   │   ├── FilterBuilderPopover.jsx   # Root filter popover
│   │   ├── FilterGroupNode.jsx        # Recursive AND/OR group container
│   │   ├── FilterConditionRow.jsx     # Field + Operator + Value row
│   │   └── FilterFieldPicker.jsx      # Autocomplete field picker
│   ├── SortBuilderPopover.jsx         # Multi-criteria sort configuration
│   ├── GroupBuilderPopover.jsx        # Group dimension selector
│   ├── SaveViewModal.jsx              # Create / Save As configuration modal
│   └── ViewConflictModal.jsx          # Concurrency conflict resolution dialog
├── hooks/
│   ├── useSavedViews.js               # Reactive hook querying views collection
│   ├── useSavedViewDetail.js          # Working vs canonical state & dirty tracking
│   ├── useSavedViewMutations.js       # Create, update, duplicate, archive operations
│   └── useViewQueryExecution.js       # Live canonical resource query runner
└── model/
    ├── savedViewModel.js              # Canonical SavedView schema & validation
    ├── queryAlgebra.js                # Query tree evaluator & compiler
    ├── filterRegistry.js              # Supported fields, types, and operators
    └── savedViewAccess.js             # RBAC capabilities evaluator
```

---

## 25. Scope Boundaries: CORE vs POST-CORE / FUTURE

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        SCOPE BOUNDARY TAXONOMY                         │
├────────────────────────────────────────────────────────────────────────┤
│  CORE (UI-09B Scope)                                                   │
│  - VEW-001 Saved Views Directory with high-density table and search   │
│  - VEW-002 Saved View Detail surface driving WRK-001, WRK-002, WRK-003 │
│  - Canonical SavedView model with optimistic concurrency (version)     │
│  - Compound Query Tree (AND / OR, nested groups, typed operators)      │
│  - Filter Field Registry for WorkItems, Projects, and Initiatives      │
│  - Multi-criteria sorting and grouping dimensions                      │
│  - Dual-State View Editing (Saved vs Modified, Revert, Save, Save As)  │
│  - Personal, Team, and Workspace access scopes                         │
│  - Zero-leakage pre-projection authorization enforcement               │
│  - View duplication with safe personal defaults                        │
│  - Non-destructive archive and restore                                 │
│  - Generic Favorites integration (useFavorites)                        │
│  - Command Palette discovery and navigation                            │
│  - Reusable WRK-005 Inspector slide-over                               │
│                                                                        │
│  POST-CORE (Deferred Beyond UI-09B)                                    │
│  - Public / external share links with guest token access               │
│  - Scheduled digest emails or Slack view reports                       │
│  - Multi-view dashboard canvas / executive widgets                     │
│  - View folders / nested taxonomy hierarchy                            │
│  - Document collection generic view integration                        │
│  - Custom field designer & dynamic schema extension                    │
│  - Cross-workspace multi-tenant views                                  │
│                                                                        │
│  FUTURE (Architectural Horizon)                                        │
│  - Natural language query builder (AI prompt -> CompoundQuery)         │
│  - Automated smart view recommendations based on user habits           │
│  - Real-time collaborative multi-user live cursors in filter builder   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 26. Frozen vs Tunable Specifications

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FROZEN ARCHITECTURAL LAWS                       │
├────────────────────────────────────────────────────────────────────────┤
│ 1. A SavedView is a stored projection definition, NOT a data container.│
│ 2. Canonical domain state ownership is strictly preserved; views have   │
│    no internal entity mutation writers.                                │
│ 3. Pre-projection authorization filtering is mandatory (Zero-Leakage). │
│ 4. Inaccessible and deleted filter references degrade safely without   │
│    silent query broadening.                                            │
│ 5. Temporary view changes do not auto-save to shared views; explicit   │
│    Save, Revert, and Save As workflows are enforced.                   │
│ 6. Optimistic concurrency with version N -> N+1 rejects stale writes.  │
│ 7. Generic Favorites architecture (useFavorites) is reused without      │
│    view-specific favorites tables.                                     │
│ 8. Existing projection engines (WRK-001, WRK-002, WRK-003) and        │
│    WRK-005 Inspector are reused unforked.                              │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                        TUNABLE IMPLEMENTATION                          │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Exact CSS styling, layout spacing tokens, and color values.         │
│ 2. Exact pixel viewport breakpoints for responsive layouts.            │
│ 3. Physical keyboard shortcut bindings in Command Palette.             │
│ 4. Backend database schema, indexing, and SQL serialization shapes.    │
│ 5. API transport mechanisms (REST, GraphQL, WebSocket subscriptions).  │
│ 6. Exact debounce delay for directory search (e.g., 150ms vs 300ms).   │
│ 7. Number of items per cursor page batch.                              │
│ 8. Client-side caching engine and memory store implementation.         │
│ 9. Popover placement and animation timing curves.                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 27. Numbered Acceptance Criteria for UI-09B Implementation

When UI-09B is authorized, implementation must strictly prove:

1. **Canonical SavedView Model:** Instantiates workspace-scoped `SavedView` entity with ID, name, description, owner, target resource, context, query definition, sort/group criteria, display configuration, and access policy.
2. **Zero Resource Duplication:** Storing or executing a SavedView does not clone, cache, or duplicate canonical WorkItems, Projects, or Initiatives.
3. **VEW-001 Directory Surface:** Renders workspace-level Views Directory with high-density table, debounced search, context badges, and metadata columns.
4. **VEW-001 Facet Filtering:** Correctly filters directory rows across `Favorites`, `My Views`, `Team Views`, `Workspace`, and `Archived`.
5. **VEW-002 Execution Surface:** Renders view header, controls bar, and canonical execution surface for the selected SavedView.
6. **Reused Execution Core (WRK-001):** Renders matching canonical items inside the unforked High-Density Grid with inline property pickers.
7. **Reused Kanban Board (WRK-002):** Renders matching canonical items inside the unforked Kanban Board with group-by-status/assignee lanes.
8. **Reused Timeline (WRK-003):** Renders matching canonical items/projects on the multi-quarter timeline with temporal milestones.
9. **Reused Inspector (WRK-005):** Clicking an item in any view projection opens the canonical slide-over Inspector without navigation or state loss.
10. **Canonical Domain Mutation Delegation:** Editing an entity property inside a view projection delegates directly to the canonical domain mutation boundary (`updateWorkItem`, etc.).
11. **Compound Query Tree Evaluation:** Evaluates boolean queries with `AND`, `OR`, and nested rule groups accurately against test datasets.
12. **Typed Field Operators:** Enforces field-appropriate operators (`equals`, `contains`, `in`, `before`, `is_empty`, etc.) per the Filter Field Registry.
13. **Deterministic Multi-Sort:** Applies ordered multi-criteria sorting rules stably across rendered rows.
14. **Dynamic Grouping:** Groups projection rows/cards by chosen dimension (`status`, `priority`, `assignee`, `team`, `project`).
15. **Pre-Projection Authorization (Zero-Leakage):** Completely excludes restricted items from view results before rendering.
16. **Zero-Leakage Count Verification:** Result counts, group badges, and summary statistics reflect strictly authorized item totals.
17. **Zero-Leakage Autocomplete:** Filter candidate pickers strictly omit restricted project, team, and user names.
18. **Personal View Privacy:** A `private` SavedView is discoverable and executable strictly by its owner; completely invisible to peers.
19. **Team View Tenancy:** A `team` SavedView is discoverable by members of that team; hidden from non-members.
20. **Workspace View Discovery:** A `workspace` SavedView is discoverable across the workspace and indexed in search.
21. **Capability Enforcement:** Semantic capabilities (`canViewSavedView`, `canEditSavedView`, etc.) strictly guard edit, share, and archive controls.
22. **Dual-State View Model:** Modifying a filter in `VEW-002` immediately updates the active projection locally without auto-saving to the shared view.
23. **Visual Dirty Indicator:** Displays `● Modified` status and activates `Revert`, `Save`, and `Save As` buttons when local state diverges from persisted definition.
24. **Explicit Revert Workflow:** Clicking `Revert` discards all local working adjustments and cleanly restores the persisted view definition.
25. **Explicit Save Workflow:** Clicking `Save` commits working changes to canonical storage and bumps version $N \rightarrow N+1$.
26. **Explicit Save As Workflow:** Clicking `Save As` opens creation dialog pre-filled with current working projection, creating an independent view.
27. **Optimistic Concurrency Protection:** Rejects stale-write saves when expectedVersion does not match current canonical version.
28. **Conflict Recovery Surface:** Surfaces conflict dialog preserving local changes and offering Overwrite, Discard, or Save As New choices.
29. **Non-Mutating View Duplication:** Duplicating a view clones its complete projection definition with new ID and personal ownership without duplicating items.
30. **Non-Destructive Archive & Restore:** Archiving hides the view from directory and search; restoring returns it to active state.
31. **Generic Favorites Integration:** Starring a view integrates with canonical `useFavorites` hook and surfaces view under `FAVORITES` sidebar section.
32. **Command Palette Integration:** Authorized views are searchable and executable from `CMD-001` Command Palette without restricted view leakage.
33. **Stale Reference Degradation:** Deleted or inaccessible entity references render as `[Unavailable Reference]` tokens without silently dropping filter conditions.
34. **URL & Deep-Link Navigation:** Navigating to `/views/:viewId` loads the canonical SavedView and restores its default projection cleanly.
35. **Scope Boundary Enforcement:** POST-CORE capabilities (public links, automated digests, AI queries) and FUTURE extensions remain completely absent.
36. **Frozen Regression Stability:** Full test suite (346 tests across 15 suites) remains 100% green without regression.

---

# HUMAN REVIEW — UI-09A SAVED VIEWS PRODUCT & UX CONTRACT
