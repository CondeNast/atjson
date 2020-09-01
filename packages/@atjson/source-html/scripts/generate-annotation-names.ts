import { writeFileSync } from "fs";
import { join } from "path";
import { JSDOM } from "jsdom";
import { classify, get, nextSection } from "./utils";

(async () => {
  let html = await get("https://html.spec.whatwg.org/multipage/semantics.html");
  let names: { [tagName: string]: string } = {};

  while (true) {
    let dom = new JSDOM(html);
    let document = dom.window.document;
    let secNo = document.querySelector(".secno");
    let sectionNumber = secNo?.textContent ?? "4";
    if (!sectionNumber.match(/^4/)) break;

    let hasSections = document.querySelectorAll("h4").length > 0;
    if (!hasSections) {
      html = await get(nextSection(document));
      continue;
    }

    // Grab all element definitions, and begin to
    // parse and create annotation definitions for each one
    let headings = document.querySelectorAll("h4");

    for (let heading of headings) {
      let isElementDefinition = heading.querySelector("dfn code");
      if (!isElementDefinition) continue;

      let id = heading.id;

      // Multiple HTML elements are sometimes defined per section, like `sub` and `sup`.
      let types = [...heading.querySelectorAll("dfn code")].map(
        (node) => node.textContent ?? ""
      );

      // Find the Interface Definition Language class name for this element,
      // and use that if it's defined.
      let idlName: string | null;
      let idlElement = document.getElementById(id)!.nextElementSibling;
      let interfaceName = idlElement
        ? idlElement.querySelector("code.idl dfn c-")
        : null;
      if (interfaceName) {
        let domClassName = interfaceName.textContent ?? "";
        idlName = domClassName.replace(/^HTML(.*)Element$/, "$1");
      }
      idlName = null;

      types.forEach((type) => {
        names[type] = idlName || classify(type);
      });
    }

    // Next Section
    html = await get(nextSection(document));
  }

  writeFileSync(
    join(__dirname, "class-names-2.json"),
    JSON.stringify(names, null, 2)
  );
})();
