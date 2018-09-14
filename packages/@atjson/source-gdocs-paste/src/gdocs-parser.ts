import { Annotation } from '@atjson/document';

import { GDocsStyleSlice, GDocsEntityMap } from './types';

import extractHorizontalRule from './horizontal-rule';
import extractLinkStyles from './link-styles';
import extractListStyles from './list-styles';
import extractParagraphStyles from './paragraph-styles';
import extractTextStyles from './text-styles';

export interface GDocsSource {
  [key: string]: any;
}

export interface Transforms {
  [key: string]: (styles: GDocsStyleSlice[], entityMap: GDocsEntityMap) => Annotation[];
}

export default class GDocsParser {

  static transforms: Transforms = {
    text: extractTextStyles,
    paragraph: extractParagraphStyles,
    horizontal_rule: extractHorizontalRule,
    list: extractListStyles,
    link: extractLinkStyles
  };

  gdocsSource: GDocsSource;

  constructor(source: GDocsSource) {
    this.gdocsSource = source;
  }

  getContent(): string {
    return this.gdocsSource.resolved.dsl_spacers;
  }

  getAnnotations(): Annotation[] {
    const styleSlices = this.gdocsSource.resolved.dsl_styleslices;
    const transforms = GDocsParser.transforms;
    const entityMap: GDocsEntityMap = this.gdocsSource.resolved.dsl_entitymap;

    let annotations = styleSlices.map((styleSlice: GDocsStyleSlice) => {
      let type: string = styleSlice.stsl_type;
      let styles: GDocsStyleSlice[] = styleSlice.stsl_styles;

      if (transforms[type]) {
        return transforms[type](styles, entityMap);
      }
      return null;
    });

    return [].concat.apply([], annotations).filter((a: Annotation | null) => a != null);
  }
}
