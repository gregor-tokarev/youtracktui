import { Show } from "solid-js";
import { box, text } from "@opentui/solid";
import type { Panel } from "../primitives/useNavigation";

interface StatusBarProps {
  activePanel: Panel;
  projectName: string | null;
  issueCount: number;
  selectedIssueId: string | null;
}

export function StatusBar(props: StatusBarProps) {
  const panelName = () => {
    switch (props.activePanel) {
      case "sidebar":
        return "Projects";
      case "list":
        return "Issues";
      case "preview":
        return "Preview";
      default:
        return "";
    }
  };

  return (
    <box
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
      height={3}
      flexDirection="row"
      justifyContent="space-between"
    >
      <box>
        <text bold color="cyan">
          {panelName()}
        </text>
        <Show when={props.projectName}>
          <text color="gray"> | </text>
          <text>{props.projectName}</text>
        </Show>
        <Show when={props.issueCount > 0}>
          <text color="gray"> | </text>
          <text>
            {props.issueCount} issue{props.issueCount !== 1 ? "s" : ""}
          </text>
        </Show>
        <Show when={props.selectedIssueId}>
          <text color="gray"> | </text>
          <text color="yellow">{props.selectedIssueId}</text>
        </Show>
      </box>

      <box>
        <text color="gray">
          Tab: switch panel | j/k: navigate | /: search | ?: help | q: quit
        </text>
      </box>
    </box>
  );
}


