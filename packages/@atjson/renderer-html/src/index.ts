import {
  Code,
  Heading,
  Image,
  Link,
  List
} from '@atjson/offset-annotations';
import Renderer from '@atjson/renderer-hir';

export default class HTMLRenderer extends Renderer {

  /**
   * Renders an HTML string from an object.
   *
   * To invoke this, use `yield* this.$()` to get the output.
   * This will forward the children to this function to get wrapped
   * in the HTML tag.
   *
   * @param tagName The HTML tag name to use.
   * @param props The HTML attributes (if there are any) and whether the element is self-closing.
   */
  *$(tagName: string, props?: { attributes?: any, selfClosing?: boolean }) {
    let attributes = props ? props.attributes || {} : {};
    let htmlAttributes = Object.keys(attributes).reduce((results, key) => {
      let value = attributes[key];
      if (typeof value === 'number') {
        results.push(`${key}=${value}`);
      } else if (typeof value === 'boolean' && value === true) {
        results.push(`${key}`);
      } else if (value != null && value !== false) {
        results.push(`${key}="${value}"`);
      }
      return results;
    }, [] as string[]);
    let innerHTML: string[] = yield;

    let selfClosing = props ? props.selfClosing : false;
    if (selfClosing) {
      if (htmlAttributes.length) {
        return `<${tagName} ${htmlAttributes.join(' ')} />`;
      }

      return `<${tagName} />`;
    }

    if (htmlAttributes.length) {
      return `<${tagName} ${htmlAttributes.join(' ')}>${innerHTML.join('')}</${tagName}>`;
    }

    return `<${tagName}>${innerHTML.join('')}</${tagName}>`;
  }

  *root() {
    let html = yield;
    return html.join('');
  }

  *Blockquote() {
    return yield* this.$('blockquote');
  }

  *Bold() {
    return yield* this.$('strong');
  }

  *Code(code: Code) {
    let codeSnippet = yield* this.$('code');

    if (code.attributes.style === 'block' || code.attributes.style === 'fence') {
      return `<pre>${codeSnippet}</pre>`;
    }
    return codeSnippet;
  }

  *Heading(heading: Heading) {
    return yield* this.$(`h${heading.attributes.level}`);
  }

  *HorizontalRule() {
    return yield* this.$('hr', { selfClosing: true });
  }

  *Image(image: Image) {
    return yield* this.$('img', {
      attributes: {
        src: image.attributes.url,
        title: image.attributes.title,
        alt: image.attributes.description ?
          (this.constructor as typeof HTMLRenderer).render(image.attributes.description) : undefined
      },
      selfClosing: true
    });
  }

  *Italic() {
    return yield* this.$('em');
  }

  *LineBreak() {
    return yield* this.$('br', { selfClosing: true });
  }

  *Link(link: Link) {
    return yield* this.$('a', {
      attributes: {
        href: link.attributes.url,
        title: link.attributes.title
      }
    });
  }

  *List(list: List) {
    let tagName = list.attributes.type === 'numbered' ? 'ol' : 'ul';

    return yield* this.$(tagName, {
      attributes: {
        starts: list.attributes.startsAt,
        compact: list.attributes.tight,
        type: list.attributes.delimiter
      }
    });
  }

  *ListItem() {
    return yield* this.$('li');
  }

  *Paragraph() {
    return yield* this.$('p');
  }

  *Subscript() {
    return yield* this.$('sub');
  }

  *Superscript() {
    return yield* this.$('sup');
  }

  *Underline() {
    return yield* this.$('u');
  }
}
