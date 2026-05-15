import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import readline from 'node:readline/promises';
import os from 'node:os';
import path from 'node:path';

const rootDir = process.cwd();
const packages = [
  'packages/core',
  'packages/react',
  'packages/vue'
];

const npmrcDir = await mkdtemp(path.join(os.tmpdir(), 'meri-icons-npm-'));
const npmrcPath = path.join(npmrcDir, '.npmrc');
const npmCacheDir = path.join(npmrcDir, 'cache');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

try {
  const publishArgs = ['publish', '--access', 'public', '--cache', npmCacheDir];

  if (process.env.NPM_TOKEN) {
    await writeFile(
      npmrcPath,
      `registry=https://registry.npmjs.org/\n//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}\n`,
      'utf8'
    );
    publishArgs.push('--userconfig', npmrcPath);
  }

  for (const packageDir of packages) {
    const packageJsonPath = path.join(rootDir, packageDir, 'package.json');
    const pkg = JSON.parse(await readFile(packageJsonPath, 'utf8'));
    console.log(`Publishing ${pkg.name}@${pkg.version}`);
    const otp = process.env.NPM_OTP ?? (process.stdin.isTTY ? await askOtp(pkg.name) : '');
    const otpArgs = otp ? [`--otp=${otp}`] : [];
    run('npm', [...publishArgs, ...otpArgs], path.join(rootDir, packageDir));
  }
} finally {
  rl.close();
  await rm(npmrcDir, { recursive: true, force: true });
}

async function askOtp(packageName) {
  const value = await rl.question(`Enter npm OTP for ${packageName}: `);
  const otp = value.trim();
  if (!otp) {
    return '';
  }
  if (!/^\d{6}$/.test(otp)) {
    throw new Error(`OTP must be 6 digits, got ${JSON.stringify(otp)}`);
  }
  return otp;
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      NPM_CONFIG_CACHE: npmCacheDir
    }
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with status ${result.status}`);
  }
}
