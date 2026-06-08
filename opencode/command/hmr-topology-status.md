---
description: "Report whether the topology graph for the current workspace is up to date, what's in it, and what to do if it isn't. Runs topology stale + summarises the manifest."
---

# /hmr-topology-status

Quick health check on the topology graph for the current workspace.

## Usage

```
/hmr-topology-status
```

## What it runs

```bash
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/topology/dist/cli.js" stale --root .
```

Reports:

- **Manifest present?** → if not, prints `topology generate --root .` to bootstrap.
- **`sigil:commitSha`** — the git SHA the current graph was generated against.
- **`sigil:stale: true|false`** — whether HEAD has moved since the graph was generated.
- **`sigil:generatedAt`** — wall-clock timestamp of the last full generate.

## Decision tree

| `stale` field | Action |
|---|---|
| `false` | Queries are safe — proceed. |
| `true` | Run `topology generate --root .` before further structural queries. Or `topology generate --root . --files <list>` if only a known subset changed. |
| no manifest | First-time setup — `topology generate --root .` (full extraction; LSP warm-up takes minutes). |

## Why agents should call this first

Structural queries against a stale store return technically-correct-but-misleading results (entities that no longer exist; missing entries for newly-added files). Checking staleness up front avoids a class of "ghost result" failures.

## See also

- `/hmr-topology-query` — run a graph query
- `/hmr-topology-explore` — open the viewer
