import { Annotation } from '@atjson/document';

export default class RootAnnotation extends Annotation {
  static vendorPrefix = 'atjson';
  static type = 'Root';

  get rank() {
    return 0;
  }
}
