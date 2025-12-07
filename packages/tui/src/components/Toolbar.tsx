import { For, createMemo, Show } from "solid-js";
import { keybindings } from "../Keybindings";
import { colors } from "../styles/colors";

interface KeybindingsToolbarProps {
  urlCopied?: boolean;
}

export function KeybindingsToolbar(props: KeybindingsToolbarProps) {
  const toolbarKeybindings = createMemo(() => 
    keybindings.filter(binding => binding.showInToolbar)
  );

  return (
    <box height={1} flexDirection="row">
      <Show when={props.urlCopied}>
        <text fg={colors.accentlight}>Issue info copied!  </text>
      </Show>
      <For each={toolbarKeybindings()}>
        {(binding, index) => (
          <>
            <text fg={colors.accent}>{binding.description}: </text>
            <text fg={colors.accent}>{binding.key}</text>
            {index() < toolbarKeybindings().length - 1 && <text fg={colors.accent}> | </text>}
          </>
        )}
      </For>
    </box>
  );
}
