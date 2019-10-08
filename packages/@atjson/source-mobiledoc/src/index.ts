import Document, { SchemaDefinition } from "@atjson/document";
export * from "./annotations";
import "./converter";
import Parser, { Mobiledoc } from "./parser";
import MobiledocSchema from "./schema";

export default MobiledocSchema;

export function fromRaw(mobiledoc: Mobiledoc, schema?: SchemaDefinition) {
  let result = new Parser(mobiledoc);

  return new Document({
    content: result.content,
    annotations: result.annotations,
    schema: schema || MobiledocSchema
  });
}
