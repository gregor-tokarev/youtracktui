import type { PaginatedResponse, Issue } from "@youtracktui/sdk";

const cachePath = `${Bun.env.HOME ?? process.env.HOME}/.youtracktui-issues-cache.json`;

type IssuesCache = {
	updatedAt: number;
	response: PaginatedResponse<Issue>;
};

export async function readIssuesCache(): Promise<PaginatedResponse<Issue> | null> {
	try {
		const file = Bun.file(cachePath);
		if (!(await file.exists())) return null;

		const text = await file.text();
		if (!text) return null;

		const parsed = JSON.parse(text) as IssuesCache;
		if (!parsed.updatedAt || !parsed.response || !parsed.response.data) {
			return null;
		}

		return parsed.response;
	} catch {
		return null;
	}
}

export async function writeIssuesCache(
	response: PaginatedResponse<Issue>,
): Promise<void> {
	const payload: IssuesCache = {
		updatedAt: Date.now(),
		response,
	};

	await Bun.write(cachePath, JSON.stringify(payload));
}

export async function updateIssueInCache(
	issueId: string,
	updatedIssue: Issue,
): Promise<void> {
	const cached = await readIssuesCache();
	if (!cached || !cached.data) return;

	const updatedIssues = cached.data.map((issue) =>
		issue.id === issueId ? updatedIssue : issue
	);

	const updatedResponse: PaginatedResponse<Issue> = {
		...cached,
		data: updatedIssues,
	};

	await writeIssuesCache(updatedResponse);
}
