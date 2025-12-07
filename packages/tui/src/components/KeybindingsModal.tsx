import { For, Show, createSignal, createMemo, createEffect } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import type { ScrollBoxRenderable } from "@opentui/core";
import { keybindings } from "../Keybindings";
import { colors } from "../styles/colors";

interface KeybindingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function KeybindingsModal(props: KeybindingsModalProps) {
  const [focusedIndex, setFocusedIndex] = createSignal(0);
  let scrollboxRef: ScrollBoxRenderable | undefined;

  const visibleRange = createMemo(() => {
    const total = keybindings.length;
    const focused = focusedIndex();
    return { current: focused + 1, total };
  });

  createEffect(() => {
    if (props.open) {
      setFocusedIndex(0);
      if (scrollboxRef) {
        scrollboxRef.scrollTo({ y: 0, x: 0 });
      }
    }
  });

  createEffect(() => {
    if (!props.open || !scrollboxRef) return;
    
    const index = focusedIndex();
    const viewportHeight = scrollboxRef.viewport.height;
    const scrollTop = scrollboxRef.scrollTop;
    
    if (index < scrollTop) {
      scrollboxRef.scrollTo({ y: index, x: 0 });
    } else if (index >= scrollTop + viewportHeight) {
      scrollboxRef.scrollTo({ y: index - viewportHeight + 1, x: 0 });
    }
  });

  useKeyboard((evt) => {
    if (!props.open) return;

    if (evt.name === "j" || evt.name === "arrowdown") {
      const newIndex = Math.min(focusedIndex() + 1, keybindings.length - 1);
      setFocusedIndex(newIndex);
      return;
    }

    if (evt.name === "k" || evt.name === "arrowup") {
      const newIndex = Math.max(focusedIndex() - 1, 0);
      setFocusedIndex(newIndex);
      return;
    }
  });

  return (
    <Show when={props.open}>
      <box
        position="absolute"
        top="10%"
        left="25%"
        width="50%"
        height="80%"
        zIndex={100}
        borderStyle="single"
        borderColor="white"
        flexDirection="column"
        backgroundColor={colors.modalBackground}
        title="Keybindings"
      >
        <scrollbox 
          ref={(ref) => { scrollboxRef = ref; }}
          flexGrow={1} 
          padding={1}
          verticalScrollbarOptions={{
            trackOptions: {
              foregroundColor: "white",
            },
          }}
        >
          <For each={keybindings}>
            {(binding, index) => (
              <box 
                flexDirection="row" 
                backgroundColor={index() === focusedIndex() ? colors.accent : colors.modalBackground}
              >
                <text fg={index() === focusedIndex() ? "white" : colors.accent} width={12}>{binding.key}</text>
                <text>{binding.description}</text>
              </box>
            )}
          </For>
        </scrollbox>
        <box flexDirection="row" justifyContent="flex-end" paddingTop={1}>
          <text fg="gray">
            {visibleRange().current} of {visibleRange().total}
          </text>
        </box>
      </box>
    </Show>
  );
}
