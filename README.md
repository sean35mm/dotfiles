# Dotfiles

Minimal personal development dotfiles intended to be cloned onto Linux/Omarchy and applied by an agent or manually.

## Intended Scope

Keep this repo focused on portable development configuration:

- zsh shell defaults
- Powerlevel10k prompt config
- Ghostty terminal config
- Git config
- mise runtime/tool versions
- OpenCode agent/tooling config

This repo intentionally does not include Cursor, Neovim, Zellij, Omarchy desktop configs, or a setup script.

## Files

```text
.gitconfig              Git user/config defaults
ghostty-config          Ghostty terminal configuration
.p10k.zsh               Powerlevel10k prompt configuration
.zprofile               Portable login-shell PATH setup
.zshrc.example          Safe zsh config template; copy/symlink to ~/.zshrc
mise-config.toml        mise tool versions
opencode/               OpenCode agents, commands, plugins, tools, and example config
```

## Suggested Links on Omarchy

From a clone of this repo, an agent can link/copy:

```bash
ln -sf "$PWD/.gitconfig" "$HOME/.gitconfig"
mkdir -p "$HOME/.config/ghostty"
ln -sf "$PWD/ghostty-config" "$HOME/.config/ghostty/config"
ln -sf "$PWD/.p10k.zsh" "$HOME/.p10k.zsh"
ln -sf "$PWD/.zprofile" "$HOME/.zprofile"
ln -sf "$PWD/.zshrc.example" "$HOME/.zshrc"

mkdir -p "$HOME/.config/mise" "$HOME/.config"
ln -sf "$PWD/mise-config.toml" "$HOME/.config/mise/config.toml"
ln -sfn "$PWD/opencode" "$HOME/.config/opencode"
```

Then install tools with:

```bash
mise install
```

## Secrets

Do not commit API keys, access tokens, credentials, SSH keys, npm tokens, AWS config, or local machine paths.

Put private environment variables in an ignored local file instead:

```bash
mkdir -p ~/.config/secrets
$EDITOR ~/.config/secrets/env.zsh
```

Example:

```zsh
export CONTEXT7_API_KEY="..."
export SUPABASE_ACCESS_TOKEN="..."
export SUPABASE_PROJECT_REF="..."
```

`.zshrc.example` sources this file automatically if it exists.

## OpenCode

The tracked OpenCode config should include reusable agents/tools and an example config only.

Tracked:

```text
opencode/AGENTS.md
opencode/command/
opencode/plugin/
opencode/plugins/
opencode/tool/
opencode/opencode.json.example
opencode/package.json
opencode/tui.json
opencode/dcp.jsonc
```

Ignored/private/generated:

```text
opencode/opencode.json
opencode/node_modules/
opencode/.opencode/
opencode/bun.lock
*.log
```
