import { BlockAnnotation } from '@atjson/document';

export default class OrderedList extends BlockAnnotation {
  static vendorPrefix = 'html';
  static type = 'ol';
  attributes!: {
    starts: string;
  };
}
