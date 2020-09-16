import Document, { is, AnnotationConstructor } from "@atjson/document";
import { Heading } from "@atjson/offset-annotations";
import { parseCSS, toAlignment } from "./utils";
import { H1, H2, H3, H4, H5, H6 } from "../annotations";

function convert(
  doc: Document,
  type: AnnotationConstructor<any, any>,
  level: 1 | 2 | 3 | 4 | 5 | 6
) {
  doc
    .where((annotation) => is(annotation, type))
    .as("heading")
    .outerJoin(
      doc
        .where((annotation) => annotation.attributes.dir != null)
        .as("directions"),
      (heading, direction) =>
        heading.start >= direction.start && heading.end <= direction.end
    )
    .update(({ heading, directions }) => {
      let direction = directions.sort(
        (direction) => direction.end - direction.start
      )[0];
      if (direction?.attributes.dir === "rtl") {
        throw new Error(
          "Right to left languages are currently not supported in atjson."
        );
      }
      let alignment = toAlignment(
        parseCSS(heading.attributes.style)["text-align"],
        direction?.attributes?.dir
      );

      doc.replaceAnnotation(
        heading,
        new Heading({
          id: heading.id,
          start: heading.start,
          end: heading.end,
          attributes: {
            level,
            alignment,
          },
        })
      );
    });
}

export default function (doc: Document) {
  convert(doc, H1, 1);
  convert(doc, H2, 2);
  convert(doc, H3, 3);
  convert(doc, H4, 4);
  convert(doc, H5, 5);
  convert(doc, H6, 6);
}
