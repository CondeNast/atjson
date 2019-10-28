import { writeFileSync } from "fs";
import { join } from "path";
import * as puppeteer from "puppeteer";

function classify(name: string) {
  return name[0].toUpperCase() + name.slice(1);
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://html.spec.whatwg.org/multipage/semantics.html");

  let names: { [tagName: string]: string } = {};

  while (true) {
    let sectionNumber = await page.$$eval(".secno", elements => {
      return elements[0] ? (elements[0] as HTMLSpanElement).innerText : "4";
    });
    if (!sectionNumber.match(/^4/)) break;

    let hasSections = (await page.$$("h4")).length > 0;
    if (!hasSections) {
      await page.$eval("nav a:last-child", link =>
        (link as HTMLAnchorElement).click()
      );
    }

    // Grab all element definitions, and begin to
    // parse and create annotation definitions for each one
    let headings = await page.$$("h4");

    for (let heading of headings) {
      let isElementDefinition = await heading.$("dfn code");
      if (!isElementDefinition) continue;

      let id = await page.evaluate(element => element.id, heading);

      // Multiple HTML elements are sometimes defined per section, like `sub` and `sup`.
      let types = await heading.$$eval("dfn code", nodes =>
        nodes.map(node => (node as HTMLElement).innerText)
      );

      // Find the Interface Definition Language class name for this element,
      // and use that if it's defined.
      let idlName = await page.evaluate(elementId => {
        let element = document.getElementById(elementId)!.nextElementSibling;
        let interfaceName = element
          ? element.querySelector("code.idl dfn c-")
          : null;
        if (interfaceName) {
          let domClassName = (interfaceName as HTMLElement).innerText;
          return domClassName.replace(/^HTML(.*)Element$/, "$1");
        }
        return null;
      }, id);

      types.forEach(type => {
        names[type] = idlName || classify(type);
      });
    }

    // Next Section
    await page.$eval("nav a:last-child", link =>
      (link as HTMLAnchorElement).click()
    );
  }

  writeFileSync(
    join(__dirname, "class-names-2.json"),
    JSON.stringify(names, null, 2)
  );

  browser.close();
})();
