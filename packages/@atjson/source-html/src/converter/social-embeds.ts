import Document, {
  Annotation,
  AdjacentBoundaryBehaviour
} from "@atjson/document";
import OffsetSource, { IframeEmbed } from "@atjson/offset-annotations";
import UrlSource from "@atjson/source-url";

function isInstagramOrTwitterBlockquote(annotation: Annotation<any>) {
  if (annotation.type !== "blockquote") {
    return false;
  }

  let classes = annotation.attributes.class;

  if (!classes) {
    return false;
  }

  let classList = classes.split(" ");
  return (
    classList.includes("instagram-media") || classList.includes("twitter-tweet")
  );
}

function isFacebookDiv(annotation: Annotation<any>) {
  if (annotation.type !== "div") {
    return false;
  }

  return (
    annotation.attributes.dataset &&
    annotation.attributes.dataset.href &&
    new URL(annotation.attributes.dataset.href).host === "www.facebook.com"
  );
}

export default function(doc: Document) {
  doc.where({ type: "-html-iframe" }).update(iframe => {
    let { height, width, src: url } = iframe.attributes;
    let urlDoc = UrlSource.fromRaw(url).convertTo(OffsetSource);
    let embed;
    if (urlDoc.annotations.length) {
      embed = urlDoc.annotations[0];
      embed.start = iframe.start;
      embed.end = iframe.end;
    } else {
      embed = new IframeEmbed({
        start: iframe.start,
        end: iframe.end,
        attributes: {
          url
        }
      });
    }
    embed.attributes = { ...embed.attributes, height, width };
    doc.replaceAnnotation(iframe, embed);
  });

  /**
   * Instagram/Twitter embeds in blockquotes:
   *   <blockquote class="instagram-media" data-instgrm-permalink="url">
   *     ...
   *     <a href="https://www.instagram.com/p/{id}">
   *     ...
   *   </blockquote>
   *
   *   <blockquote class="twitter-tweet">
   *     ...
   *     <a href="https://www.twitter.com/{user}/status/{id}">
   *     ...
   *   </blockquote>
   */
  doc
    .where(isInstagramOrTwitterBlockquote)
    .as("blockquote")
    .join(doc.where({ type: "-html-a" }).as("links"), (blockquote, link) => {
      return blockquote.start < link.start && blockquote.end > link.end;
    })
    .update(({ blockquote, links }) => {
      let embed;
      for (let link of links) {
        let embeds = UrlSource.fromRaw(link.attributes.href)
          .convertTo(OffsetSource)
          .where((a: Annotation<any>) => a.type !== "unknown");

        if (embeds.length) {
          embed = embeds.annotations[0];
          break;
        }
      }

      if (embed) {
        doc.cut(blockquote.start, blockquote.end);
        doc.insertText(blockquote.start, "\uFFFC");
        embed.start = blockquote.start;
        embed.end = blockquote.start + 1;

        doc.addAnnotations(embed);
      }
    });

  /**
   * Facebook embeds in divs:
   *   <div data-href="...">
   *     <blockquote cite="https://developers.facebook.com/{user}/posts/{id}">
   *       ...
   *     </blockquote>
   *   </div>
   */
  doc.where(isFacebookDiv).update(div => {
    let embeds = UrlSource.fromRaw(div.attributes.dataset.href)
      .convertTo(OffsetSource)
      .where((a: Annotation<any>) => a.type !== "unknown");

    if (embeds.length) {
      let embed = embeds.annotations[0];
      doc.cut(div.start, div.end);
      doc.insertText(div.start, "\uFFFC");
      embed.start = div.start;
      embed.end = div.start + 1;

      doc.addAnnotations(embed);
    }
  });

  return doc;
}
