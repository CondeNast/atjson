import { BlockAnnotation } from '@atjson/document';

export default class ListItem extends BlockAnnotation {
  static vendorPrefix = 'html';
  static type = 'li';
}
