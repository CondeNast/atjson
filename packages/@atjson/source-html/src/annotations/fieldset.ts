// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.10.15 The fieldset element](https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element)
export default class Fieldset extends BlockAnnotation<GlobalAttributes & {
  disabled?: string;
  form?: string;
  name?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'fieldset';
}
