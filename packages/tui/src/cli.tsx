import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { render } from "@opentui/solid";
import { App } from "./App";

const VERSION = process.env.npm_package_version ?? "unknown";

async function main() {
	await yargs(hideBin(process.argv))
		.scriptName("yt")
		.version(VERSION)
		.options({
			help: {
				alias: "h",
				type: "boolean",
				description: "Show help message and exit",
			},
		})
		.command("$0", "Start the TUI", () => {})
		.command(
			"upgrade",
			"Upgrade to the latest version",
			() => {},
			async () => {
				const result =
					await Bun.$`curl -fsSL https://raw.githubusercontent.com/gregor-tokarev/youtracktui/main/install.sh | bash`;
				process.exit(result.exitCode ?? 0);
			},
		)
		.strictCommands()
		.parseAsync();

	if (!Bun.env.YOUTRACK_BASE_URL || !Bun.env.YOUTRACK_PERM_TOKEN) {
		process.stderr.write(
			"Error: YOUTRACK_BASE_URL and YOUTRACK_PERM_TOKEN must be set\n",
		);
		process.exit(1);
	}
	render(() => <App />);
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
