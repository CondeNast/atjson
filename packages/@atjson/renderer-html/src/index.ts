import {
  CerosEmbed,
  Code,
  Heading,
  Image,
  Link,
  List
} from "@atjson/offset-annotations";
import Renderer from "@atjson/renderer-hir";
import * as entities from "entities";

const VOID_ELEMENTS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];

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
  *$(tagName: string, attributes: any = {}) {
    let htmlAttributes = this.htmlAttributes(attributes);
    let innerHTML: string[] = yield;

    let selfClosing = VOID_ELEMENTS.indexOf(tagName.toLowerCase()) !== -1;
    if (selfClosing) {
      if (htmlAttributes.length) {
        return `<${tagName} ${htmlAttributes.join(" ")} />`;
      }

      return `<${tagName} />`;
    }

    if (htmlAttributes.length) {
      return `<${tagName} ${htmlAttributes.join(" ")}>${innerHTML.join(
        ""
      )}</${tagName}>`;
    }

    return `<${tagName}>${innerHTML.join("")}</${tagName}>`;
  }

  text(text: string) {
    return entities.encode(text);
  }

  htmlAttributes(attributes: {
    [index: string]: string | number | boolean | undefined;
  }) {
    return Object.keys(attributes).reduce((results, key) => {
      let value = attributes[key];
      if (typeof value === "number") {
        results.push(`${key}=${value}`);
      } else if (typeof value === "boolean" && value === true) {
        results.push(`${key}`);
      } else if (value != null && value !== false) {
        results.push(`${key}="${entities.encode(value)}"`);
      }
      return results;
    }, [] as string[]);
  }

  *root() {
    let html = yield;
    return html.join("");
  }

  *Blockquote() {
    return yield* this.$("blockquote");
  }

  *Bold() {
    return yield* this.$("strong");
  }

  *CerosEmbed(embed: CerosEmbed) {
    return `<div ${this.htmlAttributes({
      style: [
        "position: relative",
        "width: auto",
        `padding: 0 0 ${100 / embed.attributes.aspectRatio}%`,
        "height: 0",
        "top: 0",
        "left: 0",
        "bottom: 0",
        "right: 0",
        "margin: 0",
        "border: 0 none"
      ].join(";"),
      id: `experience-${embed.id}`,
      "data-aspectRatio": embed.attributes.aspectRatio?.toString(),
      "data-mobile-aspectRatio": embed.attributes.mobileAspectRatio?.toString()
    }).join(" ")}><iframe ${this.htmlAttributes({
      allowfullscreen: true,
      src: embed.attributes.url,
      style: [
        "position: absolute",
        "top: 0",
        "left: 0",
        "bottom: 0",
        "right: 0",
        "margin: 0",
        "padding: 0",
        "border: 0 none",
        "height: 1px",
        "width: 1px",
        "min-height: 100%",
        "min-width: 100%"
      ].join(";"),
      frameborder: "0",
      class: "ceros-experience",
      scrolling: "no"
    }).join(
      " "
    )}></iframe></div><script type="text/javascript" src="//view.ceros.com/scroll-proxy.min.js" data-ceros-origin-domains="view.ceros.com"></script>`;
  }

  *Code(code: Code) {
    let codeSnippet = yield* this.$("code");

    if (
      code.attributes.style === "block" ||
      code.attributes.style === "fence"
    ) {
      return `<pre>${codeSnippet}</pre>`;
    }
    return codeSnippet;
  }

  *Heading(heading: Heading) {
    return yield* this.$(`h${heading.attributes.level}`);
  }

  *HorizontalRule() {
    return yield* this.$("hr");
  }

  *Image(image: Image) {
    return yield* this.$("img", {
      src: image.attributes.url,
      title: image.attributes.title,
      alt: image.attributes.description
    });
  }

  *Italic() {
    return yield* this.$("em");
  }

  *LineBreak() {
    return yield* this.$("br");
  }

  *Link(link: Link) {
    return yield* this.$("a", {
      href: encodeURI(link.attributes.url),
      title: link.attributes.title,
      rel: link.attributes.rel,
      target: link.attributes.target
    });
  }

  *List(list: List) {
    let tagName = list.attributes.type === "numbered" ? "ol" : "ul";

    return yield* this.$(tagName, {
      starts: list.attributes.startsAt,
      compact: list.attributes.tight,
      type: list.attributes.delimiter
    });
  }

  *ListItem() {
    return yield* this.$("li");
  }

  *Paragraph() {
    return yield* this.$("p");
  }

  *Section() {
    return yield* this.$("section");
  }

  *SmallCaps() {
    return yield* this.$("span", { class: "smallcaps" });
  }

  *Strikethrough() {
    return yield* this.$("s");
  }

  *Subscript() {
    return yield* this.$("sub");
  }

  *Superscript() {
    return yield* this.$("sup");
  }

  *Underline() {
    return yield* this.$("u");
  }
}
