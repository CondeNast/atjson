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
    entityMap: GDocsEntityMap,
    trailing?: GDocsStyleSlice,
    text?: string
  ) => AnnotationJSON[];
}

export default class GDocsParser {
  static transforms: Transforms = {
    text: extractTextStyles,
    paragraph: extractParagraphStyles,
    horizontal_rule: extractHorizontalRule,
    list: extractListStyles,
    link: extractLinkStyles
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
          ...transforms[type](styles, entityMap, trailing, this.getContent())
        );
      }
    }

    return annotations;
  }
}
