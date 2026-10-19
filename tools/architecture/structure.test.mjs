import assert from 'node:assert/strict';
import test from 'node:test';
import tseslint from 'typescript-eslint';
import { ESLint } from 'eslint';
import { architecturePlugin, workspaceRoot } from './policy.mjs';
import { analyzeStructure, analyzeUiImport, MAX_LINES } from './structure.mjs';

const ui = 'packages/features/store/src/ui/components/';
const pilot = 'packages/features/product-entry/src/ui/';
const ids = (file, code) => {
  const { ast } = tseslint.parser.parseForESLint(code, {
    jsx: file.endsWith('.tsx'),
    range: true,
    loc: true,
  });
  return analyzeStructure(file, ast, code.split('\n').length).map((v) => v.id);
};

test('pilot categories separate implementation, companions and tests', () => {
  assert.deepEqual(ids(pilot + 'review/components/Card.types.ts', 'export type Props = { a: string };'), [
    'ui-category',
  ]);
  assert.deepEqual(ids(pilot + 'review/hooks/use-card.ts', 'export { useCard } from "../other";'), [
    'ui-category',
  ]);
  assert.deepEqual(
    ids(pilot + 'review/components/Context.tsx', 'export const Context = createContext(null);'),
    ['ui-category'],
  );
  assert.deepEqual(
    ids(pilot + 'review/components/notice.tsx', 'export function notice() { return { body: <p /> }; }'),
    ['ui-category'],
  );
  assert.deepEqual(ids(pilot + 'review/components/Card.tsx', 'export const Card = memo(() => <p />);'), []);
  assert.deepEqual(ids(pilot + 'review/hooks/use-card.ts', 'export function useCard() { return null; }'), []);
  assert.deepEqual(ids(pilot + 'review/types/Card.types.ts', 'export type Props = { a: string };'), []);
  assert.deepEqual(ids(pilot + 'review/components/Card.test.tsx', 'test("card", () => {});'), [
    'ui-category',
  ]);
  assert.deepEqual(ids(pilot + 'review/tests/Card.test.tsx', 'test("card", () => {});'), []);
});

test('section dependencies allow own section and common, with no legacy exceptions', () => {
  const file = pilot + 'review/components/Card.tsx';
  assert.deepEqual(analyzeUiImport(file, '../hooks/use-card'), []);
  assert.deepEqual(analyzeUiImport(file, '../../common/types/use-entry-draft.types'), []);
  assert.equal(analyzeUiImport(file, '../../hooks/use-entry-draft')[0].id, 'ui-dependency');
  assert.equal(analyzeUiImport(file, '../../details/hooks/use-details')[0].id, 'ui-dependency');
  assert.equal(analyzeUiImport(file, '../../hooks/use-new-legacy')[0].id, 'ui-dependency');
  assert.equal(
    analyzeUiImport(pilot + 'common/hooks/use-shared.ts', '../../review/hooks/use-card')[0].id,
    'ui-dependency',
  );
  assert.deepEqual(analyzeUiImport(pilot + 'screens/Composition.tsx', '../review/screens/Card'), []);
});

test('all migrated sections enforce categories, i18n and test boundaries', () => {
  assert.deepEqual(ids(pilot + 'stock/hooks/use-stock.types.ts', 'export type Stock = string;'), [
    'ui-category',
  ]);
  assert.deepEqual(ids(pilot + 'components/Legacy.tsx', 'export function Legacy() { return null; }'), [
    'ui-category',
  ]);
  assert.deepEqual(ids(pilot + 'details/other/value.ts', 'export const value = 1;'), ['ui-category']);
  assert.deepEqual(ids(pilot + 'i18n/use-view.ts', 'export function useView() { return {}; }'), [
    'ui-category',
  ]);
  assert.deepEqual(
    ids(pilot + 'i18n/use-entry-translations.ts', 'export function useEntryTranslations() { return {}; }'),
    [],
  );
  assert.deepEqual(ids(pilot + 'tests/flow.test.ts', 'test("flow", () => {});'), []);
  assert.equal(
    analyzeUiImport(pilot + 'stock/components/Stock.tsx', '../../pricing/components/Price')[0].id,
    'ui-dependency',
  );
  assert.equal(
    analyzeUiImport(pilot + 'stock/components/Stock.tsx', '../tests/fixture')[0].id,
    'ui-dependency',
  );
  assert.equal(
    analyzeUiImport(pilot + 'i18n/catalogs.ts', '../common/state/entry-keys')[0].id,
    'ui-dependency',
  );
  assert.deepEqual(analyzeUiImport(pilot + 'tests/flow.test.ts', '../stock/components/Stock'), []);
});

test('section boundaries cover dynamic, require and type imports as well as exports', async () => {
  const eslint = new ESLint({
    cwd: workspaceRoot,
    overrideConfigFile: true,
    allowInlineConfig: false,
    overrideConfig: [
      {
        files: ['**/*.ts'],
        languageOptions: { parser: tseslint.parser },
        plugins: { architecture: architecturePlugin },
        rules: { 'architecture/file-structure': 'error' },
      },
    ],
  });
  for (const code of [
    'export * from "../../stock/state/value";',
    'const load = () => import(`../../stock/state/value`);',
    'const value = require("../../stock/state/value");',
    'type Value = import("../../stock/state/value").Value;',
    'import Value = require("../../stock/state/value");',
  ]) {
    const [result] = await eslint.lintText(code, { filePath: pilot + 'pricing/state/example.ts' });
    assert.ok(
      result.messages.some((message) => message.message.includes('pricing cannot depend on stock')),
      code,
    );
  }
});

test('one small component with its props inline is fine', () => {
  assert.deepEqual(
    ids(ui + 'Card.tsx', 'export function Card({ a }: { a: string }) { return <p>{a}</p>; }'),
    [],
  );
});
test('two components in one file are reported', () => {
  assert.deepEqual(
    ids(ui + 'Card.tsx', 'function Body() { return null; }\nexport function Card() { return <Body />; }'),
    ['components'],
  );
});
test('adaptive strategies count as components', () => {
  const code =
    'const Row = () => null;\nexport const Card = createAdaptive("Card", { mobile: Row, desktop: Row });';
  assert.deepEqual(ids(ui + 'Card.tsx', code), ['components']);
});
test('a type or constant beside a component is reported, a helper function is not', () => {
  assert.deepEqual(
    ids(ui + 'Card.tsx', 'type Props = { a: string };\nexport function Card(p: Props) { return null; }'),
    ['colocated-model'],
  );
  assert.deepEqual(ids(ui + 'Card.tsx', 'const TONE = { a: 1 };\nexport function Card() { return null; }'), [
    'colocated-model',
  ]);
  assert.deepEqual(
    ids(ui + 'Card.tsx', 'const label = (x: string) => x;\nexport function Card() { return null; }'),
    [],
  );
});
test('hooks are one per file and never beside a component', () => {
  const hooks = 'export function useA() { return 1; }\nexport function useB() { return 2; }';
  assert.deepEqual(ids('packages/features/store/src/ui/hooks/use-a.ts', hooks), ['hooks']);
  const mixed = 'function useA() { return 1; }\nexport function Card() { return useA(); }';
  assert.deepEqual(ids(ui + 'Card.tsx', mixed), ['hooks']);
});
test('size limits differ for components and plain modules', () => {
  const long = (n) => Array.from({ length: n }, (_, i) => `// ${i}`).join('\n');
  assert.deepEqual(ids(ui + 'Card.tsx', long(MAX_LINES.tsx + 1)), ['size']);
  assert.deepEqual(ids('packages/features/store/src/domain/rules.ts', long(MAX_LINES.tsx + 1)), []);
  assert.deepEqual(ids('packages/features/store/src/domain/rules.ts', long(MAX_LINES.ts + 1)), ['size']);
});
test('Next.js route exports, context factories, tests and files outside src are allowed', () => {
  const layout = 'export const metadata = {};\nexport default function Layout() { return null; }';
  assert.deepEqual(ids('apps/seller/src/app/layout.tsx', layout), []);
  const context = 'export const [StoreProvider, useStore] = createModuleContext("store");';
  assert.deepEqual(ids('packages/shared/platform/src/store.tsx', context), []);
  assert.deepEqual(ids(ui + 'Card.test.tsx', 'function A() {}\nfunction B() {}'), []);
  assert.deepEqual(ids('tools/scripts/flow.tsx', 'function A() {}\nfunction B() {}'), []);
});
