import Annotation from "../annotation";

export abstract class BlockAnnotation<Attributes = {}> extends Annotation<
  Attributes
> {
  get rank() {
    return 10;
  }
}
