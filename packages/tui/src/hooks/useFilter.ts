import { createMemo, type Accessor } from "solid-js";

export type FilterFunction<T> = (item: T, query: string) => boolean;

export function useFilter<T>(
  items: Accessor<T[] | undefined>,
  filterFn: FilterFunction<T>,
  query: Accessor<string>
) {
  const filtered = createMemo(() => {
    const itemsList = items() || [];
    const searchQuery = query().toLowerCase().trim();
    
    if (!searchQuery) {
      return itemsList;
    }
    
    return itemsList.filter((item) => filterFn(item, searchQuery));
  });

  return filtered;
}
