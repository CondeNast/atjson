
import { BlockAnnotation } from '@atjson/document';

export default class List extends BlockAnnotation {
  static vendorPrefix = 'offset';
  static type = 'list';
  attributes!: {
    type: string;
    tight?: boolean;
    level?: number;
    startsAt?: number;
  };
}
