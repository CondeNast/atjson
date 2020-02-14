export * from "./annotations";
import "./converter";

import { URLSchema } from "./schema";
export default URLSchema;

import Document from "@atjson/document";
import { URLAnnotation } from "./annotations";

export function fromRaw(text: string) {
  try {
    let url = new URL(text);
    let searchParams: { [key: string]: string } = {};

    for (let [key, value] of Array.from(url.searchParams)) {
      searchParams[key] = value;
    }

    return new Document({
      content: text,
      annotations: [
        new URLAnnotation({
          start: 0,
          end: text.length,
          attributes: {
            host: url.host,
            hash: url.hash,
            pathname: url.pathname,
            protocol: url.protocol,
            searchParams
          }
        })
      ],
      schema: URLSchema
    });
  } catch (e) {
    return new Document({
      content: text,
      annotations: [],
      schema: URLSchema
    });
  }
}
