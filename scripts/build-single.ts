import { $ } from "bun";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import solidPlugin from "@opentui/solid/bun-plugin";

const target = process.env.BUILD_TARGET;
const name = process.env.BUILD_NAME;
const version = process.env.VERSION || "0.1.0";

if (!target || !name) {
	console.error(
		"BUILD_TARGET and BUILD_NAME environment variables are required",
	);
	process.exit(1);
}

const distDir = join(process.cwd(), "dist");
const buildDir = join(distDir, name);

await mkdir(buildDir, { recursive: true });

console.log(`Building ${name}...`);

const outfile = "yt";

await Bun.build({
	entrypoints: ["./packages/tui/src/index.tsx"],
	target: "bun",
	outdir: buildDir,
	plugins: [solidPlugin],
	compile: {
		target: target as any,
		outfile: join(buildDir, outfile),
	},
});

await $`chmod +x ${join(buildDir, outfile)}`;

const archiveName = `${name}-v${version}.tar.gz`;
const archivePath = join(distDir, archiveName);

console.log(`Creating archive ${archiveName}...`);
await $`tar -czf ${archivePath} -C ${buildDir} ${outfile}`;

console.log(`✓ Built ${name}`);
