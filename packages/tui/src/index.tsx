import { render } from "@opentui/solid";
import { App } from "./App";

if (!Bun.env.YOUTRACK_BASE_URL || !Bun.env.YOUTRACK_PERM_TOKEN) {
  throw new Error("YOUTRACK_BASE_URL and YOUTRACK_PERM_TOKEN must be set");
}

render(() => <App />);