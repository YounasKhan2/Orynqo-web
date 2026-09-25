# UI-03B — My Work Implementation Record

- **Surface:** `PER-002 — My Work`
- **Branch:** `feat/ui-03b-my-work`
- **Status:** Implemented and Hardened for Human Review (Pass 01A Complete)
- **Source Contract:** `docs/12-ui-03a-my-work-product-ux-contract.md` v1.1

---

## Architecture Used

My Work is implemented as a feature-level projection over canonical `WorkItem` records. It strictly forbids introducing separate entities like `MyTask`, `PersonalIssue`, or cloned WorkItems.

The implementation uses `WorkspaceContext` strictly as an interim prototype adapter. Presentation components interact solely through the `useMyWorkQuery` query boundary, decoupling the presentation layer so that it can be cleanly replaced later by server-state cache, cursor API, or normalized entity repositories.

---

## Files Introduced & Modified

### New Feature Boundary (`src/features/my-work/`)
```text
src/features/my-work/
├── components/
│   ├── MyWorkCockpit.jsx
│   ├── MyWorkOverview.jsx
│   ├── AttentionSection.jsx
│   ├── WorkBucketSection.jsx
│   ├── RecentlyCompletedList.jsx
│   ├── MyWorkSummaryStrip.jsx
│   └── EmptyWorkState.jsx
├── hooks/
│   ├── useMyWorkQuery.js
│   ├── useMyWorkBuckets.js
│   └── useMyWorkPreferences.js
└── index.js
```

### Shared Domain-Neutral Utilities & Reconciliations
- `src/constants/dateUtils.js`: Reusable date and calendar boundary utility supporting user-timezone resolution, DST-safe calendar math without assuming fixed 24-hour days, canonical time bucket classification (`overdue`, `due_today`, `due_soon`, `later`, `no_due_date`), and domain-neutral DataGrid due-date group mapping (`getDueDateGroup`).
- `src/views/DataGrid/DataGridBody.jsx`: Reconciled `due_date` grouping with `dateUtils.getDueDateGroup` and added `userTimezone` prop.
- `src/views/DataGrid/DataGrid.jsx`: Forwarded `userTimezone` prop to `DataGridBody`.
- `src/App.jsx`: Integrated `MyWorkCockpit`, `MyWorkSummaryStrip`, resolved `userTimezone` (`CURRENT_USER.timezone` with fallback to browser `Intl.DateTimeFormat().resolvedOptions().timeZone` or `'UTC'`), and passed through to `useMyWorkQuery` and `DataGrid`.
- `src/__tests__/ui-03b-my-work.test.jsx`: Comprehensive test suite verifying query scopes, bucketing, attention precedence, deterministic default sort, timezone boundaries, DST safety, DataGrid due-date grouping, scoped preferences isolation, and canonical mutations.

---

## Direct UI-03B Implementations vs Inherited Architecture

### 1. Implemented Directly by UI-03B
- **Query Boundary (`useMyWorkQuery.js`)**: Encapsulates 4 query scopes (`overview`, `assigned`, `created`, `subscribed`), multi-dimension filters (Team, Project, Cycle, Status, Priority, search query), and deterministic default sorting.
- **Deterministic Default Sort (`compareDefaultUrgency`)**: Evaluates:
  1. Urgency Rank: `Blocked (400) > Overdue (300) > Due Today (200) > In Progress (100) > Normal (0)`.
  2. Priority Rank: `urgent > high > medium > low > none`.
  3. Due Date ascending (scheduled items before unscheduled).
  4. Stable tie-breaker: `identifier` / `id` ascending.
- **Two-Stage Bucket Assignment (`useMyWorkBuckets.js`)**:
  - Stage 1 Waterfall: `Needs Attention -> In Progress -> Upcoming (7d) -> Unscheduled -> Recently Completed (7d)`. Work items appear in exactly one section.
  - Stage 2 Reason Precedence: `Blocked > Overdue > Due Today > Review Requested`. Primary reason determines grouping; additional reasons visually render as secondary semantic badges (`Blocked · 2d overdue`).
- **User Timezone & DST-Safe Calendar Boundaries (`src/constants/dateUtils.js`)**:
  - Accepts user-configured timezone with fallback to browser runtime timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`) and `'UTC'`.
  - Computes date boundaries using `en-CA` calendar date strings (`YYYY-MM-DD`) and UTC date addition, preventing drift across daylight saving time transitions (such as 23-hour or 25-hour days).
- **Reconciled DataGrid Due-Date Grouping**: DataGrid and My Work share unified time semantics (`Overdue`, `Due Today`, `This Week`, `Later`, `No Due Date`) via `dateUtils.getDueDateGroup` without making DataGrid depend on My Work feature internals.
- **Scoped Preferences (`useMyWorkPreferences.js`)**: Persists active tab, per-tab projection choices, and Overview collapsed sections to `orynqo.myWorkPreferences.v1` in `localStorage`. Completely isolated from Sidebar preferences (`orynqo.sidebarPreferences.v1`).
- **My Work Summary Strip (`MyWorkSummaryStrip.jsx`)**: Ultra-compact 28px operational summary strip in the ContextBar (`Active · Overdue · Due Today · Blocked`).
- **Empty States (`EmptyWorkState.jsx`)**: Handles default neutral empty state (`"No active work assigned to you."` + `Browse Teams`) and filtered empty state (`"No work matches the active filters."` + `Reset Filters`).

### 2. Inherited from Shared Platform Infrastructure
- **DataGrid Projection (`src/views/DataGrid/`)**: Reused high-density DataGrid projection with virtualization, roving tabindex keyboard navigation, column reordering/resizing, and property pickers.
- **Kanban Board Projection (`src/views/KanbanBoard/`)**: Reused Kanban board projection grouped by status category with drag-and-drop status mutation.
- **Timeline Projection (`src/views/TimelineView/`)**: Reused canonical timeline projection as a pure consumer.
- **WorkItem Inspector (`src/features/work-items/`)**: Reused Inspector drawer for item inspection without context loss.
- **Quick Create (`src/features/work-items/quick-create/`)**: Reused Quick Create modal; contextually prefills `assigneeId = currentUser.id` while leaving `teamId = null` (unresolved) for explicit user choice.
- **Focus Restoration Infrastructure**:
  - In `DataGrid`: `useGridKeyboard` tracks `focusedRowIndex` and restores DOM focus to `[data-row-index]` when the Inspector drawer closes. Verified in shared test `ui-01d-execution-core-integration.test.jsx: Grid -> Inspector -> Close restores focus to originating Grid target`.
  - In `MyWorkOverview`: Overview renders custom section containers (`WorkBucketSection`). Overview rows currently open the Inspector, and the Overview remains mounted; native focus restoration on the Overview section buttons relies on shared returnFocusRef hooks.

---

## Verification Summary

### Targeted Test Run:
```text
npx vitest run src/__tests__/ui-03b-my-work.test.jsx
```
**Result**: 13 tests passed (0 failures).

### Full Regression Suite:
```text
npm test
```
**Result**: 10 test files passed, 162 total tests passed (0 failures).

### Production Build:
```text
npm run build
```
**Result**: Succeeded with code 0 (Vite v6.4.3 production bundle generated in 5.25s).

---

## Known Limitations / Deferred Items

- **Server-Side Cursor Pagination**: The query boundary is designed for cursor-based pagination and returns `pageInfo: { hasNextPage: false }`; server streaming/infinite scroll will connect when real backend APIs arrive.
- **Configurable Near-Term Window Settings**: The near-term window and completed-retention window are centralized constants (`MY_WORK_NEAR_TERM_DAYS = 7`, `MY_WORK_COMPLETED_RETENTION_DAYS = 7`); user customization via settings dialog is deferred to `PER-003` Settings phase.
- **Client Offline Mutation Queues**: Follows `SYS-003` guidelines (cached reads and active network states); persistent offline mutation write-queues remain deferred.
- **Timeline Capabilities**: Timeline remains a pure consumer of `TimelineView`; no Gantt engine, dependency editing, or scheduling modifications were introduced.
