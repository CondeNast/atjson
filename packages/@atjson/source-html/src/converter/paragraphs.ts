import Document from "@atjson/document";
import { Paragraph } from "@atjson/offset-annotations";
import { parseCSS, toAlignment } from "./utils";

export default function (doc: Document) {
  doc
    .where({ type: "-html-p" })
    .as("paragraph")
    .outerJoin(
      doc
        .where((annotation) => annotation.attributes.dir != null)
        .as("directions"),
      (heading, direction) =>
        heading.start >= direction.start && heading.end <= direction.end
    )
    .update(({ paragraph, directions }) => {
      let direction = directions.sort(
        (direction) => direction.end - direction.start
      )[0];
      if (direction?.attributes.dir === "rtl") {
        throw new Error(
          "Right to left languages are currently not supported in atjson."
        );
      }

      doc.replaceAnnotation(
        paragraph,
        new Paragraph({
          start: paragraph.start,
          end: paragraph.end,
          attributes: {
            anchorName: paragraph.attributes.id,
            alignment: toAlignment(
              parseCSS(paragraph.attributes.style)["text-align"],
              direction?.attributes?.lang
            ),
          },
        })
      );
    });
}
