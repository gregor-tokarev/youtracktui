import { createSignal, type Accessor } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import type { InputRenderable } from "@opentui/core";

export function useSearch(options?: {
  onOpen?: () => void;
  onClose?: () => void;
  onQueryChange?: (query: string) => void;
  disabled?: Accessor<boolean>;
}) {
  const [searchQuery, setSearchQuery] = createSignal("");
  const [searchOpen, setSearchOpen] = createSignal(false);
  let searchInputRef: InputRenderable | undefined;

  const openSearch = () => {
    setSearchOpen(true);
    options?.onOpen?.();
    if (searchInputRef) {
      setTimeout(() => {
        searchInputRef?.focus();
      }, 0);
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    options?.onClose?.();
    if (searchInputRef) {
      searchInputRef.blur();
    }
  };

  const handleQueryChange = (newQuery: string) => {
    setSearchQuery(newQuery);
    options?.onQueryChange?.(newQuery);
  };

  const handleSearchSubmit = () => {
    setSearchOpen(false);
    if (searchInputRef) {
      searchInputRef.blur();
    }
  };

  useKeyboard((evt) => {
    if (options?.disabled?.()) return;

    if (evt.name === "/") {
      if (searchOpen()) {
        closeSearch();
      } else {
        openSearch();
      }
    }

    if (evt.name === "escape") {
      if (searchOpen()) {
        closeSearch();
      }
    }
  });

  return {
    searchQuery,
    searchOpen,
    setSearchQuery: handleQueryChange,
    setSearchOpen,
    searchInputRef: (ref: InputRenderable | undefined) => {
      searchInputRef = ref;
    },
    handleSearchSubmit,
    openSearch,
    closeSearch,
  };
}
