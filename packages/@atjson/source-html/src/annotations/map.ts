// ⚠️ Generated via script; modifications may be overridden
import { InlineAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.8.13 The map element](https://html.spec.whatwg.org/multipage/image-maps.html#the-map-element)
export default class HTMLMap extends InlineAnnotation<GlobalAttributes & {
  name?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'map';
}
