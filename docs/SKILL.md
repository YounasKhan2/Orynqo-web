# Antigravity — Enterprise Product Design Skill

## Purpose
Design complex, large-scale application interfaces with compact information density, strong hierarchy, reusable systems, and predictable workflows. The target quality bar is the discipline seen in products such as Notion and Linear, adapted for project management, ERP, operations, control planes, talent systems, admin platforms, and multi-tenant SaaS.

This is an application-design skill. It is not a marketing-site style guide.

## Core Principle
**Complexity belongs in the product model, not in visual noise.**

Expose enough information for users to make decisions without surrounding every datum with a card, border, oversized heading, or decorative container.

## Mandatory Workflow
Never jump directly from a feature request to polished screens.

1. Discovery
2. Product/domain model
3. Information architecture
4. Foundations and variables
5. Application shell
6. Component architecture
7. Feature workflow
8. Prototype/interactions
9. Validation and design QA
10. Implementation handoff

If an earlier stage already exists and is explicitly frozen, inspect it and continue from it rather than redesigning it.

## Non-Negotiable Rules

### MUST
- Model users, roles, objects, relationships, permissions, states, and critical workflows before feature UI.
- Reuse primitives and components before creating local screen-specific UI.
- Use semantic design tokens rather than arbitrary values.
- Design dense interfaces for scanning, comparison, navigation, and repeated daily use.
- Define hover, focus, selected, active, disabled, loading, error, empty, permission, archived, and destructive states.
- Treat keyboard navigation, command search, shortcuts, and focus management as first-class UX for desktop productivity products.
- Preserve context whenever practical through drawers, inspectors, popovers, split panes, inline editing, and contextual navigation.
- Define responsive behavior intentionally.
- Validate screens against actual product workflows and realistic data.
- Keep primary actions obvious without making every action visually primary.
- Prefer one canonical object model rendered through multiple views over duplicated feature-specific data models.

### SHOULD
- Prefer 4px/8px spacing logic.
- Keep routine controls compact.
- Prefer borders, separators, alignment, typography, grouping, and whitespace over excessive cards.
- Keep navigation stable while content changes.
- Use progressive disclosure for advanced configuration.
- Make tables, lists, filters, saved views, bulk actions, and inspectors reusable platform patterns.
- Preserve user state: filters, sort, view, expansion, panel width, and recent context where product requirements permit.
- Make destructive or irreversible actions explicit and recoverable when possible.

### NEVER
- Create a generic AI dashboard.
- Use huge hero-like headings inside routine product screens.
- Turn every section into a floating rounded card.
- Add gradients, glassmorphism, glows, illustrations, or decoration without a functional reason.
- Use large KPI cards as the default information architecture.
- Add whitespace simply to make a screen feel “premium.”
- invent metrics, roles, entities, statuses, workflows, or permissions not supported by the product brief.
- Hide important workflow actions behind ambiguous icons without accessible labels/tooltips.
- make separate inconsistent components for equivalent actions.
- redesign frozen foundations during feature implementation unless a documented system defect requires escalation.

## Density Targets
These are defaults, not immutable pixel laws.

- Base spacing unit: 4px.
- Common gaps: 4, 8, 12, 16, 24px.
- Dense table/list row: ~28–36px.
- Standard interactive control: ~28–36px.
- Compact sidebar item: ~28–32px.
- Primary desktop app body: optimized for high information throughput.
- Large spacing (32px+) requires a structural reason.
- Border radius should be restrained and tokenized.
- Avoid nested cards with independent padding unless they represent genuinely independent objects.

See `references/density-system.md`.

## Product Architecture
Before visual design, define:
- Actors/personas
- Organizations/workspaces
- Roles and permission boundaries
- Core entities
- Entity relationships
- Entity lifecycle/state machines
- Primary jobs-to-be-done
- High-frequency workflows
- High-risk workflows
- Navigation hierarchy
- Search/filter requirements
- Collaboration model
- Notification/activity model
- Audit/history requirements
- Multi-tenant boundaries
- Data density and scale assumptions

See `references/product-architecture.md`.

## Design System Order
Build in this order:
1. Color primitives
2. Semantic colors
3. Typography
4. Spacing
5. Radius
6. Borders/elevation
7. Motion
8. Icons
9. Primitive controls
10. Composite components
11. Application patterns
12. Shell
13. Feature screens

Do not build screen-local visual systems.

## Component Layers

### Primitives
Button, icon button, input, textarea, select, checkbox, radio, switch, badge, avatar, tooltip, separator, link, spinner, skeleton.

### Composite Components
Combobox, date picker, command item, breadcrumb, tabs, segmented control, pagination, menu, popover, modal, drawer, toast, inline editor, property row.

### Data Components
Data table, tree table, list, virtualized list, board column, task row, activity item, filter builder, query bar, saved view selector, bulk action bar.

### Application Patterns
Global search, command palette, workspace switcher, sidebar, inspector, split pane, details drawer, create flow, settings shell, audit log, permissions editor, notifications center.

## Complex Project Management Model
When applicable, distinguish:
- Workspace / Organization
- Team / Space
- Portfolio / Initiative
- Project
- Milestone
- Cycle / Sprint / Iteration
- Issue / Task / Work item
- Subtask
- Dependency
- Blocker
- Goal / Objective
- Document / Specification
- Comment / Activity
- Attachment
- Label / Category
- Status / Workflow
- Member / Assignee
- Saved view

Do not assume every product needs every level. Use only levels justified by the domain.

## Multiple Views, One Data Model
List, table, board, timeline, calendar, workload, and analytics should normally be projections of the same underlying objects.

A view may persist:
- filters
- sorting
- grouping
- visible properties
- property order
- density
- view type
- column widths
- collapsed groups
- date range
- zoom
- ownership/visibility

Avoid making each view a separate feature silo.

## Application Shell
A scalable shell typically contains:
- workspace/org switcher
- global search / command entry
- primary navigation
- favorites/recent items where justified
- contextual project/team navigation
- content header
- view/navigation strip
- content canvas
- optional inspector/details pane
- notifications/help/profile utilities

The shell must support deep products without turning into a permanently expanded mega-menu.

See `references/application-shell.md`.

## Interaction Strategy
Prefer:
- inline edit for simple property changes
- popover for small contextual configuration
- drawer/inspector for object detail while preserving list context
- modal for focused, interruptive, short tasks
- full page for deep workflows requiring substantial navigation or persistent context

Never use a modal merely because implementation is convenient.

## Command & Keyboard UX
For desktop productivity products:
- provide global command/search entry
- expose discoverable shortcuts
- support arrow navigation in menus/lists
- use Enter to open/confirm where safe
- Escape should predictably close the current transient layer
- preserve visible focus
- avoid shortcut collisions with browser/OS conventions
- support command aliases and fuzzy matching when useful

## Tables and Lists
Tables are core product infrastructure.

Support as required:
- sticky header
- resizable columns
- sorting
- filters
- grouping
- bulk selection
- bulk actions
- inline editing
- keyboard navigation
- saved views
- column visibility
- row actions
- empty/loading/error states
- pagination or virtualization/infinite loading
- accessible row/cell semantics

Do not replace a data table with cards solely for visual novelty.

## States
Every production feature must consider:
- first-use empty
- filtered empty
- loading
- incremental loading
- skeleton
- stale data
- refresh
- success
- recoverable error
- partial failure
- full failure
- offline
- syncing
- conflict
- permission denied
- disabled
- archived
- deleted
- destructive confirmation
- read-only
- no access
- unsupported state

## Accessibility
Target WCAG 2.2 AA where applicable.
- visible keyboard focus
- logical tab order
- semantic labels
- sufficient contrast
- non-color status indicators
- usable zoom/reflow
- appropriate hit targets
- accessible dialogs and drawers
- focus return after overlays
- reduced-motion behavior
- meaningful error association
- screen-reader-compatible data structures

## Motion
Motion communicates causality, continuity, state, and hierarchy.
- keep routine UI transitions short and restrained
- animate overlays and inspectors consistently
- avoid decorative continuous motion
- honor reduced motion
- never make users wait for animation before routine work
- preserve spatial continuity when switching related views

## Responsive Strategy
Do not “shrink desktop.”

For each major region define:
- remains visible
- collapses
- moves to drawer
- becomes horizontally scrollable
- changes representation
- becomes read-only
- is deferred to another screen

Desktop productivity density can be high; mobile should prioritize essential tasks rather than reproducing the entire desktop workspace.

## Validation Gates
A feature is not implementation-ready until:
- product objects are correct
- permissions are represented
- happy path is complete
- major edge cases exist
- loading/empty/error states exist
- component reuse is verified
- tokens are used
- keyboard/focus behavior is specified
- responsive behavior is specified
- realistic data has been tested
- destructive actions are safe
- navigation/context preservation is verified
- accessibility pass is complete
- design-to-implementation ambiguities are resolved

Use `references/design-qa-checklist.md`.

## Output Expectations
When asked to design a complex feature, return or create:
1. Scope and assumptions
2. Relevant domain objects
3. User workflow
4. IA/navigation impact
5. Screen/view inventory
6. Component reuse plan
7. New components only if required
8. Interaction/state specification
9. Responsive rules
10. Accessibility considerations
11. Validation notes
12. Open decisions/blockers

## Escalation Rule
If a feature conflicts with a frozen design system, architecture, or product model, do not silently patch around it. Document:
- conflict
- affected system
- user impact
- options
- recommended design-system/product-model change
Then wait for the relevant design decision before propagating a breaking change.
