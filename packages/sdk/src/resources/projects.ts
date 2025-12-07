import { YouTrackClient } from '../client';
import type { Project, ProjectCustomField } from '../types';

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
}

