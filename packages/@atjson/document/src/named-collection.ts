import {
  Collection,
  Annotation,
  Document,
  Join,
  SchemaDefinition
} from "./internals";

export class NamedCollection<
  Schema extends SchemaDefinition,
  LeftName extends string,
  LeftType extends Annotation<any>
> extends Collection<Schema, LeftType> {
  readonly name: LeftName;

  constructor(
    document: Document<Schema>,
    annotations: LeftType[],
    name: LeftName
  ) {
    super(document, annotations);
    this.name = name;
  }

  outerJoin<RightName extends string, RightType extends Annotation<any>>(
    rightCollection: NamedCollection<Schema, RightName, RightType>,
    filter: (lhs: LeftType, rhs: RightType) => boolean
  ): never | Join<Schema, LeftName, LeftType, Record<RightName, RightType[]>> {
    if (rightCollection.document !== this.document) {
      // n.b. there is a case that this is OK, if the RHS's document is null,
      // then we're just joining on annotations that shouldn't have positions in
      // the document.
      throw new Error(
        "Joining annotations from two different documents is non-sensical. Refusing to continue."
      );
    }

    let results = new Join<
      Schema,
      LeftName,
      LeftType,
      Record<RightName, RightType[]>
    >(this, []);

    for (let leftAnnotation of this.annotations) {
      let joinAnnotations = rightCollection.annotations.filter(
        function testJoinCandidates(rightAnnotation) {
          return filter(leftAnnotation, rightAnnotation);
        }
      );

      type JoinItem = Record<LeftName, LeftType> &
        Record<RightName, RightType[]>;

      let join = {
        [this.name]: leftAnnotation,
        [rightCollection.name]: joinAnnotations
      };
      results.push(join as JoinItem);
    }

    return results;
  }

  join<RightName extends string, RightType extends Annotation<any>>(
    rightCollection: NamedCollection<Schema, RightName, RightType>,
    filter: (lhs: LeftType, rhs: RightType) => boolean
  ): never | Join<Schema, LeftName, LeftType, Record<RightName, RightType[]>> {
    return this.outerJoin(rightCollection, filter).where(
      function testRightCollectionLength(record) {
        return record[rightCollection.name].length > 0;
      }
    );
  }
}
