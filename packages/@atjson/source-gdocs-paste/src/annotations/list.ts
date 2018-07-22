import { BlockAnnotation } from '@atjson/document';

export default class List extends BlockAnnotation {
  static vendorPrefix = 'gdocs';
  static type = 'list';
  attributes!: {
    ls_id: string;
  };
}
