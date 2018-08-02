import { BlockAnnotation } from '@atjson/document';

export default class Heading extends BlockAnnotation {
  static vendorPrefix = 'gdocs';
  static type = 'ps_hd';
  attributes!: {
    level: 1 | 2 | 3 | 4 | 5 | 6 | 100 | 101;
  };
}
