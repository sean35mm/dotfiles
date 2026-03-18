#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPENCODE_SRC="$SCRIPT_DIR/opencode"
OPENCODE_DEST="$HOME/.config/opencode"

echo "=== OpenCode Linux Setup ==="
echo ""

# Validate source exists
if [ ! -d "$OPENCODE_SRC" ]; then
    echo "Error: opencode directory not found at $OPENCODE_SRC"
    exit 1
fi

# Back up existing config if it's a real directory (not a symlink)
if [ -d "$OPENCODE_DEST" ] && [ ! -L "$OPENCODE_DEST" ]; then
    echo "Backing up existing config to $OPENCODE_DEST.backup.$(date +%Y%m%d_%H%M%S)"
    mv "$OPENCODE_DEST" "$OPENCODE_DEST.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Ensure parent dir exists
mkdir -p "$HOME/.config"

# Remove stale symlink if present
rm -f "$OPENCODE_DEST"

# Create symlink
ln -sfn "$OPENCODE_SRC" "$OPENCODE_DEST"
echo "Symlinked $OPENCODE_DEST -> $OPENCODE_SRC"

# Create opencode.json from template if missing
if [ ! -f "$OPENCODE_SRC/opencode.json" ]; then
    cp "$OPENCODE_SRC/opencode.json.example" "$OPENCODE_SRC/opencode.json"
    echo ""
    echo "Created opencode.json from template."
    echo "Fill in your API keys:"
    echo "  - Set CONTEXT7_API_KEY environment variable (or replace placeholder in opencode.json)"
    echo "  - Replace YOUR_SUPABASE_PROJECT_REF in the supabase MCP URL"
else
    echo "opencode.json already exists, skipping template copy."
fi

# Install plugin dependencies
echo ""
if command -v bun &> /dev/null; then
    echo "Installing dependencies with bun..."
    (cd "$OPENCODE_DEST" && bun install)
elif command -v npm &> /dev/null; then
    echo "Installing dependencies with npm..."
    (cd "$OPENCODE_DEST" && npm install)
else
    echo "Warning: Neither bun nor npm found. Run 'bun install' in $OPENCODE_DEST manually."
fi

echo ""
echo "OpenCode setup complete!"
