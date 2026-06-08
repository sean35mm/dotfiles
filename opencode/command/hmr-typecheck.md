---
description: "Run type checking for the detected or specified language. Fix code errors — never suppress."
---

# λ /hmr-typecheck [file-or-path]

Detect the language from the target file or project, then run the appropriate type checker.

**Language detection:**

| Extension / marker | Toolchain | Agent |
|---|---|---|
| `.ts` `.tsx` `.js` `.mjs` | `tsc --noEmit` | typescript |
| `.vue` | `vue-tsc` | vue |
| `.php` | PHPStan / Psalm | laravel |
| `.swift` | `swiftc` | capacitor |
| `.kt` `.kts` | `kotlinc` | capacitor |
| `.sh` `.bash` `.zsh` git hooks | `shellcheck` + `bash -n` | bash |
| `.graphql` `.gql` | graphql-schema-linter + graphql-inspector | graphql |
| No target → detect from root | `tsconfig.json` → ts · `composer.json` → php · `pubspec.yaml` → dart · etc. | (matching agent) |

Execute
```bash
node "${HAMMERTIME_HOME:-$HOME/Desktop/Hammer/HammerTime}/packages/audit/dist/cli.js" typecheck [--language <detected>] [--root .] [--target "<file-or-path>"]
```

Use the results to provide type error analysis, type inference improvements, and strict mode compliance guidance.

## §∀ On Failure

Fix the code. Own ALL type errors regardless of origin.
Never use `@ts-ignore`, `@ts-expect-error`, or loosen type configuration without exhausting code fixes.
Every type error is your responsibility — fix it, don't suppress it.

Report results. If type errors found, offer to fix.
