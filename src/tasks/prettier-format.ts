import { spawn } from 'child_process';


export async function prettierFormat(targetDir: string) {
  return new Promise((resolve, reject) => {
    const install = spawn('pnpm', ['format'], {
      cwd: targetDir,
      stdio: 'inherit',
    });

    install.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`pnpm install failed with exit code ${code}`));
      } else {
        resolve(true);
      }
    });

    install.on('error', (error) => {
      reject(new Error('Failed to start pnpm install', { cause: error }));
    });
  });
  // try {
  //   const result = await execa("pnpm run", ["format"], { cwd: targetDir });

  //   if (result.failed) {
  //     throw new Error("There was a problem running the format command");
  //   }
  // } catch (error) {
  //   throw new Error("Failed to create directory", { cause: error });
  // }

  // return true;
}
