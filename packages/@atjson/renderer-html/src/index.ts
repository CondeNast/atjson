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
  ThreadsEmbed,
  TikTokEmbed,
} from "@atjson/offset-annotations";
import { Mark, Block } from "@atjson/document";
import Renderer, { Context } from "@atjson/renderer-hir";
import * as entities from "entities";

const THREADS_SCAFFOLD = `<div style=" padding: 40px; display: flex; flex-direction: column; align-items: center;">
<div style=" display:block; height:32px; width:32px; padding-bottom:20px;"> <svg aria-label="Threads" height="32px" role="img" viewBox="0 0 192 192" width="32px" xmlns="http://www.w3.org/2000/svg"> <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" /></svg></div> <div style=" font-size: 15px; line-height: 21px; color: #999999; font-weight: 400; padding-bottom: 4px; ">`;

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

  *DataSet(): Iterator<void, string, string[]> {
    return (yield).join("");
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

  *ThreadsEmbed(embed: Block<ThreadsEmbed>) {
    let parts = embed.attributes.url.split("/");
    let handle = parts.find((part) => part[0] === "@");
    let postId = parts[parts.length - 1];
    let content = embed.attributes.content
      ? this.getSlice(embed.attributes.content)
      : null;

    return `<blockquote ${this.htmlAttributes({
      class: "text-post-media",
      "data-text-post-permalink": embed.attributes.url,
      "data-text-post-version": "0",
      id: `ig-tp-${postId}`,
      style:
        " background:#FFF; border-width: 1px; border-style: solid; border-color: #00000026; border-radius: 16px; max-width:540px; margin: 1px; min-width:270px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);",
    }).join(" ")}> <a ${this.htmlAttributes({
      href: embed.attributes.url,
      style:
        " background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%; font-family: -apple-system, BlinkMacSystemFont, sans-serif;",
      target: "_blank",
    }).join(" ")}>${THREADS_SCAFFOLD}${
      content ? this.render(content) : `Post by ${handle}`
    }</div> <div style=" font-size: 15px; line-height: 21px; color: #000000; font-weight: 600; "> View on Threads</div></div></a></blockquote><script async src="https://www.threads.net/embed.js"></script>`;
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
        let headerText = name;
        if (sliceId) {
          const slice = this.getSlice(sliceId);
          if (!slice) {
            throw new Error(
              `Table ${table.id} ${
                table.range || ""
              } could not find column heading slice for ${name} ${sliceId}`
            );
          }

          headerText = this.render(slice);
        }

        header += `<th${
          textAlign ? ` style="text-align: ${textAlign};"` : ""
        }>${headerText}</th>`;
      }

      header += "</tr></thead>";
    }

    let body = "<tbody>";
    for (let record of dataSet.attributes.records) {
      body += "<tr>";
      for (let { name, textAlign } of table.attributes.columns) {
        let cellText = "";
        let sliceId = record[name]?.slice;
        if (sliceId) {
          let slice = this.getSlice(sliceId);
          if (slice) {
            cellText = this.render(slice);
          } else {
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
        }

        body += `<td${
          textAlign ? ` style="text-align: ${textAlign};"` : ""
        }>${cellText}</td>`;
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
