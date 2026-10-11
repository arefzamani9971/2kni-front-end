import assert from 'node:assert/strict';
import test from 'node:test';
import tseslint from 'typescript-eslint';
import { analyzeStructure, MAX_LINES } from './structure.mjs';

const ui = 'packages/features/store/src/ui/components/';
const ids = (file, code) => {
  const { ast } = tseslint.parser.parseForESLint(code, {
    jsx: file.endsWith('.tsx'),
    range: true,
    loc: true,
  });
  return analyzeStructure(file, ast, code.split('\n').length).map((v) => v.id);
};

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
