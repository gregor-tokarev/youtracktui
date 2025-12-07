import { YouTrackSDK } from "@youtracktui/sdk";
import { createResource, createSignal, Show, createMemo } from "solid-js";
import { useKeyboard, useRenderer } from "@opentui/solid";
import { IssuesList } from "./components/IssuesList";
import { KeybindingsToolbar } from "./components/Toolbar";
import { KeybindingsModal } from "./components/KeybindingsModal";
import { StateModal } from "./components/StateModal";

export function App() {
  const renderer = useRenderer();

  const youtrack = new YouTrackSDK({
    baseUrl: Bun.env.YOUTRACK_BASE_URL || "",
    token: Bun.env.YOUTRACK_PERM_TOKEN || "",
  });

  const [issuesRefreshTrigger, setIssuesRefreshTrigger] = createSignal(0);

  const [issues] = createResource(issuesRefreshTrigger, async () => {
    return youtrack.issues.search("assignee: me #Unresolved Type: Task", {
      fields: [
        "id",
        "summary",
        "idReadable",
        "project(id,name)",
        "description",
        "reporter(login)",
        "state(id,name,resolved)",
        "tags(name)",
        "customFields(id,name,value(presentation,id,name,$type))",
        "created",
        "updated",
      ],
    });
  });

  const [focusedIssueIndex, setFocusedIssueIndex] = createSignal(0);
  const [keybindingsModalOpen, setKeybindingsModalOpen] = createSignal(false);
  const [stateModalOpen, setStateModalOpen] = createSignal(false);
  const [urlCopiedMessage, setUrlCopiedMessage] = createSignal(false);

  const selectedIssue = createMemo(() => {
    const data = issues()?.data;
    const idx = focusedIssueIndex();
    return data?.[idx];
  });

  const issueState = createMemo(() => {
    const issue = selectedIssue();
    if (!issue) return null;
    
    if (issue.state?.name) {
      return issue.state.name;
    }
    
    const stateField = issue.customFields?.find(
      cf => cf.name === "State" || cf.name === "Status"
    );
    
    if (stateField?.value) {
      const value = Array.isArray(stateField.value) 
        ? stateField.value[0] 
        : stateField.value;
      if (value && (value.name || value.presentation)) {
        return value.name || value.presentation;
      }
    }
    
    return null;
  });

  useKeyboard((evt) => {
    if (evt.name === "q") {
      renderer.destroy();
      process.exit(0);
    }

    if ((evt.shift && evt.name === "/") || evt.name === "?") {
      setKeybindingsModalOpen(!keybindingsModalOpen());
      return;
    }

    if (evt.name === "escape") {
      if (keybindingsModalOpen()) {
        setKeybindingsModalOpen(false);
        return;
      }
      if (stateModalOpen()) {
        setStateModalOpen(false);
        return;
      }
    }

    if (evt.name === "s" && !keybindingsModalOpen() && !stateModalOpen() && selectedIssue()) {
      setStateModalOpen(true);
      return;
    }

    if (evt.name === "`") {
      renderer.console.toggle();
      return;
    }
  });

  return (
    <box flexGrow={1} height="100%" flexDirection="column">
      <box flexGrow={1} flexDirection="row">
        <IssuesList 
          issues={issues}
          onFocusedIndexChange={setFocusedIssueIndex}
          modalOpen={keybindingsModalOpen() || stateModalOpen()}
          onUrlCopied={() => {
            setUrlCopiedMessage(true);
            setTimeout(() => setUrlCopiedMessage(false), 1500);
          }}
        />
        <scrollbox borderStyle="single" borderColor="gray" padding={1} height="100%" width="65%" title={`Selected Issue: ${selectedIssue()?.summary}`}>
          <Show when={selectedIssue()}>
            <text>{selectedIssue()?.description}</text>
          </Show>
        </scrollbox>
        <box width="15%" borderStyle="single" borderColor="gray" padding={1}>
          <Show when={selectedIssue()}>
            <text>Reporter:</text>
            <text>@{selectedIssue()?.reporter?.login}</text>
            <text></text>
            <Show when={issueState()}>
              <text>State: </text>
              <text>{issueState()}</text>
            </Show>
          </Show>
        </box>
      </box>
      <KeybindingsToolbar urlCopied={urlCopiedMessage()} />
      <KeybindingsModal open={keybindingsModalOpen()} onClose={() => setKeybindingsModalOpen(false)} />
      <StateModal 
        open={stateModalOpen()} 
        onClose={() => setStateModalOpen(false)}
        issue={selectedIssue()}
        youtrack={youtrack}
        onStateChanged={() => {
          setIssuesRefreshTrigger((prev) => prev + 1);
        }}
      />
    </box>
  );
}


