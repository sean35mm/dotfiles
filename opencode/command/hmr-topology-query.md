---
description: "Query the codebase as a graph. Answers \"what calls X\", \"what implements Y\", \"what does X impact\", \"what imports this module\", \"find symbol by name\" — across all languages in the workspace via SPARQL over the topology RDF graph. Faster and more accurate than grep for structural questions."
---

# /hmr-topology-query

Query the codebase architecture graph instead of grepping source files. The topology package extracts code into an RDF graph (LSP + tree-sitter, stored in rocksdb). Use it whenever the question is about **relationships**, not strings.

## Usage

```
/hmr-topology-query <question or SPARQL>
```

## Decision rule

| Question | Tool |
|---|---|
| "Find the file containing this literal string" | `rg` / `grep` |
| "What calls X?" | `topology query --callers-of '<iri>'` |
| "What does X call?" | `topology query --callees-of '<iri>' --depth 2` |
| "What changes if I edit X?" | `topology query --neighborhood '<iri>' --depth 2` |
| "What implements interface Y?" | `topology query --saved subtypes_of --params '{"sigilUri":"<iri>"}'` |
| "What imports / depends on module M?" | `topology query --saved imports_of_module --params '{"moduleId":"<iri>"}'` |
| "Where are the entry points?" | `topology query --saved entry_points` |
| "What's the public surface of package P?" | `topology query --saved contract_surface --params '{"moduleId":"<iri>"}'` |
| "Find a symbol by name (returns IRI)" | `topology query --symbol <Name>` |
| Any other graph traversal | `topology query --sparql '<SPARQL 1.1>'` |

## Standard agent flow

1. **Get the IRI** for the entity you care about:
   ```bash
   topology query --symbol authenticateUser --format flat
   ```
2. **Ask the structural question** using that IRI:
   ```bash
   topology query --callers-of 'typescript:module/src/auth.ts#authenticateUser' --format flat
   ```
3. **Compose with SPARQL** for filtered or multi-hop questions:
   ```bash
   topology query --sparql 'PREFIX sigil: <urn:noocodec:sigil:>
   SELECT ?caller ?callerLabel WHERE {
     GRAPH <graph:merged> {
       ?caller sigil:calls <the-iri-from-step-1> .
       OPTIONAL { ?caller rdfs:label ?callerLabel }
     }
   } LIMIT 50' --format flat
   ```

## Output formats

- `--format json` (default for `--saved` and `--sparql`) — W3C SPARQL 1.1 Query Results JSON
- `--format flat` — compact `{rows: [...]}` for LLM consumption
- `--format table` — human-readable ASCII
- `--format tsv` / `--format csv` — pipe-friendly

## Prerequisites

The topology store must exist. If it doesn't, the error message will tell you the exact command:

```bash
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/topology/dist/cli.js" generate --root <project>     # full extraction (minutes first time)
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/topology/dist/cli.js" stale --root <project>        # check if the store is current
```

## Deeper graph traversal

For traversal-heavy investigation (depth-N walks, ranked entry-point discovery, impact analysis before a refactor), run additional `topology query` commands directly and compose SPARQL only when the saved queries do not cover the question. MCP is not required.

## Hard rules

- ⊥ grep for "what calls X" / "what implements Y" — that's a topology query, not a string search.
- ⊥ reading every file in a directory to find symbols — `topology query --symbol <Name>` is one command.
- ⊥ trusting blueprint.jsonld or projection.json — those are dead. Canonical store: `manifest.json` + `graphs/*.nt` + rocksdb.
- Default graph is `graph:merged`. For diagnostics, explicitly target `graph:diagnostics`. For type hierarchy, `graph:ontology`.
