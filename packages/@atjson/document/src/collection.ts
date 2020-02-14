import { AbstractCollection, Annotation, SchemaDefinition } from "./internals";

export interface Renaming {
  [key: string]: string | Renaming;
}

export interface FlattenedRenaming {
  [key: string]: string;
}

function flattenPropertyPaths(
  mapping: Renaming,
  options: { keys: boolean; values?: boolean },
  prefix?: string
): FlattenedRenaming {
  let result: FlattenedRenaming = {};
  for (let key in mapping) {
    let value = mapping[key];
    let fullyQualifiedKey = key;
    if (prefix) {
      fullyQualifiedKey = `${prefix}.${key}`;
      if (options.values) {
        value = `${prefix}.${value}`;
      }
    }
    if (typeof value !== "object") {
      result[fullyQualifiedKey] = value;
    } else {
      Object.assign(
        result,
        flattenPropertyPaths(value, options, fullyQualifiedKey)
      );
    }
  }

  return result;
}

function without(object: any, attributes: string[]): any {
  let copy: { [key: string]: any } = {};
  for (let key in object) {
    let activeAttributes = attributes.filter(function startsWithKey(attribute) {
      return attribute.split(".")[0] === key;
    });
    if (activeAttributes.length === 0) {
      copy[key] = object[key];
    } else if (activeAttributes.indexOf(key) === -1) {
      copy[key] = without(
        object[key],
        activeAttributes.map(function removeFirstKey(attribute) {
          return attribute
            .split(".")
            .slice(1)
            .join(".");
        })
      );
    }
  }
  return copy;
}

function get(object: any, key: string): any {
  if (key === "") return object;

  let [path, ...rest] = key.split(".");
  if (object) {
    return get(object[path], rest.join("."));
  }
  return null;
}

function set(object: any, key: string, value: any) {
  if (value == null) return;

  let [path, ...rest] = key.split(".");
  if (rest.length === 0) {
    object[path] = value;
  } else {
    if (object[path] == null) {
      object[path] = {};
    }
    set(object[path], rest.join("."), value);
  }
}

export class Collection<
  Schema extends SchemaDefinition,
  Filter extends Annotation<any>
> extends AbstractCollection<Schema, Filter> {
  set(patch: any) {
    let flattenedPatch = flattenPropertyPaths(patch, { keys: true });
    let patchAnnotationUpdater = (annotation: Filter) => {
      let result = annotation.toJSON();
      for (let key in flattenedPatch) {
        set(result, key, flattenedPatch[key]);
      }
      let newAnnotation = this.document.replaceAnnotation(
        annotation,
        result
      ) as Filter[];

      let r: { update: [Filter, Filter][] } = {
        update: [[annotation, newAnnotation[0]]]
      };

      return r;
    };

    return this.update(patchAnnotationUpdater);
  }

  unset(...keys: string[]) {
    let unsetKeysUpdater = (annotation: Filter) => {
      let result = without(annotation.toJSON(), keys);
      let newAnnotation = this.document.replaceAnnotation(
        annotation,
        result
      ) as Filter[];

      let r: { update: [Filter, Filter][] } = {
        update: [[annotation, newAnnotation[0]]]
      };

      return r;
    };

    return this.update(unsetKeysUpdater);
  }

  rename(renaming: Renaming) {
    let flattenedRenaming = flattenPropertyPaths(renaming, {
      keys: true,
      values: true
    });

    let renameUpdater = (annotation: Filter) => {
      let json = annotation.toJSON();
      let result = without(annotation.toJSON(), Object.keys(flattenedRenaming));
      for (let key in flattenedRenaming) {
        let value = get(json, key);
        set(result, flattenedRenaming[key], value);
      }
      let newAnnotation = this.document.replaceAnnotation(
        annotation,
        result
      ) as Filter[];

      let r: { update: [Filter, Filter][] } = {
        update: [[annotation, newAnnotation[0]]]
      };

      return r;
    };
    return this.update(renameUpdater);
  }

  remove() {
    this.document.removeAnnotations(this.annotations);
    this.annotations = [];
  }
}
