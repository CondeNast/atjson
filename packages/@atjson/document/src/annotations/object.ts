import { Annotation } from "../internals";

export abstract class ObjectAnnotation<Attributes = {}> extends Annotation<
  Attributes
> {
  get rank() {
    return 1000;
  }
}
