# Component Architecture

Layer components:
Primitive → Composite → Data → Pattern → Screen.

## Component Contract
Document:
- purpose
- anatomy
- variants
- sizes/density
- properties
- states
- content rules
- keyboard behavior
- accessibility
- responsive behavior
- token bindings

Before adding a component ask:
1. Can an existing component support this via property/variant?
2. Is the behavior actually a reusable pattern?
3. Would the new component fragment the system?
