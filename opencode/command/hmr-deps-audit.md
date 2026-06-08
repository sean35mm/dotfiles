---
description: "Security and dependency audits via dev-tools. Checks for vulnerabilities and package health issues."
---

# ⚿ /hmr-deps-audit [type]

Execute
```bash
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/audit/dist/cli.js" audit $ARGUMENTS
```

Security and health audits for dependencies.

## §∀ On Failure

If audit finds issues: **FIX THEM**. Own ALL vulnerabilities regardless of origin.
Update dependencies, patch vulnerabilities, or resolve license conflicts - don't ignore them.
Every security issue is your responsibility - address it, don't dismiss it.

Types:
- security: Known CVEs and vulnerabilities
- licenses: License compliance check
- outdated: Outdated dependencies

Examples
```bash
/hmr-deps-audit                               # Run all audits
/hmr-deps-audit security                      # Security vulnerabilities only
/hmr-deps-audit licenses                      # License compliance only
/hmr-deps-audit outdated                      # Outdated deps only
```

Output:
- Vulnerability severity levels (critical, high, medium, low)
- License compatibility issues
- Available version updates
