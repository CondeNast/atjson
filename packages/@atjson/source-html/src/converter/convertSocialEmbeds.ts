import Document, { Annotation } from "@atjson/document";
import { IframeEmbed, SocialURLs } from "@atjson/offset-annotations";
import { Script } from "../annotations";

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

function identifyURL(src: string) {
  let url;
  try {
    url = new URL(src);
  } catch {
    return {};
  }

  return SocialURLs.identify(url);
}

export default function(doc: Document) {
  doc.where({ type: "-html-iframe" }).update(iframe => {
    let { start, end } = iframe;
    let { height, width, src } = iframe.attributes;

    let { url = src, AnnotationClass = IframeEmbed } = identifyURL(src);
    let embed = new AnnotationClass({
      start: start,
      end: end,
      attributes: {
        url,
        height,
        width
      }
    });
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
    .outerJoin(
      doc.where({ type: "-html-script" }).as("scripts"),
      ({ blockquote }, script: Script) => {
        let src = script.attributes.src;
        return (
          blockquote.end <= script.start &&
          script.start <= blockquote.end + 1 &&
          (!src || src.includes("instagram.com") || src.includes("twitter.com"))
        );
      }
    )
    .update(({ blockquote, links, scripts }) => {
      let url, AnnotationClass;
      for (let link of links) {
        ({ url, AnnotationClass } = identifyURL(link.attributes.href));
        if (url && AnnotationClass) {
          break;
        }
      }
      if (url && AnnotationClass) {
        let start = blockquote.start;
        let end = scripts.length ? scripts[0].end : blockquote.end;
        doc.cut(start, end);
        doc.insertText(start, "\uFFFC");
        doc.addAnnotations(
          new AnnotationClass({
            start: start,
            end: start + 1,
            attributes: {
              url
            }
          })
        );
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
    let { url, AnnotationClass } = identifyURL(div.attributes.dataset.href);

    if (url && AnnotationClass) {
      doc.cut(div.start, div.end);
      doc.insertText(div.start, "\uFFFC");
      doc.addAnnotations(
        new AnnotationClass({
          start: div.start,
          end: div.start + 1,
          attributes: {
            url
          }
        })
      );
    }
  });

  return doc;
}
