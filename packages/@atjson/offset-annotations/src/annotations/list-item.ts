import { BlockAnnotation } from '@atjson/document';

export default class ListItem extends BlockAnnotation {
  static vendorPrefix = 'offset';
  static type = 'ListItem';
}
