import { AnnotationJSON } from "@atjson/document";

import { GDocsEntityMap, GDocsStyleSlice } from "./types";

import extractHorizontalRule from "./horizontal-rule";
import extractLinkStyles from "./link-styles";
import extractListStyles from "./list-styles";
import extractParagraphStyles from "./paragraph-styles";
import extractTextStyles from "./text-styles";

export interface GDocsPasteBuffer {
  [key: string]: any;
}

export interface Transforms {
  [key: string]: (
    styles: GDocsStyleSlice[],
    text: string,
    entityMap: GDocsEntityMap,
    trailing?: GDocsStyleSlice
  ) => AnnotationJSON[];
}

export default class GDocsParser {
  static transforms: Transforms = {
    text: extractTextStyles,
    paragraph: extractParagraphStyles,
    horizontal_rule: extractHorizontalRule,
    list: extractListStyles,
    link: extractLinkStyles,
  };

  gdocsSource: GDocsPasteBuffer;

  constructor(source: GDocsPasteBuffer) {
    this.gdocsSource = source;
  }

  getContent(): string {
    return this.gdocsSource.resolved.dsl_spacers;
  }

  getAnnotations(): AnnotationJSON[] {
    const styleSlices = this.gdocsSource.resolved.dsl_styleslices;
    const transforms = GDocsParser.transforms;
    const entityMap: GDocsEntityMap = this.gdocsSource.resolved.dsl_entitymap;

    let annotations: AnnotationJSON[] = [];
    for (let styleSlice of styleSlices) {
      let type: string = styleSlice.stsl_type;
      let styles: GDocsStyleSlice[] = styleSlice.stsl_styles;
      let trailing: GDocsStyleSlice = styleSlice.stsl_trailing;

      if (transforms[type]) {
        annotations.push(
          ...transforms[type](styles, this.getContent(), entityMap, trailing)
        );
      }
    }

    return annotations;
  }
}
