import { InlineAnnotation } from '@atjson/document';

export default class Link extends InlineAnnotation {
  static vendorPrefix = 'gdocs';
  static type = 'lnks_link';
  attributes!: {
    ulnk_url: string;
    lnk_type: number;
  };
}
