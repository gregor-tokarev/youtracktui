import { createSignal, For, Show, onCleanup, type Resource } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import type { ScrollBoxRenderable } from "@opentui/core";

function truncateText(text: string, maxWidth: number): string {
  if (text.length <= maxWidth) {
    return text;
  }
  return text.slice(0, maxWidth);
}

interface IssuesListProps {
  issues: Resource<any>;
  onFocusedIndexChange?: (index: number) => void;
}

export function IssuesList(props: IssuesListProps) {
  const [focusedIssueIndex, setFocusedIssueIndex] = createSignal(0);
  let scrollboxRef: ScrollBoxRenderable | undefined;

  const setScrollboxRef = (ref: ScrollBoxRenderable | undefined) => {
    scrollboxRef = ref;
  };

  const spinnerFrames = ["/", "|", "\\", "—"];
  const [spinnerIndex, setSpinnerIndex] = createSignal(0);
  
  const spinnerInterval = setInterval(() => {
    setSpinnerIndex((prev) => (prev + 1) % spinnerFrames.length);
  }, 100);
  
  onCleanup(() => clearInterval(spinnerInterval));

  useKeyboard((evt) => {
    if (evt.name === "j") {
      const totalItems = props.issues()?.data?.length || 0;
      if (focusedIssueIndex() >= totalItems - 1) return;

      const newIndex = focusedIssueIndex() + 1;
      setFocusedIssueIndex(newIndex);
      props.onFocusedIndexChange?.(newIndex);

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
      props.onFocusedIndexChange?.(newIndex);

      if (scrollboxRef) {
        const scrollTop = scrollboxRef.scrollTop;
        if (newIndex < scrollTop) {
          scrollboxRef.scrollTo({ y: newIndex, x: 0 });
        }
      }
    }
  });

  return (
    <scrollbox 
      ref={setScrollboxRef}
      borderStyle="single" 
      borderColor="gray" 
      padding={1} 
      height="100%" 
      width="20%" 
      title={props.issues.loading ? `${spinnerFrames[spinnerIndex()]} Loading` : `[1] Issues (${props.issues()?.data?.length})`}
    >
      <Show when={props.issues()?.data}>
        <For each={props.issues()?.data}>
          {(issue, index) => (
            <text fg={index() === focusedIssueIndex() ? "white" : "gray"}>
              {truncateText(issue.summary || "", 30)}
            </text>
          )}
        </For>
      </Show>
    </scrollbox>
  );
}
