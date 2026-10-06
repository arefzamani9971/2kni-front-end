import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';
import { architecturePlugin, workspaceRoot } from './policy.mjs';

const eslint = new ESLint({
  cwd: workspaceRoot,
  overrideConfigFile: true,
  allowInlineConfig: false,
  overrideConfig: [
    {
      files: ['**/*.ts'],
      languageOptions: { parser: tseslint.parser },
      plugins: { architecture: architecturePlugin },
      rules: { 'architecture/boundaries': 'error' },
    },
  ],
});
const store = 'packages/features/store/src/';
const cases = [
  [
    'static template import',
    store + 'domain/example.ts',
    'const load = () => import(`../ui/screen`);',
    false,
  ],
  ['static template require', store + 'domain/example.ts', 'const value = require(`../ui/screen`);', false],
  ['domain inward violation', store + 'domain/example.ts', "import '../application/ports';", false],
  [
    'application inward violation',
    store + 'application/example.ts',
    "import '../infrastructure/repository';",
    false,
  ],
  ['infrastructure UI violation', store + 'infrastructure/example.ts', "import '../ui/screen';", false],
  ['UI infrastructure violation', store + 'ui/example.ts', "import '../infrastructure/repository';", false],
  ['self barrel', store + 'domain/example.ts', "import '@dukani/store';", false],
  ['relative self barrel', store + 'domain/example.ts', "import '../index';", false],
  ['domain framework', store + 'domain/example.ts', "import 'react';", false],
  [
    'application runtime platform',
    store + 'application/example.ts',
    "import { session } from '@dukani/platform';",
    false,
  ],
  [
    'application platform type',
    store + 'application/example.ts',
    "import type { Session } from '@dukani/platform';",
    true,
  ],
  ['domain shared model', store + 'domain/example.ts', "import type { Money } from '@dukani/domain';", true],
  ['application domain', store + 'application/example.ts', "import '../domain/model';", true],
  ['UI port', store + 'ui/example.ts', "import '../application/ports';", true],
  ['new DTO consumer', store + 'domain/example.ts', "import type { DTO } from '@dukani/contracts';", false],
  [
    'legacy DTO type',
    'packages/features/products/src/domain/product.ts',
    "import type { DTO } from '@dukani/contracts';",
    true,
  ],
  [
    'legacy inline type',
    'packages/features/products/src/domain/product.ts',
    "import { type DTO } from '@dukani/contracts';",
    true,
  ],
  [
    'legacy runtime DTO',
    'packages/features/products/src/domain/product.ts',
    "import { DTO } from '@dukani/contracts';",
    false,
  ],
  [
    'legacy mixed DTO',
    'packages/features/products/src/domain/product.ts',
    "import { type DTO, runtime } from '@dukani/contracts';",
    false,
  ],
  [
    'new file in legacy feature',
    'packages/features/products/src/domain/new.ts',
    "import type { DTO } from '@dukani/contracts';",
    false,
  ],
  ['type reexport', store + 'domain/example.ts', "export type { DTO } from '@dukani/contracts';", false],
  ['star reexport', store + 'domain/example.ts', "export * from '../ui/screen';", false],
  [
    'inline type reexport legacy',
    'packages/features/products/src/domain/product.ts',
    "export { type DTO } from '@dukani/contracts';",
    true,
  ],
  ['dynamic import', store + 'domain/example.ts', "const load = () => import('../ui/screen');", false],
  ['require', store + 'domain/example.ts', "const value = require('../ui/screen');", false],
  ['TS import type', store + 'domain/example.ts', "type DTO = import('@dukani/contracts').DTO;", false],
  ['TS import equals', store + 'domain/example.ts', "import lib = require('react');", false],
  ['adapter subpath', store + 'ui/example.ts', "import 'zod/v4';", false],
  ['adapter owner', 'packages/shared/forms/src/example.ts', "import 'zod/v4';", true],
  ['feature boundary', store + 'ui/example.ts', "import '@dukani/products';", false],
  ['test feature boundary', store + 'ui/example.test.ts', "import '@dukani/products';", false],
  ['test layer fixture', store + 'domain/example.test.ts', "import '../infrastructure/repository';", true],
  ['private package path', 'apps/seller/src/example.ts', "import '@dukani/store/src/domain/model';", false],
  ['public subpath', 'apps/seller/src/example.ts', "import '@dukani/app-core/server';", true],
  ['wrong app scope', 'apps/customer/src/example.ts', "import '@dukani/store';", false],
  ['cross package relative', store + 'domain/example.ts', "import '../../../products/src/index';", false],
  ['unknown workspace package', store + 'ui/example.ts', "import '@dukani/unknown';", false],
  ['shared reverse dependency', 'packages/shared/domain/src/example.ts', "import '@dukani/http';", false],
  ['shared correct dependency', 'packages/shared/http/src/example.ts', "import '@dukani/domain';", true],
  ['testing HTTP integration', 'packages/shared/testing/src/example.test.ts', "import '@dukani/http';", true],
  [
    'testing HTTP production forbidden',
    'packages/shared/testing/src/example.ts',
    "import '@dukani/http';",
    false,
  ],
  [
    'CI cannot be disabled inline',
    store + 'domain/example.ts',
    "/* eslint-disable architecture/boundaries */\nimport 'react';",
    false,
  ],
];

for (const [name, file, code, valid] of cases) {
  test(name, async () => {
    const [result] = await eslint.lintText(code, { filePath: path.join(workspaceRoot, file) });
    assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
    assert.equal(result.warningCount, 0, JSON.stringify(result.messages));
    assert.equal(result.errorCount, valid ? 0 : 1, JSON.stringify(result.messages));
    if (!valid) assert.equal(result.messages[0].ruleId, 'architecture/boundaries');
  });
}
