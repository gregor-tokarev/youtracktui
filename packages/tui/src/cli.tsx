import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { render } from "@opentui/solid";
import { App } from "./App";

const HELP_TEXT = `
YouTrack TUI - A terminal user interface for YouTrack

Usage: youtracktui [command]

Commands:
  help     Show this help message and exit
  version  Show version information and exit

Options:
  -h, --help     Show this help message and exit
  -v, --version  Show version information and exit

Environment Variables:
  YOUTRACK_BASE_URL    The base URL of your YouTrack instance
  YOUTRACK_PERM_TOKEN  Your YouTrack permanent token

Examples:
  youtracktui              Start the TUI
  youtracktui help         Show this help message
`;

async function main() {
	const result = await yargs(hideBin(process.argv))
		.help(false)
		.version(false)
		.command("help", "Show this help message", () => {
			process.stdout.write(HELP_TEXT);
			process.exit(0);
		})
		.command("version", "Show version information", () => {
			process.stdout.write(`YouTrack TUI v${process.env.npm_package_version ?? "0.1.0"}\n`);
			process.exit(0);
		})
		.command("$0", "Start the TUI", () => {
			if (!Bun.env.YOUTRACK_BASE_URL || !Bun.env.YOUTRACK_PERM_TOKEN) {
				process.stderr.write("Error: YOUTRACK_BASE_URL and YOUTRACK_PERM_TOKEN must be set\n");
				process.exit(1);
			}
			render(() => <App />);
		})
		.strictCommands()
		.parseAsync();
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
