import { BlockAnnotation } from '../../../document/dist/commonjs';

export default class OrderedList extends BlockAnnotation {
  static vendorPrefix = 'html';
  static type = 'ol';
  attributes!: {
    starts: string;
  };
}
