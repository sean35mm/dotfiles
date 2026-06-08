---
description: "Run tests with scope filtering (unit/integration/e2e/all). Supports pattern matching, coverage reports, and watch mode."
---

# ✓ /hmr-test-run [scope] [--name pattern] [--skip pattern] [--coverage]

Execute
```bash
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/audit/dist/cli.js" test $ARGUMENTS
```

Preferred runner: @hammer-media/audit (Node 24 with node:test)

## §∀ On Failure

If tests fail: **FIX THE CODE**. Own ALL test failures regardless of origin.
Never skip tests, modify assertions to pass, or lower coverage thresholds without fixing the underlying issue.
Every test failure is your responsibility - fix it, don't disable it.

Features:
- Run tests by scope (unit, integration, e2e, smoke, all)
- Pattern filtering with --name/hmr-n and --skip/hmr-s
- Watch mode with --watch/hmr-w
- Debug mode with --debug or --inspect
- Coverage reports with coverage subcommand

Scopes:
- unit: tests/unit/**/*.test.ts
- integration: tests/integration/**/*.test.ts
- e2e: tests/e2e/**/*.test.ts
- smoke: tests/smoke/**/*.test.ts
- all: Run all test scopes

Examples
```bash
/hmr-test-run unit                           # Run unit tests
/hmr-test-run unit --name "auth"             # Match test names
/hmr-test-run unit --skip "slow|flaky"       # Exclude tests
/hmr-test-run tests/unit/auth.test.ts        # Specific file
/hmr-test-run --coverage                     # With coverage report
```

Agent provides:
- testing → failure analysis, fix suggestions, coverage gap recommendations, test quality improvements, mock strategies

Flags:
--name/hmr-n: Regex pattern to match test names
--skip/hmr-s: Regex pattern to exclude test names
--coverage: Include coverage report
--json: Machine-readable output
