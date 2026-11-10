const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const filename = path.resolve(__dirname, '../../src/features/language/i18n.ts');
const loaded = new Module(filename, module);
loaded.paths = module.paths;
loaded.require = name => name.startsWith('.') ? require(path.resolve(path.dirname(filename), name)) : require(name);
loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);
const language = loaded.exports;
const reactI18next = require('react-i18next');
module.exports = {
  language,
  // Existing component tests have no application root; use the real bundled instance.
  react: { ...reactI18next, useTranslation: (ns, options) => reactI18next.useTranslation(ns, { ...options, i18n: language.i18n }) },
};
