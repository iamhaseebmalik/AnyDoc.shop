# Architecture decisions
- AI Gateway credit and access pauses are stored server-side and checked by every AI edge function so blocked requests stay paused across reloads and restarts.
- Mobile navigation lives once beside the router with shared safe-area spacing; Home retains the existing auth-root behaviour and Profile displays existing account details without new backend data.