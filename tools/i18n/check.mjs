import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const letters = /[\u0621-\u063a\u0641-\u064a\u067e\u0686\u0698\u06a9\u06af\u06cc]/u;
const counts = new Map();
/** Persian text that is data rather than translatable copy; each entry carries its reason. */
const ALLOWED = [
  ['packages/shared/testing/', 'mock backend: server wording and Persian fixture data'],
  [
    'packages/shared/app-core/src/server/',
    'BFF ProblemDetails wording (server side; the UI translates by code)',
  ],
  ['packages/shared/domain/src/text/normalize.ts', 'ی/ک normalization characters'],
  ['packages/shared/domain/src/date/jalali.constants.ts', 'Jalali calendar names for the Persian formatter'],
];
let problems = 0;
const flatten = (object, prefix = '') =>
  Object.entries(object).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? flatten(value, `${prefix}${key}.`)
      : [[`${prefix}${key}`, value]],
  );

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next', 'dist', 'coverage'].includes(entry.name)) visit(file);
      continue;
    }
    if (entry.name === 'fa.json' && file.includes(`${path.sep}i18n${path.sep}`)) {
      const english = path.join(directory, 'en.json');
      const fa = flatten(JSON.parse(fs.readFileSync(file, 'utf8')));
      const en = fs.existsSync(english) ? flatten(JSON.parse(fs.readFileSync(english, 'utf8'))) : [];
      if (JSON.stringify(fa.map(([key]) => key).sort()) !== JSON.stringify(en.map(([key]) => key).sort())) {
        console.error(`Catalog keys differ: ${path.relative(root, directory)}`);
        problems++;
      }
      for (const [key, value] of en) {
        if (typeof value !== 'string' || letters.test(value)) {
          console.error(`Invalid English message: ${path.relative(root, english)}:${key}`);
          problems++;
        }
      }
    }
    if (!/\.tsx?$/.test(file) || /\.(test|stories|types)\.tsx?$/.test(file)) continue;
    const relative = path.relative(root, file).replaceAll('\\', '/');
    if (relative.includes('/stories/') || relative.includes('/.storybook/')) continue;
    // every layer is scanned: domain, application and infrastructure return codes and data, never user copy
    if (ALLOWED.some(([prefix]) => relative.startsWith(prefix))) continue;
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    let count = 0;
    function scan(node) {
      if (
        (ts.isStringLiteral(node) ||
          ts.isJsxText(node) ||
          ts.isNoSubstitutionTemplateLiteral(node) ||
          ts.isTemplateHead(node) ||
          ts.isTemplateMiddle(node) ||
          ts.isTemplateTail(node)) &&
        letters.test(node.text)
      )
        count++;
      ts.forEachChild(node, scan);
    }
    scan(source);
    if (count) {
      const owner = relative.startsWith('apps/')
        ? relative.split('/').slice(0, 2).join('/')
        : relative.split('/').slice(0, 3).join('/');
      counts.set(owner, (counts.get(owner) ?? 0) + count);
      {
        console.error(`Inline copy: ${relative} (${count})`);
        problems++;
      }
    }
  }
}
visit(path.join(root, 'apps'));
visit(path.join(root, 'packages'));
for (const [owner, count] of counts) console.log(`Remaining inline copy: ${owner}: ${count}`);
console.log(
  `i18n: ${problems} problems. Comments, tests, digit patterns and user data are not translation copy.`,
);
process.exitCode = problems ? 1 : 0;
