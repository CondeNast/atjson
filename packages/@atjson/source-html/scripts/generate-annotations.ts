import { readFileSync, writeFileSync } from "fs";
import * as path from "path";
import { format } from "prettier";
import * as puppeteer from "puppeteer";
import { URL } from "url";

interface DOMDefinition {
  type: string;
  className: string;
  permalink: string;
  extends: string;
  section: string;
  attributes: string[];
}

async function defineHTMLInterface(page: puppeteer.Page) {
  // We use tuple pairs to define the default
  // global attributes interface, since that makes
  // it easier to generate the TypeScript file
  let attributes = await page.evaluate(() => {
    let list = document.querySelector("h4#global-attributes");
    if (list == null) return [];

    while (list.tagName !== "UL") list = list.nextElementSibling!;

    return Array.from(list.querySelectorAll("a")).map(anchor => {
      return [anchor.innerText, "string"];
    });
  });
  attributes.push(["dataset", "{ [attribute: string]: string; }"]);

  writeFileSync(
    path.join(__dirname, "..", "src", "global-attributes.ts"),
    format(
      `
// ⚠️ Generated via script; modifications may be overridden

/**
 * Global HTML attributes for all HTML elements,
 * as defined in the [HTML Spec](${page.url()}#global-attributes)
 */
export interface GlobalAttributes {
${attributes.map(([key, type]) => `  ${key}?: ${type};`).join("\n")}
}
`,
      { parser: "typescript" }
    )
  );
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const classNames = JSON.parse(
    readFileSync(path.join(__dirname, "class-names.json")).toString()
  );

  page.on("console", msg => {
    for (let i = 0; i < msg.args().length; ++i)
      console.log(`${i}: ${msg.args()[i]}`);
  });
  await page.goto("https://html.spec.whatwg.org/multipage/dom.html");
  await defineHTMLInterface(page);

  // Next section!
  await page.$eval("nav a:last-child", link =>
    (link as HTMLAnchorElement).click()
  );

  let definitions: DOMDefinition[] = [];

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

    let url = new URL(page.url());

    // Grab all element definitions, and begin to
    // parse and create annotation definitions for each one
    let headings = await page.$$("h4");

    for (let heading of headings) {
      let isElementDefinition = await heading.$("dfn code");
      if (!isElementDefinition) continue;

      let id = await page.evaluate(element => element.id, heading);
      let section = await page.evaluate(
        selector => document.getElementById(selector)!.innerText,
        id
      );

      // Multiple HTML elements are sometimes defined per section, like `sub` and `sup`.
      let types = await heading.$$eval("dfn code", nodes =>
        nodes.map(node => (node as HTMLElement).innerText)
      );

      // The content model is used to determine what kind of annotation
      // class we should use for the HTML element.
      let contentModel = await page.evaluate(elementId => {
        let element = document.getElementById(elementId)!;
        while (!element.classList.contains("element"))
          element = element.nextElementSibling as HTMLElement;
        if (element == null) return "";

        return (element.querySelector(
          'a[href="dom.html#concept-element-content-model"]'
        )!.parentElement!.nextElementSibling as HTMLElement).innerText;
      }, id);

      let attributes = await page.evaluate(elementId => {
        let element = document.getElementById(elementId)!;
        while (!element.classList.contains("element"))
          element = element.nextElementSibling as HTMLElement;

        let attrs = [];
        let dfn = element.querySelector(
          'a[href="dom.html#concept-element-attributes"]'
        )!.parentElement!.nextElementSibling!;
        while (dfn.tagName !== "DT") {
          let attr = dfn.querySelector("code a") as HTMLAnchorElement;
          if (
            attr &&
            !attr.innerText.startsWith("on") &&
            attr.getAttribute("href")!.match(/#attr\-/)
          ) {
            let attributeName = attr.innerText;
            if (attributeName.indexOf("-") !== -1) {
              attributeName = `'${attributeName}'`;
            }
            attrs.push(attributeName);
          }
          dfn = dfn.nextElementSibling!;
        }
        return attrs;
      }, id);

      types.forEach(type => {
        if (definitions.find(dfn => dfn.type === type)) return;
        definitions.push({
          type,
          className: classNames[type],
          permalink: `https://${url.host}${url.pathname}#${id}`,
          extends:
            type === "p"
              ? "BlockAnnotation"
              : contentModel.match(/Nothing/)
              ? "ObjectAnnotation"
              : contentModel.match(/Phrasing|Transparent/)
              ? "InlineAnnotation"
              : "BlockAnnotation",
          section,
          attributes
        });
      });
    }

    await page.$eval("nav a:last-child", link =>
      (link as HTMLAnchorElement).click()
    );
  }
  browser.close();

  definitions = definitions.sort((a, b) => {
    if (a.type < b.type) return -1;
    if (a.type > b.type) return 1;
    return 0;
  });

  // Generate definition
  definitions.forEach(dfn => {
    if (dfn.attributes.length) {
      writeFileSync(
        path.join(__dirname, "..", "src", "annotations", `${dfn.type}.ts`),
        format(
          `
// ⚠️ Generated via script; modifications may be overridden
import { ${dfn.extends} } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

// [§ ${dfn.section}](${dfn.permalink})
export class ${dfn.className} extends ${dfn.extends}<GlobalAttributes & {
${dfn.attributes.map(attribute => `  ${attribute}?: string;`).join("\n")}
}> {
  static vendorPrefix = "html";
  static type = "${dfn.type}";
}
`,
          { parser: "typescript" }
        )
      );
    } else {
      writeFileSync(
        path.join(__dirname, "..", "src", "annotations", `${dfn.type}.ts`),
        format(
          `
// ⚠️ Generated via script; modifications may be overridden
import { ${dfn.extends} } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

// [§ ${dfn.section}](${dfn.permalink})
export class ${dfn.className} extends ${dfn.extends}<GlobalAttributes> {
  static vendorPrefix = "html";
  static type = "${dfn.type}";${
            dfn.type === "p"
              ? `

  get rank() {
    return super.rank * 3 / 2;
  }`
              : ""
          }
}
`,
          { parser: "typescript" }
        )
      );
    }
  });

  writeFileSync(
    path.join(__dirname, "..", "src", "annotations", `index.ts`),
    `// ⚠️ Generated via script; modifications may be overridden
${definitions.map(dfn => `export * from "./${dfn.type}";`).join("\n")}
`
  );
})();
