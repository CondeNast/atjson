import { BlockAnnotation } from '@atjson/document';

export default class ListItem extends BlockAnnotation {
  static type = 'list_item';
  static vendorPrefix = 'commonmark';
}
