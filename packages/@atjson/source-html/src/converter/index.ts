import Document, { Annotation } from "@atjson/document";
import OffsetSource, {
  Blockquote,
  Bold,
  Code,
  CodeBlock,
  HorizontalRule,
  IframeEmbed,
  Italic,
  LineBreak,
  Link,
  List,
  Section,
  SmallCaps,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
} from "@atjson/offset-annotations";
import { Anchor, OrderedList } from "../annotations";
import HTMLSource from "../source";
import convertSocialEmbeds from "./social-embeds";
import convertThirdPartyEmbeds from "./third-party-embeds";
import convertVideoEmbeds from "./video-embeds";
import convertHeadings from "./headings";
import convertParagraphs from "./paragraphs";

function getText(doc: Document) {
  let text = "";
  let index = 0;
  let parseTokens = doc.where({ type: "-atjson-parse-token" });
  for (let token of parseTokens) {
    text += doc.content.slice(index, token.start);
    index = token.end;
  }

  text += doc.content.slice(index, doc.content.length);
  return text;
}

function aCoversB(a: Annotation<any>, b: Annotation<any>) {
  return a.start < b.start && a.end > b.end;
}

function isSmallCaps(a: Annotation<any>) {
  let classes: string = a.attributes.class;
  return (
    a.type === "span" &&
    classes &&
    classes.trim().split(" ").includes("smallcaps")
  );
}

HTMLSource.defineConverterTo(OffsetSource, function HTMLToOffset(doc) {
  convertThirdPartyEmbeds(doc);
  convertSocialEmbeds(doc);
  convertVideoEmbeds(doc);

  doc.where({ type: "-html-iframe" }).update(function updateIframes(iframe) {
    doc.replaceAnnotation(
      iframe,
      new IframeEmbed({
        start: iframe.start,
        end: iframe.end,
        attributes: {
          url: iframe.attributes.src,
          height: iframe.attributes.height,
          width: iframe.attributes.width,
          anchorName: iframe.attributes.id,
        },
      })
    );
  });

  doc.where({ type: "-html-a" }).update((a: Anchor) => {
    doc.replaceAnnotation(
      a,
      new Link({
        id: a.id,
        start: a.start,
        end: a.end,
        attributes: {
          url: a.attributes.href ?? "",
          rel: a.attributes.rel,
          target: a.attributes.target,
          title: a.attributes.title,
        },
      })
    );
  });

  doc.where({ type: "-html-blockquote" }).update((blockquote) => {
    doc.replaceAnnotation(
      blockquote,
      new Blockquote({
        id: blockquote.id,
        start: blockquote.start,
        end: blockquote.end,
        attributes: {
          anchorName: blockquote.attributes.id,
        },
      })
    );
  });

  convertHeadings(doc);
  convertParagraphs(doc);

  doc.where({ type: "-html-br" }).update((lineBreak) => {
    doc.replaceAnnotation(
      lineBreak,
      new LineBreak({
        id: lineBreak.id,
        start: lineBreak.start,
        end: lineBreak.end,
      })
    );
  });
  doc.where({ type: "-html-hr" }).update((horizontalRule) => {
    doc.replaceAnnotation(
      horizontalRule,
      new HorizontalRule({
        id: horizontalRule.id,
        start: horizontalRule.start,
        end: horizontalRule.end,
      })
    );
  });

  doc
    .where({ type: "-html-ul" })
    .set({ type: "-offset-list", attributes: { "-offset-type": "bulleted" } });
  doc
    .where({ type: "-html-ol" })
    .update(function updateOList(list: OrderedList) {
      doc.replaceAnnotation(
        list,
        new List({
          id: list.id,
          start: list.start,
          end: list.end,
          attributes: {
            type: "numbered",
            startsAt: parseInt(list.attributes.start || "1", 10),
          },
        })
      );
    });
  doc
    .where({ type: "-html-li" })
    .set({ type: "-offset-list-item" })
    .rename({
      attributes: {
        "-html-id": "-offset-anchorName",
      },
    });

  doc
    .where((a) => a.type === "em" || a.type === "i")
    .update((italic) => {
      doc.replaceAnnotation(
        italic,
        new Italic({
          id: italic.id,
          start: italic.start,
          end: italic.end,
        })
      );
    });

  doc
    .where((a) => a.type === "strong" || a.type === "b")
    .update((bold) => {
      doc.replaceAnnotation(
        bold,
        new Bold({
          id: bold.id,
          start: bold.start,
          end: bold.end,
        })
      );
    });

  doc
    .where((a) => a.type === "del" || a.type === "s")
    .update((strikethrough) => {
      doc.replaceAnnotation(
        strikethrough,
        new Strikethrough({
          id: strikethrough.id,
          start: strikethrough.start,
          end: strikethrough.end,
        })
      );
    });

  doc.where({ type: "-html-sub" }).update((subscript) => {
    doc.replaceAnnotation(
      subscript,
      new Subscript({
        id: subscript.id,
        start: subscript.start,
        end: subscript.end,
      })
    );
  });
  doc.where({ type: "-html-sup" }).update((superscript) => {
    doc.replaceAnnotation(
      superscript,
      new Superscript({
        id: superscript.id,
        start: superscript.start,
        end: superscript.end,
      })
    );
  });
  doc.where({ type: "-html-u" }).update((underline) => {
    doc.replaceAnnotation(
      underline,
      new Underline({
        id: underline.id,
        start: underline.start,
        end: underline.end,
      })
    );
  });

  doc
    .where({ type: "-html-img" })
    .set({ type: "-offset-image" })
    .rename({
      attributes: {
        "-html-src": "-offset-url",
        "-html-title": "-offset-title",
        "-html-alt": "-offset-description",
        "-html-id": "-offset-anchorName",
      },
    });

  let $pre = doc.where({ type: "-html-pre" }).as("pre");
  let $code = doc.where({ type: "-html-code" }).as("codeElements");

  $pre
    .join($code, aCoversB)
    .update(function joinPreToCodes({ pre, codeElements }) {
      if (codeElements.length > 1) return;

      let code = codeElements[0];
      if (
        !getText(doc.slice(pre.start, code.start)).match(/^\s*$/) ||
        !getText(doc.slice(code.end, pre.end)).match(/^\s*$/)
      ) {
        return;
      }

      doc.replaceAnnotation(
        code,
        new CodeBlock({
          start: code.start,
          end: code.end,
        })
      );
      doc.removeAnnotation(pre);
    });

  doc.where({ type: "-html-code" }).update((code) => {
    doc.replaceAnnotation(
      code,
      new Code({
        id: code.id,
        start: code.start,
        end: code.end,
      })
    );
  });

  doc.where({ type: "-html-section" }).update((section) => {
    doc.replaceAnnotation(
      section,
      new Section({
        id: section.id,
        start: section.start,
        end: section.end,
      })
    );
  });

  doc.where(isSmallCaps).update((smallCaps) => {
    doc.replaceAnnotation(
      smallCaps,
      new SmallCaps({
        id: smallCaps.id,
        start: smallCaps.start,
        end: smallCaps.end,
      })
    );
  });

  return doc;
});
