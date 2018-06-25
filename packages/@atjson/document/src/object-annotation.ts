import Annotation from './annotation';

export default abstract class ObjectAnnotation extends Annotation {
  get rank() {
    return 1000;
  }
}
