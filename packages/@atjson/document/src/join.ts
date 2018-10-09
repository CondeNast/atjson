import Annotation from './annotation';
import NamedCollection from './named-collection';

export default class Join<L extends string, R extends string> {
  private leftJoin: NamedCollection<L>;
  private _joins: Array<Record<L | R, Annotation[]>>;

  constructor(leftJoin: NamedCollection<L>, joins: Array<Record<L | R, Annotation[]>>) {
    this.leftJoin = leftJoin;
    this._joins = joins;
  }

  *[Symbol.iterator](): IterableIterator<Record<L | R, Annotation[]>> {
    for (let join of this._joins) {
      yield join;
    }
  }

  toArray() {
    return [...this];
  }

  join<J extends string>(rightCollection: NamedCollection<J>, filter: (lhs: Annotation, rhs: Annotation) => boolean): never | Join<L, R | J> {
    if (rightCollection.document !== this.leftJoin.document) {
      // n.b. there is a case that this is OK, if the right hand side's document is null,
      // then we're just joining on annotations that shouldn't have positions in
      // the document.
      throw new Error('Joining annotations from two different documents is non-sensical. Refusing to continue.');
    }

    let results = new Join<L, R | J>(this.leftJoin, []);

    this._joins.forEach((leftJoin: Record<L | R, Annotation | Annotation[]>): void => {
      let leftAnnotation = leftJoin[this.leftJoin.name] as Annotation;
      let joinAnnotations = rightCollection.annotations.filter((rightAnnotation: Annotation) => {
        return filter(leftAnnotation, rightAnnotation);
      });

      if (joinAnnotations.length > 0) {
        let join: Partial<Record<L | R | J, Annotation[]>> = leftJoin as Partial<Record<L | R | J, Annotation[]>>;
        Object.defineProperty(leftJoin, rightCollection.name, { value: joinAnnotations });
        results.push(join as Record<L | R | J, Annotation[]>);
      }
    });

    return results;
  }

  push(join: Record<L | R, Annotation[]>) {
    this._joins.push(join);
  }

  update(callback: (join: Record<L | R, Annotation[]>) => void) {
    this._joins.forEach(callback);
  }
}
