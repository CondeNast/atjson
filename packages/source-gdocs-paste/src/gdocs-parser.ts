import { Annotation } from '@atjson/document';

import { GDocsStyleSlice } from './types';

import extractListStyles from './list-styles';
import extractParagraphStyles from './paragraph-styles';
import extractTextStyles from './text-styles';

export interface gdocsSource {
  [key: string]: any
}

export default class GDocsParser {

  gdocsSource: gdocsSource;

  static transforms = {
    text: extractTextStyles,
    paragraph: extractParagraphStyles,
    list: extractListStyles
  }

  constructor(gdocsSource: gdocsSource) {
    this.gdocsSource = gdocsSource;
  }

  getContent(): string {
    return this.gdocsSource.resolved.dsl_spacers;
  }

  getAnnotations(): Annotation[] {

    const styleSlices = this.gdocsSource.resolved.dsl_styleslices;
    const transforms = GDocsParser.transforms;

    let annotations = styleSlices.map((styleSlice) => {

      let type: string = styleSlice.stsl_type;
      let styles: GDocsStyleSlice = styleSlice.stsl_styles;

      if (transforms[type]) {
        return transforms[type](styles);
      }
    });

    return [].concat.apply([], annotations).filter((a: Annotation|undefined) => a !== undefined);
  }
}
