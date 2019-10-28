// ⚠️ Generated via script; modifications may be overridden
import { InlineAnnotation } from "@atjson/document";
import { GlobalAttributes } from "../global-attributes";

// [§ 4.5.9 The abbr element](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-abbr-element)
export class Abbreviation extends InlineAnnotation<
  GlobalAttributes & {
    title?: string;
  }
> {
  static vendorPrefix = "html";
  static type = "abbr";
}
