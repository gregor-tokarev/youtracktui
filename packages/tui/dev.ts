import path from "node:path"
import solidPlugin from "@opentui/solid/bun-plugin"

type BunCompileTarget =
  | "bun-darwin-x64"
  | "bun-darwin-arm64"
  | "bun-linux-x64"
  | "bun-windows-x64"

const entrypoints = [process.env.BUILD_ENTRY ?? "./src/index.tsx"]
const outdir = process.env.BUILD_OUTDIR ?? "../../dist/tui"
const compileTarget: BunCompileTarget =
  (process.env.BUILD_TARGET as BunCompileTarget | undefined) ?? "bun-darwin-arm64"
const outfile = process.env.BUILD_OUTFILE ?? "app-macos"
const binaryPath = path.resolve(outdir, outfile)

let running: ReturnType<typeof Bun.spawn> | undefined

const restartBinary = () => {
  // Stop previous process before starting a fresh one
  running?.kill()
  running = Bun.spawn([binaryPath], {
    stdio: ["inherit", "inherit", "inherit"],
  })
}

const logFailure = (logs: Array<{ message: string }> = []) => {
  console.error("[dev] build failed")
  for (const log of logs) {
    console.error(log.message)
  }
}

const result = await Bun.build({
  entrypoints,
  target: "bun",
  outdir,
  plugins: [solidPlugin],
  compile: {
    target: compileTarget,
    outfile,
  },
  watch: {
    onRebuild(rebuild) {
      if (!rebuild.success) {
        logFailure(rebuild.logs)
        return
      }

      console.log("[dev] rebuilt, restarting app...")
      restartBinary()
    },
  },
})

if (!result.success) {
  logFailure(result.logs)
  process.exit(1)
}

console.log("[dev] initial build complete, starting app...")
restartBinary()
console.log("[dev] watching for changes in entrypoints and deps")

