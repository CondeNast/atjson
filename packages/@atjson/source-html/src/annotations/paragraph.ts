import { BlockAnnotation } from '../../../document/dist/commonjs';

export default class Paragraph extends BlockAnnotation {
  static vendorPrefix = 'html';
  static type = 'p';

  get rank() {
    return super.rank * 3 / 2;
  }
}
