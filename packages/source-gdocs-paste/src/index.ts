import { Annotation } from '@atjson/document';

export default class Parser {

  gdocsSource: string;

  constructor(gdocsSource: string) {
    this.gdocsSource = gdocsSource;
  }

  getContent(): string {
    return this.gdocsSource.resolved.dsl_spacers;
  }

  getAnnotations(): Annotation[] {
    let transforms = {
      'text': this._extractTextStyles,
      'paragraph': this._extractParagraphStyles,
      'list': this._extractListStyles
    }

    let annotations = this.gdocsSource.resolved.dsl_styleslices.map(styleSlice => {
      if (transforms[styleSlice.stsl_type]) {
        return transforms[styleSlice.stsl_type](styleSlice.stsl_styles, this.gdocsSource.resolved.dsl_entitymap);
      }
    });

    return [].concat.apply([], annotations).filter(a => a !== undefined);
  }

  _extractTextStyles(styles): Annotation[] {

    let state = {}
    let annotations = [];

    for (let i = 0; i < styles.length; i++) {
      let style = styles[i];
      
      if (style === null) continue;

      for (let styleType of ['ts_bd', 'ts_it', 'ts_un']) {
        if (style[styleType] === true && !state[styleType]) {
          state[styleType] = { type: styleType, start: i };
        } else if (style[styleType] === false && style[styleType + '_i'] === false && state[styleType]) {
          state[styleType].end = i;
          annotations.push(state[styleType]);
          delete state[styleType];
        }
      }

    }

    return annotations;
  }

  _extractParagraphStyles(styles): Annotation[] {

    let lastParagraphStart = 0;
    let annotations = [];

    for (let i = 0; i < styles.length; i++) {
      let style = styles[i];

      if (style === null) continue;

      if (style['ps_hd'] !== 0) {
        annotations.push({
          type: 'ps_hd',
          level: style['ps_hd'],
          start: lastParagraphStart,
          end: i
        });
      }

      lastParagraphStart = i + 1;
    }

    return annotations;
  }

  _extractListStyles(lists, entities): Annotation[] {

    let lastParagraphStart = 0;
    let listAnnotations = {};
    let annotations = [];

    for (let i = 0; i < lists.length; i++) {
      let list = lists[i];
      
      if (list === null) continue;
      if (list['ls_id'] === null) {
        lastParagraphStart = i + 1;
        continue;
      }

      if (!listAnnotations[list['ls_id']]) {
        listAnnotations[list['ls_id']] = {
          type: 'list',
          ls_id: list['ls_id'],
          start: lastParagraphStart,
          end: i
        }
      } else {
        listAnnotations[list['ls_id']].end = i;
      }

      annotations.push({
        type: 'list-item',
        ls_nest: list['ls_nest'],
        ls_id: list['ls_id'],
        start: lastParagraphStart,
        end: i
      });

      lastParagraphStart = i + 1;
    }

    for (var list in listAnnotations) {
      annotations.push(listAnnotations[list]);
    }

    return annotations;
  }
}
