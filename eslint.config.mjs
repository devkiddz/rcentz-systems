import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    'pending-routes/**',
    // Next.js generated output
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',

    // Prisma generated client
    'generated/**',
    'app/generated/**',

    // Tooling/reference files are not application source
    '.agents/**',
    '.claude/**',
    '.windsurf/**'
  ])
]);

export default eslintConfig;
