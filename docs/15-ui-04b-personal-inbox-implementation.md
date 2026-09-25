# UI-04B — Personal Triage Inbox Implementation Record

- **Document Version:** `1.1.0` (Correction Pass 01A)
- **Surface Identifier:** `PER-001` (Personal Triage Inbox)
- **Status:** **IMPLEMENTATION VERIFIED — PENDING HUMAN REVIEW**
- **Base Git SHA:** `6fe888dff789d3ee0bf99adabd8cf2e800306982`
- **Reviewed HEAD:** `a6a202a57de2e9d96a2bf7464509f6dbc06a0c62`
- **Branch:** `feat/ui-04b-personal-inbox`
- **Lineage:** `docs/14-ui-04a-personal-inbox-product-ux-contract.md` $\rightarrow$ `docs/15-ui-04b-personal-inbox-implementation.md`

---

## 1. Executive Summary & Purpose

This implementation record documents the frontend foundation and production architecture for **PER-001: Personal Triage Inbox**, incorporating all required corrections from **UI-04B Implementation Correction Pass 01A**.

Inbox answers the operational question:
> *"What changed, arrived, or requires my awareness or response?"*

It remains strictly distinct from:
- **My Work (`PER-002`)**: *"What work should I execute?"* (Execution truth)
- **Team Triage (`TEM-006`)**: Shared unassigned incoming intake

---

## 2. Implementation Taxonomy: Direct, Inherited, Verified, Deferred

### 2.1 Directly Implemented by UI-04B
1. **Tenant- and Recipient-Scoped `archiveAllRead`:**
   - Accepts either explicit ID arrays or an explicit tenancy scope (`{ workspaceId, recipientUserId }`).
   - Filters strictly for active, unarchived, unsnoozed notifications owned by the target recipient. Never scans or mutates notifications outside the caller's authorized scope.
2. **Bulk-Selection UI & Lifecycle Actions:**
   - Multi-selection state (`multiSelectedIds`) wired across `InboxStream`, `InboxBundle`, `InboxRow`, and `InboxBulkBar`.
   - Accessible row checkboxes (`aria-label="Select <identifier>"`) and bundle checkboxes with indeterminate states.
   - Bundle actions correctly resolve to child `NotificationEvent` IDs.
   - Bulk action bar appears only when selection exists and clears predictably upon action execution or tab switching.
3. **Responsive Contract & Breakpoint Tokens:**
   - Integrated `INBOX_LAYOUT` tokens (`streamDefaultWidth: 420px`, `streamMinWidth: 360px`, `streamMaxWidth: 480px`, `compactBreakpoint: 900px`, `mobileBreakpoint: 640px`).
   - Wide View: Dual split-pane (Stream + Contextual Detail).
   - Compact View (< 900px): Full-width stream with contextual overlay drawer (`data-keyboard-scope="OVERLAY"`).
4. **Predictable Focus Restoration:**
   - Detail closure (`handleCloseDetail`) restores DOM focus to the originating row element (`data-notification-id`) or nearest surviving stream item when items are archived/removed.
5. **Triage Stability Pending Queue Adapter:**
   - Technology-neutral queue adapter (`pendingQueue` and `ingestNewEvents`) buffers incoming notifications during active triage sessions.
   - Interactive pill `[ ↑ N new notifications ]` allows explicit, user-triggered flushes into active triage without viewport jumps.
6. **Isolated Preferences Storage:**
   - Dedicated local storage key `orynqo.inboxPreferences.v1` preserving tab and filter settings without touching Sidebar or My Work keys.

### 2.2 Inherited from Existing Infrastructure
1. **Execution Core Pickers & Canonical WorkItem Inspector:**
   - Reused canonical `WorkItemDetailContainer` (`WRK-005`) directly. WorkItem mutations propagate directly to canonical state via `onUpdateWorkItem`, with zero local cloning.
2. **Keyboard Scopes & Hierarchy:**
   - Respects established hierarchy: $\text{GLOBAL} \rightarrow \text{PAGE/VIEW} \rightarrow \text{OVERLAY} \rightarrow \text{EDITABLE CONTROL}$.
   - Inherits `isEditableElement` suppression and overlay detection (`[data-keyboard-scope="OVERLAY"]`).
3. **Design System Primitives & Tokens:**
   - Utilizes core typography, colors, radii, shadows, and button primitives.

### 2.3 Verified by Automated Regression Suite
- **Scoped `archiveAllRead` Isolation:** Proves another workspace or user's notifications are untouched.
- **Deterministic Snooze Expiry:** Snoozed events return to active triage when `snoozedUntil <= now` without altering canonical IDs or corrupting read state.
- **Archive Permanence & Event Identity:** Historical archived events remain archived; subsequent activity creates distinct new active events.
- **Bundle Safety:** Direct mentions, review requests, access requests, and different entity updates never bundle together.
- **Permission Revocation While Detail Open:** Redacted items transition to safe tombstones; confidential metadata cannot be found via search.
- **Count Mutation Consistency:** Sidebar badge accurately reflects canonical unread count across all lifecycle transitions (mark read, mark unread, archive, unarchive, snooze, unsnooze).

### 2.4 Deferred to Backend & Subsequent Phases
- **Real-Time Push Transport:** Persistent WebSocket/SSE subscription adapters are deferred to backend event-delivery milestones.
- **Backend Keyset Pagination:** Client interfaces use keyset cursor format (`createdAt + id`); backend pagination queries remain deferred.
- **Notification Settings Boundary (`PER-003`):** Global/team delivery digests and delivery channel toggles (email, desktop push) are deferred to `PER-003`.

---

## 3. Verification & Test Evidence

- **Focused Test Suite:** `npx vitest run src/__tests__/ui-04b-personal-inbox.test.jsx`
  - Result: **22 passed (22)**
- **Full Test Suite:** `npm test`
  - Result: **11 test files passed (184 passed, 0 failed)**
- **Production Bundle:** `npm run build`
  - Result: Clean Vite bundle generated with zero errors.
