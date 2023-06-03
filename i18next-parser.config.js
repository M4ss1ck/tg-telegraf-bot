export default {
  input: ['./src/**/*.ts'], // Add the paths to your project's source files
  //   output: './locales/{{lng}}.json', // Define the output location for your translation files
  locales: ['en', 'es'], // Define the languages you want to support
  namespace: 'translation', // Define the namespace for your translation files
  keySeparator: '.', // Define the separator used in your translation keys
  ignore: ['**/node_modules/**'], // Define any files or directories that should be ignored
  defaultValue: (lng, ns, key) => `__${lng}:${ns}:${key}__`, // Define the default value for missing translations

  contextSeparator: '_',
  // Key separator used in your translation keys

  createOldCatalogs: true,
  // Save the \_old files

  defaultNamespace: 'translation',
  // Default namespace used in your i18next config

  //   defaultValue: '',
  // Default value to give to keys with no value
  // You may also specify a function accepting the locale, namespace, key, and value as arguments

  indentation: 2,
  // Indentation of the catalog files

  keepRemoved: false,
  // Keep keys from the catalog that are no longer in code

  //   keySeparator: '.',
  // Key separator used in your translation keys
  // If you want to use plain english keys, separators such as `.` and `:` will conflict. You might want to set `keySeparator: false` and `namespaceSeparator: false`. That way, `t('Status: Loading...')` will not think that there are a namespace and three separator dots for instance.

  // see below for more details
  lexers: {
    // hbs: ['HandlebarsLexer'],
    // handlebars: ['HandlebarsLexer'],

    // htm: ['HTMLLexer'],
    // html: ['HTMLLexer'],

    // mjs: ['JavascriptLexer'],
    js: [{
      lexer: 'JavascriptLexer',
      functions: ['ctx.t', 'ctx.i18next.t'],
    }], // if you're writing jsx inside .js files, change this to JsxLexer
    ts: [{
      lexer: 'JavascriptLexer',
      functions: ['ctx.t', 'ctx.i18next.t'],
    }],
    // jsx: ['JsxLexer'],
    // tsx: ['JsxLexer'],

    default: ['JavascriptLexer'],
  },

  lineEnding: 'auto',
  // Control the line ending. See options at https://github.com/ryanve/eol

  //   locales: ['en', 'fr'],
  // An array of the locales in your applications

  namespaceSeparator: ':',
  // Namespace separator used in your translation keys
  // If you want to use plain english keys, separators such as `.` and `:` will conflict. You might want to set `keySeparator: false` and `namespaceSeparator: false`. That way, `t('Status: Loading...')` will not think that there are a namespace and three separator dots for instance.

  output: 'locales/$LOCALE.json',
  // Supports $LOCALE and $NAMESPACE injection
  // Supports JSON (.json) and YAML (.yml) file formats
  // Where to write the locale files relative to process.cwd()

  pluralSeparator: '_',
  // Plural separator used in your translation keys
  // If you want to use plain english keys, separators such as `_` might conflict. You might want to set `pluralSeparator` to a different string that does not occur in your keys.

  //   input: undefined,
  // An array of globs that describe where to look for source files
  // relative to the location of the configuration file

  sort: false,
}
