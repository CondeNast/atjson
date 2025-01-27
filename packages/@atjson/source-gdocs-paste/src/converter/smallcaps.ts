import Document from "@atjson/document";
import { SmallCaps } from "@atjson/offset-annotations";
import { FontSize } from "../annotations/font-size";

export function convertSmallCaps(doc: Document) {
  // find places where the font size changes within a paragraph
  const fontSizes = doc.where({ type: "-gdocs-ts_fs" });
  const smallRanges: FontSize[] = [];
  fontSizes
    .as("range")
    .join(fontSizes.as("adjacentRanges"), (left: FontSize, right: FontSize) => {
      return (
        left.attributes.size !== right.attributes.size &&
        (left.start === right.end || right.start === left.end)
      );
    })
    .forEach(
      ({
        range,
        adjacentRanges,
      }: {
        range: FontSize;
        adjacentRanges: FontSize[];
      }) => {
        if (
          adjacentRanges.some(
            (adjacentRange) =>
              adjacentRange.attributes.size > range.attributes.size
          )
        ) {
          smallRanges.push(range);
        }
      }
    );

  // check if text under smaller font range is all caps
  // mark all caps text with small caps
  const smallCapsAnnotations: SmallCaps[] = [];
  for (let range of smallRanges) {
    const textRange = doc.content.slice(range.start, range.end);
    if (textRange === textRange.toLocaleUpperCase()) {
      smallCapsAnnotations.push(
        new SmallCaps({ start: range.start, end: range.end })
      );
    }
  }

  doc.addAnnotations(...smallCapsAnnotations);
}
