import { For, Show } from "solid-js";
import { box, text } from "@opentui/solid";
import type { Project } from "@youtracktui/sdk/src/types";
import type { Panel } from "../primitives/useNavigation";

interface SidebarProps {
  projects: Project[];
  selectedIndex: number;
  activePanel: Panel;
}

export function Sidebar(props: SidebarProps) {
  return (
    <box
      flexDirection="column"
      borderStyle="single"
      borderColor={props.activePanel === "sidebar" ? "cyan" : "gray"}
      width="25%"
      height="100%"
    >
      <box borderStyle="single" borderColor="gray" paddingX={1}>
        <text bold color="cyan">
          Projects
        </text>
      </box>

      <box flexDirection="column" flexGrow={1} paddingX={1} paddingY={0}>
        <Show
          when={props.projects.length > 0}
          fallback={
            <text color="gray" italic>
              Loading projects...
            </text>
          }
        >
          <For each={props.projects}>
            {(project, index) => {
              const isSelected = () => index() === props.selectedIndex;
              return (
                <box>
                  <text
                    color={isSelected() ? "black" : "white"}
                    backgroundColor={isSelected() ? "cyan" : undefined}
                    bold={isSelected()}
                  >
                    {isSelected() ? "► " : "  "}
                    {project.shortName || project.name || project.id}
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


