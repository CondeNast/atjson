import {
  AudioEnvironments,
  Blockquote,
  CerosEmbed,
  CneAudioEmbed,
  CneEventRegistrationEmbed,
  CodeBlock,
  DataSet,
  Heading,
  Image,
  Link,
  List,
  ListItem,
  Paragraph,
  Section,
  Table,
  TikTokEmbed,
} from "@atjson/offset-annotations";
import { Mark, Block } from "@atjson/document";
import Renderer, { Context } from "@atjson/renderer-hir";
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

const CneAudioEnvironments = {
  [AudioEnvironments.Production]: `https://embed-audio.cnevids.com`,
  [AudioEnvironments.Sandbox]: `https://embed-audio-sandbox.cnevids.com`,
};

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

  *Blockquote(blockquote: Block<Blockquote>) {
    return yield* this.$("blockquote", {
      id: blockquote.attributes.anchorName,
    });
  }

  *Bold() {
    return yield* this.$("strong");
  }

  *CerosEmbed(embed: Block<CerosEmbed>) {
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

  // CNE Event Registration embed
  *CneEventRegistrationEmbed(embed: Block<CneEventRegistrationEmbed>) {
    return yield* this.$("cne-event-registration", {
      url: embed.attributes.url,
    });
  }

  *Code() {
    return yield* this.$("code");
  }

  *CodeBlock(code: Block<CodeBlock>) {
    let codeSnippet = yield* this.$("code");
    let attrs = this.htmlAttributes({ class: code.attributes.info });
    if (attrs.length) {
      return `<pre ${attrs.join(" ")}>${codeSnippet}</pre>`;
    }
    return `<pre>${codeSnippet}</pre>`;
  }

  *DataSet() {
    return "";
  }

  *Heading(heading: Block<Heading>) {
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

  *Image(image: Block<Image>) {
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

  *Link(link: Mark<Link>) {
    return yield* this.$("a", {
      href: encodeURI(link.attributes.url),
      title: link.attributes.title,
      rel: link.attributes.rel,
      target: link.attributes.target,
    });
  }

  *List(list: Block<List>) {
    let tagName = list.attributes.type === "numbered" ? "ol" : "ul";

    return yield* this.$(tagName, {
      starts: list.attributes.startsAt,
      compact: !list.attributes.loose,
      type: list.attributes.delimiter,
      id: list.attributes.anchorName,
    });
  }

  *ListItem(item: Block<ListItem>) {
    return yield* this.$("li", {
      id: item.attributes.anchorName,
    });
  }

  *Paragraph(paragraph: Block<Paragraph>) {
    let style: string | undefined;
    if (paragraph.attributes.alignment) {
      style = this.textAlign(paragraph.attributes.alignment);
    }
    return yield* this.$("p", { id: paragraph.attributes.anchorName, style });
  }

  *Section(section: Block<Section>) {
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

  *Table(table: Block<Table>, context: Context) {
    const dataSet = context.document.blocks.find(
      (block) => block.id === table.attributes.dataSet
    ) as Block<DataSet> | undefined;

    if (!dataSet) {
      /**
       * invalid dataset ref
       */

      throw new Error(
        `table ${table.id} references nonexistent dataset ${table.attributes.dataSet}`
      );
    }

    let header = "";
    if (table.attributes.showColumnHeaders) {
      header += "<thead><tr>";
      for (let { name, slice: sliceId, textAlign } of table.attributes
        .columns) {
        let slice = this.getSlice(sliceId);

        if (!slice) {
          throw new Error(
            `Table ${table.id} ${
              table.range || ""
            } could not find column heading slice for ${name} ${sliceId}`
          );
        }
        header += `<th${
          textAlign ? ` style="text-align: ${textAlign};"` : ""
        }>${this.render(slice)}</th>`;
      }

      header += "</tr></thead>";
    }

    let body = "<tbody>";
    for (let record of dataSet.attributes.records) {
      body += "<tr>";
      for (let { name, textAlign } of table.attributes.columns) {
        let slice = this.getSlice(record[name].slice);
        if (!slice) {
          throw new Error(
            `Table ${table.id} ${table.range} with DataSet ${
              dataSet.attributes.name || dataSet.id
            }: document slice not found for column ${name} in row ${JSON.stringify(
              record,
              null,
              2
            )}`
          );
        }

        body += `<td${
          textAlign ? ` style="text-align: ${textAlign};"` : ""
        }>${this.render(slice)}</td>`;
      }

      body += "</tr>";
    }

    return `<table>${header}${body}</table>`;
  }

  // This hook is TiktokEmbed instead of TikTokEmbed because of our classify function
  *TiktokEmbed(embed: Block<TikTokEmbed>) {
    let parts = embed.attributes.url.split("/");
    let username = parts[parts.length - 3];
    let videoId = parts[parts.length - 1];
    return `<blockquote${
      embed.attributes.anchorName ? ` id=${embed.attributes.anchorName}` : ""
    } class="tiktok-embed" cite="${
      embed.attributes.url
    }" data-video-id="${videoId}" style="max-width: 605px;min-width: 325px;"><section><a target="_blank" title="${username}" href="https://www.tiktok.com/${username}">${username}</a></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`;
  }

  // CNE Audio embed
  *CneAudioEmbed(embed: Block<CneAudioEmbed>) {
    return yield* this.$("iframe", {
      id: embed.attributes.anchorName,
      src: `${CneAudioEnvironments[embed.attributes.audioEnv]}/iframe/${
        embed.attributes.audioType
      }/${embed.attributes.audioId}`,
      frameborder: "0",
      height: "244",
      sandbox: "allow-scripts allow-popups allow-popups-to-escape-sandbox",
    });
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
