# Product Architecture

Before UI, create a domain inventory.

## Required Model
For every core entity capture:
- name and purpose
- owner
- parent/child relationships
- required properties
- optional properties
- lifecycle states
- permissions
- creation entry points
- edit surfaces
- archive/delete behavior
- activity/audit requirements
- searchable/filterable fields
- expected scale

## Workflow Mapping
For each high-value workflow document:
Trigger → entry point → actions → validation → system response → success → recovery paths.

Prioritize high-frequency, high-risk, and cross-role workflows.

## Scale Questions
How many workspaces, projects, users, rows, comments, statuses, custom properties, and saved views may exist? Design navigation and rendering for the upper realistic range, not demo data.
