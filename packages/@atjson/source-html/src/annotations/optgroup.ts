// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.10.9 The optgroup element](https://html.spec.whatwg.org/multipage/form-elements.html#the-optgroup-element)
export default class OptionGroup extends BlockAnnotation<GlobalAttributes & {
  disabled?: string;
  label?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'optgroup';
}
