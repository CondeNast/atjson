import Annotation, { SerializedAnnotation } from "./annotation";
import { ParseAnnotation, UnknownAnnotation } from "./annotations";
import { AdjacentBoundaryBehaviour, Deletion, Insertion } from "./change";
import {
  AnnotationNamed,
  SchemaClasses,
  SchemaDefinition,
  ValidAnnotations,
  findAnnotationFor,
  isValidType
} from "./schema";

import Collection from "./collection";

function createAnnotation<Schema extends SchemaDefinition>(
  annotation: Annotation<any> | SerializedAnnotation,
  schema: Schema
): ValidAnnotations<Schema> {
  let KnownAnnotation = findAnnotationFor(annotation, schema);
  if (annotation instanceof Annotation) {
    if (KnownAnnotation === annotation.constructor) {
      return annotation as ValidAnnotations<Schema>;
    } else {
      return KnownAnnotation.hydrate(annotation.toJSON());
    }
  } else {
    return KnownAnnotation.hydrate(annotation);
  }
}

/**
 * Returns the function registered for the converter defined between
 * two schemas.
 */
export function getConverterFor(
  from: SchemaDefinition | string,
  to: SchemaDefinition | string
): never | ((doc: Document<any>) => Document<any>) {
  let exports = (typeof window !== "undefined" ? window : global) as any;
  let fromType =
    typeof from === "string" ? from : `${from.type}@${from.version}`;
  let toType = typeof to === "string" ? to : `${to.type}@${to.version}`;

  let converters = exports.__atjson_converters__;
  let converter = converters
    ? converters[fromType]
      ? converters[fromType][toType]
      : null
    : null;

  if (converter == null) {
    let fromName = typeof from === "string" ? from : from.type;
    let toName = typeof to === "string" ? to : to.type;
    throw new Error(
      `🚨 There is no converter registered between ${fromName} and ${toName}.\n\nDid you forget to \`import\` or \`require\` your converter?\n\nIf you haven't written a converter yet, register a converter for this:\n\nDocument.defineConverterTo(${fromName}, ${toName}, doc => {\n  // ❤️ Write your converter here!\n  return doc;\n});`
    );
  }

  return converter;
}

export default class Document<Schema extends SchemaDefinition> {
  static defineConverterTo<
    From extends SchemaDefinition,
    To extends SchemaDefinition
  >(
    from: From,
    to: To,
    converter: (
      doc: Document<{
        type: string;
        version: string;
        annotations: From["annotations"] & {
          [key: string]: SchemaClasses<To>;
        };
      }>
    ) => Document<{
      type: string;
      version: string;
      annotations: From["annotations"] & {
        [key: string]: SchemaClasses<To>;
      };
    }>
  ) {
    // We may have multiple / conflicting versions of
    // @atjson/document. To allow this, we need to
    // register converters on the global to ensure
    // that they can be shared across versions of the library.
    let exports = (typeof window !== "undefined" ? window : global) as any;

    let converters = exports.__atjson_converters__;
    if (converters == null) {
      converters = exports.__atjson_converters__ = {};
    }

    if (converters[`${from.type}@${from.version}`] == null) {
      converters[`${from.type}@${from.version}`] = {};
    }

    converters[`${from.type}@${from.version}`][
      `${to.type}@${to.version}`
    ] = converter;
  }

  content: string;
  annotations: Array<ValidAnnotations<Schema>>;
  schema: Schema;

  private changeListeners: Array<() => void>;
  private pendingChangeEvent: any;

  constructor(options: {
    content: string;
    annotations: Array<SerializedAnnotation | Annotation<any>>;
    schema: Schema;
  }) {
    this.changeListeners = [];
    this.content = options.content;
    this.schema = options.schema;
    this.annotations = options.annotations.map(annotation =>
      createAnnotation(annotation, options.schema)
    );
  }

  /**
   * Add one or more annotations to the document.
   *
   * If the annotation is not in the schema, it'll be
   * hydrated as an UnknownAnnotation.
   */
  addAnnotations(
    ...annotations: Array<Annotation<any> | SerializedAnnotation>
  ): void {
    this.annotations.push(
      ...annotations.map(annotation =>
        createAnnotation(annotation, this.schema)
      )
    );
    this.triggerChange();
  }

  /**
   * Remove an annotation from the document.
   */
  removeAnnotation(remove: ValidAnnotations<Schema>) {
    let index = this.annotations.indexOf(remove);
    if (index > -1) {
      this.triggerChange();
      return this.annotations.splice(index, 1)[0];
    }
    return;
  }

  /**
   * Replace an annotation with one or more annotations.
   */
  replaceAnnotation(
    remove: ValidAnnotations<Schema>,
    ...add: Array<SerializedAnnotation | Annotation<any>>
  ): Array<ValidAnnotations<Schema>> {
    let index = this.annotations.indexOf(remove as ValidAnnotations<Schema>);
    if (index > -1) {
      let annotations = add.map(newAnnotation =>
        createAnnotation(newAnnotation, this.schema)
      );
      this.annotations.splice(index, 1, ...annotations);
      return annotations;
    }

    this.triggerChange();
    return [];
  }

  /**
   * Convert this document to the schema passed in.
   *
   * This will call any converters that are registered between
   * this schema and the requested schema.
   */
  convertTo<To extends SchemaDefinition>(to: To): Document<To> | never {
    let converter = getConverterFor(this.schema, to);
    let jointSchema: {
      type: string;
      version: string;
      annotations: Schema["annotations"] & {
        [key: string]: SchemaClasses<To>;
      };
    } = {
      type: `${this.schema.type}->${to.type}`,
      version: `${this.schema.version}->${to.version}`,
      annotations: {
        ...(this.schema.annotations as Schema["annotations"]),
        // We can't guarantee that names in the two schemas
        // don't overlap, so we'll allow string querying for
        // the source document since that's the most useful.
        //
        // The resultant schema is prefixed with the schema's
        // type and version to prevent conflicts while being
        // clear when debugging.
        ...Object.keys(to.annotations).reduce(
          (mungedSchema, name) => {
            mungedSchema[`${to.type}@${to.version}[${name}]`] = to.annotations[
              name
            ] as SchemaClasses<To>;
            return mungedSchema;
          },
          {} as { [key: string]: SchemaClasses<To> }
        )
      }
    };

    let convertedDoc = new ConversionDocument({
      content: this.content,
      annotations: this.where({}).sort().annotations,
      schema: jointSchema
    });

    let result = converter(convertedDoc);
    return new Document({
      content: result.content,
      annotations: result.where({}).sort().annotations,
      schema: to
    });
  }

  /**
   * Cuts out part of the document, modifying `this` and returning the removed portion
   */
  cut(
    start: number,
    end: number,
    behaviour: AdjacentBoundaryBehaviour = AdjacentBoundaryBehaviour.default
  ): Document<Schema> {
    let slice = this.slice(start, end);
    this.where(
      annotation => annotation.start >= start && annotation.end <= end
    ).remove();
    this.deleteText(start, end, behaviour);

    return slice;
  }

  toJSON() {
    return {
      content: this.content,
      annotations: this.where({})
        .sort()
        .toJSON(),
      schema: {
        type: this.schema.type,
        version: this.schema.version
      }
    };
  }

  in<Other extends SchemaDefinition>(schema: Other) {
    return new Document<Other>({
      content: this.content,
      annotations: this.annotations,
      schema
    });
  }

  clone(): Document<Schema> {
    return new Document({
      content: this.content,
      annotations: this.annotations.map(annotation => annotation.clone()),
      schema: this.schema
    });
  }

  canonical() {
    let doc = this.clone();
    doc.where(ParseAnnotation).update(token => {
      doc.deleteText(token.start, token.end);
    });
    doc.where(ParseAnnotation).remove();

    Collection.prototype.sort.call(doc.annotations);

    return doc;
  }

  equals(other: Document<Schema>): boolean {
    let lhs = this.canonical();
    let rhs = other.canonical();

    return (
      // Versions can be mismatched here
      lhs.schema.type === rhs.schema.type &&
      lhs.content === rhs.content &&
      lhs.annotations.length === rhs.annotations.length &&
      lhs.annotations.every((annotation, index) =>
        annotation.equals(rhs.annotations[index])
      )
    );
  }

  where<Name extends string>(
    className: Name
  ): Collection<Schema, InstanceType<AnnotationNamed<Schema, Name>>>;
  where<
    Type extends
      | SchemaClasses<Schema>
      | typeof ParseAnnotation
      | typeof UnknownAnnotation
  >(type: Type): Collection<Schema, InstanceType<Type>>;
  where(
    callback:
      | Partial<SerializedAnnotation>
      | ((value: ValidAnnotations<Schema>) => unknown)
  ): Collection<Schema, ValidAnnotations<Schema>>;
  where<
    Type extends
      | SchemaClasses<Schema>
      | typeof ParseAnnotation
      | typeof UnknownAnnotation,
    Name extends string
  >(
    filter:
      | ((value: ValidAnnotations<Schema>) => boolean)
      | Partial<SerializedAnnotation>
      | Name
      | Type
  ) {
    if (typeof filter === "string") {
      return new Collection(this, this.annotations).where(filter);
    } else if (isValidType(this.schema, filter)) {
      return new Collection(this, this.annotations).where(filter);
    } else if (filter instanceof Function) {
      return new Collection(this, this.annotations).where(filter);
    } else if (typeof filter === "object") {
      return new Collection(this, this.annotations).where(filter);
    } else {
      return new Collection(this, this.annotations).where(filter);
    }
  }

  insertText(
    start: number,
    text: string,
    behaviour: AdjacentBoundaryBehaviour = AdjacentBoundaryBehaviour.default
  ) {
    if (start < 0 || start > this.content.length) {
      throw new Error("Invalid position.");
    }

    let insertion = new Insertion(start, text, behaviour);
    try {
      for (let i = this.annotations.length - 1; i >= 0; i--) {
        let annotation = this.annotations[i];
        annotation.handleChange(insertion);
      }

      this.content =
        this.content.slice(0, start) + text + this.content.slice(start);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error("Failed to insert text", e);
    }
    this.triggerChange();
  }

  deleteText(
    start: number,
    end: number,
    behaviour: AdjacentBoundaryBehaviour = AdjacentBoundaryBehaviour.default
  ) {
    // This should really not just truncate annotations, but rather tombstone
    // the modified annotations as an atjson sub-document inside the annotation
    // that's being used to delete stuff.
    let deletion = new Deletion(start, end, behaviour);
    try {
      for (let i = this.annotations.length - 1; i >= 0; i--) {
        let annotation = this.annotations[i];
        annotation.handleChange(deletion);
      }
      this.content = this.content.slice(0, start) + this.content.slice(end);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error("Failed to delete text", e);
    }

    this.triggerChange();
  }

  /**
   * Slices return part of a document from the parent document.
   */
  slice(start: number, end: number) {
    let slicedAnnotations = this.where(a => {
      if (start < a.start) {
        return end > a.start;
      } else {
        return a.end > start;
      }
    });

    let doc = new Document({
      content: this.content,
      annotations: slicedAnnotations.map(annotation => annotation.clone()),
      schema: this.schema
    });
    doc.deleteText(end, doc.content.length);
    doc.deleteText(0, start);

    return doc;
  }

  match(
    regex: RegExp,
    start?: number,
    end?: number
  ): Array<{ start: number; end: number; matches: string[] }> {
    let content = this.content.slice(start, end);
    let offset = start || 0;
    let matches = [];

    let match;
    do {
      match = regex.exec(content);
      if (match) {
        matches.push({
          start: offset + match.index,
          end: offset + match.index + match[0].length,
          matches: match.slice()
        });
      }
    } while (regex.global && match);

    return matches;
  }

  /**
   * This is really coarse, just enough to allow different code in the editor to detect
   * changes in the document without handling that change management separately.
   *
   * Eventually it should be possible to handle this transactionally, but for
   * now we batch all changes enacted within one cycle of the event loop and
   * fire the change event only once. n.b that we don't send any information
   * about the changes here yet, but that's not to say we couldn't, but rather
   * it's not clear right now what the best approach would be so it's left
   * undefined.
   */
  private triggerChange() {
    if (this.pendingChangeEvent) return;
    this.pendingChangeEvent = setTimeout(() => {
      this.changeListeners.forEach(l => l());
      delete this.pendingChangeEvent;
    }, 0);
  }
}

class ConversionDocument<Schema extends SchemaDefinition> extends Document<
  Schema
> {
  convertTo(): never {
    throw new Error(
      `🚨 Don't nest converters! Instead, import \`getConverterFor\` and get the converter that way!\n\nimport { getConverterFor } from '@atjson/document';`
    );
  }
}
