// ⚠️ Generated via script; modifications may be overridden
import { InlineAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

// [§ 4.7.1 The ins element](https://html.spec.whatwg.org/multipage/edits.html#the-ins-element)
export class Insert extends InlineAnnotation<
  GlobalAttributes & {
    cite?: string;
    datetime?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "ins";
}
