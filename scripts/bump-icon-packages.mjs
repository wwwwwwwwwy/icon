import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const packagePaths = [
  'packages/core/package.json',
  'packages/react/package.json',
  'packages/vue/package.json'
];

function bumpPatch(version) {
  const parts = version.split('.').map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => !Number.isInteger(part) || part < 0)) {
    throw new Error(`Unsupported semver version: ${version}`);
  }
  parts[2] += 1;
  return parts.join('.');
}

async function readJson(filePath) {
  return JSON.parse(await readFile(path.join(rootDir, filePath), 'utf8'));
}

async function writeJson(filePath, value) {
  await writeFile(path.join(rootDir, filePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

const packages = await Promise.all(packagePaths.map(readJson));
const currentVersions = new Set(packages.map((pkg) => pkg.version));
if (currentVersions.size !== 1) {
  throw new Error(`Package versions must match before publishing: ${Array.from(currentVersions).join(', ')}`);
}

const nextVersion = bumpPatch(packages[0].version);

for (const [index, pkg] of packages.entries()) {
  pkg.version = nextVersion;
  if (pkg.dependencies?.['@meri-design/icon-core']) {
    pkg.dependencies['@meri-design/icon-core'] = `^${nextVersion}`;
  }
  await writeJson(packagePaths[index], pkg);
}

console.log(`Bumped icon packages to ${nextVersion}`);
