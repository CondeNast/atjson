import Document, { Annotation, ParseAnnotation } from "@atjson/document";
import { IframeEmbed, SocialURLs } from "@atjson/offset-annotations";
import { Script, Link } from "../annotations";

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
        doc
          .where(
            annotation => start <= annotation.start && annotation.end <= end
          )
          .remove();
        doc.addAnnotations(
          new ParseAnnotation({
            start,
            end,
            attributes: {
              reason: AnnotationClass.type + "-embed"
            }
          }),
          new AnnotationClass({
            start,
            end,
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
      let { start, end } = div;
      doc
        .where(annotation => start <= annotation.start && annotation.end <= end)
        .remove();
      doc.addAnnotations(
        new ParseAnnotation({
          start,
          end,
          attributes: {
            reason: "facebook-embed"
          }
        }),
        new AnnotationClass({
          start,
          end,
          attributes: {
            url
          }
        })
      );
    }
  });

  // Handle Giphy embeds; they have
  //   <iframe></iframe><p><a>via Giphy</a></p>
  doc
    .where(a => a.type === "iframe")
    .as("iframe")
    .join(
      doc.where({ type: "-html-p" }).as("paragraphs"),
      (iframe, paragraph) => {
        return (
          iframe.end <= paragraph.start && iframe.start <= paragraph.end + 1
        );
      }
    )
    .join(
      doc.where({ type: "-html-a" }).as("links"),
      ({ paragraphs }, link: Link) => {
        let paragraph = paragraphs[0];
        return (
          link.start > paragraph.start &&
          link.end < paragraph.end &&
          (link.attributes.href || "").indexOf("giphy") !== -1
        );
      }
    )
    .update(({ iframe, paragraphs, links }) => {
      let { start, end } = iframe;
      let { height, width, src } = iframe.attributes;

      let { url, AnnotationClass } = identifyURL(src);
      if (url && AnnotationClass) {
        doc.removeAnnotation(links[0]);
        doc.removeAnnotation(paragraphs[0]);
        doc.replaceAnnotation(
          iframe,
          new AnnotationClass({
            start: start,
            end: end,
            attributes: {
              url,
              height,
              width
            }
          }),
          new ParseAnnotation({
            start: paragraphs[0].start,
            end: paragraphs[0].end,
            attributes: {
              reason: "Giphy embed paragraph"
            }
          })
        );
      }
    });

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

  return doc;
}
