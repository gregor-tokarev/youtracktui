import { $ } from "bun"
import { mkdir } from "node:fs/promises"
import { join } from "node:path"
import solidPlugin from "@opentui/solid/bun-plugin"

const platforms = [
  { target: "bun-darwin-arm64", name: "yt-macos-arm64", os: "darwin", arch: "arm64" },
  { target: "bun-darwin-x64", name: "yt-macos-x64", os: "darwin", arch: "x64" },
  { target: "bun-linux-x64", name: "yt-linux-x64", os: "linux", arch: "x64" },
] as const

const distDir = join(process.cwd(), "dist")
const version = process.env.VERSION || "0.1.0"

await mkdir(distDir, { recursive: true })

for (const platform of platforms) {
  console.log(`Building ${platform.name}...`)
  
  const buildDir = join(distDir, platform.name)
  await mkdir(buildDir, { recursive: true })
  
  const outfile = "yt"
  
  await Bun.build({
    entrypoints: ["./packages/tui/src/index.tsx"],
    target: "bun",
    outdir: buildDir,
    plugins: [solidPlugin],
    compile: {
      target: platform.target,
      outfile: join(buildDir, outfile),
    },
  })
  
  await $`chmod +x ${join(buildDir, outfile)}`
  
  const archiveName = `${platform.name}-v${version}.tar.gz`
  const archivePath = join(distDir, archiveName)
  
  console.log(`Creating archive ${archiveName}...`)
  await $`tar -czf ${archivePath} -C ${buildDir} ${outfile}`
  
  console.log(`✓ Built ${platform.name}`)
}

console.log("✓ All builds completed")
