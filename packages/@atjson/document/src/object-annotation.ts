import Annotation from './annotation';

export default abstract class BlockAnnotation extends Annotation {
  rank() {
    return 1000;
  }
}
