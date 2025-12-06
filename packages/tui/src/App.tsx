import { createSignal, createMemo, createEffect, onMount, Show } from "solid-js";
import { box, text, useKeyboard, useRenderer } from "@opentui/solid";
import { YouTrackSDK } from "@youtracktui/sdk";
import { useNavigation } from "./primitives/useNavigation";
import { useProjects } from "./primitives/useProjects";
import { useIssues } from "./primitives/useIssues";
import { Sidebar } from "./components/Sidebar";
import { IssueList } from "./components/IssueList";
import { IssuePreview } from "./components/IssuePreview";
import { StatusBar } from "./components/StatusBar";

export function App() {
  const renderer = useRenderer();
  const [sdk, setSdk] = createSignal<YouTrackSDK | null>(null);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [searchMode, setSearchMode] = createSignal(false);
  const [showHelp, setShowHelp] = createSignal(false);

  // Initialize SDK
  onMount(() => {
    const baseUrl = Bun.env.YOUTRACK_BASE_URL;
    const token = Bun.env.YOUTRACK_PERM_TOKEN;

    if (!baseUrl || !token) {
      console.error("Missing YouTrack configuration in environment variables");
      return;
    }

    const client = new YouTrackSDK({
      baseUrl,
      token,
    });

    setSdk(client);
  });

  // Navigation and data
  const navigation = useNavigation(() => renderer.destroy());
  const projects = useProjects(sdk);

  // Selected project
  const selectedProject = createMemo(() => {
    const projectList = projects();
    if (!projectList || projectList.length === 0) return null;
    const index = Math.min(
      navigation.selectedProjectIndex(),
      projectList.length - 1
    );
    return projectList[index];
  });

  const selectedProjectId = createMemo(() => selectedProject()?.shortName || null);

  // Issues for selected project
  const { issues } = useIssues(sdk, selectedProjectId, searchQuery);

  // Selected issue
  const selectedIssue = createMemo(() => {
    const issueList = issues();
    if (!issueList || issueList.length === 0) return null;
    const index = Math.min(
      navigation.selectedIssueIndex(),
      issueList.length - 1
    );
    return issueList[index];
  });

  // Clamp indices when data changes
  createEffect(() => {
    const projectList = projects();
    if (projectList) {
      navigation.clampProjectIndex(projectList.length - 1);
    }
  });

  createEffect(() => {
    const issueList = issues();
    if (issueList) {
      navigation.clampIssueIndex(issueList.length - 1);
    }
  });

  // Keyboard handling
  useKeyboard((key) => {
    const keyName = key.name;
    const sequence = key.sequence;

    // Help overlay toggle
    if (sequence === "?" || (keyName === "?" && key.shift)) {
      setShowHelp(!showHelp());
      return;
    }

    // Close help overlay
    if (showHelp()) {
      setShowHelp(false);
      return;
    }

    // Search mode
    if (sequence === "/" && !searchMode()) {
      setSearchMode(true);
      setSearchQuery("");
      return;
    }

    if (searchMode()) {
      if (keyName === "return" || keyName === "enter") {
        setSearchMode(false);
        return;
      }
      if (keyName === "escape") {
        setSearchMode(false);
        setSearchQuery("");
        return;
      }
      if (keyName === "backspace" || keyName === "delete") {
        setSearchQuery((q) => q.slice(0, -1));
        return;
      }
      // Add printable characters to search query
      if (sequence && sequence.length === 1 && !key.ctrl && !key.meta) {
        setSearchQuery((q) => q + sequence);
        return;
      }
      return;
    }

    // Handle quit (q or Esc)
    if ((sequence === "q" && !key.ctrl) || keyName === "escape") {
      renderer.destroy();
      return;
    }

    // Handle Tab navigation
    if (keyName === "tab") {
      const modifiers = { shift: key.shift, ctrl: key.ctrl };
      navigation.handleKeyPress("Tab", modifiers);
      return;
    }

    // Handle vim navigation and arrow keys
    const navKey = keyName === "up" ? "k" : 
                   keyName === "down" ? "j" : 
                   sequence;
    
    if (navKey) {
      navigation.handleKeyPress(navKey, {
        shift: key.shift,
        ctrl: key.ctrl,
      });
    }
  });

  return (
    <box flexDirection="column" width="100%" height="100%">
      {/* Help overlay */}
      <Show when={showHelp()}>
        <box
          position="absolute"
          left={0}
          top={0}
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
        >
          <box
            borderStyle="double"
            borderColor="cyan"
            padding={2}
            flexDirection="column"
            backgroundColor="black"
            width="60%"
          >
            <text bold color="cyan" marginBottom={1}>
              Keyboard Shortcuts
            </text>
            <text>
              <text bold>Tab</text> / <text bold>Shift+Tab</text> - Switch
              between panels
            </text>
            <text>
              <text bold>j</text> / <text bold>k</text> or{" "}
              <text bold>↓</text> / <text bold>↑</text> - Navigate up/down
            </text>
            <text>
              <text bold>g</text> - Go to top
            </text>
            <text>
              <text bold>G</text> - Go to bottom
            </text>
            <text>
              <text bold>/</text> - Search/filter issues
            </text>
            <text>
              <text bold>?</text> - Toggle this help
            </text>
            <text>
              <text bold>q</text> or <text bold>Esc</text> - Quit
            </text>
            <text marginTop={1} color="gray">
              Press any key to close
            </text>
          </box>
        </box>
      </Show>

      {/* Main content */}
      <Show when={!showHelp()}>
        <box flexDirection="row" flexGrow={1}>
          {/* Sidebar */}
          <Sidebar
            projects={projects() || []}
            selectedIndex={navigation.selectedProjectIndex()}
            activePanel={navigation.activePanel()}
          />

          {/* Main content area */}
          <box flexDirection="column" flexGrow={1}>
            {/* Issue list */}
            <box flexGrow={1}>
              <IssueList
                issues={issues() || []}
                selectedIndex={navigation.selectedIssueIndex()}
                activePanel={navigation.activePanel()}
                searchQuery={searchQuery()}
                onSearchChange={setSearchQuery}
              />
            </box>

            {/* Issue preview */}
            <IssuePreview
              issue={selectedIssue()}
              activePanel={navigation.activePanel()}
            />
          </box>
        </box>

        {/* Status bar */}
        <StatusBar
          activePanel={navigation.activePanel()}
          projectName={selectedProject()?.name || null}
          issueCount={issues()?.length || 0}
          selectedIssueId={selectedIssue()?.idReadable || null}
        />

        {/* Search mode indicator */}
        <Show when={searchMode()}>
          <box
            position="absolute"
            bottom={3}
            left={0}
            width="100%"
            borderStyle="single"
            borderColor="yellow"
            paddingX={1}
            backgroundColor="black"
          >
            <text color="yellow">/ {searchQuery()}_</text>
          </box>
        </Show>
      </Show>
    </box>
  );
}


