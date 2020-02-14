import {
  Annotation,
  AnnotationJSON,
  Document,
  SchemaDefinition,
  SchemaClasses,
  sort
} from "./internals";

export class Converter<
  From extends SchemaDefinition,
  To extends SchemaDefinition
> {
  private converters: Array<
    (doc: ConversionDocument<From, To>) => ConversionDocument<From, To>
  > = [];

  constructor(
    readonly from: From,
    readonly to: To,
    ...converters: Array<
      (doc: ConversionDocument<From, To>) => ConversionDocument<From, To>
    >
  ) {
    this.converters = converters;
  }

  extend<NewFrom extends SchemaDefinition, NewTo extends SchemaDefinition>(
    from: NewFrom,
    to: NewTo,
    ...converters: Array<
      (
        doc: ConversionDocument<NewFrom, NewTo>
      ) => ConversionDocument<NewFrom, NewTo>
    >
  ) {
    return new Converter(
      from,
      to,
      ...((this.converters as any) as typeof converters),
      ...converters
    );
  }

  convert(document: Document<From>): Document<To> {
    let convertedDoc = new ConversionDocument({
      content: document.content,
      annotations: document.annotations
        .map(function cloneAnnotation(a) {
          return a.clone();
        })
        .sort(sort),
      from: this.from,
      to: this.to
    });

    for (let converter of this.converters) {
      convertedDoc = converter(convertedDoc);
    }

    return new Document({
      content: convertedDoc.content,
      annotations: convertedDoc.annotations.sort(sort),
      schema: this.to
    });
  }
}

export class ConversionDocument<
  From extends SchemaDefinition,
  To extends SchemaDefinition
> extends Document<{
  annotations: From["annotations"] & { [key: string]: SchemaClasses<To> };
}> {
  private from: From;

  constructor(options: {
    content: string;
    annotations: Array<AnnotationJSON | Annotation<any>>;
    from: From;
    to: To;
  }) {
    super({
      content: options.content,
      annotations: options.annotations,
      schema: {
        annotations: {
          ...(options.from.annotations as From["annotations"]),
          // We can't guarantee that names in the two schemas
          // don't overlap, so we'll allow string querying for
          // the source document since that's the most useful.
          //
          // The resultant schema is prefixed with the schema's
          // type and version to prevent conflicts while being
          // clear when debugging.
          ...Object.keys(options.to.annotations).reduce(
            (mungedSchema, name) => {
              mungedSchema[`-${name}`] = options.to.annotations[
                name
              ] as SchemaClasses<To>;
              return mungedSchema;
            },
            {} as { [key: string]: SchemaClasses<To> }
          )
        }
      }
    });
    this.from = options.from;
  }

  /**
   * overrides Document.slice to return the result in the original source
   */
  // @ts-ignore
  slice(start: number, end: number): Document<From> {
    let sliceDoc = super.slice(start, end);

    return new Document({
      content: sliceDoc.content,
      annotations: sliceDoc.annotations,
      schema: this.from
    });
  }
}
