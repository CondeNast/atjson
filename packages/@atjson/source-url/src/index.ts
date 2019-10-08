import Document from "@atjson/document";
import { URL as URLAnnotation } from "./annotations";
import "./converter";
import schema from "./schema";

export * from "./annotations";
export default schema;

export function fromRaw(text: string) {
  try {
    let url = new URL(text);
    let searchParams: { [key: string]: string } = {};
    Array.from(url.searchParams).reduce((params, [key, value]) => {
      params[key] = value;
      return params;
    }, searchParams);

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
      schema
    });
  } catch (e) {
    return new Document({
      content: text,
      annotations: [],
      schema
    });
  }
}
