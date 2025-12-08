import { YouTrackClient } from "../client";
import type {
	Issue,
	PaginatedResponse,
	SearchOptions,
	ActivityItem,
	Comment,
} from "../types";

const DEFAULT_ISSUE_FIELDS = [
	"id",
	"idReadable",
	"summary",
	"description",
	"project(id,name,shortName)",
	"assignee(id,fullName,email)",
	"reporter(id,fullName,email)",
	"state(id,name,resolved)",
	"tags(id,name)",
	"customFields(name,value(presentation,id,name,$type))",
	"created",
	"updated",
];

export class IssuesResource {
	constructor(private client: YouTrackClient) {}

	async get(id: string, fields?: string | string[]): Promise<Issue> {
		const params: Record<string, string> = {};
		const fieldList = fields ?? DEFAULT_ISSUE_FIELDS;
		params.fields = Array.isArray(fieldList) ? fieldList.join(",") : fieldList;
		return this.client.get<Issue>(`/issues/${id}`, params);
	}

	async search(
		query: string,
		options?: SearchOptions,
	): Promise<PaginatedResponse<Issue>> {
		const params: Record<string, string> = {
			query,
		};

		if (options?.fields) {
			params.fields = Array.isArray(options.fields)
				? options.fields.join(",")
				: options.fields;
		}

		const top = options?.top;
		const skip = options?.skip;

		if (top !== undefined) {
			params.$top = String(top);
		}

		if (skip !== undefined) {
			params.$skip = String(skip);
		}

		if (options?.query) {
			params.query = options.query;
		}

		const { data, response } = await this.client.getWithResponse<Issue[]>(
			"/issues",
			params,
		);

		const totalHeader =
			response.headers.get("X-Total-Count") ||
			response.headers.get("x-total-count");
		const total = totalHeader ? parseInt(totalHeader, 10) : undefined;

		const issues = Array.isArray(data) ? data : [];

		return {
			data: issues,
			total,
			skip,
			top,
		};
	}

	async create(draft: Partial<Issue>): Promise<Issue> {
		return this.client.post<Issue>("/issues", draft);
	}

	async update(id: string, updates: Partial<Issue>): Promise<Issue> {
		return this.client.post<Issue>(`/issues/${id}`, updates);
	}

	async addComment(id: string, comment: { text: string }): Promise<Comment> {
		return this.client.post<Comment>(`/issues/${id}/comments`, comment);
	}

	async getActivities(
		id: string,
		categories?: string,
		fields?: string | string[],
	): Promise<ActivityItem[]> {
		const params: Record<string, string> = {};
		if (categories) {
			params.categories = categories;
		}
		if (fields) {
			params.fields = Array.isArray(fields) ? fields.join(",") : fields;
		}
		return this.client.get<ActivityItem[]>(`/issues/${id}/activities`, params);
	}

	async updateCustomField(
		id: string,
		fieldName: string,
		value: any,
	): Promise<Issue> {
		return this.client.post<Issue>(
			`/issues/${id}/customFields/${fieldName}`,
			value,
		);
	}
}
