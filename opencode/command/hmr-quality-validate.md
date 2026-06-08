---
description: "Run validators across multiple categories (exports, typescript, compliance) via dev-tools."
---

# λ /hmr-quality-validate [category]

Execute
```bash
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/audit/dist/cli.js" inspect $ARGUMENTS
```

Run validators across multiple categories.

## §∀ On Failure

If validation fails: **FIX THE CODE**. Own ALL violations regardless of origin.
Never disable validators or add config exceptions without exhausting code fixes.
Every violation is your responsibility - fix it, don't explain it away.

Categories:
- full: Run all validators (default)
- types: TypeScript type safety validation
- arch: Architecture compliance (module boundaries)
- quality: Code quality (complexity, patterns)
- naming: Naming convention enforcement
- security: Security compliance (secrets, auth)
- docs: Documentation completeness

Examples
```bash
/hmr-quality-validate                            # Run all validators
/hmr-quality-validate types                      # Type validation only
/hmr-quality-validate security                   # Security validation only
/hmr-quality-validate quality                    # Code quality only
```
