import { BlockAnnotation } from '../../../document/dist/commonjs';

export default class UnorderedList extends BlockAnnotation {
  static vendorPrefix = 'html';
  static type = 'ul';
}
