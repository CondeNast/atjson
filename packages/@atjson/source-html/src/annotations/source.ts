// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.8.2 The source element](https://html.spec.whatwg.org/multipage/embedded-content.html#the-source-element)
export default class Source extends ObjectAnnotation<GlobalAttributes & {
  src?: string;
  type?: string;
  srcset?: string;
  sizes?: string;
  media?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'source';
}
