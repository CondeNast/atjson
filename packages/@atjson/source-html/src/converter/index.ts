import Document, { Annotation } from "@atjson/document";
import OffsetSource, { Code } from "@atjson/offset-annotations";
import { Image, OrderedList } from "../annotations";
import HTMLSource from "../source";
import convertSocialEmbeds from "./social-embeds";

function getText(doc: Document) {
  let text = "";
  let index = 0;
  let parseTokens = doc.where({ type: "-atjson-parse-token" });
  parseTokens.forEach(token => {
    text += doc.content.slice(index, token.start);
    index = token.end;
  });

  text += doc.content.slice(index, doc.content.length);
  return text;
}

HTMLSource.defineConverterTo(OffsetSource, doc => {
  convertSocialEmbeds(doc);

  doc
    .where({ type: "-html-a" })
    .set({ type: "-offset-link" })
    .rename({
      attributes: {
        "-html-href": "-offset-url",
        "-html-rel": "-offset-rel",
        "-html-target": "-offset-target"
      }
    });

  doc.where({ type: "-html-blockquote" }).set({ type: "-offset-blockquote" });

  doc
    .where({ type: "-html-h1" })
    .set({ type: "-offset-heading", attributes: { "-offset-level": 1 } });
  doc
    .where({ type: "-html-h2" })
    .set({ type: "-offset-heading", attributes: { "-offset-level": 2 } });
  doc
    .where({ type: "-html-h3" })
    .set({ type: "-offset-heading", attributes: { "-offset-level": 3 } });
  doc
    .where({ type: "-html-h4" })
    .set({ type: "-offset-heading", attributes: { "-offset-level": 4 } });
  doc
    .where({ type: "-html-h5" })
    .set({ type: "-offset-heading", attributes: { "-offset-level": 5 } });
  doc
    .where({ type: "-html-h6" })
    .set({ type: "-offset-heading", attributes: { "-offset-level": 6 } });

  doc.where({ type: "-html-p" }).set({ type: "-offset-paragraph" });
  doc.where({ type: "-html-br" }).set({ type: "-offset-line-break" });
  doc.where({ type: "-html-hr" }).set({ type: "-offset-horizontal-rule" });

  doc
    .where({ type: "-html-ul" })
    .set({ type: "-offset-list", attributes: { "-offset-type": "bulleted" } });
  doc.where({ type: "-html-ol" }).update((list: OrderedList) => {
    doc.replaceAnnotation(list, {
      id: list.id,
      type: "-offset-list",
      start: list.start,
      end: list.end,
      attributes: {
        "-offset-type": "numbered",
        "-offset-startsAt": parseInt(list.attributes.start || "1", 10)
      }
    });
  });
  doc.where({ type: "-html-li" }).set({ type: "-offset-list-item" });

  doc.where({ type: "-html-em" }).set({ type: "-offset-italic" });
  doc.where({ type: "-html-i" }).set({ type: "-offset-italic" });
  doc.where({ type: "-html-strong" }).set({ type: "-offset-bold" });
  doc.where({ type: "-html-b" }).set({ type: "-offset-bold" });
  doc.where({ type: "-html-del" }).set({ type: "-offset-strikethrough" });
  doc.where({ type: "-html-s" }).set({ type: "-offset-strikethrough" });
  doc.where({ type: "-html-sub" }).set({ type: "-offset-subscript" });
  doc.where({ type: "-html-sup" }).set({ type: "-offset-superscript" });
  doc.where({ type: "-html-u" }).set({ type: "-offset-underline" });

  doc.where({ type: "-html-img" }).update((image: Image) => {
    doc.replaceAnnotation(image, {
      id: image.id,
      type: "-offset-image",
      start: image.start,
      end: image.end,
      attributes: {
        "-offset-url": image.attributes.src,
        "-offset-title": image.attributes.title,
        "-offset-description": image.attributes.alt
      }
    });
  });

  let $pre = doc.where({ type: "-html-pre" }).as("pre");
  let $code = doc.where({ type: "-html-code" }).as("codeElements");

  $pre
    .join($code, (pre, code) => pre.start < code.start && code.end < pre.end)
    .update(({ pre, codeElements }) => {
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
        new Code({
          start: code.start,
          end: code.end,
          attributes: {
            style: "block"
          }
        })
      );
      doc.removeAnnotation(pre);
    });

  doc
    .where({ type: "-html-code" })
    .set({ type: "-offset-code", attributes: { "-offset-style": "inline" } });

  doc.where({ type: "-html-section" }).set({ type: "-offset-section" });

  doc
    .where((a: Annotation<any>) => {
      let classes: string = a.attributes.class;
      return (
        a.type === "span" &&
        classes &&
        classes
          .trim()
          .split(" ")
          .includes("smallcaps")
      );
    })
    .set({ type: "-offset-small-caps" });

  return doc;
});
