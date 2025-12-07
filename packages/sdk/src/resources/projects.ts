import { YouTrackClient } from '../client';
import type { Project, ProjectCustomField, BundleValue } from '../types';

export class ProjectsResource {
  constructor(private client: YouTrackClient) {}

  async list(fields?: string | string[]): Promise<Project[]> {
    const params: Record<string, string> = {};
    if (fields) {
      params.fields = Array.isArray(fields) ? fields.join(',') : fields;
    }
    return this.client.get<Project[]>('/admin/projects', params);
  }

  async get(id: string, fields?: string | string[]): Promise<Project> {
    const params: Record<string, string> = {};
    if (fields) {
      params.fields = Array.isArray(fields) ? fields.join(',') : fields;
    }
    return this.client.get<Project>(`/admin/projects/${id}`, params);
  }

  async getCustomFields(
    id: string,
    fields?: string | string[]
  ): Promise<ProjectCustomField[]> {
    const params: Record<string, string> = {};
    if (fields) {
      params.fields = Array.isArray(fields) ? fields.join(',') : fields;
    }
    return this.client.get<ProjectCustomField[]>(
      `/admin/projects/${id}/customFields`,
      params
    );
  }

  async getStateBundle(projectId: string): Promise<BundleValue[]> {
    try {
      const customFields = await this.getCustomFields(projectId, [
        "name",
        "customField(name)",
        "bundle(id)",
        "$type"
      ]);
      
      const stateField = customFields.find(f => 
        f.$type === "StateProjectCustomField" || f.name === "State" || f.customField?.name === "State"
      );
      
      if (!stateField?.bundle?.id) {
        return [];
      }
      
      const bundleId = stateField.bundle.id;
      const params: Record<string, string> = {
        fields: "id,name,isResolved"
      };
      const values = await this.client.get<BundleValue[]>(
        `/admin/customFieldSettings/bundles/state/${bundleId}/values`,
        params
      );
      return values || [];
    } catch (error) {
      return [];
    }
  }
}

