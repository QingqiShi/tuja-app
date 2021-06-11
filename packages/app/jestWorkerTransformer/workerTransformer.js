const fs = require('fs');
const path = require('path');

const importsRe = new RegExp(
  /import(?:["'\s]*([\w*{}\n, ]+)from\s*)?["'\s].*([@\w/_-]+)["'\s].*/,
  'mg'
);

const extractImports = (src) => {
  const imports = [];

  const match = src.match(importsRe);
  if (match) {
    src.match(importsRe).forEach((match) => {
      imports.push(match);
    });
  }

  const code = src.replace(importsRe, '');

  return { imports, code };
};

const transformer = {
  process: (sourceText, sourcePath, options) => {
    const babelJest = require('babel-jest');

    const { imports, code } = extractImports(sourceText);

    const workerSrc = fs.readFileSync(path.resolve(__dirname, 'template.ts'), {
      encoding: 'utf8',
      flag: 'r',
    });
    const injected = workerSrc
      .replace('/* {% WORKER_CODE %} */', code.replace(/\n/g, '\n    '))
      .replace('/* {% WORKER_IMPORTS %} */', imports.join('\n'));

    return babelJest.default
      .createTransformer()
      .process(injected, sourcePath, options);
  },
};

module.exports = transformer;
