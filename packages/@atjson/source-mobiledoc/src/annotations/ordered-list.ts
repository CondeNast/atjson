import { BlockAnnotation } from '@atjson/document';

export default class OrderedList extends BlockAnnotation {
  static vendorPrefix = 'mobiledoc';
  static type = 'ol';
  attributes!: {
    starts: string;
  };
}
