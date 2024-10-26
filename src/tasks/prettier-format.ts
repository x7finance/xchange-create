import { spawn } from "child_process"

export async function prettierFormat(targetDir: string) {
  return new Promise((resolve, reject) => {
    const install = spawn("pnpm", ["format"], {
      cwd: targetDir,
      stdio: ["ignore", "ignore", "pipe"], // Changed stdio to suppress output
    })

    install.on("close", code => {
      if (code !== 0) {
        reject(new Error(`pnpm install failed with exit code ${code}`))
      } else {
        resolve(true)
      }
    })

    install.on("error", error => {
      reject(new Error("Failed to start pnpm install", { cause: error }))
    })
  })
}
