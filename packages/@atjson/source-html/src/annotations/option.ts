// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

// [§ 4.10.10 The option element](https://html.spec.whatwg.org/multipage/form-elements.html#the-option-element)
export class Option extends ObjectAnnotation<
  GlobalAttributes & {
    disabled?: string;
    label?: string;
    selected?: string;
    value?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "option";
}
