import Document from "@atjson/document";
import OffsetSchema, { Code, Image, List } from "@atjson/schema-offset";
import HTMLSchema from "./schema";

function getText(doc: Document<any>) {
  let text = "";
  let index = 0;
  let parseTokens = doc.where({ type: "-atjson-parse-token" });
  parseTokens.forEach(token => {
    text += doc.content.slice(index, token.start);
    index = token.end;
  });

  return text;
}

Document.defineConverterTo(HTMLSchema, OffsetSchema, doc => {
  doc
    .where("Anchor")
    .set({ type: "-offset-link" })
    .rename({ attributes: { "-html-href": "-offset-url" } });

  doc.where("Blockquote").set({ type: "-offset-blockquote" });

  doc
    .where("H1")
    .set({ type: "-offset-heading", attributes: { "-offset-level": 1 } });
  doc
    .where("H2")
    .set({ type: "-offset-heading", attributes: { "-offset-level": 2 } });
  doc
    .where("H3")
    .set({ type: "-offset-heading", attributes: { "-offset-level": 3 } });
  doc
    .where("H4")
    .set({ type: "-offset-heading", attributes: { "-offset-level": 4 } });
  doc
    .where("H5")
    .set({ type: "-offset-heading", attributes: { "-offset-level": 5 } });
  doc
    .where("H6")
    .set({ type: "-offset-heading", attributes: { "-offset-level": 6 } });

  doc.where("Paragraph").set({ type: "-offset-paragraph" });
  doc.where("LineBreak").set({ type: "-offset-line-break" });
  doc.where("HorizontalRule").set({ type: "-offset-horizontal-rule" });

  doc
    .where("UnorderedList")
    .set({ type: "-offset-list", attributes: { "-offset-type": "bulleted" } });
  doc.where("OrderedList").update(list => {
    doc.replaceAnnotation(
      list,
      new List({
        id: list.id,
        start: list.start,
        end: list.end,
        attributes: {
          type: "numbered",
          startsAt: parseInt(list.attributes.start || "1", 10)
        }
      })
    );
  });
  doc.where("ListItem").set({ type: "-offset-list-item" });

  doc.where("Emphasis").set({ type: "-offset-italic" });
  doc.where("Italic").set({ type: "-offset-italic" });
  doc.where("Strong").set({ type: "-offset-bold" });
  doc.where("Bold").set({ type: "-offset-bold" });
  doc.where("Delete").set({ type: "-offset-strikethrough" });
  doc.where("Strikethrough").set({ type: "-offset-strikethrough" });
  doc.where("Subscript").set({ type: "-offset-subscript" });
  doc.where("Superscript").set({ type: "-offset-superscript" });
  doc.where("Underline").set({ type: "-offset-underline" });

  doc.where("Image").update(image => {
    if (image.attributes.src) {
      doc.replaceAnnotation(
        image,
        new Image({
          id: image.id,
          start: image.start,
          end: image.end,
          attributes: {
            url: image.attributes.src,
            title: image.attributes.title,
            description: image.attributes.alt
          }
        })
      );
    }
  });

  let $pre = doc.where("PreformattedText").as("pre");
  let $code = doc.where("Code").as("codeElements");

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
    .where("Code")
    .set({ type: "-offset-code", attributes: { "-offset-style": "inline" } });

  return doc;
});
