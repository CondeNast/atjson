import Annotation from './annotation';

export default abstract class ObjectAnnotation extends Annotation {
  rank() {
    return 1000;
  }
}
