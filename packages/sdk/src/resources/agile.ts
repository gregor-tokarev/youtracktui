import { YouTrackClient } from '../client';
import type {
  AgileBoard,
  Sprint,
  PaginatedResponse,
  Issue,
  SearchOptions,
} from '../types';

/**
 * Agile resource
 */
export class AgileResource {
  constructor(private client: YouTrackClient) {}

  /**
   * List all agile boards
   */
  async listBoards(fields?: string | string[]): Promise<AgileBoard[]> {
    const params: Record<string, string> = {};
    if (fields) {
      params.fields = Array.isArray(fields) ? fields.join(',') : fields;
    }
    return this.client.get<AgileBoard[]>('/agiles', params);
  }

  /**
   * Get an agile board by ID
   */
  async getBoard(id: string, fields?: string | string[]): Promise<AgileBoard> {
    const params: Record<string, string> = {};
    if (fields) {
      params.fields = Array.isArray(fields) ? fields.join(',') : fields;
    }
    return this.client.get<AgileBoard>(`/agiles/${id}`, params);
  }

  /**
   * Get current sprint for an agile board
   */
  async getCurrentSprint(
    boardId: string,
    fields?: string | string[]
  ): Promise<Sprint | null> {
    const params: Record<string, string> = {};
    if (fields) {
      params.fields = Array.isArray(fields) ? fields.join(',') : fields;
    }
    try {
      return await this.client.get<Sprint>(
        `/agiles/${boardId}/sprints/current`,
        params
      );
    } catch (error: any) {
      // Return null if no current sprint exists
      if (error?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get a sprint by ID
   */
  async getSprint(
    boardId: string,
    sprintId: string,
    fields?: string | string[]
  ): Promise<Sprint> {
    const params: Record<string, string> = {};
    if (fields) {
      params.fields = Array.isArray(fields) ? fields.join(',') : fields;
    }
    return this.client.get<Sprint>(
      `/agiles/${boardId}/sprints/${sprintId}`,
      params
    );
  }

  /**
   * Get issues in a sprint
   */
  async getIssues(
    boardId: string,
    sprintId: string,
    options?: SearchOptions
  ): Promise<PaginatedResponse<Issue>> {
    const params: Record<string, string> = {};

    if (options?.fields) {
      params.fields = Array.isArray(options.fields)
        ? options.fields.join(',')
        : options.fields;
    }

    if (options?.top !== undefined) {
      params.$top = String(options.top);
    }

    if (options?.skip !== undefined) {
      params.$skip = String(options.skip);
    }

    if (options?.query) {
      params.query = options.query;
    }

    return this.client.get<PaginatedResponse<Issue>>(
      `/agiles/${boardId}/sprints/${sprintId}/issues`,
      params
    );
  }
}

