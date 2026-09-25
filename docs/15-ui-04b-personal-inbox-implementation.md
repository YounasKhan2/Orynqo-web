# UI-04B — Personal Triage Inbox Implementation Record

- **Document Version:** `1.0.0`
- **Surface Identifier:** `PER-001` (Personal Triage Inbox)
- **Status:** **IMPLEMENTATION COMPLETE — PENDING HUMAN REVIEW**
- **Base Git SHA:** `6fe888dff789d3ee0bf99adabd8cf2e800306982`
- **Branch:** `feat/ui-04b-personal-inbox`
- **Lineage:** `docs/14-ui-04a-personal-inbox-product-ux-contract.md` $\rightarrow$ `docs/15-ui-04b-personal-inbox-implementation.md`

---

## 1. Executive Summary & Purpose

This phase implemented the frontend foundation and production architecture for **PER-001: Personal Triage Inbox** conforming faithfully to the approved and frozen `UI-04A Personal Triage Inbox Product & UX Contract v1.1.0`.

Inbox answers the operational question:
> *"What changed, arrived, or requires my awareness or response?"*

It is strictly distinct from **My Work (`PER-002`)**, which answers *"What work should I execute?"*, and from **Team Triage (`TEM-006`)**, which manages shared incoming work intake.

---

## 2. Feature Architecture

Inbox was implemented under a clean domain feature boundary in `src/features/inbox/`:

```text
src/features/inbox/
├── components/
│   ├── InboxCockpit.jsx          // Master split-pane container and triage coordinator
│   ├── InboxStream.jsx           // Dense virtualizable stream for rows and bundles
│   ├── InboxRow.jsx              // 44px dense row with unread/importance/excerpt indicators
│   ├── InboxBundle.jsx           // Pure presentation grouping container
│   ├── InboxToolbar.jsx          // Subheader controls (Unread, Needs Response, Archive Read)
│   ├── InboxDetailRouter.jsx     // Capability-aware routing (WRK-005, Doc, Project, Tombstone)
│   ├── InboxEmptyState.jsx       // Calm "You're caught up." and filtered empty states
│   ├── InboxBulkBar.jsx          // Floating heterogeneous multi-select triage bar
│   ├── SnoozePopover.jsx         // Quick snooze presets (Later Today, Tomorrow, Next Week)
│   └── index.js
├── hooks/
│   ├── useInboxQuery.js          // Keyset cursor pagination, filters, and bundle projection
│   ├── useInboxMutations.js      // Optimistic lifecycle mutations with exact rollback
│   ├── useInboxKeyboard.js       // J/K/E/Z/U/R keyboard triage engine with scope protection
│   ├── useInboxPreferences.js    // Isolated localStorage preferences under orynqo.inboxPreferences.v1
│   └── index.js
├── model/
│   ├── eventTaxonomy.js          // Deterministic taxonomy and family maps
│   ├── importanceClassifier.js   // Decoupled importance ('focus'|'normal') and responseRequired
│   ├── bundler.js                // Pure presentation bundling transformation
│   └── index.js
├── data/
│   └── initialNotifications.js   // Realistic development fixtures exercising all event types
└── index.js                      // Feature public API export
```

---

## 3. Canonical Domain Models & Invariants

1. **No Cloned Work Entities:**
   Inbox operates over recipient-specific `NotificationEvent` records referencing canonical source entities (`work_item`, `document`, `project`, `initiative`). No duplicate entities (such as `InboxTask` or `InboxWorkItem`) were created.
2. **ActivityEvent vs. NotificationEvent Separation:**
   `ActivityEvent` is preserved as an immutable canonical product activity history. Notification read/archive/snooze mutations only update `NotificationEvent.readAt`, `archivedAt`, or `snoozedUntil`.
3. **No Persistent NotificationBundle Entity:**
   Bundles are generated as dynamic presentation projections during query processing. Child `NotificationEvent` records retain their unique IDs, timestamps, and lifecycles. Actions on bundles resolve directly to underlying child IDs.
4. **Permanent Archive & Fresh Activity:**
   Archived notifications remain permanently archived and are never resurrected. New activity on a source entity generates a new `NotificationEvent` in active triage.

---

## 4. Four-Tab IA & Count Semantics

- **Tabs:** `Focus` | `All` | `Later` | `Archive`
- **Sidebar Inbox Badge:** Reflects strictly active, unarchived, unsnoozed, unread notifications within the current workspace scope.
- **Focus Count:** Active unsnoozed, unarchived items classified as `Focus`.
- **All Count:** Total active, unarchived, unsnoozed notifications in the queue.
- **Later & Archive:** Never inflate the active unread Sidebar badge.

---

## 5. Importance vs. Response Required

Importance and Action Requirement are decoupled into orthogonal dimensions:
- `importance: 'focus' | 'normal'` determines visual prominence and Focus tab eligibility.
- `responseRequired: boolean` determines whether an explicit decision/response is expected.
- Review and access requests are `focus + responseRequired: true`.
- Blocked dependencies and overdue alerts are `focus + responseRequired: false`.
- Ordinary followed updates are `normal + responseRequired: false`.

---

## 6. Contextual Detail & Capability Routing

- **WorkItem:** Reuses canonical `WorkItemDetailContainer` (`WRK-005`), preserving full editing, discussions, and activity tabs without duplicate logic.
- **Document:** Mounts document contextual notification preview with deep-link navigation to the canonical Document route.
- **Project & Initiative:** Routes to Project/Initiative briefings with direct canonical route navigation.
- **Inaccessible / Revoked Access:** Enforces safe tombstone rendering (*"This item is no longer accessible"* with complete redaction of title, snippets, and identifiers). Detail panes close safely on permission revocation.

---

## 7. Keyboard Triage Engine

Implemented semantic keyboard triage respecting the frozen scope hierarchy:
$$\text{GLOBAL} \rightarrow \text{PAGE/VIEW} \rightarrow \text{OVERLAY} \rightarrow \text{EDITABLE CONTROL}$$

- `j` / `ArrowDown`: Move selection to next item
- `k` / `ArrowUp`: Move selection to previous item
- `Enter` / `Space`: Open item / inspect detail / expand bundle
- `e`: Archive active item (auto-advances selection)
- `u`: Toggle read/unread state
- `z`: Open quick snooze popover
- `r`: Focus reply input
- `o`: Open canonical source canvas
- `Escape`: Deselect / close detail
- Single-key shortcuts are strictly suppressed when focus is within form inputs, textareas, or editable elements.

---

## 8. Verification & Test Coverage

1. **Focused Inbox Suite:**
   - Command: `npx vitest run src/__tests__/ui-04b-personal-inbox.test.jsx`
   - Results: **15 passed (15)** covering Query IA, Classification, Presentation Bundling, Deduping, Lifecycle mutations with optimistic rollback, Search zero-leakage, Preferences isolation, and App integration.
2. **Full Regression Suite:**
   - Command: `npm test`
   - Results: **11 test files passed (177 tests passed, 0 failed)** across all execution core and application shell surfaces.
3. **Production Build:**
   - Command: `npm run build`
   - Results: Zero compile/bundle errors; clean Vite production bundle generated.

---

## 9. Known Limitations & Deferred Items

- **Prototype / Local Data Adapter:** NotificationEvents are currently managed in-memory via `useInboxQuery` and `useInboxMutations`. The interfaces are cursor-ready (`createdAt + id` keyset) for future server-side pagination.
- **Real-Time Transport:** Technology-neutral triage stability (inflow queue banner `[ ↑ N new notifications ]`) is built into the state architecture; persistent WebSocket/SSE streams are deferred to backend phases.
- **Notification Settings Boundary (`PER-003`):** Advanced channel preferences and delivery digests remain deferred to `PER-003`.
