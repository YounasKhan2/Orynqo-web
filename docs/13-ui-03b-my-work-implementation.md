# UI-03B — My Work Implementation Record

- **Surface:** `PER-002 — My Work`
- **Branch:** `feat/ui-03b-my-work`
- **Status:** Implemented for Human Review
- **Source Contract:** `docs/12-ui-03a-my-work-product-ux-contract.md`

## Architecture Used

My Work is implemented as a feature-level projection over canonical `WorkItem` records. It does not introduce a `MyTask`, `PersonalIssue`, or duplicated work entity.

The implementation uses `WorkspaceContext` only as the current prototype/domain adapter. Presentation components receive query results through `useMyWorkQuery`, keeping the feature replaceable by a future server-state cache, cursor API, or normalized repository.

## Files Introduced

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

Additional integration:

- `src/App.jsx`
- `src/layouts/ContextBar/ContextBar.jsx`
- `src/features/work-items/quick-create/useQuickCreate.js`
- `src/__tests__/ui-03b-my-work.test.jsx`

## Query Boundary

`useMyWorkQuery` supports the approved scopes:

- `overview`: `assigneeId === currentUser.id`
- `assigned`: `assigneeId === currentUser.id`
- `created`: `creatorId === currentUser.id`
- `subscribed`: `subscriberIds.includes(currentUser.id)`

Scopes are workspace-bound and may overlap. The query boundary returns canonical items, summary metrics, optional overview buckets, and pagination metadata.

## Bucket Algorithm

`useMyWorkBuckets` implements the approved two-stage waterfall:

1. Needs Attention
2. In Progress
3. Upcoming
4. Unscheduled
5. Recently Completed

Needs Attention reason precedence is:

```text
Blocked > Overdue > Due Today > Review Requested
```

The near-term and completed-retention windows are centralized constants and default to 7 days.

## Projection Reuse

Assigned, Created, and Subscribed reuse the existing projections:

- `DataGrid`
- `KanbanBoard`
- `TimelineView`

No My Work-specific grid, board, timeline, or mutation fork was introduced.

## Inspector, Quick Create, and Mutations

Rows and cards open the frozen Work Item Inspector through the existing selected-item state. Inline updates are passed through the existing canonical `updateItem` path.

Quick Create from My Work sends:

```text
assigneeId = currentUser.id
teamId = null
```

Team remains unresolved for explicit user selection.

## Preferences

`useMyWorkPreferences` owns My Work tab, projection, and collapsed-section preferences in a dedicated local storage key. Sidebar preferences remain Sidebar-specific.

## Responsive Behavior

The feature preserves UI-02 shell behavior. DataGrid mobile behavior remains owned by the reusable DataGrid projection. The My Work overview uses compact row sections that scroll inside the primary canvas.

## Accessibility

Implemented semantics include:

- ContextBar tabs via `ResourceNavBar`
- Overview region labeling
- Section `aria-expanded`
- Row and grid cell roles for overview buckets
- Existing DataGrid keyboard semantics for tabular projection
- Existing Dialog and Inspector overlay behavior

This targets WCAG 2.2 AA behavior where applicable and is not a certification claim.

## Tests

Added `src/__tests__/ui-03b-my-work.test.jsx` covering:

- Assigned, Created, and Subscribed query scopes
- Cross-tab overlap
- Workspace boundary
- Bucket waterfall
- Multi-reason attention precedence
- User-local time buckets
- My Work shell rendering
- Overview projection hiding
- Assigned projection switcher rendering
- My Work Quick Create assignee prefill and unresolved Team

## Verification

Targeted test:

```text
npm test -- ui-03b-my-work.test.jsx
```

Result: 8 tests passed.

Full regression:

```text
npm test
```

Result: 10 test files passed, 157 tests passed.

Production build:

```text
npm run build
```

Result: passed. Vite reported the existing large chunk warning for the bundled application output.

## Known Limitations / Deferred Items

- `Created` and `Subscribed` depend on canonical mock/domain items supplying `creatorId` and `subscriberIds`; the query boundary supports them, but the current seed dataset is sparse.
- Offline cached reads and permission-loss fade behavior remain limited to existing platform infrastructure.
- Timeline remains a consumer of the existing TimelineView only; no Gantt, dependency editing, resize, or scheduling engine work was added.
