import { YouTrackClient } from "../client";
import type { User } from "../types";

export class UsersResource {
	constructor(private client: YouTrackClient) {}

	async me(fields?: string | string[]): Promise<User> {
		const params: Record<string, string> = {};
		if (fields) {
			params.fields = Array.isArray(fields) ? fields.join(",") : fields;
		}
		return this.client.get<User>("/users/me", params);
	}

	async getCurrent(fields?: string | string[]): Promise<User> {
		return this.me(fields);
	}

	async get(id: string, fields?: string | string[]): Promise<User> {
		const params: Record<string, string> = {};
		if (fields) {
			params.fields = Array.isArray(fields) ? fields.join(",") : fields;
		}
		return this.client.get<User>(`/users/${id}`, params);
	}
}
