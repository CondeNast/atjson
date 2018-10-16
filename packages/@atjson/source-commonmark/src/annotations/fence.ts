import { BlockAnnotation } from '@atjson/document';

export default class Fence extends BlockAnnotation {
  static type = 'fence';
  static vendorPrefix = 'commonmark';
  attributes!: {
    info: string;
  };
}
