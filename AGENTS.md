# Architecture decisions
- AI Gateway credit and access pauses are stored server-side and checked by every AI edge function so blocked requests stay paused across reloads and restarts.