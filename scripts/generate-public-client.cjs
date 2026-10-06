const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const packageFile = path.resolve('node_modules/prisma/package.json');
const prismaPackage = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
const cliRelative = typeof prismaPackage.bin === 'string'
  ? prismaPackage.bin
  : prismaPackage.bin.prisma;

const cliFile = path.resolve(path.dirname(packageFile), cliRelative);

if (!fs.existsSync(cliFile)) {
  throw new Error('Prisma CLI file was not found: ' + cliFile);
}

const result = spawnSync(process.execPath, [cliFile, 'generate'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DIRECT_URL: process.env.DIRECT_URL ||
      'postgresql://build:build@localhost:5432/build_only',
  },
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
