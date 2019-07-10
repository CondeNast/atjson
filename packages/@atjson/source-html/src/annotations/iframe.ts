// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.8.5 The iframe element](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#the-iframe-element)
export default class Iframe extends ObjectAnnotation<GlobalAttributes & {
  src?: string;
  srcdoc?: string;
  name?: string;
  sandbox?: string;
  allow?: string;
  allowfullscreen?: string;
  allowpaymentrequest?: string;
  width?: string;
  height?: string;
  referrerpolicy?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'iframe';
}
