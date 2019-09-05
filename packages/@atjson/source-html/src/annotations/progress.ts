// ⚠️ Generated via script; modifications may be overridden
import { InlineAnnotation } from "@atjson/document";
import GlobalAttributes from "./global-attributes";

// [§ 4.10.13 The progress element](https://html.spec.whatwg.org/multipage/form-elements.html#the-progress-element)
export default class Progress extends InlineAnnotation<
  GlobalAttributes & {
    value?: string;
    max?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "progress";
}
