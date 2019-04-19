import Annotation from '../annotation';

export default class ParseAnnotation<Attributes extends {
  reason: string;
} = { reason: string }> extends Annotation<Attributes> {
  static vendorPrefix = 'atjson';
  static type = 'parse-token';

  get rank() {
    return Number.MAX_SAFE_INTEGER - 1;
  }
}
