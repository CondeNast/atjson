// ⚠️ Generated via script; modifications may be overridden
import { InlineAnnotation } from "@atjson/document";
import GlobalAttributes from "./global-attributes";

// [§ 4.10.4 The label element](https://html.spec.whatwg.org/multipage/forms.html#the-label-element)
export default class Label extends InlineAnnotation<
  GlobalAttributes & {
    for?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "label";
}
