import Annotation from "../annotation";

export abstract class InlineAnnotation<Attributes = {}> extends Annotation<
  Attributes
> {
  get rank() {
    return 100;
  }
}
