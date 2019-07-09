const puppeteer = require('puppeteer');
const HTMLSource = require('../dist/commonjs').default;
const OffsetSource = require('../../offset-annotations/dist/commonjs').default;
const CommonMarkRenderer = require('../../renderer-commonmark/dist/commonjs').default;
const { writeFileSync } = require('fs');

const GlobalAttributes = {
  accesskey: 'string',
  class: 'string',
  contenteditable: 'string',
  dir: 'string',
  draggable: 'string',
  hidden: 'boolean',
  id: 'string',
  lang: 'string',
  spellcheck: 'string',
  slot: 'string',
  tabindex: 'number',
  title: 'string',
  translate: 'string',
  dataset: 'any'
};

const AnnotationBaseClass = {
  'Nothing.': 'ObjectAnnotation',
  'Nothing': 'ObjectAnnotation',
  'Phrasing content.': 'InlineAnnotation'
};

const HumanFriendlyNames = {
  em: 'Emphasis',
  s: 'Strikethrough',
  q: 'Quote',
  dfn: 'Definition',
  abbr: 'Abbreviation',
  rb: 'Rb',
  rt: 'Rt',
  rtc: 'Rtc',
  rp: 'Rp',
  var: 'Variable',
  samp: 'Sample',
  kbd: 'Keyboard',
  sub: 'Subscript',
  sup: 'Superscript',
  i: 'Italic',
  b: 'Bold',
  u: 'Underline',
  bidi: 'BiDirectional',
  bdo: 'BiDirectionalOverride'
};

function classify(name) {
  return name[0].toUpperCase() + name.slice(1);
}

(async () => {
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();

  await page.goto('https://www.w3.org/TR/html5/semantics.html');
  page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i)
      console.log(`${i}: ${msg.args()[i]}`);
  });

  let definitions = [];

  while (true) {
    let hasSections = (await page.$$('h3')).length > 0;
    if (!hasSections) continue;

    let sectionNumber = await page.$eval('h3', heading => heading.dataset.level);
    let sectionName = await page.$eval('h3 .content', heading => heading.innerText);
    if (!sectionNumber.match(/^4/)) break;

    let url = new URL(page.url());

    // Grab all element definitions, and begin to
    // parse and create annotation definitions for each one
    let headings = await page.$$('h4');

    for (let heading of headings) {
      let isElementDefinition = await heading.$('dfn code');
      if (!isElementDefinition) continue;

      let id = await page.evaluate((heading) => heading.id, heading);

      // Multiple HTML elements are sometimes defined per section, like `sub` and `sup`.
      let types = await heading.$$eval('dfn code', nodes => nodes.map(node => node.innerText));

      // Find the Interface Definition Language class name for this element,
      // and use that if it's defined.
      let className = await page.evaluate(heading => {
        let element = document.getElementById(heading.id).nextElementSibling;
        let interfaceName = element.querySelector('.idl [data-dfn-type="interface"] code');
        if (interfaceName) {
          let domClassName = interfaceName.innerText;
          return domClassName.replace(/^HTML(.*)Element$/, '$1');
        }
      }, heading);

      // Pull in the comments from the HTML spec and fill in at the top of
      // the annotation file
      let comment = await page.evaluate((section) => {
        let heading = document.getElementById(section.id);
        let description = [];
        let paragraph = heading.nextElementSibling.nextElementSibling;
        while (paragraph && paragraph.tagName === 'P') {
          description.push(paragraph.outerHTML);
          paragraph = paragraph.nextSibling;
        }
        return description.join('');
      }, heading);

      // The content model is used to determine what kind of annotation
      // class we should use for the HTML element.
      let contentModel = await page.evaluate(heading => {
        let element = document.getElementById(heading.id).nextElementSibling;
        return element.querySelector('a[href="dom.html#content-model"]').parentElement.nextElementSibling.innerText;
      }, heading);
      console.log(contentModel);

      types.forEach(type => {
        definitions.push({
          type,
          className: HumanFriendlyNames[type] || className || classify(type),
          permalink: `https://${url.host}${url.pathname}#${id}`,
          extends: AnnotationBaseClass[contentModel] || 'BlockAnnotation',
          description: comment
        });
      });
    }

    await page.$eval('.prev_next a:last-child', link => link.click());
  }

  // Generate definition
  definitions.forEach(dfn => {
    writeFileSync(`${__dirname}/annotations/${dfn.type}.ts`,
`import { ${dfn.extends} } from '@atjson/document';

/**
 * [\`${dfn.type}\`](${dfn.permalink})
 *
 * ${
      CommonMarkRenderer.render(
        HTMLSource.fromRaw(dfn.description).convertTo(OffsetSource)
      ).trim()
       .split('\n')
       .map(line => line.trim())
       .join('\n * ')
    }
 */
export default class ${dfn.className} extends ${dfn.extends}<{}> {
  static vendorPrefix = 'html';
  static type = '${dfn.type}';
}
`);
  });
  browser.close();
})();
