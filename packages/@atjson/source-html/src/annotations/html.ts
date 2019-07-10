// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.1.1 The html element](https://html.spec.whatwg.org/multipage/semantics.html#the-html-element)
export default class Html extends BlockAnnotation<GlobalAttributes & {
  manifest?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'html';
}
