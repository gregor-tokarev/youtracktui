import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { render } from "@opentui/solid";
import { App } from "./App";
import packageJson from "../package.json";

const version = packageJson.version || "0.1.0";

async function showTUI() {
	if (!Bun.env.YOUTRACK_BASE_URL || !Bun.env.YOUTRACK_PERM_TOKEN) {
		console.error("YOUTRACK_BASE_URL and YOUTRACK_PERM_TOKEN must be set");
		process.exit(1);
	}

	render(() => <App />);
}

async function upgradeCommand() {
	console.log("Checking for updates...");
	console.log("Current version:", version);
	console.log("Upgrade functionality coming soon!");
}

async function versionCommand() {
	console.log(version);
}

const args = hideBin(process.argv);

let commandHandled = false;

const parser = yargs(args)
	.scriptName("youtracktui")
	.command("upgrade", "Check for updates and upgrade the binary", {}, async () => {
		commandHandled = true;
		await upgradeCommand();
		process.exit(0);
	})
	.command("version", "Print the current version", {}, async () => {
		commandHandled = true;
		await versionCommand();
		process.exit(0);
	})
	.command("tui", "Display the terminal user interface", {}, async () => {
		commandHandled = true;
		await showTUI();
	})
	.command("$0", false, {}, async () => {
		commandHandled = true;
		await versionCommand();
		process.exit(0);
	})
	.strictCommands(false)
	.strictOptions(false)
	.help();

try {
	await parser.parse();
	if (!commandHandled && args.length > 0) {
		await showTUI();
	}
} catch (err) {
	if (!commandHandled) {
		await showTUI();
	} else {
		throw err;
	}
}
