import { YouTrackSDK } from "@youtracktui/sdk";
import { createResource, createSignal, Show, createMemo } from "solid-js";
import { useKeyboard, useRenderer } from "@opentui/solid";
import { IssuesList } from "./components/IssuesList";

export function App() {
  const renderer = useRenderer();

  const youtrack = new YouTrackSDK({
    baseUrl: Bun.env.YOUTRACK_BASE_URL || "",
    token: Bun.env.YOUTRACK_PERM_TOKEN || "",
  });

  const [issues] = createResource(async () => {
    return youtrack.issues.search("assignee: me #Unresolved Type: Task", {
      fields: [
        "summary",
        "idReadable",
        "project(name)",
        "description",
        "reporter(login)",
        "state(name)",
        "tags(name)",
        "customFields(name,value(presentation,id,name,$type))",
        "created",
        "updated",
      ],
    });
  });

  const [focusedIssueIndex, setFocusedIssueIndex] = createSignal(0);

  const selectedIssue = createMemo(() => {
    const data = issues()?.data;
    const idx = focusedIssueIndex();

    return data?.[idx];
  });

  useKeyboard((evt) => {
    if (evt.name === "q") {
      renderer.destroy();
      process.exit(0);
    }

    if (evt.name === "`") {
      renderer.console.toggle();
      return;
    }
  });

  return (
    <box flexGrow={1} height="100%" flexDirection="row">
      <IssuesList 
        issues={issues}
        onFocusedIndexChange={setFocusedIssueIndex}
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
        </Show>
      </box>
    </box>
  );
}


