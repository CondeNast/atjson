import Annotation from './annotation';

export default abstract class InlineAnnotation extends Annotation {
  rank() {
    return 100;
  }
}
