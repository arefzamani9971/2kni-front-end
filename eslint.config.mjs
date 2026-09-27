// Root ESLint flat config: TypeScript, React hooks, a11y, Nx module boundaries and
// third-party isolation (every library is reached only through its adapter package).
import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import nextPlugin from '@next/eslint-plugin-next';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** Libraries that may only be imported inside the package that adapts them. */
const ISOLATED_LIBRARIES = [
  { name: '@tanstack/react-query', owner: '@dukani/data' },
  { name: 'react-hook-form', owner: '@dukani/forms' },
  { name: '@hookform/resolvers', owner: '@dukani/forms' },
  { name: 'zod', owner: '@dukani/forms' },
  { name: 'big.js', owner: '@dukani/domain' },
  { name: 'date-fns-jalali', owner: '@dukani/domain' },
  { name: 'idb', owner: '@dukani/platform' },
  { name: 'radix-ui', owner: '@dukani/ui-kit' },
  { name: 'vaul', owner: '@dukani/ui-kit' },
  { name: 'lucide-react', owner: '@dukani/ui-kit' },
  { name: 'leaflet', owner: '@dukani/ui-kit' },
  { name: 'react-leaflet', owner: '@dukani/ui-kit' },
  { name: 'msw', owner: '@dukani/testing' },
];

const restrictedImports = ISOLATED_LIBRARIES.map(({ name, owner }) => ({
  name,
  message: `Import ${name} only inside ${owner} (adapter). Use the ${owner} facade instead.`,
}));

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/storybook-static/**',
      '**/coverage/**',
      '**/generated/**',
      '**/public/mockServiceWorker.js',
      'docs/reference/**',
      '**/next-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { '@nx': nx, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Autofocus is used only on single-task screens (login, OTP, search sheets) where the first field is the task.
      'jsx-a11y/no-autofocus': 'off',
      'no-restricted-imports': ['error', { paths: restrictedImports }],
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: [],
          depConstraints: [
            { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['type:feature', 'type:ui-kit', 'type:shared'] },
            { sourceTag: 'type:feature', onlyDependOnLibsWithTags: ['type:ui-kit', 'type:shared'] },
            { sourceTag: 'type:ui-kit', onlyDependOnLibsWithTags: ['type:shared'] },
            { sourceTag: 'type:shared', onlyDependOnLibsWithTags: ['type:shared'] },
            { sourceTag: 'scope:seller', onlyDependOnLibsWithTags: ['scope:seller', 'scope:shared'] },
            { sourceTag: 'scope:customer', onlyDependOnLibsWithTags: ['scope:customer', 'scope:shared'] },
            { sourceTag: 'scope:landing', onlyDependOnLibsWithTags: ['scope:landing', 'scope:shared'] },
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
          ],
        },
      ],
    },
  },
  // Adapter packages may import the libraries they wrap.
  ...[...new Set(ISOLATED_LIBRARIES.map((l) => l.owner))].map((owner) => ({
    files: [`packages/shared/${owner.replace('@dukani/', '')}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: ISOLATED_LIBRARIES.filter((l) => l.owner !== owner).map((l) => restrictedImports.find((r) => r.name === l.name)) },
      ],
    },
  })),
  // Mock handlers live next to each feature and are loaded only in mock mode.
  {
    files: ['packages/features/*/src/mocks/**/*.{ts,tsx}', 'apps/*/src/mocks/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['apps/**/*.{ts,tsx}'],
    plugins: { '@next/next': nextPlugin },
    rules: { ...nextPlugin.configs.recommended.rules, ...nextPlugin.configs['core-web-vitals'].rules },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.stories.{ts,tsx}', '**/testing/**'],
    rules: { '@typescript-eslint/no-non-null-assertion': 'off', 'no-restricted-imports': 'off' },
  },
);
