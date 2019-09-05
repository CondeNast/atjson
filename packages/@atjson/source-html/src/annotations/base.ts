// ⚠️ Generated via script; modifications may be overridden
import { ObjectAnnotation } from "@atjson/document";
import GlobalAttributes from "./global-attributes";

// [§ 4.2.3 The base element](https://html.spec.whatwg.org/multipage/semantics.html#the-base-element)
export default class Base extends ObjectAnnotation<
  GlobalAttributes & {
    href?: string;
    target?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "base";
}
