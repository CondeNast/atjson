// ⚠️ Generated via script; modifications may be overridden
import { InlineAnnotation } from "@atjson/document";
import GlobalAttributes from "./global-attributes";

// [§ 4.5.7 The q element](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-q-element)
export default class Quote extends InlineAnnotation<
  GlobalAttributes & {
    cite?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "q";
}
