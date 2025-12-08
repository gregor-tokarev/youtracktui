import solidPlugin from "@opentui/solid/bun-plugin";

type BunCompileTarget =
	| "bun-darwin-x64"
	| "bun-darwin-arm64"
	| "bun-linux-x64"
	| "bun-windows-x64";

const entrypoints = [process.env.BUILD_ENTRY ?? "./src/index.tsx"];
const outdir = process.env.BUILD_OUTDIR ?? "../../dist/tui";
const compileTarget: BunCompileTarget =
	(process.env.BUILD_TARGET as BunCompileTarget | undefined) ??
	"bun-darwin-arm64";
const outfile = process.env.BUILD_OUTFILE ?? "app-macos";

await Bun.build({
	entrypoints,
	target: "bun",
	outdir,
	plugins: [solidPlugin],
	compile: {
		target: compileTarget,
		outfile,
	},
});
