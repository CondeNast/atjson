import Document, { getConverterFor } from "@atjson/document";
import OffsetSchema from "@atjson/schema-offset";
import { schema as HTMLSchema } from "@atjson/source-html";
import PRISMSchema from "./schema";

Document.defineConverterTo(PRISMSchema, OffsetSchema, doc => {
  let convertHTML = getConverterFor(HTMLSchema, OffsetSchema);
  convertHTML(doc);

  doc.where({ type: "-html-head" }).update(head => {
    doc.cut(head.start, head.end);
  });

  doc.where({ type: "-pam-media" }).update(media => {
    doc.cut(media.start, media.end);
  });

  return doc;
});
