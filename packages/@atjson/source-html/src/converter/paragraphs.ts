import Document from "@atjson/document";
import { Paragraph } from "@atjson/offset-annotations";
import { parseCSS, toAlignment } from "./utils";

export default function (doc: Document) {
  doc
    .where({ type: "-html-p" })
    .as("paragraph")
    .outerJoin(
      doc
        .where((annotation) => annotation.attributes.lang != null)
        .as("languages"),
      (heading, language) =>
        heading.start >= language.start && heading.end <= language.end
    )
    .update(({ paragraph, languages }) => {
      let lang = languages.sort((language) => language.end - language.start)[0];

      doc.replaceAnnotation(
        paragraph,
        new Paragraph({
          start: paragraph.start,
          end: paragraph.end,
          attributes: {
            alignment: toAlignment(
              parseCSS(paragraph.attributes.style)["text-align"],
              lang?.attributes?.lang
            ),
          },
        })
      );
    });
}
