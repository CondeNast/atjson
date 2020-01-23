import Document, { Annotation, ParseAnnotation } from "@atjson/document";
import { IframeEmbed, SocialURLs } from "@atjson/offset-annotations";
import { Script, Anchor } from "../annotations";

function aCoversB(a: Annotation<any>, b: Annotation<any>) {
  return a.start < b.start && a.end > b.end;
}

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
    .join(doc.where({ type: "-html-a" }).as("links"), aCoversB)
    .outerJoin(
      doc.where({ type: "-html-script" }).as("scripts"),
      function scriptRightAfterBlockquote({ blockquote }, script: Script) {
        let src = script.attributes.src;
        return (
          (script.start === blockquote.end ||
            script.start === blockquote.end + 1) &&
          (!src || src.includes("instagram.com") || src.includes("twitter.com"))
        );
      }
    )
    .update(function joinBlockQuoteWithLinksAndScripts({
      blockquote,
      links,
      scripts
    }) {
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
          .where(function isAnnotationInEmbed(annotation) {
            return start <= annotation.start && annotation.end <= end;
          })
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
  for (let div of doc.annotations) {
    if (!isFacebookDiv(div)) continue;

    let { url, AnnotationClass } = identifyURL(div.attributes.dataset.href);

    if (url && AnnotationClass) {
      let { start, end } = div;
      doc
        .where(function isAnnotationInFBDiv(annotation) {
          return start <= annotation.start && annotation.end <= end;
        })
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
  }

  // Handle Giphy embeds; they have
  //   <iframe></iframe><p><a>via Giphy</a></p>
  doc
    .where({ type: "-html-iframe" })
    .as("iframe")
    .join(
      doc.where({ type: "-html-p" }).as("paragraphs"),
      function isParagraphRightAfterIframe(iframe, paragraph) {
        return (
          paragraph.start === iframe.end || paragraph.start === iframe.end + 1
        );
      }
    )
    .join(
      doc.where({ type: "-html-a" }).as("links"),
      function isGiphyLinkWithinParagraph({ paragraphs }, link: Anchor) {
        let paragraph = paragraphs[0];
        return (
          link.start > paragraph.start &&
          link.end < paragraph.end &&
          (link.attributes.href || "").indexOf("giphy") !== -1
        );
      }
    )
    .update(function joinIframeWithParagraphsAndLinks({
      iframe,
      paragraphs,
      links
    }) {
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

  doc
    .where({ type: "-html-iframe" })
    .update(function convertSocialIframeEmbeds(iframe) {
      let { start, end } = iframe;
      let { height, width, src } = iframe.attributes;

      let { url, AnnotationClass } = identifyURL(src);
      if (url && AnnotationClass) {
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
          })
        );
      }
    });

  return doc;
}
