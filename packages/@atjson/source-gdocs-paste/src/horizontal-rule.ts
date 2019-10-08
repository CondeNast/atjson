import { SerializedAnnotation } from "@atjson/document";
import { GDocsStyleSlice } from "./types";

export default function extractHorizontalRule(
  styles: GDocsStyleSlice[]
): SerializedAnnotation[] {
  let annotations: SerializedAnnotation[] = [];

  for (let i = 0; i < styles.length; i++) {
    let style = styles[i];

    if (style === null) continue;

    annotations.push({
      type: "-gdocs-horizontal_rule",
      start: i,
      end: i + 1,
      attributes: {}
    });
  }

  return annotations;
}
