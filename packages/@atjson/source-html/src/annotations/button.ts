// ⚠️ Generated via script; modifications may be overridden
import { InlineAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

// [§ 4.10.6 The button element](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element)
export class Button extends InlineAnnotation<
  GlobalAttributes & {
    disabled?: string;
    form?: string;
    formaction?: string;
    formenctype?: string;
    formmethod?: string;
    formnovalidate?: string;
    formtarget?: string;
    name?: string;
    type?: string;
    value?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "button";
}
