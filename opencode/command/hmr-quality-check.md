---
description: "Pre-commit validation - dependencies, validate, build, lint. Run before every push to verify all code quality checks pass."
---

# ↻ /hmr-quality-check

Execute
```bash
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/audit/dist/cli.js" ci $ARGUMENTS
```

Pre-commit fast validation sequence: deps → validate → build → lint

## §∀ On Failure

If check fails: **FIX THE CODE**. Own ALL errors regardless of origin.
Never disable rules or add config exceptions without exhausting code fixes.
Every error is your responsibility - fix it, don't explain it away.
