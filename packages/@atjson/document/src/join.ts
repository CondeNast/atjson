import Annotation from './annotation';
import { NamedCollection } from './collection';
import { JSONArray, JSONObject } from './json';

/**
 * Joins are a way to identify related annotations and be able to do
 * something to them. Using joins with collections allows for targeting
 * a portion of a document to change.
 *
 * To give a good idea of how this works, below is a block of HTML that
 * we'd like to convert into a `ResponsivePhoto` annotation. The annotation
 * looks like:
 *
 * ```
 * interface ResponsivePhoto {
 *   attributes: {
 *     caption: string;
 *     photos: string[];
 *   }
 * }
 * ```
 *
 * The HTML that we'd like to transform is:
 *
 * ```
 * <figure>
 *   <picture>
 *     <source>
 *     </source>
 *   </picture>
 *   <figcaption>
 *   </figcaption>
 * </figure>
 * ```
 *
 * First, we convert the HTML into an annotation document:
 *
 * ```
 * let doc = new HTMLSource(html);
 * ```
 *
 * Then, we query the document for the elements we care about:
 *
 * ```
 * let figures = doc.where({ type: 'figure' }).as('figure');
 * let pictures = doc.where({ type: 'picture' }).as('pictures');
 * let sources = doc.where({ type: 'source' }).as('source');
 * let captions = doc.where({ type: 'figcaption' }).as('captions');
 * ```
 *
 * After we've collected the annotations we're interested in, we can
 * compose them into objects that we can distill into the ResponsivePhoto
 * annotation:
 *
 * ```
 * let join = figures.join(pictures, (l, r) => l.start < r.start && l.end > r.end)
 *                   .join(sources, (l, r) => l.start < r.start && l.end > r.end)
 *                   .join(captions, (l, r) => l.start < r.start && l.end > r.end)
 * ```
 *
 * This join now will allow us to update the document with the new annotation:
 *
 * ```
 * join.update(({ figure, pictures, sources, captions }) => {
 *   doc.addAnnotation({
 *     type: 'responsive-photo',
 *     start: figure.start,
 *     end: figure.end,
 *     attributes: {
 *       photos: sources,
 *       caption: doc.content.slice(captions[0].start, captions[0].end)
 *     }
 *   });
 *   doc.removeAnnotations(figure, ...pictures, ...sources, ...captions);
 * });
 * ```
 */
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

  forEach(callback: (join: Record<Left, Annotation> & Record<Right, Annotation[]>) => void) {
    this._joins.forEach(callback);
  }

  get length() {
    return this._joins.length;
  }

  toJSON(): JSONArray {
    return [...this].map(join => {
      let json: JSONObject = {};
      Object.keys(join).forEach(key => {
        let annotation = (join as any)[key] as Annotation | Annotation[];
        if (Array.isArray(annotation)) {
          json[key] = annotation.map(a => a.toJSON());
        } else {
          json[key] = annotation.toJSON();
        }
        return json;
      });
      return json;
    });
  }

  outerJoin<J extends string>(rightCollection: NamedCollection<J>, filter: (lhs: Record<Left, Annotation> & Record<Right, Annotation[]>, rhs: Annotation) => boolean): never | Join<Left, Right | J> {
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

      // TypeScript doesn't allow us to safely index this, even though
      // the type system should detect this
      (join as any)[rightCollection.name] = joinAnnotations;
      results.push(join as JoinItem);
    });

    return results;
  }

  join<J extends string>(rightCollection: NamedCollection<J>, filter: (lhs: Record<Left, Annotation> & Record<Right, Annotation[]>, rhs: Annotation) => boolean): never | Join<Left, Right | J> {
    return this.outerJoin(rightCollection, filter).where(record => record[rightCollection.name].length > 0);
  }

  where(filter: ((join: Record<Left, Annotation> & Record<Right, Annotation[]>) => boolean)): Join<Left, Right> {
    return new Join<Left, Right>(this.leftJoin, this._joins.filter(filter));
  }

  push(join: Record<Left, Annotation> & Record<Right, Annotation[]>) {
    this._joins.push(join);
  }

  update(callback: (join: Record<Left, Annotation> & Record<Right, Annotation[]>) => void) {
    this._joins.forEach(callback);
  }
}
