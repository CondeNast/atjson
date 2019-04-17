import Annotation from '../annotation';

export default abstract class ObjectAnnotation<Attributes = {}> extends Annotation<Attributes> {
  get rank() {
    return 1000;
  }
}
