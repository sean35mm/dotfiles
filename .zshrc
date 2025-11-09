
# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

ZSH_THEME="powerlevel10k/powerlevel10k"

plugins=(
  git
  zsh-autosuggestions
)

source $ZSH/oh-my-zsh.sh


# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# pnpm configuration removed - now managed by mise

# bun completions
[ -s "/Users/seangil/.bun/_bun" ] && source "/Users/seangil/.bun/_bun"

# bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH"
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
export PATH="/usr/local/opt/maven/bin:$PATH"
. "/Users/seangil/.deno/env"
export PATH="/usr/local/opt/libpq/bin:$PATH"
export PATH="/usr/local/opt/libpq/bin:$PATH"



# Created by `pipx` on 2025-01-07 04:33:07
export PATH="$PATH:/Users/seangil/.local/bin"
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export JAVA_HOME="/opt/homebrew/Cellar/openjdk@17/17.0.15/libexec/openjdk.jdk/Contents/Home"
export PATH="/opt/homebrew/bin:$PATH"

# Task Master aliases added on 7/21/2025
alias tm='task-master'
alias taskmaster='task-master'
export PATH="$HOME/.cargo/bin:$PATH"
export PATH="$HOME/.cargo/bin:$PATH"

zstyle ':autocomplete:*' widget-style menu-select
bindkey -M menuselect '\r' accept-line
eval "$(mise activate zsh)"
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"
export PATH="/Users/seangil/.config/herd-lite/bin:$PATH"
export PHP_INI_SCAN_DIR="/Users/seangil/.config/herd-lite/bin:$PHP_INI_SCAN_DIR"

# Disable Homebrew auto-update
export HOMEBREW_NO_AUTO_UPDATE=1
