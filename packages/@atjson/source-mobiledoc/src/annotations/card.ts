import { BlockAnnotation } from '@atjson/document';

export default class Card extends BlockAnnotation {
  static vendorPrefix = 'mobiledoc';
  static type = 'card';
}
