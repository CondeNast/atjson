import Annotation from './annotation';
import { NamedCollection } from './collection';

export default class Join<Left extends string, Right extends string> {
  private leftJoin: NamedCollection<Left>;
  private _joins: Array<Record<Left, Annotation> & Record<Right, Annotation[]>>;

  constructor(leftJoin: NamedCollection<Left>, joins: Array<Record<Left, Annotation> & Record<Right, Annotation[]>>) {
    this.leftJoin = leftJoin;
    this._joins = joins;
  }

  *[Symbol.iterator](): IterableIterator<Record<Left, Annotation> & Record<Right, Annotation[]>> {
    for (let join of this._joins) {
      yield join;
    }
  }

  toArray() {
    return [...this];
  }

  join<J extends string>(rightCollection: NamedCollection<J>, filter: (lhs: Record<Left, Annotation> & Record<Right, Annotation[]>, rhs: Annotation) => boolean): never | Join<Left, Right | J> {
    if (rightCollection.document !== this.leftJoin.document) {
      // n.b. there is a case that this is OK, if the right hand side's document is null,
      // then we're just joining on annotations that shouldn't have positions in
      // the document.
      throw new Error('Joining annotations from two different documents is non-sensical. Refusing to continue.');
    }

    let results = new Join<Left, Right | J>(this.leftJoin, []);

    this._joins.forEach(join => {
      let joinAnnotations = rightCollection.annotations.filter((rightAnnotation: Annotation) => {
        return filter(join, rightAnnotation);
      });

      type JoinItem = Record<Left, Annotation> & Record<Right | J, Annotation[]>;

      if (joinAnnotations.length > 0) {
        // TypeScript doesn't allow us to safely index this, even though
        // the type system should detect this
        (join as any)[rightCollection.name] = joinAnnotations;
        results.push(join as JoinItem);
      }
    });

    return results;
  }

  push(join: Record<Left, Annotation> & Record<Right, Annotation[]>) {
    this._joins.push(join);
  }

  update(callback: (join: Record<Left, Annotation> & Record<Right, Annotation[]>) => void) {
    this._joins.forEach(callback);
  }
}
