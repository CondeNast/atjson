import Document, {
  AdjacentBoundaryBehaviour,
  Annotation,
  ParseAnnotation,
  SliceAnnotation,
  TextAnnotation,
  UnknownAnnotation,
  is,
} from "@atjson/document";
import {
  BlueskyEmbed,
  LineBreak,
  MastodonEmbed,
  RedditEmbed,
  SocialURLs,
  TikTokEmbed,
} from "@atjson/offset-annotations";
import { Script, Anchor, Blockquote, Iframe } from "../annotations";

function aCoversB(a: Annotation<any>, b: Annotation<any>) {
  return a.start < b.start && a.end > b.end;
}

function isInstagramEmbed(annotation: Annotation<any>) {
  if (annotation.type !== "blockquote") {
    return false;
  }

  let classes = annotation.attributes.class;

  if (!classes) {
    return false;
  }

  let classList = classes.split(" ");
  return classList.includes("instagram-media");
}

function isTwitterEmbed(annotation: Annotation<any>) {
  if (annotation.type !== "blockquote") {
    return false;
  }

  let classes = annotation.attributes.class;

  if (!classes) {
    return false;
  }

  let classList = classes.split(" ");
  return classList.includes("twitter-tweet");
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

function isThreadsEmbed(annotation: Annotation<any>) {
  return (
    annotation.type === "blockquote" &&
    annotation.attributes.dataset?.["text-post-permalink"] &&
    new URL(annotation.attributes.dataset["text-post-permalink"]).host ===
      "www.threads.net"
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
   * Twitter embeds in blockquotes:
   *   <blockquote class="twitter-tweet">
   *     ...
   *     <a href="https://www.twitter.com/{user}/status/{id}">
   *     ...
   *   </blockquote>
   */
  doc
    .where(isTwitterEmbed)
    .as("blockquote")
    .join(doc.where({ type: "-html-a" }).as("links"), aCoversB)
    .join(
      doc.where({ type: "-html-p" }).as("paragraphs"),
      ({ blockquote }, p) => {
        return aCoversB(blockquote, p);
      }
    )
    .outerJoin(
      doc.where({ type: "-html-script" }).as("scripts"),
      function scriptRightAfterBlockquote({ blockquote }, script: Script) {
        let src = script.attributes.src;
        return (
          (script.start === blockquote.end ||
            script.start === blockquote.end + 1) &&
          (!src || src.includes("twitter.com") || src.includes("x.com"))
        );
      }
    )
    .update(function joinBlockQuoteWithLinksAndScripts({
      blockquote,
      paragraphs,
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
        let content = new SliceAnnotation({
          start: blockquote.start + 1,
          end: blockquote.end,
          attributes: {
            refs: [blockquote.id],
          },
        });

        let paragraph = paragraphs[0];
        if (paragraph) {
          doc.replaceAnnotation(
            paragraphs[0],
            new LineBreak({
              start: paragraph.end,
              end: paragraph.end,
            })
          );
        }

        doc.replaceAnnotation(
          blockquote,
          new Class({
            id: blockquote.id,
            start: blockquote.start,
            end: blockquote.end,
            attributes: {
              ...attributes,
              content: content.id,
            },
          }),
          content,
          new TextAnnotation({
            start: paragraph.start,
            end: blockquote.end,
          })
        );

        doc.removeAnnotations(scripts);
        doc.deleteText(blockquote.end, scripts[0].start);
      }
    });

  let divs = doc.where({ type: "-html-div" }).as("divs");

  /**
   * Instagram embeds in blockquotes:
   *   <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/{id}">
   *     ...
   *   </blockquote>
   */
  doc
    .where(isInstagramEmbed)
    .as("blockquote")
    .join(divs, aCoversB)
    .outerJoin(
      doc.where((a) => is(a, UnknownAnnotation)).as("unknown"),
      ({ blockquote }, unknown) => {
        return aCoversB(blockquote, unknown);
      }
    )
    .join(
      doc.where({ type: "-html-p" }).as("paragraphs"),
      ({ blockquote }, paragraph) => {
        return aCoversB(blockquote, paragraph);
      }
    )
    .outerJoin(
      doc.where({ type: "-html-time" }).as("time"),
      ({ blockquote }, time) => {
        return aCoversB(blockquote, time);
      }
    )
    .join(
      doc.where({ type: "-html-a" }).as("links"),
      ({ blockquote }, link: Anchor) => {
        return (
          blockquote.attributes.dataset["instgrm-permalink"] ===
            link.attributes.href && aCoversB(blockquote, link)
        );
      }
    )
    .outerJoin(
      doc.where({ type: "-html-script" }).as("scripts"),
      function scriptRightAfterBlockquote({ blockquote }, script: Script) {
        let src = script.attributes.src;
        return (
          (script.start === blockquote.end ||
            script.start === blockquote.end + 1) &&
          (!src || src.includes("instagram.com"))
        );
      }
    )
    .outerJoin(
      doc.where((a) => is(a, ParseAnnotation)).as("parseTokens"),
      function paragraphParseTokens({ paragraphs }, parseToken) {
        return paragraphs.some((p) => p.start === parseToken.start);
      }
    )
    .update(function joinBlockQuoteWithLinksAndScripts({
      blockquote,
      divs,
      links,
      paragraphs,
      scripts,
      parseTokens,
      time,
      unknown,
    }) {
      let canonicalURL = identifyURL(
        blockquote.attributes.dataset["instgrm-permalink"]
      );

      if (canonicalURL) {
        let { attributes, Class } = canonicalURL;
        let start = Math.min(...paragraphs.map((paragraph) => paragraph.start));
        let end = Math.max(...paragraphs.map((paragraph) => paragraph.end));

        doc.insertText(start, "\uFFFC");
        let content = new SliceAnnotation({
          start: start + 1,
          end,
          attributes: {
            refs: [blockquote.id],
          },
        });

        doc.replaceAnnotation(
          blockquote,
          new Class({
            id: blockquote.id,
            start: blockquote.start,
            end: blockquote.end,
            attributes: {
              ...attributes,
              content: content.id,
              hidePostCaption:
                blockquote.attributes.dataset["instgrm-captioned"] != null &&
                blockquote.attributes.dataset["instgrm-captioned"] !== "false"
                  ? undefined
                  : true,
            },
          }),
          content,
          new ParseAnnotation({
            start,
            end: start + 1,
          }),
          new TextAnnotation({
            start: start + 1,
            end,
          })
        );

        for (let i = 0, len = paragraphs.length; i < len - 1; i++) {
          let index = paragraphs[i].end;
          doc.insertText(index, "\uFFFC");
          doc.addAnnotations(
            new LineBreak({
              start: index,
              end: index + 1,
            }),
            new ParseAnnotation({
              start: index,
              end: index + 1,
            })
          );
        }

        for (let parseToken of parseTokens) {
          if (doc.content[parseToken.end] === " ") {
            doc.deleteText(parseToken.end, parseToken.end + 1);
          }
        }

        doc.removeAnnotations(links);
        doc.removeAnnotations(unknown);
        doc.removeAnnotations(divs);
        doc.removeAnnotations(time);
        doc.removeAnnotations(scripts);
        doc.removeAnnotations(paragraphs);

        doc.deleteText(end, scripts[0].end);
        doc.deleteText(blockquote.start, start);
      }
    });

  doc.where((a) => is(a, ParseAnnotation) && a.start === a.end).remove();

  /**
   * Facebook embeds in divs:
   *   <div data-href="...">
   *     <blockquote cite="https://developers.facebook.com/{user}/posts/{id}">
   *       ...
   *     </blockquote>
   *   </div>
   */
  doc
    .where(isFacebookDiv)
    .as("div")
    .join(doc.where({ type: "-html-blockquote" }).as("blockquotes"), aCoversB)
    .join(
      doc.where({ type: "-html-p" }).as("paragraphs"),
      ({ div }, paragraph) => {
        return aCoversB(div, paragraph);
      }
    )
    .update(({ div, blockquotes, paragraphs }) => {
      let canonicalURL = identifyURL(div.attributes.dataset.href);

      if (canonicalURL) {
        let { attributes, Class } = canonicalURL;
        let blockquote = blockquotes[0] as Blockquote;
        let content = new SliceAnnotation({
          start: blockquote.start + 1,
          end: blockquote.end,
          attributes: {
            refs: [blockquote.id],
          },
        });

        doc.replaceAnnotation(
          blockquote,
          new Class({
            id: blockquote.id,
            start: blockquote.start,
            end: blockquote.end,
            attributes: {
              ...attributes,
              hideText: div.attributes.dataset["show-text"] === "false",
              content: content.id,
            },
          }),
          content
        );
        let paragraph = paragraphs[0];
        if (paragraph) {
          doc.addAnnotations(
            new LineBreak({
              start: paragraph.end,
              end: paragraph.end,
            })
          );
          doc.removeAnnotations(paragraphs);
        }

        doc.removeAnnotation(div);
      }
    });

  /**
   * Reddit embeds structure:
   *   <blockquote class="reddit-embed-bq" ...>
   *     ...
   *   </blockquote>
   *   <script async="" src="https://embed.reddit.com/widgets.js" charset="UTF-8"></script>
   */
  doc
    .where(function isRedditBlockquote(a) {
      return is(a, Blockquote) && a.attributes.class === "reddit-embed-bq";
    })
    .as("blockquote")
    .join(doc.where({ type: "-html-a" }).as("links"), aCoversB)
    .outerJoin(
      doc.where({ type: "-html-script" }).as("scripts"),
      function scriptRightAfterBlockquote({ blockquote }, script: Script) {
        let src = script.attributes.src;
        return (
          (script.start === blockquote.end ||
            script.start === blockquote.end + 1) &&
          src != null &&
          src.includes("embed.reddit.com")
        );
      }
    )
    .update(function joinBlockQuoteWithLinksAndScripts({
      blockquote,
      links,
      scripts,
    }) {
      let url = (links[0] as Anchor).attributes.href;
      if (url == null) {
        throw new Error("Incorrectly formatted Reddit embed code");
      }

      // For some reason, there is no space before the
      // user info and the subreddit in the embed code
      for (let i = links.length - 1; i > 0; i--) {
        let link = links[i];
        if (doc.content[link.start - 1] !== " ") {
          doc.insertText(link.start, " ");
        }
      }
      doc.insertText(blockquote.start, "\uFFFC");

      let content = new SliceAnnotation({
        start: blockquote.start + 1,
        end: blockquote.end,
        attributes: {
          refs: [blockquote.id],
        },
      });

      doc.replaceAnnotation(
        blockquote,
        new RedditEmbed({
          id: blockquote.id,
          start: blockquote.start,
          end: blockquote.end,
          attributes: {
            url,
            content: content?.id,
            height: parseInt(blockquote.attributes.dataset["embed-height"], 10),
            hideUsername:
              blockquote.attributes.dataset["embed-showusername"] === "false",
            hidePostContent:
              blockquote.attributes.dataset["embed-showmedia"] === "false",
            hidePostContentIfEditedAfter:
              blockquote.attributes.dataset["embed-showedits"] === "false"
                ? blockquote.attributes.dataset["embed-created"]
                : undefined,
            showParentComment:
              blockquote.attributes.dataset["embed-context"] === "1"
                ? blockquote.attributes.dataset["embed-depth"] >= 2
                : undefined,
            showPostTitle:
              blockquote.attributes.dataset["embed-showtitle"] === "true",
          },
        }),
        content,
        new ParseAnnotation({
          start: blockquote.start - 1,
          end: blockquote.start,
        }),
        new TextAnnotation({
          start: blockquote.start + 1,
          end: blockquote.end,
        })
      );
      doc.removeAnnotations(scripts);
    });

  /**
   * TikTok embed structure:
   *   <blockquote class="tiktok-embed" ...>
   *     ...
   *   </blockquote>
   *   <script async src="https://www.tiktok.com/embed.js"></script>
   */
  doc
    .where(function isTikTokBlockquote(a) {
      return is(a, Blockquote) && a.attributes.class === "tiktok-embed";
    })
    .as("blockquote")
    .outerJoin(doc.where({ type: "-html-section" }).as("sections"), aCoversB)
    .outerJoin(
      doc.where({ type: "-html-script" }).as("scripts"),
      function scriptRightAfterBlockquote({ blockquote }, script: Script) {
        let src = script.attributes.src;
        return (
          (script.start === blockquote.end ||
            script.start === blockquote.end + 1) &&
          src != null &&
          src.includes("www.tiktok.com")
        );
      }
    )
    .update(function joinBlockQuoteWithLinksAndScripts({
      blockquote,
      sections,
      scripts,
    }) {
      let content = new SliceAnnotation({
        start: blockquote.start + 1,
        end: blockquote.end,
        attributes: {
          refs: [blockquote.id],
        },
      });

      let script = scripts[0];
      if (script && script.start === blockquote.end + 1) {
        doc.deleteText(blockquote.end, script.start);
      }

      if (doc.content[blockquote.end - 1] === " ") {
        doc.deleteText(blockquote.end - 1, blockquote.end);
      }

      let section = sections[0];
      if (section && doc.content[section.start - 1] === " ") {
        doc.deleteText(section.start - 1, section.start);
      }

      doc.replaceAnnotation(
        blockquote,
        new TikTokEmbed({
          id: blockquote.id,
          start: blockquote.start,
          end: blockquote.end,
          attributes: {
            url: blockquote.attributes.cite,
            content: content.id,
          },
        }),
        content,
        new TextAnnotation({
          start: blockquote.start,
          end: blockquote.end,
        })
      );

      doc.removeAnnotations(scripts);
      doc.removeAnnotations(sections);
    });

  /**
   * Threads embeds in blockquotes:
   *   <blockquote class="text-post-media" data-text-post-permalink="https://www.threads.net/{handle}/post/{id}">
   *     ...
   *   </blockquote>
   */
  doc
    .where(isThreadsEmbed)
    .as("blockquote")
    .join(divs, aCoversB)
    .outerJoin(
      doc.where((a) => is(a, UnknownAnnotation)).as("unknown"),
      ({ blockquote }, unknown) => {
        return aCoversB(blockquote, unknown);
      }
    )
    .join(
      doc.where({ type: "-html-a" }).as("links"),
      ({ blockquote }, link: Anchor) => {
        return (
          blockquote.attributes.dataset["text-post-permalink"] ===
            link.attributes.href && aCoversB(blockquote, link)
        );
      }
    )
    .outerJoin(
      doc.where({ type: "-html-script" }).as("scripts"),
      function scriptRightAfterBlockquote({ blockquote }, script: Script) {
        let src = script.attributes.src;
        return (
          (script.start === blockquote.end ||
            script.start === blockquote.end + 1) &&
          (!src || src.includes("www.threads.net"))
        );
      }
    )
    .outerJoin(
      doc.where((a) => is(a, ParseAnnotation)).as("parseTokens"),
      function divParseTokens({ divs }, parseToken) {
        return divs[divs.length - 2].start === parseToken.start;
      }
    )
    .update(function updateThreadsEmbeds({
      blockquote,
      divs,
      links,
      parseTokens,
      scripts,
      unknown,
    }) {
      let canonicalURL = identifyURL(
        blockquote.attributes.dataset["text-post-permalink"]
      );

      if (canonicalURL) {
        let { attributes, Class } = canonicalURL;
        let contentDiv = divs[divs.length - 2];
        let start = contentDiv.start;
        let end = contentDiv.end;

        let content = new SliceAnnotation({
          start,
          end,
          attributes: {
            refs: [blockquote.id],
          },
        });

        doc.replaceAnnotation(
          blockquote,
          new Class({
            id: blockquote.id,
            start: blockquote.start,
            end: blockquote.end,
            attributes: {
              ...attributes,
              content: content.id,
            },
          }),
          content
        );

        for (let parseToken of parseTokens) {
          if (doc.content[parseToken.end] === " ") {
            doc.deleteText(parseToken.end, parseToken.end + 1);
          }
        }
        if (doc.content[contentDiv.end] === " ") {
          doc.deleteText(contentDiv.end, contentDiv.end + 1);
        }

        doc.removeAnnotations(links);
        doc.removeAnnotations(unknown);
        doc.removeAnnotations(divs);
        doc.removeAnnotations(scripts);

        doc.deleteText(end, scripts[0].end);
        doc.deleteText(blockquote.start, start);
      }
    });

  /**
   * Bluesky embed structure:
   *   <blockquote class="bluesky-embed" ...></blockquote>
   *   <script async src="https://embed.bsky.app/static/embed.js" charset="utf-8"></script>
   */
  doc
    .where(function isBlueskyBlockquote(a) {
      return is(a, Blockquote) && a.attributes.class === "bluesky-embed";
    })
    .as("blockquote")
    .outerJoin(
      doc.where({ type: "-html-script" }).as("scripts"),
      function scriptRightAfterIframe(blockquote, script: Script) {
        let src = script.attributes.src;
        return (
          (script.start === blockquote.end ||
            script.start === blockquote.end + 1) &&
          src != null
        );
      }
    )
    .outerJoin(
      doc.where({ type: "-html-p" }).as("paragraphs"),
      function paragraphsInBlockquote({ blockquote }, p) {
        return aCoversB(blockquote, p);
      }
    )
    .outerJoin(
      doc.where({ type: "-html-a" }).as("links"),
      function linksInBlockquote({ blockquote }, a) {
        return aCoversB(blockquote, a);
      }
    )
    .update(function joinBlockQuoteWithLinksAndScripts({
      blockquote,
      links,
      paragraphs,
      scripts,
    }) {
      doc.insertText(blockquote.start, "\uFFFC");
      let content = new SliceAnnotation({
        start: blockquote.start + 1,
        end: blockquote.end,
        attributes: {
          refs: [blockquote.id],
        },
      });
      let postLink = links.find(
        (link) => link.attributes.href.indexOf("/post/") != -1
      );
      let url = postLink?.attributes.href.slice(
        0,
        postLink?.attributes.href.indexOf("?")
      );

      doc.replaceAnnotation(
        blockquote,
        new BlueskyEmbed({
          id: blockquote.id,
          start: blockquote.start,
          end: blockquote.end,
          attributes: {
            uri: blockquote.attributes.dataset["bluesky-uri"],
            cid: blockquote.attributes.dataset["bluesky-cid"],
            url,
            content: content?.id,
          },
        }),
        content,
        new ParseAnnotation({
          start: blockquote.start - 1,
          end: blockquote.start,
        }),
        new TextAnnotation({
          start: blockquote.start + 1,
          end: blockquote.end,
        })
      );

      let paragraph = paragraphs[0];
      if (paragraph) {
        doc.insertText(
          paragraph.end,
          "\uFFFC",
          AdjacentBoundaryBehaviour.preserveTrailing
        );
        doc.addAnnotations(
          new LineBreak({
            start: paragraph.end,
            end: paragraph.end + 1,
          }),
          new ParseAnnotation({
            start: paragraph.end,
            end: paragraph.end + 1,
          })
        );
        doc.removeAnnotations(paragraphs);
      }
      doc.removeAnnotations(scripts);
    });

  /**
   * Mastodon embed structure:
   *   <iframe class="mastodon-embed" ...></iframe>
   *   <script src=".../embed.js" async="async"></script>
   */
  doc
    .where(function isMastodonIframe(a) {
      return is(a, Iframe) && a.attributes.class === "mastodon-embed";
    })
    .as("iframe")
    .outerJoin(
      doc.where({ type: "-html-script" }).as("scripts"),
      function scriptRightAfterIframe(iframe, script: Script) {
        let src = script.attributes.src;
        return (
          (script.start === iframe.end || script.start === iframe.end + 1) &&
          src != null
        );
      }
    )
    .update(function joinBlockQuoteWithLinksAndScripts({ iframe, scripts }) {
      let url = iframe.attributes.src.replace(/\/embed*/, "");
      doc.replaceAnnotation(
        iframe,
        new MastodonEmbed({
          id: iframe.id,
          start: iframe.start,
          end: iframe.end,
          attributes: {
            url,
          },
        })
      );

      doc.removeAnnotations(scripts);
    });

  doc.where((a) => is(a, ParseAnnotation) && a.start === a.end).remove();

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
    let { height, width, src, sandbox } = iframe.attributes;

    let result = identifyURL(src);
    if (result) {
      let { Class, attributes } = result;
      doc.replaceAnnotation(
        iframe,
        new Class({
          start: start,
          end: end,
          attributes: {
            url: attributes.url,
            height,
            width,
            anchorName: iframe.attributes.id,
            sandbox,
          },
        })
      );
    }
  });

  return doc;
}
