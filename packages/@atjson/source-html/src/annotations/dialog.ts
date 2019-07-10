// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.11.4 The dialog element](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element)
export default class Dialog extends BlockAnnotation<GlobalAttributes & {
  open?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'dialog';
}
