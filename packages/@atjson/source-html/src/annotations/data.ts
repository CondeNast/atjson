// ⚠️ Generated via script; modifications may be overridden
import { InlineAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.5.13 The data element](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-data-element)
export default class Data extends InlineAnnotation<GlobalAttributes & {
  value?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'data';
}
