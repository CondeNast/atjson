import Document, { AnnotationJSON } from './index';
import JSON, { JSONObject } from './json';

export function unprefix(vendorPrefix: string, subdocuments: { [key: string]: typeof Document }, attribute: JSON, path: Array<string | number> = []): NonNullable<any> {
  if (Array.isArray(attribute)) {
    return attribute.map((attr, index) => {
      let result = unprefix(vendorPrefix, subdocuments, attr, path.concat(index));
      return result;
    });
  } else if (subdocuments[path.join('.')]) {
    let serializedDocument = (attribute as any) as { content: string; annotations: AnnotationJSON[] };
    return new subdocuments[path.join('.')](serializedDocument);
  } else if (attribute == null) {
    return null;
  } else if (typeof attribute === 'object') {
    return Object.keys(attribute).reduce((attrs: NonNullable<any>, key: string) => {
      let value = attribute[key];
      if (key.indexOf(`-${vendorPrefix}-`) === 0 && value !== undefined) {
        let unprefixedKey = key.slice(`-${vendorPrefix}-`.length);
        attrs[unprefixedKey] = unprefix(vendorPrefix, subdocuments, value, path.concat(unprefixedKey));
      } else {
        attrs[key] = value;
      }
      return attrs;
    }, {});
  } else {
    return attribute;
  }
}

export function toJSON(vendorPrefix: string, attribute: NonNullable<any>): any {
  if (Array.isArray(attribute)) {
    return attribute.map(attr => {
      let result = toJSON(vendorPrefix, attr);
      return result;
    });
  } else if (attribute instanceof Document) {
    return attribute.toJSON();
  } else if (attribute == null) {
    return null;
  } else if (typeof attribute === 'object') {
    return Object.keys(attribute).reduce((copy: JSONObject, key: string) => {
      let value = attribute[key];
      if (value !== undefined) {
        if (key[0] === '-') {
          copy[key] = toJSON(vendorPrefix, value);
        } else {
          copy[`-${vendorPrefix}-${key}`] = toJSON(vendorPrefix, value);
        }
      }
      return copy;
    }, {});
  } else {
    return attribute;
  }
}
