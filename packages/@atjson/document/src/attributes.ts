import Document from './index';
import JSON, { Dictionary, JSONObject } from './json';

export type Attribute = string | number | boolean | null | Attributes | AttributeArray;
export interface Attributes extends Dictionary<Attribute> {}
export interface AttributeArray extends Array<Attribute> {}

export function unprefix(vendorPrefix: string, attribute: Attribute): Attribute {
  if (Array.isArray(attribute)) {
    return attribute.map(attr => {
      let result = unprefix(vendorPrefix, attr);
      return result;
    });
  } else if (attribute instanceof Document) {
    return attribute;
  } else if (attribute == null) {
    return null;
  } else if (typeof attribute === 'object') {
    return Object.keys(attribute).reduce((attrs: Attributes, key: string) => {
      let value = attrs[key];
      if (key.indexOf(`-${vendorPrefix}-`) === 0 && value !== undefined) {
        attrs[key.slice(`-${vendorPrefix}-`.length)] = unprefix(vendorPrefix, value);
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
        copy[key] = toJSON(vendorPrefix, value);
      }
      return copy;
    }, {});
  } else {
    return attribute;
  }
}
