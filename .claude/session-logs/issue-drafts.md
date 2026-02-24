# Issue Drafts — 2026-02-24

## Issue 1: anthropics/claude-code

### Title
[BUG] Task tool subagents spawn duplicate MCP servers and leak `~/.claude/tasks/` directories on Windows

### Body

## Description

Two problems compound to cause escalating resource leaks on Windows:

1. **MCP server duplication**: Each Task tool subagent (`claude --resume`) spawns its own complete set of MCP servers. With 5 configured MCP servers (Playwright, Context7, Sentry, Supabase, GitHub), a single subagent doubles the node.exe count from ~8 to ~16. Nested subagent chains (common in orchestration workflows) multiply this further.

2. **`~/.claude/tasks/` directory leak**: `TeamCreate`/`TaskCreate` writes task directories to `~/.claude/tasks/{uuid}/`. When the parent session is terminated (Ctrl+C, crash, freeze), `TeamDelete` never fires. These directories accumulate indefinitely — observed 25 stale directories spanning 3 weeks.

This compounds with the known orphaned subagent issue (#19045, #17391, #20369) but adds Windows-specific details and an additional leak vector (task directories + MCP duplication).

## Environment

- **Claude Code version**: 2.1.52
- **OS**: Windows 11 (MINGW64_NT-10.0-26300, Git Bash via Windows Terminal)
- **MCP servers configured**: 5 (Playwright, Context7, Sentry, Supabase, GitHub)
- **Workflow**: GSD (get-shit-done-cc) which heavily uses Task tool with agent teams

## Steps to Reproduce

### MCP duplication
1. Configure 3+ MCP servers in `~/.claude/settings.json`
2. Start a Claude Code session
3. Use the Task tool to spawn a subagent
4. Check processes: `wmic process where "name='node.exe'" get ProcessId,CommandLine`
5. Observe: each MCP server now has 2 instances (one per CLI process)

### Task directory leak
1. Start a Claude Code session
2. Use `TeamCreate` or `TaskCreate` (directly or via orchestration skill)
3. Kill the session (Ctrl+C or close terminal)
4. Check: `ls ~/.claude/tasks/` — UUID directories remain
5. Repeat over multiple sessions — directories accumulate

## Expected Behavior

1. Subagent processes should share the parent's MCP server connections, OR MCP servers should be cleaned up when the subagent exits
2. `~/.claude/tasks/{uuid}/` directories should be cleaned up on session end (graceful or crash)

## Actual Behavior

### MCP duplication evidence
```
# Two claude-code CLI processes:
claude --dangerously-skip-permissions --resume  (PID 26016, parent)
claude --dangerously-skip-permissions --resume  (PID 23948, subagent)

# Each spawns its own MCP servers — duplicates:
npx @playwright/mcp@latest          (PID 18304 + PID 9052)
npx -y @upstash/context7-mcp        (PID 16120 + PID 20996)
npx -y @sentry/mcp-server@0.29.0    (PID 27804, single — only one CLI uses it)
npx -y @supabase/mcp-server@0.6.3   (PID 8532, single)
npx -y @modelcontextprotocol/server-github@2025.4.8  (PID 1312, single)

# Total: 16 node.exe processes for a single user session
```

### Task directory leak evidence
```bash
$ ls ~/.claude/tasks/ | wc -l
25

$ ls -lt ~/.claude/tasks/ | head -5
drwxr-xr-x  Feb 23  b041161e-c93b-457f-8708-3f53b096d54b/
drwxr-xr-x  Feb 23  8047846d-e967-4d78-8b12-65039f549f32/
drwxr-xr-x  Feb 19  99488560-2b54-4b0b-a75b-913908afb5b2/
drwxr-xr-x  Feb 19  efdcff71-b0ba-4edf-b7f4-c78c904fee95/
drwxr-xr-x  Feb 19  a01d3bd8-af5d-41ba-8b41-0f0fb46ffb72/
# ...spanning back to Feb 7
```

## Workaround

```bash
# Kill all orphaned node processes (kills current session too)
taskkill //F //IM node.exe

# Clean stale task directories
rm -rf ~/.claude/tasks/*

# Restart
claude
```

## Suggested Fixes

1. **MCP server sharing**: Subagents should connect to the parent's MCP servers via IPC rather than spawning their own instances. This would cut per-subagent overhead from ~5 processes to 0.

2. **Session-end cleanup hook**: Register a cleanup handler (even for SIGINT/SIGTERM on Windows) that:
   - Terminates all child subagent processes
   - Runs `TeamDelete` for any active teams
   - Removes `~/.claude/tasks/{uuid}/` directories owned by this session

3. **Task directory TTL**: Add a periodic or startup sweep that removes task directories older than N hours (e.g., 24h) with no active team referencing them.

4. **Subagent timeout**: The Task tool blocks the parent indefinitely waiting for subagent completion. A configurable timeout (default: 10 minutes?) with graceful termination would prevent infinite hangs.

## Related Issues

- #19045 — Subagent processes not terminated on Linux (same root cause, different OS)
- #17391 — Orphaned processes cause 34GB+ memory consumption (macOS)
- #20369 — Orphaned subagent memory leaks on parent termination
- #25700 — Sessions in invisible wait states with no timeout
- #15945 — MCP server causes 16+ hour hang, no timeout detection

---

## Issue 2: gsd-build/get-shit-done

### GSD Version
1.20.6

### Runtime
Claude Code

### Title
plan-phase serial agent chain freezes on Windows due to Claude Code subagent/MCP leaks

### What happened?

`/gsd:plan-phase` freezes consistently on Windows during the planning stage. The root cause is a Claude Code platform bug (orphaned subagents + MCP server duplication), but GSD's agent architecture triggers it more severely than typical usage because:

1. **plan-phase spawns 3 heavyweight agents sequentially** (gsd-phase-researcher → gsd-planner → gsd-plan-checker), each Opus-class. If any agent's API call hangs or context overflows, the parent blocks indefinitely — there's no timeout.

2. **execute-phase with agent teams** uses `TeamCreate`/`TaskCreate` which creates `~/.claude/tasks/{uuid}/` directories. Claude Code never cleans these up on crash/freeze, so they accumulate (observed 25 stale dirs over 3 weeks of GSD usage).

3. Each subagent spawns its own MCP servers (Claude Code issue, not GSD), so a plan-phase session with 5 configured MCP servers creates ~16 node.exe processes. After 2-3 freeze+restart cycles, there can be 30+ orphaned processes consuming gigabytes of RAM, making subsequent sessions more likely to freeze.

### What did you expect?

- plan-phase should complete without freezing
- If a subagent hangs, the orchestrator should timeout and report an error rather than blocking forever
- Session cleanup should not leave stale files in `~/.claude/tasks/`

### Steps to reproduce

1. Configure 3+ MCP servers in `~/.claude/settings.json` (Playwright, Context7, etc.)
2. Run `/gsd:plan-phase` on a non-trivial phase (5+ plans expected)
3. Wait — the phase-researcher or gsd-planner agent will eventually hang
4. Force-kill the session (Ctrl+C doesn't work, must close terminal)
5. Check `ls ~/.claude/tasks/` — stale UUID directories remain
6. Check `tasklist //FI "IMAGENAME eq node.exe"` — orphaned processes remain
7. Restart Claude Code and try again — freezes sooner due to accumulated orphans

Environment: Windows 11, Git Bash via Windows Terminal, Claude Code 2.1.52

### Relevant logs or error messages

No error messages — the session simply stops responding. No output, no timeout, no error. Must be force-killed.

```
# After force-kill, observed state:
$ tasklist //FI "IMAGENAME eq node.exe" | wc -l
16   # should be ~8

$ ls ~/.claude/tasks/ | wc -l
25   # should be 0
```

### Suggested GSD-level mitigations

While the core fix belongs in Claude Code (filed as anthropics/claude-code#XXXXX), GSD could reduce exposure:

1. **Add `max_turns` to Task tool calls in plan-phase orchestrator** — prevents infinite waits. The Task tool accepts a `max_turns` parameter that limits API round-trips.

2. **Use lighter agents for research** — `gsd-phase-researcher` currently uses Opus (inherits parent). For research-only tasks (web search, file reads), Sonnet would be sufficient and less likely to overflow context.

3. **Cleanup stale task dirs on `/gsd:progress` or session start** — GSD's `gsd-tools.cjs` could sweep `~/.claude/tasks/` for directories older than 24h.

4. **Document the Windows freeze workaround** — Add to GSD docs/FAQ: "If GSD freezes on Windows, run `taskkill //F //IM node.exe && rm -rf ~/.claude/tasks/*` then restart."
