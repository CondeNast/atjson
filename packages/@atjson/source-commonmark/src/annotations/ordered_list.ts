import { BlockAnnotation } from '@atjson/document';

export default class OrderedList extends BlockAnnotation {
  static type = 'ordered_list';
  static vendorPrefix = 'commonmark';
  attributes!: {
    start: number;
    tight: boolean;
  };
}
