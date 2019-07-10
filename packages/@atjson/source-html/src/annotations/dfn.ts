// ⚠️ Generated via script; modifications may be overridden
import { InlineAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.5.8 The dfn element](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-dfn-element)
export default class Definition extends InlineAnnotation<GlobalAttributes & {
  title?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'dfn';
}
