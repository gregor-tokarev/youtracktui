#!/usr/bin/env bash
set -e

REPO="gregor-tokarev/youtracktui"
BINARY_NAME="yt"
INSTALL_DIR="/usr/local/bin"

echo "Installing YouTrack TUI..."

detect_platform() {
    local os=$(uname -s | tr '[:upper:]' '[:lower:]')
    local arch=$(uname -m)
    
    case "$os" in
        darwin)
            os="macos"
            ;;
        linux)
            os="linux"
            ;;
        *)
            echo "Error: Unsupported operating system: $os"
            exit 1
            ;;
    esac
    
    case "$arch" in
        x86_64|amd64)
            arch="x64"
            ;;
        arm64|aarch64)
            arch="arm64"
            ;;
        *)
            echo "Error: Unsupported architecture: $arch"
            exit 1
            ;;
    esac
    
    echo "${os}-${arch}"
}

get_latest_release() {
    curl --silent "https://api.github.com/repos/${REPO}/releases/latest" |
        grep '"tag_name":' |
        sed -E 's/.*"([^"]+)".*/\1/'
}

main() {
    local platform=$(detect_platform)
    local os=$(echo "$platform" | cut -d'-' -f1)
    echo "Detected platform: $platform"
    
    local version=$(get_latest_release)
    if [ -z "$version" ]; then
        echo "Error: Could not fetch latest release version"
        exit 1
    fi
    echo "Latest version: $version"
    
    local archive_name="yt-${platform}-${version}.tar.gz"
    local download_url="https://github.com/${REPO}/releases/download/${version}/${archive_name}"
    
    echo "Downloading $archive_name..."
    
    local tmp_dir=$(mktemp -d)
    trap "rm -rf $tmp_dir" EXIT
    
    if ! curl -fsSL "$download_url" -o "$tmp_dir/$archive_name"; then
        echo "Error: Failed to download release from $download_url"
        exit 1
    fi
    
    echo "Extracting archive..."
    tar -xzf "$tmp_dir/$archive_name" -C "$tmp_dir"
    
    if [ "$platform" = "macos-arm64" ] && [ -d "/opt/homebrew/bin" ]; then
        INSTALL_DIR="/opt/homebrew/bin"
    fi
    
    echo "Installing to $INSTALL_DIR..."
    if [ -w "$INSTALL_DIR" ]; then
        mv "$tmp_dir/$BINARY_NAME" "$INSTALL_DIR/$BINARY_NAME"
        chmod +x "$INSTALL_DIR/$BINARY_NAME"
    else
        echo "Requesting sudo permissions to install to $INSTALL_DIR..."
        sudo mv "$tmp_dir/$BINARY_NAME" "$INSTALL_DIR/$BINARY_NAME"
        sudo chmod +x "$INSTALL_DIR/$BINARY_NAME"
    fi
    
    if [ "$os" = "macos" ]; then
        echo "Removing quarantine attribute..."
        if [ -w "$INSTALL_DIR" ]; then
            xattr -d com.apple.quarantine "$INSTALL_DIR/$BINARY_NAME" 2>/dev/null || true
        else
            sudo xattr -d com.apple.quarantine "$INSTALL_DIR/$BINARY_NAME" 2>/dev/null || true
        fi
    fi
    
    echo ""
    echo "✅ YouTrack TUI installed successfully!"
    echo ""
    
    if [ "$(uname -s)" = "Darwin" ]; then
        echo "⚠️  macOS Security Notice:"
        echo "If you get a security warning when running 'yt', you can allow it by running:"
        echo "  sudo xattr -cr $INSTALL_DIR/$BINARY_NAME"
        echo "  sudo spctl --add $INSTALL_DIR/$BINARY_NAME"
        echo ""
        echo "Or go to System Settings → Privacy & Security and click 'Open Anyway'"
        echo ""
    fi
    
    echo "To get started, set up your YouTrack credentials:"
    echo "  export YOUTRACK_BASE_URL=\"https://your-instance.youtrack.cloud\""
    echo "  export YOUTRACK_PERM_TOKEN=\"your-permanent-token\""
    echo ""
    echo "Then run: yt"
    echo ""
    echo "For more information, visit: https://github.com/${REPO}"
}

main
