# ORYNQO — PRODUCT SPECIFICATION & INTERACTION CONTRACT
# UI-01C: Quick Create & Universal Property Picker System

**Document ID:** `docs/09-ui-01c-quick-create-property-pickers-contract.md`  
**Phase Status:** DRAFT FOR HUMAN REVIEW — UI-01C DESIGN CORRECTION PASS 01A  
**Authoritative Working Branch:** `design/ui-01c-quick-create-property-pickers`  
**Parent / Frozen Baseline:** `feat/ui-01b-high-density-grid` (`75387c1`)  
**Design Phase Gate:** `# HUMAN REVIEW — UI-01C DESIGN CORRECTION PASS 01A`

---

## 1. Phase Status & Frozen Dependencies

### 1.1 Status & Purpose
This document establishes the authoritative product contract, interaction specification, and component architecture for **UI-01C: Quick Create + Universal Property Pickers (Design Correction Pass 01A)**. It supersedes initial drafting inconsistencies regarding Team-change cascades, Project-team resolution, Status option sourcing, picker commit ownership, and performance contract wording.

### 1.2 Frozen Upstream Baselines (STRICTLY PRESERVED)
- **Architecture Stabilization 01 / 01A:** Frozen in `refactor/architecture-stabilization-01`.
- **IA-01 / IA-02 / IA-03 / IA-03A:** Complete Page & Surface Registry frozen in [`docs/06-complete-page-and-surface-registry.md`](file:///d:/Full_Stack_Apps/Orynqo-web/docs/06-complete-page-and-surface-registry.md).
- **UI-01A (WorkItem Contract & Inspector):** Frozen at commit `af9178a`. Established the canonical single-source-of-truth WorkItem schema (`Task`, `Issue`, `Bug`, `parentId`, `relations`, `documentLinks`) and Inspector drawer.
- **UI-01B (Universal High-Density Data Grid):** Frozen at commit `75387c1`. Established 28px/34px data grid projection, controlled/uncontrolled selection laws, roving tabindex keyboard navigation, optimistic overrides with failure rollback, and end-to-end bulk action outcomes.

---

## 2. Product Objective & Governing Principles

### 2.1 The Problem
Prior to UI-01C, property interaction across Orynqo suffered from duplicate, ad-hoc implementations:
1. `WorkItemProperties.jsx` (Inspector) rendered local dropdown menus for Status and Priority while other attributes remained non-interactive badges.
2. `DataGridCell.jsx` (Grid) duplicated local status and priority listboxes with separate keyboard and click handling.
3. `CreateItemModal.jsx` relied on primitive native `<select>` tags, hardcoded initial mock data, lacked status/cycle/label pickers, and had no context inheritance.

### 2.2 Core Governing Principle
> **One property interaction contract, many presentation contexts.**

Every WorkItem property interaction across Orynqo—whether invoked inside the WorkItem Inspector, directly inside a 28px Data Grid cell, within the rapid Quick Create dialog, or in future Kanban/Timeline/Triage surfaces—must share the exact same underlying conceptual architecture, keyboard semantics, permission guards, and intent emission contracts.

---

## 3. Universal Property Picker Architecture

### 3.1 Conceptual Decomposition
The Universal Property Picker system cleanly separates the **Trigger Anchor**, the **Presentation Shell**, the **Listbox/Search Engine**, and the **Domain Property Adapter**:

```text
[ PropertyTrigger ] (Badge, Avatar, Button, or Grid Cell Anchor)
        │  Click / Keyboard Hotkey ('s', 'p', 'a', etc.)
        ▼
[ PropertyPicker Popover / Command Sheet ] (Overlay with Focus Trap & OVERLAY Keyboard Scope)
        ├── [ PickerSearchInput ] (Filtered input with auto-focus & clear)
        ├── [ PickerSection ] (e.g., Status Categories, Active vs Upcoming Cycles)
        │       ├── [ PickerOption ] (Icon/Badge + Label + Shortcut + Selection Checkmark)
        │       └── [ PickerOption ]
        ├── [ PickerEmptyState ] (No results, Protected Reference indicator, or Create Action)
        └── [ PickerFooter ] (Navigation shortcuts hint: ↑↓ to navigate, ↵ to select, Esc to close)
```

### 3.2 Generic Component Primitives (`src/components/property-picker/`)
Generic picker primitives reside at the product-component boundary and contain **zero WorkItem domain logic**:
1. `PropertyTrigger`: Focusable semantic button representing current value (badge, user avatar, text) with dropdown indicator and disabled/read-only styling.
2. `PropertyPicker`: Context-aware anchored popover / floating overlay managed with collision-aware positioning.
3. `PropertyPickerSearch`: Search input with keyboard interception (ArrowDown jumps to first option; Escape closes picker).
4. `PropertyPickerList`: ARIA-compliant `role="listbox"` container with virtualized or standard roving option focus.
5. `PropertyPickerOption`: ARIA `role="option"` with `aria-selected`, keyboard active highlight, leading icon/badge, title, description, and trailing checkmark.
6. `PropertyPickerSection`: Group header with `role="group"` and `aria-label` for categorized lists.
7. `PropertyPickerEmptyState`: Graceful fallback for empty search results or protected entity notices.

### 3.3 Domain Adapter Contract (`src/features/work-items/property-pickers/`)
The `PropertyAdapter` interface specifies **responsibilities and behavioral invariants**, without freezing concrete React rendering signatures or component JSX types prematurely:

- **Property Identity:** Canonical WorkItem field name (e.g., `status`, `priority`, `assigneeId`, `teamId`).
- **Selection Semantics:** Single-select vs. Multi-select (`isMultiSelect`).
- **Option Identity & Labels:** Unique option identifier and semantic human-readable label.
- **Option Sourcing:** Sync vs. async query delegation via the `OptionSource` boundary.
- **Search Capability:** Flag indicating if option list supports active text filtering.
- **Clearability:** Whether the property can be unassigned/cleared (e.g., `assigneeId = null`, `cycleId = null`).
- **Permission Awareness:** Evaluation of whether the current user may mutate this specific property.
- **Contextual Dependencies:** Declaration of upstream dependencies (e.g., Cycle depending on Team).
- **Selection Intent:** Emits semantic property change intent (`onSelect(value)`) rather than mutating domain state directly.

---

## 4. Required CORE Pickers Specification

| Property | Value Type | Selection Mode | Searchable | Grouping / Structure | Dependency Invariants |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **WorkItem Type** | `CoreItemType` | Single | No | Task, Issue, Bug (Milestone & Doc strictly excluded) | Static semantic enum; read-only once committed if schema differs |
| **Status** | `string` (status key) | Single | Filterable | Grouped by `statusCategory` (unstarted, started, completed, cancelled) | **Context/Configuration-driven** from active Team workflow |
| **Priority** | `PriorityLevel` | Single | No | 5 levels: Urgent, High, Medium, Low, None | Static semantic enum; canonical semantic ordering |
| **Assignee** | `string \| null` | Single | Yes (Async) | Unassigned, Workspace Members, Team Members | Scalable query boundary; server-search ready |
| **Team** | `string` | Single | Yes | Accessible Workspace Teams | **Ownership Root**. Changes require dependency consequence confirmation |
| **Project** | `string \| null` | Single | Yes | Recent Projects, Active Projects, None | Workspace resource; may span multiple Teams |
| **Cycle** | `string \| null` | Single | Filterable | Current Active Cycle, Upcoming Cycles, Backlog / None | Strictly Team-owned; depends on selected `teamId` |
| **Labels** | `string[]` | Multi | Yes | Categorized Labels, Selected chips | Supports tag toggling, removal, creation if authorized |
| **Dates** | `string \| null` | Single | Relative shortcuts | Today, Tomorrow, Next Week, End of Sprint, Custom, Clear | ISO-8601 `YYYY-MM-DD`; no complex recurring rules |

### 4.1 WorkItem Type Picker
- **Options:** Strictly `Task`, `Issue`, `Bug`.
- **Invariants:** 
  - `Milestone` is a separate planning entity and MUST NOT appear.
  - `Document` is a knowledge resource and MUST NOT appear.
  - Legacy `feature` and `chore` types are strictly prohibited.
- **Trigger:** Type badge with semantic icon and label.

### 4.2 Status Picker (Team Configuration Driven)
- **Options:** Concrete workflow statuses defined for the active team (e.g., `backlog`, `todo`, `in_progress`, `in_review`, `done`, `cancelled`).
- **Grouping:** Options are visually grouped by resolved `statusCategory`. Users select the concrete `status`; `statusCategory` is automatically derived.
- **Invariants:** No cycling on click. Selecting an option immediately emits property change intent.

### 4.3 Priority Picker (Semantic Enum)
- **Options:** 5 semantic levels in strict hierarchy:
  1. `Urgent` (red double chevron)
  2. `High` (orange 3-bar signal)
  3. `Medium` (amber 2-bar signal)
  4. `Low` (blue 1-bar signal)
  5. `None` (subtle gray dash)
- **Invariants:** Users select semantic priority; numeric ordering values are internal implementation details.

### 4.4 Assignee Picker (Scalable Query Boundary)
- **Options:** `Unassigned` anchor at the top, followed by workspace/team members.
- **Representation:** Displays avatar (`UserAvatar`), display name, and handle.
- **Zero-Leakage:** Restricted user accounts or external guest accounts hidden unless explicitly shared.

### 4.5 Team Picker (Ownership Root)
- **Role:** WorkItem ownership root (`workspaceId`, `teamId`).
- **Options:** Teams the user has write/create access to within the current workspace.
- **Dependent Consequences:** Changing Team triggers dependency validation and consequence confirmation (Section 11).

### 4.6 Project Picker (Workspace Resource)
- **Role:** Cross-functional initiative deliverable grouping.
- **Options:** `No Project` option, followed by active projects. Projects are workspace resources and may span multiple teams.

### 4.7 Cycle Picker (Strictly Team-Owned)
- **Role:** Time-boxed iteration container.
- **Invariants:** Cycles are strictly Team-owned. The Cycle picker queries only cycles belonging to the item's `teamId`.
- **Options:** `Current Cycle (Cycle 42)`, `Next Cycle (Cycle 43)`, `Upcoming`, and `No Cycle / Backlog`.

### 4.8 Labels Picker (Multi-Select Tagging)
- **Selection Mode:** Multi-select toggle list.
- **Interaction:** Clicking an option toggles membership without closing the picker. Trailing checkmarks show active state.
- **Keyboard:** Typing filters labels. `Enter` toggles focused label. `Backspace` when search is empty removes the last active tag.
- **Creation:** If search query does not match existing labels and user has `create_label` permission, shows `Create label "{query}"`.

### 4.9 Dates Picker (Due Date / Start Date)
- **Interaction:** Anchored popover offering instant semantic shortcuts (`Today`, `Tomorrow`, `Next Monday`, `End of Sprint`, `Clear Date`) plus a high-density month calendar grid.
- **Output:** ISO-8601 date string `YYYY-MM-DD` or `null`.

---

## 5. Option-Source Classification & Scalability Architecture

### 5.1 Option-Source Sourcing Tiers
Option sources are classified by their semantic nature:

1. **Static / Local Semantic Options:**
   - Entities: `WorkItem Type`, `Priority`.
   - Characteristics: Immutable enum values defined by the product contract. Always loaded in memory.
2. **Context / Configuration-Driven Options:**
   - Entities: `Status`.
   - Characteristics: Dynamic per-Team workflow configuration. Must NOT be modeled as a globally static enum. May be locally cached by the active team context, but must be dynamically re-evaluated whenever the execution Team changes.
3. **Scaled / Asynchronous Query Options:**
   - Entities: `Assignee`, `Project`, `Team`, `Labels`.
   - Characteristics: Large or unbounded entity sets. Must operate through an async-capable query boundary.

### 5.2 Scalability Contract (No Premature Numeric Guarantees)
The option query boundary enforces the following behavioral invariants without relying on artificial numerical thresholds:
- Picker interactions must remain fluid and responsive under standard user input.
- Large entity sets must use query boundaries capable of asynchronous search, debouncing, and incremental/cursor retrieval.
- First-class UI states are mandatory for all pickers: `idle`, `searching`, `loading`, `empty`, `error`, and `retry`.
- Implementation must not require loading entire enterprise tenant datasets into browser memory.
- Concrete performance budgets (e.g. latency targets and virtualization cutoffs) are established through implementation profiling on realistic hardware.

---

## 6. Picker Presentation Modes & Tunable Dimension Tokens

Universal Property Pickers support three presentation modes sharing the exact same adapter logic. Dimensions are **tunable design tokens**, not frozen architectural invariants:

| Presentation Mode | Context / Form Factor | Current Design Defaults (Tunable Tokens) | Key Behaviors |
| :--- | :--- | :--- | :--- |
| **Anchored Popover** | Desktop Inspector, Data Grid cells, Action Strip | Width: 220px–260px; Max height: 280px | Floats adjacent to trigger; collision-aware edge flipping |
| **Command-Style Picker** | Quick Create accelerators, Command Palette | Width: 320px–400px; Max height: 320px | Centered / docked overlay; keyboard-first navigation |
| **Compact Mobile Sheet**| Viewports < 768px (tunable mobile breakpoint) | Width: 100vw; Max height: 50vh; Touch targets: ≥40px | Bottom sheet drawer; search pinned to top; large touch targets |

---

## 7. Keyboard Model, Scope Hierarchy & Focus Retention

### 7.1 Keyboard Interaction Matrix

| Key | Inside Trigger (Closed) | Inside Picker Search (Open) | Inside Options List (Open) |
| :--- | :--- | :--- | :--- |
| `Enter` / `Space` | Opens picker popover | Selects currently focused option | Commits selection & closes (single) / toggles (multi) |
| `ArrowDown` | Opens picker popover | Moves focus to first option | Moves focus to next option (with wrapping) |
| `ArrowUp` | Opens picker popover | Moves focus to last option | Moves focus to previous option |
| `Escape` | No-op / closes parent modal | Closes picker popover | Closes picker popover |
| `Tab` | Advances to next UI field | Closes picker & tabs to next field | Closes picker & tabs to next field |
| `Backspace` | No-op | Deletes char / removes last multi-tag | Deletes multi-select tag if search empty |
| `Typing (a-z)` | Grid hotkey (if roving row) | Appends to search query | Jumps to search input and searches |

### 7.2 Keyboard Scope Hierarchy
While an anchored picker or command popover is open, it registers itself in the **`OVERLAY` keyboard scope**. Background Data Grid navigation hotkeys (`j`, `k`, `x`, `space`) and global application shortcuts (`c`, `g i`) are completely suppressed until the picker closes.

### 7.3 Deterministic Focus Restoration
1. **Trigger Opening:** When opened via click or keyboard, focus immediately moves to the `PickerSearchInput` (if searchable) or the currently selected `PickerOption`.
2. **Dismissal / Selection:** When the picker closes (via option selection, `Escape`, or outside click), **DOM focus is deterministically restored to the originating `PropertyTrigger`**.
3. **Roving Anchor Retention:** In the Data Grid, focus returns to the cell trigger, preserving the row's `tabindex="0"` anchor.

---

## 8. Picker Commit Ownership & Mutation Contracts

Universal Property Pickers provide interaction and value-selection behavior, but **do NOT inherently own canonical mutation**. There are two distinct consumer modes:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ CONSUMER MODES                                                              │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ 1. Existing WorkItem Consumer        │ 2. Quick Create Draft Consumer       │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Target: Existing persisted item      │ Target: Unsaved in-flight draft      │
│ Action: Emits property-change intent │ Action: Modifies QuickCreateDraft    │
│ Pipeline: Canonical mutation boundary │ Pipeline: Local state update only    │
│ Example:                             │ Example:                             │
│ StatusPicker -> status = 'done'      │ StatusPicker -> draft.status = 'done'│
│ -> dispatches updateWorkItem()       │ -> NO canonical mutation dispatched! │
│ -> optimistic state & rollback       │ -> Committed only on Quick Create    │
│                                      │    final submit                      │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

1. **Existing WorkItem Mode:** The picker emits intent (`onSelect(newValue)`). The consumer passes this intent through the canonical WorkItem mutation boundary (e.g. `updateItem(itemId, patch)` in `WorkspaceContext`), triggering optimistic UI updates and failure rollback if rejected.
2. **Quick Create Mode:** No canonical WorkItem exists yet. The picker emits intent (`onSelect(newValue)`), which updates the local `QuickCreateDraft` state. It **MUST NOT call `updateItem()` or `createItem()`**. Mutation occurs strictly when the user confirms the entire validated draft via `⌘↵` or "Create Item".

---

## 9. Explicit Labels Commit Semantics

The commit behavior for multi-select labels is cleanly differentiated by consumer context:

### 9.1 Existing WorkItem Context
- Each deliberate label toggle (clicking an option or pressing `Enter`) is an **immediate, explicit canonical mutation**.
- Example: Pressing `Enter` on `ui` dispatches `updateItem(id, { labels: [...labels, 'ui'] })`.
- `Escape` subsequently means: **Close the picker**. It does **NOT** undo or revert already successful mutations.
- If an individual label mutation fails:
  - The UI immediately reverts that specific toggle.
  - The picker remains open with an inline error notice.
  - Context is preserved for retry.

### 9.2 Quick Create Context
- Label toggles modify `draft.labels` array in local draft state only.
- No WorkItem mutation occurs until final Quick Create submission.
- `Escape` closes the label picker without affecting draft selections.

---

## 10. Zero-Leakage Invariants: Candidate vs. Existing Reference

To preserve security and eliminate privacy leakage across multi-tenant or role-restricted workspaces, the picker system strictly differentiates:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ZERO-LEAKAGE BEHAVIOR                                                       │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ A. Restricted Candidate in Search    │ B. Existing Restricted Reference     │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Scenario: User searches for an       │ Scenario: A WorkItem already         │
│ inaccessible Project, User, or Item  │ references an inaccessible entity    │
│ Rule: MUST NOT BE DISPLAYED          │ Rule: GENERIC PROTECTED PLACEHOLDER  │
│ - No name or title                   │ - Renders "[Restricted Project]"     │
│ - No identifier                      │ - Renders "[Restricted User]"        │
│ - No avatar or initials              │ - Muted lock icon                    │
│ - No count or metadata               │ - Non-interactive / disabled         │
│ - No disabled "secret" option        │ - Opaque ID preserved in data model  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

Search itself is 100% zero-leakage. Users can never probe or infer the existence of protected resources through candidate option lists or search autocompletion.

---

## 11. Team-Change Dependency Semantics & Cascading Mutation Confirmation

WorkItem ownership is rooted in `teamId`. Changing a WorkItem's Team has structural consequences for dependent properties. **The system must never silently destroy or remap dependent properties.**

### 11.1 Consequence Resolution Pipeline

```text
User selects Proposed Team
        │
        ▼
[ Resolve Dependent Consequences ]
  ├── Current Status available in target Team?
  │     ├── Yes: Retain Status
  │     └── No: Flag incompatibility; propose target Team's default status for matching statusCategory
  ├── Current Cycle belongs to target Team?
  │     ├── Yes: Retain Cycle
  │     └── No: Flag invalidity; propose clearing Cycle to null (Backlog)
  └── Current Project compatible with target Team?
        ├── Yes: Retain Project
        └── No: Flag context mismatch; propose keeping or clearing Project
        │
        ▼
Are there destructive or invalidating consequences?
  ├── NO: Commit atomic mutation: updateItem(id, { teamId: newTeamId })
  └── YES:
        │
        ▼
[ Present Consequence Confirmation Dialog ]
  ├── Clearly lists all affected properties
  ├── Displays proposed valid replacements/defaults
  ├── Allows user to adjust proposed replacements
  └── Actions:
        ├── [ Cancel ] ──► Zero changes made. Team remains unchanged. Picker closes.
        └── [ Confirm Changes ] ──► Commits ONE atomic canonical mutation with all resolved fields.
```

### 11.2 Invariant Rules
- **No Silent Destruction:** The system must never silently remap Status, clear Cycle, or unlink a Project without explicit user confirmation.
- **Atomic Mutation:** When confirmed, the change commits as a single canonical mutation (e.g. `{ teamId, status, cycleId }`).
- **Cancellation Safety:** If the user cancels the confirmation dialog, the Team selection is discarded and the WorkItem retains all original values.

---

## 12. Quick Create Architecture & Multi-Team Project Resolution

### 12.1 Objective
Quick Create provides sub-second WorkItem capture without modal friction:

> **Open (`C`) → Type Title → Set Priority/Assignee via accelerators → Submit (`⌘↵`) → Instant Return.**

### 12.2 Multi-Team Project Resolution
Projects are Workspace resources that may span multiple Teams. When Quick Create is invoked from a Project context:
1. **`projectId` is inherited** directly from context.
2. **Team Resolution Rules:**
   - **Unambiguous Team:** If the Project belongs to exactly one execution Team, that `teamId` is inferred and prefilled.
   - **Active Context Match:** If the Project is multi-team and the user already has an active valid contextual Team (e.g. active sidebar team is a member of the project), that Team is retained.
   - **Ambiguous Multi-Team:** If no valid execution Team can be unambiguously resolved by context, **Team is NOT guessed**. The Team field remains empty/required, and **submission is blocked until the user explicitly selects an execution Team**.
   - **No Lead-Team Assumption:** The system does not invent a permanent `leadTeam` requirement merely to simplify prefilling.

### 12.3 Context Inheritance & Precedence Model
Initial property values for Quick Create resolve deterministically:

$$\text{Active Value} = \text{Explicit User Choice} \succ \text{Invocation View Context} \succ \text{Valid Session Context} \succ \text{Team / Workspace Defaults}$$

---

## 13. Quick Create Required Fields & Dynamic Default Resolution

### 13.1 Minimum Required Fields
To maintain capture speed while ensuring database and domain integrity:
- **Title:** Strictly required (trimmed length > 0).
- **Team:** Strictly required (establishes ownership root).

### 13.2 Dynamic Default Resolution (No Hardcoded Fallbacks)
Values must resolve through the appropriate product and configuration contracts:
- **Type:** Resolves to default type for the selected Team (defaults to `Task`).
- **Status:** **Dynamically resolved from the selected Team's workflow configuration**. Quick Create selects the Team's configured unstarted default status (e.g., `backlog` or `todo`). It must **never submit a hardcoded status that is invalid for the chosen Team**.
- **Priority:** Resolves to the Team/workspace configured default priority; if none configured, falls back to the product default (`medium`).
- **Assignee:** Defaults to `null` (`Unassigned`).
- **Cycle:** Defaults to active cycle if invoked from a Cycle view; otherwise `null`.

---

## 14. Create Another Persistence & Reset Policy

When the user enables the **Create Another** toggle (`[x] Create another`), submitting via `⌘↵` or "Create Item" applies a deterministic reset policy:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ CREATE ANOTHER RESET POLICY                                                 │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ ALWAYS RESET (Item-Specific)         │ PRESERVE (Contextual Container)      │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ - Title (cleared to empty string)    │ - Team (retains execution context)   │
│ - Description (cleared to empty)     │ - Project (retains deliverable group)│
│ - Assignee (reset to Unassigned)*    │ - Cycle (retains active sprint)      │
│ - Due Date (reset to None)*          │ - WorkItem Type (retains task/bug)   │
│ - Item-specific Labels               │ - Priority (retains urgency level)   │
│ - Transient validation errors        │ - Contextual Labels                  │
│ - In-flight submission flags         │                                      │
├──────────────────────────────────────┴──────────────────────────────────────┤
│ *Design Rationale: Assignee and Due Date are reset to prevent accidental    │
│ repeated assignments of multiple backlog deliverables to a single individual│
│ or deadline. Team, Project, and Cycle are preserved as the ambient container│
│ of the current creation session. Focus immediately returns to Title input. │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 15. Submission In-Flight Deduplication & Failure Preservation

### 15.1 In-Flight Deduplication
- Submitting via `⌘↵` or clicking Create sets `isSubmitting = true`.
- Subsequent Enter keypresses or clicks while in-flight are ignored.
- The submit button transitions to a compact spinner state without shifting layout.

### 15.2 Failure Preservation & Rollback
If network or server validation fails:
- Quick Create **remains open**.
- User input (Title, Description, selected pickers) is **100% preserved**.
- An inline error banner displays the authoritative failure reason.
- Focus returns to Title input. No phantom items remain in the UI.

---

## 16. Responsive Adaptation (Desktop vs. Mobile)

- **Desktop (≥ 768px):** Centered compact dialog (tunable default: 560px width). Property triggers displayed in a horizontal badge strip. Property pickers open in anchored popovers.
- **Mobile (< 768px):** Purposeful fullscreen or bottom-sheet drawer. Search input pinned to top. Property triggers displayed as stacked full-width rows with ≥40px touch targets. Both presentations share the exact same draft state and validation logic.

---

## 17. Component Architecture & Clean Dependency Boundaries

```text
src/
├── design-system/primitives/         # Buttons, Badges, Inputs, Dialogs (Zero business logic)
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
│   │   ├── StatusPicker.jsx          # Team-configured workflow statuses
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
│       ├── TeamChangeConfirmation.jsx# Consequence confirmation dialog
│       └── useQuickCreate.js         # Context inheritance & draft state hook
```

**Dependency Rules:**
1. `components/property-picker/` CANNOT import from `features/work-items/`.
2. `features/work-items/property-pickers/` imports generic picker components and WorkItem constants.
3. `QuickCreateDialog`, `DataGridCell`, and `WorkItemProperties` consume `features/work-items/property-pickers/`.

---

## 18. UI-01A & UI-01B Migration Plan

1. **`CreateItemModal.jsx`:** **REPLACE completely** with `QuickCreateDialog.jsx`. The prototype `<select>` inputs and synthetic random IDs are decommissioned.
2. **`WorkItemProperties.jsx` (Inspector):** Refactor property rows to replace local `openDropdown` state with universal property picker adapters (`<StatusPicker>`, `<PriorityPicker>`, `<AssigneePicker>`, etc.).
3. **`DataGridCell.jsx` (Data Grid):** Replace inline dropdown menus for status and priority with universal property triggers in anchored popover mode.

---

## 19. Accessibility & ARIA Semantics

- **Triggers:** `aria-haspopup="listbox"`, `aria-expanded={isOpen}`, `aria-label="Change {property}"`.
- **Picker Listbox:** `role="listbox"`, `aria-label="Select {property}"`, `tabIndex={-1}`.
- **Picker Options:** `role="option"`, `aria-selected={isSelected}`, `tabIndex={isActive ? 0 : -1}`.
- **Section Headers:** `role="group"`, `aria-label="{Category Name}"`.
- **Live Regions:** `aria-live="polite"` for asynchronous search result counts and mutation failure announcements.

---

## 20. Visual Design States & Coverage

The accompanying UI-01C visual design specification illustrates the key system states:

1. **Closed Property Trigger:** Compact badge with icon, semantic color, and chevron.
2. **Open Anchored Status Picker:** Team-configured statuses grouped by category with active checkmarks.
3. **Anchored Assignee Picker:** Search input, avatar row, and member list.
4. **Semantic Priority Popover:** 5-level list with urgency indicators.
5. **Quick Create Default Dialog:** Title auto-focused, markdown description, horizontal badge strip.
6. **Multi-Team Project Quick Create:** Project inherited; Team selector highlighted as required when ambiguous.
7. **Team-Change Consequence Confirmation:** Explicit dialog showing proposed Status/Cycle remapping with Confirm and Cancel actions.
8. **Protected Existing Reference:** Muted badge with lock icon (`[Protected Reference]`), zero metadata leaked.
9. **Submission In-Flight State:** Disabled button with spinner; duplicate Enter keys suppressed.
10. **Creation Failure State:** 100% input preserved; inline red alert banner.
11. **Mobile Quick Create:** Fullscreen bottom sheet with stacked touch targets.

---

## 21. Authoritative Validation Scenarios

### Scenario A — Team Change Consequence Confirmation
- **Context:** WorkItem `ENG-101` has `Team: Team Core`, `Status: In Review`, `Cycle: Cycle 42`.
- **Action:** User opens Team picker and selects `Team Web`.
- **System Analysis:** `Team Web` uses a 4-state workflow lacking `In Review`; `Cycle 42` belongs strictly to `Team Core`.
- **Result:** Consequence Confirmation Dialog appears:
  - *"Changing team to Web will reset Cycle to Backlog and update Status to In Progress."*
- **Confirm:** Dispatches single canonical mutation `{ teamId: 'team-web', status: 'in_progress', cycleId: null }`.
- **Cancel:** Dialog dismisses; `ENG-101` remains on `Team Core` with `In Review` and `Cycle 42`.

### Scenario B — Multi-Team Project Quick Create
- **Context:** Quick Create is opened from Project "Auth V2" (which spans `Team Security` and `Team Core`). Active sidebar team context is not set.
- **Result:** Project "Auth V2" is inherited. Team is NOT guessed. The Team trigger displays an empty "Select Team *" state. The Create button is disabled until a Team is explicitly chosen.

### Scenario C — Team-Configured Workflow Status
- **Context:** `Team Security` has custom compliance statuses (`triage`, `audit`, `remediation`, `certified`).
- **Action:** User opens Status picker for a `Team Security` item.
- **Result:** The picker renders strictly the 4 compliance statuses. Global default statuses (`todo`, `in_progress`) are not displayed.

### Scenario D — Labels on Existing WorkItem
- **Context:** User opens Labels picker on `ENG-102` and presses `Enter` on `security`.
- **Result:** Canonical mutation immediately updates `ENG-102` with `security`. User presses `Escape`. Picker closes. Label `security` remains committed.

### Scenario E — Labels in Quick Create
- **Context:** User opens Quick Create and toggles label `frontend`.
- **Result:** `draft.labels` updates locally. No canonical WorkItem mutation is dispatched. User closes picker and continues typing description.

### Scenario F — Zero-Leakage Search & Existing References
- **Candidate Search:** User searches for "secret" in Assignee picker. No candidate or account metadata is returned.
- **Existing Reference:** WorkItem references a confidential parent. Grid cell renders `[Restricted WorkItem]` with a lock icon without leaking parent identifier or title.

### Scenario G — Create Another Execution
- **Context:** User creates a task in Project "Auth V2" with `Priority: High`, `Assignee: Alice`, and `Create another` checked.
- **Action:** User presses `⌘↵`.
- **Result:** Item 1 is created. Form remains open. Title and Description are cleared. Assignee is reset to Unassigned. Team, Project, and Priority (High) are preserved. Focus returns to Title.

---

## 22. Resolution of the 19 Explicit Product Decisions

| # | Topic | Authoritative Decision |
| :--- | :--- | :--- |
| **1** | Generic PropertyPicker Boundary | Generic picker engine resides in `src/components/property-picker/` with zero domain coupling. Handles ARIA, keyboard navigation, popovers, and option highlighting. |
| **2** | Domain Picker Configuration | WorkItem-specific pickers reside in `src/features/work-items/property-pickers/`, configuring options, icons, and mutation contracts. |
| **3** | Sync vs Async Option Sourcing | Static enums (Type, Priority) are sync. Status is dynamic Team-workflow configuration. Scaled entities (Assignee, Project, Team, Labels) use an async-capable query contract. |
| **4** | Single vs Multi-Select API | Unified engine supports `isMultiSelect` prop. Single-select closes on option click; multi-select toggles checkmark without closing popover. |
| **5** | Focus Restoration Contract | Closing picker (selection or cancellation) deterministically restores DOM focus to the originating `PropertyTrigger`. |
| **6** | Dependent-Property Behavior | Breaking changes trigger consequence resolution and require explicit user confirmation before committing. |
| **7** | Team-Change Consequences | Proposed Team -> Resolve consequences -> Present consequence dialog -> User confirms -> One atomic mutation / Cancel -> zero changes. |
| **8** | Quick Create Context Inheritance | Strictly deterministic precedence: Explicit User Choice > Invocation View Context > Session Defaults > Team Defaults. |
| **9** | Minimum Required Creation Fields | Only **Title** and **Team** are strictly mandatory. All other properties provide safe defaults (`Task`, default Status for Team, `Medium`, `Unassigned`). |
| **10** | Create & Close Behavior | Standard default. Creates item, displays toast, closes modal, restores focus to grid/view. |
| **11** | Create & Open Behavior | Supported via secondary action button / split shortcut (`⌘⇧↵`). Opens newly created item in Inspector drawer. |
| **12** | Create Another Decision | **CORE capability**. Checkbox in footer allows continuous creation without closing modal, preserving contextual team/project fields. |
| **13** | Optimistic Creation Decision | **DEFERRED for Quick Create**. Quick Create awaits authoritative in-memory store creation before closing or resetting, preventing phantom items. |
| **14** | Failed Creation Behavior | 100% form preservation. Form remains open, error banner displays, focus returns to title for immediate retry. |
| **15** | Duplicate-Submit Protection | Submit button enters disabled loading state immediately upon trigger. Subsequent Enter keys are suppressed while in-flight. |
| **16** | Desktop Presentation | Centered, compact modal dialog (tunable default: 560px width) with property badges in an inline horizontal strip. |
| **17** | Mobile Presentation | Responsive bottom sheet drawer (<768px) with full-width stacked property selectors. |
| **18** | UI-01A/UI-01B Migration | Both Inspector and Grid will consume the universal domain pickers in implementation phase, deprecating local dropdown code. |
| **19** | Existing `CreateItemModal` | **REPLACE**. Decommission prototype modal in favor of modular `QuickCreateDialog`. |

---

## 23. Production Implementation Status & Verification

### 23.1 Status
**IMPLEMENTATION COMPLETED & VALIDATED** — Ready for Human Review.

### 23.2 Implemented Component Boundaries
1. **Generic Universal Property Picker Engine (`src/components/property-picker/`):**
   - `PropertyTrigger`: Accessible trigger button with badges, avatars, chevrons, disabled/read-only states, and `data-property-trigger` / `data-size` attributes.
   - `PropertyPicker`: Anchored popover shell with `OVERLAY` keyboard scope, focus trapping, global Escape interception, and deterministic focus restoration to trigger.
   - `PropertyPickerSearch`: Auto-focused search input with clear button and accessible labels.
   - `PropertyPickerList`: ARIA `role="listbox"` container with loading skeleton, error retry, and empty state fallbacks.
   - `PropertyPickerOption`: ARIA `role="option"` with selection checkmark, keyboard focus, icons, and shortcuts.
   - `PropertyPickerSection`: Grouped headers with `role="group"`.
   - `PropertyPickerEmptyState`: Message and action triggers for empty searches and retryable errors.

2. **WorkItem Domain Adapters (`src/features/work-items/property-pickers/`):**
   - `TypePicker`: Task, Issue, Bug strictly (CORE invariant).
   - `StatusPicker`: Team-workflow driven, grouped by `statusCategory`.
   - `PriorityPicker`: 5 semantic priority levels (`urgent`, `high`, `medium`, `low`, `none`).
   - `AssigneePicker`: Searchable user picker with Unassigned anchor, avatars, and zero-leakage candidate suppression.
   - `TeamPicker`: Execution team selector with consequence detection hook.
   - `ProjectPicker`: Workspace multi-team project selector with search and No Project anchor.
   - `CyclePicker`: Strictly team-owned cycles (active, upcoming, backlog).
   - `LabelsPicker`: Multi-select tagger with immediate mutation for existing items vs draft update for Quick Create, plus dynamic tag creation.
   - `DatePicker`: Instant relative shortcuts (Today, Tomorrow, Next Week, Clear) + ISO date input.
   - `teamWorkflows.js`: Workflow registry per team (`team-core`, `team-mobile`, `team-web`, `team-security`).
   - `teamConsequenceResolver.js`: Pure helper `checkTeamChangeConsequences(item, targetTeamId)` evaluating status incompatibility, cycle invalidation, and project context.

3. **Quick Create Module (`src/features/work-items/quick-create/`):**
   - `TeamChangeConfirmation`: Consequence confirmation modal dialog showing affected properties, proposed replacements, Cancel (0 changes), and Confirm (1 atomic mutation).
   - `useQuickCreate`: State manager enforcing deterministic precedence (`Explicit Choice > Invocation Context > Session Defaults > Team Defaults`), multi-team project ambiguity resolution (requires team choice, no guessing), in-flight deduplication, Create Another reset policy, and failure preservation.
   - `QuickCreateForm`: High-density form composing universal property pickers, title input, markdown notes, Create Another toggle, and `⌘↵` / `⌘⇧↵` shortcuts.
   - `QuickCreateDialog`: Modal dialog wrapper replacing legacy `CreateItemModal`.

4. **Surface Migrations:**
   - **WorkItem Inspector (`src/features/work-items/components/WorkItemProperties.jsx`):** Migrated to consume Universal Property Pickers. Legacy local dropdown implementations removed.
   - **Universal Data Grid (`src/views/DataGrid/DataGridCell.jsx`):** Migrated Status, Priority, and Assignee cells to Universal Property Pickers. Legacy listbox JSX removed.
   - **App Shell (`src/App.jsx`):** Replaced `CreateItemModal` with `QuickCreateDialog`, wiring `onOpenItem` to open the Inspector drawer for `Create & Open` mode.

### 23.3 Known Prototype Limitations & Deferred Items
- **Deferred to UI-01D / Later Phases:**
  - Real server/cache sync abstraction: Mutation state currently updates canonical in-memory workspace store (`WorkspaceProvider`).
  - Optimistic creation: In accordance with Section 14, Quick Create intentionally awaits authoritative store creation before resetting or closing.
  - Recurrence and workflow automation for dates: Basic date picker implemented for target dates.

### 23.4 Test Verification
- **Total Test Files:** 7 passed (7)
- **Total Tests:** 98 passed (98)
  - `src/__tests__/ui-01c-quick-create-pickers.test.jsx`: 37 tests (all 37 contract requirements covered)
  - `src/__tests__/ui-01b-high-density-grid.test.jsx`: 27 tests (upstream baseline green)
  - `src/__tests__/ui-01a-work-item-inspector.test.jsx`: 16 tests (upstream baseline green)
  - `src/__tests__/workspace-selection.test.jsx`: 5 tests
  - `src/__tests__/keyboard-scopes.test.jsx`: 6 tests
  - `src/__tests__/filter-algebra.test.js`: 4 tests
  - `src/__tests__/command-palette-flow.test.jsx`: 3 tests
- **Production Build:** `npm run build` completed successfully (Vite v6.2.0, zero errors).

---

## 24. Human Review Gate

# HUMAN REVIEW — UI-01C IMPLEMENTATION

