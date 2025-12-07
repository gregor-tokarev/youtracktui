# YouTrack TUI

A beautiful terminal user interface (TUI) for YouTrack, built with SolidJS and OpenTUI. Manage your YouTrack issues directly from your terminal with an intuitive keyboard-driven interface.

## Features

- 🎯 **Keyboard-first navigation** - Navigate and manage issues without leaving your terminal
- 🔍 **Fast search** - Quickly find issues by ID or summary
- 📋 **Issue management** - View issue details, change states, and copy URLs
- 🎨 **Modern UI** - Clean, responsive terminal interface
- ⚡ **Fast** - Built with Bun for optimal performance

## Installation

### macOS

#### Option 1: Homebrew (Recommended)

Tap the repository and install:

```bash
brew tap gregortokarev/youtracktui
brew install yt
```

#### Option 2: Download Pre-built Binary

1. Visit the [Releases](https://github.com/gregortokarev/youtracktui/releases) page
2. Download the appropriate archive for your Mac:
   - `yt-macos-arm64-v*.tar.gz` for Apple Silicon (M1/M2/M3)
   - `yt-macos-x64-v*.tar.gz` for Intel Macs
3. Extract the archive:
   ```bash
   tar -xzf yt-macos-arm64-v*.tar.gz
   ```
4. Move the binary to a directory in your PATH:
   ```bash
   sudo mv yt /usr/local/bin/
   ```
   Or for Apple Silicon:
   ```bash
   sudo mv yt /opt/homebrew/bin/
   ```
5. Make it executable (if needed):
   ```bash
   chmod +x /usr/local/bin/yt
   ```

#### Option 3: Build from Source

1. Install [Bun](https://bun.sh):
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/gregortokarev/youtracktui.git
   cd youtracktui
   ```

3. Install dependencies:
   ```bash
   bun install
   ```

4. Build the application:
   ```bash
   bun run build:release
   ```

5. The binary will be in `dist/yt-macos-arm64/yt` (or `dist/yt-macos-x64/yt` for Intel Macs)

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

You can also create a `.env` file in the project root (Bun automatically loads it):

```env
YOUTRACK_BASE_URL=https://your-instance.youtrack.cloud
YOUTRACK_PERM_TOKEN=your-permanent-token
```

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
- Node.js 18+ (for TypeScript support)

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

## Project Structure

```
youtracktui/
├── packages/
│   ├── sdk/          # YouTrack SDK client
│   └── tui/          # Terminal UI application
├── scripts/          # Build and packaging scripts
└── dist/             # Build output (gitignored)
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
