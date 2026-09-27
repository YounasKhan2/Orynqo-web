# UI-09A: Saved Views Product & UX Contract

- **Document Version:** `1.1.0`
- **Surface Identifiers:** `VEW-001` (Saved Views Directory / Management Surface), `VEW-002` (Saved View Detail / Execution Surface)
- **Status:** **CORRECTED — READY FOR HUMAN REVIEW**
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
│  - Restricted Resource Exclusion (Early Authoritative Filtering)       │
│       │                                                                │
│       ▼                                                                │
│  SAVED VIEW ENGINE (Stored Projection Configuration)                   │
│  - Compound Query Definition (AND / OR / NOT Algebra)                  │
│  - Multi-Criteria Sorting Rules                                        │
│  - Grouping Hierarchy Dimension                                        │
│  - Shared Visible Fields & Presentation Defaults                       │
│  - Active Projection Lens (Compatible with Target Resource)            │
│       │                                                                │
│       ▼                                                                │
│  CANONICAL PROJECTION SURFACES (Reused, Unforked UI Layers)            │
│  [ WRK-001 Grid | WRK-002 Board | WRK-003 Timeline ]                  │
│       │                                                                │
│       ▼                                                                │
│  CANONICAL INSPECTION & MUTATION                                       │
│  - WorkItems: WRK-005 Inspector ──(Delegates)──► updateWorkItem        │
│  - Projects/Initiatives: Canonical detail surfaces & mutation boundary │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1 What a Saved View IS
1. **A Stored Projection Definition:** A lightweight configuration record storing query expressions, sorting criteria, grouping definitions, column visibility, and projection types.
2. **A Reusable Lens Across Contexts:** Can originate from Workspace, Team, Project, or Personal contexts to provide tailored operational visibility.
3. **Strictly Permission-Safe:** Acts strictly upon authorized data. Matches against inaccessible entities are excluded before calculation, rendering, grouping, or counting.
4. **An Unforked Consumer of Existing Projections:** Directly drives the frozen execution core—`WRK-001` (High-Density Grid), `WRK-002` (Kanban Board), and `WRK-003` (Timeline)—where supported by resource semantics, without duplicating visual components or mutation logic.
5. **Collaboratively Governed with Explicit Mutation Semantics:** Clearly distinguishes temporary ad-hoc filter exploration from persisted view updates via explicit Save, Revert, and Save As workflows.

### 1.2 What a Saved View IS NOT
1. **NOT a Container or Folder of WorkItems:** A Saved View does not "contain" work items. It has no `workItems[]` array. Removing an item from a view's criteria does not delete or unassign the item; it simply ceases to match the view query.
2. **NOT a Project, Team, or Initiative:** It owns no lifecycle, has no members or delivery milestones, and cannot be assigned work items.
3. **NOT a Data Cache or Historical Snapshot:** A Saved View always queries live canonical state; it is not a point-in-time database snapshot.
4. **NOT an Authorization Bypass:** A user cannot view or discover restricted work items, projects, or initiatives simply because a shared view's query matches them.
5. **NOT an Independent Mutation Boundary:** Editing an entity within a view delegates directly to the canonical domain mutation boundary (`updateWorkItem`, `applyProjectUpdate`, etc.).

---

## 2. Competitive Reference Pass & Industry Synthesis

To establish a standard that matches and exceeds modern enterprise products, we conducted an architectural inspection of public patterns across **Linear**, **Jira**, **Asana**, **ClickUp**, **Monday**, and **Notion**:

| Dimension | Observed Competitor Patterns | Orynqo Decision | Rationale & Rejected Patterns |
| :--- | :--- | :--- | :--- |
| **View Definition vs Entity Containment** | **Linear:** Views are pure search filters (`Custom Views`).<br>**Jira:** Filter queries (JQL) save views/boards.<br>**ClickUp/Monday:** Confusing mix where views sometimes act as folders containing tasks. | **Pure Stored Projection Definition:** Views store query parameters; entities are queried dynamically. | *Rejected: Containment model.* Treating views as item containers creates multi-homing bugs, circular hierarchies, and desynchronized records. |
| **Filter Composition & Algebra** | **Linear:** Multi-filter bar with implicit AND and limited OR.<br>**Jira:** JQL provides complete boolean algebra (AND, OR, NOT, nested parentheses).<br>**Notion:** Compound filter groups (Any / All) with nested rules. | **Visual Compound Filter Algebra:** Recursive filter trees supporting `AND`, `OR`, and nested rule groups with field-specific operators. | *Rejected: Flat single-level filter bars.* Enterprise teams require compound logic (e.g., `(Team = Platform OR Team = Infra) AND Status = In Progress`). Text-only JQL rejected for standard UI as non-visual. |
| **View Editing & Dirty State** | **Linear:** Automatically modifies view or prompts save banner.<br>**Asana:** Prompts "Save for everyone" button when view options change.<br>**Monday:** Auto-saves shared board views, leading to accidental team disruptions. | **Explicit Save / Revert / Save As with Visual Dirty Indicator:** Temporary adjustments remain local until explicitly saved or discarded. | *Rejected: Silent auto-save on shared views.* Auto-saving modifies shared organizational definitions without consent, breaking peer workflows. |
| **Personal vs Shared Discovery** | **Linear:** Personal custom views vs Workspace custom views.<br>**Jira:** Filter ownership with private, project, or group sharing.<br>**Asana:** Public to team vs private to creator. | **Three Semantic Scopes:**<br>1. *Private:* Visible only to owner.<br>2. *Team Context:* Discoverable via canonical Team authorization.<br>3. *Shared Workspace:* Discoverable across workspace. | *Rejected: Binary private/public.* Complex multi-team organizations need squad-scoped views that do not clutter the global workspace directory. |
| **Projection Coupling** | **ClickUp:** Each view type (List, Board, Gantt) is an independent tab with separate settings.<br>**Linear:** Switch view projection between List and Board seamlessly.<br>**Notion:** Switch layout while sharing the underlying database filter. | **Decoupled Projection Lens:** A Saved View stores a preferred projection, but users can switch projection on-the-fly while retaining query state. | *Rejected: Siloed view engines per projection type.* Forces duplicate filter configuration across grid and board views. |
| **Stale Reference Degradation** | **Jira:** JQL fails catastrophically or breaks silently if a custom field or project key is deleted.<br>**Linear:** Gracefully flags missing labels or removed assignees. | **Fail-Closed Non-Broadening Degradation:** Invalid/unresolved predicates fail closed for the affected branch and never broaden query results. | *Rejected: Silent broadening.* Never drop an invalid condition or turn it into a no-op that broadens matches (e.g., `Status = Active AND [Deleted] = X` must not become `Status = Active`). |
| **Access Control & Concurrency** | **Linear:** Workspace members can edit workspace views.<br>**Jira:** Granular edit permissions on shared filters.<br>**Monday:** Board owners vs board viewers. | **Capability-Driven Management + Optimistic Concurrency:** Versioned revisions (`N -> N+1`) block concurrent stale overwrites without blind force-writes. | *Rejected: Last-write-wins.* Overwriting concurrent filter configurations destroys peer work silently. |

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
Only authorized resources may enter projection, aggregation, grouping, counting, or rendering:
1. Authorization is enforced as early as practical within authoritative query/data boundaries, without requiring materialization of inaccessible records.
2. Result count badges and group headers reflect strictly authorized totals (e.g., displaying `0 items` or hiding the group, never hinting at hidden entity counts).
3. Filter selectors, autocomplete dropdowns, and group headers never leak restricted project, team, or initiative names.

### 3.3 The Single Mutation Boundary Law
Interactions inside a Saved View that mutate entity state (e.g., changing a WorkItem status from the Grid, dragging a card on a Board, rescheduling a Project) must delegate directly to the authoritative domain mutation boundary (`updateWorkItem`, `applyProjectUpdate`, etc.). Saved Views have no internal entity mutation logic.

### 3.4 The Non-Broadening Degradation Law
If an entity or field referenced in a view's filter criteria becomes inaccessible, deleted, or invalid:
```text
predicate remains structurally present
→ predicate enters invalid/unresolved state
→ SavedView reports degraded configuration
→ execution must fail closed for that predicate or for the affected query branch
→ user receives repair action
→ query must never silently broaden
```
- **Conjunction Rule (AND):** An invalid predicate in an `AND` group evaluates to `false` (no matches for that predicate), restricting the branch rather than dropping the requirement.
- **Disjunction Rule (OR):** An invalid predicate in an `OR` group evaluates to `false`, ensuring invalid conditions cannot match entities or expand the set.

---

## 4. Canonical Surfaces: VEW-001 & VEW-002

The Saved Views feature introduces exactly two canonical surfaces in CORE:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   SAVED VIEWS CANONICAL SURFACES                       │
├────────────────────────────────────────────────────────────────────────┤
│  VEW-001: SAVED VIEWS DIRECTORY                                        │
│  - Workspace Discovery & Management Primary Page                       │
│  - Discovery Facets: Favorites | My Views | Team Views | Workspace |   │
│    Archived                                                            │
│  - High-Density Metadata Table (Name, Context, Projection, Owner)      │
│  - Inline Actions: Open, Duplicate, Favorite, Share, Archive           │
│                                                                        │
│  VEW-002: SAVED VIEW DETAIL / EXECUTION SURFACE                        │
│  - Header: View Identity, Context Badge, Owner, Dirty State Controls   │
│  - Controls Bar: Filter Builder, Sort Selector, Grouping, Projection   │
│  - Execution Area: Reused canonical projection (Grid/Board/Timeline)   │
│  - Detail/Inspection: WRK-005 for WorkItems; canonical detail for      │
│    Projects/Initiatives                                                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Canonical SavedView Domain Model & State Separation

To preserve enterprise stability, Saved View state is strictly separated into three layers:
1. **Canonical Shared Definition:** Persisted shared truth.
2. **User-Scoped Execution State & Preferences:** Local to the active user session/device.
3. **Local Working Draft:** Ephemeral in-memory adjustments before save.

```typescript
// 1. Canonical Shared Definition (Persisted)
interface SavedView {
  // Identity & Tenancy
  id: string;                          // Unique canonical ID (e.g., 'VEW-001')
  workspaceId: string;                 // Tenancy isolation root
  name: string;                        // Human-readable title
  description?: string;                // Optional operational summary or charter
  ownerUserId: string;                 // Current owner ID

  // Target Domain & Context
  resourceType: 'work_item' | 'project' | 'initiative'; // Target entity collection
  context: {
    type: 'workspace' | 'team' | 'project' | 'personal';
    contextId?: string;                // Specific teamId or projectId if contextual
  };

  // Persisted Projection Configuration
  projectionType: 'grid' | 'board' | 'timeline'; // Shared default projection lens
  queryDefinition: CompoundQuery;       // Semantic boolean query tree
  sortDefinition: SortCriterion[];     // Ordered sort rules
  groupDefinition?: GroupCriterion;    // Grouping dimension
  sharedDisplayConfiguration: {
    visibleFields: string[];           // Field IDs displayed in columns/cards
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
}

// 2. User-Scoped Execution State & Personal Preferences (User-Owned)
interface UserViewPreferences {
  viewId: string;
  userId: string;
  lastExecutedAt?: string;             // Audit timestamp for recency tracking
  personalDensity?: 'compact' | 'comfortable'; // User's density override
  collapsedGroupIds?: string[];        // User's personal collapsed sections
  userColumnWidths?: Record<string, number>; // Personal column widths
  activeInspectorItemId?: string | null; // Currently open item in WRK-005
}

// 3. Local Working Draft (In-Memory Unsaved Adjustments)
interface WorkingViewDraft {
  isDirty: boolean;
  baseVersion: number;
  draftQuery?: CompoundQuery;
  draftSort?: SortCriterion[];
  draftGroup?: GroupCriterion;
  draftProjectionType?: 'grid' | 'board' | 'timeline';
  draftVisibleFields?: string[];
}
```

---

## 6. Context Model vs Access Policy

The contract strictly separates **Where a view is cataloged (Context)** from **Who is authorized to access it (Access Policy)**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                     CONTEXT VS ACCESS POLICY MATRIX                    │
├─────────────────┬──────────────────┬───────────────────────────────────┤
│ Concept         │ Property         │ Architectural Role                │
├─────────────────┼──────────────────┼───────────────────────────────────┤
│ Context         │ context.type     │ Specifies where the view belongs, │
│                 │ context.contextId│ its discovery home, and default   │
│                 │                  │ query scoping presets.            │
├─────────────────┼──────────────────┼───────────────────────────────────┤
│ Access Policy   │ accessPolicy     │ Specifies discoverability scope:  │
│                 │ ('private' |     │ - private (Owner only)            │
│                 │  'team' |        │ - team (Canonical Team Auth)      │
│                 │  'workspace')    │ - workspace (Workspace-wide)      │
└─────────────────┴──────────────────┴───────────────────────────────────┘
```

**Non-Inference Rule:** Context never confers access rights. A SavedView with `context.type = 'team'` and `context.contextId = 'team-platform'` is accessible **only if** the user satisfies:
$$\text{Workspace Tenancy} + \text{Canonical Team Authorization} + \text{SavedView Access Policy}$$
Likewise, setting `context.type = 'project'` does **not** grant access to restricted Project entities.

---

## 7. Resource & Projection Compatibility Matrix

Projections are not universally applicable to all resources. Orynqo enforces a strict **Compatibility Matrix**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│              RESOURCE & PROJECTION COMPATIBILITY MATRIX                │
├───────────────┬─────────────────────────┬──────────────┬───────────────┤
│ Resource Type │ Supported Projections   │ Inspector    │ Detail Action │
├───────────────┼─────────────────────────┼──────────────┼───────────────┤
│ `work_item`   │ Grid (WRK-001)          │ WRK-005      │ Opens WRK-005 │
│               │ Board (WRK-002)         │ WorkItem     │ Inspector     │
│               │ Timeline (WRK-003)      │ Inspector    │ in-place      │
├───────────────┼─────────────────────────┼──────────────┼───────────────┤
│ `project`     │ Grid (High-density list)│ NONE         │ Navigates to  │
│               │ Timeline (Multi-project │              │ canonical     │
│               │ roadmap bars)           │              │ Project page  │
├───────────────┼─────────────────────────┼──────────────┼───────────────┤
│ `initiative`  │ Grid (Portfolio table)  │ NONE         │ Navigates to  │
│               │ Timeline (Multi-quarter │              │ canonical     │
│               │ strategic roadmap)      │              │ Initiative    │
└───────────────┴─────────────────────────┴──────────────┴───────────────┘
```

- **Rejection of Unsupported Projections:** `VEW-002` rejects unsupported combinations (e.g., Board projection for Initiatives, which has no canonical Kanban semantics).
- **Inspector Scope:** `WRK-005` is exclusively the canonical **WorkItem Inspector**. Clicking a Project or Initiative in a view projection does not open a fabricated inspector; it triggers standard canonical resource navigation.

---

## 8. Compound Query Algebra & Filter Tree

Saved Views implement a visual, technology-neutral boolean filter tree:

```typescript
type LogicalOperator = 'AND' | 'OR';

interface FilterCondition {
  id: string;                          // Unique node identifier
  field: string;                       // Field ID from Registry (e.g., 'priority')
  operator: FilterOperator;            // Validated operator for field type
  value: any;                          // Value or array of values
  isDegraded?: boolean;                // Flagged when reference is invalid
}

interface FilterGroup {
  id: string;                          // Unique group identifier
  conjunction: LogicalOperator;        // Conjunction between children
  conditions: Array<FilterCondition | FilterGroup>; // Nested tree
}

type CompoundQuery = FilterGroup;
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
│  1. Request: User executes SavedView (VEW-002)                         │
│  2. Tenancy & View Access: Verify workspace tenancy and canViewSavedView│
│  3. Authoritative Query Filtering: Evaluate query directly against     │
│     authorized canonical store; unauthorized records never materialize │
│  4. Derive Aggregates & Groupings: Compute counts ONLY on auth set     │
│  5. Project onto Viewport: Render Grid / Board / Timeline              │
└────────────────────────────────────────────────────────────────────────┘
```

### Invariant Rules
- **No Inferred Grants:** Having a link to a Saved View **never** grants permission to read the underlying items.
- **Zero-Leakage Counts:** Summary headers, group row badges, and tab counters report strictly the authorized count ($N_{\text{authorized}}$). If a restricted item matches the query, it is completely omitted from totals.
- **Picker & Autocomplete Scrubbing:** When editing view filters, autocomplete candidate lists strictly exclude entities the user cannot see.

---

## 12. Ownership, Governance & Semantic Capabilities

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

### 12.1 Governance & Owner Departure Policy
```text
┌────────────────────────────────────────────────────────────────────────┐
│                   OWNER DEPARTURE GOVERNANCE LAW                       │
├────────────────────────────────────────────────────────────────────────┤
│ Invariant: A shared SavedView must not become unmanaged when its owner │
│ loses workspace membership.                                            │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Shared / Team Views: When an owner leaves the workspace, ownership  │
│    is reassigned via semantic governance capability                    │
│    (canManageSavedViewAccess), preserving shared team workflows.       │
│ 2. Private (Personal) Views: When a user leaves, their private views   │
│    remain private and enter an archived/orphaned lifecycle; they are   │
│    NEVER silently exposed or shared with other workspace users.        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 13. View Editing Model & Projection Override Semantics

To prevent accidental modification of shared team views while providing instantaneous ad-hoc exploration, Orynqo enforces a strict **Dual-State View Model**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        VIEW DIRTY-STATE FLOW                           │
├────────────────────────────────────────────────────────────────────────┤
│  PERSISTED SAVEDVIEW DEFINITION (Canonical)                            │
│  [ Revision N | Projection: Grid | Filter: Priority = High ]           │
│       │                                                                │
│       ▼ (User changes filter or switches lens to Board)                │
│  LOCAL WORKING STATE (Modified / Dirty)                                │
│  - Active Projection updates immediately in-memory                     │
│  - Dirty Indicator displayed: "● Modified" badge in header             │
│  - Action Controls revealed: [ Revert ]  [ Save ]  [ Save As... ]      │
│       │                                                                │
│       ├──► [ Revert ]: Discards working state, restores Revision N     │
│       │                                                                │
│       ├──► [ Save ]: Persists changes to canonical view (Requires      │
│       │              canEditSavedView and valid version N)             │
│       │                                                                │
│       └──► [ Save As... ]: Creates new SavedView from WORKING DRAFT    │
└────────────────────────────────────────────────────────────────────────┘
```

### 13.1 Projection Switch Semantics
- Switching lenses (e.g., `Grid` $\rightarrow$ `Board`) creates **local working state**.
- If `projectionType` is part of the canonical definition, the view is marked `● Modified`.
- An explicit `Save` is required to alter the shared default projection lens. Users without `canEditSavedView` can freely explore alternative projections locally without persisting changes.

---

## 14. Hardened Optimistic Concurrency & Safe Conflict Recovery

Saved Views utilize version-checked optimistic concurrency control (`version: N`). Blind last-write-wins overwrites that bypass concurrency checks are strictly forbidden:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   SAFE CONFLICT RECOVERY WORKFLOW                      │
├────────────────────────────────────────────────────────────────────────┤
│  1. User A and User B open Shared View at Revision 4.                  │
│  2. User B updates filter and clicks Save -> Succeeded (Revision 5).  │
│  3. User A adjusts filters and clicks Save with expectedVersion = 4.   │
│  4. Boundary detects conflict (Current 5 != Expected 4).               │
│  5. System Action:                                                     │
│     - Save rejected with CONFLICT error.                               │
│     - User A's working adjustments are PRESERVED locally in memory.    │
│     - UI surfaces Conflict Dialog with three safe recovery choices:    │
│                                                                        │
│       [ Reload Canonical ]                                             │
│       Discard local draft and load latest Revision 5.                  │
│                                                                        │
│       [ Save As New ]                                                  │
│       Preserve local working adjustments as an independent SavedView.  │
│                                                                        │
│       [ Reapply Against Latest ]                                       │
│       Rebase working changes against Revision 5 and commit with        │
│       expectedVersion = 5.                                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 15. Reference Degradation: Archived vs Deleted vs Inaccessible

The degradation of stale or restricted references follows explicit, non-broadening rules:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                    REFERENCE DEGRADATION MATRIX                        │
├──────────────────────┬─────────────────────────────────────────────────┤
│ Condition            │ Evaluated Behavior                              │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 1. Archived Entity   │ - Canonical reference still exists.             │
│    (Accessible)      │ - Filter continues to match per archive rules.  │
│                      │ - UI flags token as `[Archived <Entity>]`.      │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 2. Deleted / Removed │ - Reference is unresolvable.                    │
│    Entity/Field      │ - Predicate enters degraded state.              │
│                      │ - Fails closed (evaluates to false).            │
│                      │ - User receives explicit repair action.         │
│                      │ - Query NEVER silently drops predicate.         │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 3. Inaccessible      │ - Entity exists but viewer lacks RBAC access.   │
│    Entity (RBAC)     │ - Token renders safely as `[Unavailable]`.      │
│                      │ - Name of restricted entity is NEVER revealed.  │
│                      │ - Fails closed for that reference.              │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 4. Renamed Entity    │ - Canonical ID matches continuously.            │
│                      │ - Renders updated authorized name automatically.│
│                      │ - Requires no view definition modification.     │
└──────────────────────┴─────────────────────────────────────────────────┘
```

---

## 16. Save As vs Duplicate Semantics

```text
┌────────────────────────────────────────────────────────────────────────┐
│                       SAVE AS VS DUPLICATE MATRIX                      │
├─────────────────┬─────────────────────────┬────────────────────────────┤
│ Dimension       │ Save As                 │ Duplicate                  │
├─────────────────┼─────────────────────────┼────────────────────────────┤
│ Source Payload  │ Current WORKING DRAFT   │ Current PERSISTED          │
│                 │ (includes unsaved edits)│ CANONICAL DEFINITION       │
├─────────────────┼─────────────────────────┼────────────────────────────┤
│ New Identity    │ Unique ID generated     │ Unique ID generated        │
├─────────────────┼─────────────────────────┼────────────────────────────┤
│ Default Owner   │ Current actor           │ Current actor              │
├─────────────────┼─────────────────────────┼────────────────────────────┤
│ Default Scope   │ Private (Personal)      │ Private (Personal)         │
├─────────────────┼─────────────────────────┼────────────────────────────┤
│ Permissions/Favs│ Grants NOT copied;      │ Grants NOT copied;         │
│                 │ Favorite NOT copied     │ Favorite NOT copied        │
├─────────────────┼─────────────────────────┼────────────────────────────┤
│ Underlying Data │ ZERO items duplicated   │ ZERO items duplicated      │
└─────────────────┴─────────────────────────┴────────────────────────────┘
```

---

## 17. ActivityEvent Contract

Durable SavedView mutations generate canonical `ActivityEvent` records for team audit transparency:
- **Events Emitted:**
  - `saved_view.created`
  - `saved_view.updated` (persisted definition change)
  - `saved_view.access_changed` (scope or lock altered)
  - `saved_view.archived` / `saved_view.restored`
- **Events Excluded (Non-Events):** Temporary filter exploration, personal projection switching, collapsing group rows, personal execution, or opening inspectors never emit ActivityEvents.
- **Enterprise Law:** $\text{ActivityEvent} \neq \text{Enterprise Audit}$. Enterprise audit remains an independent compliance infrastructure concern.

---

## 18. Centralized Keyboard & Command Model

Physical key combinations are centralized; Saved Views define strictly semantic commands:
```text
views.open_directory      -> Route to VEW-001
views.create_new          -> Open Create View modal
views.save_changes        -> Persist dirty working state
views.revert_changes      -> Discard dirty working state
views.save_as_new         -> Fork working state into new view
views.toggle_filter       -> Focus visual filter builder
views.switch_projection   -> Cycle or select compatible projection
views.toggle_favorite     -> Star/unstar active view
```
*Typing Isolation:* All single-key commands are strictly disabled when focus is inside text inputs, filter fields, or editable cells.

---

## 19. Quick Create Decision

**CMD-002 Quick Create Decision for Saved Views:**
- **Decision:** **EXCLUDED FROM CORE QUICK CREATE.**
- **Rationale:** CMD-002 is designed for high-frequency operational capture (WorkItems, Documents, Issues). A Saved View is an analytical and architectural configuration entity requiring naming, query construction, and scope declaration. Creating views is anchored in `VEW-001` (`[ + New View ]`) and `VEW-002` (`[ Save As ]`). Integrating a view builder into the minimalist Quick Create modal introduces unnecessary interface bloat.

---

## 20. Scalability & Backend Query Compatibility

Saved Views require enterprise scalability without arbitrary item caps:
1. **Authoritative Query Translation:** `CompoundQuery`, `SortCriterion[]`, and `GroupCriterion` translate into authoritative backend query capabilities.
2. **Cursor Pagination & Stable Ordering:** Projection surfaces consume paginated cursors, ensuring performant memory utilization.
3. **Windowed Virtualization:** Reuses existing row virtualization in `WRK-001` and lane virtualization in `WRK-002`.
4. **Bounded Aggregation:** Summary counts and group totals are computed by the query engine without full client-side array hydration.

---

## 21. Component Architecture & Responsibility Separation

Responsibility boundaries follow the global architectural hierarchy:
$$\text{Design System} \rightarrow \text{Global Components} \rightarrow \text{Domain Features} \rightarrow \text{Page Components} \rightarrow \text{Routes}$$

```text
Conceptual Responsibilities (Implementation agnostic):
- SavedView Model & Validation: Pure schema definitions, validation, and serialization.
- Query Algebra Engine: Compound query tree evaluation, normalization, and fail-closed degradation.
- Filter Field Registry: Field metadata, type definitions, and operator compatibility.
- Access Evaluator: Capability derivation based on workspace tenancy, policy, and canonical team auth.
- Saved View Directory (VEW-001): Discovery, facet filtering, search, and management table.
- Saved View Execution Surface (VEW-002): Header, controls bar, projection container, and dirty-state manager.
- Filter Builder: Popover and recursive tree component for visual rule configuration.
- Concurrency Manager: Version checks, conflict interception, and recovery dialogs.
```

---

## 22. Scope Boundaries: CORE vs POST-CORE / FUTURE

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        SCOPE BOUNDARY TAXONOMY                         │
├────────────────────────────────────────────────────────────────────────┤
│  CORE (UI-09B Scope)                                                   │
│  - VEW-001 Saved Views Directory with discovery facets & search        │
│  - VEW-002 Detail surface driving compatible WRK-001, WRK-002, WRK-003 │
│  - Canonical SavedView model with versioned concurrency                │
│  - Compound Query Tree with fail-closed non-broadening degradation     │
│  - Filter Field Registry for WorkItems, Projects, and Initiatives      │
│  - Multi-criteria sorting and grouping dimensions                      │
│  - Dual-State View Editing (Saved vs Modified, Revert, Save, Save As)  │
│  - Private, Team, and Workspace access scopes                          │
│  - Early zero-leakage authorization filtering                          │
│  - Save As (working draft) vs Duplicate (persisted definition)         │
│  - Non-destructive archive and restore                                 │
│  - Generic Favorites integration (useFavorites)                        │
│  - Command Palette discovery and navigation                            │
│  - WorkItem Inspector (WRK-005) reuse for WorkItem views               │
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

## 23. Frozen vs Tunable Specifications

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FROZEN ARCHITECTURAL LAWS                       │
├────────────────────────────────────────────────────────────────────────┤
│ 1. A SavedView is a stored projection definition, NOT a data container.│
│ 2. Canonical domain state ownership is strictly preserved; views have   │
│    no internal entity mutation writers.                                │
│ 3. Pre-projection authorization filtering is mandatory (Zero-Leakage). │
│ 4. Invalid, deleted, or inaccessible references fail closed and NEVER   │
│    silently broaden query results.                                     │
│ 5. Context and access policy are distinct; context never infers access.│
│ 6. Team-context access delegates to canonical Team authorization.      │
│ 7. Resource & projection compatibility is strictly enforced; WRK-005 is│
│    exclusively for WorkItems.                                          │
│ 8. Shared definition, user preferences, and local draft are separated. │
│ 9. Temporary view changes do not auto-save to shared views.            │
│ 10. Optimistic concurrency with version N -> N+1 rejects stale writes;  │
│     blind overwrites are forbidden.                                    │
│ 11. Save As uses working draft; Duplicate uses persisted definition.   │
│ 12. Generic Favorites architecture (useFavorites) is reused unforked.  │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│                        TUNABLE IMPLEMENTATION                          │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Exact CSS styling, layout spacing tokens, and color values.         │
│ 2. Exact pixel viewport breakpoints for responsive layouts.            │
│ 3. Physical keyboard shortcut bindings in Command Palette.             │
│ 4. Exact URL route syntax and parameter serialization.                 │
│ 5. Specific file names, folder layout, and component factoring.        │
│ 6. Directory facet presentation (tabs, pills, dropdowns, sections).    │
│ 7. Query transport protocol and backend serialization formats.         │
│ 8. Virtualization row heights, lane widths, and buffer thresholds.     │
│ 9. Client-side caching and state store implementation.                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 24. Numbered Acceptance Criteria for UI-09B Implementation

When UI-09B is authorized, implementation must strictly prove:

1. **Canonical SavedView Model:** Instantiates workspace-scoped `SavedView` entity with ID, name, description, owner, target resource, context, query definition, sort/group criteria, display configuration, and access policy.
2. **Zero Resource Duplication:** Storing or executing a SavedView does not clone, cache, or duplicate canonical WorkItems, Projects, or Initiatives.
3. **VEW-001 Directory Surface:** Renders workspace-level Views Directory with high-density table, debounced search, context badges, and metadata columns.
4. **Discovery Facet Filtering:** Correctly filters directory items across `Favorites`, `My Views`, `Team Views`, `Workspace`, and `Archived`.
5. **VEW-002 Execution Surface:** Renders view header, controls bar, and canonical execution surface for the selected SavedView.
6. **Resource Compatibility Matrix:** Enforces valid resource/projection pairings; rejects unsupported combinations.
7. **Reused Execution Core (WRK-001):** Renders matching canonical items inside the unforked High-Density Grid with inline property pickers.
8. **Reused Kanban Board (WRK-002):** Renders matching canonical items inside the unforked Kanban Board with group-by-status/assignee lanes.
9. **Reused Timeline (WRK-003):** Renders matching canonical items/projects on the multi-quarter timeline with temporal milestones.
10. **Reused Inspector (WRK-005):** Clicking a WorkItem in any view projection opens the canonical slide-over Inspector without navigation or state loss.
11. **Non-WorkItem Detail Navigation:** Clicking a Project or Initiative in a view projection navigates to its canonical resource surface rather than opening WRK-005.
12. **Canonical Domain Mutation Delegation:** Editing an entity property inside a view projection delegates directly to the canonical domain mutation boundary (`updateWorkItem`, `applyProjectUpdate`, etc.).
13. **Compound Query Tree Evaluation:** Evaluates boolean queries with `AND`, `OR`, and nested rule groups accurately against live data.
14. **Fail-Closed Non-Broadening Degradation:** Invalid, deleted, or unresolvable filter predicates fail closed and never broaden query results.
15. **Inaccessible Reference Zero-Leakage:** Restricted entities referenced in filters render as `[Unavailable]` tokens without leaking names or metadata.
16. **Archived Reference Preservation:** Accessible archived entities referenced in filters remain structurally active and visually flagged.
17. **Typed Field Operators:** Enforces field-appropriate operators per the Filter Field Registry.
18. **Deterministic Multi-Sort:** Applies ordered multi-criteria sorting rules stably across rendered rows.
19. **Dynamic Grouping:** Groups projection rows/cards by chosen dimension (`status`, `priority`, `assignee`, `team`, `project`).
20. **Early Authorization Filtering (Zero-Leakage):** Unauthorized records are filtered out at the authoritative query boundary before projection or counting.
21. **Zero-Leakage Count Verification:** Result counts, group badges, and summary statistics reflect strictly authorized item totals.
22. **Zero-Leakage Autocomplete:** Filter candidate pickers strictly omit restricted project, team, and user names.
23. **Private View Isolation:** A `private` SavedView is discoverable and executable strictly by its owner; completely invisible to peers.
24. **Team View Tenancy & Auth:** A `team` SavedView is discoverable strictly by users satisfying canonical Team authorization.
25. **Context Independence:** Verifies that view context does not confer access to unauthorized underlying resources.
26. **Capability Enforcement:** Semantic capabilities (`canViewSavedView`, `canEditSavedView`, etc.) strictly guard edit, share, and archive controls.
27. **Dual-State View Model:** Modifying a filter in `VEW-002` immediately updates the active projection locally without auto-saving to the shared view.
28. **Visual Dirty Indicator:** Displays `● Modified` status and activates `Revert`, `Save`, and `Save As` buttons when local state diverges from persisted definition.
29. **Projection Switch Working State:** Switching projection lenses marks the view modified locally, requiring explicit Save to update shared default.
30. **Explicit Revert Workflow:** Clicking `Revert` discards all local working adjustments and cleanly restores the persisted view definition.
31. **Explicit Save Workflow:** Clicking `Save` commits working changes to canonical storage and bumps version $N \rightarrow N+1$.
32. **Save As Uses Working Draft:** Clicking `Save As` creates a new SavedView incorporating active unsaved filter/sort adjustments.
33. **Duplicate Uses Persisted Definition:** Invoking Duplicate clones the persisted canonical definition, ignoring unsaved working edits.
34. **Safe Duplicate Isolation:** Duplicated views default to private ownership with current actor and copy no access grants or favorite states.
35. **Optimistic Concurrency Protection:** Rejects stale-write saves when expectedVersion does not match current canonical version.
36. **Safe Conflict Recovery:** Surfaces conflict recovery options (Reload Canonical, Save As New, Reapply Against Latest) without blind overwriting.
37. **Owner Departure Governance:** Shared views remain manageable when an owner departs via governance capability reassignment.
38. **Non-Destructive Archive & Restore:** Archiving hides the view from directory and search; restoring returns it to active state.
39. **Generic Favorites Integration:** Starring a view integrates with canonical `useFavorites` hook and surfaces view under `FAVORITES` sidebar section.
40. **Command Palette Integration:** Authorized views are searchable and executable from `CMD-001` Command Palette without restricted view leakage.
41. **Durable ActivityEvents:** Canonical `ActivityEvent` records are emitted for view creation, shared updates, and archiving, but excluded for transient actions.
42. **Centralized Keyboard Scope:** Semantic keyboard commands operate correctly and single-key navigation is isolated when typing inside editable controls.
43. **Scalable Query Compatibility:** View query execution is compatible with cursor pagination and windowing without arbitrary item caps.
44. **Scope Boundary Enforcement:** POST-CORE capabilities (public links, automated digests, AI queries) and Quick Create creation remain completely absent.
45. **Frozen Regression Stability:** All previously frozen regression suites remain 100% green without modification.

---

# HUMAN REVIEW — UI-09A SAVED VIEWS CONTRACT CORRECTION PASS 01A
