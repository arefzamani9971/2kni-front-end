import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { structureRule } from './structure.mjs';

export const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const slash = (p) => p.replaceAll('\\', '/');
const packages = ['apps', 'packages/features', 'packages/shared'].flatMap((folder) =>
  readdirSync(path.join(workspaceRoot, folder), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const root = path.join(workspaceRoot, folder, entry.name);
      const json = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
      const tags = json.nx?.tags ?? [];
      const type = tags.find((tag) => tag.startsWith('type:'))?.slice(5);
      const scope = tags.find((tag) => tag.startsWith('scope:'))?.slice(6);
      if (!type || !scope) throw new Error(`Architecture tags missing: ${json.name}`);
      return { root, name: json.name, type, scope, exports: Object.keys(json.exports ?? {}) };
    }),
);
const byName = new Map(packages.map((p) => [p.name, p]));
const ownerOf = (file) => packages.find((p) => file === p.root || file.startsWith(p.root + path.sep));

// Explicit dependency directions. A new shared package requires an intentional policy decision.
const sharedDependencies = {
  contracts: [],
  'design-tokens': [],
  domain: [],
  i18n: [],
  routes: [],
  data: ['domain'],
  forms: ['domain', 'i18n'],
  http: ['contracts', 'domain'],
  platform: ['contracts', 'domain', 'http'],
  testing: ['contracts', 'domain'],
  'ui-kit': ['design-tokens', 'domain', 'i18n'],
  'app-core': ['contracts', 'domain', 'http', 'platform', 'testing'],
};

export const isolatedLibraries = [
  ['next-intl', 'i18n'],
  ['use-intl', 'i18n'],
  ['@tanstack/react-query', 'data'],
  ['react-hook-form', 'forms'],
  ['@hookform/resolvers', 'forms'],
  ['zod', 'forms'],
  ['big.js', 'domain'],
  ['date-fns-jalali', 'domain'],
  ['idb', 'platform'],
  ['radix-ui', 'ui-kit'],
  ['vaul', 'ui-kit'],
  ['lucide-react', 'ui-kit'],
  ['leaflet', 'ui-kit'],
  ['react-leaflet', 'ui-kit'],
  ['msw', 'testing'],
];

// Existing migration debt only; do not allow a whole feature to add new DTO consumers.
export const legacyContractFiles = new Set(
  [
    'product-entry/src/application/ports.ts',
    'product-entry/src/domain/entry-draft.ts',
    'product-entry/src/domain/entry-draft.types.ts',
    'products/src/application/ports.ts',
    'products/src/domain/product.constants.ts',
    'products/src/domain/product.ts',
    'purchasing/src/application/ports.ts',
    'purchasing/src/domain/purchase.constants.ts',
    'purchasing/src/domain/purchase.ts',
    'purchasing/src/domain/purchase.types.ts',
    'reports/src/application/ports.ts',
  ].map((p) => `packages/features/${p}`),
);

const layerOf = (owner, file) => slash(path.relative(owner.root, file)).split('/')[1];
const isTest = (file) => /\.(test|spec|stories)\.[cm]?[jt]sx?$/.test(file);

/** Returns one actionable violation, or null. Independent of Nx daemon/cache and current cwd. */
export function checkImport(filename, specifier, { typeOnly = false } = {}) {
  const file = path.resolve(filename);
  const owner = ownerOf(file);
  if (!owner) return null;
  const test = isTest(file);
  const sourceLayer = layerOf(owner, file);
  const relative = specifier.startsWith('.');
  const targetFile = relative ? path.resolve(path.dirname(file), specifier) : null;
  const packageName = specifier.startsWith('@dukani/') ? specifier.split('/').slice(0, 2).join('/') : null;
  const target = relative ? ownerOf(targetFile) : byName.get(packageName);
  const sourcePath = slash(path.relative(workspaceRoot, file));

  if (packageName && !target) return `Unknown workspace package ${packageName}.`;
  if (relative && target !== owner)
    return 'Cross-package relative imports are forbidden; use the public package export.';
  if (target && !relative) {
    const subpath = specifier === packageName ? '.' : `.${specifier.slice(packageName.length)}`;
    if (!target.exports.includes(subpath))
      return `Use a declared public export of ${target.name}; ${subpath} is private.`;
  }
  if (target && target !== owner) {
    const allowedTypes = {
      app: ['feature', 'ui-kit', 'shared'],
      feature: ['ui-kit', 'shared'],
      'ui-kit': ['shared'],
      shared: ['shared'],
    };
    if (!allowedTypes[owner.type]?.includes(target.type))
      return `${owner.type} cannot depend on ${target.type} (${target.name}).`;
    if (target.scope !== 'shared' && target.scope !== owner.scope)
      return `${owner.scope} cannot depend on scope ${target.scope}.`;
    if (owner.type === 'shared' || owner.type === 'ui-kit') {
      const allowed = sharedDependencies[owner.name.slice('@dukani/'.length)];
      if (!allowed) return `Declare the dependency direction for ${owner.name} in architecture/policy.mjs.`;
      const testDependency =
        test &&
        (target.name === '@dukani/testing' ||
          (owner.name === '@dukani/testing' && target.name === '@dukani/http'));
      if (!testDependency && !allowed.includes(target.name.slice('@dukani/'.length)))
        return `${owner.name} cannot depend on ${target.name}; this reverses the shared dependency policy.`;
    }
  }
  // Test fixtures may exercise multiple layers, but never cross feature/package boundaries above.
  if (test) return null;
  const isolated = isolatedLibraries.find(([lib]) => specifier === lib || specifier.startsWith(lib + '/'));
  if (isolated && owner.name !== `@dukani/${isolated[1]}`)
    return `Import ${isolated[0]} only inside @dukani/${isolated[1]}, including its subpaths.`;

  if (owner.type !== 'feature') return null;
  if (target === owner) {
    const targetLayer = relative ? layerOf(owner, targetFile) : 'index';
    const allowedLayers = {
      domain: ['domain'],
      application: ['domain', 'application'],
      infrastructure: ['domain', 'application', 'infrastructure'],
    };
    if (allowedLayers[sourceLayer] && !allowedLayers[sourceLayer].includes(targetLayer))
      return `${sourceLayer} cannot import ${targetLayer}; depend inward, not on UI or the module barrel.`;
    if (sourceLayer === 'ui' && targetLayer === 'infrastructure')
      return 'UI must call the feature port/module, not its infrastructure implementation.';
  }
  if (sourceLayer === 'domain' || sourceLayer === 'application') {
    if (specifier === '@dukani/contracts' && typeOnly && legacyContractFiles.has(sourcePath)) return null;
    if (target && target !== owner) {
      if (target.name === '@dukani/domain') return null;
      if (sourceLayer === 'application' && target.name === '@dukani/platform' && typeOnly) return null;
      return `${sourceLayer} must use feature-owned models/ports, not ${target.name}.`;
    }
    if (!relative && !target)
      return `${sourceLayer} must not import framework/transport libraries (${specifier}).`;
  }
  return null;
}

export const architecturePlugin = {
  rules: {
    'file-structure': structureRule,
    boundaries: {
      meta: { type: 'problem', schema: [], messages: { boundary: '{{reason}}' } },
      create(context) {
        const visit = (node, source, typeOnly = false) => {
          const specifier =
            source?.type === 'TemplateLiteral' && source.expressions.length === 0
              ? source.quasis[0]?.value.cooked
              : source?.value;
          if (typeof specifier !== 'string') return;
          const reason = checkImport(context.filename, specifier, { typeOnly });
          if (reason) context.report({ node, messageId: 'boundary', data: { reason } });
        };
        return {
          ImportDeclaration: (node) =>
            visit(
              node,
              node.source,
              node.importKind === 'type' ||
                (node.specifiers.length > 0 && node.specifiers.every((s) => s.importKind === 'type')),
            ),
          ExportNamedDeclaration: (node) =>
            visit(
              node,
              node.source,
              node.exportKind === 'type' ||
                (node.specifiers.length > 0 && node.specifiers.every((s) => s.exportKind === 'type')),
            ),
          ExportAllDeclaration: (node) => visit(node, node.source, node.exportKind === 'type'),
          ImportExpression: (node) => visit(node, node.source),
          CallExpression: (node) => {
            if (node.callee.type === 'Identifier' && node.callee.name === 'require')
              visit(node, node.arguments[0]);
          },
          TSImportType: (node) => {
            const source = node.argument ?? node.parameter;
            visit(node, source?.literal ?? source, true);
          },
          TSImportEqualsDeclaration: (node) =>
            visit(node, node.moduleReference.expression, node.importKind === 'type'),
        };
      },
    },
  },
};
