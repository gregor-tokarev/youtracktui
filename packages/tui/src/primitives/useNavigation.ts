import { createSignal, createEffect } from "solid-js";

export type Panel = "sidebar" | "list" | "preview";

export function useNavigation(onEscape?: () => void) {
  const [activePanel, setActivePanel] = createSignal<Panel>("list");
  const [selectedProjectIndex, setSelectedProjectIndex] = createSignal(0);
  const [selectedIssueIndex, setSelectedIssueIndex] = createSignal(0);

  // Handle keyboard navigation
  const handleKeyPress = (key: string, modifiers?: { ctrl?: boolean; shift?: boolean }) => {
    const panel = activePanel();

    // Global shortcuts
    if (key === "Tab") {
      if (modifiers?.shift) {
        // Previous panel
        setActivePanel(
          panel === "list" ? "sidebar" : panel === "preview" ? "list" : "preview"
        );
      } else {
        // Next panel
        setActivePanel(
          panel === "sidebar" ? "list" : panel === "list" ? "preview" : "sidebar"
        );
      }
      return true;
    }

    if (key === "Escape" || key === "q") {
      onEscape?.();
      return true;
    }

    // Panel-specific navigation
    if (panel === "sidebar") {
      return handleSidebarNav(key);
    } else if (panel === "list") {
      return handleListNav(key);
    } else if (panel === "preview") {
      return handlePreviewNav(key);
    }

    return false;
  };

  const handleSidebarNav = (key: string) => {
    if (key === "j" || key === "Down") {
      setSelectedProjectIndex((i) => i + 1);
      return true;
    }
    if (key === "k" || key === "Up") {
      setSelectedProjectIndex((i) => Math.max(0, i - 1));
      return true;
    }
    if (key === "g") {
      setSelectedProjectIndex(0);
      return true;
    }
    return false;
  };

  const handleListNav = (key: string) => {
    if (key === "j" || key === "Down") {
      setSelectedIssueIndex((i) => i + 1);
      return true;
    }
    if (key === "k" || key === "Up") {
      setSelectedIssueIndex((i) => Math.max(0, i - 1));
      return true;
    }
    if (key === "g") {
      setSelectedIssueIndex(0);
      return true;
    }
    if (key === "G") {
      setSelectedIssueIndex(Number.MAX_SAFE_INTEGER); // Will be clamped by component
      return true;
    }
    return false;
  };

  const handlePreviewNav = (key: string) => {
    // Preview panel can scroll but doesn't have discrete items
    return false;
  };

  const clampProjectIndex = (maxIndex: number) => {
    setSelectedProjectIndex((i) => Math.min(i, Math.max(0, maxIndex)));
  };

  const clampIssueIndex = (maxIndex: number) => {
    setSelectedIssueIndex((i) => Math.min(i, Math.max(0, maxIndex)));
  };

  return {
    activePanel,
    setActivePanel,
    selectedProjectIndex,
    setSelectedProjectIndex,
    selectedIssueIndex,
    setSelectedIssueIndex,
    handleKeyPress,
    clampProjectIndex,
    clampIssueIndex,
  };
}

