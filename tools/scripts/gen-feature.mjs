// Scaffolds a feature package with the standard layers.
// Usage: pnpm gen:feature <name> [--scope seller|customer|landing|shared]
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith('--'));
const scope = args[args.indexOf('--scope') + 1] ?? 'seller';
if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('usage: pnpm gen:feature <kebab-name> [--scope seller|customer|landing|shared]');
  process.exit(1);
}
if (!['seller', 'customer', 'landing', 'shared'].includes(scope)) throw new Error(`unknown scope ${scope}`);

const root = join('packages/features', name);
if (existsSync(root)) throw new Error(`${root} already exists`);
const pascal = name.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);

const files = {
  'package.json': JSON.stringify(
    {
      name: `@dukani/${name}`,
      version: '0.0.0',
      private: true,
      type: 'module',
      sideEffects: false,
      exports: { '.': './src/index.ts' },
      nx: { tags: ['type:feature', `scope:${scope}`] },
      scripts: { lint: 'eslint src', typecheck: 'tsc -p tsconfig.json', test: 'vitest run' },
      dependencies: {
        '@dukani/contracts': 'workspace:*',
        '@dukani/data': 'workspace:*',
        '@dukani/domain': 'workspace:*',
        '@dukani/forms': 'workspace:*',
        '@dukani/http': 'workspace:*',
        '@dukani/platform': 'workspace:*',
        '@dukani/routes': 'workspace:*',
        '@dukani/ui-kit': 'workspace:*',
      },
      peerDependencies: { react: '^19' },
      devDependencies: { '@dukani/testing': 'workspace:*' },
    },
    null,
    2,
  ) + '\n',
  'tsconfig.json': JSON.stringify({ extends: '../../../tsconfig.base.json', compilerOptions: { types: ['vitest/globals', 'node'] }, include: ['src', '../../../tools/test'] }, null, 2) + '\n',
  'vitest.config.ts': `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'jsdom', globals: true, include: ['src/**/*.test.{ts,tsx}'], setupFiles: ['../../../tools/test/setup-dom.ts'] },
});
`,
  'README.md': `# Feature: ${name}

| | |
|---|---|
| Scope | \`scope:${scope}\` |
| Figma | — |
| جریان | — |
| Endpoints | — |

## قواعد

- …
`,
  'src/domain/.gitkeep': '',
  'src/application/ports.ts': `/** Ports of the ${name} feature (one method per backend capability). */
export type ${pascal}Repository = Record<string, never>;
`,
  'src/infrastructure/http-repository.ts': `import type { Api } from '@dukani/http';
import type { ${pascal}Repository } from '../application/ports';

export const createHttp${pascal}Repository = (_api: Api): ${pascal}Repository => ({});
`,
  'src/module.ts': `import type { Api } from '@dukani/http';
import { createModuleContext } from '@dukani/platform';
import type { ${pascal}Repository } from './application/ports';
import { createHttp${pascal}Repository } from './infrastructure/http-repository';

export type ${pascal}Module = { readonly ${camel}: ${pascal}Repository };

export const create${pascal}Module = (deps: { api: Api }): ${pascal}Module => ({ ${camel}: createHttp${pascal}Repository(deps.api) });

export const [${pascal}ModuleProvider, use${pascal}Module] = createModuleContext<${pascal}Module>('${name}');
`,
  'src/ui/screens/.gitkeep': '',
  'src/index.ts': `export { create${pascal}Module, ${pascal}ModuleProvider, use${pascal}Module, type ${pascal}Module } from './module';
`,
};

for (const [rel, content] of Object.entries(files)) {
  const path = join(root, rel);
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, content);
}
console.log(`created ${root}\nnext: pnpm install, add the module to the app composition root and its Provider to providers.tsx`);
