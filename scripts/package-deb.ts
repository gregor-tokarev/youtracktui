import { $ } from "bun"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

const version = process.env.VERSION || "0.1.0"
const distDir = join(process.cwd(), "dist")
const debDir = join(distDir, "deb")
const packageName = "yt"
const debianVersion = version.replace(/^v/, "")

const debianDir = join(debDir, `${packageName}_${debianVersion}`)
const debianDataDir = join(debianDir, "DEBIAN")
const debianUsrBinDir = join(debianDir, "usr", "bin")

await mkdir(debianDataDir, { recursive: true })
await mkdir(debianUsrBinDir, { recursive: true })

const controlContent = `Package: ${packageName}
Version: ${debianVersion}
Section: utils
Priority: optional
Architecture: amd64
Maintainer: YouTrack TUI Maintainers <maintainers@youtracktui.dev>
Description: Terminal UI for YouTrack
 A modern terminal user interface for managing YouTrack issues and projects.
Homepage: https://github.com/gregortokarev/youtracktui
`

await writeFile(join(debianDataDir, "control"), controlContent)

const binaryPath = join(distDir, "yt-linux-x64", "yt")
await $`cp ${binaryPath} ${debianUsrBinDir}/${packageName}`

const debFile = join(distDir, `${packageName}_${debianVersion}_amd64.deb`)

console.log(`Building Debian package...`)
await $`dpkg-deb --build ${debianDir} ${debFile}`

console.log(`✓ Created ${debFile}`)
