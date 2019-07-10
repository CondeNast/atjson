// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.10.7 The select element](https://html.spec.whatwg.org/multipage/form-elements.html#the-select-element)
export default class Select extends BlockAnnotation<GlobalAttributes & {
  autocomplete?: string;
  autofocus?: string;
  disabled?: string;
  form?: string;
  multiple?: string;
  name?: string;
  required?: string;
  size?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'select';
}
