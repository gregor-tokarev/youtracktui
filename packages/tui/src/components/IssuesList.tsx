import { createSignal, For, Show, onCleanup, createMemo, type Resource } from "solid-js";
import { useKeyboard  } from "@opentui/solid";
import type { ScrollBoxRenderable, InputRenderable } from "@opentui/core";
import { copyToClipboard } from "../utils/clipboard";
import { truncateText } from "../utils/text";

interface IssuesListProps {
  issues: Resource<any>;
  onFocusedIndexChange?: (index: number) => void;
}

export function IssuesList(props: IssuesListProps) {
  const [focusedIssueIndex, setFocusedIssueIndex] = createSignal(0);
  const [searchQuery, setSearchQuery] = createSignal("");
  let scrollboxRef: ScrollBoxRenderable | undefined;
  let searchInputRef: InputRenderable | undefined;

  const setScrollboxRef = (ref: ScrollBoxRenderable | undefined) => {
    scrollboxRef = ref;
  };

  const spinnerFrames = ["/", "|", "\\", "—"];
  const [spinnerIndex, setSpinnerIndex] = createSignal(0);
  
  const spinnerInterval = setInterval(() => {
    setSpinnerIndex((prev) => (prev + 1) % spinnerFrames.length);
  }, 100);
  
  onCleanup(() => clearInterval(spinnerInterval));

  const [searchOpen, setSearchOpen] = createSignal(false);

  const filteredIssues = createMemo(() => {
    const issues = props.issues()?.data || [];
    const query = searchQuery().toLowerCase().trim();
    
    if (!query) {
      return issues;
    }
    
    return issues.filter((issue: any) => {
      const summary = (issue.summary || "").toLowerCase();
      const idReadable = (issue.idReadable || "").toLowerCase();
      
      return summary.includes(query) || idReadable.includes(query);
    });
  });

  const handleSearchSubmit = () => {
    setSearchOpen(false);
    setFocusedIssueIndex(0);
    
    if (searchInputRef) {
      searchInputRef.blur();
    }
  };

  useKeyboard((evt) => {
    if (evt.name === "j") {
      if (searchOpen()) return;

      const totalItems = filteredIssues().length;
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
      if (focusedIssueIndex() === 0 || searchOpen()) return;

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

    if (evt.ctrl && evt.name === "y") {
      const issues = filteredIssues();
      if (issues.length > 0 && focusedIssueIndex() < issues.length) {
        const url = `${Bun.env.YOUTRACK_BASE_URL}/issue/${issues[focusedIssueIndex()].idReadable}`;
        copyToClipboard(url);
      }
    }

    if (evt.name === "o") {
      const issues = filteredIssues();
      if (issues.length > 0 && focusedIssueIndex() < issues.length) {
        const url = `${Bun.env.YOUTRACK_BASE_URL}/issue/${issues[focusedIssueIndex()].idReadable}`;
        Bun.spawn(["open", url]);
      }
    }

    if (evt.name === "y") {
      if (searchOpen()) return;
      
      const issues = filteredIssues();
      if (issues.length > 0 && focusedIssueIndex() < issues.length) {
        const issue = issues[focusedIssueIndex()];
        const slackLink = `${issue.idReadable}_`;

        copyToClipboard(slackLink);
      }
    }


    if (evt.name === "/") {
      setSearchOpen(!searchOpen());

      if (searchInputRef) {
        setTimeout(() => {
          searchInputRef.focus();
        }, 0);
      }
    }

    if (evt.name === "escape") {
      if (searchOpen()) {
        setSearchOpen(false);
        setSearchQuery("");
        setFocusedIssueIndex(0);

        if (searchInputRef) searchInputRef.blur();
      }
    }
  });

  return ( 
  <box flexDirection="column" width="20%">
    <Show when={searchOpen()}>
      <box height={3} borderStyle="single" borderColor="gray">
        <input 
          ref={searchInputRef} 
          placeholder="Search issues" 
          focusedTextColor="gray" 
          backgroundColor="transparent" 
          focusedBackgroundColor="transparent"
          value={searchQuery()}
          onInput={setSearchQuery}
          onSubmit={handleSearchSubmit}
        />
      </box>
    </Show>
    <scrollbox 
      ref={setScrollboxRef}
      borderStyle="single" 
      borderColor="gray" 
      flexGrow={1}
      padding={1} 
      height={searchOpen() ? "80%" : "100%"} 
      title={props.issues.loading ? `${spinnerFrames[spinnerIndex()]} Loading` : `[1] Issues (${filteredIssues().length}/${props.issues()?.data?.length || 0})`}
    >
      <Show when={props.issues()?.data}>
        <For each={filteredIssues()}>
          {(issue, index) => (
            <text fg={index() === focusedIssueIndex() ? "white" : "gray"}>
              {truncateText(issue.summary || "", 30)}
            </text>
          )}
        </For>
      </Show>
    </scrollbox>
  </box>
  );
}
