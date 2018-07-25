import { BlockAnnotation } from '../../../document/dist/commonjs';

export default class ListItem extends BlockAnnotation {
  static vendorPrefix = 'html';
  static type = 'li';
}
