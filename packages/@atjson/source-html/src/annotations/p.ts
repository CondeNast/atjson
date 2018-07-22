import { BlockAnnotation } from '@atjson/document';

export default class Paragraph extends BlockAnnotation {
  static vendorPrefix = 'html';
  static type = 'p';

  get rank() {
    return super.rank * 3 / 2;
  }
}
