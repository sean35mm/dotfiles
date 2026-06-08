---
description: "Open the Cosmograph WebGL viewer for the current workspace's topology graph. Renders 60k+ nodes at 60fps with force-directed layout; click any node to inspect its inbound/outbound triples. Useful for visual orientation, architecture review, and finding nearby/related entities a SPARQL query might miss."
---

# /hmr-topology-explore

Start the topology HTTP server and open the Cosmograph WebGL explorer in your browser.

## Usage

```
/hmr-topology-explore
```

## What it does

```bash
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/topology/dist/cli.js" serve --root .
# then opens http://localhost:4747/explore in your browser
```

If port 4747 is in use (another `topology serve` running against a different repo, etc.):

```bash
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/topology/dist/cli.js" serve --port 4748
```

## Viewer surface

- **Search sidebar** — type a name (or `name:`, `path:`, `lang:`, `type:`, `id:` clauses) to find nodes; click results to focus + zoom.
- **Right inspector** — click any node to load its inbound and outbound triples.
- **Tier picker** — toggle which sigil tiers render (annotation, callable, community, edge, expression, external, member, module, type, other).
- **Physics controls** — Pause/Simulate/Restore Defaults; settings persist per workspace.
- **Theme** — light/dark; node colors come from CSS variables per tier.

## When to use this vs. `topology query`

| Goal | Tool |
|---|---|
| Visual orientation, "show me this codebase" | viewer |
| Find architectural hotspots / hubs by inspection | viewer |
| Explore a region around one node | viewer (with `?focus=<iri>` query param) |
| Get exact answers programmatically | `topology query` via CLI |
| Pipe results into the current agent | `topology query --format flat` |

The viewer and `topology query` read the **same rocksdb store**. There's no divergence between what the viewer shows and what queries return.

## Prerequisites

```bash
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/topology/dist/cli.js" generate --root .       # full extraction first
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/topology/dist/cli.js" stale --root .          # confirm store is current
```

If the store is missing or stale, the viewer will still load but show empty / outdated state.

## Hard rules

- ⊥ blocking on the viewer in agent workflows — it's a human-orientation tool. Agent investigations should use `topology query` directly.
- ⊥ killing the `topology serve` daemon while another `topology generate` is running against the same workspace — the graph-server sidecar auto-recovers, but you'll see one cycle of `fetch failed` warnings.
