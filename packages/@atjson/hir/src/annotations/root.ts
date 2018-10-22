import { Annotation } from '@atjson/document';

export default class RootAnnotation extends Annotation {
  static vendorPrefix = 'atjson';
  static type = 'root';

  get rank() {
    return 0;
  }
}
