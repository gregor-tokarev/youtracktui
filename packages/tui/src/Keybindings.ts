export interface Keybinding {
  key: string;
  description: string;
  showInToolbar: boolean;
}

export const keybindings: Keybinding[] = [
  { key: "j/k", description: "Navigate", showInToolbar: true },
  { key: "/", description: "Search", showInToolbar: true },
  { key: "esc", description: "Close search", showInToolbar: false },
  { key: "y", description: "Copy full URL", showInToolbar: false },
  { key: "^y", description: "Copy branch prefix", showInToolbar: false },
  { key: "o", description: "Open in browser", showInToolbar: true },
  { key: "`", description: "Console", showInToolbar: false },
  { key: "q", description: "Quit", showInToolbar: true },
  { key: "?", description: "Help", showInToolbar: true }
];
