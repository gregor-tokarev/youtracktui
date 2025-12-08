import {
	createSignal,
	For,
	Show,
	onCleanup,
	createMemo,
	createEffect,
	type Resource,
	type Accessor,
} from "solid-js";
import { useKeyboard } from "@opentui/solid";
import type { ScrollBoxRenderable } from "@opentui/core";
import type { Issue, PaginatedResponse } from "@youtracktui/sdk";
import { copyToClipboard } from "../utils/clipboard";
import { truncateText } from "../utils/text";
import { useFilter } from "../hooks/useFilter";
import { useSearch } from "../hooks/useSearch";

interface IssuesListProps {
	issues: Resource<PaginatedResponse<Issue>>;
	onFocusedIndexChange?: (index: number) => void;
	modalOpen?: boolean;
	onUrlCopied?: () => void;
	searchQuery: Accessor<string>;
}

export function IssuesList(props: IssuesListProps) {
	const [focusedIssueIndex, setFocusedIssueIndex] = createSignal(0);
	let scrollboxRef: ScrollBoxRenderable | undefined;

	const setScrollboxRef = (ref: ScrollBoxRenderable | undefined) => {
		scrollboxRef = ref;
	};

	const { searchOpen } = useSearch();

	const spinnerFrames = ["/", "|", "\\", "—"];
	const [spinnerIndex, setSpinnerIndex] = createSignal(0);

	const spinnerInterval = setInterval(() => {
		setSpinnerIndex((prev) => (prev + 1) % spinnerFrames.length);
	}, 100);

	onCleanup(() => clearInterval(spinnerInterval));

	const filteredIssues = useFilter(
		() => props.issues()?.data,
		(issue: Issue, query: string) => {
			const summary = (issue.summary || "").toLowerCase();
			const idReadable = (issue.idReadable || "").toLowerCase();
			return summary.includes(query) || idReadable.includes(query);
		},
		props.searchQuery,
	);

	createEffect(() => {
		props.searchQuery();
		setFocusedIssueIndex(0);
		props.onFocusedIndexChange?.(0);
	});

	const title = createMemo(() => {
		if (props.issues.loading) {
			return `${spinnerFrames[spinnerIndex()]} Loading`;
		}

		const totalIssues = props.issues()?.data?.length || 0;
		const hasSearch = props.searchQuery().trim() !== "";

		if (hasSearch) {
			return `[1] My Issues (${filteredIssues().length}/${totalIssues})`;
		}

		return `[1] My Issues (${totalIssues})`;
	});

	useKeyboard((evt) => {
		if (props.modalOpen || searchOpen()) return;

		if (evt.name === "j") {
			const totalItems = filteredIssues().length;
			if (focusedIssueIndex() >= totalItems - 1) return;

			const newIndex = focusedIssueIndex() + 1;
			setFocusedIssueIndex(newIndex);
			props.onFocusedIndexChange?.(newIndex);

			if (scrollboxRef) {
				const viewportHeight = scrollboxRef.viewport.height;
				const scrollTop = scrollboxRef.scrollTop;
				if (newIndex >= scrollTop + viewportHeight) {
					scrollboxRef.scrollTo({ y: newIndex - viewportHeight + 1, x: 0 });
				}
			}
		}

		if (evt.name === "k") {
			if (focusedIssueIndex() === 0) return;

			const newIndex = focusedIssueIndex() - 1;
			setFocusedIssueIndex(newIndex);
			props.onFocusedIndexChange?.(newIndex);

			if (scrollboxRef) {
				const scrollTop = scrollboxRef.scrollTop;
				if (newIndex < scrollTop) {
					scrollboxRef.scrollTo({ y: newIndex, x: 0 });
				}
			}
		}

		if (evt.ctrl && evt.name === "y") {
			const issues = filteredIssues();
			if (issues.length > 0 && focusedIssueIndex() < issues.length) {
				const issue = issues[focusedIssueIndex()];
				if (issue?.idReadable) {
					const url = `${Bun.env.YOUTRACK_BASE_URL}/issue/${issue.idReadable}`;
					copyToClipboard(url);
					props.onUrlCopied?.();
				}
			}
		}

		if (evt.name === "o") {
			const issues = filteredIssues();
			if (issues.length > 0 && focusedIssueIndex() < issues.length) {
				const issue = issues[focusedIssueIndex()];
				if (issue?.idReadable) {
					const url = `${Bun.env.YOUTRACK_BASE_URL}/issue/${issue.idReadable}`;
					Bun.spawn(["open", url]);
				}
			}
		}

		if (evt.name === "y") {
			const issues = filteredIssues();
			if (issues.length > 0 && focusedIssueIndex() < issues.length) {
				const issue = issues[focusedIssueIndex()];
				const slackLink = `${issue?.idReadable}_`;

				copyToClipboard(slackLink);
				props.onUrlCopied?.();
			}
		}
	});

	return (
		<box flexDirection="column" width="20%">
			<scrollbox
				ref={setScrollboxRef}
				borderStyle="single"
				borderColor="gray"
				flexGrow={1}
				padding={1}
				height="100%"
				title={title()}
			>
				<Show when={props.issues()?.data}>
					<For each={filteredIssues()}>
						{(issue, index) => (
							<text fg={index() === focusedIssueIndex() ? "white" : "gray"}>
								{truncateText(issue.summary || "", 30)}
							</text>
						)}
					</For>
				</Show>
			</scrollbox>
		</box>
	);
}
