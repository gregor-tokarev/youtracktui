import { createResource } from "solid-js";
import type { YouTrackSDK } from "@youtracktui/sdk";
import type { Project } from "@youtracktui/sdk/src/types";

export function useProjects(sdk: () => YouTrackSDK | null) {
  const [projects] = createResource<Project[]>(
    async () => {
      const client = sdk();
      if (!client) return [];
      
      try {
        return await client.projects.list([
          "id",
          "name",
          "shortName",
          "description",
          "archived",
        ]);
      } catch (error) {
        console.error("Failed to load projects:", error);
        return [];
      }
    }
  );

  return projects;
}

