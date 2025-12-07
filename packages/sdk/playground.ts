import { YouTrackSDK } from "./src/sdk";

const youtrack = new YouTrackSDK({
  baseUrl: Bun.env.YOUTRACK_BASE_URL || "",
  token: Bun.env.YOUTRACK_PERM_TOKEN || "",
});

async function testStateChange() {
  try {
    console.log("Fetching issues...");
    const issues = await youtrack.issues.search("assignee: me #Unresolved Type: Task", {
      fields: ["id", "project(id,name)", "idReadable", "customFields(id,name,value(id,name),$type)"],
      top: 1,
    });

    if (!issues.data || issues.data.length === 0) {
      console.error("No issues found");
      return;
    }

    const issue = issues.data[0];
    const projectId = issue.project?.id;
    const issueId = issue.id;

    console.log(`\nIssue: ${issue.idReadable} (${issueId})`);
    
    const stateField = issue.customFields?.find(cf => cf.name === "State");
    const currentStateId = (stateField?.value as any)?.id;
    const currentStateName = (stateField?.value as any)?.name;
    console.log(`Current state: ${currentStateName} (id: ${currentStateId})`);

    const states = await youtrack.projects.getStateBundle(projectId!);
    const nextState = states.find(s => s.id !== currentStateId && !s.isResolved);
    
    if (!nextState) {
      console.log("\nNo different unresolved state found");
      return;
    }

    console.log(`Target state: ${nextState.name} (id: ${nextState.id})`);

    const fieldIdentifier = stateField?.id || "State";

    const payloads = [
      { name: "Format 1: { id }", payload: { id: nextState.id } },
      { name: "Format 2: { value: { id } }", payload: { value: { id: nextState.id } } },
      { name: "Format 3: { value: { id, $type } }", payload: { value: { id: nextState.id, $type: "StateBundleElement" } } },
      { name: "Format 4: { $type, value }", payload: { $type: "StateIssueCustomField", value: { id: nextState.id } } },
    ];

    for (const { name, payload } of payloads) {
      console.log(`\n--- Testing ${name} ---`);
      console.log(`Payload: ${JSON.stringify(payload)}`);
      
      try {
        await youtrack.issues.updateCustomField(
          issueId!,
          fieldIdentifier,
          payload
        );
        console.log("API call succeeded");

        const refreshedIssue = await youtrack.issues.get(issueId!, [
          "customFields(name,value(id,name))"
        ]);
        
        const refreshedStateField = refreshedIssue.customFields?.find(cf => cf.name === "State");
        const newStateId = (refreshedStateField?.value as any)?.id;
        const newStateName = (refreshedStateField?.value as any)?.name;
        
        console.log(`State after: ${newStateName} (id: ${newStateId})`);
        
        if (newStateId === nextState.id) {
          console.log(`\n✓ SUCCESS with ${name}!`);
          return;
        } else {
          console.log(`State didn't change`);
        }
      } catch (error) {
        console.log(`API call failed: ${(error as Error).message}`);
      }
    }

    console.log("\n✗ All formats failed to update the state");

  } catch (error) {
    console.error("Error:", error);
    if (error instanceof Error) {
      console.error("Stack:", error.stack);
    }
  }
}

testStateChange();
