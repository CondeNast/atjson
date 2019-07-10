// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.7.1 The ins element](https://html.spec.whatwg.org/multipage/edits.html#the-ins-element)
export default class Insert extends BlockAnnotation<GlobalAttributes & {
  cite?: string;
  datetime?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'ins';
}
