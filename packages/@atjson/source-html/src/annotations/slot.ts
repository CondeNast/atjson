// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from '@atjson/document';
import GlobalAttributes from './global-attributes';

// [§ 4.12.4 The slot element](https://html.spec.whatwg.org/multipage/scripting.html#the-slot-element)
export default class Slot extends BlockAnnotation<GlobalAttributes & {
  name?: string;
}> {
  static vendorPrefix = 'html';
  static type = 'slot';
}
