// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.2.5 The meta element](https://html.spec.whatwg.org/multipage/semantics.html#the-meta-element)
export default class Meta extends ObjectAnnotation<GlobalAttributes & {
  name?: string;
  'http-equiv'?: string;
  content?: string;
  charset?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'meta';
}
