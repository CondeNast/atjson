import Annotation from '../annotation';

export default abstract class InlineAnnotation extends Annotation {
  get rank() {
    return 100;
  }
}
