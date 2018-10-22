
import { BlockAnnotation } from '@atjson/document';

export default class List extends BlockAnnotation {
  static vendorPrefix = 'offset';
  static type = 'list';
  attributes!: {
    type: string;
    delimiter?: string;
    tight?: boolean;
    level?: number;
    startsAt?: number;
  };
}
