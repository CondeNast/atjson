/* eslint-env node */

/**
 * Generates fixtures from proprietary content; this will
 * retain the shape of the content that was written, but
 * remove any identifiable text from it.
 */
import CommonmarkSource from "@atjson/source-commonmark";
import CommonmarkRenderer from "@atjson/renderer-commonmark";
import OffsetSource, { Link } from "@atjson/schema-offset";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import * as Chance from "chance";

const chance = new Chance();

const fixtures = readdirSync(join(__dirname, "proprietary")).map(filename => {
  return {
    filename,
    content: readFileSync(join(__dirname, "proprietary", filename)).toString()
  };
});

class ChanceRenderer extends CommonmarkRenderer {
  text(text: string) {
    let leadingWhitespace = text.match(/^(\s*[():.;,[\]_]*)/)![0];
    let trailingWhitespace = text
      .slice(leadingWhitespace.length)
      .match(/(\s*[():,;[\]_]*)$/)![0];
    let innerText = text.slice(
      leadingWhitespace.length,
      text.length - trailingWhitespace.length - leadingWhitespace.length
    );

    let content = "";
    let sentences = innerText.split(".");
    let words = innerText.split(" ");
    if (sentences.length > 1) {
      content = chance.paragraph({ sentences: sentences.length });
    } else if (words.length > 1) {
      content = chance.sentence({ words: words.length });
      // Remove full-stop
      content = content.slice(0, content.length - 1);
    } else if (innerText !== "") {
      content = chance.word();
    }

    return `${leadingWhitespace}${content}${trailingWhitespace}`;
  }
}

for (let fixture of fixtures) {
  let doc = CommonmarkSource.fromRaw(fixture.content).convertTo(OffsetSource);

  // Replace all link URLs with a different link
  doc.where({ type: "-offset-link" }).update((link: Link) => {
    let { url, ...attributes } = link.attributes;
    doc.replaceAnnotation(
      link,
      new Link({
        start: link.start,
        end: link.end,
        attributes: {
          url: chance.url(),
          ...attributes
        }
      })
    );
  });

  writeFileSync(
    join(__dirname, "fixtures", fixture.filename),
    ChanceRenderer.render(doc)
  );
}
