// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.7.2 The del element](https://html.spec.whatwg.org/multipage/edits.html#the-del-element)
export default class Delete extends BlockAnnotation<GlobalAttributes & {
  cite?: string;
  datetime?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'del';
}
