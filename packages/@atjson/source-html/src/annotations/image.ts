import { ObjectAnnotation } from '../../../document/dist/commonjs';

export default class Image extends ObjectAnnotation {
  static vendorPrefix = 'html';
  static type = 'img';
  attributes!: {
    alt?: string;
    src: string;
    title?: string;
  };
}
