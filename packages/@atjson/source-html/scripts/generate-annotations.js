const puppeteer = require('puppeteer');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

async function defineHTMLInterface(page) {
  // We use tuple pairs to define the default
  // global attributes interface, since that makes
  // it easier to generate the TypeScript file
  let attributes = await page.evaluate(() => {
    let list = document.querySelector('h4#global-attributes');
    while (list.tagName !== 'UL') list = list.nextElementSibling;

    return Array.from(list.querySelectorAll('a')).map(anchor => {
      return [anchor.innerText, 'string'];
    });
  });
  attributes.push(
    ['dataset', 'any']
  );

  writeFileSync(join(__dirname, '..', 'src', 'annotations', 'global-attributes.ts'),
`// ⚠️ Generated via script; modifications may be overridden

/**
 * Global HTML attributes for all HTML elements,
 * as defined in the [HTML Spec](${page.url()}#global-attributes)
 */
export default interface GlobalAttributes {
${
  attributes.map(([key, type]) => `  ${key}?: ${type};`).join('\n')
}
}
`);
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const classNames = JSON.parse(readFileSync(join(__dirname, 'class-names.json')).toString());

  page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i)
      console.log(`${i}: ${msg.args()[i]}`);
  });
  await page.goto('https://html.spec.whatwg.org/multipage/dom.html');
  await defineHTMLInterface(page);

  // Next section!
  await page.$eval('nav a:last-child', link => link.click());

  let definitions = [];

  while (true) {
    let sectionNumber = await page.$$eval('.secno', elements => {
      return elements[0] ? elements[0].innerText : '4'
    });
    if (!sectionNumber.match(/^4/)) break;
    
    let hasSections = (await page.$$('h4')).length > 0;
    if (!hasSections) {
      await page.$eval('nav a:last-child', link => link.click());
    }

    let url = new URL(page.url());

    // Grab all element definitions, and begin to
    // parse and create annotation definitions for each one
    let headings = await page.$$('h4');

    for (let heading of headings) {
      let isElementDefinition = await heading.$('dfn code');
      if (!isElementDefinition) continue;

      let id = await page.evaluate((heading) => heading.id, heading);
      let section = await page.evaluate((id) => document.getElementById(id).innerText, id);

      // Multiple HTML elements are sometimes defined per section, like `sub` and `sup`.
      let types = await heading.$$eval('dfn code', nodes => nodes.map(node => node.innerText));

      // The content model is used to determine what kind of annotation
      // class we should use for the HTML element.
      let contentModel = await page.evaluate(id => {
        let element = document.getElementById(id);
        while (!element.classList.contains('element')) element = element.nextElementSibling;
        return element.querySelector('a[href="dom.html#concept-element-content-model"]').parentElement.nextElementSibling.innerText;
      }, id);

      let attributes = await page.evaluate(id => {
        let element = document.getElementById(id);
        while (!element.classList.contains('element')) element = element.nextElementSibling;

        let attributes = [];
        let dfn = element.querySelector('a[href="dom.html#concept-element-attributes"]').parentElement.nextElementSibling;
        while (dfn.tagName !== 'DT') {
          let attr = dfn.querySelector('code a');
          if (attr && !attr.innerText.startsWith('on') && attr.getAttribute('href').match(/#attr\-/)) {
            let attributeName = attr.innerText;
            if (attributeName.indexOf('-') !== -1) {
              attributeName = `'${attributeName}'`;
            }
            attributes.push(attributeName);
          }
          dfn = dfn.nextElementSibling;
        }
        return attributes;
      }, id);

      types.forEach(type => {
        if (definitions.find(dfn => dfn.type === type)) return;
        definitions.push({
          type,
          className: classNames[type],
          permalink: `https://${url.host}${url.pathname}#${id}`,
          extends: (
            contentModel.match(/Nothing/) ? 'ObjectAnnotation' :
            contentModel.match(/Phrasing content/) ? 'InlineAnnotation' : 'BlockAnnotation'
          ),
          section,
          attributes
        });
      });
    }

    await page.$eval('nav a:last-child', link => link.click());
  }
  browser.close();

  definitions = definitions.sort((a, b) => {
    if (a.type < b.type) return -1;
    if (a.type > b.type) return 1;
    return 0
  });

  // Generate definition
  definitions.forEach(dfn => {
    if (dfn.attributes.length) {
      writeFileSync(join(__dirname, '..', 'src', 'annotations', `${dfn.type}.ts`),
`// ⚠️ Generated via script; modifications may be overridden
import { ${dfn.extends} } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ ${dfn.section}](${dfn.permalink})
export default class ${dfn.className} extends ${dfn.extends}<GlobalAttributes & {
${
  dfn.attributes.map(attribute => (
    `  ${attribute}?: string;`
  )).join('\n')
}
}> {
  static vendorPrefix = 'html';
  static type = '${dfn.type}';
}
`);
    } else {
      writeFileSync(join(__dirname, '..', 'src', 'annotations', `${dfn.type}.ts`),
`// ⚠️ Generated via script; modifications may be overridden
import { ${dfn.extends} } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ ${dfn.section}](${dfn.permalink})
export default class ${dfn.className} extends ${dfn.extends}<GlobalAttributes> {
  static vendorPrefix = 'html';
  static type = '${dfn.type}';
}
`);
    }
  });

  writeFileSync(join(__dirname, '..', 'src', 'annotations', `index.ts`),
`// ⚠️ Generated via script; modifications may be overridden
${definitions.map(dfn => `import { default as ${dfn.className} } from './${dfn.type}';`).join('\n')}

${definitions.map(dfn => `export { ${dfn.className} };`).join('\n')}
export default [
  ${definitions.map(dfn => dfn.className).join(',\n  ')}
];
`);
})();
