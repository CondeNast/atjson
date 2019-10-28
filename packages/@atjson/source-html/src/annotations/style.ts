// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

// [§ 4.2.6 The style element](https://html.spec.whatwg.org/multipage/semantics.html#the-style-element)
export class Style extends BlockAnnotation<
  GlobalAttributes & {
    media?: string;
    title?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "style";
}
