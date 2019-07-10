const puppeteer = require('puppeteer');
const { writeFileSync } = require('fs');
const { join } = require('path');

function classify(name) {
  return name[0].toUpperCase() + name.slice(1);
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://html.spec.whatwg.org/multipage/semantics.html');

  let names = {};

  while (true) {
    let sectionNumber = await page.$$eval('.secno', elements => {
      return elements[0] ? elements[0].innerText : '4'
    });
    if (!sectionNumber.match(/^4/)) break;
    
    let hasSections = (await page.$$('h4')).length > 0;
    if (!hasSections) {
      await page.$eval('nav a:last-child', link => link.click());
    }

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
      let idlName = await page.evaluate(id => {
        let element = document.getElementById(id).nextElementSibling;
        let interfaceName = element.querySelector('code.idl dfn c-');
        if (interfaceName) {
          let domClassName = interfaceName.innerText;
          return domClassName.replace(/^HTML(.*)Element$/, '$1');
        }
      }, id);

      types.forEach(type => {
        names[type] = idlName || classify(type);
      });
    }

    // Next Section
    await page.$eval('nav a:last-child', link => link.click());
  }

  writeFileSync(join(__dirname, 'class-names.json'), JSON.stringify(
    names
  , null, 2));

  browser.close();
})();
