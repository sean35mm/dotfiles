# Portable zprofile for Linux/Omarchy

# Keep login-shell PATH additions here. Interactive shell setup lives in .zshrc.
export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"

# Private login-shell environment, if needed.
[[ -f "$HOME/.config/secrets/profile.zsh" ]] && source "$HOME/.config/secrets/profile.zsh"
