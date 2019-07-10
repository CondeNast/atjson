// ⚠️ Generated via script; modifications may be overridden
import { InlineAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.10.14 The meter element](https://html.spec.whatwg.org/multipage/form-elements.html#the-meter-element)
export default class Meter extends InlineAnnotation<GlobalAttributes & {
  value?: string;
  min?: string;
  max?: string;
  low?: string;
  high?: string;
  optimum?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'meter';
}
