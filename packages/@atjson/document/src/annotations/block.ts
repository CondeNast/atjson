import Annotation from "../annotation";

export default abstract class BlockAnnotation<
  Attributes = {}
> extends Annotation<Attributes> {
  get rank() {
    return 10;
  }
}
