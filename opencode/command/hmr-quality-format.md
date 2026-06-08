---
description: "Auto-format files with consistent code style via dev-tools."
---

# λ /hmr-quality-format [type]

Execute
```bash
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/audit/dist/cli.js" format $ARGUMENTS
```

Auto-format files with consistent style.

Types:
- ts: TypeScript/JavaScript files (ESLint --fix)
- json: JSON files (prettier)
- yaml: YAML files (prettier)
- rdf: RDF/Turtle files (consistent formatting)
- ignore: Ignore files (.gitignore, .npmignore)

Examples
```bash
/hmr-quality-format                              # Format all files
/hmr-quality-format ts                           # Format TypeScript only
/hmr-quality-format json                         # Format JSON only
/hmr-quality-format rdf                          # Format RDF/Turtle files
```

Agent provides:
- typescript → formatting verification, style consistency

Unlike lint (check-only), format auto-fixes issues.
