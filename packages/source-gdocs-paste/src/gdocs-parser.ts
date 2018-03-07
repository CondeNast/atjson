import extractTextStyles from './text-styles';
import extractParagraphStyles from './paragraph-styles';
import extractListStyles from './list-styles';

export default class GDocsParser {

  gdocsSource: string;

  constructor(gdocsSource: string) {
    this.gdocsSource = gdocsSource;
  }

  getContent(): string {
    return this.gdocsSource.resolved.dsl_spacers;
  }

  getAnnotations(): Annotation[] {
    let transforms = {
      'text': extractTextStyles,
      'paragraph': extractParagraphStyles,
      'list': extractListStyles
    }

    let annotations = this.gdocsSource.resolved.dsl_styleslices.map(styleSlice => {
      if (transforms[styleSlice.stsl_type]) {
        return transforms[styleSlice.stsl_type](styleSlice.stsl_styles, this.gdocsSource.resolved.dsl_entitymap);
      }
    });

    return [].concat.apply([], annotations).filter(a => a !== undefined);
  }

}
