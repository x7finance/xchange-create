import { spawn } from 'child_process';

export function installPackages(targetDir: string) {
  return new Promise((resolve, reject) => {
    const install = spawn('pnpm', ['install', '--reporter=verbose'], {
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
}