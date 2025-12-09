import { YouTrackSDK, type BundleValue } from "@youtracktui/sdk";
import { createResource, createSignal, Show, createMemo } from "solid-js";
import { useKeyboard, useRenderer } from "@opentui/solid";
import { IssuesList } from "./components/IssuesList";
import { KeybindingsToolbar } from "./components/Toolbar";
import { KeybindingsModal } from "./components/KeybindingsModal";
import { StateModal } from "./components/StateModal";
import { useSearch } from "./hooks/useSearch";
import { useFilter } from "./hooks/useFilter";
import type { Issue } from "@youtracktui/sdk";
import { readIssuesCache, writeIssuesCache, updateIssueInCache } from "./utils/issuesCache";

export function App() {
	const renderer = useRenderer();

	const youtrack = new YouTrackSDK({
		baseUrl: Bun.env.YOUTRACK_BASE_URL || "",
		token: Bun.env.YOUTRACK_PERM_TOKEN || "",
	});

	const [issuesRefreshTrigger] = createSignal(0);

	const [issues, { mutate: mutateIssues }] = createResource(
		issuesRefreshTrigger,
		async () => {
			const cached = await readIssuesCache();
			if (cached) {
				mutateIssues(cached);
			}

			try {
				const fresh = await youtrack.issues.search(
					"assignee: me #Unresolved Type: Task sort by: created desc",
					{
						fields: [
							"id",
							"summary",
							"idReadable",
							"project(id,name)",
							"description",
							"reporter(login)",
							"state(id,name,resolved)",
							"customFields(id,name,value(presentation,id,name,$type))",
							"created",
							"updated",
						],
					},
				);

				await writeIssuesCache(fresh);
				return fresh;
			} catch (error) {
				console.error("Error fetching issues:", error);
				return cached || { data: [], total: 0 };
			}
		},
	);

	const [focusedIssueIndex, setFocusedIssueIndex] = createSignal(0);
	const [keybindingsModalOpen, setKeybindingsModalOpen] = createSignal(false);
	const [stateModalOpen, setStateModalOpen] = createSignal(false);
	const [urlCopiedMessage, setUrlCopiedMessage] = createSignal(false);

	const {
		searchQuery,
		searchOpen,
		setSearchQuery,
		searchInputRef,
		handleSearchSubmit,
	} = useSearch({
		disabled: () => keybindingsModalOpen() || stateModalOpen(),
		onClose: () => {
			setFocusedIssueIndex(0);
		},
		onQueryChange: () => {
			setFocusedIssueIndex(0);
		},
	});

	const filteredIssues = useFilter(
		() => issues()?.data,
		(issue: Issue, query: string) => {
			const summary = (issue.summary || "").toLowerCase();
			const idReadable = (issue.idReadable || "").toLowerCase();
			return summary.includes(query) || idReadable.includes(query);
		},
		searchQuery,
	);

	const selectedIssue = createMemo(() => {
		const filtered = filteredIssues();
		const idx = focusedIssueIndex();
		return filtered?.[idx];
	});

	const issueState = createMemo(() => {
		const issue = selectedIssue();
		if (!issue) return null;

		if (issue.state?.name) {
			return issue.state.name;
		}

		const stateField = issue.customFields?.find(
			(cf) => cf.name === "State" || cf.name === "Status",
		);

		if (stateField?.value) {
			const value = Array.isArray(stateField.value)
				? stateField.value[0]
				: stateField.value;
			if (value && (value.name || value.presentation)) {
				return value.name || value.presentation;
			}
		}

		return null;
	});

	const handleStateChanged = async (newState: BundleValue) => {
		const currentIssues = issues();
		const issueToUpdate = selectedIssue();

		if (!currentIssues?.data || !issueToUpdate) return;

		const updatedIssues = currentIssues.data.map((issue) => {
			if (issue.id === issueToUpdate.id) {
				const updatedIssue = { ...issue };

				if (updatedIssue.state) {
					updatedIssue.state = {
						...updatedIssue.state,
						id: newState.id,
						name: newState.name,
						resolved: newState.isResolved,
					};
				}

				if (updatedIssue.customFields) {
					updatedIssue.customFields = updatedIssue.customFields.map(
						(cf) => {
							if (cf.name === "State" || cf.name === "Status") {
								const oldValue = Array.isArray(cf.value)
									? cf.value[0]
									: cf.value;
								return {
									...cf,
									value: {
										...(oldValue || {}),
										id: newState.id,
										name: newState.name,
										presentation: newState.name,
									},
								};
							}
							return cf;
						},
					);
				}

				return updatedIssue;
			}
			return issue;
		});

		mutateIssues({ ...currentIssues, data: updatedIssues });

		// Update the cache with the modified issue
		await updateIssueInCache(issueToUpdate.id, updatedIssues.find(i => i.id === issueToUpdate.id)!);
	};

	useKeyboard((evt) => {
		if (evt.name === "q") {
			renderer.destroy();
			process.exit(0);
		}

		if (searchOpen()) return;

		if ((evt.shift && evt.name === "/") || evt.name === "?") {
			setKeybindingsModalOpen(!keybindingsModalOpen());
			return;
		}

		if (evt.name === "escape") {
			if (keybindingsModalOpen()) {
				setKeybindingsModalOpen(false);
				return;
			}
			if (stateModalOpen()) {
				setStateModalOpen(false);
				return;
			}
		}

		if (
			evt.name === "s" &&
			!keybindingsModalOpen() &&
			!stateModalOpen() &&
			selectedIssue()
		) {
			setStateModalOpen(true);
			return;
		}

		if (evt.name === "`") {
			renderer.console.toggle();
			return;
		}
	});

	return (
		<box flexGrow={1} height="100%" flexDirection="column">
			<box flexGrow={1} flexDirection="row">
				<IssuesList
					issues={issues}
					onFocusedIndexChange={setFocusedIssueIndex}
					modalOpen={keybindingsModalOpen() || stateModalOpen()}
					onUrlCopied={() => {
						setUrlCopiedMessage(true);
						setTimeout(() => setUrlCopiedMessage(false), 1500);
					}}
					searchQuery={searchQuery}
				/>
				<scrollbox
					borderStyle="single"
					borderColor="gray"
					padding={1}
					height="100%"
					width="65%"
					title={`Selected Issue: ${selectedIssue()?.summary}`}
				>
					<Show when={selectedIssue()}>
						<text>{selectedIssue()?.description}</text>
					</Show>
				</scrollbox>
				<box width="15%" borderStyle="single" borderColor="gray" padding={1}>
					<Show when={selectedIssue()}>
						<text>Reporter:</text>
						<text>@{selectedIssue()?.reporter?.login}</text>
						<text></text>
						<Show when={issueState()}>
							<text>State: </text>
							<text>{issueState()}</text>
						</Show>
					</Show>
				</box>
			</box>
			<KeybindingsToolbar
				urlCopied={urlCopiedMessage()}
				searchQuery={searchQuery}
				onSearchQueryChange={setSearchQuery}
				searchOpen={searchOpen}
				onSearchSubmit={() => {
					handleSearchSubmit();
					setFocusedIssueIndex(0);
				}}
				searchInputRef={searchInputRef}
			/>
			<KeybindingsModal
				open={keybindingsModalOpen()}
				onClose={() => setKeybindingsModalOpen(false)}
			/>
			<StateModal
				open={stateModalOpen()}
				onClose={() => setStateModalOpen(false)}
				issue={selectedIssue()}
				youtrack={youtrack}
				onStateChanged={handleStateChanged}
			/>
		</box>
	);
}
