import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * File-structure policy (owner decision 2026-10-11): small units, one component / hook per file, and models or
 * constants never beside a component. Existing violations are listed in structure-debt.json; that list may only
 * shrink, and an entry that no longer applies must be removed.
 */
export const MAX_LINES = { tsx: 250, ts: 300 };
const here = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(here, '../..');
export const structureDebt = JSON.parse(readFileSync(path.join(here, 'structure-debt.json'), 'utf8'));

const slash = (p) => p.replaceAll('\\', '/');
const SOURCE = /^(apps\/[^/]+\/src|packages\/[^/]+\/[^/]+\/src)\//;
const EXCLUDED = /(\.(test|spec|stories)\.[cm]?[jt]sx?|\.d\.ts)$|\/(generated|stories)\//;
// Next.js reads these named exports from route files; they must stay beside the page/layout component.
const NEXT_ROUTE_EXPORTS = new Set([
  'metadata',
  'viewport',
  'dynamic',
  'dynamicParams',
  'revalidate',
  'runtime',
  'fetchCache',
  'preferredRegion',
  'maxDuration',
]);
const COMPONENT_FACTORIES = new Set(['createAdaptive', 'forwardRef', 'memo', 'lazy', 'dynamic']);

// Temporary dependencies of the review pilot. Remove each entry when its owner migrates.
const REVIEW_LEGACY_IMPORTS = new Set([
  'components/BackButton',
  'components/EntryShell',
  'components/MissingDraft',
  'components/EntryDraftRecovery',
  'components/EntryWorkflow',
  'hooks/use-entry-draft',
  'hooks/use-entry-nav',
  'hooks/entry-keys',
  'hooks/use-bulk-draft',
  'hooks/use-start-entry',
  'hooks/catalog-entry-units',
]);

export function analyzeUiImport(file, source) {
  const root = 'packages/features/product-entry/src/ui/';
  if (!file.startsWith(root) || !source.startsWith('.')) return [];
  const owner = file.slice(root.length).split('/')[0];
  if (!['review', 'common'].includes(owner)) return [];
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), source));
  if (!target.startsWith(root)) return []; // Existing layer rules handle non-UI dependencies.
  const local = target.slice(root.length).replace(/\.(tsx?|jsx?)$/, '');
  const section = local.split('/')[0];
  if (section === owner || section === 'common' || section === 'i18n') return [];
  if (owner === 'review' && REVIEW_LEGACY_IMPORTS.has(local)) return [];
  return [
    { id: 'ui-dependency', message: `${owner} cannot depend on ${local}; compose sections in ui/screens.` },
  ];
}

const isHook = (name) => /^use[A-Z0-9]/.test(name);
const isPascal = (name) => /^[A-Z]/.test(name);
const isFunction = (node) => node?.type === 'ArrowFunctionExpression' || node?.type === 'FunctionExpression';
const calleeName = (node) =>
  node?.type === 'CallExpression'
    ? node.callee.type === 'Identifier'
      ? node.callee.name
      : node.callee.property?.name
    : undefined;

/** Violations of one source file: ids from size | components | hooks | colocated-model, with a message each. */
export function analyzeStructure(relativePath, program, lineCount) {
  const file = slash(relativePath);
  if (
    /^packages\/features\/product-entry\/src\/ui\/(review|common)\//.test(file) &&
    /\.(test|spec)\.[jt]sx?$/.test(file) &&
    !file.includes('/tests/')
  )
    return [{ id: 'ui-category', message: 'Keep section tests in the tests category.' }];
  if (!SOURCE.test(file) || EXCLUDED.test(file)) return [];
  const tsx = file.endsWith('.tsx');
  const route = /^apps\/[^/]+\/src\/app\//.test(file);
  const components = [];
  const hooks = [];
  const models = [];
  const unit = (name, init) => {
    if (isHook(name) && isFunction(init)) hooks.push(name);
    else if (tsx && isPascal(name) && (isFunction(init) || COMPONENT_FACTORIES.has(calleeName(init))))
      components.push(name);
    else if (!isFunction(init) && !(route && NEXT_ROUTE_EXPORTS.has(name))) models.push(name);
  };
  for (const statement of program.body) {
    const node =
      statement.type === 'ExportNamedDeclaration' || statement.type === 'ExportDefaultDeclaration'
        ? (statement.declaration ?? statement)
        : statement;
    if (node.type === 'FunctionDeclaration') {
      const name = node.id?.name ?? (tsx ? 'default' : '');
      if (isHook(name)) hooks.push(name);
      else if (tsx && (isPascal(name) || name === 'default')) components.push(name);
    } else if (node.type === 'VariableDeclaration') {
      for (const d of node.declarations) {
        // `const [Provider, useThing] = createModuleContext()` is one factory call, not two hand-written units
        if (d.id.type === 'Identifier') unit(d.id.name, d.init);
      }
    } else if (
      ['TSTypeAliasDeclaration', 'TSInterfaceDeclaration', 'TSEnumDeclaration'].includes(node.type)
    ) {
      models.push(node.id.name);
    } else if (statement.type === 'ExportDefaultDeclaration' && tsx && isFunction(node)) {
      components.push('default');
    }
  }
  const found = [];
  // The approved pilot is scoped to review/common; legacy feature folders remain unchanged.
  const pilot = /^packages\/features\/product-entry\/src\/ui\/(review|common)\/([^/]+)\//.exec(file);
  if (pilot) {
    const category = pilot[2];
    if (
      ![
        'screens',
        'components',
        'hooks',
        'state',
        'presentation',
        'types',
        'constants',
        'schemas',
        'tests',
      ].includes(category)
    )
      found.push({ id: 'ui-category', message: 'Use an approved UI category inside the section.' });
    if (['components', 'screens'].includes(category) && (!components.length || hooks.length || models.length))
      found.push({
        id: 'ui-category',
        message:
          'This directory contains component implementations only; move companion files to their category.',
      });
    if (category === 'hooks' && (hooks.length !== 1 || components.length || models.length))
      found.push({ id: 'ui-category', message: 'This directory contains hook implementations only.' });
    if (
      category === 'types' &&
      program.body.some((statement) => {
        const node = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
        return (
          node &&
          ![
            'ImportDeclaration',
            'TSTypeAliasDeclaration',
            'TSInterfaceDeclaration',
            'EmptyStatement',
          ].includes(node.type)
        );
      })
    )
      found.push({ id: 'ui-category', message: 'The types category contains type declarations only.' });
  }
  const limit = tsx ? MAX_LINES.tsx : MAX_LINES.ts;
  if (lineCount > limit)
    found.push({ id: 'size', message: `${lineCount} lines (max ${limit}); split it by responsibility.` });
  if (components.length > 1)
    found.push({ id: 'components', message: `One component per file; found ${components.join(', ')}.` });
  if (hooks.length > 1 || (hooks.length && components.length))
    found.push({
      id: 'hooks',
      message: `One hook per file and never beside a component; found ${[...hooks, ...components].join(', ')}.`,
    });
  if (components.length && models.length)
    found.push({
      id: 'colocated-model',
      message: `Move ${models.join(', ')} out of the component file (X.types.ts / X.constants.ts / domain).`,
    });
  return found;
}

export const structureRule = {
  meta: { type: 'suggestion', schema: [], messages: { structure: '{{message}}' } },
  create(context) {
    return {
      'Program:exit'(program) {
        const file = slash(path.relative(workspaceRoot, context.filename));
        const allowed = new Set(structureDebt[file] ?? []);
        const found = analyzeStructure(file, program, context.sourceCode.lines.length);
        for (const statement of program.body) {
          if (typeof statement.source?.value === 'string')
            found.push(...analyzeUiImport(file, statement.source.value));
        }
        for (const violation of found)
          if (!allowed.has(violation.id))
            context.report({ node: program, messageId: 'structure', data: violation });
        const fixed = [...allowed].filter((id) => !found.some((violation) => violation.id === id));
        if (fixed.length)
          context.report({
            node: program,
            messageId: 'structure',
            data: {
              message: `Resolved structure debt (${fixed.join(', ')}): remove it from structure-debt.json.`,
            },
          });
      },
    };
  },
};
