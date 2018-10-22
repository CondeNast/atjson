import { BlockAnnotation } from '@atjson/document';

export default class ListItem extends BlockAnnotation {
  static vendorPrefix = 'gdocs';
  static type = 'list_item';
  attributes!: {
    ls_id: string;
    ls_nest: number;
  };
}
