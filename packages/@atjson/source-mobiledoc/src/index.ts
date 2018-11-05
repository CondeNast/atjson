import Document, { AnnotationJSON } from "@atjson/document";
import {
  Anchor,
  Atom,
  Aside,
  Bold,
  Blockquote,
  Card,
  Code,
  Emphasis,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Italic,
  Image,
  ListItem,
  OrderedList,
  Paragraph,
  Strikethrough,
  Strong,
  Subscript,
  Superscript,
  Underline,
  UnorderedList
} from "./annotations";

type Markup = [string] | [string, string[]];
type Marker = [number, number[], number, string | number];
type CardSection = [10, number];
type ImageSection = [2, string];
type Section = [1 | 3, string, Marker[]];
interface MobileDoc {
  version: string;
  markups: Markup[];
  atoms: Array<[string, string, any]>;
  cards: Array<[string, any]>;
  sections: Array<Section | CardSection | ImageSection>;
}

export default class MobileDocSource extends Document {
  static contentType = 'appplication/vnd.atjson+mobiledoc';
  static schema = [
    Anchor,
    Aside,
    Atom,
    Bold,
    Blockquote,
    Card,
    Code,
    Emphasis,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    Italic,
    Image,
    ListItem,
    OrderedList,
    Paragraph,
    Strikethrough,
    Strong,
    Subscript,
    Superscript,
    Underline,
    UnorderedList
  ];
  static fromSource(doc: MobileDoc) {
    let annotations: AnnotationJSON[] = [];
    let content = '';
    let start = 0;

    doc.sections.forEach(section => {
      let [typeIdentifier] = section;
      if (typeIdentifier === 10) {
        let [, cardIndex] = section as CardSection;
        content += '\uFFFC';
        let card = doc.cards[cardIndex];
        annotations.push({
          id: '1',
          type: `-mobiledoc-${card[0]}`,
          start,
          end: start + 1,
          attributes: card[1]
        });
        start += 1;
      } else if (typeIdentifier === 2) {
        let [, src] = section as ImageSection;
        content += '\uFFFC';
        annotations.push({
          id: '2',
          type: `-mobiledoc-img`,
          start,
          end: start + 1,
          attributes: {
            '-mobiledoc-src': src
          }
        });
        start += 1;
      } else {
        let [, tagName, markers] = section as Section;
        let startAnnotation = {
          type: `-mobiledoc-${tagName}`,
          start,
          attributes: {}
        };

        let isList = tagName === 'ol' || tagName === 'ul';
        markers.forEach(([identifier, tags, closed, textOrAtomIndex]) => {
          let end = start;
          if (identifier === 1 && typeof textOrAtomIndex === 'number') {
            let atom = doc.atoms[textOrAtomIndex];
            content += atom[1];
            end += atom[1].length;
            annotations.push({
              type: `-mobiledoc-${atom[0]}`,
              start,
              end,
              attributes: atom[2]
            });
          } else {
            let text = textOrAtomIndex as string;

          }

          start = end;
        });
      }
    });

    return new MobileDocSource({
      content,
      annotations,
      version: doc.version
    });
  }
}
