# UI-06A: Docs & Knowledge Product & UX Contract

- **Document Version:** `1.0.0`
- **Surface Identifier:** `DOC-001` (Docs / Knowledge Hub), `DOC-002` (Canonical Document Canvas / Editor), `DOC-003` (Document Metadata & Version Management — Boundary defined, POST-CORE)
- **Status:** **PROPOSED PRODUCT & UX SPECIFICATION — READY FOR HUMAN REVIEW**
- **Base Git SHA:** `f5cffc6e2a47f319ccde00e57b6ffb2404dcf0c6`
- **Branch:** `design/ui-06a-docs-knowledge-product-ux`
- **Lineage:** `docs/06-complete-page-and-surface-registry.md` $\rightarrow$ `docs/10-ui-02a-application-shell-sidebar-contract.md` $\rightarrow$ `docs/12-ui-03a-my-work-product-ux-contract.md` $\rightarrow$ `docs/16-ui-05a-team-hub-product-ux-contract.md` $\rightarrow$ `docs/18-ui-06a-docs-knowledge-product-ux-contract.md`

---

## 1. Status / Scope

`UI-06A` defines the complete product, domain, interaction, and UX architecture for durable knowledge, specifications, and living documentation within Orynqo.

### 1.1 Scope Boundaries
- **In Scope (CORE):**
  - Canonical `Document` workspace entity and technology-neutral relationship graph.
  - Workspace Docs Hub (`DOC-001`): Dense information architecture for discovery, recent documents, personal favorites, context-pinned resources, and faceted collection filtering.
  - Knowledge Navigation Model: Hybrid model combining flat searchable collection, structural parent/child hierarchy, contextual resource embeddings, and backlinks.
  - Document Canvas & Writing Surface (`DOC-002`): Focused, distraction-free writing environment prioritizing typography, dense context, and instant responsiveness over decorative cover art.
  - Semantic Editor Contract: Core markdown/rich text blocks, inline formatting, slash command insertion (`/`), and canonical entity mentions (`@User`, `@WorkItem`, `@Document`, `@Project`, `@Team`).
  - Document ↔ Execution Bridge: Bidirectional references, non-destructive WorkItem mentions with live status chips, split-screen Inspector invocation, and explicit content-to-WorkItem conversion.
  - Derived Backlinks System: Reactive, permission-filtered backlink graph revealing all accessible workspace entities referencing the active document.
  - Threaded Document Comments: Range-anchored and document-level collaboration with degradation-tolerant anchor survival.
  - Live Autosave & Persistence Boundary: Continuous canonical state sync with explicit conflict detection, offline queueing indicators, and zero data loss.
  - Semantic Authorization & Zero-Leakage Policy: Fine-grained action capabilities (`view`, `edit`, `comment`, `share`, `archive`) with strict metadata redaction for restricted references.
- **Explicitly Deferred (POST-CORE):**
  - `DOC-003`: Full Version History compare, visual diff viewer, and point-in-time snapshot restoration (architecture is future-compatible, but UI is POST-CORE).
  - Real-time multi-cursor CRDT collaborative typing engines.
  - Notion-style programmable database blocks, formulas, rollups, and relation properties.
  - Whiteboarding, infinite canvas freeform sketching, and visual diagrams editors.
  - Public web publishing, custom domain hosting, and external documentation portals.
  - AI writing generators, automated summarizers, and automated semantic question answering.

---

## 2. Research Synthesis & Competitive Reference Pass

To ground Orynqo Docs in proven operational ergonomics while avoiding common wiki anti-patterns, we reviewed the official product architecture and documentation of four primary reference systems:

```text
┌─────────────────┬───────────────────────────────┬───────────────────────────────┬───────────────────────────────┐
│ Reference Tool  │ Key Strengths                 │ Critical UX Failures / Flaws  │ Orynqo Decision               │
├─────────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Linear          │ • Deeply unified with issues  │ • Rigid document hierarchy    │ • Adopt: Tight execution-work │
│ Documents       │ • Minimalist, fast editor     │ • Limited long-form wiki IA   │   bridge & fast clean chrome  │
│                 │ • Bi-directional sync chips   │ • Weak standalone knowledge   │ • Reject: Flat-only isolation │
│                 │ • Zero decorative bloat       │   navigation                  │   outside of projects/teams   │
├─────────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Notion          │ • Flexible parent/child tree  │ • Documents turn into clumsy  │ • Adopt: Clean single-parent  │
│ Pages & Blocks  │ • Slash command insertion     │   database rows               │   hierarchy & slash commands  │
│                 │ • Rich mentions & backlinks   │ • Massive decorative overhead │ • Reject: Cluttered block     │
│                 │ • Inline commenting           │ • Disconnected from real work │   databases & giant headers   │
├─────────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Confluence      │ • Robust enterprise space IA  │ • Clunky Draft/Publish modal  │ • Adopt: Structured knowledge │
│ Cloud           │ • Strong versioning & history │ • Heavyweight, slow editor    │   hubs & stable deep links    │
│                 │ • Explicit page breadcrumbs   │ • Stale wiki silos divorced   │ • Reject: Disruptive publish  │
│                 │ • Team/Space ownership        │   from active sprints/issues  │   modals & slow page loads    │
├─────────────────┼───────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ ClickUp         │ • Relationship linking matrix │ • Cluttered, overwhelming UI  │ • Adopt: Rich bidirectional   │
│ Docs            │ • Sticky side table of content│ • Conflates task checkboxes   │   relationship graph          │
│                 │ • Multi-location tagging      │   with true canonical tasks   │ • Reject: Creating invisible  │
│                 │ • Pinned favorites shelf      │ • Inconsistent permission leaks│  phantom tasks from text     │
└─────────────────┴───────────────────────────────┴───────────────────────────────┴───────────────────────────────┘
```

### Detailed Decision Rationale
1. **From Linear:** Adopted the design principle that documents are live companions to execution. Live status chips for WorkItems and instantaneous Inspector invocation without losing document scroll position. Rejected Linear's limitation of only attaching documents to Projects or Teams; Orynqo supports global workspace knowledge.
2. **From Notion:** Adopted clean slash-command insertion (`/`), `@` entity mention ergonomics, and optional single-parent nested page structures. Rejected Notion's conversion of all pages into database rows, decorative cover banners, and complex relational rollups that distract from technical writing.
3. **From Confluence:** Adopted resilient URL identity, hierarchical breadcrumb paths, and enterprise-grade permission models. Strictly rejected Confluence's disruptive "Draft vs. Published" dual-state modal paradigm which leads to orphaned local drafts and stale published pages.
4. **From ClickUp:** Adopted rich relationship metadata (showing related Teams, Projects, and WorkItems in a dedicated metadata drawer). Rejected ClickUp's dangerous antipattern where typing a checklist inside a document secretly spawns phantom tasks in the project backlog.

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

## 4. Canonical Document Model

A Document is a first-class, top-level workspace resource. It is **never** cloned or namespaced into entity-specific variants (no `TeamDocument`, `ProjectDocument`, or `CycleDocument`).

```typescript
interface CanonicalDocument {
  // Identity & Tenancy
  id: string;                          // Immutable UUID (e.g., "doc-01j8x...")
  workspaceId: string;                 // Tenant boundary
  slug: string;                        // Human-readable URL slug (e.g., "auth-v2-architecture-rfc")
  
  // Core Content & Presentation
  title: string;                       // Document title (empty fallback: "Untitled Document")
  icon?: string;                       // Optional single emoji or Lucide icon token
  content: DocumentBody;               // Structured rich-text block/AST representation
  plainTextSummary?: string;           // Derived 200-character snippet for previews and fast search
  
  // Authorship & Temporal Context
  creatorId: string;                   // User ID of original author
  lastEditorId: string;                // User ID of most recent modifier
  createdAt: string;                   // ISO 8601 UTC
  updatedAt: string;                   // ISO 8601 UTC
  
  // Structural Knowledge Graph
  parentId: string | null;             // Structural parent document ID (single-parent hierarchy; null if root)
  depth: number;                       // 0 for root, max 5 for nested documents
  order: number;                       // Lexicographical or integer sort order among siblings
  
  // Contextual Relationships (Non-structural associations)
  teamIds: string[];                   // Associated operational squads (TEM-001)
  projectIds: string[];                // Associated initiatives/projects (PRJ-001)
  initiativeIds: string[];             // Associated strategic initiatives (INT-001)
  cycleIds: string[];                  // Optional historical/active cycle tie-ins (CYC-001)
  
  // Lifecycle & Governance
  lifecycle: 'active' | 'archived';    // Document lifecycle state (Trash is POST-CORE)
  archivedAt: string | null;           // Timestamp when archived
  archivedBy: string | null;           // User ID who performed archival
  
  // Visibility & Authorization Policy
  visibility: 'workspace' | 'restricted'; // Workspace-wide or explicit ACL
  allowedUserIds?: string[];           // Explicit user grants if restricted
  allowedTeamIds?: string[];           // Explicit team grants if restricted
}
```

### 4.1 Immutability of Identity
- The `id` remains completely immutable across renames, reparenting, and project/team reassignments.
- Links formatted as `/docs/{id}` or `/docs/{id}-{slug}` resolve deterministically even if the document is retitled from "Auth Spec Draft" to "Authentication V2 Final Architecture".

---

## 5. Document Relationship Graph

Orynqo models connections between knowledge and execution using four distinct, strictly typed relationship primitives:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        RELATIONSHIP TAXONOMY                           │
├───────────────────┬────────────────────────────────────────────────────┤
│ Primitive         │ Definition & Lifecycle Behavior                    │
├───────────────────┼────────────────────────────────────────────────────┤
│ 1. Structural     │ • Strict tree ownership: exactly one parentId      │
│    Hierarchy      │ • Controls breadcrumbs, tree navigation, and       │
│    (Parent/Child) │   default inherited visibility                     │
│                   │ • Moving a document updates parentId; children move│
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

### 5.1 Contextual Association vs. Ownership
- **No Shared Fate on Deletion:** If Project `PRJ-AUTH-V2` is deleted or completed, its associated architecture documents are **not** deleted. Their `projectIds` relationship is simply detached.
- **Multi-Team Runbooks:** A runbook describing database failover procedures can be associated with both the `Infrastructure Team` and the `Platform Core Team` without duplicating the document.

---

## 6. Docs Hub (`DOC-001`) Information Architecture

The Docs Hub is the primary entry point for workspace-level knowledge retrieval (`G then D`). It eliminates the unstructured "document graveyard" by employing a dense, categorized information architecture:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ DOCS HUB (`DOC-001`)                                                            [+ New Document]   │
├────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [Search documents by title, content, author, tag... (/)]  [Filter by Team ▾] [Filter by Project ▾] │
├───────────────────┬────────────────────────────────────────────────────────────────────────────────┤
│ NAVIGATION FACETS │ MAIN DOCUMENT STREAM                                                           │
│                   │ View: [Recent ▾]  Display: [Dense List | Compact Tree]                         │
│ • Recent          ├────────────────────────────────────────────────────────────────────────────────┤
│ • Pinned / Starred│ TITLE                     CONTEXT          LAST MODIFIED      AUTHOR    STATUS │
│ • Created by Me   │ 📄 Platform Onboarding     Team: Core       2h ago by @sarah   Active    [★]    │
│ • Living Specs    │ 📄 Auth V2 RFC             Proj: Auth V2    Yesterday by @alex Active    [☆]    │
│ • Team Runbooks   │ 📄 Incident Postmortem #42 Team: Infra      Sep 24 by @chen    Active    [☆]    │
│ • All Documents   │ 📄 Legacy Billing Flow     Team: Growth     Sep 12 by @elena   Archived  [☆]    │
│                   │ 📄 Redis Failover Runbook  Team: Core,Infra Aug 30 by @mike    Active    [★]    │
└───────────────────┴────────────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Hub Facets (Curated Query Presets)
1. **Recent (`recent`):** Documents recently viewed or modified by the active user.
2. **Pinned / Starred (`pinned`):** Personal user favorites (`Favorite`) merged with context-pinned items from the user's joined teams (`Context Pin`).
3. **Created by Me (`authored`):** Filter where `creatorId === currentUser.id`.
4. **Living Specs (`specs`):** Technical specification documents associated with active projects.
5. **Team Runbooks (`runbooks`):** Operational guides associated with the user's squads.
6. **All Documents (`all`):** Complete workspace index respecting visibility permissions.

### 6.2 Density & Column Structure
The primary view uses a dense high-information grid rather than oversized visual cards:
- **Title & Icon:** Direct link to `DOC-002`. Displays nesting indicator if child.
- **Context Badges:** Pill indicators showing associated Teams (`ENG`, `INFRA`) or Projects (`AUTH-V2`).
- **Last Modified:** Human-readable relative timestamp + avatar of `lastEditorId`.
- **Author:** Avatar and handle of `creatorId`.
- **Star Action:** Instant toggle for personal favorites.

---

## 7. Knowledge Navigation & Structural Hierarchy

Orynqo adopts a **Dual-Mode Knowledge Navigation** model:
1. **Fast Search & Direct Links (Primary):** Users retrieve documents via fuzzy search (`⌘K`, `/`), contextual tabs in Teams/Projects, and backlinks.
2. **Structural Tree Hierarchy (Secondary):** Deep documentation (e.g., Engineering Handbooks, API specs) can be structured with parent/child relationships up to **5 levels of depth**.

```text
Engineering Handbook (Root, Depth 0)
├── Architecture Standards (Depth 1)
│   ├── Microservices Guidelines (Depth 2)
│   └── Event Bus Topology (Depth 2)
└── Operations Runbooks (Depth 1)
    ├── Production Deployments (Depth 2)
    │   └── Blue-Green Rollback Procedures (Depth 3)
    └── Secret Rotation (Depth 2)
```

### 7.1 Hierarchy Invariants & Cycle Prevention
- **Single Parent Invariant:** A document can have exactly zero or one `parentId`. Multi-parent directed acyclic graphs are strictly forbidden.
- **Strict Cycle Prevention:** When reparenting document $A$ under document $B$, the system validates that $B$ is not a descendant of $A$ ($\text{ancestors}(B) \cap \{A\} = \emptyset$). Any violation is rejected before write.
- **Depth Limit:** Maximum nesting depth is capped at 5 to prevent unnavigable tree structures.
- **Breadcrumbs:** `DOC-002` dynamically computes the full ancestral chain:
  `Workspace > Engineering Handbook > Operations Runbooks > Production Deployments`.
- **Cascading Archival:** Archiving a parent document prompts the user to either:
  1. Archive parent and all nested children recursively.
  2. Reparent children to the archived parent's parent (elevate siblings).

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
- **Live Sync Indicator:** Top-right ambient indicator displays sync state: `Saved`, `Saving...`, `Offline (Cached)`.
- **Distraction-Free Focus:** Margins and line heights conform to high-readability typographic scales (optimized at 68-75 characters per line).

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
- Bold (`⌘B`), Italic (`⌘I`), Strikethrough (`⌘⇧X`), Inline Code (`` `code` ``), Hyperlinks (`⌘K`).

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
- **Fuzzy Filtering:** Typing `/call` instantly focuses Callout Box; `/code` selects Code Block.

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

### 11.1 The Live Mention Chip
When an entity is selected, it renders as a reactive inline pill:
- `[🟢 ENG-402: Automate ingress...]`: Displays live status color, key, and truncated title.
- **Hover Card:** Hovering reveals status, assignee, priority, and cycle.
- **Click Invocation:** Clicking a WorkItem chip invokes the **WorkItem Inspector Drawer (`WRK-005`)** sliding out from the right side of the screen. The user inspects and updates the task **without losing their scroll position in the document**.

### 11.2 Zero-Leakage Permission Policy
If user $U$ views a Document containing mentions of entity $E$, and $U$ lacks permission to view $E$:
- **Title Redaction:** The chip renders: `🔒 Restricted Item`.
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

### 12.1 Backlink Rules
1. **Computed Dynamically:** Backlinks are derived relationships computed from the workspace graph. Authors never manually manage backlink lists.
2. **Permission-Filtered:** If a backlinking WorkItem or Document is restricted from the current user, it is omitted from the backlink count and list.
3. **Surrounding Context Preview:** Displays a 1-line snippet highlighting where the link occurs.

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
│ • Document automatically adds inline chip: [🟡 ENG-415: Migrate auth...] │
│ • WorkItem detail automatically lists Document in its "Living Specs" tab │
└──────────────────────────────────────────────────────────────────────────┘
```

### 13.1 Bridge Invariants
- **No Hidden Duplicate Task System:** Checking a checkbox `- [x]` in a document does **not** update or complete a WorkItem. Checklists inside text are local formatting.
- **WorkItems Are Born via Explicit Action:** WorkItems linked to documents are created through standard canonical creation (`CMD-002`), preserving complete team, assignee, status, and estimation semantics.
- **Living Spec Linked Tables:** A document may embed a live query table showing all WorkItems matching `project == currentProject && document == thisDoc`. The table is a live projection of canonical data, not a detached table.

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
When text surrounding an anchored comment is edited:
1. **Exact Offset Shift:** If text is typed before the anchor, character offsets shift cleanly.
2. **Text Modification:** If the anchored text itself is partially modified, the anchor tracks the surrounding fuzzy text tokens.
3. **Anchor Deleted (Orphaned State):** If the user deletes the entire paragraph containing the anchor, **the comment is never silently deleted**. It transitions to an `orphaned` state, retained in the Document Discussion Panel with a notice: *"Anchored text was deleted during editing."*
4. **Resolved Means Resolved, Not Deleted:** Resolved comment threads remain accessible under the `Resolved Comments` filter for full auditability.

---

## 15. Autosave, Drafts, and Conflict Resolution

### 15.1 Architectural Decision: Continuous Live Autosave
Orynqo adopts **Continuous Live Autosave** for CORE.
- **The Rationale:** The traditional "Draft vs. Published" model creates massive operational pain: stale published documentation, forgotten unpublished drafts, and merge conflicts.
- Every keystroke and block mutation stages locally and debounces to the server within **1000ms**.
- The header displays an ambient status indicator:
  - `Synced` (Checkmark icon)
  - `Saving...` (Pulsing dot)
  - `Offline (Saved to local cache)` (Warning icon)

### 15.2 Concurrent Modification & Conflict Resolution
- In CORE, if two users edit the same document concurrently without real-time CRDT:
  - Last-write-wins at the individual **block level** (not document-wide overwriting).
  - If a collision occurs on the same block, the client prompts the user with an inline conflict banner: *"This section was modified by @sarah a few seconds ago. [Review Changes] [Keep Mine]"*.
  - Full real-time cursor presence and operational transforms are explicitly documented as **POST-CORE**.

---

## 16. Semantic Permissions & Visibility Model

Docs authorization integrates cleanly into Orynqo's hierarchical RBAC matrix:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      SEMANTIC PERMISSION TOKENS                        │
├─────────────────────┬──────────────────────────────────────────────────┤
│ Token               │ Action Authorized                                │
├─────────────────────┼──────────────────────────────────────────────────┤
│ document:view       │ Read document content, metadata, and backlinks   │
│ document:create     │ Create a new canonical document in the workspace │
│ document:edit       │ Modify title, blocks, content, and inline tags   │
│ document:comment    │ Post inline and document-level comments/replies  │
│ document:share      │ Alter visibility, manage user/team ACL grants    │
│ document:move       │ Reparent in hierarchy or reassign context ties   │
│ document:archive    │ Transition document lifecycle to 'archived'      │
│ document:delete     │ Permanently delete document (Admin only)         │
└─────────────────────┴──────────────────────────────────────────────────┘
```

### 16.1 Visibility Policies
- **Workspace-Accessible (`workspace`):** Discoverable and readable by any authenticated workspace member. Editability depends on workspace default role (`member` can edit; `guest` can view/comment).
- **Restricted Access (`restricted`):** Accessible only to users and teams explicitly listed in `allowedUserIds` and `allowedTeamIds`. Document does not appear in global search results for unauthorized users.

---

## 17. Personal Favorites vs. Context Pins

To avoid the common mistake of confusing personal preferences with shared team curation, Orynqo enforces a strict separation:

```text
┌───────────────────────────────────────┬───────────────────────────────────────┐
│ PERSONAL FAVORITE (User Scoped)       │ CONTEXT PIN (Team / Project Scoped)   │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ • "I personally read this often"      │ • "Every member of Team Core needs to │
│ • Stored in User Preferences profile  │   see this runbook on their Hub"      │
│ • Star button [★] in document header  │ • Pinned to Team Hub (TEM-005) or     │
│ • Private to individual user          │   Project Hub (PRJ-005)               │
│ • Surfaces in user's sidebar & hub    │ • Requires `team:manage_settings`     │
│ • Zero effect on other squad members  │ • Shared curation visible to all squad│
└───────────────────────────────────────┴───────────────────────────────────────┘
```

---

## 18. Document Lifecycle & Archival Semantics

### 18.1 Lifecycle States
```text
  [Active] ──(Archive Document)──> [Archived] ──(Restore Document)──> [Active]
```

1. **Active (`active`):** Standard operational state. Discoverable in search, listed in Team/Project docs shelves, participates in active backlink indices.
2. **Archived (`archived`):** Read-only snapshot.
   - Banner displayed: *"This document was archived on {date} by @{user}. [Restore Document]"*.
   - Editing is disabled until restored.
   - Excluded from default search results (accessible via explicit `status:archived` filter).
   - Inbound backlinks display an `(Archived)` badge.
3. **Permanent Deletion (Trash):** Deferred to POST-CORE. Documents are archived, preserving relational integrity across all historical WorkItems and Projects.

---

## 19. Post-Core Boundary: Version History (`DOC-003`)

`DOC-003 (Document Metadata & Version Inspector)` is formally classified as **POST-CORE**.

### 19.1 Future-Proofing Requirements for UI-06A
To ensure `UI-06B` does not introduce architectural dead-ends that prevent version history from being added later:
1. **Separation of Activity vs. Revision:**
   - `ActivityEvent`: Domain-level audit log (e.g., *"Alex updated the document title"*, *"Sarah changed visibility to restricted"*).
   - `DocumentRevision`: Content-level snapshot containing cryptographic hash, full block delta/AST, editor ID, and timestamp.
2. **Immutable Snapshot Capability:** The underlying data layer must support persisting content states keyed by revision sequence without mutating the canonical document ID.
3. **No Fake History:** The client will not simulate version history using UI hacks or noisy ActivityEvents.

---

## 20. Inbox & Activity Integration

Docs emit notifications into the **Personal Triage Inbox (`PER-001`)** using existing frozen primitives:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Trigger Event             │ Notification Category │ Inbox Behavior     │
├───────────────────────────┼───────────────────────┼────────────────────┤
│ User mentioned via @User  │ Direct Mention        │ High priority unread│
│ Inbound thread reply      │ Discussion Reply      │ Groups into thread │
│ Comment on authored doc   │ Document Activity     │ Standard unread    │
│ Access grant / shared     │ Access Control        │ Informational      │
└───────────────────────────┴───────────────────────┴────────────────────┘
```

- **Self-Action Suppression:** An author editing their own document or replying to their own comment never generates an inbox notification for themselves.

---

## 21. Global Quick Create (`CMD-002`) Integration

Users can create documents from anywhere in the application:
1. **Global Shortcut (`C` then select Document):** Opens the Quick Create modal pre-configured for a Document entity.
2. **Contextual Creation from Team Hub (`TEM-005`):** Creates a canonical document with `teamIds: [currentTeam.id]` pre-populated.
3. **Contextual Creation from Project (`PRJ-005`):** Creates a canonical document with `projectIds: [currentProject.id]` pre-populated.
4. **Command Palette (`⌘K` > "Create Document"):** Instantly navigates to a fresh `DOC-002` canvas.

---

## 22. Centralized Keyboard Architecture

Docs keyboard interactions strictly conform to Orynqo's centralized keyboard hierarchy:

```text
GLOBAL SCOPE (Cmd+K, Cmd+/, Sidebar toggle)
  ↓
PAGE / VIEW SCOPE (G then D for Docs Hub, list row navigation)
  ↓
OVERLAY SCOPE (Command Palette, Slash Insert Menu, Mention Popover)
  ↓
EDITABLE CONTROL SCOPE (Highest Isolation — Inside document text editor)
```

### 22.1 Priority Rules in Editor
- While typing inside `DOC-002`, the **EDITABLE CONTROL SCOPE** is active. Single-key global shortcuts (`c`, `1-6`, `j`, `k`, `x`) are completely suppressed so users can write freely.
- Typing `/` triggers the Slash Insert Menu, elevating to **OVERLAY SCOPE** until dismissed or an element is inserted.
- Pressing `Escape` inside the editor:
  1. If Slash Menu or Mention Popover is open: closes the popover.
  2. If Inspector drawer is open: closes the Inspector drawer.
  3. If text is focused: blurs the editor canvas.

---

## 23. Responsive Layout Semantics

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        RESPONSIVE ADAPTATIONS                          │
├─────────────┬──────────────────────────────────────────────────────────┤
│ Viewport    │ Layout & Navigation Behavior                             │
├─────────────┼──────────────────────────────────────────────────────────┤
│ Wide        │ • Left knowledge tree / hub facets visible               │
│ (>1200px)   │ • Centered editor canvas (max-width 840px)               │
│             │ • Right contextual metadata & Inspector drawer dockable  │
├─────────────┼──────────────────────────────────────────────────────────┤
│ Medium      │ • Left knowledge navigation collapses to slide-over      │
│ (768–1200px)│ • Full canvas width; Inspector opens as an overlay       │
├─────────────┼──────────────────────────────────────────────────────────┤
│ Narrow      │ • Pure single-column reading and writing stream          │
│ (<768px)    │ • Toolbar docks to fixed bottom action bar               │
│             │ • Metadata and backlinks accessible via bottom sheet     │
└─────────────┴──────────────────────────────────────────────────────────┘
```

---

## 24. Scale, Performance & Virtualization Invariants

To support enterprise workspaces with tens of thousands of technical documents:
1. **Lazy AST Parsing:** Large documents render blocks incrementally; off-screen blocks avoid expensive DOM reflows.
2. **Hub Virtualization:** The Docs Hub collection stream uses windowed virtualization for lists exceeding 100 documents.
3. **Debounced Query Indices:** Search-as-you-type in Docs Hub debounces at 250ms with client-side caching of recent document stubs.
4. **Lightweight Mention Stubs:** The entity mention popover queries indexed projection stubs (ID, key, title, status) rather than full entity bodies.

---

## 25. Technology-Neutral Query Contracts

```typescript
// Query: Fetch paginated, faceted document collection for Docs Hub (DOC-001)
function useDocumentsQuery(options: {
  workspaceId: string;
  facet?: 'recent' | 'pinned' | 'authored' | 'specs' | 'runbooks' | 'all';
  searchQuery?: string;
  teamId?: string;
  projectId?: string;
  lifecycle?: 'active' | 'archived';
  limit?: number;
  cursor?: string;
}): {
  documents: DocumentStub[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
};

// Query: Fetch canonical document entity with content (DOC-002)
function useDocument(documentId: string): {
  document: CanonicalDocument | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
};

// Query: Fetch derived backlinks referencing this document
function useDocumentBacklinks(documentId: string): {
  backlinks: Array<{
    sourceId: string;
    sourceType: 'work_item' | 'document' | 'project' | 'team';
    sourceKey?: string;
    sourceTitle: string;
    status?: string;
    snippet?: string;
  }>;
  totalCount: number;
  isLoading: boolean;
};

// Query: Fetch threaded discussion anchored to document
function useDocumentComments(documentId: string): {
  threads: Array<CommentThread>;
  unresolvedCount: number;
  isLoading: boolean;
};
```

---

## 26. Technology-Neutral Mutation Boundaries

```typescript
// Mutation Contract for Document Domain
interface DocumentMutations {
  createDocument(payload: {
    title?: string;
    parentId?: string | null;
    teamIds?: string[];
    projectIds?: string[];
    visibility?: 'workspace' | 'restricted';
  }): Promise<CanonicalDocument>;

  updateDocumentContent(
    documentId: string,
    contentDelta: DocumentBody,
    summary?: string
  ): Promise<void>;

  updateDocumentMetadata(
    documentId: string,
    metadata: Partial<{
      title: string;
      icon: string;
      parentId: string | null;
      teamIds: string[];
      projectIds: string[];
      visibility: 'workspace' | 'restricted';
    }>
  ): Promise<CanonicalDocument>;

  archiveDocument(documentId: string): Promise<void>;
  restoreDocument(documentId: string): Promise<void>;

  togglePersonalFavorite(documentId: string): Promise<boolean>;
  toggleContextPin(documentId: string, context: { type: 'team' | 'project'; id: string }): Promise<boolean>;

  createCommentThread(payload: {
    documentId: string;
    content: string;
    anchor?: { startOffset: number; endOffset: number; quoteText: string };
  }): Promise<CommentThread>;

  resolveCommentThread(threadId: string): Promise<void>;
}
```

---

## 27. Failure, Edge & Empty States

```text
┌─────────────────────────────────┬──────────────────────────────────────────────┐
│ Edge / Error State              │ User Experience Behavior                     │
├─────────────────────────────────┼──────────────────────────────────────────────┤
│ 1. Document Load Failure        │ Full-page error banner: "Unable to load doc. │
│    (Network / 500)              │ [Retry Connection]". Never shows blank page. │
├─────────────────────────────────┼──────────────────────────────────────────────┤
│ 2. Save Failure                 │ Amber banner: "Failed to sync changes. Local │
│    (Connection dropped)         │ copy preserved. [Retry Now]". Content stays. │
├─────────────────────────────────┼──────────────────────────────────────────────┤
│ 3. Inaccessible Document        │ Shield lock visual: "Restricted Document. You│
│    (403 Forbidden)              │ do not have permission to view this content."│
├─────────────────────────────────┼──────────────────────────────────────────────┤
│ 4. Concurrent Collision         │ Side-by-side review prompt: "Modified by     │
│                                 │ another user. [Merge Changes] [Overwrite]".  │
├─────────────────────────────────┼──────────────────────────────────────────────┤
│ 5. Empty Docs Hub               │ Fast onboarding view: "No documents found.    │
│    (Brand new workspace)        │ [Create Architecture RFC] [Create Runbook]". │
├─────────────────────────────────┼──────────────────────────────────────────────┤
│ 6. Search Empty State           │ "No documents match '{query}'. [Clear search]│
│                                 │ or [Create doc titled '{query}']".           │
└─────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 28. Accessibility Contract (WCAG 2.2 AA Target)

1. **Heading Hierarchy:** Document headers rendered inside the editor conform to hierarchical `h1` through `h6` standards.
2. **Keyboard Navigable Slash Menu:** Complete ARIA combobox pattern (`role="combobox"`, `aria-expanded`, `aria-activedescendant`).
3. **Screen Reader Live Regions:** Save state transitions (`Saving`, `Saved`, `Offline`) announce via `aria-live="polite"`.
4. **Focus Restoration:** Closing the Inspector drawer or dismissing the Mention Popover deterministically restores keyboard focus to the originating cursor position in the editor.
5. **Color Contrast:** Muted badges, live status chips, and code blocks satisfy minimum 4.5:1 contrast ratios.

---

## 29. Component Architecture & Responsibility Model

The `features/documents` directory structure strictly follows domain boundary standards:

```text
src/features/documents/
├── model/
│   ├── documentModel.js           // Entity types, factories, and validation
│   ├── documentHierarchy.js       // Cycle detection, ancestry trees, and reparenting
│   ├── documentClassifier.js      // Facet filters, sorting, and search matching
│   └── mentionParser.js           // Token extraction for mentions and backlinks
├── hooks/
│   ├── useDocumentsQuery.js       // Paginated faceted query hook for Docs Hub
│   ├── useDocument.js             // Real-time document retrieval and autosave logic
│   ├── useDocumentKeyboard.js     // Scoped editor keyboard bindings
│   ├── useDocumentBacklinks.js    // Derived incoming references query
│   └── useDocumentComments.js      // Threaded discussion integration
├── components/
│   ├── DocsHub.jsx                // DOC-001 Top-level Hub shell
│   ├── DocsNavFacets.jsx          // Left-hand category facet selector
│   ├── DocsListStream.jsx         // Dense virtualized document grid
│   ├── DocumentRow.jsx            // Individual high-density document entry
│   ├── DocumentCanvas.jsx         // DOC-002 Top-level Editor page
│   ├── DocumentHeader.jsx         // Compact identity, breadcrumbs, live sync badge
│   ├── DocumentEditor.jsx         // Core semantic block writing surface
│   ├── DocumentSlashMenu.jsx      // Contextual '/' block insertion popover
│   ├── DocumentMentionPopover.jsx // Contextual '@' entity selector
│   ├── DocumentMentionChip.jsx    // Live reactive status pill with hovercard
│   ├── DocumentBacklinksPanel.jsx // Derived incoming references shelf
│   ├── DocumentCommentsPanel.jsx  // Inline & document discussion threads
│   └── DocumentEmptyState.jsx     // Clean empty and error state surfaces
└── index.js                       // Explicit public feature exports
```

---

## 30. Non-Goals (Explicit Exclusions)

The following capabilities are **strictly deferred** from UI-06:
- **No Block Databases:** Will not implement Notion-style relational tables, database properties, rollup calculations, or board projections of documents.
- **No Whiteboards / Canvas Drawing:** Will not build freeform drawing tools or vector diagram canvases.
- **No Public Website Hosting:** Will not build custom public web page hosting or CDN publishing.
- **No Full Version Diffing (DOC-003):** Visual side-by-side historical revision diffs are POST-CORE.
- **No CRDT / WebSocket Collaborative Multi-Cursor Typing:** Real-time multi-cursor typing is deferred; CORE utilizes continuous block-level live autosave.
- **No Generative AI Content Generators:** No automatic text generation, autocomplete, or AI knowledge summaries.

---

## 31. Frozen Decisions vs. Tunable Decisions

```text
┌───────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────┐
│ FROZEN PRODUCT DECISIONS (ARCHITECTURAL INVARIANTS)       │ TUNABLE / IMPLEMENTATION DECISIONS                        │
├───────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────┤
│ • Document is a single canonical Workspace resource       │ • Exact editor engine library (TipTap vs ProseMirror vs   │
│ • No cloned entities (No TeamDocument or ProjectDocument) │   Lexical)                                                │
│ • Non-destructive Living Spec ↔ WorkItem Bridge           │ • Debounce millisecond delay for autosave (750–1200ms)    │
│ • Checklists inside text are NOT canonical WorkItems      │ • Exact pixel padding and font scale tokens               │
│ • Continuous Live Autosave (No disruptive Publish modal)  │ • Exact responsive breakpoint numbers (e.g. 768px, 1200px)│
│ • Single structural parent (Depth capped at 5)            │ • Choice of local storage caching key prefix              │
│ • Cycle prevention strictly enforced on reparenting       │ • Physical color values for callout variant backgrounds   │
│ • Contextual association separated from hierarchy         │ • Exact fuzzy search scoring algorithm                    │
│ • Zero-leakage redaction on restricted entity mentions    │ • Syntax highlighting theme palette for code blocks       │
│ • Derived backlinks are computed, never user-authored     │ • Exact order of block items inside the Slash Menu        │
│ • Resolved comments preserved in audit trail              │ • Virtualization overscan item buffer count               │
│ • Centralized keyboard scopes (Editable scope priority)   │ • Server pagination cursor format (base64 vs offset)      │
│ • Version history UI (DOC-003) is POST-CORE               │ • Specific icon token choices for custom file extensions  │
└───────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 32. Acceptance Criteria for UI-06B Implementation Authorization

When `UI-06B` implementation is authorized, the engineering deliverables must satisfy:
1. **Docs Hub (`DOC-001`):** Complete filtering by facet (Recent, Pinned, Authored, All) and context (Team, Project).
2. **Document Canvas (`DOC-002`):** Clean, typography-first canvas with breadcrumb navigation and live sync indicator.
3. **Editor Capabilities:** Full support for headings (H1-H3), bullet/numbered lists, task checklists, blockquotes, code blocks, and dividers.
4. **Slash Command Menu:** Typing `/` prompts insertion overlay; selecting item inserts block cleanly.
5. **Entity Mentions:** Typing `@` displays unified entity list; selecting WorkItem renders reactive status chip.
6. **WorkItem Inspector Bridge:** Clicking a WorkItem mention chip opens the WorkItem Inspector without leaving document context.
7. **Backlinks Surface:** Document displays live list of accessible workspace items referencing it.
8. **Hierarchy & Cycle Rejection:** Single-parent hierarchy with automated cycle prevention logic tested and proven.
9. **Zero Data Loss Autosave:** Keystrokes sync to local/remote state with failure notification on simulated rejection.
10. **Zero-Leakage Security:** Restricted mentions redact titles and metadata for unauthorized users.
11. **Keyboard Scope Adherence:** Typing inside editor suppresses application-level shortcuts; overlay shortcuts take precedence during popover states.
12. **Automated Verification:** Comprehensive Vitest suite validating queries, mutations, hierarchy invariants, and editor interactions.
