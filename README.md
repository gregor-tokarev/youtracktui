# YouTrack TUI

A beautiful terminal user interface (TUI) for YouTrack, built with SolidJS and OpenTUI. Manage your YouTrack issues directly from your terminal with an intuitive keyboard-driven interface.

## Features

- 🎯 **Keyboard-first navigation** - Navigate and manage issues without leaving your terminal
- 🔍 **Fast search** - Quickly find issues by ID or summary
- 📋 **Issue management** - View issue details, change states, and copy URLs
- 🎨 **Modern UI** - Clean, responsive terminal interface
- ⚡ **Fast** - Built with Bun for optimal performance

## Installation

### Quick Install (Recommended)

Install the latest version with a single command:

```bash
curl -fsSL https://raw.githubusercontent.com/gregor-tokarev/youtracktui/main/install.sh | bash
```

This script will:
- Automatically detect your platform (macOS/Linux, Intel/ARM)
- Download the latest release from GitHub
- Install the binary to `/usr/local/bin` (or `/opt/homebrew/bin` for Apple Silicon)
- Request sudo permissions if needed

## Configuration

Before running the application, you need to set up your YouTrack credentials as environment variables:

```bash
export YOUTRACK_BASE_URL="https://your-instance.youtrack.cloud"
export YOUTRACK_PERM_TOKEN="your-permanent-token"
```

To get a permanent token:
1. Go to your YouTrack instance
2. Navigate to Settings → Authentication → Permanent Tokens
3. Create a new token with appropriate permissions

## Usage

Run the application:

```bash
yt
```

Or if running from source:

```bash
bun run dev
```

### Keybindings

- `j` / `k` - Navigate up/down through issues
- `/` - Open search to filter issues
- `esc` - Close search or modals
- `y` - Copy full issue URL to clipboard
- `^y` - Copy branch prefix to clipboard
- `o` - Open issue in browser
- `s` - Change issue state
- `` ` `` - Toggle console
- `q` - Quit application
- `?` or `shift+/` - Show help/keybindings

Press `?` anytime to see all available keybindings.

## Development

### Prerequisites

- [Bun](https://bun.sh) (latest version)

### Setup

```bash
bun install
```

### Run in Development Mode

```bash
bun run dev
```

### Build

Build for all platforms:

```bash
bun run build:release
```

Build for a specific platform:

```bash
cd packages/tui
BUILD_TARGET=bun-darwin-arm64 BUILD_OUTDIR=../../dist/tui bun run build.ts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
