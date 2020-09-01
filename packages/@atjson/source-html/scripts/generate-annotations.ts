import { readFileSync, writeFileSync } from "fs";
import * as path from "path";
import { format } from "prettier";
import { URL } from "url";
import { get, nextSection } from "./utils";
import { JSDOM } from "jsdom";

interface DOMDefinition {
  type: string;
  className: string;
  permalink: string;
  extends: string;
  section: string;
  attributes: string[];
}

async function defineHTMLInterface(document: Document, url: string) {
  // We use tuple pairs to define the default
  // global attributes interface, since that makes
  // it easier to generate the TypeScript file
  let list = document.querySelector("h4#global-attributes");
  let attributes: [string, string][] = [];
  if (list != null) {
    while (list.tagName !== "UL") list = list.nextElementSibling!;

    attributes = [...list.querySelectorAll("a")].map((anchor) => {
      return [anchor.textContent ?? "", "string"];
    });
  }
  attributes.push(["dataset", "{ [attribute: string]: string; }"]);

  writeFileSync(
    path.join(__dirname, "..", "src", "global-attributes.ts"),
    format(
      `
// ⚠️ Generated via script; modifications may be overridden

/**
 * Global HTML attributes for all HTML elements,
 * as defined in the [HTML Spec](${url}#global-attributes)
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
  const classNames = JSON.parse(
    readFileSync(path.join(__dirname, "class-names.json")).toString()
  );

  let html = await get("https://html.spec.whatwg.org/multipage/dom.html");
  let dom = new JSDOM(html);
  let document = dom.window.document;
  await defineHTMLInterface(
    document,
    "https://html.spec.whatwg.org/multipage/dom.html"
  );

  // Next section!
  let href = nextSection(document);
  html = await get(href);

  let definitions: DOMDefinition[] = [];

  while (true) {
    dom = new JSDOM(html);
    document = dom.window.document;
    let secNo = document.querySelector(".secno");
    let sectionNumber = secNo?.textContent ?? "4";
    if (!sectionNumber.match(/^4/)) break;

    let hasSections = document.querySelectorAll("h4").length > 0;
    if (!hasSections) {
      href = nextSection(document);
      html = await get(href);
      continue;
    }

    let url = new URL(href);

    // Grab all element definitions, and begin to
    // parse and create annotation definitions for each one
    let headings = document.querySelectorAll("h4");

    for (let heading of headings) {
      let isElementDefinition = heading.querySelector("dfn code");
      if (!isElementDefinition) continue;

      let id = heading.id;
      let section = (heading.textContent ?? "")
        .replace("\n", "")
        .replace(/\s{2,}/g, " ");

      // Multiple HTML elements are sometimes defined per section, like `sub` and `sup`.
      let types = [...heading.querySelectorAll("dfn code")].map(
        (node) => node.textContent ?? ""
      );

      // The content model is used to determine what kind of annotation
      // class we should use for the HTML element.
      let contentModel = "";

      let $contentModel = document.getElementById(id)!;
      while (!$contentModel.classList.contains("element")) {
        $contentModel = $contentModel.nextElementSibling as HTMLElement;
      }
      if ($contentModel != null) {
        contentModel =
          ($contentModel.querySelector(
            'a[href="dom.html#concept-element-content-model"]'
          )!.parentElement!.nextElementSibling as HTMLElement).textContent ??
          "";
      }

      let attributes: string[] = [];

      let dfn = $contentModel.querySelector(
        'a[href="dom.html#concept-element-attributes"]'
      )!.parentElement!.nextElementSibling!;
      while (dfn.tagName !== "DT") {
        let attr = dfn.querySelector("code a") as HTMLAnchorElement;
        if (
          attr &&
          !attr.textContent?.startsWith("on") &&
          attr.getAttribute("href")!.match(/#attr\-/)
        ) {
          let attributeName = attr.textContent ?? "";
          if (attributeName.indexOf("-") !== -1) {
            attributeName = `'${attributeName}'`;
          }
          attributes.push(attributeName);
        }
        dfn = dfn.nextElementSibling!;
      }

      types.forEach((type) => {
        if (definitions.find((dfn) => dfn.type === type)) return;
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
          attributes,
        });
      });
    }

    href = nextSection(document);
    html = await get(href);
  }

  definitions = definitions.sort((a, b) => {
    if (a.type < b.type) return -1;
    if (a.type > b.type) return 1;
    return 0;
  });

  // Generate definition
  definitions.forEach((dfn) => {
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
${dfn.attributes.map((attribute) => `  ${attribute}?: string;`).join("\n")}
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
${definitions.map((dfn) => `export * from "./${dfn.type}";`).join("\n")}
`
  );
})();
