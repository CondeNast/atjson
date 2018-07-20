import Document, { AnnotationJSON } from './index';
import JSON, { Dictionary, JSONObject } from './json';

export type Attribute = string | number | boolean | null | Document | Attributes | AttributeArray;
export interface Attributes extends Dictionary<Attribute> {}
export interface AttributeArray extends Array<Attribute> {}

export function unprefix(vendorPrefix: string, subdocuments: { [key: string]: typeof Document }, attribute: JSON, path: Array<string | number> = []): Attribute {
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
    return Object.keys(attribute).reduce((attrs: Attributes, key: string) => {
      let value = attribute[key];
      if (key.indexOf(`-${vendorPrefix}-`) === 0 && value !== undefined) {
        let unprefixedKey = key.slice(`-${vendorPrefix}-`.length);
        attrs[unprefixedKey] = unprefix(vendorPrefix, subdocuments, value, path.concat(unprefixedKey));
      }
      return attrs;
    }, {});
  } else {
    return attribute;
  }
}

export function toJSON(vendorPrefix: string, attribute: Attribute): JSON {
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
        copy[`-${vendorPrefix}-${key}`] = toJSON(vendorPrefix, value);
      }
      return copy;
    }, {});
  } else {
    return attribute;
  }
}
