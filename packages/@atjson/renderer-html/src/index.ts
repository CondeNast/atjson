import {
  Blockquote,
  CerosEmbed,
  CodeBlock,
  Heading,
  Image,
  Link,
  List,
  ListItem,
  Paragraph,
  Section,
  TikTokEmbed,
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
  "wbr",
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
    let results: string[] = [];
    for (let key in attributes) {
      let value = attributes[key];
      if (typeof value === "number") {
        results.push(`${key}=${value}`);
      } else if (typeof value === "boolean" && value === true) {
        results.push(`${key}`);
      } else if (value != null && value !== false) {
        results.push(`${key}="${entities.encode(value)}"`);
      }
    }

    return results;
  }

  *root(): Iterator<void, string, string[]> {
    let html = yield;
    return html.join("");
  }

  *Blockquote(blockquote: Blockquote) {
    return yield* this.$("blockquote", {
      id: blockquote.attributes.anchorName,
    });
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
        "border: 0 none",
      ].join(";"),
      id: `experience-${embed.id}`,
      "data-aspectRatio": embed.attributes.aspectRatio?.toString(),
      "data-mobile-aspectRatio": embed.attributes.mobileAspectRatio?.toString(),
    }).join(" ")}><iframe ${this.htmlAttributes({
      allowfullscreen: true,
      src: embed.attributes.url,
      id: embed.attributes.anchorName,
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
        "min-width: 100%",
      ].join(";"),
      frameborder: "0",
      class: "ceros-experience",
      scrolling: "no",
    }).join(
      " "
    )}></iframe></div><script type="text/javascript" src="//view.ceros.com/scroll-proxy.min.js" data-ceros-origin-domains="view.ceros.com"></script>`;
  }

  *Code() {
    return yield* this.$("code");
  }

  *CodeBlock(code: CodeBlock) {
    let codeSnippet = yield* this.$("code");
    let attrs = this.htmlAttributes({ class: code.attributes.info });
    if (attrs.length) {
      return `<pre ${attrs.join(" ")}>${codeSnippet}</pre>`;
    }
    return `<pre>${codeSnippet}</pre>`;
  }

  *Heading(heading: Heading) {
    let style: string | undefined;
    if (heading.attributes.alignment) {
      style = this.textAlign(heading.attributes.alignment);
    }
    return yield* this.$(`h${heading.attributes.level}`, {
      id: heading.attributes.anchorName,
      style,
    });
  }

  *HorizontalRule() {
    return yield* this.$("hr");
  }

  *Image(image: Image) {
    return yield* this.$("img", {
      id: image.attributes.anchorName,
      src: image.attributes.url,
      title: image.attributes.title,
      alt: image.attributes.description,
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
      target: link.attributes.target,
    });
  }

  *List(list: List) {
    let tagName = list.attributes.type === "numbered" ? "ol" : "ul";

    return yield* this.$(tagName, {
      starts: list.attributes.startsAt,
      compact: !list.attributes.loose,
      type: list.attributes.delimiter,
      id: list.attributes.anchorName,
    });
  }

  *ListItem(item: ListItem) {
    return yield* this.$("li", {
      id: item.attributes.anchorName,
    });
  }

  *Paragraph(paragraph: Paragraph) {
    let style: string | undefined;
    if (paragraph.attributes.alignment) {
      style = this.textAlign(paragraph.attributes.alignment);
    }
    return yield* this.$("p", { id: paragraph.attributes.anchorName, style });
  }

  *Section(section: Section) {
    return yield* this.$("section", {
      id: section.attributes.anchorName,
    });
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

  // This hook is TiktokEmbed instead of TikTokEmbed because of our classify function
  *TiktokEmbed(embed: TikTokEmbed) {
    let parts = embed.attributes.url.split("/");
    let username = parts[parts.length - 3];
    let videoId = parts[parts.length - 1];
    return `<blockquote${
      embed.attributes.anchorName ? ` id=${embed.attributes.anchorName}` : ""
    } class="tiktok-embed" cite="${
      embed.attributes.url
    }" data-video-id="${videoId}" style="max-width: 605px;min-width: 325px;"><section><a target="_blank" title="${username}" href="https://www.tiktok.com/${username}">${username}</a></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`;
  }

  *Underline() {
    return yield* this.$("u");
  }

  protected textAlign(alignment: "start" | "center" | "end" | "justify") {
    if (alignment === "start") {
      return `text-align:left;`;
    } else if (alignment === "end") {
      return `text-align:right;`;
    }
    return `text-align:${alignment};`;
  }
}
