
import { BlockAnnotation } from '@atjson/document';

export default class List extends BlockAnnotation {
  static vendorPrefix = 'offset';
  static type = 'List';
  attributes!: {
    type: string;
    delimiter?: string;
    tight?: boolean;
    level?: number;
    startsAt?: number;
  };
}
