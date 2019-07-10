// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.8.8 The param element](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#the-param-element)
export default class Param extends ObjectAnnotation<GlobalAttributes & {
  name?: string;
  value?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'param';
}
