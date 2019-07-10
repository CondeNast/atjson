// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.9.10 The th element](https://html.spec.whatwg.org/multipage/tables.html#the-th-element)
export default class TableHeading extends BlockAnnotation<GlobalAttributes & {
  colspan?: string;
  rowspan?: string;
  headers?: string;
  scope?: string;
  abbr?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'th';
}
