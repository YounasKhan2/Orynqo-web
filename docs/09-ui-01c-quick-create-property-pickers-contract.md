# ORYNQO — PRODUCT SPECIFICATION & INTERACTION CONTRACT
# UI-01C: Quick Create & Universal Property Picker System

**Document ID:** `docs/09-ui-01c-quick-create-property-pickers-contract.md`  
**Status:** DRAFT FOR HUMAN REVIEW  
**Authoritative Working Branch:** `design/ui-01c-quick-create-property-pickers`  
**Parent / Frozen Baseline:** `feat/ui-01b-high-density-grid` (`75387c1`)  
**Design Phase Gate:** `# HUMAN REVIEW — UI-01C DESIGN`

---

## 1. Phase Status & Frozen Dependencies

### 1.1 Status
This document establishes the authoritative product, interaction, and component architecture contract for **UI-01C: Quick Create + Universal Property Pickers**. It serves as the bridge between the frozen WorkItem contract (UI-01A) and Data Grid (UI-01B), eliminating ad-hoc prototype dropdowns and establishing a single canonical property interaction substrate across Orynqo.

### 1.2 Frozen Upstream Baselines
- **Architecture Stabilization 01 / 01A:** Frozen in `refactor/architecture-stabilization-01`.
- **IA-01 / IA-02 / IA-03 / IA-03A:** Complete Page & Surface Registry frozen in [`docs/06-complete-page-and-surface-registry.md`](file:///d:/Full_Stack_Apps/Orynqo-web/docs/06-complete-page-and-surface-registry.md).
- **UI-01A (WorkItem Contract & Inspector):** Frozen at commit `af9178a`. Established canonical WorkItem data model, single-source-of-truth fields (`parentId`, `relations`, `documentLinks`), and Inspector drawer.
- **UI-01B (Universal High-Density Data Grid):** Frozen at commit `75387c1`. Established 28px/34px data grid projection, controlled/uncontrolled selection laws, roving tabindex keyboard navigation, optimistic overrides with failure rollback, and end-to-end bulk action outcomes.

---

## 2. Product Objective & Governing Principles

### 2.1 The Problem
Prior to UI-01C, property editing across Orynqo was fragmented:
1. `WorkItemProperties.jsx` (Inspector) rendered local dropdown menus for Status and Priority while leaving other fields non-interactive.
2. `DataGridCell.jsx` (Grid) duplicated local status and priority listboxes with separate keyboard and click handling.
3. `CreateItemModal.jsx` used primitive native `<select>` tags, hardcoded initial mock data, lacked status/cycle/label pickers, and had no context inheritance.

### 2.2 Core Governing Principle
> **One property interaction contract, many presentation contexts.**

Every WorkItem property interaction across Orynqo—whether invoked inside the WorkItem Inspector, directly inside a 28px Data Grid cell, within the rapid Quick Create dialog, or in future Kanban/Timeline/Triage surfaces—must share the exact same underlying conceptual architecture, keyboard semantics, permission guards, and mutation dispatch pipeline.

---

## 3. Universal Property Picker Architecture

### 3.1 Conceptual Decomposition
The Universal Property Picker system decouples the **Trigger**, the **Presentation Shell**, the **Listbox/Search Engine**, and the **Domain Property Adapter**:

```text
[ PropertyTrigger ] (Badge, Avatar, Button, or Grid Cell Anchor)
        │  Click / Keyboard Hotkey ('s', 'p', 'a', etc.)
        ▼
[ PropertyPicker Popover / Command Sheet ] (Overlay with Focus Trap & Keyboard Scope)
        ├── [ PickerSearchInput ] (Filtered input with auto-focus & clear)
        ├── [ PickerSection ] (e.g., Status Category, Active vs Backlog Cycles)
        │       ├── [ PickerOption ] (Icon/Badge + Label + Shortcut + Selection Checkmark)
        │       └── [ PickerOption ]
        ├── [ PickerEmptyState ] (No results, Restricted indicator, or Create Action)
        └── [ PickerFooter ] (Navigation shortcuts hint: ↑↓ to navigate, ↵ to select, Esc to close)
```

### 3.2 Generic Component Primitives (`src/components/property-picker/`)
Generic picker primitives reside at the product-component boundary and contain **zero WorkItem business logic**:

1. `PropertyTrigger`: Focusable semantic button representing current value (badge, user avatar, text) with dropdown indicator and disabled/read-only styling.
2. `PropertyPicker`: Context-aware anchored popover / floating overlay managed with collision-aware positioning (`@floating-ui` or portal boundary).
3. `PropertyPickerSearch`: Search input with keyboard interception (ArrowDown jumps to first option; Escape closes picker).
4. `PropertyPickerList`: ARIA-compliant `role="listbox"` container with virtualized or standard roving option focus.
5. `PropertyPickerOption`: ARIA `role="option"` with `aria-selected`, keyboard active highlight, leading icon/badge, title, description, and trailing checkmark.
6. `PropertyPickerSection`: Group header with `role="group"` and `aria-label` for categorized lists (e.g., Status categories: To Do, In Progress, Done).
7. `PropertyPickerEmptyState`: Graceful fallback for empty search results or permission-blocked queries.

### 3.3 Domain Adapter Contract (`src/features/work-items/property-pickers/`)
Each WorkItem property is defined by a declarative adapter configuration:

```typescript
interface PropertyAdapter<TValue, TOption> {
  propertyKey: string;
  label: string;
  isMultiSelect: boolean;
  isSearchable: boolean;
  isClearable: boolean;
  loadOptions: (query: string, context: PropertyContext) => Promise<TOption[]> | TOption[];
  getOptionKey: (option: TOption) => string;
  getOptionLabel: (option: TOption) => string;
  renderOption: (option: TOption, isSelected: boolean) => React.ReactNode;
  renderTrigger: (value: TValue, isReadOnly: boolean) => React.ReactNode;
  validateSelection?: (option: TOption, context: PropertyContext) => { valid: boolean; reason?: string };
}
```

---

## 4. Required CORE Pickers Specification

| Property | Value Type | Selection Mode | Searchable | Grouping / Structure | Dependency Invariants |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **WorkItem Type** | `CoreItemType` | Single | No | Task, Issue, Bug (Milestone & Doc excluded) | Read-only once committed if cross-type schema differs |
| **Status** | `string` (status key) | Single | Filterable | Grouped by `statusCategory` (unstarted, started, completed, cancelled) | Dependent on Team workflow configuration |
| **Priority** | `PriorityLevel` | Single | No | 5 levels: Urgent, High, Medium, Low, None | Canonical semantic values; ordering derived |
| **Assignee** | `string \| null` | Single | Yes (Async) | Unassigned, Workspace Members, Team Members | Resolves avatar, email, name; server-search ready |
| **Team** | `string` | Single | Yes | Accessible Workspace Teams | **Primary Owner**. Invalidates Cycles, Projects, Statuses |
| **Project** | `string \| null` | Single | Yes | Recent Projects, Active Team Projects, All Projects, None | Multi-team resource; filtered by Workspace permissions |
| **Cycle** | `string \| null` | Single | Filterable | Current Active Cycle, Upcoming Cycles, Backlog / No Cycle | Strictly Team-owned; depends on selected `teamId` |
| **Labels** | `string[]` | Multi | Yes | Categorized Labels, Selected chips | Supports tag toggling, removal, creation if authorized |
| **Dates** | `string \| null` | Single | Relative shortcuts | Today, Tomorrow, Next Week, Custom Calendar, Clear | ISO-8601 `YYYY-MM-DD`; no complex recurring rules |

### 4.1 WorkItem Type Picker
- **Options:** Strictly `Task`, `Issue`, `Bug`.
- **Invariants:** 
  - `Milestone` is a separate planning entity and MUST NOT appear.
  - `Document` is a knowledge resource and MUST NOT appear.
  - Legacy `feature` and `chore` types are strictly prohibited.
- **Trigger:** Type badge with semantic icon and label.

### 4.2 Status Picker
- **Options:** Concrete workflow statuses defined for the active team (e.g. `backlog`, `todo`, `in_progress`, `in_review`, `done`, `cancelled`).
- **Grouping:** Options are visually grouped by resolved `statusCategory`. Users select the concrete `status`; `statusCategory` is automatically derived.
- **Invariants:** No cycling on click. Selecting an option immediately dispatches a canonical mutation.

### 4.3 Priority Picker
- **Options:** 5 semantic levels in strict hierarchy:
  1. `Urgent` (red double chevron)
  2. `High` (orange 3-bar signal)
  3. `Medium` (amber 2-bar signal)
  4. `Low` (blue 1-bar signal)
  5. `None` (subtle gray dash)
- **Invariants:** Users select semantic priority; numeric ordering values are internal implementation details.

### 4.4 Assignee Picker
- **Options:** `Unassigned` anchor at the top, followed by workspace/team members.
- **Search:** Instant client search for current members; query boundary abstracts async pagination for enterprise scaling.
- **Representation:** Displays avatar (`UserAvatar`), display name, and handle.
- **Zero-Leakage:** Restricted user accounts or external guest accounts hidden unless explicitly shared.

### 4.5 Team Picker (Ownership Root)
- **Role:** WorkItem ownership root (`workspaceId`, `teamId`).
- **Options:** Teams the user has write/create access to within the current workspace.
- **Dependent Consequences:** Changing Team triggers dependency validation (see Section 8).

### 4.6 Project Picker
- **Role:** Cross-functional initiative deliverable grouping.
- **Options:** `No Project` option, followed by active projects. Projects are workspace resources and may span multiple teams.

### 4.7 Cycle Picker
- **Role:** Time-boxed iteration container.
- **Invariants:** Cycles are strictly Team-owned. The Cycle picker queries only cycles belonging to the item's `teamId`.
- **Options:** `Current Cycle (Cycle 42)`, `Next Cycle (Cycle 43)`, `Upcoming`, and `No Cycle / Backlog`.

### 4.8 Labels Picker (Multi-Select)
- **Selection Mode:** Multi-select toggle list.
- **Interaction:** Clicking an option toggles membership without closing the picker. Trailing checkmarks show active state.
- **Keyboard:** Typing filters labels. `Enter` toggles focused label. `Backspace` when search is empty removes the last active tag.
- **Creation:** If search query does not match existing labels and user has `create_label` permission, shows `Create label "{query}"`.

### 4.9 Dates Picker (Due Date / Start Date)
- **Interaction:** Anchored popover offering instant semantic shortcuts (`Today`, `Tomorrow`, `Next Monday`, `End of Sprint`, `Clear Date`) plus a high-density month calendar grid.
- **Output:** ISO-8601 date string `YYYY-MM-DD` or `null`.

---

## 5. Picker Presentation Modes

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ PRESENTATION MODES                                                          │
├────────────────────────┬─────────────────────────┬──────────────────────────┤
│ Anchored Popover       │ Command-Style Overlay   │ Compact Mobile Sheet     │
├────────────────────────┼─────────────────────────┼──────────────────────────┤
│ Desktop Inspector,     │ Keyboard accelerators   │ Viewports < 768px;       │
│ Data Grid cells,       │ inside Quick Create     │ Full-width bottom drawer │
│ Action Strip filters   │ and Command Palette     │ with touch-target sizing │
│ Dense: 220px-260px     │ Width: 320px-400px      │ Height: Auto / 50vh max  │
└────────────────────────┴─────────────────────────┴──────────────────────────┘
```

1. **Anchored Popover (Desktop Default):** Floats adjacent to the triggering cell or badge. Max height 280px with scroll. Collision-aware edge flipping.
2. **Command-Style Picker:** Centered or docked within Quick Create modal. Keyboard-first navigation directly from property accelerator triggers.
3. **Compact Mobile Sheet:** Rendered via bottom sheet drawer for touch interfaces (<768px). Search input anchored at top, large touch targets (40px).

---

## 6. Search, Scale & Query Boundary

To guarantee sub-50ms responsiveness on both small local prototype datasets and 100,000-user enterprise workspaces, the picker query boundary enforces:

1. **Static Option Sets (Type, Priority, Status):** Synced synchronously in memory. Search filter runs locally in O(N) where N ≤ 10.
2. **Dynamic / Scaled Option Sets (Assignee, Project, Labels):**
   - Managed via a standardized `OptionSource<T>` contract.
   - Initial render displays recent/suggested options.
   - Typing triggers debounced search query.
   - Supports async pagination / cursor fetching without freezing UI.
   - Loading skeleton and retryable error state built into `PropertyPickerList`.

---

## 7. Keyboard & Focus Contracts

### 7.1 Keyboard Interaction Matrix

| Key | Inside Trigger (Closed) | Inside Picker Search (Open) | Inside Options List (Open) |
| :--- | :--- | :--- | :--- |
| `Enter` / `Space` | Opens picker popover | Selects currently focused option | Commits selection & closes (single) / toggles (multi) |
| `ArrowDown` | Opens picker popover | Moves focus to first option | Moves focus to next option (with wrapping) |
| `ArrowUp` | Opens picker popover | Moves focus to last option | Moves focus to previous option |
| `Escape` | No-op / closes parent modal | Closes picker popover | Closes picker popover |
| `Tab` | Advances to next UI field | Closes picker & tabs to next field | Closes picker & tabs to next field |
| `Backspace` | No-op | Deletes char / removes last multi-tag | Deletes multi-select tag if search empty |
| `Typing (a-z)` | Roving hotkey (if in grid) | Appends to search query | Jumps to search input and searches |

### 7.2 Focus Retention & Restoration Invariants
1. **Trigger Opening:** When opened via click or keyboard, focus immediately moves to the `PickerSearchInput` (if searchable) or the currently selected `PickerOption`.
2. **Dismissal / Selection:** When the picker closes (via option selection, `Escape`, or outside click), **DOM focus is deterministically restored to the originating `PropertyTrigger`**.
3. **Keyboard Scope Hierarchy:** While open, the picker registers itself in the `OVERLAY` keyboard scope. Global application hotkeys (`c`, `g i`, `j/k` row navigation) are completely suppressed until closed.

---

## 8. Permissions, Zero-Leakage & Dependent Properties

### 8.1 Permission Invariants
- **Read-Only Items (`isReadOnly: true`):** Property triggers are disabled, styled with muted borders, and omit dropdown chevrons. Keyboard trigger hotkeys do not fire.
- **Granular Field Permissions:** If user has edit rights for title but cannot reassign (e.g. guest role), Assignee trigger renders disabled with a tooltip explaining permission constraint.
- **Zero-Leakage Invariant:** Restricted WorkItems, internal security projects, or confidential users MUST NOT appear in picker search results or option lists. Disabled options never leak metadata.

### 8.2 Dependent-Property Contract & Cascading Changes
WorkItem properties form a directional dependency graph rooted in `workspaceId` and `teamId`:

```text
            [ Workspace ]
                 │
           [ Team Owner ] ◄── Root of Execution Context
           /     │      \
     [ Status ]  │   [ Cycle ] (Strictly Team-owned)
                 │
           [ Project ] (Workspace resource; filtered by Team access)
                 │
          [ WorkItem ]
```

When a user modifies **Team**:
1. **Status Compatibility:** If the current status does not exist in the target Team's workflow, it maps to the default status of the same `statusCategory` (e.g., `in_progress` -> `in_progress`), or defaults to `todo`.
2. **Cycle Invalidation:** Cycles do NOT cross team boundaries. Changing Team automatically resets `cycleId` to `null` (Backlog) and presents an inline notification.
3. **Project Relevance:** If the selected Project is restricted to the previous Team, the user is warned: *"Project {Name} is not associated with Team {NewTeam}. Keep or clear?"*.
4. **Destructive Guard:** Cascading changes are atomic. They are presented in a confirmation prompt before the mutation commits.

---

## 9. Quick Create Architecture

### 9.1 Objective
Quick Create is Orynqo's primary vehicle for rapid work item capture. It must execute with zero lag, minimal visual distraction, and complete keyboard fluidity:

> **Open (`C`) → Type Title → Set Priority/Assignee via accelerators → Submit (`⌘↵`) → Instant Return.**

### 9.2 Form Hierarchy
Quick Create maintains high visual density without overwhelming the user:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  QUICK CREATE WORK ITEM                                            [Esc]    │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Type: Task ▾]  [Team: Core Platform ▾]                                    │
│                                                                             │
│  Issue title or deliverable...                                              │
│                                                                             │
│  [Optional description / acceptance criteria markdown...]                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  PROPERTIES:                                                                │
│  [Status: Todo ▾]  [Priority: Urgent ▾]  [Assignee: Younas ▾]  [Proj: None ▾]│
│  [Cycle: Cycle 42 ▾]  [Labels: + Add ▾]  [Due Date: None ▾]                │
├─────────────────────────────────────────────────────────────────────────────┤
│  Mode: [x] Create another                Press ⌘↵ to create • Esc to cancel │
│  [Cancel]                                             [ Create Work Item ]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **Header / Identity Tier:** Type Picker + Team Picker (establishes execution context).
2. **Primary Content Tier:** Auto-focused Title input + expandable Description editor.
3. **Property Strip Tier:** Universal Property Pickers displayed as compact badges.
4. **Action & Acceleration Tier:** Submission buttons + `Create another` toggle + keyboard hints.

### 9.3 Context Precedence Model
When Quick Create opens, initial property values are resolved deterministically:

$$\text{Active Value} = \text{Explicit Choice} \succ \text{Invocation Context} \succ \text{Session Defaults} \succ \text{Team Defaults}$$

- **From Team View:** `teamId` prefilled to active team.
- **From Project View:** `projectId` prefilled; `teamId` defaults to project's lead team.
- **From Active Cycle:** `teamId` and `cycleId` prefilled.
- **From Global Shortcut (`C`):** `teamId` inherits active sidebar team; `status` = `todo`; `priority` = `medium`.

---

## 10. Submission, Modes & Resilience

### 10.1 Creation Modes
1. **Create & Close (Default):** Creates the item in canonical store, clears modal, and returns focus to previous surface.
2. **Create & Open:** Creates item, closes Quick Create, and immediately opens the newly created WorkItem in the Inspector drawer.
3. **Create Another (Power-User Toggle):** Creates item, dispatches success banner, resets Title and Description, retains Team/Project/Cycle/Assignee context, and refocuses Title input for subsequent creation.

### 10.2 In-Flight Protection & Deduplication
- Submitting via `⌘↵` or clicking Create sets `isSubmitting = true`.
- Subsequent Enter keypresses or clicks while in-flight are ignored.
- The submit button transitions to a compact spinner state without shifting layout.

### 10.3 Failure Preservation & Rollback
If network or server validation fails:
- Quick Create **remains open**.
- User input (Title, Description, selected pickers) is **100% preserved**.
- An inline error banner displays authoritative failure reason.
- Focus returns to Title input. No phantom items remain in the UI.

---

## 11. Component Hierarchy & Clean Dependencies

```text
src/
├── design-system/primitives/         # Buttons, Badges, Inputs, Dialogs (No business logic)
├── components/property-picker/       # Generic Universal Picker Engine
│   ├── PropertyTrigger.jsx           # Base trigger button with badge/icon slots
│   ├── PropertyPicker.jsx            # Anchored popover / floating overlay
│   ├── PropertyPickerSearch.jsx      # Auto-focused search input
│   ├── PropertyPickerList.jsx        # ARIA listbox container
│   ├── PropertyPickerOption.jsx      # Selectable option with checkmark
│   ├── PropertyPickerSection.jsx     # Category header
│   └── PropertyPickerEmptyState.jsx  # Empty / restricted state
├── features/work-items/
│   ├── property-pickers/             # WorkItem Domain Adapters
│   │   ├── TypePicker.jsx            # Task, Issue, Bug
│   │   ├── StatusPicker.jsx          # Workflow statuses grouped by category
│   │   ├── PriorityPicker.jsx        # Urgent, High, Medium, Low, None
│   │   ├── AssigneePicker.jsx        # User selection with avatars & search
│   │   ├── TeamPicker.jsx            # Workspace team selection
│   │   ├── ProjectPicker.jsx         # Project selection
│   │   ├── CyclePicker.jsx           # Team cycles selection
│   │   ├── LabelsPicker.jsx          # Multi-select label tagger
│   │   └── DatePicker.jsx            # Due date / Start date picker
│   └── quick-create/
│       ├── QuickCreateDialog.jsx     # Main dialog orchestration
│       ├── QuickCreateForm.jsx       # Title, description, and property strip
│       └── useQuickCreate.js         # Context inheritance & submission state hook
```

**Architectural Rule:**  
`src/components/property-picker/` CANNOT import from `features/work-items`.  
`features/work-items/property-pickers/` imports from `components/property-picker/` and `constants/workItems`.  
`QuickCreate` and `DataGridCell` and `WorkItemProperties` consume `features/work-items/property-pickers/`.

---

## 12. Migration Plan for UI-01A & UI-01B

To prevent code duplication, existing components will be migrated during implementation:

1. **`CreateItemModal.jsx`:** **REPLACE completely** with `QuickCreateDialog.jsx`. The prototype `<select>` inputs and fake ID generators are decommissioned.
2. **`WorkItemProperties.jsx` (Inspector):** Refactor property rows to replace custom `openDropdown` state with universal property picker adapters (`<StatusPicker>`, `<PriorityPicker>`, `<AssigneePicker>`, etc.).
3. **`DataGridCell.jsx` (Data Grid):** Replace inline dropdown menus for status and priority with universal property triggers in anchored popover mode.

---

## 13. Resolution of the 19 Required Product Decisions

| # | Topic | Authoritative Decision |
| :--- | :--- | :--- |
| **1** | Generic PropertyPicker Boundary | Generic picker engine resides in `src/components/property-picker/` with zero domain coupling. Handles ARIA, keyboard navigation, popovers, and option highlighting. |
| **2** | Domain Picker Configuration | WorkItem-specific pickers reside in `src/features/work-items/property-pickers/`, configuring options, icons, and mutation contracts. |
| **3** | Sync vs Async Option Sourcing | Small enums (Type, Priority, Status) are synchronous. Scaled entities (Assignee, Project, Labels) use an async-capable query contract with debounce. |
| **4** | Single vs Multi-Select API | Unified engine supports `isMultiSelect` prop. Single-select closes on option click; multi-select toggles checkmark without closing popover. |
| **5** | Focus Restoration Contract | Closing picker (selection or cancellation) deterministically restores DOM focus to the originating `PropertyTrigger`. |
| **6** | Dependent-Property Behavior | Property dependencies are declared in the domain adapter. Breaking changes trigger confirmation prompts before mutation commits. |
| **7** | Team-Change Consequences | Team change invalidates Cycle (cleared to Backlog) and re-evaluates Status to default in matching category. |
| **8** | Quick Create Context Inheritance | Strictly deterministic precedence: Explicit User Choice > Invocation View Context > Session Defaults > Team Defaults. |
| **9** | Minimum Required Creation Fields | Only **Title** and **Team** are strictly mandatory. All other properties provide safe defaults (`Task`, `Todo`, `Medium`, `Unassigned`). |
| **10** | Create & Close Behavior | Standard default. Creates item, displays toast, closes modal, restores focus to grid/view. |
| **11** | Create & Open Behavior | Supported via secondary action button / split shortcut (`⌘⇧↵`). Opens newly created item in Inspector drawer. |
| **12** | Create Another Decision | **CORE capability**. Checkbox in footer allows continuous creation without closing modal, preserving contextual team/project fields. |
| **13** | Optimistic Creation Decision | **DEFERRED for Quick Create**. Quick Create awaits authoritative in-memory store creation before closing or resetting, preventing phantom items. |
| **14** | Failed Creation Behavior | 100% form preservation. Form remains open, error banner displays, focus returns to title for immediate retry. |
| **15** | Duplicate-Submit Protection | Submit button enters disabled loading state immediately upon trigger. Subsequent Enter keys are suppressed while in-flight. |
| **16** | Desktop Presentation | Centered, compact modal dialog (560px width) with property badges in an inline horizontal strip. |
| **17** | Mobile Presentation | Responsive bottom sheet drawer (<768px) with full-width stacked property selectors. |
| **18** | UI-01A/UI-01B Migration | Both Inspector and Grid will consume the universal domain pickers in implementation phase, deprecating local dropdown code. |
| **19** | Existing `CreateItemModal` | **REPLACE**. Decommission prototype modal in favor of modular `QuickCreateDialog`. |

---

## 14. Required Product Flows Verification

1. **Flow 1 — Grid Status Change:** User clicks status badge in row -> Anchored status picker opens -> User navigates with Arrow keys to `Done` -> Press `Enter` -> Status updates optimistically in grid -> Popover closes -> Row retains roving focus.
2. **Flow 2 — Inspector Assignee Change:** User opens Inspector -> Clicks Assignee trigger -> Searchable picker opens -> Types "Younas" -> Debounced filter highlights matching member -> User presses `Enter` -> Canonical mutation dispatches -> Inspector badge & grid cell update simultaneously.
3. **Flow 3 — Quick Create from Team View:** User is in Team Web -> Presses `C` -> Quick Create opens with `Team: Web` prefilled -> User types "Add Web Worker telemetry" -> Hits `⌘↵` -> Item created in Team Web -> Modal closes -> Grid scrolls to new item.
4. **Flow 4 — Quick Create from Project:** User is in Project Auth V2 -> Presses `C` -> Quick Create opens with `Project: Auth V2` prefilled -> Associated team prefilled -> User enters title and creates.
5. **Flow 5 — Cycle Selection with Team Dependency:** User opens Cycle picker -> Only cycles matching the item's `teamId` are listed -> Selecting `Cycle 42` attaches item to the active sprint.
6. **Flow 6 — Multi-Label Tagging:** User opens Labels picker -> Types "ui" -> Press `Enter` to toggle `ui` -> Types "perf" -> Press `Enter` to toggle `perf` -> Press `Escape` -> Both labels committed to item.
7. **Flow 7 — Permission Revocation:** User attempts to edit property on read-only item -> Trigger is disabled; no picker opens; tooltip communicates read-only constraint.
8. **Flow 8 — Failed Creation Preservation:** Network error occurs during creation -> Error banner displays "Database sync timed out" -> Title, description, and chosen properties remain intact in form.
9. **Flow 9 — Pure Keyboard Creation:** Press `C` -> Focus in Title -> Type title -> Press `Tab` to navigate to Priority -> Press `p` to open Priority picker -> ArrowDown to `Urgent` -> `Enter` -> `⌘↵` -> WorkItem created.
10. **Flow 10 — Mobile Quick Create:** Viewport at 375px width -> Tap floating action button -> Bottom sheet slides up with stacked full-width touch pickers -> Save creates item and dismisses sheet.

---

## 15. Visual Design States & Coverage

The accompanying UI-01C visual design artifact illustrates all 23 core system states across Universal Pickers and Quick Create:

### Universal Property Pickers
1. Closed Property Trigger (Badge / Avatar / Text)
2. Open Single-Select Picker Popover
3. Searchable Picker with Active Query Filter
4. Keyboard-Focused Option Highlight (`tabindex="0"`)
5. Selected Option State with Trailing Checkmark
6. Clearable Value Option (`Unassigned` / `No Project`)
7. Multi-Select Labels Picker with Active Tags
8. Asynchronous Option Loading State (Skeleton)
9. Empty Search Results State
10. Option Load Error / Retry State
11. Read-Only / Disabled Trigger State
12. Zero-Leakage Restricted Option State
13. Compact Mobile Bottom Sheet Presentation

### Quick Create
14. Default Quick Create Desktop Dialog (Clean, calm, semantic dark theme)
15. Context-Inherited Quick Create (Team Pre-selected)
16. Context-Inherited Quick Create (Project Pre-selected)
17. Property Picker Nested & Opened inside Quick Create
18. Client Validation State (Missing Title / Error outline)
19. Submission In-Flight State (Loading spinner, double-submit lock)
20. Creation Failure State (Preserved input + Error notification banner)
21. Successful Creation / Create & Close State
22. Create & Open Inspector Behavior
23. Responsive Mobile Fullscreen Quick Create Sheet

---

## 16. Human Review Gate

**STOP AT THIS GATE.**  
Do NOT implement production code for UI-01C until this product interaction contract and visual design artifact have received explicit Human Review and approval.
