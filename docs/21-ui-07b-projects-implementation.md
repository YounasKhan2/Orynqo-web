# UI-07B — Projects Core Implementation Report

## Document Metadata
- **Specification:** UI-07B / PRJ-001 through PRJ-007
- **Contract Baseline:** UI-07A v1.1.0 (`aa569c2b53142d79af67ed3644908da9d29501d4`)
- **Status:** Complete — Ready for Human Review

---

## 1. Executive Summary

UI-07B delivers the core implementation of Orynqo's canonical **Project operating model**, strictly adhering to the approved and frozen UI-07A v1.1.0 contract. A Project coordinates cross-functional delivery towards a bounded outcome while strictly upholding team ownership invariants:
1. **WorkItem Team Ownership Invariant:** WorkItems are permanently owned by exactly one team (`workItem.teamId`). Project association never changes or overrides WorkItem team ownership.
2. **Multi-Team Participation (`0..N`):** Projects support `0..N` participating teams and `0..1` Lead Team (`leadTeamId ∈ participatingTeamIds`). Zero-team projects are permitted.
3. **No Silent Team Participation:** Associating a WorkItem from a non-participating team requires explicit decision and confirmation.
4. **Orthogonal State Model:** `operationalState` (`planned`, `in_progress`, `paused`, `completed`, `cancelled`), `archiveState` (`active`, `archived`), and `health` (`unset`, `on_track`, `at_risk`, `off_track`) are strictly separated.
5. **Transparent Empirical Progress:** Displayed as an unambiguous ratio and percentage (`M / N • X%`), excluding cancelled items and archived items.
6. **Canonical Single-Edge Dependencies:** Directed edge `A blocks B` with BFS cycle detection strictly rejecting self-dependencies and directed cycles at the mutation boundary.
7. **Canonical Updates:** Historical immutable narrative snapshots that update current Project health without silently mutating target date.
8. **Project-Owned Milestones:** Sequential delivery gates with `0..1` milestone per WorkItem. Milestone completion does not alter WorkItem status.
9. **Zero-Leakage Authorization:** Inaccessible projects and items are completely omitted from counts, queries, and pickers.

---

## 2. Implementation Architecture

The Projects feature adheres to the system's unidirectional dependency hierarchy:
`Design System` → `Global Components` → `Domain Features` → `Page Components` → `Routes`

```text
src/features/projects/
├── model/
│   ├── projectModel.js           # Canonical project representation, invariants, progress calculation
│   ├── projectDependencies.js    # Single-edge directed dependency engine & BFS cycle detection
│   ├── projectMilestones.js      # Milestone model, WorkItem cardinality (0..1), non-destructive archive
│   ├── projectUpdates.js         # Immutable historical narrative updates & health side-effects
│   └── index.js
├── hooks/
│   ├── useProject.js             # Single project retrieval, draft preservation, concurrency protection
│   ├── useProjectsDirectoryQuery.js # Scalable directory query, multi-facet filtering & sorting
│   ├── useProjectWorkQuery.js    # Filtered WorkItem projection & multi-squad grouping
│   ├── useProjectMilestones.js   # Milestone sequence ordering & progress rollup
│   ├── useProjectUpdates.js      # Chronological updates & health synchronization
│   ├── useProjectDependencies.js # Inbound & outbound dependency resolution
│   └── index.js
├── components/
│   ├── ProjectHealthBadge.jsx    # Accessible semantic health badge (non-color-only)
│   ├── ProjectHeader.jsx         # Compact identity, reference, lead, state/health, actions
│   ├── ProjectOverviewTab.jsx    # PRJ-001: Operational cockpit & charter
│   ├── ProjectWorkTab.jsx        # PRJ-002: Execution projection (Grid, Board, Timeline)
│   ├── ProjectDocsTab.jsx        # PRJ-003: Canonical documents association
│   ├── ProjectMilestonesTab.jsx  # PRJ-004: Sequential delivery gates & item listing
│   ├── ProjectActivityTab.jsx    # PRJ-005: Canonical ActivityEvent stream
│   ├── ProjectSettingsTab.jsx    # PRJ-006: Metadata, team participation, dependencies, danger zone
│   ├── ProjectUpdateModal.jsx    # Narrative update publication modal
│   ├── ProjectsDirectory.jsx     # PRJ-007: High-density workspace project catalogue
│   ├── ProjectWorkspace.jsx      # Shell orchestrating resource tabs & overlays
│   └── index.js
└── index.js                      # Root domain feature exports
```

---

## 3. Delivered Core Surfaces

### PRJ-001 — Project Overview
- Compact operational home displaying Project Charter & Scope, transparent delivery progress (`M / N • X%`), latest historical Project Update with health snapshot and active blockers, participating teams with the Lead Team badge highlighted, delivery milestones preview, associated canonical documents, and active dependency blockers.

### PRJ-002 — Project Work
- Reuses existing canonical view projections: DataGrid (`WRK-001`), Kanban Board (`WRK-002`), and Timeline (`WRK-003`).
- Displays owning team for each WorkItem without mutating ownership.
- Supports multi-axis grouping by Team, Milestone, Status, Assignee, and Priority.
- Selecting any item opens the canonical `WRK-005` WorkItem Inspector.

### PRJ-003 — Project Docs
- Exclusively queries canonical Documents associated with the Project via the frozen UI-06 model (`doc.projectIds` or `doc.contextAssociations.projectIds`).
- Contextual creation passes `{ projectIds: [project.id] }` using canonical entity identity.
- Opening any document delegates directly to canonical `DOC-002` Document Canvas.

### PRJ-004 — Project Milestones
- Project-owned delivery gates in sorted sequence.
- Enforces `0..1` milestone per WorkItem belonging to the owning Project.
- New assignment rejects archived milestones; existing assignments to archived milestones are non-destructively preserved.
- Completing a milestone leaves incomplete WorkItems intact.
- Archiving a milestone is non-destructive and retains historical WorkItem references.

### PRJ-005 — Project Activity
- Meaningful chronological stream of canonical `ActivityEvent` records (creation, health revisions, updates posted, milestone completions, team participation changes).

### PRJ-006 — Project Settings & Access
- General configuration: name, scope summary, operational state, target completion date.
- Team participation: toggle participating teams, assign Lead Team (`leadTeam ∈ participatingTeams`).
- Team Removal Safety: blocks removing a participating team if active (non-cancelled, non-archived) WorkItems are owned by that team in the Project.
- Dependency management: add blocker edges with directed cycle validation; rendered blocker and dependent lists allow removing edges.
- Danger Zone: Complete Project (preserves all WorkItems, Milestones, and Docs), Archive / Restore Project (non-destructive).

### PRJ-007 — Projects Directory
- High-density catalogue designed for thousands of projects.
- Faceted filtering: operational state, archive state (`active` / `archived` / `all`), health (`on_track` / `at_risk` / `off_track`), participating team.
- Search filter over reference, title, and charter summary.
- Standard columns: Reference, Project Name & Summary, Project Lead, Participating Teams, Operational State, Health Badge, Target Date, and Progress Bar.

---

## 4. Canonical Integration Boundaries & State Architecture

In Implementation Correction Pass 01A, component-local state silos were completely eliminated in favor of canonical application state ownership:
1. **Canonical State Lifecycles:** Project dependencies (`projectDependencies`), milestones (`projectMilestones`), and updates (`projectUpdates`) are owned at the application root (`App.jsx`), initialized from canonical fixtures, and provided via explicit mutation handlers (`onAddDependency`, `onRemoveDependency`, `onAddMilestone`, `onUpdateMilestone`, `onArchiveMilestone`, `onCompleteMilestone`, `onPostUpdate`).
2. **Unified Favorite Architecture:** Standalone, siloed favorite project collections were eliminated; Projects integrate directly with the polymorphic `useFavorites` hook (`targetType: 'project'`, `targetId: project.id`).
3. **Document Association Alignment:** Project document listing and quick creation conform strictly to the frozen UI-06 contract (`projectIds` and `contextAssociations.projectIds`).
4. **Authoritative Concurrency Mutation:** Client-side artificial version increments were removed from `useProject`; version advancement is authoritatively governed by the mutation boundary (`handleUpdateProject`).
5. **Team Removal Safety Guard:** Participating squads cannot be silently dropped while active WorkItems belong to them in the project.

---

## 5. Invariant Verification & Test Coverage

All 14 test suites in the repository are passing with **zero skips and zero failures** (297 tests green):

| Suite | Status | Focus |
|---|---|---|
| `ui-07b-projects.test.jsx` | PASS (32/32) | Unit invariants (orthogonal states, lead team rules, team ownership preservation, transparent progress, zero-leakage progress, single-edge dependencies, directed BFS cycle rejection, milestone cardinality & non-destructive archive, immutable update snapshots) + Component rendering (PRJ-001, PRJ-006, PRJ-007) + Real Production-Path Integration Tests (Sidebar -> Directory -> Project, Project -> Work -> canonical WorkItem -> Inspector WRK-005, Project -> Docs -> canonical DOC-002 Document Canvas with continuous autosave & identity continuity across PRJ-003 and DOC-001, stale-write concurrency conflict rejection, cycle rejection across navigation, authoritative dependency mutation boundary rejection [cross-workspace, inaccessible target without leakage, unauthorized mutations, cycle checks leaving canonical state untouched], project updates domain persistence, milestone navigation survival, team removal safety rejection, canonical useFavorites toggle, rendered zero-leakage product path [PRJ-001 progress 1/2 (50%) and PRJ-007 directory exclusion], and creation/completion/archive lifecycle) |
| `ui-01a-work-item-inspector.test.jsx` | PASS (16/16) | Canonical WorkItem inspector & detail presentation |
| `ui-01b-high-density-grid.test.jsx` | PASS (27/27) | Universal DataGrid keyboard & selection mechanics |
| `ui-01c-quick-create-pickers.test.jsx` | PASS (37/37) | Quick Create and Universal Property Pickers |
| `ui-01d-execution-core-integration.test.jsx` | PASS (25/25) | Execution core end-to-end integration |
| `ui-02b-production-shell-sidebar.test.jsx` | PASS (26/26) | AppShell, Sidebar, breadcrumbs, and shortcuts |
| `ui-03b-my-work.test.jsx` | PASS (13/13) | Personal execution cockpit and projections |
| `ui-04b-personal-inbox.test.jsx` | PASS (22/22) | Personal triage inbox and notification routing |
| `ui-05b-team-hub-cycles.test.jsx` | PASS (36/36) | Team Hub, Cycle rollover, and execution |
| `ui-06b-docs-knowledge.test.jsx` | PASS (45/45) | Canonical document hierarchy, canvas, and editor |
| Other utility & algebra suites | PASS (20/20) | Filters, scopes, command palette, and workspace selection |
| **Total** | **PASS (299/299)** | **14 test files, 100% green** |

---

## 6. Implementation Correction Pass 01B (Integrity Hardening)

Three bounded architectural corrections were applied and verified:
1. **Document Association Invariant (Single Canonical Representation):**
   - Eliminated legacy dual/fallback representations (`doc.contextAssociations?.projectIds`).
   - Standardized exclusively on `doc.projectIds` (array of Project IDs on canonical Document).
   - Contextual creation initializes `projectIds: [project.id]`.
   - Verified canonical identity continuity across PRJ-003 Project Docs, DOC-002 Document Canvas, and DOC-001 global Docs Hub.
2. **Rendered Zero-Leakage Product Path:**
   - In `ProjectOverviewTab` and `ProjectsDirectory`, progress rollups pass the `isAccessible` authorization resolver.
   - For a Project with 1 accessible completed item, 1 accessible active item, and 2 restricted active items, Project Overview renders progress transparently as `1 / 2` and `(50%)` without leaking the inaccessible items into the denominator.
   - Restricted / inaccessible projects are strictly omitted from `ProjectsDirectory` (PRJ-007).
3. **Authoritative Dependency Mutation Boundary:**
   - Hardened `handleAddProjectDependency` in `App.jsx` to enforce:
     - Existence check on source and target projects.
     - Single workspace boundary check (`source.workspaceId === currentWorkspace.id && target.workspaceId === currentWorkspace.id`).
     - Access control check (`!isRestricted && isAccessible !== false`) with zero metadata leakage upon rejection.
     - Permission check (`canManage === true`).
     - Directed graph invariants (no self-dependency, no duplicate edges, no cycles via BFS).
   - Rejection leaves canonical state untouched without raising partial mutations.

---

## 7. Deliberate Deferrals (Post-Core)

Per section 43 of the authorization, the following capabilities were deliberately excluded:
- Project Templates
- Critical-path calculation & Gantt chart auto-scheduling
- Collaborative CRDT charter editing
- Financial budgeting & burn-rate tracking
- Workload / capacity heatmaps
- Cross-workspace projects
- AI charter / risk generation
- Permanent deletion / Trash
- Custom Project metadata designer
- Public status portals
