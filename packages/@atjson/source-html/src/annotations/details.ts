// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.11.1 The details element](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element)
export default class Details extends BlockAnnotation<GlobalAttributes & {
  open?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'details';
}
