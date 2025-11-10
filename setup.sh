#!/bin/bash

set -e

echo "🚀 Starting development environment setup..."

# Install Homebrew if not installed
if ! command -v brew &> /dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Set up Homebrew in PATH for Apple Silicon Macs
    if [[ $(uname -m) == 'arm64' ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    echo "✅ Homebrew already installed"
fi

# Navigate to dotfiles directory
DOTFILES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DOTFILES_DIR"

# Install everything from Brewfile
echo "📦 Installing packages from Brewfile..."
brew bundle install

# Install Oh My Zsh if not installed
if [ ! -d "$HOME/.oh-my-zsh" ]; then
    echo "🎨 Installing Oh My Zsh..."
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
else
    echo "✅ Oh My Zsh already installed"
fi

# Install Powerlevel10k theme
if [ ! -d "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k" ]; then
    echo "🎨 Installing Powerlevel10k theme..."
    git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
else
    echo "✅ Powerlevel10k already installed"
fi

# Install zsh-autosuggestions plugin
if [ ! -d "${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions" ]; then
    echo "🔌 Installing zsh-autosuggestions..."
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
else
    echo "✅ zsh-autosuggestions already installed"
fi

# Create necessary directories
echo "📁 Creating config directories..."
mkdir -p ~/.config/ghostty
mkdir -p ~/.config/mise
mkdir -p ~/.ssh
mkdir -p ~/Library/Application\ Support/Cursor/User

# Backup existing configs if they exist
backup_if_exists() {
    if [ -f "$1" ] || [ -d "$1" ]; then
        echo "📋 Backing up existing $1 to $1.backup"
        mv "$1" "$1.backup.$(date +%Y%m%d_%H%M%S)"
    fi
}

backup_if_exists ~/.zshrc
backup_if_exists ~/.zprofile
backup_if_exists ~/.p10k.zsh
backup_if_exists ~/.gitconfig
backup_if_exists ~/.config/ghostty/config
backup_if_exists ~/.config/mise/config.toml
backup_if_exists ~/.ssh/config

# Create symlinks
echo "🔗 Creating symlinks..."
ln -sf "$DOTFILES_DIR/.zshrc" ~/.zshrc
ln -sf "$DOTFILES_DIR/.zprofile" ~/.zprofile
ln -sf "$DOTFILES_DIR/.p10k.zsh" ~/.p10k.zsh
ln -sf "$DOTFILES_DIR/.gitconfig" ~/.gitconfig
ln -sf "$DOTFILES_DIR/ghostty-config" ~/.config/ghostty/config
ln -sf "$DOTFILES_DIR/mise-config.toml" ~/.config/mise/config.toml

# Set up SSH config and public keys
echo "🔑 Setting up SSH configuration..."
if [ -f "$DOTFILES_DIR/.ssh/config" ]; then
    ln -sf "$DOTFILES_DIR/.ssh/config" ~/.ssh/config
fi

# Copy public keys if they exist
if [ -f "$DOTFILES_DIR/.ssh/id_ed25519.pub" ]; then
    cp "$DOTFILES_DIR/.ssh/id_ed25519.pub" ~/.ssh/
fi
if [ -f "$DOTFILES_DIR/.ssh/replit.pub" ]; then
    cp "$DOTFILES_DIR/.ssh/replit.pub" ~/.ssh/
fi

# Set correct permissions for .ssh directory
chmod 700 ~/.ssh
if [ -f ~/.ssh/config ]; then
    chmod 600 ~/.ssh/config
fi

# Check if private keys exist in dotfiles (they should be added manually)
echo ""
echo "⚠️  SSH Private Keys Setup:"
if [ ! -f "$DOTFILES_DIR/.ssh/id_ed25519" ] || [ ! -f "$DOTFILES_DIR/.ssh/replit" ]; then
    echo "   Private keys not found in dotfiles (this is normal for security)."
    echo "   You'll need to manually copy your private keys to ~/.ssh/"
    echo "   Or they may already exist on this machine."
else
    echo "   Private keys found in dotfiles directory."
    echo "   Please manually copy them to ~/.ssh/ and set permissions:"
    echo "   cp $DOTFILES_DIR/.ssh/id_ed25519 ~/.ssh/ && chmod 600 ~/.ssh/id_ed25519"
    echo "   cp $DOTFILES_DIR/.ssh/replit ~/.ssh/ && chmod 600 ~/.ssh/replit"
fi
# Set up Cursor editor settings
echo "🎨 Setting up Cursor editor configuration..."
if [ -f "$DOTFILES_DIR/cursor/settings.json" ]; then
    cp "$DOTFILES_DIR/cursor/settings.json" ~/Library/Application\ Support/Cursor/User/
    echo "   ✅ Cursor settings.json copied"
fi
if [ -f "$DOTFILES_DIR/cursor/keybindings.json" ]; then
    cp "$DOTFILES_DIR/cursor/keybindings.json" ~/Library/Application\ Support/Cursor/User/
    echo "   ✅ Cursor keybindings.json copied"
fi
echo ""

# Set up mise activation in .zshrc if not already present
if ! grep -q 'eval "$(mise activate zsh)"' ~/.zshrc; then
    echo "🔧 Adding mise activation to .zshrc..."
    echo 'eval "$(mise activate zsh)"' >> ~/.zshrc
fi

# Install tools via mise
echo "📦 Installing development tools via mise..."
mise install

echo ""
echo "✨ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Restart your terminal or run: source ~/.zshrc"
echo "   2. Your development environment is ready!"
echo ""
echo "💡 Notes:"
echo "   - Original configs backed up with timestamp"
echo "   - All configs are symlinked to $DOTFILES_DIR"
echo "   - Update any personal info in .gitconfig as needed"
echo "   - SSH config and public keys are set up"
echo "   - Remember to manually add SSH private keys if needed"
echo "   - Cursor editor settings and keybindings are set up"
echo ""
