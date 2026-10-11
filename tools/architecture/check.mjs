import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';
import { architecturePlugin, workspaceRoot } from './policy.mjs';

// Deliberately independent of Nx project graphs, lint caches and the caller's working directory.
const eslint = new ESLint({
  cwd: workspaceRoot,
  allowInlineConfig: false,
  overrideConfigFile: true,
  overrideConfig: [
    {
      files: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/*/src/**/*.{ts,tsx}'],
      ignores: ['**/generated/**'],
      languageOptions: { parser: tseslint.parser },
      plugins: { architecture: architecturePlugin },
      rules: { 'architecture/boundaries': 'error', 'architecture/file-structure': 'error' },
    },
  ],
});
const results = await eslint.lintFiles(['apps/*/src/**/*.{ts,tsx}', 'packages/*/*/src/**/*.{ts,tsx}']);
const formatter = await eslint.loadFormatter('stylish');
const output = formatter.format(results);
if (output) console.log(output);
const failures = results.reduce((sum, r) => sum + r.errorCount + r.warningCount, 0);
console.log(`Architecture: ${results.length} files checked, ${failures} problems.`);
process.exitCode = failures ? 1 : 0;
