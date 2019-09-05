// ⚠️ Generated via script; modifications may be overridden
import { InlineAnnotation } from "@atjson/document";
import GlobalAttributes from "./global-attributes";

// [§ 4.10.12 The output element](https://html.spec.whatwg.org/multipage/form-elements.html#the-output-element)
export default class Output extends InlineAnnotation<
  GlobalAttributes & {
    for?: string;
    form?: string;
    name?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "output";
}
