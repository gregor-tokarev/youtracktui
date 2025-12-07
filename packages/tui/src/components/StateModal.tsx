import { For, Show, createSignal, createMemo, createEffect, createResource } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import type { ScrollBoxRenderable } from "@opentui/core";
import type { Issue } from "@youtracktui/sdk";
import type { YouTrackSDK } from "@youtracktui/sdk";
import { colors } from "../styles/colors";

interface StateModalProps {
  open: boolean;
  onClose: () => void;
  issue: Issue | undefined;
  youtrack: YouTrackSDK;
  onStateChanged: () => void;
}

export function StateModal(props: StateModalProps) {
  const [focusedIndex, setFocusedIndex] = createSignal(0);
  let scrollboxRef: ScrollBoxRenderable | undefined;

  const [states] = createResource(
    () => props.issue?.project?.id,
    async (projectId) => {
      if (!projectId) return [];
      return props.youtrack.projects.getStateBundle(projectId);
    }
  );

  const currentStateId = createMemo(() => {
    const issue = props.issue;
    if (!issue) return null;
    
    if (issue.state?.id) {
      return issue.state.id;
    }
    
    const stateField = issue.customFields?.find(
      cf => cf.name === "State" || cf.name === "Status"
    );
    
    if (stateField?.value) {
      const value = Array.isArray(stateField.value) 
        ? stateField.value[0] 
        : stateField.value;
      if (value?.id) {
        return value.id;
      }
    }
    
    return null;
  });

  const visibleRange = createMemo(() => {
    const total = states()?.length || 0;
    const focused = focusedIndex();
    return { current: focused + 1, total };
  });

  createEffect(() => {
    const statesList = states();
    if (props.open && statesList && statesList.length > 0) {
      const currentId = currentStateId();
      if (currentId) {
        const currentIndex = statesList.findIndex(s => s.id === currentId);
        if (currentIndex >= 0) {
          setFocusedIndex(currentIndex);
          if (scrollboxRef) {
            scrollboxRef.scrollTo({ y: currentIndex, x: 0 });
          }
        } else {
          setFocusedIndex(0);
          if (scrollboxRef) {
            scrollboxRef.scrollTo({ y: 0, x: 0 });
          }
        }
      } else {
        setFocusedIndex(0);
        if (scrollboxRef) {
          scrollboxRef.scrollTo({ y: 0, x: 0 });
        }
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

  const stateFieldId = createMemo(() => {
    const issue = props.issue;
    if (!issue) return null;
    
    const stateField = issue.customFields?.find(
      cf => cf.name === "State" || cf.name === "Status"
    );
    
    return stateField?.id || null;
  });

  const changeState = async (stateId: string) => {
    const issue = props.issue;
    if (!issue?.id) return;

    const fieldIdentifier = stateFieldId() || "State";
    const updateValue = { value: { id: stateId } };

    try {
      await props.youtrack.issues.updateCustomField(
        issue.id,
        fieldIdentifier,
        updateValue
      );
      props.onStateChanged();
      props.onClose();
    } catch (error) {
      console.error("Failed to update issue state:", error);
    }
  };

  useKeyboard((evt) => {
    if (!props.open) return;

    if (evt.name === "escape") {
      props.onClose();
      return;
    }

    const statesList = states();
    if (!statesList || statesList.length === 0) return;

    if (evt.name === "j" || evt.name === "arrowdown") {
      const newIndex = Math.min(focusedIndex() + 1, statesList.length - 1);
      setFocusedIndex(newIndex);
      return;
    }

    if (evt.name === "k" || evt.name === "arrowup") {
      const newIndex = Math.max(focusedIndex() - 1, 0);
      setFocusedIndex(newIndex);
      return;
    }

    if (evt.name === "enter" || evt.name === "return") {
      const selectedState = statesList[focusedIndex()];
      if (selectedState?.id) {
        changeState(selectedState.id);
      }
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
        title="Change State"
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
          <Show when={states.loading}>
            <text>Loading states...</text>
          </Show>
          <Show when={states.error}>
            <text fg="red">Error loading states</text>
          </Show>
          <Show when={!states.loading && !states.error && states()}>
            <For each={states()}>
              {(state, index) => {
                const isCurrentState = () => state.id === currentStateId();
                return (
                  <box 
                    flexDirection="row" 
                    backgroundColor={index() === focusedIndex() ? colors.accent : colors.modalBackground}
                  >
                    <text fg={index() === focusedIndex() ? "white" : "gray"} width={2}>
                      {isCurrentState() ? "*" : " "}
                    </text>
                    <text fg={index() === focusedIndex() ? "white" : "gray"}>
                      {state.name || state.id}
                    </text>
                  </box>
                );
              }}
            </For>
          </Show>
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
