import Document from "@atjson/document";
import { FontSize } from "../annotations/font-size";

export function convertDropCaps(doc: Document) {
  const paragraphs = doc.where({ type: "-offset-paragraph" });
  const fontSizes = doc.where({ type: "-gdocs-ts_fs" });

  paragraphs
    .as("paragraph")
    .join(
      fontSizes.as("firstLetterSize"),
      (paragraph, fontSize) =>
        // font size annotations that only span the first letter of the paragraph
        // it's okay if the font size starts in a preceding paragraph
        fontSize.end === paragraph.start + 1
    )
    .join(
      fontSizes.as("adjacentSize"),
      (
        { firstLetterSize }: { firstLetterSize: FontSize[] },
        adjacentSize: FontSize
      ) => {
        let flSize = firstLetterSize[0];
        return (
          // the font size following the single-letter size
          adjacentSize.start === flSize.end &&
          // only if the first letter is bigger than the following text
          flSize.attributes.size > adjacentSize.attributes.size
        );
      }
    )
    .forEach(({ paragraph }) => {
      const decorations = new Set(paragraph.attributes.decorations).add(
        "dropCap"
      );

      paragraph.attributes.decorations = Array.from(decorations);
    });
}
