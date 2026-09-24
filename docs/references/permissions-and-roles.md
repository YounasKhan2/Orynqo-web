# Permissions and Roles

Model permission behavior before UI.

For each action define:
- who can see it
- who can execute it
- whether unavailable actions are hidden or disabled
- why access is unavailable
- escalation/request-access path if supported

Represent inherited permissions and scope clearly. Do not imply that hiding an action is authorization; server-side enforcement remains required.
