# Dotfiles

My personal development environment configuration for macOS.

## What's Included

- **Shell:** zsh with Oh My Zsh + Powerlevel10k theme
- **Terminal:** Ghostty with custom keybindings
- **Package Manager:** Homebrew
- **Version Manager:** mise (for node, npm, pnpm, ruby)
- **Font:** Iosevka Mono
- **Editor Configs:** Git configuration

## Quick Setup (New Machine)

1. Clone this repository:
```bash
git clone <your-repo-url> ~/dotfiles
```

2. Run the setup script:
```bash
cd ~/dotfiles
./setup.sh
```

3. Restart your terminal or source the config:
```bash
source ~/.zshrc
```

That's it! Your development environment is ready.

## What the Setup Script Does

1. Installs Homebrew (if not present)
2. Installs all packages from `Brewfile`
3. Installs Oh My Zsh with Powerlevel10k theme
4. Installs zsh-autosuggestions plugin
5. Creates necessary config directories
6. Backs up existing configs (with timestamp)
7. Creates symlinks to dotfiles
8. Installs development tools via mise

## Files Included

- `.zshrc` - Zsh configuration
- `.zprofile` - Zsh profile (brew shellenv, PATH)
- `.p10k.zsh` - Powerlevel10k theme configuration
- `.gitconfig` - Git user configuration
- `ghostty-config` - Ghostty terminal configuration
- `mise-config.toml` - Mise tool versions
- `Brewfile` - Homebrew packages and casks

## Manual Steps

After setup, you may want to:

1. Update `.gitconfig` with your personal email/name if needed
2. Review and adjust any API keys or tokens (not included in repo)
3. Install any company-specific tools or configs

## Updating Dotfiles

After making changes to your configs:

```bash
cd ~/dotfiles
# Copy updated configs if needed
cp ~/.zshrc .zshrc
# etc...

git add .
git commit -m "Update configs"
git push
```

## Tools Managed by Mise

- Node.js (latest)
- npm (latest)
- pnpm (latest)
- ruby (latest)

To add more tools, edit `mise-config.toml` and run `mise install`.

## Ghostty Keybindings

Custom tmux-like prefix (⌘+B):
- `⌘+B → C` - New tab
- `⌘+B → X` - Close surface
- `⌘+B → N` - New window
- `⌘+B → F` - Fullscreen
- `⌘+B → \` - Split right
- `⌘+B → -` - Split down
- `⌘+B → H/J/K/L` - Navigate splits

And many more! See `ghostty-config` for full list.

## License

Feel free to use and modify for your own setup.
