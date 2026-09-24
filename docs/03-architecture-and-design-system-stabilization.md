# Orynqo — Architecture & Design-System Stabilization Report (Pass 01)

**Status:** Completed & Validated  
**Branch:** `refactor/architecture-stabilization-01`  
**Governing Methodology:** `antigravity-enterprise-product-design`  
**Quality Gate:** `npm run build` PASS (0 errors)  

---

## 1. Repository Audit & Problems Discovered

Prior to this stabilization pass, the prototype validated the product direction and visual aesthetic, but suffered from structural bottlenecks that would prevent scaling into a large enterprise platform:

| Area | Prototype State | Architectural Problem | Resolution in Pass 01 |
| :--- | :--- | :--- | :--- |
| **`App.jsx` Responsibility** | Monolithic container owning 15 `useState` hooks, keydown handlers, filtering logic, and inline bulk action bars. | Violates Single Responsibility. Cannot support independent routing, lazy loading, or modular testing. | Refactored into pure orchestration. State moved to `WorkspaceProvider` (domain) and `UIProvider` (shell). Filter logic moved to `useWorkItemsFilter`. Keyboard handling moved to `useKeyboardShortcuts`. |
| **Design System Purity** | `Badge.jsx` directly imported `STATUS_DEFINITIONS` and `PRIORITY_DEFINITIONS`. `Avatar.jsx` was hardcoded to Orynqo `user` shapes. | Design system primitives were tightly coupled to product domain models, preventing true reusability and clean UI testing. | Replaced with domain-neutral primitives: `Badge`, `Avatar`, `Checkbox`, `Kbd`. Domain adapters (`StatusBadge`, `PriorityBadge`, `TypeBadge`, `UserAvatar`) moved to `src/components/`. |
| **Overlay Architecture** | `Dialog`, `Drawer`, `Popover` were reinvented independently across 5 files with inconsistent backdrops and ad-hoc `z-index` values (`1000`, `100`, `50`). | Inconsistent focus traps, conflicting Escape keys, and styling duplication. | Extracted domain-neutral `Dialog`, `Drawer`, and `Popover` primitives into `src/design-system/overlays/` with unified accessibility and key handlers. |
| **View Ownership** | `DataGrid`, `KanbanBoard`, `TimelineView`, `WorkloadView` were stored in `src/design-system/data/`. | Projections are domain views, not generic design-system primitives. | Reorganized into `src/views/` as pure data projections consuming the canonical `items` state. |
| **Feature Boundaries** | `LivingSpecEditor`, `TriageInbox`, and `CreateItemModal` were flat in `src/features/` without public APIs. | Internal components leaked into global imports. | Established bounded feature folders (`work-items`, `living-specs`, `triage`) with explicit `index.js` public APIs. |
| **Keyboard Management** | Multiple components independently bound `window.addEventListener('keydown')` with incomplete input suppression. | Uncoordinated listeners caused race conditions and shortcut execution while typing in text inputs. | Created `useKeyboardShortcuts` with comprehensive form-control suppression (`INPUT`, `TEXTAREA`, `SELECT`) and priority ESC handling. |

---

## 2. Target Folder Architecture

The codebase now enforces strict layer separation:

```
src/
├── app/
│   └── providers/                 # Context boundaries (WorkspaceContext, UIContext)
├── constants/                     # Centralized domain constants (workItems, statuses, priorities)
├── data/                          # Normalized mock entities (users, teams, projects, cycles)
├── design-system/                 # PURE DOMAIN-NEUTRAL DESIGN SYSTEM
│   ├── index.js                   # Public design system API
│   ├── tokens.js                  # Spacing, density, duration, and radius tokens
│   ├── primitives/                # Button, Input, Badge, Avatar, Checkbox, Kbd
│   ├── composites/                # SegmentedControl, PropertyRow
│   └── overlays/                  # Dialog (Modal), Drawer, Popover
├── components/                    # GLOBALLY REUSABLE PRODUCT COMPONENTS (Domain-Aware)
│   ├── index.js                   # Public components API
│   ├── badges/                    # StatusBadge, PriorityBadge, TypeBadge
│   ├── avatars/                   # UserAvatar
│   ├── filters/                   # FilterBuilder
│   ├── command-palette/           # CommandPalette (omnisearch launcher)
│   ├── shortcuts/                 # ShortcutsModal
│   └── bulk-actions/              # BulkActionBar
├── layouts/                       # APPLICATION SHELL
│   ├── index.js                   # Public layout API
│   ├── AppShell.jsx               # Layout orchestrator (Sidebar + Header + Canvas + Inspector)
│   ├── Sidebar/                   # Collapsible navigation rail & workspace switcher
│   └── ActionStrip/               # Top breadcrumbs, view tabs, search & filter triggers
├── views/                         # REUSABLE DATA PROJECTIONS
│   ├── index.js                   # Public views API
│   ├── DataGrid/                  # High-density virtualized table (28px/34px, keyboard nav)
│   ├── KanbanBoard/               # Kanban column projection
│   ├── TimelineView/              # Gantt temporal projection
│   └── WorkloadView/              # Capacity meters projection
├── features/                      # BOUNDED DOMAIN CAPABILITIES
│   ├── index.js                   # Public features API
│   ├── work-items/                # InspectorDrawer, CreateItemModal
│   ├── living-specs/              # LivingSpecEditor (two-way PRD sync)
│   └── triage/                    # TriageInbox (keyboard notification feed)
├── hooks/                         # useKeyboardShortcuts, useWorkItemsFilter
├── App.jsx                        # Clean composition bootstrap
├── index.css                      # Design tokens, CSS reset & typography
└── main.jsx                       # Application mount
```

---

## 3. Component Ownership Rules

To prevent architecture degradation, all future contributions must adhere to the following ownership boundaries:

1. **Design System Layer (`src/design-system/`)**:
   - **MUST NOT** import anything from `src/constants/`, `src/features/`, `src/views/`, or `src/data/`.
   - Contains only generic UI: `Button`, `Input`, `Checkbox`, `Badge`, `Avatar`, `Dialog`, `Drawer`, `Popover`, `PropertyRow`, `SegmentedControl`.
   - Accepts generic primitives: strings, numbers, booleans, icons, callbacks.
2. **Global Product Components (`src/components/`)**:
   - Reusable across multiple pages and views.
   - May understand Orynqo domain entities (e.g. `User`, `Status`, `Priority`, `WorkItem`).
   - Examples: `StatusBadge`, `PriorityBadge`, `UserAvatar`, `FilterBuilder`, `CommandPalette`, `BulkActionBar`.
3. **Reusable Data Projections (`src/views/`)**:
   - Lenses that render canonical domain collections.
   - Do NOT own their own disconnected copy of the data. They receive items, selected states, and dispatch updates to the canonical store.
4. **Bounded Features (`src/features/`)**:
   - Own domain workflows (e.g. Work Item lifecycle, PRD Living Spec synchronization, Notification triage).
   - Expose explicit `index.js` barrels; external modules must not import deep internal files.
5. **Layouts & Shell (`src/layouts/`)**:
   - Provide geometric structure (sidebar rail, top action strip, split panes, overlay slots).

---

## 4. State Ownership Model

State is strictly partitioned to avoid bloated global stores and prevent unnecessary re-renders:

```
┌────────────────────────────────────────────────────────┐
│                   STATE CLASSIFICATION                 │
├────────────────────┬───────────────────────────────────┤
│ State Type         │ Storage Location & Mechanism      │
├────────────────────┼───────────────────────────────────┤
│ 1. Canonical Domain│ WorkspaceContext                  │
│    (WorkItems,     │ Normalized item array with CRUD   │
│     Teams, Cycles) │ mutations (update, create, delete)│
├────────────────────┼───────────────────────────────────┤
│ 2. Shell & UI State│ UIContext                         │
│    (Active View,   │ View routing, sidebar collapse,   │
│     Density, Theme)│ inspector toggle, search/filters  │
├────────────────────┼───────────────────────────────────┤
│ 3. Transient Local │ Component useState                │
│    (Draft inputs,  │ Closed inside forms or popovers;  │
│     Hover, Focus)  │ never lifted to global context    │
├────────────────────┼───────────────────────────────────┤
│ 4. Derived State   │ useWorkItemsFilter                │
│    (Filtered items)│ Memoized with useMemo             │
└────────────────────┴───────────────────────────────────┘
```

---

## 5. Overlay & Keyboard Architecture

### Overlay Hierarchy & Z-Index Strategy
1. **Base Shell (`z-index: 1`)**: Sidebar, ActionStrip, Main Canvas.
2. **Contextual Inspector (`z-index: 30`)**: Docked or floating drawer preserving workspace background.
3. **Floating Bulk Action Bar (`z-index: 50`)**: Centered pill toolbar appearing on multi-row selection.
4. **Anchored Popovers (`z-index: 100`)**: Filter dropdowns, context menus, and pickers with outside-click dismissal.
5. **Modals & Command Palette (`z-index: 1000`)**: Full-screen backdrop overlays with ESC closing and focus control.

### Keyboard Architecture (`useKeyboardShortcuts`)
- **Active Form Control Guard**: Checks `['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)` before executing single-key shortcuts (`c`, `j`, `k`, `s`, `p`, `x`, `1-5`).
- **Escape Layer Hierarchy**: When `Esc` is pressed, closes modals first, then clear multi-selection, then closes the inspector drawer.
- **Global Commands**: `⌘K` (Command Palette) and `⌘[` (Sidebar Toggle) work globally.

---

## 6. Golden Flow Readiness

With the design system and architecture stabilized:
- `App.jsx` is decoupled and resilient.
- Primitives and overlays are domain-neutral.
- Canonical state supports seamless multi-view synchronization.
- Build compiles in <5s with zero errors and zero warnings.

**Recommendation:** The repository is fully prepared to commence **Golden Flow 01 — Work Item Lifecycle**.
