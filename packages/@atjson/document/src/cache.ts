import { Annotation, is, UnknownAnnotation } from "./internals";

export function addToCache(
  cache: { [key: string]: Array<Annotation<any>> },
  annotation: Annotation<any>
) {
  let key = is(annotation, UnknownAnnotation)
    ? annotation.attributes.type
    : `-${annotation.vendorPrefix}-${annotation.type}`;
  if (cache[key] == null) {
    cache[key] = [];
  }
  cache[key].push(annotation);
}

export function removeFromCache(
  cache: { [key: string]: Array<Annotation<any>> },
  annotation: Annotation<any>
) {
  let key = is(annotation, UnknownAnnotation)
    ? annotation.attributes.type
    : `-${annotation.vendorPrefix}-${annotation.type}`;
  if (cache[key] == null) {
    return;
  }
  let index = cache[key].indexOf(annotation);
  cache[key].splice(index, 1);
}
