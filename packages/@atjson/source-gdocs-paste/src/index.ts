import Document from "@atjson/document";
export * from "./annotations";
import "./converter";
import GDocsParser from "./gdocs-parser";
import KixSchema from "./schema";

export { KixSchema as schema };

export default function(evt: ClipboardEvent) {
  if (evt.clipboardData) {
    let data = evt.clipboardData.getData(
      "application/x-vnd.google-docs-document-slice-clip+wrapped"
    );
    if (data !== "") {
      let gDocsParser = new GDocsParser(JSON.parse(JSON.parse(data).data));

      return new Document({
        content: gDocsParser.getContent(),
        annotations: gDocsParser.getAnnotations(),
        schema: KixSchema
      });
    }
  }
  return null;
}
