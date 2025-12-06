import { For, Show, createMemo } from "solid-js";
import type { Issue } from "@youtracktui/sdk/src/types";
import type { Panel } from "../primitives/useNavigation";

interface IssueListProps {
  issues: Issue[];
  selectedIndex: number;
  activePanel: Panel;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function IssueList(props: IssueListProps) {
  const selectedIssue = createMemo(() => props.issues[props.selectedIndex]);

  return (
    <box
      flexDirection="column"
      borderStyle="single"
      borderColor={props.activePanel === "list" ? "cyan" : "gray"}
      flexGrow={1}
      height="100%"
    >
      {/* Header */}
      <box borderStyle="single" borderColor="gray" padding={1}>
        <text bold color="cyan">
          Issues ({props.issues.length})
        </text>
      </box>

      {/* Search bar */}
      <Show when={props.searchQuery !== ""}>
        <box borderStyle="single" borderColor="yellow" padding={1}>
          <text color="yellow">/ {props.searchQuery}</text>
        </box>
      </Show>

      {/* Column headers */}
      <box padding={1} borderBottom borderColor="gray">
        <text bold color="gray">
          ID        Summary                                   State      Assignee
        </text>
      </box>

      {/* Issue list */}
      <box flexDirection="column" flexGrow={1} paddingX={1} paddingY={0}>
        <Show
          when={props.issues.length > 0}
          fallback={
            <text color="gray" italic>
              {selectedIssue() ? "Loading issues..." : "No issues found"}
            </text>
          }
        >
          <For each={props.issues}>
            {(issue, index) => {
              const isSelected = () => index() === props.selectedIndex;
              const summary = () => {
                const s = issue.summary || "(No summary)";
                return s.length > 40 ? s.substring(0, 37) + "..." : s.padEnd(40);
              };
              const state = () => {
                const s = issue.state?.name || "Unknown";
                return s.length > 10 ? s.substring(0, 7) + "..." : s.padEnd(10);
              };
              const assignee = () => {
                const a = issue.assignee?.fullName || "Unassigned";
                return a.length > 15 ? a.substring(0, 12) + "..." : a;
              };

              return (
                <box>
                  <text
                    color={isSelected() ? "black" : "white"}
                    backgroundColor={isSelected() ? "cyan" : undefined}
                    bold={isSelected()}
                  >
                    {isSelected() ? "► " : "  "}
                    {(issue.idReadable || issue.id).padEnd(8)} {summary()}{" "}
                    {state()} {assignee()}
                  </text>
                </box>
              );
            }}
          </For>
        </Show>
      </box>
    </box>
  );
}


