// ⚠️ Generated via script; modifications may be overridden
import { InlineAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

// [§ 4.5.14 The time element](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-time-element)
export class Time extends InlineAnnotation<
  GlobalAttributes & {
    datetime?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "time";
}
