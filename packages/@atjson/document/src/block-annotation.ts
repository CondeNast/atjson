import Annotation from './annotation';

export default abstract class BlockAnnotation extends Annotation {
  get rank() {
    return 10;
  }
}
