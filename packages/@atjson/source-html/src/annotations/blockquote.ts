// ⚠️ Generated via script; modifications may be overridden
import { BlockAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

// [§ 4.4.4 The blockquote element](https://html.spec.whatwg.org/multipage/grouping-content.html#the-blockquote-element)
export class Blockquote extends BlockAnnotation<
  GlobalAttributes & {
    cite?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "blockquote";
}
