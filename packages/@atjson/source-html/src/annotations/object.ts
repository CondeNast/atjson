// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.8.7 The object element](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#the-object-element)
export default class HTMLObject extends BlockAnnotation<GlobalAttributes & {
  data?: string;
  type?: string;
  name?: string;
  usemap?: string;
  form?: string;
  width?: string;
  height?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'object';
}
