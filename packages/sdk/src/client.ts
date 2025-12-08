import type { YouTrackConfig, RequestOptions } from "./types";

export class YouTrackError extends Error {
	constructor(
		message: string,
		public status?: number,
		public statusText?: string,
		public response?: any,
	) {
		super(message);
		this.name = "YouTrackError";
	}
}

export class YouTrackClient {
	private baseUrl: string;
	private token: string;
	private maxRetries: number;
	private timeout: number;

	constructor(config: YouTrackConfig) {
		this.baseUrl = config.baseUrl.replace(/\/$/, "");
		this.token = config.token;
		this.maxRetries = config.maxRetries ?? 0;
		this.timeout = config.timeout ?? 30000;
	}

	protected async request<T>(
		endpoint: string,
		options: RequestOptions = {},
	): Promise<T> {
		const result = await this.requestWithResponse<T>(endpoint, options);
		return result.data;
	}

	protected async requestWithResponse<T>(
		endpoint: string,
		options: RequestOptions = {},
	): Promise<{ data: T; response: Response }> {
		const url = new URL(`${this.baseUrl}/api${endpoint}`);

		if (options.params) {
			for (const [key, value] of Object.entries(options.params)) {
				if (value !== undefined && value !== null) {
					url.searchParams.append(key, String(value));
				}
			}
		}

		const headers: Record<string, string> = {
			Authorization: `Bearer ${this.token}`,
			Accept: "application/json",
			"Content-Type": "application/json",
			...options.headers,
		};

		const method = options.method ?? "GET";
		const body = options.body ? JSON.stringify(options.body) : undefined;

		let lastError: Error | null = null;

		for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), this.timeout);

				const response = await fetch(url.toString(), {
					method,
					headers,
					body,
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					let errorMessage = `Request failed with status ${response.status}`;
					let errorData: any = null;

					try {
						const contentType = response.headers.get("content-type");
						if (contentType?.includes("application/json")) {
							errorData = await response.json();
							if (errorData.error_description) {
								errorMessage = errorData.error_description;
							} else if (errorData.error) {
								errorMessage = errorData.error;
							} else if (errorData.message) {
								errorMessage = errorData.message;
							}
						} else {
							const text = await response.text();
							if (text) {
								errorMessage = text;
							}
						}
					} catch {}

					throw new YouTrackError(
						errorMessage,
						response.status,
						response.statusText,
						errorData,
					);
				}

				const contentType = response.headers.get("content-type");
				if (!contentType?.includes("application/json")) {
					return { data: {} as T, response };
				}

				const json = await response.json();
				return { data: json as T, response };
			} catch (error) {
				lastError = error as Error;

				if (
					error instanceof YouTrackError &&
					error.status &&
					error.status >= 400 &&
					error.status < 500
				) {
					throw error;
				}

				if (attempt < this.maxRetries) {
					const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
					await new Promise((resolve) => setTimeout(resolve, delay));
					continue;
				}
			}
		}

		throw lastError || new Error("Request failed after retries");
	}

	public get<T>(
		endpoint: string,
		params?: RequestOptions["params"],
	): Promise<T> {
		return this.request<T>(endpoint, { method: "GET", params });
	}

	public async getWithResponse<T>(
		endpoint: string,
		params?: RequestOptions["params"],
	): Promise<{ data: T; response: Response }> {
		return this.requestWithResponse<T>(endpoint, { method: "GET", params });
	}

	public post<T>(
		endpoint: string,
		body?: any,
		params?: RequestOptions["params"],
	): Promise<T> {
		return this.request<T>(endpoint, { method: "POST", body, params });
	}

	public put<T>(
		endpoint: string,
		body?: any,
		params?: RequestOptions["params"],
	): Promise<T> {
		return this.request<T>(endpoint, { method: "PUT", body, params });
	}

	public patch<T>(
		endpoint: string,
		body?: any,
		params?: RequestOptions["params"],
	): Promise<T> {
		return this.request<T>(endpoint, { method: "PATCH", body, params });
	}

	public delete<T>(
		endpoint: string,
		params?: RequestOptions["params"],
	): Promise<T> {
		return this.request<T>(endpoint, { method: "DELETE", params });
	}
}
