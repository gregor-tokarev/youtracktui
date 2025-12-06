import { createResource, createSignal } from "solid-js";
import type { YouTrackSDK } from "@youtracktui/sdk";
import type { Issue } from "@youtracktui/sdk/src/types";

export function useIssues(
  sdk: () => YouTrackSDK | null,
  projectId: () => string | null,
  searchQuery: () => string
) {
  const [issues, { refetch }] = createResource<Issue[]>(
    () => ({ sdk: sdk(), projectId: projectId(), query: searchQuery() }),
    async ({ sdk, projectId, query }) => {
      if (!sdk || !projectId) return [];

      try {
        // Build query - combine project filter with user search
        let fullQuery = `project: {${projectId}}`;
        if (query) {
          fullQuery = `${fullQuery} ${query}`;
        }

        const result = await sdk.issues.search(fullQuery, {
          fields: [
            "id",
            "idReadable",
            "summary",
            "description",
            "project(id,name,shortName)",
            "assignee(id,fullName,email)",
            "reporter(id,fullName,email)",
            "state(id,name,resolved)",
            "tags(id,name)",
            "created",
            "updated",
          ],
          top: 100,
        });

        return result.data;
      } catch (error) {
        console.error("Failed to load issues:", error);
        return [];
      }
    }
  );

  return { issues, refetch };
}

