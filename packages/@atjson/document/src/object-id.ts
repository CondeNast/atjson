import { Annotation } from "./internals";
import uuid from "uuid-random";

export function Ref<T>(id: string | number | Annotation<T>) {
  if (id instanceof Annotation) {
    return `@${id.id}`;
  }
  return `@${id}`;
}

export function ObjectId<T>(id?: string | number | Annotation<T>) {
  if (id instanceof Annotation) {
    return id.id;
  } else if (id) {
    return `${id}`;
  }
  return uuid();
}
