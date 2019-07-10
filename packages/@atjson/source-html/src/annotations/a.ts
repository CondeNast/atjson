// ⚠️ Generated via script; modifications may be overridden
import { InlineAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.5.1 The a element](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element)
export default class Anchor extends InlineAnnotation<GlobalAttributes & {
  href?: string;
  target?: string;
  download?: string;
  rel?: string;
  hreflang?: string;
  type?: string;
  referrerpolicy?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'a';
}
