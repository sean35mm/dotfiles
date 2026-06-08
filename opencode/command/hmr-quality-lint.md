---
description: "Lint files for errors via dev-tools. Check-only mode, no auto-fix."
---

# λ /hmr-quality-lint [type]

Execute
```bash
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/audit/dist/cli.js" lint $ARGUMENTS
```

Lint files for errors (check-only, no auto-fix).

## §∀ On Failure

If lint fails: **FIX THE CODE**. Own ALL lint errors regardless of origin.
Never add eslint-disable comments or modify rules without exhausting code fixes.
Every lint error is your responsibility - fix it, don't suppress it.

Types:
- ts: TypeScript/JavaScript files (ESLint)
- json: JSON files
- yaml: YAML files
- rdf: RDF/Turtle files
- ignore: Ignore files (.gitignore, .npmignore)

Examples
```bash
/hmr-quality-lint                                # Lint all files
/hmr-quality-lint ts                             # Lint TypeScript only
/hmr-quality-lint json                           # Lint JSON only
/hmr-quality-lint yaml                           # Lint YAML only
```

Agent provides:
- typescript → lint error analysis, fix recommendations, pattern violations

To auto-fix issues, use `/hmr-quality-format` instead.
