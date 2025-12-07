import { render } from "@opentui/solid";
import { App } from "./App";

if (!Bun.env.YOUTRACK_BASE_URL || !Bun.env.YOUTRACK_PERM_TOKEN) {
  console.error("YOUTRACK_BASE_URL and YOUTRACK_PERM_TOKEN must be set");
  process.exit(1);
}

render(() => <App />);