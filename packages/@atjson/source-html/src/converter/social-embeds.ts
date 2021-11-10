import Document, { Annotation, ParseAnnotation } from "@atjson/document";
import { SocialURLs } from "@atjson/offset-annotations";
import { Script, Anchor } from "../annotations";

function aCoversB(a: Annotation<any>, b: Annotation<any>) {
  return a.start < b.start && a.end > b.end;
}

function isBlockquoteEmbed(annotation: Annotation<any>) {
  if (annotation.type !== "blockquote") {
    return false;
  }

  let classes = annotation.attributes.class;

  if (!classes) {
    return false;
  }

  let classList = classes.split(" ");
  return (
    classList.includes("instagram-media") ||
    classList.includes("twitter-tweet") ||
    classList.includes("tiktok-embed")
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
    return null;
  }

  return SocialURLs.identify(url);
}

export default function (doc: Document) {
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
    .where(isBlockquoteEmbed)
    .as("blockquote")
    .join(doc.where({ type: "-html-a" }).as("links"), aCoversB)
    .outerJoin(
      doc.where({ type: "-html-script" }).as("scripts"),
      function scriptRightAfterBlockquote({ blockquote }, script: Script) {
        let src = script.attributes.src;
        return (
          (script.start === blockquote.end ||
            script.start === blockquote.end + 1) &&
          (!src ||
            src.includes("instagram.com") ||
            src.includes("twitter.com") ||
            src.includes("tiktok.com"))
        );
      }
    )
    .update(function joinBlockQuoteWithLinksAndScripts({
      blockquote,
      links,
      scripts,
    }) {
      let canonicalURL;
      if (blockquote.attributes.cite) {
        canonicalURL = identifyURL(blockquote.attributes.cite);
      }
      if (canonicalURL == null) {
        for (let link of links) {
          canonicalURL = identifyURL(link.attributes.href);
          if (canonicalURL) {
            break;
          }
        }
      }

      if (canonicalURL) {
        let { attributes, Class } = canonicalURL;
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
              reason: Class.type + "-embed",
            },
          }),
          new Class({
            start,
            end,
            attributes,
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

    let canonicalURL = identifyURL(div.attributes.dataset.href);

    if (canonicalURL) {
      let { attributes, Class } = canonicalURL;
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
            reason: "facebook-embed",
          },
        }),
        new Class({
          start,
          end,
          attributes,
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
      links,
    }) {
      let { start, end } = iframe;
      let { height, width, src } = iframe.attributes;

      let canonicalURL = identifyURL(src);
      if (canonicalURL) {
        let { attributes, Class } = canonicalURL;
        doc.removeAnnotation(links[0]);
        doc.removeAnnotation(paragraphs[0]);
        doc.replaceAnnotation(
          iframe,
          new Class({
            start: start,
            end: end,
            attributes: {
              url: attributes.url,
              height,
              width,
            },
          }),
          new ParseAnnotation({
            start: paragraphs[0].start,
            end: paragraphs[0].end,
            attributes: {
              reason: "Giphy embed paragraph",
            },
          })
        );
      }
    });

  doc.where({ type: "-html-iframe" }).update(function updateIframes(iframe) {
    let { start, end } = iframe;
    let { height, width, src } = iframe.attributes;

    let result = identifyURL(src);
    if (result) {
      let { Class, attributes } = result;
      doc.replaceAnnotation(
        iframe,
        new Class({
          start: start,
          end: end,
          attributes: {
            ...attributes,
            height,
            width,
            anchorName: iframe.attributes.id,
          },
        })
      );
    }
  });

  return doc;
}
