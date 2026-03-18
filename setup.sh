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
# Create symlinks
echo "🔗 Creating symlinks..."
ln -sf "$DOTFILES_DIR/.zshrc" ~/.zshrc
ln -sf "$DOTFILES_DIR/.zprofile" ~/.zprofile
ln -sf "$DOTFILES_DIR/.p10k.zsh" ~/.p10k.zsh
ln -sf "$DOTFILES_DIR/.gitconfig" ~/.gitconfig
ln -sf "$DOTFILES_DIR/ghostty-config" ~/.config/ghostty/config
ln -sf "$DOTFILES_DIR/mise-config.toml" ~/.config/mise/config.toml

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

# Set up OpenCode configuration
echo "🤖 Setting up OpenCode configuration..."
if [ -d "$DOTFILES_DIR/opencode" ]; then
    # Remove existing dir/symlink, back up if it's a real directory
    if [ -d "$HOME/.config/opencode" ] && [ ! -L "$HOME/.config/opencode" ]; then
        echo "   📋 Backing up existing opencode config..."
        mv "$HOME/.config/opencode" "$HOME/.config/opencode.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    rm -f "$HOME/.config/opencode"

    ln -sfn "$DOTFILES_DIR/opencode" "$HOME/.config/opencode"
    echo "   🔗 Symlinked opencode config"

    # Create opencode.json from template if missing
    if [ ! -f "$DOTFILES_DIR/opencode/opencode.json" ]; then
        cp "$DOTFILES_DIR/opencode/opencode.json.example" "$DOTFILES_DIR/opencode/opencode.json"
        echo "   📝 Created opencode.json from template - fill in your API keys"
    fi

    # Install OpenCode plugin dependencies
    if command -v bun &> /dev/null; then
        echo "   📦 Installing OpenCode dependencies with bun..."
        (cd "$HOME/.config/opencode" && bun install)
    elif command -v npm &> /dev/null; then
        echo "   📦 Installing OpenCode dependencies with npm..."
        (cd "$HOME/.config/opencode" && npm install)
    else
        echo "   ⚠️  Neither bun nor npm found. Please install dependencies manually."
    fi
    echo "   ✅ OpenCode setup complete"
else
    echo "   ⚠️  OpenCode directory not found, skipping..."
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
echo "   - Cursor editor settings and keybindings are set up"
echo "   - OpenCode configuration includes custom plugins, tools, and commands"
echo "   - Environment variables (API keys) are loaded from .zshrc"
echo ""
