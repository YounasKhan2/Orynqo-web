# Orynqo Platform — UI-01A: Work Item Contract & Inspector Specification

**Status:** Completed Design Specification (Phase UI-01A — Ready for Human Review)  
**Governing Methodology:** `antigravity-enterprise-product-design`  
**Working Branch:** `design/ui-01a-work-item-inspector`  
**Authoritative Preceding Artifacts:**  
- `docs/04-ia-competitive-navigation-research.md` (FROZEN)  
- `docs/05-sidebar-navigation-contract.md` (FROZEN)  
- `docs/06-complete-page-and-surface-registry.md` (FROZEN)  
**Target Surfaces:**  
- `WRK-005`: Work Item Inspector Drawer (Primary Anchor)  
- `COL-001`: Threaded Discussion Inspector Panel  
- `COL-002`: Activity & Audit Trail Panel  
**Subsequent Phases (Not Authorized):** `UI-01B` (High-Density Data Grid), `UI-01C` (Quick Create & Pickers)  
**Implementation Rule:** STRICT DESIGN & CONTRACT PHASE ONLY. No production application code, UI components, or routes modified.

---

## 1. Executive Summary & Objective

Phase `UI-01A` establishes the **canonical Orynqo Work Item interaction system**, centered on the **Work Item Inspector (`WRK-005`)** and its tightly coupled collaboration surfaces: **Threaded Discussion (`COL-001`)** and **Activity History (`COL-002`)**.

In Orynqo, the Work Item is the atomic currency of execution. It is rendered, filtered, and manipulated across virtually every surface:
- Universal High-Density Data Grid (`WRK-001`)
- Workflow Kanban Board (`WRK-002`)
- Temporal Timeline / Gantt (`WRK-003`)
- Personal Cockpits (`PER-001` Inbox, `PER-002` My Work)
- Team Execution Hubs (`TEM-002` Overview, `TEM-003` Work, `CYC-001` Active Cycle)
- Project Workspaces (`PRJ-001`, `PRJ-003`)
- Living Spec Document Embeds (`DOC-002`)
- Omnisearch / Command Palette (`CMD-001`)

**Core Objective:** Design the context-independent, reusable interaction contract for inspecting, updating, discussing, and managing a canonical WorkItem without context loss. The Inspector does not know or care which surface opened it; it receives a canonical `WorkItem` reference and orchestrates atomic updates while preserving the caller's view and scroll position.

---

## 2. Non-Negotiable Architectural Invariants

1. **The Single Canonical WorkItem Law:**
   There is **exactly one** canonical WorkItem domain model. There shall never be parallel or divergent models such as `GridWorkItem`, `BoardWorkItem`, `ProjectTask`, `CycleTask`, or `DocumentTask`.
2. **Unidirectional Data Flow & Mutation Consistency:**
   Mutations occurring inside the Inspector (`WRK-005`) target the canonical WorkItem entity. Projections, grids, boards, and document embeds reconcile from the authoritative update:
   $$\text{Inspector Mutation} \longrightarrow \text{Canonical Domain Store} \longrightarrow \text{Reactive Reconciliation across Grid, Board, Docs}$$
3. **Context Independence:**
   The Inspector is completely agnostic of its opening container. The caller supplies the active context (item key, opener focus handle), and the Inspector preserves and restores that focus on close.
4. **Separation of Milestone and Document:**
   Milestones are checkpoint planning entities (`PRJ-004`). Documents are knowledge entities (`DOC-002`). Neither is a WorkItem subtype. WorkItems link to Milestones and Documents, but maintain distinct lifecycles.
5. **Privacy & Permission Symmetry:**
   Restricted related entities (dependencies, parent items, embedded specs) render as privacy-preserving placeholders. Zero protected metadata (title, assignee, status, comments) is leaked.

---

## 3. Current Repository Audit & Classification

Before designing the interface, the existing prototype codebase was audited against the frozen architecture:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   REPOSITORY ASSET AUDIT & CLASSIFICATION                              │
├───────────────────────────────┬─────────────────┬──────────────────────┬───────────────────────────────┤
│ File / Component              │ Current State   │ Architectural Tier   │ UI-01A Classification         │
├───────────────────────────────┼─────────────────┼──────────────────────┼───────────────────────────────┤
│ `InspectorDrawer.jsx`         │ Prototype       │ Domain Feature       │ REFACTOR (Extract sections,   │
│                               │                 │                      │ add tabs, decouple state)     │
│ `CreateItemModal.jsx`         │ Prototype       │ Domain Feature       │ KEEP / DEFER (Target: UI-01C) │
│ `constants/workItems.js`      │ Prototype       │ Domain Constants     │ REFACTOR (Remove `milestone`  │
│                               │                 │                      │ from types; add categories)   │
│ `PropertyRow.jsx`             │ Prototype       │ Design System Comp.  │ EXTEND (Support interactive   │
│                               │                 │                      │ focus, keyboard triggers)     │
│ `Drawer.jsx`                  │ Functional      │ Design System Over.  │ KEEP / GENERALIZE (Docked vs  │
│                               │                 │                      │ modal, focus restoration)     │
│ `Badge.jsx` / `StatusBadge`   │ Functional      │ Design System Prim.  │ KEEP (Standardize sizing)     │
│ `Avatar.jsx` / `UserAvatar`   │ Functional      │ Design System Prim.  │ KEEP (Accessible tooltips)    │
│ `Button.jsx` / `Input.jsx`    │ Functional      │ Design System Prim.  │ KEEP                          │
│ `tokens.js` / `index.css`     │ Foundation      │ Global Design Tokens │ EXTEND (Add status category   │
│                               │                 │                      │ semantic tokens if needed)    │
│ `WorkspaceContext.jsx`        │ Monolithic      │ App State Adapter    │ REFACTOR in implementation    │
│                               │                 │                      │ (Decouple UI from domain)     │
└───────────────────────────────┴─────────────────┴──────────────────────┴───────────────────────────────┘
```

### Critical Findings from Codebase Audit:
1. **Milestone Contamination in Types:** `src/constants/workItems.js` erroneously contained `milestone: { id: 'milestone', label: 'Milestone' }` in `ITEM_TYPE_DEFINITIONS`. This directly violated the frozen IA rule that Milestones are planning checkpoints, not WorkItem subtypes.
2. **Ad-Hoc Property Editing:** `InspectorDrawer.jsx` used cycle-on-click badge toggles (`nextIdx = (currentIndex + 1) % length`) without proper dropdown picker triggers or keyboard focus management.
3. **Conflated Discussion & Activity:** Comments and activity events were rendered in a single hardcoded list without filtering, pagination, or threaded reply affordances.

---

## 4. Canonical Work Item Product Contract

The WorkItem model is defined as an extensible product entity:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CANONICAL WORKITEM CONTRACT                     │
├─────────────────────┬──────────────────┬───────────────────────────────┤
│ Domain Attribute    │ Type / Format    │ Definition & Semantics        │
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ `id`                │ UUID / String    │ Immutable internal entity ID  │
│ `identifier` (Key)  │ String           │ Human-readable key (`ORY-142`)│
│ `title`             │ String           │ Single-line plain summary     │
│ `type`              │ Enum             │ `task` | `issue` | `bug`      │
│ `status`            │ String (Key)     │ Concrete team workflow status │
│ `statusCategory`    │ Enum (Derived)   │ `backlog` | `unstarted` |      │
│                     │                  │ `started` | `completed` |     │
│                     │                  │ `canceled`                    │
│ `priority`          │ Enum / Int       │ `urgent`(4)|`high`(3)|`med`(2)│
│                     │                  │ `low`(1) | `none`(0)          │
│ `assigneeId`        │ UUID / Null      │ Primary single owner          │
│ `creatorId`         │ UUID             │ Authoring identity            │
│ `subscriberIds`     │ UUID[]           │ Users notified of changes     │
│ `teamId`            │ UUID             │ Owning execution squad (Req.) │
│ `projectId`         │ UUID / Null      │ Bounded initiative deliverable│
│ `cycleId`           │ UUID / Null      │ Current or target sprint cadence│
│ `milestoneId`       │ UUID / Null      │ Project checkpoint gate       │
│ `estimate`          │ Number / Null    │ Story points or effort units  │
│ `startDate`         │ ISO-8601 / Null  │ Scheduled start date          │
│ `dueDate`           │ ISO-8601 / Null  │ Hard completion deadline      │
│ `labels`            │ String[]         │ Semantic taxonomy tags        │
│ `description`       │ Rich / Markdown  │ Formatted specification body  │
│ `parentId`          │ UUID / Null      │ Direct parent WorkItem        │
│ `subtaskIds`        │ UUID[]           │ Child WorkItems in hierarchy  │
│ `relations`         │ Object[]         │ Typed dependency edges:       │
│                     │                  │ `blocks`, `blocked_by`,       │
│                     │                  │ `relates_to`, `duplicate_of`  │
│ `linkedDocIds`      │ UUID[]           │ Canonical Docs / Living Specs │
│ `customFields`      │ Key-Value Map    │ Extensible metadata (Post-Core│
│ `lifecycle`         │ Enum             │ `active` | `archived` |       │
│                     │                  │ `deleted`                     │
│ `createdAt`         │ ISO-8601         │ Creation timestamp            │
│ `updatedAt`         │ ISO-8601         │ Last mutation timestamp       │
└─────────────────────┴──────────────────┴───────────────────────────────┘
```

---

## 5. Work Item Invariants

To guarantee platform integrity across all teams and views, the following invariants are strictly enforced:

1. **Mandatory Owning Scope:** Every WorkItem has **exactly one** owning Workspace and **exactly one** owning Team (`teamId` is required).
2. **Optional Planning Associations:** A WorkItem may optionally belong to zero or one Project (`projectId`), zero or one Cycle (`cycleId`), and zero or one Milestone (`milestoneId`).
3. **Single Assignee Baseline:** For CORE, a WorkItem has **zero or one active assignee**. Multiple assignees create ambiguous accountability; collaborative contributors participate via subscribers, comments, and reviewers.
4. **Hierarchy Constraints:**
   - A WorkItem cannot be its own parent or ancestor (acyclic directed graph).
   - Maximum recommended sub-item nesting depth is **2 levels** (`Task` $\rightarrow$ `Subtask` $\rightarrow$ `Sub-subtask`).
5. **Dependency Integrity:**
   - A WorkItem cannot block itself.
   - Circular blocking chains ($A \rightarrow B \rightarrow C \rightarrow A$) are rejected at the domain mutation boundary.
6. **Workflow State vs. Entity Lifecycle:**
   - `status` (`backlog`, `in_progress`, `done`) governs daily work execution.
   - `lifecycle` (`active`, `archived`, `deleted`) governs storage and retention. An item marked `Done` remains `active` until archived by retention policy.

---

## 6. Team Workflow Compatibility & Status Categories

To enable squad autonomy without breaking cross-workspace reporting, status is decoupled into a **Status Category** and a **Concrete Workflow Status**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   STATUS CATEGORY VS CONCRETE STATUSES                 │
├─────────────────────┬──────────────────┬───────────────────────────────┤
│ Status Category     │ Universal Intent │ Example Squad Configurations  │
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ **`backlog`**       │ Unvetted / Ideas │ • Backlog                     │
│                     │                  │ • Triage Review               │
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ **`unstarted`**     │ Committed / Ready│ • Todo                        │
│                     │                  │ • Next Up / Ready for Dev     │
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ **`started`**       │ Active Execution │ • In Progress                 │
│                     │                  │ • In Review / PR Open         │
│                     │                  │ • QA / Staging Verification   │
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ **`completed`**     │ Verified Delivery│ • Done                        │
│                     │                  │ • Released to Production      │
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ **`canceled`**      │ Discarded / Dup  │ • Canceled                    │
│                     │                  │ • Duplicate / Won't Do        │
└─────────────────────┴──────────────────┴───────────────────────────────┘
```

**Architectural Benefit:** Cross-team views (Portfolio Roadmaps, My Work, Analytics) group items by the 5 immutable **Status Categories**, while squads see their own customized status labels.

---

## 7. Inspector Information Architecture & Layout Structure

The Inspector employs a disciplined, single-scroll or docked two-column layout optimized for information scanning:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        WORK ITEM INSPECTOR LAYOUT                      │
├────────────────────────────────────────────────────────────────────────┤
│ HEADER: [KEY-1042] [Bug] [Breadcrumbs: Team / Project]   [Watch][Copy][X]│
├────────────────────────────────────────────────────────────────────────┤
│ TITLE: Auto-growing inline editable textarea                           │
├────────────────────────────────────────────────────────────────────────┤
│ PROPERTIES MATRIX (High-Density Key-Value Grid):                       │
│  Status:    [ In Review  ▾]       Assignee:  (Avatar) Elena Rostova    │
│  Priority:  [ Urgent ⚑   ▾]       Estimate:  [ 3 pts ]                 │
│  Team:      [ Core Plat. ▾]       Cycle:     [ Cycle 42 (Active) ▾]    │
│  Project:   [ Auth Migration ▾]   Due Date:  [ Sep 26, 2026 ▾]         │
│  Milestone: [ Beta Launch ▾]      Labels:    [ security ] [ auth ] [+] │
├────────────────────────────────────────────────────────────────────────┤
│ LIVING SPEC LINK (Contextual Banner):                                  │
│  [📄 Linked to PRD: Offline Sync Protocol — Section 3.2 →]             │
├────────────────────────────────────────────────────────────────────────┤
│ DESCRIPTION (Markdown Canvas / Click-to-edit):                         │
│  Strict verification of InResponseTo attributes in SAML assertions.    │
│  Ensure clock-skew tolerance is capped at 120 seconds.                 │
├────────────────────────────────────────────────────────────────────────┤
│ SUB-ITEMS & CHECKLIST (2/3 completed):                                 │
│  [x] Patch assertion consumer service endpoint                         │
│  [x] Add regression tests against captured malicious payloads          │
│  [ ] Update security audit documentation                               │
│  [+ Add subtask...]                                                    │
├────────────────────────────────────────────────────────────────────────┤
│ RELATIONSHIPS & DEPENDENCIES:                                          │
│  Blocks:     [ENG-1044: Client clock synchronization]                  │
│  Blocked By: [None]                                                    │
│  Related:    [ENG-1020: SAML Metadata Provider]                        │
├────────────────────────────────────────────────────────────────────────┤
│ LOWER COLLABORATION HUB (Segmented Tabs):                              │
│  [ Discussion (3) ]   [ Activity (8) ]   [ All History ]               │
│                                                                        │
│  (Discussion Tab Active)                                               │
│  • Sarah Jenkins (2h ago): Verified unblocks milestone.                │
│  • Alex Chen (30m ago): PR #482 passed staging fuzzer.                 │
│                                                                        │
│  [ Leave a comment... (@mention, markdown, Cmd+Enter to post) ] [Send] │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Detailed Section Contracts

### 8.1. Header Contract
- **Identity Display:** Shows monospace `identifier` (`ORY-142`) with 1-click copy affordance.
- **Type Indicator:** Icon + label badge (`task` [blue], `issue` [purple], `bug` [red]).
- **Context Breadcrumb:** Team name and Project name (if assigned).
- **Secondary Actions:**
  - `Subscribe / Watch` toggle button (bell icon; indicates if user receives notification events).
  - `Copy Reference Link` (copies canonical deep link).
  - `More Actions (...)`: Convert Type, Move to Team, Archive, Delete.
  - `Close (X)`: Discards open drawer and returns focus to list opener.

### 8.2. Title Interaction
- **Inline Click-to-Edit:** Rendered as clean typography that immediately focuses a borderless, auto-growing textarea on click or keyboard trigger (`t`).
- **Validation:** Minimum 1 non-whitespace character. Max length 255 characters.
- **Save Trigger:** `Blur` or `Cmd+Enter` / `Ctrl+Enter`.
- **Cancel Trigger:** `Escape` reverts text to authoritative state.
- **Optimistic Update:** Instant local reflection with subtle indicator until confirmed by domain store.

### 8.3. Description Interaction
- **Display Mode:** Formatted markdown canvas with syntax highlighting for code snippets, task lists, and links.
- **Edit Mode:** Seamless in-place editor. Supports standard shortcuts (`Cmd+B`, `Cmd+I`, `Cmd+K` link).
- **Empty State:** Subtle placeholder: *"Add a more detailed description, technical specs, or reproduction steps..."*
- **Save / Discard:** Click outside or press `Cmd+Enter` to save; `Escape` prompts discard if changes exist.

### 8.4. Reusable Property System Architecture
Every property row composes a uniform 3-part primitive:
$$\mathbf{PropertyRow} \longrightarrow \mathbf{PropertyTrigger\ (Button/Pill)} \longrightarrow \mathbf{EntityPicker\ Popover}$$

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        PROPERTY SYSTEM COMPOSITION                     │
├──────────────────┬───────────────────────┬─────────────────────────────┤
│ Property         │ Trigger Presentation  │ Picker Type (Target: UI-01C)│
├──────────────────┼───────────────────────┼─────────────────────────────┤
│ **Status**       │ Semantic StatusBadge  │ Single-select Status List   │
│ **Priority**     │ PriorityBadge + Icon  │ 5-tier Priority Popover     │
│ **Assignee**     │ UserAvatar + Name     │ Searchable User Roster      │
│ **Team**         │ Team Icon + Name      │ Searchable Team Directory   │
│ **Project**      │ Project Key + Name    │ Searchable Project Picker   │
│ **Cycle**        │ Cadence Icon + Number │ Active & Upcoming Cycles    │
│ **Milestone**    │ Flag Icon + Date      │ Project Milestones List     │
│ **Estimate**     │ Monospace Points Box  │ Number Input / Fib Scale    │
│ **Dates**        │ Date Pill / Range     │ Dual-month Calendar Popover │
│ **Labels**       │ Colored Tag Chips     │ Multi-select Tag Popover    │
└──────────────────┴───────────────────────┴─────────────────────────────┘
```

### 8.5. Relationships & Dependencies System
- **Relationship Categories:**
  - `parent`: The enclosing epic/initiative WorkItem.
  - `subtask`: Child tickets contributing to this item.
  - `blocks`: Items that cannot proceed until this item reaches a `completed` status.
  - `blocked_by`: Pre-requisite items preventing this item from finishing.
  - `relates_to`: Loose bidirectional conceptual connection.
  - `duplicate_of`: Closed in favor of an authoritative ticket.
- **Cycle Prevention:** Adding a `blocks` relationship executes an instantaneous client-side acyclic verification to prohibit transitive circular deadlocks ($A \rightarrow B \rightarrow A$).
- **Restricted Dependency Rule:**
  If a related ticket belongs to a private team the viewer cannot read:
  ```text
  [🔒 Restricted Issue (CORE-918)] — You do not have permission to view details.
  ```
  No title, assignee, or status is disclosed.

### 8.6. Linked Documents & Living Spec System
- **Bidirectional Spec Sync:** WorkItems created from a Living Spec PRD (`DOC-002`) retain a canonical `specDocId` and optional `blockAnchorId`.
- **Inspector Presentation:** Prominent context banner at the top of the description showing document title, doc type badge (`PRD`), and *"Open Spec in Context →"*.
- **Click Behavior:** Opens the Document Canvas (`DOC-002`) scrolled directly to the linked requirements section.

---

## 9. Collaboration Contract: Discussion (`COL-001`) vs. Activity (`COL-002`)

### 9.1. Architectural Decision
**Selected Model: Segmented Tabs with "Discussion" as Default.**

```text
[ Discussion (3) ]      [ Activity (12) ]      [ All History ]
```

### 9.2. Rationale & Trade-off Analysis
- **Why Not Unified GitHub-style Stream:** Interspersing automated bot commits, status flips, and tag adjustments among human comments creates excessive visual noise, causing critical engineering discussions to be missed.
- **Why Discussion Default:** High-velocity squad execution requires instant focus on human conversation (questions, blockers, code reviews).
- **Activity Tab Role (`COL-002`):** Houses immutable chronological audit history (property changes, before/after values, assignment changes) for enterprise compliance and debugging.
- **All History Tab:** Provides complete chronological interleaving for forensic audits when needed.

### 9.3. Discussion Contract (`COL-001`)
- **Composer:** Rich text input at bottom with keyboard submission (`Cmd+Enter`). Supports `@mentions`, markdown, code formatting, and attachments.
- **Threaded Replies:** Top-level comments support nested 1-level reply threads to prevent conversational fragmentation.
- **Reactions:** Standard emoji reaction bar (`👍`, `👀`, `🎉`, `🚀`, `❤️`) with participant roster tooltips.
- **Edit / Delete:** Comment author can edit or delete within a configurable time window; edited timestamp displayed.

### 9.4. Activity Contract (`COL-002`)
- **Event Grouping:** Consecutive property adjustments by the same actor within 5 minutes are aggregated into a single entry (e.g., *"Marcus Vance updated Status to In Review and assigned to Elena Rostova — 10m ago"*).
- **Before $\rightarrow$ After Diffing:** Visual diff badges for status transitions, priority shifts, and estimate changes.

---

## 10. Opening Context, Focus Restoration & Deep Linking

### 10.1. Caller Independence & Focus Restoration
The Inspector maintains a clean contract with the calling view:
1. **Triggering Item Record:** Caller provides `{ itemId, returnFocusRef }`.
2. **Context Preservation:** The background view does **not** unload or reset scroll position.
3. **Focus Return on Dismissal:** When the user closes the Inspector via `Escape`, close button, or overlay backdrop, focus **immediately and reliably returns** to the exact list row or board card that opened it.

### 10.2. Deep Linking Contract
- **Contextual Inspector Link:** URL appends a query parameter: `/teams/core/work?inspect=ORY-142` (provisional route taxonomy).
- **Universal Resolution:** Sharing this URL opens the parent container with the Inspector drawer pre-expanded.
- **Missing / Deleted Item:** If `inspect` parameter references a non-existent or deleted ticket, `SYS-001 (Tombstone)` renders inside the drawer with search suggestions.
- **Access Denied:** If ticket is restricted, `SYS-002 (Permission Gateway)` renders inside the drawer with a 1-click *"Request Access"* flow.

---

## 11. Full-Page Work Item vs. Inspector Architectural Decision

### 11.1. Decision: Inspector-First with Responsive Full-Screen Translation
Orynqo adopts a **Dual-Mode Single-Component Architecture**:

1. **Desktop Standard Mode:** Docked/floating context-preserving Inspector Drawer (`WRK-005`).
2. **Desktop Expanded Mode:** A *"Full-Screen Expansion"* toggle (`Expand` icon in header) expands the Inspector into a maximized reading canvas for complex PRDs or tickets with 50+ comments.
3. **Mobile / Narrow Tablet:** Automatically translates into a full-screen mobile surface with sticky header and mobile-optimized touch pickers.
4. **Canonical Route Support:** Dedicated direct route `/work/items/ORY-142` mounts the **exact same WorkItem content container** in a standalone page shell for external browser links and email notifications.

**Crucial Invariant:** There is **zero code duplication** between the Inspector drawer and full-page mode; both compose the same `<WorkItemDetailContainer />`.

---

## 12. Keyboard Interaction & Accessibility Model

### 12.1. Strict Keyboard Scope Hierarchy
To prevent shortcut collisions, the system enforces a strict priority stack:
$$\text{OVERLAY / DRAWER SCOPE} \succ \text{PAGE SCOPE} \succ \text{GLOBAL SCOPE}$$
When an editable input or textarea is active, all navigation shortcuts are suppressed.

### 12.2. Candidate Shortcut Map
*(Marked as Candidate Shortcut / Interaction Intent; final key bindings pending global shortcut inventory)*:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CANDIDATE KEYBOARD SHORTCUTS                    │
├─────────────────────┬──────────────────┬───────────────────────────────┤
│ Action              │ Candidate Key    │ Behavioral Intent             │
├─────────────────────┼──────────────────┼───────────────────────────────┤
│ Close Inspector     │ `Escape`         │ Dismisses drawer, restores    │
│                     │                  │ focus to triggering row/card  │
│ Edit Title          │ `t`              │ Focuses title textarea        │
│ Edit Description    │ `d`              │ Focuses description editor    │
│ Change Status       │ `s`              │ Opens Status Picker dropdown  │
│ Change Priority     │ `p`              │ Opens Priority Picker popover │
│ Change Assignee     │ `a`              │ Opens User Roster picker      │
│ Edit Labels         │ `l`              │ Opens Tag Picker popover      │
│ Focus Comment Input │ `m`              │ Scrolls to and focuses comment│
│ Traverse Properties │ `Tab` / `S-Tab`  │ Linear keyboard focus loop    │
│ Submit Edit/Comment │ `Cmd+Enter`      │ Persists mutation immediately │
└─────────────────────┴──────────────────┴───────────────────────────────┘
```

### 12.3. Accessibility (WCAG 2.2 AA Compliance)
- **Landmark & Roles:** Rendered with `role="dialog"` or `role="complementary"`, with `aria-label="Work Item Details: ORY-142"`.
- **Accessible Attributes:** Property triggers use `aria-haspopup="listbox"` and `aria-expanded`.
- **Focus Management:** Focus is trapped within the drawer when running in overlay/modal mode. Focus returns cleanly on exit.
- **Color Contrast:** All status badges and priority indicators maintain $\ge 4.5:1$ contrast against their badge backgrounds.
- **Screen Reader Announcements:** Dynamic status transitions announce via an ambient `aria-live="polite"` region.

---

## 13. State Matrix

Every component within UI-01A defines explicit behavior across all functional states:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                          UI-01A STATE MATRIX                                           │
├─────────────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────────────┤
│ Component           │ Loading      │ Populated    │ Empty        │ Error        │ Read-Only / Restricted│
├─────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────────────┤
│ **Header**          │ Shimmer Key  │ Key, Type,   │ N/A          │ Error Badge  │ Read-only badge,     │
│                     │ & Badges     │ Breadcrumbs  │              │              │ actions disabled     │
├─────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────────────┤
│ **Title**           │ Skeleton Bar │ Auto-grow    │ "Untitled"   │ Red border,  │ Plain uneditable     │
│                     │ (32px)       │ Textarea     │ Placeholder  │ retry toast  │ text element         │
├─────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────────────┤
│ **Properties**      │ 8 Shimmer    │ Interactive  │ "None" / "-" │ Reverts to   │ Non-interactive pills│
│                     │ Key-Val Rows │ Badges/Pills │ muted pill   │ last valid   │ (no dropdown arrows) │
├─────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────────────┤
│ **Description**     │ 3 Shimmer    │ Rendered     │ Muted add    │ "Failed to   │ Plain markdown view; │
│                     │ text blocks  │ Markdown     │ spec prompt  │ load spec"   │ edit triggers hidden │
├─────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────────────┤
│ **Sub-items**       │ Checkbox     │ Interactive  │ "No subtasks"│ Mutation     │ Checkboxes disabled, │
│                     │ placeholders │ Task List    │ + Add button │ failure alert│ "+ Add" hidden       │
├─────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────────────┤
│ **Relationships**   │ Pill shimmer │ Blocks / Dep │ "No blockers"│ Cycle warning│ Restricted cards     │
│                     │ blocks       │ Linked Cards │ indicator    │ modal        │ with lock icon       │
├─────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────────────┤
│ **Discussion**      │ 2 Skeleton   │ Threaded     │ Zero-comment │ Send failure │ Comment input hidden │
│                     │ comment cards│ Discussion   │ prompt card  │ + retry btn  │ ("Read-only archive")│
├─────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────────────┤
│ **Activity**        │ Shimmer log  │ Grouped diff │ "No activity │ Stream error │ Fully visible for    │
│                     │ rows         │ history rows │ recorded"    │ notice       │ compliance auditing  │
└─────────────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────────────┤
```

---

## 14. Optimistic UX & Concurrency Contract

1. **Immediate Optimistic Reflection:** When a property is altered (e.g. status $\rightarrow$ `In Review`), the UI updates immediately in $<16\text{ms}$.
2. **Pending Indication:** A microscopic pulse indicator on the property signalizes background persistence.
3. **Rollback on Network Failure:** If the mutation fails, the value rolls back smoothly to its authoritative value, and an actionable toast alerts the user (`"Unable to update status: Network offline — [Retry]"`).
4. **Non-Blocking Remote Conflict Resolution:**
   If another collaborator updates the ticket while the Inspector is open:
   - For non-conflicting properties (e.g. they changed Assignee while you edited Description), the new Assignee updates seamlessly.
   - For conflicting properties (e.g. both edited Title), a subtle non-blocking banner appears:
     ```text
     [⚠️ Alex Chen updated the Title 10s ago — [Review Changes] [Dismiss] ]
     ```
   The user's local in-progress edit is never aggressively overwritten.

---

## 15. Component Architecture & Implementation Ownership

The UI-01A implementation will follow strict vertical feature boundaries:

```text
src/
├── design-system/                  # Domain-Neutral Primitives (FROZEN/EXTENDED)
│   ├── primitives/
│   │   ├── Badge.jsx               # StatusBadge, PriorityBadge, TypeBadge
│   │   ├── Avatar.jsx              # UserAvatar
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Checkbox.jsx
│   │   └── Kbd.jsx
│   └── overlays/
│       ├── Drawer.jsx              # Generic resizable slide-over shell
│       └── Popover.jsx
│
├── components/                     # Global Shared Product Components
│   ├── EntityReference.jsx         # Universal [KEY-101] pill with hover card
│   ├── RestrictedPlaceholder.jsx   # Privacy-preserving lock card
│   └── EmptyState.jsx              # Zero-data presentation block
│
└── features/work-items/            # Work Item Domain Feature Module
    ├── components/
    │   ├── WorkItemInspector.jsx           # Master Inspector orchestrator
    │   ├── WorkItemHeader.jsx              # Key, type, breadcrumbs, close
    │   ├── WorkItemTitle.jsx               # Inline editable title
    │   ├── WorkItemDescription.jsx         # Markdown canvas with edit trigger
    │   ├── WorkItemProperties.jsx          # High-density property matrix
    │   ├── WorkItemSubtasks.jsx            # Checklist with completion counter
    │   ├── WorkItemRelationships.jsx       # Dependency edges (blocks, etc.)
    │   ├── WorkItemLinkedDocs.jsx          # Living Spec PRD reference banner
    │   ├── WorkItemDiscussion.jsx          # COL-001 Threaded discussion hub
    │   └── WorkItemActivity.jsx            # COL-002 Audit log stream
    ├── hooks/
    │   ├── useWorkItem.js                  # Loads & mutates canonical item
    │   └── useWorkItemKeyboard.js          # Inspector keyboard shortcuts
    └── index.js
```

---

## 16. Realistic Product Data Validation Scenarios

The design contract is validated against 8 concrete scenarios using realistic distributed systems and infrastructure work items:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        VALIDATION SCENARIOS                            │
├──────────────┬────────────────────────────────────────────────────────┤
│ Scenario     │ Concrete Context & Validation Criteria                 │
├──────────────┼────────────────────────────────────────────────────────┤
│ **A: Fast**  │ `ENG-1041`: Developer opens from Data Grid, presses    │
│ **Status**   │ `s`, arrows down to `Done`, presses `Enter`, presses   │
│ **Change**   │ `Esc`. Focus returns to exact grid row; item reflects  │
│              │ `Done` instantaneously. Total interaction time < 2s.   │
├──────────────┼────────────────────────────────────────────────────────┤
│ **B: Complex**│ `PLAT-87` (Prevent duplicate webhook deliveries):      │
│ **Issue**    │ Has 1 Living Spec link, 3 blocks relations, 8 labels,  │
│              │ 6 subtasks, 18 discussion comments, 42 activity events.│
│              │ Inspector remains clean, scrolling is performant, tabs │
│              │ prevent activity noise from overwhelming discussion.   │
├──────────────┼────────────────────────────────────────────────────────┤
│ **C: Minimal**│ `WEB-12` (Update favicon):                             │
│ **Issue**    │ Title + status only. No project, no cycle, no subtasks.│
│              │ Empty states are calm and purposeful; no card soup.    │
├──────────────┼────────────────────────────────────────────────────────┤
│ **D: Read-** │ External auditor viewing `SEC-104` (SOC2 Audit Trail): │
│ **Only**     │ Cannot edit title, pickers are disabled, comment input │
│              │ is replaced with *"Read-only access"*. No UI breaks.   │
├──────────────┼────────────────────────────────────────────────────────┤
│ **E: Restr-**│ `CORE-501` blocks `CORE-918` (Private Security Vault): │
│ **icted Rel**│ Viewer lacks permissions for `CORE-918`. Shows lock    │
│              │ card without disclosing title, assignee, or status.    │
├──────────────┼────────────────────────────────────────────────────────┤
│ **F: Mutat-**│ Network disconnects while editing estimate. Property   │
│ **ion Fail** │ reverts to previous points with an ambient error toast.│
├──────────────┼────────────────────────────────────────────────────────┤
│ **G: Mobile**│ Deep link opened on iPhone 15:                         │
│ **Screen**   │ Inspector opens as full-width mobile view with sticky  │
│              │ top navigation and touch-friendly bottom sheets.       │
├──────────────┼────────────────────────────────────────────────────────┤
│ **H: Pure**  │ Power user triages without touching mouse:             │
│ **Keyboard** │ `t` (edit title) $\rightarrow$ `Cmd+Enter` (save)      │
│              │ $\rightarrow$ `p` (priority) $\rightarrow$ `Esc` (exit)│
└──────────────┴────────────────────────────────────────────────────────┘
```

---

## 17. Explicit UI-01A Implementation Scope

When authorization is granted to begin code implementation, the scope is strictly bounded to:

### Included in UI-01A Implementation:
1. **Clean Domain Model Boundary:**
   - Correct `src/constants/workItems.js` (remove `milestone` from item types; add status category mappings).
   - Normalize WorkItem mock objects in `src/data/mockData.js` to adhere to the canonical schema.
2. **Work Item Inspector Component Suite:**
   - Implement `WorkItemInspector.jsx` composing `Drawer.jsx`.
   - Implement `WorkItemHeader.jsx`, `WorkItemTitle.jsx`, `WorkItemProperties.jsx`.
   - Implement `WorkItemDescription.jsx` with markdown preview and click-to-edit.
   - Implement `WorkItemSubtasks.jsx` with interactive completion toggles.
   - Implement `WorkItemRelationships.jsx` with dependency badges and restricted placeholders.
   - Implement `WorkItemLinkedDocs.jsx` with Living Spec reference banner.
3. **Collaboration Surfaces:**
   - Implement `WorkItemDiscussion.jsx` (`COL-001`) with comments and composer.
   - Implement `WorkItemActivity.jsx` (`COL-002`) with grouped mutation diffs.
4. **Keyboard & Focus Handling:**
   - `Escape` dismiss with focus restoration.
   - Shortcut hooks for title, description, and property focus.
5. **State Handling:**
   - Loading skeletons for opening drawer.
   - Read-only and restricted entity rendering.
   - Optimistic status/priority updates with error toast fallback.
6. **Automated Unit & Integration Tests:**
   - Verification of single canonical entity mutations.
   - Focus restoration tests.
   - Milestone exclusion validation.

### Excluded from UI-01A (Deferred to Later Slices):
- `UI-01B`: Universal Data Grid overhaul and keyboard grid cell engine.
- `UI-01C`: Universal Quick Create Modal (`CMD-002`) and full Popover Pickers (`CMD-003`).
- Full Rich-Text Wysiwyg / Document Block Editor (belongs to `UI-04B`).
- Team / Project / Cycle pages (belongs to `UI-03` and `UI-05`).
- Backend synchronization protocols and database schemas.
- Custom field schema builder.

---

## 18. Open Decisions for Human Review

Before initiating code implementation, the following architectural choices are submitted for human alignment:

1. **Initial WorkItem Type Set:**
   The design specifies three initial canonical types: **Task**, **Issue**, and **Bug** (excluding Milestone, which is a planning entity). Does Human Review endorse this tight 3-type set, or should **Chore** / **Feature** be retained in CORE? *(Recommendation: Task, Issue, Bug is cleanest and lowest noise).*
2. **Discussion Tab vs. Unified Stream Default:**
   The design establishes the **Discussion Tab** as default, with Activity placed in a secondary tab to prevent automated audit events from obscuring human discussion. Does Human Review approve this separation over a unified GitHub-style feed? *(Recommendation: Approve segmented tabs for reduced cognitive noise).*
3. **Authorization to Implement UI-01A:**
   Confirm authorization to begin code implementation of `UI-01A` on the `design/ui-01a-work-item-inspector` branch in accordance with the explicit scope above.

---

> [!IMPORTANT]
> **STOPPED AT HUMAN REVIEW — UI-01A DESIGN**  
> Complete design and interaction contract is finalized in [`docs/07-ui-01a-work-item-inspector-contract.md`](file:///d:/Full_Stack_Apps/Orynqo-web/docs/07-ui-01a-work-item-inspector-contract.md).  
> Work has halted here.  
> - No application code, UI components, routes, or mockups were modified.  
> - Awaiting Human Review endorsement to commence code implementation of `UI-01A`.
