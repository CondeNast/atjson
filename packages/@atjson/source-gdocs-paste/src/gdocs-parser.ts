import { Annotation } from '@atjson/document';

import { GDocsStyleSlice } from './types';

import extractLinkStyles from './link-styles';
import extractListStyles from './list-styles';
import extractParagraphStyles from './paragraph-styles';
import extractTextStyles from './text-styles';

export interface GDocsSource {
  [key: string]: any;
}

export interface Transforms {
  [key: string]: (styles: GDocsStyleSlice[]) => Annotation[];
}

export default class GDocsParser {

  static transforms: Transforms = {
    text: extractTextStyles,
    paragraph: extractParagraphStyles,
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

    let annotations = styleSlices.map((styleSlice: GDocsStyleSlice) => {
      let type: string = styleSlice.stsl_type;
      let styles: GDocsStyleSlice[] = styleSlice.stsl_styles;

      if (transforms[type]) {
        return transforms[type](styles);
      }
      return null;
    });

    return [].concat.apply([], annotations).filter((a: Annotation | null) => a != null);
  }
}
