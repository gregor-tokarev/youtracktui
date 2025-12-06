import { Show } from "solid-js";
import { box, text } from "@opentui/solid";
import type { Issue } from "@youtracktui/sdk/src/types";
import type { Panel } from "../primitives/useNavigation";

interface IssuePreviewProps {
  issue: Issue | null;
  activePanel: Panel;
}

export function IssuePreview(props: IssuePreviewProps) {
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <box
      flexDirection="column"
      borderStyle="single"
      borderColor={props.activePanel === "preview" ? "cyan" : "gray"}
      height="40%"
    >
      <box borderStyle="single" borderColor="gray" paddingX={1}>
        <text bold color="cyan">
          Preview
        </text>
      </box>

      <Show
        when={props.issue}
        fallback={
          <box paddingX={1} paddingY={1}>
            <text color="gray" italic>
              Select an issue to view details
            </text>
          </box>
        }
      >
        {(issue) => (
          <box flexDirection="column" paddingX={1} paddingY={1} flexGrow={1}>
            {/* Issue ID and Summary */}
            <box marginBottom={1}>
              <text bold color="cyan">
                {issue().idReadable || issue().id}
              </text>
              <text> - </text>
              <text bold>{issue().summary || "(No summary)"}</text>
            </box>

            {/* Metadata */}
            <box flexDirection="column" marginBottom={1}>
              <box>
                <text color="gray">State: </text>
                <text color={issue().state?.resolved ? "green" : "yellow"}>
                  {issue().state?.name || "Unknown"}
                </text>
              </box>
              <box>
                <text color="gray">Assignee: </text>
                <text>{issue().assignee?.fullName || "Unassigned"}</text>
              </box>
              <box>
                <text color="gray">Reporter: </text>
                <text>{issue().reporter?.fullName || "Unknown"}</text>
              </box>
              <box>
                <text color="gray">Created: </text>
                <text>{formatDate(issue().created)}</text>
              </box>
              <box>
                <text color="gray">Updated: </text>
                <text>{formatDate(issue().updated)}</text>
              </box>
            </box>

            {/* Description */}
            <Show when={issue().description}>
              <box flexDirection="column" marginBottom={1}>
                <text bold color="gray">
                  Description:
                </text>
                <text wrap="wrap">{issue().description}</text>
              </box>
            </Show>

            {/* Tags */}
            <Show when={issue().tags && issue().tags!.length > 0}>
              <box>
                <text color="gray">Tags: </text>
                <text>
                  {issue()
                    .tags!.map((tag) => tag.name)
                    .join(", ")}
                </text>
              </box>
            </Show>
          </box>
        )}
      </Show>
    </box>
  );
}


