import { YouTrackSDK } from "@youtracktui/sdk";
import { createResource, createSignal, For, Show, createMemo } from "solid-js";
import { useKeyboard, useRenderer } from "@opentui/solid";
import type { ScrollBoxRenderable } from "@opentui/core";

function truncateText(text: string, maxWidth: number): string {
  if (text.length <= maxWidth) {
    return text;
  }
  return text.slice(0, maxWidth);
}

export function App() {
  const renderer = useRenderer();

  const youtrack = new YouTrackSDK({
    baseUrl: Bun.env.YOUTRACK_BASE_URL || "",
    token: Bun.env.YOUTRACK_PERM_TOKEN || "",
  });

  const [projects] = createResource(async () => {
    return youtrack.projects.list(["id", "name", "shortName"]);
  });

  const [issues] = createResource(async () => {
    return youtrack.issues.search("assignee: me #Unresolved Type: Task", {
      fields: ["summary", "idReadable", "project(name)", "description", "assignee(fullName)", "reporter(fullName)", "state(name)", "tags(name)", "customFields(name,value(presentation,id,name,$type))", "created", "updated"],
    });
  });

  const [focusedProjectIndex, setFocusedProjectIndex] = createSignal(0);
  const [focusedIssueIndex, setFocusedIssueIndex] = createSignal(0);
  const [selectedProjectId, setSelectedProjectId] = createSignal<string | null>(null);
  let projectScrollboxRef: ScrollBoxRenderable | undefined;
  let scrollboxRef: ScrollBoxRenderable | undefined;

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

    // Project navigation (when Tab is pressed, focus projects)
    if (evt.name === "Tab" && !evt.shift) {
      // Focus projects - handled by UI focus
      return;
    }

    // Project scroll navigation
    if (evt.name === "w") {
      const totalProjects = projects()?.length || 0;
      if (focusedProjectIndex() >= totalProjects - 1) return;

      const newIndex = focusedProjectIndex() + 1;
      setFocusedProjectIndex(newIndex);

      if (projectScrollboxRef) {
        const viewportHeight = projectScrollboxRef.viewport.height;
        const scrollTop = projectScrollboxRef.scrollTop;
        if (newIndex >= scrollTop + viewportHeight) {
          projectScrollboxRef.scrollTo({ y: newIndex - viewportHeight + 1, x: 0 });
        }
      }
    }

    if (evt.name === "s") {
      if (focusedProjectIndex() === 0) return;

      const newIndex = focusedProjectIndex() - 1;
      setFocusedProjectIndex(newIndex);

      if (projectScrollboxRef) {
        const scrollTop = projectScrollboxRef.scrollTop;
        if (newIndex < scrollTop) {
          projectScrollboxRef.scrollTo({ y: newIndex, x: 0 });
        }
      }
    }

    // Project selection
    if (evt.name === "Enter") {
      const project = projects()?.[focusedProjectIndex()];
      if (project) {
        setSelectedProjectId(project.id);
      }
    }

    // Issue navigation
    if (evt.name === "j") {
      const totalItems = issues()?.data?.length || 0;
      if (focusedIssueIndex() >= totalItems - 1) return;

      const newIndex = focusedIssueIndex() + 1;
      setFocusedIssueIndex(newIndex);

      if (scrollboxRef) {
        const viewportHeight = scrollboxRef.viewport.height;
        const scrollTop = scrollboxRef.scrollTop;
        if (newIndex >= scrollTop + viewportHeight) {
          scrollboxRef.scrollTo({ y: newIndex - viewportHeight + 1, x: 0 });
        }
      }
    }

    if (evt.name === "k") {
      if (focusedIssueIndex() === 0) return;

      const newIndex = focusedIssueIndex() - 1;
      setFocusedIssueIndex(newIndex);

      if (scrollboxRef) {
        const scrollTop = scrollboxRef.scrollTop;
        if (newIndex < scrollTop) {
          scrollboxRef.scrollTo({ y: newIndex, x: 0 });
        }
      }
    }
  });

  return (
    <box flexGrow={1} height="100%" flexDirection="row">
      <scrollbox 
        ref={projectScrollboxRef}
        borderStyle="single" 
        borderColor="gray" 
        padding={1} 
        height="100%" 
        width="15%" 
        title={projects.loading ? "Loading..." : `Projects (${projects()?.length || 0})`}
      >
        <Show when={projects()}>
          <For each={projects()}>
            {(project, index) => (
              <text 
                fg={index() === focusedProjectIndex() ? "white" : selectedProjectId() === project.id ? "yellow" : "gray"}
              >
                {truncateText(project.name || project.shortName || project.id || "", 20)}
              </text>
            )}
          </For>
        </Show>
      </scrollbox>
      <scrollbox 
        ref={scrollboxRef}
        borderStyle="single" 
        borderColor="gray" 
        padding={1} 
        height="100%" 
        width="25%" 
        title={issues.loading ? "Loading..." : `Issues (${issues()?.data?.length})`}
      >
        <Show when={issues()?.data}>
        <For each={issues()?.data}>
          {(issue, index) => <text fg={index() === focusedIssueIndex() ? "white" : "gray"}>{truncateText(issue.summary || "", 30)}</text>}
        </For>
        </Show>
      </scrollbox>
      <scrollbox borderStyle="single" borderColor="gray" padding={1} height="100%" width="60%" title="Selected Issue">
        <Show when={selectedIssue()}>
          <text>{selectedIssue()?.summary}</text>
          <text>{selectedIssue()?.description}</text>
          <text>{selectedIssue()?.project?.name}</text>
          <text>{selectedIssue()?.assignee?.fullName}</text>
          <text>{selectedIssue()?.reporter?.fullName}</text>
          <text>{selectedIssue()?.state?.name}</text>
          <text>{selectedIssue()?.tags?.map((tag) => tag.name).join(", ")}</text>
          <text>{selectedIssue()?.customFields?.map((field) => field.name).join(", ")}</text>
          <text>{selectedIssue()?.created}</text>
          <text>{selectedIssue()?.updated}</text>
        </Show>
      </scrollbox>
    </box>
  );
}


