import { Parser } from 'atjson-contenttype-markdown';

if (QUnit.isLocal) {
  const spec = require('commonmark-spec');

  const testModules = spec.tests.reduce((modules, test) => {
    if (!modules[test.section]) modules[test.section] = [];
    console.log('test section', test.section, test);
    modules[test.section].push(test);  
    return modules;
  }, {})

  Object.keys(testModules).forEach((module) => {
    console.log('module', module, testModules[module]);
    const moduleTests = testModules[module];

    QUnit.module(module);
    
    moduleTests.forEach(test => {
      QUnit.test(test.number, () => {
        let parser = new Parser(test.markdown);
        QUnit.assert.ok(parser.parse());
        QUnit.assert.equal(parser.parse(), test.html);
      });
    });
  });
}

export QUnit;
