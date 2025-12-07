import { For, createMemo, Show } from "solid-js";
import type { Accessor } from "solid-js";
import { keybindings } from "../Keybindings";
import { colors } from "../styles/colors";
import type { InputRenderable } from "@opentui/core";

interface KeybindingsToolbarProps {
  urlCopied?: boolean;
  searchQuery: Accessor<string>;
  onSearchQueryChange: (query: string) => void;
  searchOpen: Accessor<boolean>;
  onSearchSubmit: () => void;
  searchInputRef: (ref: InputRenderable | undefined) => void;
}

export function KeybindingsToolbar(props: KeybindingsToolbarProps) {
  const toolbarKeybindings = createMemo(() => 
    keybindings.filter(binding => binding.showInToolbar)
  );

  return (
    <box flexDirection="column">
      <Show when={props.searchOpen()}>
        <box height={3} borderStyle="single" borderColor="gray">
          <input 
            ref={props.searchInputRef} 
            placeholder="Search issues" 
            focusedTextColor="gray" 
            backgroundColor="transparent" 
            focusedBackgroundColor="transparent"
            value={props.searchQuery()}
            onInput={props.onSearchQueryChange}
            onSubmit={props.onSearchSubmit}
          />
        </box>
      </Show>
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
    </box>
  );
}
