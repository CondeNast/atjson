import Annotation from '../annotation';

export default class ParseAnnotation extends Annotation {
  static vendorPrefix = 'atjson';
  static type = 'ParseToken';

  get rank() {
    return Number.MAX_SAFE_INTEGER - 1;
  }
}
