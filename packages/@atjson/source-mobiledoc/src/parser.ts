import { AnnotationJSON } from '@atjson/document';
import { v4 as uuid } from 'uuid';

export type Atom = [string, string, any];
export type Card = [string, any];
export type Markup = [string] | [string, string[]];
export type Marker = [0 | 1, number[], number, string | number];
export type Section = [1, string, Marker[]];
export type ImageSection = [2, string];
export type ListSection = [3, string, Marker[][]];
export type CardSection = [10, number];
export interface Mobiledoc {
  version: string;
  markups: Markup[];
  atoms: Atom[];
  cards: Card[];
  sections: Array<Section | ImageSection | ListSection | CardSection>;
}

function prefix(attributes: any): any {
  return Object.keys(attributes).reduce((prefixedAttributes: any, key: string) => {
    let value = attributes[key];
    if (typeof value === 'object') {
      prefixedAttributes[`-Mobiledoc-${key}`] = prefix(value);
    } else {
      prefixedAttributes[`-Mobiledoc-${key}`] = value;
    }
    return prefixedAttributes;
  }, {} as any);
}

export default class Parser {
  content: string;
  annotations: AnnotationJSON[];
  Mobiledoc: Mobiledoc;

  private inProgressAnnotations: Array<Partial<AnnotationJSON>>;

  constructor(Mobiledoc: Mobiledoc) {
    this.annotations = [];
    this.inProgressAnnotations = [];
    this.Mobiledoc = Mobiledoc;
    let content = '';
    let start = 0;

    Mobiledoc.sections.forEach(section => {
      let identifier = section[0];
      let partial = '';
      if (identifier === 1) {
        partial = this.processSection(section as Section, start);
      } else if (identifier === 2) {
        partial = this.processImage(section as ImageSection, start);
      } else if (identifier === 3) {
        partial = this.processList(section as ListSection, start);
      } else if (identifier === 10) {
        partial = this.processCard(section as CardSection, start);
      }
      start += partial.length;
      content += partial;
    });
    this.content = content;
  }

  processCard(section: CardSection, start: number) {
    let [, cardIndex] = section;
    let card = this.Mobiledoc.cards[cardIndex];
    this.annotations.push({
      id: uuid(),
      type: `-Mobiledoc-${card[0]}-card`,
      start,
      end: start + 1,
      attributes: prefix(card[1])
    });
    return '\uFFFC';
  }

  processImage(section: ImageSection, start: number) {
    let [, src] = section;
    this.annotations.push({
      id: uuid(),
      type: `-Mobiledoc-img`,
      start,
      end: start + 1,
      attributes: {
        '-Mobiledoc-src': src
      }
    });
    return '\uFFFC';
  }

  processSection(section: Section, start: number) {
    let [, tagName, markers] = section;

    let sectionText = '';
    let offset = start;
    markers.forEach(([identifier, tags, closed, textOrAtomIndex]) => {
      let partial = '';
      if (identifier === 0) {
        partial = this.processMarkup(tags, closed, textOrAtomIndex as string, offset);
      } else if (identifier === 1) {
        partial = this.processAtom(this.Mobiledoc.atoms[textOrAtomIndex as number], offset);
      }
      sectionText += partial;
      offset += partial.length;
    });

    this.annotations.push({
      id: uuid(),
      type: `-Mobiledoc-${tagName.toLowerCase()}`,
      start,
      end: start + sectionText.length,
      attributes: {}
    });

    return sectionText;
  }

  processList(section: ListSection, start: number) {
    let [, tagName, listItems] = section;
    let listText = '';
    let offset = start;

    listItems.forEach((markers: Marker[]) => {
      let item = '';
      let itemStart = offset;

      markers.forEach(([identifier, tags, closed, textOrAtomIndex]) => {
        let partial = '';
        if (identifier === 0) {
          partial = this.processMarkup(tags, closed, textOrAtomIndex as string, offset);
        } else if (identifier === 1) {
          partial = this.processAtom(this.Mobiledoc.atoms[textOrAtomIndex as number], offset);
        }
        item += partial;
        offset += partial.length;
      });

      this.annotations.push({
        id: uuid(),
        type: '-Mobiledoc-li',
        start: itemStart,
        end: offset,
        attributes: {}
      });
      listText += item;
    });

    this.annotations.push({
      id: uuid(),
      type: `-Mobiledoc-${tagName.toLowerCase()}`,
      start,
      end: start + listText.length,
      attributes: {}
    });

    return listText;
  }

  processMarkup(markupIndexes: number[], numberOfClosedMarkups: number, text: string, start: number) {
    let end = start + text.length;

    while (markupIndexes.length) {
      let markup = this.Mobiledoc.markups[markupIndexes.shift()!];
      let attributes: any = {};
      if (markup[1]) {
        let attributeList = markup[1];
        for (let i = 0, len = attributeList.length; i < len; i += 2) {
          let key = attributeList[i];
          let value = attributeList[i + 1];
          attributes[`-Mobiledoc-${key}`] = value;
        }
      }
      this.inProgressAnnotations.push({
        id: uuid(),
        type: `-Mobiledoc-${markup[0].toLowerCase()}`,
        start,
        attributes
      });
    }

    while (numberOfClosedMarkups > 0) {
      numberOfClosedMarkups--;
      let annotation = this.inProgressAnnotations.pop()!;
      annotation.end = end;
      this.annotations.push(annotation as AnnotationJSON);
    }

    return text;
  }

  processAtom(atom: Atom, start: number) {
    let [name, text, attributes] = atom;
    let end = start + text.length;
    this.annotations.push({
      id: uuid(),
      type: `-Mobiledoc-${name}-atom`,
      start,
      end,
      attributes: prefix(attributes)
    });
    return text;
  }
}
