import { AnnotationJSON, Document, JSON, JSONObject } from "./internals";

export type AnnotationAttributesObject = {
  [key: string]: any;
};

export function unprefix(
  vendorPrefix: string,
  subdocuments: { [key: string]: typeof Document },
  attribute: JSON,
  path: Array<string | number> = []
): NonNullable<any> {
  if (Array.isArray(attribute)) {
    return attribute.map(function unprefixAttr(attr, index) {
      let result = unprefix(
        vendorPrefix,
        subdocuments,
        attr,
        path.concat(index)
      );
      return result;
    });
  } else if (subdocuments[path.join(".")]) {
    let serializedDocument = attribute as any as {
      content: string;
      annotations: AnnotationJSON[];
    };
    return new subdocuments[path.join(".")](serializedDocument);
  } else if (attribute == null) {
    return null;
  } else if (typeof attribute === "object") {
    let attrs: NonNullable<any> = {};
    for (let key in attribute) {
      let value = attribute[key];
      if (key.indexOf(`-${vendorPrefix}-`) === 0 && value !== undefined) {
        let unprefixedKey = key.slice(`-${vendorPrefix}-`.length);
        attrs[unprefixedKey] = unprefix(
          vendorPrefix,
          subdocuments,
          value,
          path.concat(unprefixedKey)
        );
      } else {
        attrs[key] = value;
      }
    }

    return attrs;
  } else {
    return attribute;
  }
}

export function toJSON(vendorPrefix: string, attribute: NonNullable<any>): any {
  if (Array.isArray(attribute)) {
    return attribute.map(function attributeToJSON(attr) {
      let result = toJSON(vendorPrefix, attr);
      return result;
    });
  } else if (attribute instanceof Document) {
    return attribute.toJSON();
  } else if (attribute == null) {
    return null;
  } else if (typeof attribute === "object") {
    let copy: JSONObject = {};
    for (let key in attribute) {
      let value = attribute[key];
      if (value !== undefined) {
        if (key[0] === "-") {
          copy[key] = toJSON(vendorPrefix, value);
        } else {
          copy[`-${vendorPrefix}-${key}`] = toJSON(vendorPrefix, value);
        }
      }
    }

    return copy;
  } else {
    return attribute;
  }
}

export function clone(attribute: any): NonNullable<any> {
  if (attribute == null) {
    return null;
  } else if (Array.isArray(attribute)) {
    let copy = [];
    for (let i = 0, len = attribute.length; i < len; i++) {
      copy[i] = clone(attribute[i]);
    }
    return copy;
  } else if (attribute instanceof Document) {
    return attribute.clone();
  } else if (typeof attribute === "object") {
    let copy: NonNullable<any> = {};
    for (let key in attribute) {
      if (attribute[key] !== undefined) {
        copy[key] = clone(attribute[key]);
      }
    }
    return copy;
  } else {
    return attribute;
  }
}

export function withStableIds(
  attribute: any,
  ids: Record<string, string>
): NonNullable<any> {
  if (attribute == null) {
    return null;
  } else if (Array.isArray(attribute)) {
    let copy = [];
    for (let i = 0, len = attribute.length; i < len; i++) {
      copy[i] = withStableIds(attribute[i], ids);
    }
    return copy;
  } else if (attribute instanceof Document) {
    return attribute;
  } else if (typeof attribute === "object") {
    let copy: NonNullable<any> = {};
    for (let key in attribute) {
      if (attribute[key] !== undefined) {
        copy[key] = withStableIds(attribute[key], ids);
      }
    }
    return copy;
  } else if (typeof attribute === "string" && attribute in ids) {
    return ids[attribute];
  } else {
    return attribute;
  }
}

export function removeUndefinedValuesFromObject(obj: any): any {
  let objectEntries = Object.entries(obj);
  let acc = {};
  for (let [key, value] of objectEntries) {
    acc = value === undefined ? acc : { ...acc, [key]: value };
  }

  return acc;
}
