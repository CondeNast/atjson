import { InlineAnnotation } from '../../../document/dist/commonjs';

export default class Anchor extends InlineAnnotation {
  static vendorPrefix = 'html';
  static type = 'a';
  attributes!: {
    href: string;
    target: string;
    rel: string;
  };
}
