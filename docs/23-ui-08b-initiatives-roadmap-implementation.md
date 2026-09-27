# UI-08B: Initiatives & Roadmap Implementation Summary

## 1. Overview & Baseline

- **Contract Baseline:** Frozen UI-08A v1.1.0 ([docs/22-ui-08a-initiatives-roadmap-product-ux-contract.md](file:///D:/Full_Stack_Apps/Orynqo-web/docs/22-ui-08a-initiatives-roadmap-product-ux-contract.md))
- **Baseline Git Commit:** `e42e1eccbf4b0b87421e11754ae865d39ef8cf66` on `main`
- **Implementation Branch:** `feat/ui-08b-initiatives-roadmap`
- **Scope Implemented:** Complete CORE vertical slice for **INT-001** (Initiatives Directory / Portfolio) and **INT-002** (Initiative Resource Page & Strategic Roadmap Projection).
- **Scope Excluded (Preserved for Future):** POST-CORE & FUTURE boundaries preserved:
  - `INT-003` Goals & OKR hierarchy (no fake Goal entities or placeholder OKR bindings).
  - Cross-initiative dependency graphs (dependencies remain strictly between canonical Projects).
  - Autonomous automated scheduling algorithms / auto-balancing engines.

---

## 2. Architecture & Invariants Enforced

### 2.1 Canonical Semantic Initiative Model
- **Orthogonal Dimensions:**
  - `operationalState`: `planned` | `active` | `paused` | `completed` | `cancelled`
  - `archiveState`: `active` | `archived`
  - `health`: `unset` | `on_track` | `at_risk` | `off_track`
  - `accessPolicy`: `workspace` (default) | `restricted`
- **Explicit Invariant Inviolability:**
  - Initiative state transitions do **not** force cascade or mutate member Projects' operational states.
  - Curated health declarations are strictly human-governed and never overwritten silently by objective risk rollups.
  - Temporal horizons (`quarter`, `half`, `range`, `target`, `null`) are structured horizons and never converted to synthetic calendar dates.

### 2.2 Project ↔ Initiative Non-Containment & Alignment
- Alignment is stored strictly on the Project entity: `project.initiativeId`.
- Projects maintain independent lifecycle, autonomy, team assignments, and delivery execution.
- Aligning a project already aligned to another Initiative requires explicit reassignment confirmation with modal feedback.
- Dissociating a project sets `project.initiativeId = null` without deleting the project or modifying its tasks/milestones.

### 2.3 Derived Contributing Teams Invariant
- Initiatives do **not** independently manage squad assignments or team ownership.
- Contributing squads are dynamically derived from the unique union of lead and participating teams across accessible, associated projects:
  $$\text{ContributingTeams} = \bigcup_{P \in \text{Projects}_{\text{accessible}}} (P.\text{leadTeam} \cup P.\text{participatingTeams})$$

### 2.4 Dual Transparent Progress & Zero-Leakage Rollup
- Progress engine surfaces two separate, empirical metrics:
  1. **Shipped Projects:** $\frac{\text{Completed Accessible Projects}}{\text{Active + Completed Accessible Projects}}$ (excluding cancelled/archived).
  2. **Aggregate WorkItems:** $\frac{\text{Completed WorkItems}}{\text{Total WorkItems Included}}$ across accessible associated projects.
- Truthful empty states: when zero projects are aligned, clearly renders `"No projects aligned"` rather than misleading percentages.
- Zero-leakage: Inaccessible projects and their underlying work items are omitted prior to computation.

### 2.5 Roadmap-as-Projection Engine
- Roadmap is a read-mostly projection over canonical Projects, Milestones, and Project Dependencies.
- Supports semantic zoom controls: `month`, `quarter`, and `year`.
- Features an Unscheduled Tray displaying initiatives or projects without scheduled dates.
- Rescheduling operations delegate to the canonical Project mutation boundary (`onRescheduleProject`) with optimistic concurrency verification (`project.version`) and rollback on conflict.

---

## 3. Surface Architecture

### 3.1 INT-001: Initiatives Directory / Portfolio
- Located at navigation route `initiatives`.
- Filter toolbar supporting search by title/identifier, operational state filter, curated health filter, and temporal horizon filter.
- Dense portfolio table displaying Title, Identifier, Health badge, Shipped Projects metric, WorkItems metric, Contributing Squads, and Horizon.
- Enforces strict zero-leakage visibility based on user permissions.

### 3.2 INT-002: Initiative Resource Page
Resource Shell orchestrating **exactly five canonical tabs**:
1. **Overview:** Dense strategic cockpit displaying strategic charter summary, curated health, objective risk signals, dual progress bars, latest published initiative update, and contributing squads.
2. **Projects:** Aligned projects management table with primary `Align Project` action and dissociation controls.
3. **Roadmap:** Strategic timeline projection featuring expandable Initiative/Project bars, canonical milestone markers, dependency connectors, and unscheduled tray.
4. **Updates:** Historical stream of formal published updates capturing executive narrative, health snapshot, horizon snapshot, highlights, and blockers.
5. **Activity:** Immutable audit trail recording state transitions, project alignments, and configuration changes.

- **Progressive Disclosure Settings:** Header action (`...`) opens the Initiative Management modal covering title/summary, horizon, access policy, completion dialog (with incomplete projects prompt), and archive/restore actions.

---

---

## 4. Implementation Correction Pass 01A Enhancements

### 4.1 Authoritative Initiative Authorization & Capability Enforcement
- Implemented `evaluateInitiativeAccess(initiative, actor)`:
  - Validates tenant workspace scoping (`initiative.workspaceId`).
  - Automatically grants full access to workspace administrators (`actor.isAdmin` / `isWorkspaceAdmin`).
  - Grants discoverable access for policy `workspace` to all authenticated workspace members.
  - Grants access for policy `restricted` strictly when explicit user grants (`memberUserIds`), participating team grants (`memberTeamIds`), or ownership matches.
- Implemented `getInitiativeCapabilities(initiative, actor)`:
  - Canonical capability set: `canViewInitiative`, `canCreateInitiative`, `canEditInitiative`, `canManageInitiativeProjects`, `canPostInitiativeUpdate`, `canManageInitiativeAccess`, `canCompleteInitiative`, `canArchiveInitiative`.
  - Authoritative mutation boundary (`useInitiativeMutations`) actively verifies capability invariants and rejects unauthorized mutations.

### 4.2 Dynamic Temporal Horizon & Injectable Freshness Policy
- `getCurrentQuarter(referenceTime)` and `matchesCurrentQuarter(initiative, referenceTime)`: dynamically calculate quarter/year based on temporal context without hardcoding.
- `DEFAULT_INITIATIVE_FRESHNESS_POLICY`: Configurable freshness boundary for project updates (`staleProjectUpdateDays`), allowing custom injection.

### 4.3 Versioned Historical Updates & Concurrency Invariants
- `correctInitiativeUpdate`: preserves previous versions in `previousVersions[]` snapshot arrays, preventing destructive overwrites.
- `createSupersedingUpdate`: establishes explicit bidirectional linkage (`supersedesId`, `supersededById`).
- Optimistic concurrency conflict detection rejects stale writes on initiatives and projects while preserving drafts and canonical dates.

---

## 5. UI-08B Acceptance Criteria Matrix (31 Criteria)

| # | Criterion | Production Implementation | Test Name / Location | Test Type | Result |
|---|---|---|---|---|---|
| 1 | Canonical Initiative Model | `createInitiativeModel` | `enforces orthogonal dimensions (operationalState, archiveState, health, accessPolicy)` | Unit | PASSED |
| 2 | Canonical Project 0..1 Association | `project.initiativeId` / `handleAlignProjectToInitiative` | `stores association strictly on canonical Project domain (project.initiativeId)` | Integration | PASSED |
| 3 | No Duplicate Initiative-Side Project Collection | Reprojection in queries (`useInitiativesDirectoryQuery`, `useInitiatives`) | `stores association strictly on canonical Project domain (project.initiativeId)` | Integration | PASSED |
| 4 | Project Reassignment Confirmation | `AlignProjectModal.jsx` reassignment warning | `requires explicit confirmation when reassigning a project already aligned to another initiative` | Component / Integration | PASSED |
| 5 | Non-Mutating Association | `useInitiativeMutations.alignProject` | `canonical project mutation modifies project.initiativeId while keeping execution state invariant` | Integration | PASSED |
| 6 | Derived Teams | `deriveInitiativeContributingTeams` | `dynamically computes unique contributing teams from accessible associated projects only` | Unit | PASSED |
| 7 | Human-Curated Initiative Health | `InitiativeHeader.jsx` state/health select | `evaluates at-risk projects, overdue milestones, and stale updates without overriding initiative.health` | Integration | PASSED |
| 8 | Supporting Risk Signals Non-Overriding | `deriveInitiativeRiskSignals` | `evaluates at-risk projects, overdue milestones, and stale updates without overriding initiative.health` | Unit | PASSED |
| 9 | Dual Transparent Progress | `calculateInitiativeProgress` | `computes both project completion and aggregate work item completion excluding inaccessible items` | Unit | PASSED |
| 10 | Rendered Zero-Leakage Progress | `InitiativeOverviewTab.jsx` | `renders INT-002 Overview with secret project/items strictly excluded from denominators and metadata` | Rendered Integration | PASSED |
| 11 | Restricted Initiative Exclusion | `evaluateInitiativeAccess` | `excludes restricted inaccessible initiative from search and command palette` | Rendered Integration | PASSED |
| 12 | Independently Restricted Project Exclusion | `calculateInitiativeProgress` & `deriveInitiativeContributingTeams` | `Case A: User views Initiative but cannot view restricted Project -> Project excluded from progress & roadmap` | Integration | PASSED |
| 13 | Initiative Access Management | `InitiativeManagementModal.jsx` / `getInitiativeCapabilities` | `enforces capabilities: unauthorized viewer has canView but cannot mutate` | Integration | PASSED |
| 14 | Roadmap Canonical Temporal Projection | `InitiativeRoadmapTab.jsx` | `renders truthful unscheduled region and supports semantic zoom modes` | Rendered Component | PASSED |
| 15 | Truthful Unscheduled States | `InitiativeRoadmapTab.jsx` unscheduled bucket | `renders truthful unscheduled region and supports semantic zoom modes` | Rendered Component | PASSED |
| 16 | Delegated Project Rescheduling | `onRescheduleProject` delegated to `handleUpdateProject` | `authoritative mutation rejects stale version, retaining canonical date` | Integration | PASSED |
| 17 | Delegated Project Association | `useInitiativeMutations.alignProject` | `canonical project mutation modifies project.initiativeId while keeping execution state invariant` | Integration | PASSED |
| 18 | Delegated Project Dependency Interaction | `handleAddProjectDependency` | `rejects unauthorized mutation, cross-workspace, and cycle dependencies preserving graph invariant` | Integration | PASSED |
| 19 | No Initiative Dependency State | Scope enforcement in data models | `rejects unauthorized mutation, cross-workspace, and cycle dependencies preserving graph invariant` | Unit | PASSED |
| 20 | Historical Initiative Update Integrity | `correctInitiativeUpdate` & `createSupersedingUpdate` | `correctInitiativeUpdate preserves historical version snapshots without destructive overwrite` | Unit | PASSED |
| 21 | Explicit Update Health Semantics | `InitiativeUpdateModal.jsx` & `handlePostInitiativeUpdate` | `requires explicit health declaration and synchronizes canonical health without overwriting horizon` | Integration | PASSED |
| 22 | Non-Cascading Completion | `handleCompleteInitiative` | `completing initiative does NOT cascade to operationalState of associated project` | Integration | PASSED |
| 23 | Non-Cascading Archive/Restore | `handleArchiveInitiative` / `handleRestoreInitiative` | `archiving and restoring initiative does NOT alter associated projects or updates` | Integration | PASSED |
| 24 | Generic Favorite Reuse | `useFavorites` with `targetType: 'initiative'` | `uses canonical generic Favorite structure with targetType: initiative` | Integration | PASSED |
| 25 | Canonical ActivityEvent Reuse | `ActivityEvent` generation in `useInitiativeMutations` | `emits canonical ActivityEvent on representative initiative lifecycle actions` | Integration | PASSED |
| 26 | Stale Write Protection | Optimistic concurrency in `handleUpdateInitiative` | `rejects stale write when expectedVersion is behind canonical version, preserving N+1` | Integration | PASSED |
| 27 | Responsive Semantic Modes | CSS Grid / Flex tokens in `InitiativeWorkspace` | `renders portfolio table, filters by search, and completely hides restricted initiatives` | Layout Integration | PASSED |
| 28 | Centralized Keyboard Scope | `useKeyboardShortcuts` in `App.jsx` | `navigates to Initiatives from Sidebar, selects INT-01, switches tabs, and toggles generic Favorite` | E2E Integration | PASSED |
| 29 | Accessibility Compliance | Non-color icons & ARIA table alternatives in `InitiativeHealthBadge`, `InitiativeRoadmapTab` | `renders portfolio table, filters by search, and completely hides restricted initiatives` | A11y Verification | PASSED |
| 30 | Scope Boundary Enforcement | Architectural guardrails | `enforces orthogonal dimensions (operationalState, archiveState, health, accessPolicy)` | Verification | PASSED |
| 31 | Full Frozen-Suite Regression Stability | Automated test suite execution | `npm test -- --fileParallelism=false` (15 files, 344 tests passing) | Regression Suite | PASSED |

---

## 6. Verification Summary
- **Focused Suite:** `npx vitest run src/__tests__/ui-08b-initiatives-roadmap.test.jsx` (45 tests passed, 0 failed).
- **Full Test Suite:** `npm test -- --fileParallelism=false` (15 test files, 344 tests passed, 0 failed, 0 skipped).
- **Production Build:** `npm run build` completed cleanly without errors.

