import Annotation from "./annotation";
import Collection from "./collection";
import Document from "./document";
import Join from "./join";
import { SchemaDefinition } from "./schema";

export default class NamedCollection<
  Name extends string,
  Schema extends SchemaDefinition,
  Annotations extends Annotation<any>
> extends Collection<Schema, Annotations> {
  readonly name: Name;

  constructor(
    document: Document<Schema>,
    annotations: Annotations[],
    name: Name
  ) {
    super(document, annotations);
    this.name = name;
  }

  outerJoin<RightName extends string, RightAnnotations extends Annotation<any>>(
    rightCollection: NamedCollection<RightName, Schema, RightAnnotations>,
    filter: (lhs: Annotations, rhs: RightAnnotations) => boolean
  ) {
    let results = new Join<
      Schema,
      Name,
      Annotations,
      Record<RightName, RightAnnotations[]>
    >(this, []);

    this.forEach(leftAnnotation => {
      let joinAnnotations = rightCollection.annotations.filter(
        rightAnnotation => {
          return filter(leftAnnotation, rightAnnotation);
        }
      );

      type JoinItem = Record<Name, Annotations> &
        Record<RightName, RightAnnotations[]>;

      let join = {
        [this.name]: leftAnnotation,
        [rightCollection.name]: joinAnnotations
      };
      results.push(join as JoinItem);
    });

    return results;
  }

  join<RightName extends string, RightAnnotations extends Annotation<any>>(
    rightCollection: NamedCollection<RightName, Schema, RightAnnotations>,
    filter: (lhs: Annotations, rhs: RightAnnotations) => boolean
  ): Join<Schema, Name, Annotations, Record<RightName, RightAnnotations[]>> {
    return this.outerJoin(rightCollection, filter).where(
      record => record[rightCollection.name].length > 0
    );
  }
}
