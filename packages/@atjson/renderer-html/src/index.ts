import {
  AudioEnvironments,
  Blockquote,
  CerosEmbed,
  CneAudioEmbed,
  CneEventRegistrationEmbed,
  CodeBlock,
  DataSet,
  FacebookEmbed,
  Heading,
  Image,
  InstagramEmbed,
  Link,
  List,
  ListItem,
  Paragraph,
  Section,
  Table,
  TextAlignment,
  ThreadsEmbed,
  TikTokEmbed,
  TwitterEmbed,
} from "@atjson/offset-annotations";
import { Mark, Block } from "@atjson/document";
import Renderer, { Context } from "@atjson/renderer-hir";
import * as entities from "entities";

const THREADS_SCAFFOLD = `<div style=" padding: 40px; display: flex; flex-direction: column; align-items: center;">
<div style=" display:block; height:32px; width:32px; padding-bottom:20px;"> <svg aria-label="Threads" height="32px" role="img" viewBox="0 0 192 192" width="32px" xmlns="http://www.w3.org/2000/svg"> <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" /></svg></div> <div style=" font-size: 15px; line-height: 21px; color: #999999; font-weight: 400; padding-bottom: 4px; ">`;
const INSTAGRAM_SCAFFOLD = ` <div style=" display: flex; flex-direction: row; align-items: center;"> <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div></div></div><div style="padding: 19% 0;"></div> <div style="display:block; height:50px; margin:0 auto 12px; width:50px;"><svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-511.000000, -20.000000)" fill="#000000"><g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path></g></g></g></svg></div><div style="padding-top: 8px;"> <div style=" color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;"> View this post on Instagram</div></div><div style="padding: 12.5% 0;"></div> <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;"><div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div> <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div> <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div></div><div style="margin-left: 8px;"> <div style=" background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div> <div style=" width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div></div><div style="margin-left: auto;"> <div style=" width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div> <div style=" background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div> <div style=" width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div></div></div> <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;"> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div> <div style=" background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div></div>`;

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

const TableTextAlign = {
  [TextAlignment.Start]: "left",
  [TextAlignment.End]: "right",
  [TextAlignment.Center]: "center",
  [TextAlignment.Justify]: "center",
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
    if (heading.attributes.textAlignment) {
      style = this.textAlign(heading.attributes.textAlignment);
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
    if (paragraph.attributes.textAlignment) {
      style = this.textAlign(paragraph.attributes.textAlignment);
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

  *InstagramEmbed(embed: Block<InstagramEmbed>) {
    let slice =
      embed.attributes.content != null &&
      this.getSlice(embed.attributes.content);

    return `<blockquote ${this.htmlAttributes({
      id: embed.attributes.anchorName,
      class: "instagram-media",
      "data-instgrm-permalink": embed.attributes.url,
      "data-instgrm-captioned": !embed.attributes.excludePostCaption,
      "data-instgrm-version": "14",
      style:
        " background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);",
    }).join(" ")}><div style="padding:16px;"> <a ${this.htmlAttributes({
      href: embed.attributes.url,
      style:
        " background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;",
      target: "_blank",
    }).join(" ")}>${INSTAGRAM_SCAFFOLD}</a> <p ${this.htmlAttributes({
      style:
        " color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;",
    }).join(" ")}> <a ${this.htmlAttributes({
      href: embed.attributes.url,
      style:
        " color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none;",
      target: "_blank",
    }).join(" ")}>${
      slice ? this.render(slice) : `A post shared on Instagram`
    }</a></p></div></blockquote> <script async src="//www.instagram.com/embed.js"></script>`;
  }

  *FacebookEmbed(embed: Block<FacebookEmbed>) {
    let slice =
      embed.attributes.content != null &&
      this.getSlice(embed.attributes.content);

    if (slice) {
      return `<div ${this.htmlAttributes({
        id: embed.attributes.anchorName,
        class: "fb-post",
        "data-href": embed.attributes.url,
        "data-show-text": !embed.attributes.hideText,
      }).join(" ")}><blockquote ${this.htmlAttributes({
        class: "fb-xfbml-parse-ignore",
        cite: embed.attributes.url,
      }).join(" ")}>${this.render(slice)}</blockquote></div>`;
    } else {
      return `<iframe ${[
        `src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(
          embed.attributes.url
        )}&width=500"`,
        ...this.htmlAttributes({
          id: embed.attributes.anchorName,
          width: "500",
          height: "633",
          style: "border:none;overflow:hidden",
          scrolling: "no",
          frameborder: "0",
          allowTransparency: "true",
          allow: "encrypted-media",
        }),
      ].join(" ")}></iframe>`;
    }
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
      for (let { name, slice: sliceId, textAlignment } of table.attributes
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
          textAlignment
            ? ` style="text-align: ${TableTextAlign[textAlignment]};"`
            : ""
        }>${headerText}</th>`;
      }

      header += "</tr></thead>";
    }

    let body = "<tbody>";
    for (let record of dataSet.attributes.records) {
      body += "<tr>";
      for (let { name, textAlignment } of table.attributes.columns) {
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
          textAlignment
            ? ` style="text-align: ${TableTextAlign[textAlignment]};"`
            : ""
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
    let slice =
      embed.attributes.content != null &&
      this.getSlice(embed.attributes.content);

    let content = slice
      ? this.render(slice)
      : `<a target="_blank" title="${username}" href="https://www.tiktok.com/${username}">${username}</a>`;
    return `<blockquote${
      embed.attributes.anchorName ? ` id=${embed.attributes.anchorName}` : ""
    } class="tiktok-embed" cite="${
      embed.attributes.url
    }" data-video-id="${videoId}" style="max-width: 605px;min-width: 325px;"><section>${content}</section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`;
  }

  *TwitterEmbed(embed: Block<TwitterEmbed>) {
    let slice =
      embed.attributes.content != null &&
      this.getSlice(embed.attributes.content);

    let content = slice
      ? this.render(slice)
      : `<a href="${embed.attributes.url}">${embed.attributes.url}</a>`;
    return `<blockquote${
      embed.attributes.anchorName ? ` id=${embed.attributes.anchorName}` : ""
    } class="twitter-embed"><p>${content}</p></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`;
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

  protected textAlign(alignment: TextAlignment): string {
    switch (alignment) {
      case TextAlignment.Start:
        return `text-align:start;`;
      case TextAlignment.End:
        return `text-align:end;`;
      case TextAlignment.Center:
        return `text-align:center;`;
      case TextAlignment.Justify:
        return `text-align:justify;`;
    }
  }
}
