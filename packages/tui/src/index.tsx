import { render } from "@opentui/solid";
import { App } from "./App";
// import { YouTrackSDK } from "@youtracktui/sdk";

render(() => <App />);

// const sdk = new YouTrackSDK({
//   baseUrl: Bun.env.YOUTRACK_BASE_URL || "",
//   token: Bun.env.YOUTRACK_PERM_TOKEN || "",
// });

// const projects = await sdk.projects.list();

// console.log(projects);