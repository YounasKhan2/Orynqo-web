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
- Queries canonical Documents associated with the Project (`doc.projectId === project.id` or `doc.associations.projectIds`).
- Contextual creation pre-associates the new document with the current Project.
- Opening any document delegates directly to canonical `DOC-002` Document Canvas.

### PRJ-004 — Project Milestones
- Project-owned delivery gates in sorted sequence.
- Enforces `0..1` milestone per WorkItem.
- Completing a milestone leaves incomplete WorkItems intact.
- Archiving a milestone is non-destructive and retains historical WorkItem references.

### PRJ-005 — Project Activity
- Meaningful chronological stream of canonical `ActivityEvent` records (creation, health revisions, updates posted, milestone completions, team participation changes).

### PRJ-006 — Project Settings & Access
- General configuration: name, scope summary, operational state, target completion date.
- Team participation: toggle participating teams, assign Lead Team (`leadTeam ∈ participatingTeams`).
- Dependency management: add blocker edges with directed cycle validation.
- Danger Zone: Complete Project (preserves all WorkItems, Milestones, and Docs), Archive / Restore Project (non-destructive).

### PRJ-007 — Projects Directory
- High-density catalogue designed for thousands of projects.
- Faceted filtering: operational state, archive state (`active` / `archived` / `all`), health (`on_track` / `at_risk` / `off_track`), participating team.
- Search filter over reference, title, and charter summary.
- Standard columns: Reference, Project Name & Summary, Project Lead, Participating Teams, Operational State, Health Badge, Target Date, and Progress Bar.

---

## 4. Invariant Verification & Test Coverage

All 14 test suites in the repository are passing with **zero skips and zero failures** (288 tests green):

| Suite | Status | Focus |
|---|---|---|
| `ui-07b-projects.test.jsx` | PASS (21/21) | Canonical project model, orthogonal states, Lead Team rules, zero-team projects, WorkItem team preservation, transparent progress, single-edge dependencies, cycle rejection, milestone cardinality (0..1), non-destructive archive, directory filtering, and App navigation |
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
| **Total** | **PASS (288/288)** | **14 test files, 100% green** |

---

## 5. Deliberate Deferrals (Post-Core)

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
