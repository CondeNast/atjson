import Document from '@atjson/document';
import { URLAnnotation } from './annotations';

export default class URLSource extends Document {
  static contentType = 'application/vnd.atjson+url';
  static schema = [URLAnnotation];
  static fromRaw(text: string) {
    try {
      let url = new URL(text);
      let searchParams: { [key: string]: string } = {};
      Array.from(url.searchParams).reduce((params, [key, value]) => {
        params[key] = value;
        return params;
      }, searchParams);

      return new this({
        content: text,
        annotations: [new URLAnnotation({
          start: 0,
          end: text.length,
          attributes: {
            host: url.host,
            hash: url.hash,
            pathname: url.pathname,
            protocol: url.protocol,
            searchParams
          }
        })]
      });
    } catch (e) {
      return new this({
        content: text,
        annotations: []
      });
    }
  }
}
