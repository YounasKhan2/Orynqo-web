# UI-06A: Docs & Knowledge Product & UX Contract

- **Document Version:** `1.1.0`
- **Surface Identifier:** `DOC-001` (Docs / Knowledge Hub), `DOC-002` (Canonical Document Canvas / Editor), `DOC-003` (Document Metadata & Version Management — Boundary defined, POST-CORE)
- **Status:** **PROPOSED PRODUCT & UX SPECIFICATION — CORRECTION PASS 01A AT HUMAN REVIEW**
- **Base Git SHA:** `f5cffc6e2a47f319ccde00e57b6ffb2404dcf0c6`
- **Branch:** `design/ui-06a-docs-knowledge-product-ux`
- **Lineage:** `docs/06-complete-page-and-surface-registry.md` $\rightarrow$ `docs/10-ui-02a-application-shell-sidebar-contract.md` $\rightarrow$ `docs/12-ui-03a-my-work-product-ux-contract.md` $\rightarrow$ `docs/16-ui-05a-team-hub-product-ux-contract.md` $\rightarrow$ `docs/18-ui-06a-docs-knowledge-product-ux-contract.md`

---

## 1. Status / Scope

`UI-06A` defines the complete product, domain, interaction, and UX architecture for durable knowledge, specifications, and living documentation within Orynqo.

### 1.1 Scope Boundaries
- **In Scope (CORE):**
  - Canonical `Document` workspace entity and storage-neutral relationship graph.
  - Workspace Docs Hub (`DOC-001`): Dense information architecture for discovery, recent documents, personal favorites, context-pinned resources, and faceted collection filtering.
  - Knowledge Navigation Model: Hybrid model combining flat searchable collection, structural parent/child hierarchy, contextual resource embeddings, and backlinks.
  - Document Canvas & Writing Surface (`DOC-002`): Focused, distraction-free writing environment prioritizing typography, dense context, and instant responsiveness over decorative cover art.
  - Semantic Editor Contract: Core markdown/rich text blocks, inline formatting, slash command insertion (`/`), and canonical entity mentions (`@User`, `@WorkItem`, `@Document`, `@Project`, `@Team`).
  - Document ↔ Execution Bridge: Bidirectional references, non-destructive WorkItem mentions with live status chips, split-screen Inspector invocation, and explicit content-to-WorkItem conversion via canonical creation.
  - Derived Backlinks System: Reactive, permission-filtered backlink graph revealing all accessible workspace entities referencing the active document without metadata leakage.
  - Threaded Document Comments: Range-anchored and document-level collaboration with degradation-tolerant anchor survival.
  - Live Autosave & Persistence Boundary: Continuous canonical state sync with bounded asynchronous persistence, explicit conflict detection, offline queueing indicators, and rigorous data-loss protection.
  - Semantic Authorization & Zero-Leakage Policy: Fine-grained action capabilities resolved via canonical authorization with strict metadata redaction for restricted references and breadcrumbs.
- **Explicitly Deferred (POST-CORE):**
  - `DOC-003`: Full Version History compare, visual diff viewer, and point-in-time snapshot restoration (architecture is future-compatible, but UI is POST-CORE).
  - Real-time multi-cursor CRDT collaborative typing engines.
  - Embedded live WorkItem query tables (e.g., dynamic embedded query grids).
  - Notion-style programmable database blocks, formulas, rollups, and relation properties.
  - Whiteboarding, infinite canvas freeform sketching, and visual diagrams editors.
  - Public web publishing, custom domain hosting, and external documentation portals.
  - AI writing generators, automated summarizers, and automated semantic question answering.
  - Permanent document deletion / Trash system.

---

## 2. Research Synthesis & Reference Analysis

To ground Orynqo Docs in proven operational ergonomics while avoiding common wiki failure modes, four primary reference architectures were analyzed:

```text
┌─────────────────┬───────────────────────────────┬───────────────────────────────┬───────────────────────────────┐
│ Reference Model │ Observed Strengths            │ Trade-offs & Observed Gaps    │ Orynqo Architecture Decision  │
├─────────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Linear          │ • Tight integration with work │ • Rigid document hierarchy    │ • Adopt: Execution bridge &   │
│ Documents       │ • Fast, minimalist canvas     │ • Limited standalone wiki IA  │   live status chips/Inspector │
│                 │ • Bi-directional status sync  │ • Disconnected from global    │ • Reject: Flat-only isolation │
│                 │ • Low decorative overhead     │   knowledge navigation        │   outside of projects/teams   │
├─────────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Notion          │ • Single-parent nested tree   │ • Pages conflated with        │ • Adopt: Structural hierarchy │
│ Pages & Blocks  │ • Slash command insertion     │   database rows               │   & contextual slash menu     │
│                 │ • Inline entity mentions      │ • High visual/decorative load │ • Reject: Relational database │
│                 │ • Threaded inline comments    │ • Distraction from pure text  │   blocks & cover art bloat    │
├─────────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Confluence      │ • Structured workspace spaces │ • Disruptive Draft vs.        │ • Adopt: Structured hub &     │
│ Cloud           │ • Stable page breadcrumbs     │   Published dual-state modal  │   permission-safe breadcrumbs │
│                 │ • Clear space/team ownership  │ • Heavy editor initialization │ • Reject: Modal publish gate  │
│                 │ • Explicit permission ACLs    │ • Knowledge isolated from     │   and stale offline drafts    │
│                 │                               │   active issue execution      │                               │
├─────────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ ClickUp         │ • Multi-context relationships │ • High cognitive clutter      │ • Adopt: Clean bidirectional  │
│ Docs            │ • Sticky table of contents    │ • Text checklists secretly    │   relationship drawer         │
│                 │ • Contextual favorites shelf  │   spawn backlog work items    │ • Reject: Conflating document │
│                 │                               │ • Inconsistent permission     │   checklists with WorkItems   │
│                 │                               │   leakage in cross-links      │                               │
└─────────────────┴───────────────────────────────┴───────────────────────────────┴───────────────────────────────┘
```

### Detailed Architectural Rationale
1. **Linear Reference:** Adopted the design principle that documents are live companions to execution. Live status chips for WorkItems and instantaneous Inspector invocation without losing document scroll position. Rejected the limitation of only attaching documents to Projects or Teams; Orynqo supports canonical workspace-wide knowledge.
2. **Notion Reference:** Adopted clean slash-command insertion (`/`), `@` entity mention ergonomics, and optional single-parent nested page structures. Rejected Notion's conversion of all documents into database rows, decorative cover banners, and complex relational rollups that distract from technical writing.
3. **Confluence Reference:** Adopted resilient URL identity, hierarchical breadcrumb paths, and enterprise-grade permission models. Strictly rejected Confluence's disruptive "Draft vs. Published" dual-state modal paradigm which leads to orphaned local drafts and stale published pages.
4. **ClickUp Reference:** Adopted rich relationship metadata (showing related Teams, Projects, and WorkItems in a dedicated metadata drawer). Rejected ClickUp's pattern where typing a checklist inside a document secretly spawns phantom tasks in the project backlog.

---

## 3. Product Purpose & Philosophy

### 3.1 The Fundamental Distinction
In Orynqo, the domain separation between Work Management and Knowledge Management is absolute:

```text
┌──────────────────────────────────────────────────────────┐
│ WORKITEMS (Execution Core)                               │
│ • "What needs to be done, who is doing it, and when?"    │
│ • State: unstarted, in_progress, completed, canceled     │
│ • Ephemeral lifecycle: Triaged, worked, verified, closed │
└──────────────────────────▲───────────────────────────────┘
                           │
                 CONNECTED BY RELATIONSHIPS
                 (Living Specs, RFCs, Runbooks)
                           │
┌──────────────────────────▼───────────────────────────────┐
│ DOCUMENTS (Docs & Knowledge)                             │
│ • "Why are we doing this, what was decided, and how does │
│   the system work?"                                      │
│ • State: active, archived                                │
│ • Durable lifecycle: Authored, refined, referenced, read │
└──────────────────────────────────────────────────────────┘
```

A Document is **never** a task, and a WorkItem is **never** an arbitrary wiki page. Documents provide the durable specification, architectural rationale, meeting outcomes, and operational runbooks that guide WorkItem execution.

---

## 4. Semantic Canonical Document Model

A Document is a first-class, top-level workspace resource. It is **never** cloned or namespaced into entity-specific variants (no `TeamDocument`, `ProjectDocument`, or `CycleDocument`).

To ensure architectural durability and prevent coupling to specific storage technologies, the canonical model is defined semantically rather than through a physical persistence schema:

```text
Canonical Document Semantics:
- Immutable Identity: Universally unique, immutable identity preserved across renames, reparenting, and context detachment.
- Workspace Tenancy: Belongs strictly to exactly one Workspace tenant.
- Core Title & Content: Structured document title and structured body content (supporting rich blocks and semantic formatting).
- Provenance & Authorship: Immutable creator identity, most recent editor identity, creation timestamp, and last modification timestamp.
- Lifecycle State: Explicit lifecycle state ('active' | 'archived'), with archival metadata (archived timestamp, archiving user identity).
- Optional Structural Parent: References zero or one structural parent document within the same workspace.
- Contextual Associations: Zero or more references to operational contexts (Teams, Projects, Initiatives, Cycles).
- Visibility & Access Policy: Semantic visibility configuration and access control policies.
```

### 4.1 Storage Independence & Derived Attributes
- **Persistence Architecture Neutrality:** The canonical model does not freeze whether associations use array columns, relation join tables, graph edges, ACL tables, or denormalized search projections. That choice belongs to backend persistence architecture.
- **Derived Depth:** Nesting depth is derived from structural hierarchy traversal rather than mandatory persisted state, unless technical optimization later requires caching.
- **Deterministic Identity:** Links formatted as `/docs/{id}` or human-readable `/docs/{id}-{slug}` resolve deterministically using the immutable `id` regardless of title changes.

---

## 5. Document Relationship Graph

Orynqo models connections between knowledge and execution using four distinct, strictly typed relationship primitives:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        RELATIONSHIP TAXONOMY                           │
├───────────────────┬────────────────────────────────────────────────────┤
│ Primitive         │ Definition & Lifecycle Behavior                    │
├───────────────────┼────────────────────────────────────────────────────┤
│ 1. Structural     │ • Strict tree ownership: zero or one parent        │
│    Hierarchy      │ • Controls structural tree navigation              │
│    (Parent/Child) │ • Moving a document updates parent; children move  │
│                   │ • Does NOT silently or automatically grant access  │
├───────────────────┼────────────────────────────────────────────────────┤
│ 2. Contextual     │ • "This doc is relevant to Team Alpha or Project X"│
│    Association    │ • Multi-tenant: 1 doc can associate with N teams   │
│    (Context)      │   and N projects simultaneously                    │
│                   │ • Does NOT affect structural breadcrumb path       │
├───────────────────┼────────────────────────────────────────────────────┤
│ 3. Inline         │ • Explicit token written into document content     │
│    Reference      │   (e.g., mention of @ENG-104 or @Project-Apollo)   │
│    (Mentions)     │ • Interactive live chips with instant status sync  │
│                   │ • Clicking chip opens Inspector without navigating │
├───────────────────┼────────────────────────────────────────────────────┤
│ 4. Derived        │ • Computed inverse index: "What references me?"    │
│    Backlink       │ • Aggregates incoming links from Documents,        │
│    (Inverse)      │   WorkItems, Teams, Projects, and Comments         │
│                   │ • Never manually authored; dynamically calculated  │
└───────────────────┴────────────────────────────────────────────────────┘
```

### 5.1 Contextual Association vs. Structural Ownership
- **No Shared Fate on Context Deletion:** If Project `PRJ-AUTH-V2` is deleted or completed, its associated architecture documents are **not** deleted. Their project association relationship is simply detached.
- **Multi-Context Collaboration:** A runbook describing database failover procedures can be associated with both the `Infrastructure Team` and the `Platform Core Team` without duplicating the document.

---

## 6. Docs Hub (`DOC-001`) Information Architecture

The Docs Hub is the primary entry point for workspace-level knowledge retrieval. It eliminates unstructured document graveyards by employing a dense, categorized information architecture:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DOCS HUB (`DOC-001`)                                                            [+ New Document]   │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Search documents by title, content, author, tag...]      [Filter by Team ▾] [Filter by Project ▾] │
├───────────────────┬────────────────────────────────────────────────────────────────────────────────┤
│ NAVIGATION FACETS │ MAIN DOCUMENT STREAM                                                           │
│                   │ View: [Recent ▾]  Display: [Dense List | Compact Tree]                         │
│ • Recent          ├────────────────────────────────────────────────────────────────────────────────┤
│ • Favorites/Pinned│ TITLE                     CONTEXT          LAST MODIFIED      AUTHOR    STATUS │
│ • Created by Me   │ 📄 Platform Onboarding     Team: Core       2h ago by @sarah   Active    [★]    │
│ • All Documents   │ 📄 Auth V2 RFC             Proj: Auth V2    Yesterday by @alex Active    [☆]    │
│                   │ 📄 Incident Postmortem #42 Team: Infra      Sep 24 by @chen    Active    [☆]    │
│ SAVED PRESETS     │ 📄 Legacy Billing Flow     Team: Growth     Sep 12 by @elena   Archived  [☆]    │
│ • Living Specs    │ 📄 Redis Failover Runbook  Team: Core,Infra Aug 30 by @mike    Active    [★]    │
│ • Team Runbooks   │                                                                                │
└───────────────────┴────────────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Hub Facets (Core vs. Semantic Presets)
- **Core Built-in Facets:**
  1. **Recent (`recent`):** Documents recently viewed or modified by the active user.
  2. **Favorites / Pinned (`pinned`):** Personal user favorites (`Favorite`) merged with context-pinned items from the user's joined teams (`Context Pin`).
  3. **Created by Me (`authored`):** Filter where creator identity matches current user.
  4. **All Documents (`all`):** Complete workspace index respecting visibility permissions.
  5. **Context Filters:** Dynamic filtering by associated Team or Project.
  6. **Search:** Real-time text search across title and content.
- **Semantic Saved Presets (Not Hardcoded Domain Types):**
  - **Living Specs (`specs`):** Query preset filtering documents associated with active projects.
  - **Team Runbooks (`runbooks`):** Query preset filtering operational guides associated with the user's squads.
  - *Rule:* Orynqo does not infer document type from titles/content or create artificial `spec` or `runbook` domain types merely to support navigation.

### 6.2 Density & Column Structure
The primary view uses a dense high-information grid rather than oversized visual cards:
- **Title & Icon:** Direct link to `DOC-002`. Displays nesting indicator if child.
- **Context Badges:** Pill indicators showing associated Teams or Projects.
- **Last Modified:** Human-readable relative timestamp + avatar of last editor.
- **Author:** Avatar and handle of creator.
- **Favorite Action:** Instant toggle for personal favorites.

---

## 7. Knowledge Navigation & Structural Hierarchy

Orynqo adopts a **Dual-Mode Knowledge Navigation** model:
1. **Search & Contextual Navigation (Primary):** Users retrieve documents via global search, contextual tabs in Teams/Projects, and backlinks.
2. **Structural Tree Hierarchy (Secondary):** Structured documentation (e.g., Engineering Handbooks, API specs) can be organized with parent/child relationships.

```text
Engineering Handbook (Root)
├── Architecture Standards
│   ├── Microservices Guidelines
│   └── Event Bus Topology
└── Operations Runbooks
    ├── Production Deployments
    │   └── Blue-Green Rollback Procedures
    └── Secret Rotation
```

### 7.1 Hierarchy Invariants & Cycle Prevention
- **Single Parent Invariant:** A document can have exactly zero or one structural parent. Multi-parent directed acyclic graphs are strictly forbidden.
- **Strict Cycle Prevention:** When reparenting document $A$ under document $B$, the system validates that $B$ is not a descendant of $A$ ($\text{ancestors}(B) \cap \{A\} = \emptyset$). Any violation is rejected before write.
- **Tunable Practical Nesting Limit:** Orynqo may enforce a configurable/practical nesting limit (e.g., 5 levels in default configuration) to preserve navigability and UI rendering performance. The exact limit is implementation configuration, not an immutable domain invariant.

### 7.2 Hierarchy $\neq$ Automatic Authorization Inheritance
Structural hierarchy is strictly separate from the authorization model:
```text
Structural hierarchy ≠ Authorization hierarchy
```
1. **No Silent Access Grant:** A parent/child relationship must never silently grant access to restricted content.
2. **Authorization Resolution:** Structural parenthood may provide an access-policy inheritance input, but effective authorization is resolved by the canonical authorization layer and must never be inferred solely by UI hierarchy.
3. **Override Capability:** A child document may define explicit access overrides or restrictions independent of its parent.
4. **Restricted Parent with Broader Child:** If a parent is restricted to Team Alpha, but a child document is workspace-accessible, unauthorized users viewing the child document must not leak ancestor metadata. Breadcrumbs render a permission-safe placeholder (e.g., `Workspace > [Restricted Parent] > Child Document`).
5. **Reparenting and Authorization Warnings:** Moving a document between parents can alter effective inherited access policies. The UI must explicitly warn the user before completing any move that modifies effective access permissions, stating the exact changes to who can view or edit the document.

### 7.3 Archiving Parent Behavior
- **Descendant Protection Invariant:** Archiving a parent must never silently orphan, hide, delete, or unexpectedly re-permission descendants.
- **Explicit Resolution:** Before completing an archive operation on a document with descendants, the operation must explicitly resolve affected descendants (e.g., offering cascading archival of all descendants or reparenting descendants to the parent's ancestor). Exact UI presentation remains tunable, but the resolution requirement is frozen.

---

## 8. Document Canvas & Writing Surface (`DOC-002`)

The Document Canvas is designed for uninterrupted flow. It eliminates the heavy visual chrome common in enterprise wikis.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [← Docs Hub]  Handbook / Runbooks / Deployments                    [Share] [★] [...]  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                        [Inspector ◨]   │
│  📘 Production Blue-Green Rollback Procedures                                          │
│                                                                                        │
│  Context: [Team: Infrastructure] [Project: Core Platform] [Updated 10m ago by @alex]   │
│                                                                                        │
│  ## Overview                                                                           │
│  This runbook outlines emergency rollback procedures for blue-green traffic switches.  │
│                                                                                        │
│  ### Prerequisites & Pre-flight Checks                                                │
│  - [x] Verify canary error budget on Grafana dashboard.                               │
│  - [ ] Notify on-call incident commander in `#eng-incidents`.                         │
│                                                                                        │
│  ### Active Execution Context                                                         │
│  Refer to canonical WorkItem: [🟢 ENG-402: Automate ingress blue-green switch]         │
│                                                                                        │
│  ```bash                                                                               │
│  kubectl argo rollbacks abort ingress-primary --namespace production                   │
│  ```                                                                                   │
│                                                                                        │
│  > **Warning:** Aborting traffic while database migration is pending requires           │
│  > immediate execution of [📄 DB Schema Rollback Runbook].                             │
│                                                                                        │
│  Type '/' for commands, '@' to reference entities...                                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 8.1 Visual Hierarchy & Clean Canvas Rules
- **No Mandatory Cover Images:** Cover art banners are absent by default. Documentation is technical and operational, not decorative.
- **Compact Header:** Document title is formatted as an inline-editable `<h1>` with minimal top padding.
- **Live Sync Indicator:** Displays ambient sync state (`Saved`, `Saving...`, retry required).
- **Distraction-Free Focus:** Margins and line heights conform to high-readability typographic scales.

---

## 9. Semantic Editor Contract

The editor operates on structured semantic block nodes. The UX contract defines capabilities independently of underlying frameworks (ProseMirror, TipTap, Slate, Lexical).

### 9.1 Core Block Capabilities
1. **Paragraphs (`paragraph`):** Standard flow text with rich inline formatting.
2. **Headings (`heading`):** Levels 1, 2, and 3 (`#`, `##`, `###`). Level 1 is reserved for internal sectioning (the document title is the root entity title).
3. **Lists (`bullet_list`, `ordered_list`):** Standard indentation, renumbering, and nesting.
4. **Task Checklist (`task_list`):** Checkbox items (`- [ ]`). **Critical Invariant:** Checklist items are lightweight document checkboxes, **not** canonical WorkItems.
5. **Code Blocks (`code_block`):** Monospaced syntax-highlighted blocks with language selection badge and quick-copy action.
6. **Blockquotes & Callouts (`callout`):** Callout boxes with semantic intent variants (`info`, `warning`, `success`, `danger`).
7. **Divider (`horizontal_rule`):** Section separation (`---`).

### 9.2 Inline Formatting Capabilities
- Bold, Italic, Strikethrough, Inline Code, Hyperlinks.

---

## 10. Slash Commands (`/`) & Insert Architecture

Typing `/` on an empty line or after a space opens the contextual insertion menu:

```text
┌────────────────────────────────────────┐
│ Insert Block or Entity                 │
├────────────────────────────────────────┤
│ BASIC BLOCKS                           │
│ H1  Heading 1                     #    │
│ H2  Heading 2                     ##   │
│ ≡   Bullet List                   -    │
│ 1.  Numbered List                 1.   │
│ ☑   Task Checklist                []   │
│ “   Callout Box                   >    │
│ </> Code Block                    ```  │
├────────────────────────────────────────┤
│ WORKSPACE ENTITIES                     │
│ 🎟️  WorkItem Reference            @    │
│ 📄  Document Link                 [[   │
│ 📁  Project Context               @prj │
│ 👥  Team Reference                @team│
└────────────────────────────────────────┘
```

- **Keyboard Navigation:** `ArrowUp`, `ArrowDown` to navigate options; `Enter` to insert; `Escape` to dismiss.
- **Fuzzy Filtering:** Contextual search filters menu options as typed.

---

## 11. Canonical Entity Mentions (`@`) & Non-Leaking References

Typing `@` opens the Unified Entity Mention Popover:

```text
┌──────────────────────────────────────────────┐
│ Mention Workspace Entity...                  │
├──────────────────────────────────────────────┤
│ 👥 PEOPLE                                    │
│ @alex      Alex Rivera (Staff Architect)     │
│ @sarah     Sarah Chen (Infra Lead)           │
├──────────────────────────────────────────────┤
│ 🎟️ WORKITEMS                                  │
│ ENG-402    Automate ingress blue-green switch│
│ ENG-108    Redis cluster failover script     │
├──────────────────────────────────────────────┤
│ 📄 DOCUMENTS                                 │
│ DB Schema Rollback Runbook                   │
│ Microservices VPC Network RFC                │
├──────────────────────────────────────────────┤
│ 📁 PROJECTS & TEAMS                          │
│ Core Platform (Team)                         │
│ Auth V2 Architecture (Project)               │
└──────────────────────────────────────────────┘
```

### 11.1 Semantic Entity Mention Presentation
When an entity is selected, it renders with semantic behavior:
- **Stable Canonical Identity:** Anchored to immutable entity identity.
- **Current Display Projection:** Displays live accessible status, key, and title (exact pill styling is tunable).
- **Hover Inspection:** Hovering reveals summary metadata where authorized.
- **Actionable Navigation / Inspection:** Clicking a WorkItem reference invokes the **WorkItem Inspector Drawer (`WRK-005`)** sliding out from the right side. The user inspects and updates the task without losing their document scroll position.

### 11.2 Zero-Leakage Permission Policy
If user $U$ views a Document containing mentions of entity $E$, and $U$ lacks permission to view $E$:
- **Title Redaction:** Renders a permission-safe fallback: `🔒 Restricted Item`.
- **Metadata Redaction:** Assignee, status, project name, and timestamps are completely redacted from the payload sent to the client.
- **Click Inaction:** Clicking displays an accessible message: *"You do not have access to this referenced item."*

---

## 12. Derived Backlinks System

Every document includes a reactive Backlinks query surface accessible in the contextual metadata drawer or at the foot of the document canvas:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ BACKLINKS (4 References to this Document)                              │
├────────────────────────────────────────────────────────────────────────┤
│ 🎟️ WORKITEMS                                                           │
│ • [In Progress] ENG-402: Automate ingress blue-green switch            │
│   "...procedure described in [Production Blue-Green Rollback] step 3..."│
│ • [Backlog] ENG-512: Verify disaster recovery cluster                   │
│                                                                        │
│ 📄 DOCUMENTS                                                           │
│ • Infrastructure Master Disaster Recovery Index                        │
│   "...refer to [Production Blue-Green Rollback] for traffic abort..."  │
│                                                                        │
│ 📁 PROJECTS                                                            │
│ • Core Platform Modernization (Referenced in Project Overview)         │
└────────────────────────────────────────────────────────────────────────┘
```

### 12.1 Backlink Security & Rules
1. **Computed Dynamically:** Backlinks are derived relationships computed from the workspace graph. Authors never manually manage backlink lists.
2. **Strict Permission Filtering:** Unauthorized backlink sources must not contribute to:
   - Visible backlink count;
   - Source title;
   - Surrounding snippet;
   - Status badge;
   - Project or Team metadata.
   If aggregate counts could leak existence, counts must be authorization-filtered before reaching the client.
3. **Surrounding Context Preview:** Displays a permission-filtered 1-line snippet highlighting where the link occurs.

---

## 13. Document ↔ WorkItem Bridge

The seamless bridge between durable knowledge and atomic execution is Orynqo's primary architectural differentiator over disconnected tools.

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ DOCUMENT CANVAS (Living Specification)                                   │
│                                                                          │
│ "During Phase 1, we must migrate existing authentication tokens          │
│ from Redis to encrypted PostgreSQL storage."                             │
│                                                                          │
│ Highlight text -> [Create WorkItem from Selection ▾]                     │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                        OPENS QUICK CREATE MODAL
                        (Title: "Migrate auth tokens from Redis to Postgres")
                        (Source: Context link to Document + selected anchor)
                                     │
┌────────────────────────────────────▼─────────────────────────────────────┐
│ CANONICAL WORKITEM CREATED (`ENG-415`)                                   │
│ • Canonical workspace issue owned by Team Core                           │
│ • WorkItem retains reference/relationship to source Document             │
│ • WorkItem detail automatically lists Document in its "Living Specs" tab │
└──────────────────────────────────────────────────────────────────────────┘
```

### 13.1 Bridge Invariants
- **No Hidden Duplicate Task System:** Checking a checkbox `- [x]` in a document does **not** update or complete a WorkItem. Checklists inside text are local formatting.
- **Explicit Canonical Creation:** WorkItems linked to documents are created through standard canonical creation (`CMD-002`), preserving complete team, assignee, status, and estimation semantics.
- **Source Relationship:** The resulting canonical WorkItem retains a relationship/reference to the source Document and source context where supported. Whether the originating text selection is automatically replaced or augmented by an inline reference chip is a UX implementation choice.
- **Live WorkItem Tables (POST-CORE):** Embedded live WorkItem query tables (e.g., dynamic embedded query grids) are deferred to **POST-CORE / future extension**. The CORE bridge consists of mentions/references, backlinks, the Inspector, and explicit creation.

---

## 14. Collaboration: Comments & Threaded Discussion

Orynqo Docs supports collaborative review without fragmenting conversational history:

### 14.1 Two Scopes of Discussion
1. **Document-Level Conversation:** Discussion about the entire specification (e.g., "RFC approved by architecture council on Sept 26").
2. **Range-Anchored Inline Threads:** Comment anchored to a specific text highlight range.

```text
┌─────────────────────────────────────────────────────────────┐
│ Inline Comment Thread                                   [X] │
├─────────────────────────────────────────────────────────────┤
│ @sarah (Infra Lead) • 2 hours ago                           │
│ "Should we specify a timeout for step 2 before triggering    │
│ the automated abort?"                                       │
│                                                             │
│   ↳ @alex (Author) • 45m ago                                │
│     "Agreed. Updated to 300 seconds."                       │
│                                                             │
│ [Reply to thread...                                      ]  │
│ [✓ Resolve Thread]                                          │
└─────────────────────────────────────────────────────────────┘
```

### 14.2 Resilient Anchor Survival & Degradation
- **Product Invariant:** Editing surrounding content must not silently destroy discussion history.
- **Resilient Anchoring Strategy:** The editor implementation may use character ranges, block IDs, relative positions, text context tokens, or another resilient anchor strategy to maintain thread positioning as text shifts.
- **Degraded / Orphaned State:** If the entire section containing an anchor is deleted, the comment thread is never silently deleted. It transitions to an `orphaned` state, retained in the Document Discussion Panel with a notice that the anchored text was modified or removed.
- **Resolved Comments Retained:** Resolved comment threads remain accessible under the resolved comments filter for full context retention.

---

## 15. Autosave, Data-Loss Protection, and Concurrency

### 15.1 Continuous Autosave Contract
Orynqo adopts **Continuous Autosave** as the CORE product experience:
- **Product Invariant:** Local edits are captured immediately and persisted asynchronously using a bounded save strategy appropriate to the editor architecture.
- **Required User-Visible States:**
  1. `Saved`
  2. `Saving`
  3. `Save failed / retry required`
  4. `Conflict requiring attention`
- Exact debounce timing and wording remain tunable implementation details.

### 15.2 Data-Loss Protection (Truthful Contract)
- **Truthful Guarantees:** Orynqo must not silently discard acknowledged or locally pending user edits.
- **No Unsupported Offline Claims:** The system is **not** claimed to be an offline-first architecture. We do not claim offline editing survives browser termination, device restart, storage eviction, or cross-device handoffs unless specifically implemented and verified.
- **Temporary Connectivity Loss:** Bounded client-side buffering (e.g., local pending buffer, retry queue, browser storage draft) preserves unpersisted changes during transient disconnects and surfaces explicit failure and retry prompts.
- **Navigation Protection:** Navigating away while changes are unpersisted triggers an explicit confirmation guard.

### 15.3 Concurrent Editing Contract
- **CORE Requirement:** Without real-time collaborative editing (CRDT/OT), concurrent modifications must not silently overwrite unacknowledged user-authored changes.
- **Conflict Handling:**
  - The implementation must detect stale or conflicting writes where architecture permits.
  - Local content must remain recoverable upon conflict.
  - The UI must communicate conflict and allow safe recovery or retry.
- **Implementation Independence:** The contract does not freeze a specific merge algorithm, block-level last-write-wins, document-level last-write-wins, or CRDT engine. Real-time collaborative multi-cursor presence is explicitly POST-CORE.

---

## 16. Semantic Authorization & Visibility Model

Docs authorization integrates cleanly into canonical Orynqo authorization:

### 16.1 Semantic Action Capabilities
The system defines semantic capabilities conceptually:
- `view`: Read document content, metadata, and backlinks.
- `create`: Create a new canonical document in the workspace.
- `edit`: Modify title, blocks, content, and inline tags.
- `comment`: Post inline and document-level comments and replies.
- `share` / `manage_access`: Alter visibility policies and manage user or team grants.
- `move` / `reparent`: Reparent in hierarchy or reassign context associations.
- `archive`: Transition document lifecycle to 'archived'.
- `restore`: Transition document lifecycle from 'archived' to 'active'.

*Note:* Permanent deletion (`delete`) is deferred to POST-CORE alongside Trash management. No authorization is defined for deferred destructive operations.

### 16.2 Visibility Policies & Resolution
- **Workspace-Accessible:** Discoverable and readable across the workspace.
- **Restricted Access:** Discoverable and readable only by authorized users and teams. Restricted documents do not appear in global search results for unauthorized users.
- **Canonical Capability Resolution:** Effective capabilities are resolved through canonical Orynqo authorization. The contract does not hardcode role-string assumptions (such as `member can edit` or `guest can view`).

---

## 17. Personal Favorites vs. Context Pins

To avoid conflating personal preferences with shared team curation, Orynqo enforces a strict semantic separation:

```text
┌───────────────────────────────────────┬───────────────────────────────────────┐
│ PERSONAL FAVORITE (User Scoped)       │ CONTEXT PIN (Team / Project Scoped)   │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ • "I personally read this often"      │ • "Every member of Team Core needs to │
│ • User-scoped preference relationship │   see this runbook on their Hub"      │
│ • Private to individual user          │ • Shared resource-context curation    │
│ • Star button [★] in document header  │ • Pinned to Team Hub or Project Hub   │
│ • Surfaces in user's sidebar & hub    │ • Requires `canManageContextPins`     │
│ • Zero effect on other squad members  │ • Shared curation visible to all squad│
└───────────────────────────────────────┴───────────────────────────────────────┘
```

- **Storage Independence:** The storage location of personal favorites (user profile, preference record, or edge table) is an implementation detail.
- **Semantic Capability:** Pinning to a shared context requires semantic curation authorization (e.g., `canManageContextPins`) resolved via canonical RBAC.

---

## 18. Document Lifecycle & Archival Semantics

### 18.1 Lifecycle States
```text
  [Active] ──(Archive Document)──> [Archived] ──(Restore Document)──> [Active]
```

1. **Active (`active`):** Standard operational state. Discoverable in search, listed in Team/Project docs shelves, participates in active backlink indices.
2. **Archived (`archived`):** Read-only state.
   - Distinct archived banner displayed with author and date metadata.
   - Editing is disabled until restored.
   - Excluded from default search results (accessible via explicit archive filter).
   - Inbound backlinks display an archived indicator.
3. **Permanent Deletion (Trash):** Deferred to POST-CORE. Documents are archived, preserving relational integrity across historical WorkItems and Projects.

---

## 19. Post-Core Boundary: Version History (`DOC-003`)

`DOC-003 (Document Metadata & Version Management)` is formally classified as **POST-CORE**.

### 19.1 Future Compatibility Invariants
To ensure `UI-06B` implementation remains forward-compatible without premature complexity:
1. **Activity vs. Revision vs. Audit:**
   - `ActivityEvent`: Product and domain activity history (e.g., *"Alex updated the document title"*).
   - `DocumentRevision`: Content-level historical state representation.
   - `Enterprise Audit`: Dedicated governance and security audit log (distinct from product activity).
2. **Future DocumentRevision Semantics:** Future revision architecture must represent:
   - Revision identity;
   - Author/editor identity;
   - Timestamp;
   - Recoverable content state;
   - Compare and restore semantics.
   *Note:* The technical representation (cryptographic hashes, AST deltas, snapshot intervals) is deferred to technical architecture.

---

## 20. Inbox & Activity Integration

Docs emit notifications into the **Personal Triage Inbox (`PER-001`)** using existing frozen primitives:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Trigger Event             │ Notification Category │ Inbox Behavior     │
├───────────────────────────┼───────────────────────┼────────────────────┤
│ User mentioned via @User  │ Direct Mention        │ High priority      │
│ Inbound thread reply      │ Discussion Reply      │ Groups into thread │
│ Comment on authored doc   │ Document Activity     │ Standard triage    │
│ Access grant / shared     │ Access Control        │ Informational      │
└───────────────────────────┴───────────────────────┴────────────────────┘
```

- **Self-Action Suppression:** An author editing their own document or replying to their own comment never generates an inbox notification for themselves.

---

## 21. Quick Create Integration

Users can create documents from anywhere in the application through the canonical creation architecture:
1. **Canonical Command (`CMD-002`):** `Create Document` is accessible through global command palette (`⌘K`) and canonical quick-create triggers. Physical keyboard shortcut bindings follow centralized registry mappings.
2. **Contextual Creation from Team Hub (`TEM-005`):** Creates a canonical document with Team association pre-populated.
3. **Contextual Creation from Project (`PRJ-005`):** Creates a canonical document with Project association pre-populated.

---

## 22. Centralized Keyboard Architecture

Docs keyboard interactions strictly conform to Orynqo's centralized keyboard hierarchy:

```text
GLOBAL SCOPE (Cmd+K, Cmd+/, Sidebar toggle)
  ↓
PAGE / VIEW SCOPE (Hub navigation, list row navigation)
  ↓
OVERLAY SCOPE (Command Palette, Slash Insert Menu, Mention Popover)
  ↓
EDITABLE CONTROL SCOPE (Highest Isolation — Inside document text editor)
```

### 22.1 Priority Rules in Editor
- While typing inside `DOC-002`, the **EDITABLE CONTROL SCOPE** is active. Single-key global navigation shortcuts are suppressed so users can write freely.
- The editor must **not** register competing global `window` event listeners.
- Typing `/` and `@` inside the editor serve as native editor interaction triggers, opening overlay popovers.
- **Escape Priority:** Escape handling follows centralized overlay architecture:
  1. Closes open slash menu or mention popover;
  2. Closes open Inspector drawer;
  3. Subsequent escape or blur behavior is validated during implementation for accessibility and writing ergonomics.

---

## 23. Responsive Layout Semantics

The layout adapts across three semantic display modes using design-system tokens:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        RESPONSIVE MODES                                │
├─────────────┬──────────────────────────────────────────────────────────┤
│ Mode        │ Layout & Navigation Behavior                             │
├─────────────┼──────────────────────────────────────────────────────────┤
│ Wide        │ • Left knowledge navigation / hub facets visible         │
│             │ • Centered editor canvas with comfortable line length    │
│             │ • Right contextual metadata & Inspector drawer dockable  │
├─────────────┼──────────────────────────────────────────────────────────┤
│ Compact     │ • Left navigation collapses to slide-over overlay        │
│             │ • Full canvas width; Inspector opens as an overlay       │
├─────────────┼──────────────────────────────────────────────────────────┤
│ Narrow      │ • Single-column reading and writing stream               │
│             │ • Toolbar adapts to compact or bottom-anchored container │
│             │ • Metadata and backlinks accessible via bottom sheet     │
└─────────────┴──────────────────────────────────────────────────────────┘
```

- Breakpoint pixel numbers (e.g., 768px, 1200px) and canvas width boundaries remain tunable layout design tokens.

---

## 24. Performance & Scalability Principles

To support large technical workspaces:
1. **Incremental Rendering:** Large documents load and render blocks incrementally; off-screen blocks avoid unnecessary rendering overhead.
2. **Docs Hub Scalability:** The Docs Hub collection stream uses paginated or virtualized retrieval to support extensive document collections.
3. **Lightweight Mention Stubs:** The entity mention popover queries indexed projection stubs (ID, key, title, status) rather than full entity bodies.
4. **Debounced Search:** Hub search debounces queries appropriately to preserve smooth UI typing.

---

## 25. Technology-Neutral Query Capabilities

The contract defines query capabilities conceptually without freezing specific client framework hook signatures or cursor formats:

```text
1. Document Collection Query (DOC-001):
   - Inputs: workspace tenancy, facet selection (recent, pinned, authored, all), search query, team filter, project filter, lifecycle filter, pagination params.
   - Outputs: collection of document summary stubs, total count estimate, loading state, error state, pagination continuation mechanism.

2. Canonical Document Query (DOC-002):
   - Inputs: document ID.
   - Outputs: canonical document entity with structured content, loading state, saving state, error state.

3. Relationship Query:
   - Inputs: document ID.
   - Outputs: contextual association lists (teams, projects, initiatives, cycles).

4. Derived Backlink Query:
   - Inputs: document ID.
   - Outputs: permission-filtered referencing entities (work items, documents, projects), total authorized count, loading state.

5. Comment Thread Query:
   - Inputs: document ID.
   - Outputs: collection of active and resolved comment threads with range anchors, loading state.
```

---

## 26. Technology-Neutral Mutation Boundaries & Domain Ownership

Domain ownership is strictly preserved across mutation boundaries:

```text
1. Document Domain Ownership:
   - createDocument(title, parentId, associations, visibility) -> CanonicalDocument
   - updateDocumentContent(documentId, contentDelta) -> void
   - updateDocumentMetadata(documentId, metadataDelta) -> CanonicalDocument
   - archiveDocument(documentId, descendantResolution) -> void
   - restoreDocument(documentId) -> void
   - reparentDocument(documentId, newParentId) -> void
   - associateContext(documentId, contextType, contextId) -> void
   - detachContext(documentId, contextType, contextId) -> void

2. User Preference / Favorite Domain Ownership:
   - togglePersonalFavorite(documentId) -> boolean
   - Note: Owned by user preference domain, not Document mutations.

3. Context Curation Domain Ownership:
   - toggleContextPin(contextType, contextId, documentId) -> boolean
   - Note: Owned by team/project context domain, requiring canManageContextPins.

4. Collaboration / Comment Domain Ownership:
   - createCommentThread(documentId, content, anchor) -> CommentThread
   - replyToCommentThread(threadId, content) -> Comment
   - resolveCommentThread(threadId) -> void
   - Note: Owned by canonical collaboration domain.
```

---

## 27. Failure, Edge & Empty States

```text
┌─────────────────────────────────┬──────────────────────────────────────────────┐
│ State                           │ User Experience Behavior                     │
├─────────────────────────────────┼──────────────────────────────────────────────┤
│ 1. Document Load Failure        │ Full-surface error state: "Unable to load    │
│                                 │ document. [Retry]". Local context preserved. │
├─────────────────────────────────┼──────────────────────────────────────────────┤
│ 2. Save Failure                 │ Non-destructive status: "Failed to persist   │
│                                 │ changes. Local edits preserved. [Retry Now]".│
├─────────────────────────────────┼──────────────────────────────────────────────┤
│ 3. Inaccessible Document        │ Permission boundary notice: "Restricted      │
│                                 │ Document. You do not have permission."       │
├─────────────────────────────────┼──────────────────────────────────────────────┤
│ 4. Stale Write / Conflict       │ Non-destructive conflict banner: surfaces    │
│                                 │ conflict without overwriting local content.  │
├─────────────────────────────────┼──────────────────────────────────────────────┤
│ 5. Empty Docs Hub               │ Clean initial state: "No documents found.    │
│                                 │ [Create Document]". No artificial templates. │
├─────────────────────────────────┼──────────────────────────────────────────────┤
│ 6. Search Empty State           │ "No documents match '{query}'. [Clear] or    │
│                                 │ [Create Document]".                          │
└─────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 28. Accessibility Contract (WCAG 2.2 AA Target)

1. **Heading Hierarchy:** Document headers rendered inside the editor conform to hierarchical `h1` through `h6` standards.
2. **Keyboard Navigable Menus:** Complete ARIA combobox pattern for slash menu and mention popovers (`role="combobox"`, `aria-expanded`, `aria-activedescendant`).
3. **Screen Reader Live Regions:** Save state transitions (`Saving`, `Saved`, retry required) announce via `aria-live="polite"`.
4. **Focus Restoration:** Closing the Inspector drawer or dismissing popovers deterministically restores keyboard focus to the originating position in the editor.
5. **Color Contrast:** Muted badges, live status chips, and code blocks satisfy minimum 4.5:1 contrast ratios.

---

## 29. Conceptual Component Architecture & Responsibilities

Concrete filenames and component breakdown belong to `UI-06B` implementation. The conceptual responsibility boundaries are:

```text
Docs & Knowledge Conceptual Subsystems:
1. Docs Hub Controller: Coordinates navigation facets, search, context filters, and list/tree view state.
2. Document Collection Surface: Renders dense document rows, metadata badges, author provenance, and favorite actions.
3. Knowledge Hierarchy Navigator: Manages tree traversal, parent/child relationships, and reparenting workflows.
4. Document Canvas & Header: Houses document identity, breadcrumbs, live sync status, and context tags.
5. Semantic Editor Engine: Handles rich text blocks, keyboard shortcuts, selection ranges, and text mutations.
6. Insertion & Slash Command Surface: Contextual overlay for block insertion triggered by '/'.
7. Unified Mention Popover: Overlay for entity search and selection triggered by '@'.
8. Entity Mention Chip: Interactive inline chip with hover inspection and WorkItem Inspector bridge.
9. Derived Backlinks Panel: Displays authorization-filtered references to the active document.
10. Discussion & Comments Panel: Renders document-level and range-anchored comment threads with resolution state.
11. State & Status Banners: Handles read-only archived presentation, conflict alerts, and save error recovery.
```

---

## 30. Non-Goals (Explicit Exclusions)

The following capabilities are **strictly deferred** from UI-06:
- **No Block Databases:** Will not implement Notion-style relational tables, database properties, rollup calculations, or board projections of documents.
- **No Embedded Live WorkItem Tables:** Dynamic embedded query tables inside documents are deferred to POST-CORE.
- **No Whiteboards / Canvas Drawing:** Will not build freeform drawing tools or vector diagram canvases.
- **No Public Website Hosting:** Will not build custom public web page hosting or CDN publishing.
- **No Full Version Diffing (DOC-003):** Visual side-by-side historical revision diffs are POST-CORE.
- **No CRDT / WebSocket Collaborative Multi-Cursor Typing:** Real-time multi-cursor typing is deferred; CORE utilizes continuous bounded autosave.
- **No Generative AI Content Generators:** No automatic text generation, autocomplete, or AI knowledge summaries.
- **No Permanent Trash / Hard Delete UI:** Deletion workflows remain POST-CORE.

---

## 31. Frozen Decisions vs. Tunable Decisions

```text
┌───────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────┐
│ FROZEN PRODUCT DECISIONS (ARCHITECTURAL INVARIANTS)       │ TUNABLE / IMPLEMENTATION DECISIONS                        │
├───────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ • Document is a single canonical Workspace resource       │ • Choice of editor engine library (TipTap, Slate, Lexical)│
│ • No cloned entities (No TeamDocument or ProjectDocument) │ • Specific persistence schema / table architecture        │
│ • Hierarchy separate from contextual associations         │ • Hierarchy practical depth safety limit value            │
│ • Zero or one structural parent; cycle prevention strictly│ • Autosave debounce delay and buffering strategy          │
│   enforced before write                                   │ • Stale write / conflict detection algorithm              │
│ • Hierarchy does NOT automatically grant access           │ • Client-side draft storage / retry queue mechanism       │
│ • Permission-safe breadcrumbs (no ancestor leak)          │ • Exact responsive breakpoint numbers & canvas pixel width│
│ • Archiving parent never silently destroys descendants    │ • Physical keyboard shortcut bindings                     │
│ • Continuous autosave with data-loss protection           │ • Exact URL route patterns                                │
│ • No false offline-first durability claims                │ • Collection virtualization threshold & overscan count    │
│ • Threaded comments with anchor survival & orphan state   │ • Search debounce milliseconds & indexing cache           │
│ • Derived backlinks are authorization-filtered            │ • Cursor pagination format (base64, offset, token)        │
│ • Mention chips link to WRK-005 Inspector                 │ • File names & component decomposition                    │
│ • Explicit WorkItem conversion via canonical creation     │ • Specific anchor survival algorithm                      │
│ • Personal Favorite ≠ Shared Context Pin                  │ • Mention chip visual styling & badge padding             │
│ • Centralized keyboard isolation (Editable scope priority)│                                                           │
│ • DOC-003 version history UI is POST-CORE                 │                                                           │
└───────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 32. Acceptance Criteria for UI-06B Implementation Authorization

When `UI-06B` implementation is authorized, the engineering deliverables must satisfy:
1. **Canonical Document Identity:** Single workspace-level document model without team/project document variants.
2. **Docs Hub Queries:** Docs Hub successfully queries and filters canonical documents by facet (Recent, Pinned, Authored, All) and context (Team, Project).
3. **Hierarchy & Cycle Rejection:** Single-parent hierarchy with automated cycle prevention logic tested and proven.
4. **Association Independence:** Team and Project associations remain independent from structural hierarchy.
5. **Core Editor Capabilities:** Full support for headings, lists, task checklists, blockquotes, code blocks, and dividers.
6. **Slash Insertion Menu:** Typing `/` prompts insertion overlay; selecting item inserts block cleanly.
7. **Canonical Entity Mentions:** Typing `@` displays unified entity list; selecting entity inserts canonical reference.
8. **Permission-Safe Mentions:** Restricted entity mentions redact title and metadata for unauthorized users.
9. **WorkItem Inspector Bridge:** Clicking an accessible WorkItem reference opens the WorkItem Inspector (`WRK-005`) without leaving document context.
10. **Permission-Filtered Backlinks:** Document surfaces active references filtered by user authorization without leaking counts or titles.
11. **Threaded Comments & Anchor Survival:** Range-anchored and document-level comments with resolution and degraded anchor preservation.
12. **Continuous Autosave:** Edits persist asynchronously with ambient status indicator.
13. **Data-Loss Protection:** Save failures preserve local editor content and surface explicit retry prompts.
14. **Concurrency Protection:** Concurrent/stale writes do not silently overwrite unacknowledged local changes.
15. **Explicit WorkItem Conversion:** Converting document content initiates canonical WorkItem creation (`CMD-002`) preserving source context.
16. **Lifecycle Management:** Archive and restore state transitions work cleanly with safe descendant handling.
17. **Favorite vs Context Pin Separation:** Personal favorites and context pins operate under separate ownership and capability domains.
18. **Centralized Keyboard Adherence:** Editor operates under isolated Editable Scope; overlay menus conform to Overlay Scope; no rogue global listeners.
19. **Responsive Semantic Modes:** Interface adapts gracefully across Wide, Compact, and Narrow viewports.
20. **Regression Invariants:** All previously frozen phases (UI-01 through UI-05) remain green and unregressed.
